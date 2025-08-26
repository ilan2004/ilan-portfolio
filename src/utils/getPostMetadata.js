// utils/getPostMetadata.js (Vite client-safe, no Node/Buffer)

// Minimal frontmatter parser: supports YAML-like "key: value" until a dashed fence ends
function parseFrontmatter(raw) {
  const text = String(raw);
  const fmStart = text.startsWith('---\n') || text.startsWith('---\r\n');
  if (!fmStart) return { data: {}, content: text };

  // Find closing fence: any line composed only of 3+ dashes
  const lines = text.split(/\r?\n/);
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (/^-{3,}\s*$/.test(lines[i])) { endIndex = i; break; }
  }
  // Fallback: if not found but a long dashed line exists, accept it
  if (endIndex === -1) {
    for (let i = 1; i < lines.length; i++) {
      if (/^-{5,}\s*$/.test(lines[i])) { endIndex = i; break; }
    }
  }
  if (endIndex === -1) return { data: {}, content: text };

  const headerLines = lines.slice(1, endIndex);
  const body = lines.slice(endIndex + 1).join('\n');

  const data = {};
  for (const line of headerLines) {
    const m = line.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, content: body };
}

export default function getPostMetadata(getDrafts = false) {
  // Eagerly import all markdown files as raw strings using Vite's glob import
  // Only include drafts if explicitly requested
  const allModules = import.meta.glob('/posts/**/*.md', { as: 'raw', eager: true });

  const entries = Object.entries(allModules).filter(([filePath]) => {
    const isDraft = filePath.includes('/posts/drafts/');
    return getDrafts ? isDraft : !isDraft;
  });

  const posts = entries.map(([filePath, raw]) => {
    try {
      const { data, content } = parseFrontmatter(raw);
      const slug = filePath.split('/').pop().replace(/\.md$/, '');

      return {
        title: data && data.title ? data.title : slug,
        date: data && data.date ? data.date : null,
        // keep tags as a string if provided; else empty string
        tags: data && data.tags ? data.tags : '',
        wordcount: (content.match(/\b\w+\b/gu) || []).length,
        slug,
      };
    } catch (error) {
      const slug = filePath.split('/').pop().replace(/\.md$/, '');
      console.error(`Error parsing frontmatter in file: ${filePath}`, error);
      return {
        title: `Error in ${slug}`,
        slug,
        date: null,
        tags: '',
        wordcount: 0,
      };
    }
  });

  // Sort by date desc; unknown dates last
  posts.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : -Infinity;
    const db = b.date ? new Date(b.date).getTime() : -Infinity;
    return db - da;
  });

  // Link next/prev
  posts.forEach((post, index) => {
    post.next = index > 0 ? posts[index - 1] : null;
    post.prev = index < posts.length - 1 ? posts[index + 1] : null;
  });

  return posts;
}