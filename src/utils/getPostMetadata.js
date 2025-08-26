// utils/getPostMetadata.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export default function getPostMetadata(getDrafts = false) {
  const folder = getDrafts ? 'posts/drafts/' : 'posts/';
  const absFolder = path.isAbsolute(folder) ? folder : path.join(process.cwd(), folder);

  if (!fs.existsSync(absFolder)) {
    return [];
  }

  const files = fs.readdirSync(absFolder);
  const markdownPosts = files.filter((file) => file.endsWith('.md'));

  const posts = markdownPosts.map((fileName) => {
    try {
      const fullPath = path.join(absFolder, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        title: data.title ?? fileName.replace('.md', ''),
        date: data.date ?? null,
        tags: data.tags ?? [],
        wordcount: (content.match(/\b\w+\b/gu) || []).length,
        slug: fileName.replace('.md', ''),
      };
    } catch (error) {
      console.error(`Error parsing frontmatter in file: ${fileName}`, error);
      return {
        title: `Error in ${fileName}`,
        slug: fileName.replace('.md', ''),
        date: null,
        tags: [],
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