// utils/getAllPosts.js
import fs from 'fs';
import path from 'path';

export function getAllPosts() {
  const postsDirectory = path.join(process.cwd(), 'posts');

  function getMarkdownFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    return entries.reduce((files, entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return files.concat(getMarkdownFiles(fullPath));
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
      return files;
    }, []);
  }

  return getMarkdownFiles(postsDirectory);
}