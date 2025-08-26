import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import getPostMetadata from '../../utils/getPostMetadata';
import './PostsArchive.css';

// Posts archive page (Vite + React Router version)
// Uses site CSS variables: var(--fg), var(--bg), var(--bg200)
export default function PostsArchivePage() {
  const postMetadata = useMemo(() => getPostMetadata(), []);

  const { totalBlogs, totalWords } = useMemo(() => {
    const totalBlogs = postMetadata.length;
    const totalWords = postMetadata.reduce((sum, p) => sum + (p.wordcount || 0), 0);
    return { totalBlogs, totalWords };
  }, [postMetadata]);

  return (
    <div className="posts-archive">
      {/* Centered hero heading + description */}
      <div className="posts-archive-hero">
        <h1>Browse the Blog</h1>
        <p>Dive into articles, notes, and experiments.</p>
      </div>

      {/* Main content row */}
      <div className="posts-archive-row main">
        {/* Left column: headline + info + actions */}
        <div className="posts-archive-col left">
          {/* Description above totals and actions */}
          <p className="avoid-widows">Filter by tags, pick at random, or search&nbsp;deeply.</p>

          <div className="posts-archive-info">
            <p className="primary sm">
              Total: {totalBlogs} ({new Intl.NumberFormat().format(totalWords)} words)
            </p>
            <div className="posts-archive-actions">
              <Link to="/tags">tags</Link>
              <span> · </span>
              <Link to="/random">random</Link>
              <span> · </span>
              <Link to="/search">search</Link>
            </div>
          </div>
        </div>

        {/* Right column: list */}
        <div className="posts-archive-col right">
          <div className="posts-list">
            <div className="posts-list-header">
              <p className="posts-list-header-title">Title</p>
              <p className="posts-list-header-date">Date</p>
            </div>
            {postMetadata.map((post, idx) => {
              const isStarred = (post.tags || []).includes('✰');
              return (
                <Link key={post.slug} to={`/posts/${post.slug}`} className="block">
                  <div className="posts-item">
                    <div className="flex items-center gap-2 min-w-0">
                      {isStarred && (
                        <span aria-label="starred">✰</span>
                      )}
                      <p className={`posts-item-title truncate ${isStarred ? 'font-semibold' : ''}`}>
                        {post.title}
                      </p>
                    </div>
                    <p className="posts-item-date ml-4 shrink-0">{post.date}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
