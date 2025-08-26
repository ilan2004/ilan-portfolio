import { getAllPostSlugs } from '../scripts/postUtils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const slugs = getAllPostSlugs();
    if (!Array.isArray(slugs) || slugs.length === 0) {
      return res.status(404).json({ error: 'No posts found' });
    }
    const randomSlug = slugs[Math.floor(Math.random() * slugs.length)];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).end(JSON.stringify({ slug: randomSlug }));
  } catch (e) {
    console.error('random api error:', e?.message || e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
