import React from 'react';
import { Link, useParams } from 'react-router-dom';
import getPostMetadata from '../../../utils/getPostMetadata';
import '../../posts/PostsArchive.css';

export default function TagDetailPage() {
  const { slug } = useParams();
  const tag = decodeURIComponent(slug || '');
  const postMetadata = getPostMetadata();

  const filteredPosts = postMetadata.filter((post) =>
    String(post.tags || '')
      .split(',')
      .map((t) => t.trim())
      .includes(tag)
  );

  return (
    <div className="posts-archive">
      {/* Centered hero heading + description */}
      <div className="posts-archive-hero">
        <h1>Tag: {tag}</h1>
        <p>Posts tagged with “{tag}”.</p>
      </div>

      {/* Main content row */}
      <div className="posts-archive-row main">
        {/* Left column: info + actions */}
        <div className="posts-archive-col left">
          <p className="avoid-widows">
            Filter by tags, pick at random, or search deeply.
          </p>
          <div className="posts-archive-info">
            <p className="primary sm">Total: {filteredPosts.length}</p>
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
            {filteredPosts.map((post) => {
              const isStarred = String(post.tags || '').includes('✰');
              return (
                <Link key={post.slug} to={`/posts/${post.slug}`} className="block">
                  <div className="posts-item">
                    <div className="flex items-center gap-2 min-w-0">
                      {isStarred && <span aria-label="starred">✰</span>}
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
