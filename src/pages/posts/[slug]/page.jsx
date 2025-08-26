import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../PostsArchive.css';
import getPostContent from '../../../utils/getPostContent';
import getPostMetadata from '../../../utils/getPostMetadata';
import RenderPost from '../../../components/RenderPost/RenderPost';

export default function PostPage() {
  const { slug } = useParams();

  const metadata = useMemo(() => getPostMetadata(), []);
  const post = useMemo(() => metadata.find((p) => p.slug === slug), [metadata, slug]);

  if (!slug || !post) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--fg)] mb-2">Not Found</h1>
        <p className="text-[var(--fg)]/70 mb-4">The post you’re looking for doesn’t exist.</p>
        <div className="flex items-center justify-center gap-3 text-sm">
          <Link to="/posts" className="underline !text-[var(--bg)] hover:opacity-90">All posts</Link>
          <span>·</span>
          <Link to="/tags" className="underline !text-[var(--bg)] hover:opacity-90">Tags</Link>
          <span>·</span>
          <Link to="/random" className="underline !text-[var(--bg)] hover:opacity-90">Random</Link>
          <span>·</span>
          <Link to="/search" className="underline !text-[var(--bg)] hover:opacity-90">Search</Link>
        </div>
      </div>
    );
  }

  const postContent = getPostContent(slug);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left small info box (full-width on mobile, sidebar on desktop) */}
        <aside className="md:w-64 md:shrink-0">
          <div className="read-nav-box rounded-lg p-4 bg-[var(--fg)] text-[var(--bg)] border border-dashed border-[var(--bg)]">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="opacity-80">Navigate</span>
              <Link to="/posts" className="underline text-[var(--bg)] hover:opacity-90">back</Link>
              <span>·</span>
              <Link to="/tags" className="underline text-[var(--bg)] hover:opacity-90">tags</Link>
              <span>·</span>
              <Link to="/random" className="underline text-[var(--bg)] hover:opacity-90">random</Link>
              <span>·</span>
              <Link to="/search" className="underline text-[var(--bg)] hover:opacity-90">search</Link>
            </div>
          </div>
        </aside>

        {/* Right content column */}
        <main className="flex-1 min-w-0">
          <RenderPost post={postContent} prev={post.prev} next={post.next} slug={slug} />
        </main>
      </div>
    </div>
  );
}
