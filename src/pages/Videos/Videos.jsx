import React, { useState } from "react";
import "./Videos.css";

import Transition from "../../components/Transition/Transition";
import videos, { CLOUD_NAME } from "../../data/videos";
import VideoModal from "../../components/VideoModal/VideoModal";

const Videos = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null); // { publicId, title, poster }

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

          <section className="videos-grid">
            {videos.map((v) => (
              <button
                type="button"
                className="video-card"
                key={v.id}
                onClick={() => openVideo(v)}
                aria-label={`Play ${v.title}`}
              >
                <div className="video-poster">
                  <img src={v.poster} alt={v.title} loading="lazy" />
                </div>
                <div className="video-meta">
                  <h4>{v.title}</h4>
                  {v.tags?.length ? (
                    <p className="secondary xs">{v.tags.join(" • ")}</p>
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
