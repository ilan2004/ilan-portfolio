// scripts/generateEmbeddings.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { VoyageAIClient } from 'voyageai';

// --- Config ---
const BATCH_SIZE = 15;
const DELAY_BETWEEN_BATCHES = 500;
const DELAY_BETWEEN_FILES = 1500;
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000;
const MAX_WHOLE_POST_LENGTH = 8000;
const OVERLAP_THRESHOLD = 100;
const VOYAGE_MODEL = 'voyage-3-lite'; // 512-dim (SDK returns 512)
const VECTOR_DIMS = 512;

// --- PG client ---
if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
});

// --- Voyage client ---
if (!process.env.VOYAGE_AI_API_KEY) {
  console.error('Missing VOYAGE_AI_API_KEY');
  process.exit(1);
}
const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_AI_API_KEY });

// --- Utilities ---
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setupTable() {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');

    const { rows } = await pool.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables WHERE table_name = 'content_chunks'
       )`
    );

    if (!rows[0].exists) {
      console.log('Table does not exist, creating...');
      await pool.query(`
        CREATE TABLE content_chunks (
          id UUID PRIMARY KEY,
          post_slug TEXT,
          post_title TEXT,
          content TEXT,
          chunk_type TEXT,
          metadata JSONB,
          sequence INTEGER,
          embedding vector(${VECTOR_DIMS}),
          overlaps_with UUID[],
          overlap_score FLOAT[],
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool.query(`CREATE INDEX idx_content_chunks_post_slug ON content_chunks(post_slug);`);
      await pool.query(`CREATE INDEX idx_content_chunks_chunk_type ON content_chunks(chunk_type);`);
      await pool.query(`CREATE INDEX idx_content_chunks_published_date ON content_chunks((metadata->>'published_date'));`);
      await pool.query(`CREATE INDEX idx_overlaps_with ON content_chunks USING GIN(overlaps_with);`);

      // Optional: IVF index for faster similarity search (tune lists as needed)
      await pool.query(`CREATE INDEX IF NOT EXISTS content_chunks_embedding_ivf
        ON content_chunks USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);`);
      console.log('✅ Table and indexes created');
    } else {
      console.log('✅ Table already exists');
      // --- Backfill missing columns for older schemas ---
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'content_chunks' AND column_name = 'overlaps_with'
          ) THEN
            ALTER TABLE content_chunks ADD COLUMN overlaps_with UUID[];
          END IF;
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'content_chunks' AND column_name = 'overlap_score'
          ) THEN
            ALTER TABLE content_chunks ADD COLUMN overlap_score FLOAT[];
          END IF;
        END
        $$;
      `);
      // Ensure index exists after adding overlaps_with
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_overlaps_with ON content_chunks USING GIN(overlaps_with);`);
      // Ensure the IVF index exists as well
      await pool.query(`CREATE INDEX IF NOT EXISTS content_chunks_embedding_ivf
        ON content_chunks USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);`);
      
      // Ensure embedding column dimension matches the model (vector(512))
      try {
        await pool.query(`ALTER TABLE content_chunks ALTER COLUMN embedding TYPE vector(${VECTOR_DIMS});`);
      } catch (e) {
        console.warn('Skipping embedding column ALTER (likely already correct or contains incompatible data):', e.message || e);
      }
    }
  } catch (err) {
    console.error('Error setting up table:', err);
    throw err;
  }
}

async function embedWithRetry(texts, retryCount = 0) {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), 60000)
    );
    return await Promise.race([
      voyage.embed({
        model: VOYAGE_MODEL,
        input: texts,
        inputType: 'document',
      }),
      timeoutPromise,
    ]);
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const transient =
        error?.response?.status === 429 ||
        error.message === 'Request timed out' ||
        error.message?.includes('timeout') ||
        error.message?.includes('network') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT';

      if (transient) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying embeddings in ${delay}ms (${retryCount + 1}/${MAX_RETRIES})`);
        await wait(delay);
        return embedWithRetry(texts, retryCount + 1);
      }
    }
    console.error(`Embedding failed after ${retryCount} retries:`, error.message || error);
    throw error;
  }
}

function extractPostDate(filePath, frontmatter) {
  if (frontmatter?.date) {
    const d = new Date(frontmatter.date);
    if (!isNaN(d.getTime())) return d;

    const monthNameMatch = String(frontmatter.date).match(
      /([A-Za-z]+)\s+(\d{1,2})(?:,?\s+)?(\d{4})/
    );
    if (monthNameMatch) {
      const [, month, day, year] = monthNameMatch;
      const map = {
        jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
        may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8,
        oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
      };
      const idx = map[month.toLowerCase()];
      if (idx !== undefined) {
        const d2 = new Date(parseInt(year), idx, parseInt(day));
        if (!isNaN(d2.getTime())) return d2;
      }
    }
    console.warn(`Could not parse frontmatter date '${frontmatter.date}' in ${filePath}`);
  }

  const m = filePath.match(/(\d{2})(\d{2})(\d{2})$/); // slug like MMDDYY
  if (m) {
    const [, mm, dd, yy] = m;
    return new Date(parseInt(`20${yy}`), parseInt(mm) - 1, parseInt(dd));
  }
  return new Date(2020, 0, 1);
}

// Reads every .md in posts/ (non-drafts by default) and preps chunk metadata
async function processAllPosts() {
  const postsDir = path.join(process.cwd(), 'posts');
  function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((e) => {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) return walk(fp);
      if (e.name.endsWith('.md')) return [fp];
      return [];
    });
  }
  const files = walk(postsDir).filter((f) => !f.includes(`${path.sep}drafts${path.sep}`));

  // Use your existing chunker if available; otherwise index full file as a single chunk
  const posts = files.map((absPath) => {
    const relPath = path.relative(postsDir, absPath).replace(/\\/g, '/').replace(/\.md$/, '');
    const raw = fs.readFileSync(absPath, 'utf8');
    const { data: frontmatter, content } = matter(raw);

    // Minimal chunk structure if you don't call your semantic chunker here
    const chunks = [
      {
        type: 'paragraph',
        content: content.trim().slice(0, 2000), // store trimmed content (full content is too big)
        metadata: { sequence: 1, isOverlapping: false, positionInSequence: 'start' },
      },
    ];
    return { filePath: relPath, frontmatter, chunks };
  });

  return posts;
}

function createProgressBar(current, total, width = 30) {
  const pct = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  return `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}] ${pct}% (${current}/${total})`;
}

async function generateEmbeddingsForSingleFile(filePath) {
  const posts = await processAllPosts();
  const post = posts.find((p) => p.filePath === filePath.replace(/\.md$/, ''));
  if (!post) {
    console.error(`File ${filePath} not found`);
    return { successfulChunks: 0, failedChunks: 0 };
  }

  // Wipe existing chunks for this post
  try {
    await pool.query(`DELETE FROM content_chunks WHERE post_slug = $1`, [post.filePath]);
  } catch (err) {
    console.error('Error removing previous embeddings:', err);
  }

  const { frontmatter, chunks } = post;
  let successfulChunks = 0;
  let failedChunks = 0;

  const publishedDate = extractPostDate(post.filePath, frontmatter);
  const formattedPublishedDate = publishedDate.toISOString().split('T')[0];

  // Whole-post embedding (if small enough)
  try {
    const absMd = path.join(process.cwd(), 'posts', `${post.filePath}.md`);
    if (fs.existsSync(absMd)) {
      const raw = fs.readFileSync(absMd, 'utf8');
      const { content } = matter(raw);
      if (content.length <= MAX_WHOLE_POST_LENGTH) {
        const resp = await embedWithRetry([`FULL POST: ${content.trim()}`]);
        const embedding = resp?.data?.[0]?.embedding;
        if (embedding?.length) {
          const wholePostId = uuidv4();
          const enhancedMetadata = {
            is_whole_post: true,
            word_count: content.split(/\s+/).length,
            title: frontmatter?.title || post.filePath,
            published_date: formattedPublishedDate,
            tags: normalizeTags(frontmatter?.tags),
          };
          await pool.query(
            `INSERT INTO content_chunks
              (id, post_slug, post_title, content, chunk_type, metadata, sequence, embedding, overlaps_with, overlap_score)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8::vector,$9,$10)`,
            [
              wholePostId,
              post.filePath,
              frontmatter?.title || post.filePath,
              content.length > 2000 ? content.substring(0, 2000) + '...' : content,
              'full-post',
              JSON.stringify(enhancedMetadata),
              0,
              JSON.stringify(embedding),
              null,
              null,
            ]
          );
          successfulChunks++;
          console.log('✅ Whole post embedding complete');
        }
      }
    }
  } catch (err) {
    console.error('Error processing whole post:', err);
  }

  // Process chunks in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchChunks = chunks.slice(i, i + BATCH_SIZE);
    try {
      const inputTexts = batchChunks.map((chunk) => {
        const typePrefix = (chunk.type || 'TEXT').toUpperCase();
        const sectionPrefix = chunk.metadata?.section ? `[SECTION: ${chunk.metadata.section}] ` : '';
        return `${typePrefix}: ${sectionPrefix}${String(chunk.content || '').trim()}`;
      });

      let response;
      try {
        response = await embedWithRetry(inputTexts);
      } catch (e) {
        if (
          inputTexts.length > 3 &&
          (e.message?.includes('timeout') ||
            e.message?.includes('network') ||
            e.code === 'ECONNRESET' ||
            e.code === 'ETIMEDOUT')
        ) {
          const mid = Math.floor(inputTexts.length / 2);
          const first = await embedWithRetry(inputTexts.slice(0, mid));
          await wait(DELAY_BETWEEN_BATCHES);
          const second = await embedWithRetry(inputTexts.slice(mid));
          response = { data: [...(first.data || []), ...(second.data || [])] };
        } else {
          throw e;
        }
      }

      if (!response?.data?.length) {
        console.error('No embeddings data in response');
        failedChunks += batchChunks.length;
        continue;
      }

      const chunkIds = batchChunks.map(() => uuidv4());

      // Insert all chunks
      const results = await Promise.all(
        batchChunks.map(async (chunk, j) => {
          try {
            const embedding = response.data[j]?.embedding;
            const enhancedMetadata = {
              ...(chunk.metadata || {}),
              post_title: frontmatter?.title || post.filePath,
              isOverlapping: chunk.metadata?.isOverlapping || false,
              positionInSequence: chunk.metadata?.positionInSequence || 'unknown',
              published_date: formattedPublishedDate,
              tags: normalizeTags(frontmatter?.tags),
            };

            await pool.query(
              `INSERT INTO content_chunks
                (id, post_slug, post_title, content, chunk_type, metadata, sequence, embedding, overlaps_with, overlap_score)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8::vector,$9,$10)`,
              [
                chunkIds[j],
                post.filePath,
                frontmatter?.title || post.filePath,
                chunk.content,
                chunk.type,
                JSON.stringify(enhancedMetadata),
                chunk.metadata?.sequence ?? j + 1,
                JSON.stringify(embedding),
                null,
                null,
              ]
            );
            return true;
          } catch (err) {
            console.error('Error inserting chunk:', err);
            return false;
          }
        })
      );

      const successCount = results.filter(Boolean).length;
      successfulChunks += successCount;
      failedChunks += batchChunks.length - successCount;

      // Simple sequential overlap updates
      if (successCount > 1) {
        await Promise.all(
          batchChunks.map(async (chunk, j) => {
            if (j === 0) return true;
            const currentChunk = String(chunk.content || '');
            const prevChunk = String(batchChunks[j - 1]?.content || '');
            const prevEnd = prevChunk.substring(Math.max(0, prevChunk.length - OVERLAP_THRESHOLD));
            if (prevEnd && currentChunk.includes(prevEnd)) {
              const overlapScore = prevEnd.length / Math.max(1, currentChunk.length);
              await pool.query(
                `UPDATE content_chunks 
                 SET overlaps_with = coalesce(overlaps_with,'{}'::uuid[]) || $1::uuid,
                     overlap_score = coalesce(overlap_score,'{}'::float[]) || $2::float
                 WHERE id = $3`,
                [chunkIds[j - 1], overlapScore, chunkIds[j]]
              );
              await pool.query(
                `UPDATE content_chunks 
                 SET overlaps_with = coalesce(overlaps_with,'{}'::uuid[]) || $1::uuid,
                     overlap_score = coalesce(overlap_score,'{}'::float[]) || $2::float
                 WHERE id = $3`,
                [chunkIds[j], overlapScore, chunkIds[j - 1]]
              );
            }
            return true;
          })
        );
      }

      console.log(`✅ Batch complete: ${successCount}/${batchChunks.length}`);
      await wait(DELAY_BETWEEN_BATCHES);
    } catch (err) {
      console.error('Error processing batch:', err);
      failedChunks += batchChunks.length;
    }
  }

  return { successfulChunks, failedChunks };
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).filter(Boolean);
  return [];
}

async function generateEmbeddingsForAllFiles() {
  const posts = await processAllPosts();
  const nonDraft = posts.filter((p) => !p.filePath.includes('/drafts/'));
  console.log(`Processing ${nonDraft.length} files`);
  console.log(createProgressBar(0, nonDraft.length));

  let totalSuccessful = 0;
  let totalFailed = 0;

  for (let i = 0; i < nonDraft.length; i++) {
    const p = nonDraft[i];
    console.log(`\n=== ${i + 1}/${nonDraft.length}: ${p.filePath} ===`);
    const { successfulChunks, failedChunks } = await generateEmbeddingsForSingleFile(p.filePath);
    totalSuccessful += successfulChunks;
    totalFailed += failedChunks;
    console.log(createProgressBar(i + 1, nonDraft.length));
    if (i < nonDraft.length - 1) {
      console.log(`Waiting ${DELAY_BETWEEN_FILES}ms...`);
      await wait(DELAY_BETWEEN_FILES);
    }
  }
  return { totalSuccessful, totalFailed };
}

async function main() {
  try {
    await setupTable();

    const specificFile = process.argv[2]; // e.g., "010125" or "notes/my-post"
    if (specificFile) {
      console.log(`Processing single file: ${specificFile}`);
      const { successfulChunks, failedChunks } = await generateEmbeddingsForSingleFile(specificFile);
      console.log('\n=== Summary ===');
      console.log(`Successful chunks: ${successfulChunks}`);
      console.log(`Failed chunks: ${failedChunks}`);
    } else {
      const { totalSuccessful, totalFailed } = await generateEmbeddingsForAllFiles();
      console.log('\n=== Final Summary ===');
      console.log(`Total successful: ${totalSuccessful}`);
      console.log(`Total failed: ${totalFailed}`);
    }
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal error:', err);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

main();