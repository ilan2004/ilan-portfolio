import React from 'react';
import { Link } from 'react-router-dom';
import getPostMetadata from '../../utils/getPostMetadata';
import '../posts/PostsArchive.css';

const TagPage = () => {
  const postMetadata = getPostMetadata();

  const tags = {};

  postMetadata.forEach((post) => {
    post.tags.split(',').forEach((tag: any) => {
      tag = tag.trim();

      if (tags[tag]) {
        tags[tag] += 1;
      } else {
        tags[tag] = 1;
      }
    });
  });

  const sortedTags = Object.keys(tags).sort((a, b) => tags[b] - tags[a]);
  const tagList = sortedTags.map((tag) => (
    <Link key={tag} to={`/tags/${tag}`} className="tag-chip">
      <span className="truncate">{tag}</span>
      <span className="tag-count">{tags[tag]}</span>
    </Link>
  ));

  return (
    <div className="posts-archive">
      {/* Hero */}
      <div className="posts-archive-hero">
        <h1>Tags</h1>
        <p>Browse posts by topic.</p>
      </div>

      <div className="posts-archive-row main">
        {/* Left column */}
        <div className="posts-archive-col left">
          <p className="avoid-widows">Filter by tags, pick at random, or search&nbsp;deeply.</p>
          <div className="posts-archive-info">
            <div className="posts-archive-actions">
              <Link to="/tags">tags</Link>
              <span> · </span>
              <Link to="/random">random</Link>
              <span> · </span>
              <Link to="/search">search</Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="posts-archive-col right">
          <div className="tags-grid">
            {tagList}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagPage;
