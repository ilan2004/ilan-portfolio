// utils/index.js
// Deprecated: Do not generate embeddings from the browser.
// Route search/embedding via server endpoints (e.g., /api/search).

/**
 * generateEmbedding (deprecated)
 * This function is intentionally disabled on the client to prevent leaking API keys.
 */
export async function generateEmbedding() {
  throw new Error(
    'generateEmbedding() is disabled in the browser. Please call your server endpoint (e.g., /api/search) instead.'
  );
}