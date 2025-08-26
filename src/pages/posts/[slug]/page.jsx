import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../PostsArchive.css';
import getPostContent from '../../../utils/getPostContent';
import getPostMetadata from '../../../utils/getPostMetadata';
import RenderPost from '../../../components/RenderPost/RenderPost';
import { AnimatePresence, motion } from 'framer-motion';

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
        {/* Left small info box (inline on mobile, fixed bottom-left on desktop) */}
        <aside className="hidden md:block md:w-64 md:shrink-0">
          <div className="read-nav-box rounded-lg p-4 bg-[var(--fg)] text-[var(--bg)] border border-dashed border-[var(--bg)] md:fixed md:bottom-6 md:left-6 md:w-56 md:shadow-lg md:shadow-black/10">
            <div className="flex flex-col items-start gap-2 text-sm" aria-label="Post navigation">
              <span className="opacity-80 mb-1">Navigate</span>
              <Link to="/posts" className="px-3 py-1 rounded-full border border-[var(--bg)]/30 bg-[var(--bg)]/10 text-[var(--bg)] hover:bg-[var(--bg)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bg)]/60 transition">back</Link>
              <Link to="/tags" className="px-3 py-1 rounded-full border border-[var(--bg)]/30 bg-[var(--bg)]/10 text-[var(--bg)] hover:bg-[var(--bg)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bg)]/60 transition">tags</Link>
              <Link to="/random" className="px-3 py-1 rounded-full border border-[var(--bg)]/30 bg-[var(--bg)]/10 text-[var(--bg)] hover:bg-[var(--bg)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bg)]/60 transition">random</Link>
              <Link to="/search" className="px-3 py-1 rounded-full border border-[var(--bg)]/30 bg-[var(--bg)]/10 text-[var(--bg)] hover:bg-[var(--bg)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bg)]/60 transition">search</Link>
            </div>
          </div>
        </aside>

        {/* Right content column */}
        <main className="flex-1 min-w-0">
          <RenderPost post={postContent} prev={post.prev} next={post.next} slug={slug} />
          {/* Bottom Prev/Next navigation */}
          <nav className="mt-8 pt-6 border-t border-[var(--fg)]/20" aria-label="Adjacent posts">
            <div className="flex items-center justify-between gap-4 text-[var(--fg)]">
              {post.prev ? (
                <Link
                  to={`/posts/${post.prev.slug}`}
                  className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--fg)]/20 hover:border-[var(--fg)]/40 hover:bg-[var(--fg)]/5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg)]/50"
                >
                  <span className="text-lg" aria-hidden>←</span>
                  <span className="text-sm">
                    <span className="block opacity-70">Previous</span>
                    <span className="block font-medium line-clamp-1">{post.prev.title}</span>
                  </span>
                </Link>
              ) : <span />}

              {post.next ? (
                <Link
                  to={`/posts/${post.next.slug}`}
                  className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--fg)]/20 hover:border-[var(--fg)]/40 hover:bg-[var(--fg)]/5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg)]/50"
                >
                  <span className="text-sm text-right">
                    <span className="block opacity-70">Next</span>
                    <span className="block font-medium line-clamp-1">{post.next.title}</span>
                  </span>
                  <span className="text-lg" aria-hidden>→</span>
                </Link>
              ) : <span />}
            </div>
          </nav>

          {/* Mobile FAB + Popover Navigation */}
          <MobileFabNav />
        </main>
      </div>
    </div>
  );
}

// Mobile-only FAB Navigation component
function MobileFabNav() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onDown(e) {
      if (!open) return;
      const t = e.target;
      if (btnRef.current && btnRef.current.contains(t)) return;
      if (popRef.current && popRef.current.contains(t)) return;
      setOpen(false);
      // restore focus to button on close
      btnRef.current?.focus();
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const safeBottom = 'calc(1rem + env(safe-area-inset-bottom, 0px))';

  return (
    <div className="md:hidden">
      {/* FAB Button */}
      <motion.button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-fab-popover"
        className="fixed left-4 z-20 w-12 h-12 rounded-full bg-[var(--fg)] text-[var(--bg)] shadow-lg shadow-black/20 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg)]/60"
        style={{ bottom: safeBottom }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open post navigation"
      >
        {/* Simple icon: 3 dots */}
        <span className="text-xl leading-none" aria-hidden>⋯</span>
      </motion.button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-fab-popover"
            ref={popRef}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, mass: 0.6 }}
            className="fixed left-4 z-20 w-56 rounded-lg border border-[var(--bg)]/30 bg-[var(--fg)] text-[var(--bg)] shadow-xl shadow-black/20 p-3"
            style={{ bottom: `calc(4rem + 0.75rem + env(safe-area-inset-bottom, 0px))` }}
            role="dialog"
            aria-modal="false"
          >
            <div className="flex flex-col items-start gap-2 text-sm" aria-label="Post navigation">
              <span className="opacity-80 mb-1">Navigate</span>
              <Link onClick={() => setOpen(false)} to="/posts" className="px-3 py-1 rounded-full border border-[var(--bg)]/30 bg-[var(--bg)]/10 text-[var(--bg)] hover:bg-[var(--bg)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bg)]/60 transition">back</Link>
              <Link onClick={() => setOpen(false)} to="/tags" className="px-3 py-1 rounded-full border border-[var(--bg)]/30 bg-[var(--bg)]/10 text-[var(--bg)] hover:bg-[var(--bg)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bg)]/60 transition">tags</Link>
              <Link onClick={() => setOpen(false)} to="/random" className="px-3 py-1 rounded-full border border-[var(--bg)]/30 bg-[var(--bg)]/10 text-[var(--bg)] hover:bg-[var(--bg)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bg)]/60 transition">random</Link>
              <Link onClick={() => setOpen(false)} to="/search" className="px-3 py-1 rounded-full border border-[var(--bg)]/30 bg-[var(--bg)]/10 text-[var(--bg)] hover:bg-[var(--bg)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bg)]/60 transition">search</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
