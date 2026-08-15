import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import './JournalDark.css';

import 'katex/dist/katex.min.css';

const RenderPost = ({ post }) => {
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={dracula}
          language={match[1]}
          customStyle={{ border: 'none' }}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    p: ({ node, children }) => {
      if (node.children[0]?.tagName === 'img') {
        const image = node.children[0];
        return (
          <div className="image-container">
            <img
              src={`${image.properties.src}`}
              alt={image.properties.alt || ''}
              className="journal-image"
              width={800}
              height={500}
              loading="lazy"
            />
            <p className="image-caption">{image.properties.alt}</p>
          </div>
        );
      }

      return <p>{children}</p>;
    },
  };

  return (
    <article className="journal-content">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {post.content}
      </ReactMarkdown>
    </article>
  );
};

export default RenderPost;
