import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

/*
  Usage:
    node scripts/syncNotion.js                # sync all Published=true
    node scripts/syncNotion.js --only=my-slug # sync only pages whose slug matches

  Required env:
    - NOTION_TOKEN
    - NOTION_DATABASE_ID
*/

function slugify(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function getPropertyValue(page, name) {
  const p = page.properties?.[name];
  if (!p) return null;
  switch (p.type) {
    case 'title':
      return p.title?.map((t) => t.plain_text).join('') || '';
    case 'rich_text':
      return p.rich_text?.map((t) => t.plain_text).join('') || '';
    case 'multi_select':
      return p.multi_select?.map((t) => t.name) || [];
    case 'select':
      return p.select?.name || '';
    case 'date':
      return p.date?.start || null;
    case 'checkbox':
      return !!p.checkbox;
    case 'url':
      return p.url || '';
    case 'formula':
      // Notion formulas can vary; return string if present
      return p.formula?.string ?? p.formula?.number ?? p.formula?.boolean ?? null;
    default:
      return null;
  }
}

async function main() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    console.error('Missing NOTION_TOKEN or NOTION_DATABASE_ID');
    process.exit(1);
  }

  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const onlySlug = onlyArg ? onlyArg.split('=')[1] : null;

  const notion = new Client({ auth: token });
  const n2m = new NotionToMarkdown({ notionClient: notion });

  console.log('Querying Notion database for Published pages...');
  const pages = [];
  let hasMore = true;
  let cursor = undefined;
  while (hasMore) {
    const resp = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Published',
        checkbox: { equals: true },
      },
      start_cursor: cursor,
      page_size: 50,
      sorts: [{ property: 'Date', direction: 'descending' }],
    });
    pages.push(...resp.results);
    hasMore = resp.has_more;
    cursor = resp.next_cursor || undefined;
  }

  if (!pages.length) {
    console.log('No published pages found.');
    return;
  }

  const postsDir = path.join(process.cwd(), 'posts');
  ensureDir(postsDir);

  let written = 0;
  let skipped = 0;

  for (const page of pages) {
    const title = (await getPropertyValue(page, 'Title')) || 'untitled';
    const tags = (await getPropertyValue(page, 'Tags')) || [];
    const date = (await getPropertyValue(page, 'Date')) || null;
    const slugProp = (await getPropertyValue(page, 'Slug')) || '';
    const slug = (slugProp && String(slugProp).trim()) || slugify(title);

    if (onlySlug && slug !== onlySlug) {
      skipped++;
      continue;
    }

    try {
      // Convert page content to Markdown
      const mdBlocks = await n2m.pageToMarkdown(page.id);
      const mdString = n2m.toMarkdownString(mdBlocks).parent || '';

      // Build frontmatter matching current repo convention
      // Your existing posts use single-quoted strings and comma-separated tags; both array or string are supported downstream.
      const tagsString = Array.isArray(tags) ? tags.join(', ') : String(tags || '');
      const dateOut = date ? new Date(date).toISOString().split('T')[0] : '';

      const fm = [
        '---',
        '',
        `title: '${title.replace(/'/g, "''")}'`,
        `tags: '${tagsString.replace(/'/g, "''")}'`,
        dateOut ? `date: '${dateOut}'` : null,
        '--------------------',
        '',
      ]
        .filter(Boolean)
        .join('\n');

      const body = mdString.trim();
      const finalMd = `${fm}\n${body ? body + '\n' : ''}`;

      const outPath = path.join(postsDir, `${slug}.md`);
      fs.writeFileSync(outPath, finalMd, 'utf8');
      written++;
      console.log(`✅ Wrote posts/${slug}.md`);
    } catch (e) {
      console.warn(`Failed to write page '${title}':`, e?.message || e);
    }
  }

  console.log(`\nDone. Written: ${written}, Skipped: ${skipped}`);
  console.log('Next: run embeddings ->  node scripts/generateEmbeddings.js');
}

main().catch((e) => {
  console.error('Sync failed:', e);
  process.exit(1);
});
