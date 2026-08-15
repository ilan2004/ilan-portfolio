import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import getPostMetadata from '../../utils/getPostMetadata';
import ThemeSwitch from '../../components/ThemeSwitch/ThemeSwitch';
import './PostsArchive.css';

export default function PostsArchivePage() {
  const postMetadata = useMemo(() => getPostMetadata(), []);

  const { totalBlogs, totalWords } = useMemo(() => {
    const totalBlogs = postMetadata.length;
    const totalWords = postMetadata.reduce((sum, p) => sum + (p.wordcount || 0), 0);
    return { totalBlogs, totalWords };
  }, [postMetadata]);

  return (
    <main className="posts-archive">
      <ThemeSwitch className="posts-archive__theme" />

      <header className="posts-archive__header">
        <Link to="/" className="posts-archive__brand">ILAN</Link>
        <p>TAPE 01 / ARCHIVE</p>
      </header>

      <nav className="posts-archive__nav" aria-label="Archive tools">
        <Link to="/start">start</Link>
        <Link to="/tags">tags</Link>
        <Link to="/random">random</Link>
        <Link to="/search">search</Link>
      </nav>

      <section className="posts-archive__meta" aria-label="Archive totals">
        <p>{totalBlogs} posts · {new Intl.NumberFormat().format(totalWords)} words</p>
      </section>

      <section className="posts-list" aria-label="Posts">
        <p className="posts-list__eyebrow">all tapes</p>
        {postMetadata.map((post) => {
          const isStarred = String(post.tags || '').includes('✰');
          return (
            <Link key={post.slug} to={`/posts/${post.slug}`} className="posts-item">
              <span className="posts-item__title">
                {isStarred && <span className="posts-item__star" aria-label="starred">✰</span>}
                {post.title}
              </span>
              <time className="posts-item__date">{post.date || 'undated'}</time>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
