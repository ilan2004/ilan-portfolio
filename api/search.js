import { sql } from '@vercel/postgres';
import { VoyageAIClient } from 'voyageai';

// Init clients
const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_AI_API_KEY });

// Safe JSON body parser for Vercel Serverless Functions
async function getJSONBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8') || '';
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Prepare query for PostgreSQL tsquery, preserving AND/OR with prefix matching
function prepareSearchQuery(input, operator = '&') {
  try {
    const sanitized = String(input || '').replace(/['&|!():*]/g, ' ').trim();
    if (!sanitized) return '';
    const terms = sanitized.split(/\s+/).filter(Boolean);
    if (terms.length <= 1) return terms[0] || '';
    return terms.map((t) => `${t}:*`).join(` ${operator} `);
  } catch {
    return String(input || '').trim().replace(/['&|!():*]/g, '');
  }
}

export default async function handler(req, res) {
  // Optional CORS for local dev or cross-origin calls
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await getJSONBody(req);
    const { query, searchType = 'hybrid' } = body || {};
    if (!query) return res.status(400).json({ error: 'Query parameter is required' });

    // Keyword-only search
    if (searchType === 'keyword') {
      const processedQuery = prepareSearchQuery(query, '&');
      const results = await sql`
        WITH RankedResults AS (
          SELECT 
            content,
            post_slug,
            post_title,
            chunk_type,
            metadata,
            CASE 
              WHEN to_tsvector('english', post_title) @@ to_tsquery('english', ${processedQuery}) THEN
                2.0 * ts_rank_cd(to_tsvector('english', post_title), to_tsquery('english', ${processedQuery}))
              ELSE
                ts_rank_cd(to_tsvector('english', content || ' ' || post_title), to_tsquery('english', ${processedQuery}))
            END as text_rank,
            (to_tsvector('english', post_title) @@ to_tsquery('english', ${processedQuery})) as is_title_match
          FROM content_chunks
          WHERE 
            to_tsvector('english', content || ' ' || post_title) @@ to_tsquery('english', ${processedQuery})
            OR to_tsvector('english', post_title) @@ to_tsquery('english', ${processedQuery})
        )
        SELECT 
          content,
          post_slug,
          post_title,
          chunk_type,
          metadata,
          text_rank as keyword_score,
          is_title_match
        FROM RankedResults
        ORDER BY is_title_match DESC, keyword_score DESC
        LIMIT 25;
      `;
      if (!results.rows.length) {
        return res.json({ results: [], message: 'No exact matches found for your query' });
      }
      return res.json({
        results: results.rows.map((row) => ({ ...row, similarity: row.keyword_score })),
      });
    }

    // Semantic or hybrid: generate embedding
    const queryEmbedding = await client.embed({
      model: 'voyage-3-lite',
      input: query,
      inputType: 'document',
    });

    const embedding = queryEmbedding?.data?.[0]?.embedding;
    if (!embedding) {
      return res.status(500).json({ error: 'Failed to generate embedding for query' });
    }
    const formattedEmbedding = `[${embedding.join(',')}]`;

    if (searchType === 'semantic') {
      const results = await sql`
        SELECT 
          content,
          post_slug,
          post_title,
          chunk_type,
          metadata,
          1 - (embedding <=> ${formattedEmbedding}::vector) as vector_similarity
        FROM content_chunks
        WHERE 1 - (embedding <=> ${formattedEmbedding}::vector) > 0.4
        ORDER BY vector_similarity DESC
        LIMIT 25;
      `;

      if (!results.rows.length) {
        const fb = await sql`
          SELECT 
            content,
            post_slug,
            post_title,
            chunk_type,
            metadata,
            1 - (embedding <=> ${formattedEmbedding}::vector) as vector_similarity
          FROM content_chunks
          ORDER BY vector_similarity DESC
          LIMIT 15;
        `;
        return res.json({
          results: fb.rows.map((row) => ({ ...row, similarity: row.vector_similarity })),
          fallback: true,
        });
      }

      return res.json({
        results: results.rows.map((row) => ({ ...row, similarity: row.vector_similarity })),
      });
    }

    // Hybrid (default)
    const results = await sql`
      WITH RankedResults AS (
        SELECT 
          content,
          post_slug,
          post_title,
          chunk_type,
          metadata,
          1 - (embedding <=> ${formattedEmbedding}::vector) as vector_similarity,
          ts_rank(
            to_tsvector('english', content || ' ' || post_title),
            plainto_tsquery('english', ${query})
          ) as text_rank
        FROM content_chunks
        WHERE 
          to_tsvector('english', content || ' ' || post_title) @@ plainto_tsquery('english', ${query})
          OR 1 - (embedding <=> ${formattedEmbedding}::vector) > 0.5
      )
      SELECT 
        content,
        post_slug,
        post_title,
        chunk_type,
        metadata,
        vector_similarity,
        text_rank,
        (vector_similarity * 0.7 + COALESCE(text_rank, 0) * 0.3) as hybrid_score
      FROM RankedResults
      ORDER BY hybrid_score DESC
      LIMIT 25;
    `;

    if (!results.rows.length) {
      const fb = await sql`
        WITH RankedResults AS (
          SELECT 
            content,
            post_slug,
            post_title,
            chunk_type,
            metadata,
            1 - (embedding <=> ${formattedEmbedding}::vector) as vector_similarity,
            ts_rank(
              to_tsvector('english', content || ' ' || post_title),
              plainto_tsquery('english', ${query})
            ) as text_rank
          FROM content_chunks
        )
        SELECT 
          content,
          post_slug,
          post_title,
          chunk_type,
          metadata,
          vector_similarity,
          text_rank,
          (vector_similarity * 0.7 + COALESCE(text_rank, 0) * 0.3) as hybrid_score
        FROM RankedResults
        ORDER BY hybrid_score DESC
        LIMIT 15;
      `;
      return res.json({
        results: fb.rows.map((row) => ({ ...row, similarity: row.hybrid_score })),
        fallback: true,
      });
    }

    return res.json({
      results: results.rows.map((row) => ({ ...row, similarity: row.hybrid_score })),
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error',
    });
  }
}