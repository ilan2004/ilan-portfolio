// Minimal frontmatter parser (same as in getPostMetadata)
function parseFrontmatter(raw) {
  const text = String(raw);
  const fmStart = text.startsWith('---\n') || text.startsWith('---\r\n');
  if (!fmStart) return { data: {}, content: text };

  const lines = text.split(/\r?\n/);
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (/^-{3,}\s*$/.test(lines[i])) { endIndex = i; break; }
  }
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

const getPostContent = (slug) => {
  // Eagerly import all markdown files as raw strings
  const modules = import.meta.glob('/posts/**/*.md', { as: 'raw', eager: true });
  // Find the matching file by slug
  const entry = Object.entries(modules).find(([filePath]) => filePath.endsWith(`/${slug}.md`));
  if (!entry) {
    return { data: {}, content: '' };
  }
  const raw = String(entry[1]);
  return parseFrontmatter(raw);
};

export default getPostContent;
