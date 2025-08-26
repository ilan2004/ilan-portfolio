import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import './JournalDark.css';

import 'katex/dist/katex.min.css';

const RenderPost = ({ post, prev, next, slug }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('journal-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('journal-theme', newTheme ? 'dark' : 'light');
  };

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
    <div className={`${isDarkMode ? 'journal-dark' : 'journal-light'}`}>
        <div key={post.data.title} className="journal-page">
          {/* Theme Toggle Button inside the page (top-right) */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '☀︎' : '☽'}
          </button>
          {/* Header */}
          <div className="page-header">
            {slug ? (
              <Link to={`/posts/${slug}`}>
                <h1 className="journal-title">{post.data.title}</h1>
              </Link>
            ) : (
              <h1 className="journal-title">{post.data.title}</h1>
            )}
            <p className="journal-date">
              {new Date(post.data.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Tags shelf */}
          <div className="tags-shelf">
            {post.data.tags.split(', ').map((tag) => (
              <Link to={`/tags/${tag}`} key={tag} className="book-tag">
                {tag}
              </Link>
            ))}
          </div>

          <hr className="page-divider" />

          {/* Content */}
          <article className="journal-content">
            <ReactMarkdown
              components={components}
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
            >
              {post.content}
            </ReactMarkdown>
          </article>

          {/* Navigation */}
          <div className="footnotes">
            <h4 className="footnotes-title">Further Reading</h4>
            {next && (
              <div className="nav-item">
                <span className="nav-label">Next:</span>
                <Link to={`/posts/${next.slug}`} className="nav-link">
                  {next.title}
                </Link>
              </div>
            )}
            {prev && (
              <div className="nav-item">
                <span className="nav-label">Previous:</span>
                <Link to={`/posts/${prev.slug}`} className="nav-link">
                  {prev.title}
                </Link>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default RenderPost;