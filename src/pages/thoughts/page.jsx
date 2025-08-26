import React, { useEffect, useState } from 'react';

export default function ThoughtsPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/thoughts', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setEntries(Array.isArray(data) ? data : (data?.rows || []));
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load thoughts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section>
      <h1 className="font-bold text-left mb-10 text-2xl">Ben's Thoughts 💭</h1>
      {loading && <div>Loading…</div>}
      {!loading && error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (entries.length > 0 ? (
        entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col mb-6 p-2 bg-blue-100 border-2 border-black dark:bg-gray-900 dark:border-white"
          >
            <div className="text-md text-gray-700 break-words dark:text-white">
              {entry.content}
            </div>
            <div className="text-gray-500 mt-2 text-sm">
              {new Date(entry.created_at).toLocaleString('en-GB', {
                timeZone: 'Asia/Kuala_Lumpur',
                hour: 'numeric',
                hour12: false,
                minute: 'numeric',
                month: 'numeric',
                day: 'numeric',
                year: '2-digit',
              })}
            </div>
          </div>
        ))
      ) : (
        <div>None</div>
      ))}
    </section>
  );
}
