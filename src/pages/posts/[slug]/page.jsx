import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../PostsArchive.css';
import './PostDetail.css';
import getPostContent from '../../../utils/getPostContent';
import getPostMetadata from '../../../utils/getPostMetadata';
import RenderPost from '../../../components/RenderPost/RenderPost';
import ThemeSwitch from '../../../components/ThemeSwitch/ThemeSwitch';

function formatDate(date) {
  if (!date) return 'undated';

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function tapeNumber(index) {
  return String(Math.max(index + 1, 1)).padStart(2, '0');
}

export default function PostPage() {
  const { slug } = useParams();

  const metadata = useMemo(() => getPostMetadata(), []);
  const postIndex = useMemo(
    () => metadata.findIndex((item) => item.slug === slug),
    [metadata, slug],
  );
  const post = postIndex >= 0 ? metadata[postIndex] : undefined;

  if (!slug || !post) {
    return (
      <main className="post-detail post-detail--missing">
        <ThemeSwitch className="post-detail__theme" />
        <section className="post-detail__shell">
          <p className="post-detail__kicker">TAPE LOST</p>
          <h1>Not found</h1>
          <nav className="post-detail__topnav" aria-label="Post navigation">
            <Link to="/posts">archive</Link>
            <Link to="/random">random</Link>
            <Link to="/search">search</Link>
          </nav>
        </section>
      </main>
    );
  }

  const postContent = getPostContent(slug);
  const tags = String(post.tags || postContent.data.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const wordCount = post.wordcount || postContent.data.wordcount || 0;
  const minutes = Math.max(1, Math.round(wordCount / 220));
  const endTimestamp = `00:${String(minutes).padStart(2, '0')}:${String(Math.min(59, Math.max(7, Math.round(wordCount / 37)))).padStart(2, '0')}`;

  return (
    <main className="post-detail">
      <ThemeSwitch className="post-detail__theme" />

      <section className="post-detail__shell">
        <nav className="post-detail__topnav" aria-label="Post navigation">
          <Link to="/posts">back</Link>
          <Link to="/posts">archive</Link>
          <Link to="/random">random</Link>
          <Link to="/search">search</Link>
        </nav>

        <header className="post-detail__header">
          <div className="post-detail__tape-row">
            <p className="post-detail__kicker">TAPE {tapeNumber(postIndex)}</p>
            <p className="post-detail__rec"><span aria-hidden="true" />REC</p>
          </div>

          <h1>{post.title}</h1>

          <p className="post-detail__meta">
            {formatDate(post.date || postContent.data.date)}
            <span aria-hidden="true"> · </span>
            {wordCount ? `${new Intl.NumberFormat().format(wordCount)} words` : 'field note'}
            <span aria-hidden="true"> · </span>
            {minutes} min read
          </p>

          {tags.length > 0 && (
            <div className="post-detail__tags" aria-label="Post tags">
              {tags.map((tag) => (
                <Link key={tag} to={`/tags/${tag}`}>
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        <RenderPost post={postContent} />

        <footer className="post-detail__footer">
          <p>{endTimestamp} / END</p>

          <nav className="post-detail__adjacent" aria-label="Adjacent posts">
            {post.prev ? (
              <Link to={`/posts/${post.prev.slug}`}>
                <span>previous tape</span>
                {post.prev.title}
              </Link>
            ) : <span />}

            {post.next ? (
              <Link to={`/posts/${post.next.slug}`}>
                <span>next tape</span>
                {post.next.title}
              </Link>
            ) : <span />}
          </nav>
        </footer>
      </section>
    </main>
  );
}
