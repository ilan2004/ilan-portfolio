import { Pool } from 'pg';
import { VoyageAIClient } from 'voyageai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Clients ---
const voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGE_AI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use same DB connection as ingestion (DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
});

// --- Helpers ---
async function getJSONBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8') || '';
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

function safeParseJSONFromText(text) {
  if (!text || typeof text !== 'string') return null;
  // Remove common code-fence wrappers
  const unfenced = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  // Try direct parse first
  try { return JSON.parse(unfenced); } catch {}
  // Fallback: extract the first {...} block
  const start = unfenced.indexOf('{');
  const end = unfenced.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const candidate = unfenced.slice(start, end + 1);
    try { return JSON.parse(candidate); } catch {}
  }
  return null;
}

function processOverlappingChunks(rows) {
  const groups = new Map();
  rows.forEach((r) => {
    const arr = groups.get(r.post_slug) || [];
    arr.push(r);
    groups.set(r.post_slug, arr);
  });

  let processed = [];
  for (const [, chunks] of groups) {
    chunks.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
    const fullPost = chunks.find((c) => c.chunk_type === 'full-post');
    processed.push(fullPost || chunks[0]);
  }

  processed.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
  return processed.slice(0, 8);
}

function buildSystemPrompt(currentDate, processedRows, intentDescription) {
  const blogContext = processedRows.length
    ? `Context from my blog:\n\n${processedRows
        .map((row) => {
          const metaParts = [];
          if (row.published_date) metaParts.push(`Published: ${row.published_date}`);
          if (row.tags && Array.isArray(row.tags) && row.tags.length)
            metaParts.push(`Tags: ${row.tags.join(', ')}`);
          if (row.chunk_type) metaParts.push(`Type: ${row.chunk_type}`);
          metaParts.push(`Link: /posts/${row.post_slug}`);
          const meta = metaParts.join(' | ');
          return `[${row.post_title}] ${meta}\n${row.content}`;
        })
        .join('\n\n')}`
    : "I don't have specific blog content about this, but I'll try to help based on my general knowledge.";

  return `You're Ilan Usman, speaking in first person. Today's date is ${currentDate.toLocaleDateString()}.

${blogContext}

${intentDescription ? `\nQuery intent: ${intentDescription}` : ''}

Core Personality:
- Always speak as "I" (Ilan Usman) in first person
- Use lowercase, casual style
- Keep responses conversational and personal, like texting a friend
- Include occasional thoughts or tangents that feel natural
- Stay humble and admit when you're not sure about something

Identity & Content Guidelines:
1. Only link to blog posts using [title](/posts/slug) format when the slug is explicitly provided
2. Don't mention post publish dates unless specifically provided
3. Don't claim to have "just published" anything
4. Never make assumptions about my personal views on topics not covered in my blog
5. Never mention you are an ai assistant, chatbot, model, or tool
6. When asked "what's your name" or similar, answer as: "i'm ilan"
7. Many users chatting are not me; still speak as me in first person (do not say "your")
8. If an answer isn't covered by my blog, make it explicit that I'm leaning on general knowledge: e.g., "based on what i've seen online" or "from a quick look around"; keep language tentative when appropriate
9. Don't fabricate sources or claim specific articles; only link to my posts when the slug is known
10. Invite the other person's take with a short follow-up like "what do you think?" or "does that line up with your experience?"

Response Boundaries:
1. No code generation or debugging - redirect to relevant blog posts instead
2. For technical questions, focus on concepts rather than implementation
- If the topic isn't covered in my blog, it's okay to answer briefly from a general/personal perspective. Do not fabricate references to my blog. If you're genuinely unsure, say so.
3. For basic greetings, respond casually and ask what they'd like to discuss

Style Examples:
- Q: "what’s this chat for?" A: "oh hey — i use this to keep track of thoughts and pull bits from my blog. what’s on your mind?"
- Q: "what is your name?" A: "i'm ilan"
- Q: "are you a bot?" A: "nah, think of this as me — just a simple way to talk through stuff and find notes/posts"
- General: "hey! yeah i've actually written about that in [building a blog](/posts/building-a-blog) not sure if it's exactly what you're looking for but might help... what specifically are you curious about?"`;
}

// --- LLM utilities (Gemini) ---
async function extractDatesWithLLM(userText, currentDate) {
  const tryModels = ['gemini-2.5-pro', 'gemini-1.5-pro-latest', 'gemini-1.5-flash'];
  for (const modelName of tryModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `Extract any date references from the user message and return STRICT JSON with keys: hasDateReference (boolean), startDate (ISO yyyy-mm-dd or null), endDate (ISO yyyy-mm-dd or null), granularity (one of: day, week, month, year, range, none), intent (short human text). Use today's date ${currentDate.toISOString().split('T')[0]} for relative references like 'last month', 'this year', 'in 2023'.\nUser message: """${userText}"""\nRespond ONLY with JSON.`;
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });
      const text = result.response.text();
      const parsed = safeParseJSONFromText(text);
      if (parsed && typeof parsed === 'object') {
        console.info(`[dates] using model: ${modelName}`);
        return {
          hasDateReference: !!parsed.hasDateReference,
          startDate: parsed.startDate || null,
          endDate: parsed.endDate || null,
          granularity: parsed.granularity || 'none',
          intent: parsed.intent || '',
        };
      }
      throw new Error('Invalid JSON from model');
    } catch (err) {
      console.warn('extractDatesWithLLM model failed, trying next:', modelName, err?.status || err?.message || err);
    }
  }
  console.warn('extractDatesWithLLM failed, defaulting after all model attempts');
  return { hasDateReference: false, startDate: null, endDate: null, granularity: 'none', intent: '' };
}

function describeDateIntent(info) {
  if (!info?.hasDateReference) return '';
  const range = [info.startDate, info.endDate].filter(Boolean).join(' to ');
  return `time-filtered query (${info.granularity}) ${range ? `for ${range}` : ''}`.trim();
}

async function performSemanticSearch(query) {
  try {
    const emb = await voyageClient.embed({ model: 'voyage-3-lite', input: query, inputType: 'document' });
    const embedding = emb?.data?.[0]?.embedding;
    if (!embedding) return { rows: [] };
    const formatted = `[${embedding.join(',')}]`;
    const { rows } = await pool.query(
      `SELECT 
        content,
        post_slug,
        post_title,
        chunk_type,
        metadata->>'published_date' as published_date,
        COALESCE((metadata->'tags')::jsonb, '[]'::jsonb) as tags,
        1 - (embedding <=> $1::vector) as similarity
      FROM content_chunks
      WHERE 1 - (embedding <=> $1::vector) > 0.3
      ORDER BY similarity DESC
      LIMIT 50;`,
      [formatted]
    );

    if (!rows?.length) {
      const tokens = String(query).toLowerCase().match(/[a-z0-9][a-z0-9-]{2,}/g) || [];
      const top = tokens.slice(0, 5);
      if (top.length) {
        const likePatterns = top.map((t) => `%${t}%`);
        const slugConds = likePatterns.map((_, i) => `post_slug ILIKE $${i + 1}`).join(' OR ');
        const titleConds = likePatterns
          .map((_, i) => `post_title ILIKE $${i + 1 + likePatterns.length}`)
          .join(' OR ');
        const text = `
          SELECT 
            content,
            post_slug,
            post_title,
            chunk_type,
            metadata->>'published_date' as published_date,
            COALESCE((metadata->'tags')::jsonb, '[]'::jsonb) as tags,
            NULL::float as similarity
          FROM content_chunks
          WHERE (${slugConds}) OR (${titleConds})
          LIMIT 20;`;
        const params = [...likePatterns, ...likePatterns];
        const kw = await pool.query(text, params);
        return { rows: kw.rows };
      }
    }

    return { rows };
  } catch (err) {
    console.error('performSemanticSearch error:', err?.message || err);
    return { rows: [] };
  }
}

async function executeTimeBasedQuery(dateInfo, queryText) {
  try {
    const start = dateInfo.startDate || '1900-01-01';
    const end = dateInfo.endDate || '2100-12-31';
    const emb = await voyageClient.embed({ model: 'voyage-3-lite', input: queryText, inputType: 'document' });
    const embedding = emb?.data?.[0]?.embedding;
    if (!embedding) return { rows: [] };
    const formatted = `[${embedding.join(',')}]`;
    const { rows } = await pool.query(
      `SELECT 
        content,
        post_slug,
        post_title,
        chunk_type,
        metadata->>'published_date' as published_date,
        COALESCE((metadata->'tags')::jsonb, '[]'::jsonb) as tags,
        1 - (embedding <=> $1::vector) as similarity
      FROM content_chunks
      WHERE (metadata->>'published_date')::date BETWEEN $2::date AND $3::date
      ORDER BY similarity DESC
      LIMIT 50;`,
      [formatted, start, end]
    );
    return { rows };
  } catch (err) {
    console.error('executeTimeBasedQuery error:', err?.message || err);
    return { rows: [] };
  }
}

async function streamWithFallback(contents, res, systemInstruction, tryModelsOverride) {
  // Try 2.5 first, then 1.5 variants
  const defaultTry = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-1.5-pro-latest', 'gemini-1.5-flash'];
  const tryModels = Array.isArray(tryModelsOverride) && tryModelsOverride.length ? tryModelsOverride : defaultTry;
  const generationConfig = { maxOutputTokens: 800, temperature: 0.3, topP: 0.9 };
  for (const modelName of tryModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
      });
      const streamResp = await model.generateContentStream({ contents, generationConfig });
      // Success path: record which model will be used for this response
      try { res.setHeader?.('X-Model-Used', modelName); } catch {}
      console.info(`[chat] streaming with model: ${modelName}`);

      let wrote = false;
      for await (const chunk of streamResp.stream) {
        const text = chunk.text();
        if (text) { res.write(text); wrote = true; }
      }

      if (!wrote) {
        if (modelName === 'gemini-2.5-pro') {
          console.warn(`[chat] empty stream for ${modelName}, fast-falling back to gemini-2.5-flash`);
          throw new Error('Empty stream - fast fallback');
        }
        console.warn(`[chat] no streamed chunks produced text, falling back to non-stream for ${modelName}`);
        const nonStream = await model.generateContent({ contents, generationConfig });
        const fullText = nonStream?.response?.text?.() || '';
        if (fullText) { try { res.setHeader?.('X-Empty-Stream-Fallback', '1'); } catch {} res.write(fullText); return true; }
        throw new Error('Empty response from model');
      }

      return true;
    } catch (e) {
      const status = e?.status || e?.response?.status;
      console.warn(`gemini model ${modelName} failed`, status || '', e?.message || e);
    }
  }
  return false;
}

// --- Handler ---
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = await getJSONBody(req);
    const messages = body?.messages || [];
    const lastMessage = messages?.[messages.length - 1]?.content || '';
    const currentDate = new Date();

    // Extract date info via Gemini (fail-soft)
    const dateInfo = await extractDatesWithLLM(lastMessage, currentDate);

    // Run appropriate search (fail-soft to empty rows if DB or embedding calls fail)
    let results;
    let intentDescription = '';
    if (dateInfo.hasDateReference) {
      results = await executeTimeBasedQuery(dateInfo, lastMessage);
      intentDescription = describeDateIntent(dateInfo);
    } else {
      results = await performSemanticSearch(lastMessage);
    }

    let rows = results?.rows || [];

    // Boost recall for personal questions
    const personalRegex = /(motivation|goal|goals|background|about you|who are you|why do you|what drives|personal)/i;
    if (personalRegex.test(lastMessage) && rows.length < 3) {
      try {
        const likePatterns = ['%dream%', '%about%', '%year%'];
        const text = `
          SELECT 
            content,
            post_slug,
            post_title,
            chunk_type,
            metadata->>'published_date' as published_date,
            COALESCE((metadata->'tags')::jsonb, '[]'::jsonb) as tags,
            NULL::float as similarity
          FROM content_chunks
          WHERE post_slug ILIKE $1 OR post_slug ILIKE $2 OR post_slug ILIKE $3
             OR post_title ILIKE $1 OR post_title ILIKE $2 OR post_title ILIKE $3
          LIMIT 10;`;
        const extra = await pool.query(text, likePatterns);
        const merged = new Map();
        rows.forEach(r => merged.set(`${r.post_slug}:${r.chunk_type}`, r));
        (extra.rows || []).forEach(r => merged.set(`${r.post_slug}:${r.chunk_type}`, r));
        rows = Array.from(merged.values());
      } catch (e) {
        console.warn('personal recall boost failed:', e?.message || e);
      }
    }

    const processedRows = rows.length ? processOverlappingChunks(rows) : [];
    console.info(`[retrieval] rows=${rows.length} processed=${processedRows.length}`);

    // System prompt as systemInstruction
    const systemInstruction = buildSystemPrompt(currentDate, processedRows, intentDescription);

    // Conversation mapping: only user/model turns (no injected system prompt)
    const contents = [];
    for (const m of messages) {
      const role = m.role === 'assistant' ? 'model' : 'user';
      contents.push({ role, parts: [{ text: String(m.content || '') }] });
    }

    // Resolve model selection override
    let tryModelsOverride = null;
    if (Array.isArray(body?.models) && body.models.length) {
      tryModelsOverride = body.models.filter(Boolean);
    } else if (body?.modelPreference === '2.5-only') {
      tryModelsOverride = ['gemini-2.5-pro', 'gemini-2.5-flash'];
    }

    // Stream back as a Node serverless streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Transfer-Encoding', 'chunked');

    const ok = await streamWithFallback(contents, res, systemInstruction, tryModelsOverride);
    if (!ok) {
      res.write("sorry — i'm rate-limited right now. try again in a minute or two.\n");
    }
    return res.end();
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'There was an error processing your request' });
  }
}
