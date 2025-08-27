import React, { useMemo, useState } from "react";
import "./Videos.css";

import Transition from "../../components/Transition/Transition";
import videos, { CLOUD_NAME } from "../../data/videos";
import VideoModal from "../../components/VideoModal/VideoModal";

const Videos = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null); // { publicId, title, poster }
  const [selected, setSelected] = useState(() => new Set()); // lowercased tags

  const tagStats = useMemo(() => {
    const counts = new Map();
    for (const v of videos) {
      if (!Array.isArray(v.tags)) continue;
      for (const raw of v.tags) {
        const t = String(raw || "").trim().toLowerCase();
        if (!t) continue;
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
    return counts;
  }, []);

  const toggleTag = (t) => {
    const tag = t.toLowerCase();
    const next = new Set(selected);
    if (next.has(tag)) next.delete(tag); else next.add(tag);
    setSelected(next);
  };

  const clearTags = () => setSelected(new Set());

  const openVideo = (v) => {
    setActive({ publicId: v.publicId, title: v.title, poster: v.poster });
    setOpen(true);
  };

  const closeVideo = () => {
    setOpen(false);
    setActive(null);
  };

  return (
    <div className="page videos">
      <div className="videos-container">
        <div className="videos-wrap">
          <header className="videos-header">
            <h1>Videos</h1>
            <p className="primary sm">music videos and visuals i've shot/edited</p>
          </header>

          {/* Filters */}
          {tagStats.size > 0 && (
            <section className="filters-bar" aria-label="Filter by tags">
              <button
                type="button"
                className={`tag-chip all-chip ${selected.size === 0 ? "is-active" : ""}`}
                onClick={clearTags}
              >
                All <span className="tag-count">{videos.length}</span>
              </button>
              {[...tagStats.keys()].sort().map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`tag-chip ${selected.has(t) ? "is-active" : ""}`}
                  onClick={() => toggleTag(t)}
                  aria-pressed={selected.has(t)}
                >
                  {t} <span className="tag-count">{tagStats.get(t)}</span>
                </button>
              ))}
            </section>
          )}

          <section className="videos-grid">
            {videos
              .filter((v) => {
                if (selected.size === 0) return true;
                const tags = (v.tags || []).map((x) => String(x || "").trim().toLowerCase()).filter(Boolean);
                return tags.some((t) => selected.has(t));
              })
              .map((v) => (
              <button
                type="button"
                className="video-card"
                key={v.id}
                onClick={() => openVideo(v)}
                aria-label={`Play ${v.title}`}
              >
                <div className="video-poster">
                  <img src={v.poster} alt={v.title} loading="lazy" />
                  <span className="play-badge" aria-hidden="true" />
                </div>
                <div className="video-meta">
                  <h4>{v.title}</h4>
                  {v.tags?.length ? (
                    <div className="tags-grid">
                      {v.tags.map((t) => (
                        <span className="tag-chip" key={t}>{t}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </button>
            ))}
          </section>
          <VideoModal
            isOpen={open}
            onClose={closeVideo}
            cloudName={CLOUD_NAME}
            publicId={active?.publicId || ""}
            title={active?.title}
            posterUrl={active?.poster}
            streamingProfile="hd"
          />
        </div>
      </div>
    </div>
  );
};

export default Transition(Videos);
