// utils/processMarkdownChunks.js
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

// Chunking configuration
const MIN_CHUNK_LENGTH = 10;       // Minimum size for a standalone chunk
const MAX_CHUNK_LENGTH = 200;      // Target size for chunks (reduced for more granularity)
const OVERLAP_PERCENTAGE = 0.3;    // 30% overlap between sliding windows
const OVERLAP_MIN_CHARS = 100;     // Minimum overlap in characters
const OVERLAP_MAX_CHARS = 200;     // Maximum overlap in characters
const MIN_BULLET_POINTS = 3;       // Minimum bullet points for a list chunk

function shouldBeSeparateChunk(content, type = 'text') {
  if (!content) return false;

  // Always keep these as separate chunks
  if (type === 'code' || type === 'quote') return true;
  if (type === 'heading' && content.length > 30) return true; // meaningful headers
  if (type === 'bullet-list') return true; // lists separate

  // Check word count AND character length for text content
  const wordCount = content.trim().split(/\s+/).length;
  const MIN_WORD_COUNT = 3;

  if (type === 'text' || type === 'paragraph') {
    return content.length >= MIN_CHUNK_LENGTH && wordCount >= MIN_WORD_COUNT;
  }

  return content.length >= MIN_CHUNK_LENGTH;
}

/**
 * Split text into overlapping chunks using a sliding window approach
 */
function splitIntoParagraphs(content) {
  const segments = content.split(/\n\n+/);

  return segments.flatMap((segment) => {
    if (segment.length <= MAX_CHUNK_LENGTH) return [segment];

    // sentence-based split
    const sentences = segment.match(/[^.!?]+[.!?]+/g) || [segment];
    const chunks = [];

    if (sentences.length <= 1) {
      return createOverlappingChunks(segment, MAX_CHUNK_LENGTH);
    }

    let currentChunk = '';
    let lastChunkEndSentences = [];
    const maxOverlapSentences = 2;

    sentences.forEach((sentence, i) => {
      if ((currentChunk + sentence).length > MAX_CHUNK_LENGTH && currentChunk) {
        chunks.push(currentChunk.trim());
        lastChunkEndSentences = sentences
          .slice(Math.max(0, i - maxOverlapSentences), i)
          .filter((s) => s.trim().length > 0);
        currentChunk = lastChunkEndSentences.join('');
      }
      currentChunk += sentence;
    });

    if (currentChunk && currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  });
}

/**
 * Create overlapping chunks from text using character-based sliding window
 */
function createOverlappingChunks(text, chunkSize) {
  const chunks = [];
  const textLength = text.length;

  if (textLength <= chunkSize) {
    return [text];
  }

  const overlapSize = Math.min(
    Math.max(Math.floor(chunkSize * OVERLAP_PERCENTAGE), OVERLAP_MIN_CHARS),
    OVERLAP_MAX_CHARS
  );

  const stride = chunkSize - overlapSize;

  for (let i = 0; i < textLength; i += stride) {
    const end = Math.min(i + chunkSize, textLength);
    chunks.push(text.substring(i, end));
    if (end === textLength) break;
  }

  return chunks;
}

function combineContent(contents) {
  return contents
    .filter((c) => c && c.trim().length > 0)
    .join('\n\n')
    .trim();
}

/**
 * Process a markdown file into semantic chunks with overlapping content
 */
export async function processMarkdownFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdownContent } = matter(content);
    const slug = path.basename(filePath, '.md');

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm);

    const tree = await processor.parse(markdownContent);
    const chunks = [];
    let currentSection = '';
    let sequence = 0;

    // Track paragraph context for improved overlapping
    let lastProcessedParagraphs = [];
    const MAX_CONTEXT_PARAGRAPHS = 2;

    // Buffer for accumulating small content
    let contentBuffer = {
      type: 'mixed',
      contents: [],
      section: '',
    };

    const flushBuffer = () => {
      const combinedContent = combineContent(contentBuffer.contents);
      if (shouldBeSeparateChunk(combinedContent, contentBuffer.type)) {
        chunks.push({
          type: contentBuffer.type,
          content: combinedContent,
          metadata: {
            section: contentBuffer.section,
            sequence: sequence++,
            isComposite: true,
            hasOverlappingContext: lastProcessedParagraphs.length > 0,
            wordCount: combinedContent.trim().split(/\s+/).length,
          },
        });

        if (contentBuffer.type === 'paragraph' || contentBuffer.type === 'text') {
          updateLastProcessedParagraphs(combinedContent);
        }
      }
      contentBuffer.contents = [];
    };

    const updateLastProcessedParagraphs = (content) => {
      lastProcessedParagraphs.push(content);
      if (lastProcessedParagraphs.length > MAX_CONTEXT_PARAGRAPHS) {
        lastProcessedParagraphs.shift();
      }
    };

    visit(tree, (node) => {
      switch (node.type) {
        case 'heading':
          if (node.depth <= 3 && node.children?.[0]?.value) {
            flushBuffer();
            currentSection = node.children[0].value;
            chunks.push({
              type: 'heading',
              content: node.children[0].value,
              metadata: {
                section: currentSection,
                sequence: sequence++,
                depth: node.depth,
              },
            });
          }
          break;

        case 'paragraph':
          flushBuffer();
          const paragraphContent = node.children
            .map((child) => child.value || '')
            .join('')
            .trim();

          if (paragraphContent) {
            const paragraphs = splitIntoParagraphs(paragraphContent);

            const contextualParagraphs = paragraphs.map((content, index) => {
              if (index === 0 && lastProcessedParagraphs.length > 0) {
                const lastContext =
                  lastProcessedParagraphs[lastProcessedParagraphs.length - 1];
                if (content.includes(lastContext.substring(lastContext.length - 50))) {
                  return content;
                }
                // simple context prefix was planned; currently no prefix added to keep text clean
                return content;
              }
              return content;
            });

            contextualParagraphs.forEach((content, index) => {
              if (index === paragraphs.length - 1) {
                updateLastProcessedParagraphs(paragraphs[index]);
              }

              if (shouldBeSeparateChunk(content, 'paragraph')) {
                const wordCount = content.trim().split(/\s+/).length;
                chunks.push({
                  type: 'paragraph',
                  content,
                  metadata: {
                    section: currentSection,
                    sequence: sequence++,
                    isOverlapping: index > 0 || lastProcessedParagraphs.length > 0,
                    positionInSequence:
                      index === 0 ? 'start' : index === paragraphs.length - 1 ? 'end' : 'middle',
                    wordCount,
                  },
                });
              } else {
                const wordCount = content.trim().split(/\s+/).length;
                if (wordCount >= 3) {
                  contentBuffer.contents.push(content);
                  contentBuffer.section = currentSection;
                  contentBuffer.type = 'text';
                }
              }
            });
          }
          break;

        case 'blockquote':
          flushBuffer();
          const quoteContent = node.children
            .map((child) => child.children[0].value)
            .join('\n')
            .trim();

          if (quoteContent) {
            chunks.push({
              type: 'quote',
              content: quoteContent,
              metadata: {
                section: currentSection,
                sequence: sequence++,
              },
            });
          }
          break;

        case 'list':
          const listItems = node.children
            .map((listItem) =>
              listItem.children.map((child) => child.children[0].value).join('').trim()
            )
            .filter(Boolean);

          if (listItems.length >= MIN_BULLET_POINTS) {
            flushBuffer();
            chunks.push({
              type: 'bullet-list',
              content: listItems.join('\n'),
              metadata: {
                section: currentSection,
                sequence: sequence++,
                bulletCount: listItems.length,
              },
            });
          } else {
            listItems.forEach((item) => {
              contentBuffer.contents.push(`• ${item}`);
            });
          }
          break;

        case 'code':
          flushBuffer();
          if (node.value?.trim()) {
            chunks.push({
              type: 'code',
              content: node.value.trim(),
              metadata: {
                language: node.lang,
                section: currentSection,
                sequence: sequence++,
              },
            });
          }
          break;
      }
    });

    flushBuffer();

    return {
      frontmatter: {
        title: frontmatter?.title || slug,
        ...frontmatter,
      },
      chunks: chunks.filter((c) => c.content.trim().length > 0),
      filePath: slug,
    };
  } catch (error) {
    const normalizedPath = path.basename(filePath, '.md');
    console.error(`Error processing ${normalizedPath}:`, error);
    return {
      frontmatter: { title: normalizedPath },
      chunks: [],
      filePath: normalizedPath,
    };
  }
}