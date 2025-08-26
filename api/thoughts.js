// Simple serverless handler for /api/thoughts
// Returns a list of recent short entries for the Thoughts page

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // For now we serve a small static sample. Replace with a database/notion fetch if desired.
    const now = new Date();
    const entries = [
      {
        id: 't3',
        content: "Shipped the React Router migration for blog routes. Onward to polishing the UX.",
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
      },
      {
        id: 't2',
        content: "Coffee first, code second. Discovered a neat trick with import.meta.glob for MD posts.",
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString(), // 26h ago
      },
      {
        id: 't1',
        content: "Experimenting with hybrid search: combining keyword and vector similarity feels great.",
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      },
    ];

    // Sort newest first for consistency
    entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).end(JSON.stringify(entries));
  } catch (e) {
    console.error('thoughts api error:', e?.message || e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
