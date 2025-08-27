import React, { useEffect, useRef } from "react";
import "./VideoModal.css";

// Utility to build Cloudinary URLs
const buildHlsUrl = (cloudName, publicId, streamingProfile = "hd") => {
  // sp_hd is a common default profile; allow override via prop
  const sp = streamingProfile.startsWith("sp_") ? streamingProfile : `sp_${streamingProfile}`;
  return `https://res.cloudinary.com/${cloudName}/video/upload/${sp}/${publicId}.m3u8`;
};

const buildMp4Url = (cloudName, publicId) => {
  return `https://res.cloudinary.com/${cloudName}/video/upload/f_mp4/${publicId}.mp4`;
};

const VideoModal = ({
  isOpen,
  onClose,
  cloudName,
  publicId,
  title,
  posterUrl,
  streamingProfile = "hd",
  autoPlay = true,
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !publicId || !cloudName) return;

    const video = videoRef.current;
    const hlsManifest = buildHlsUrl(cloudName, publicId, streamingProfile);

    const setup = async () => {
      // If Safari/iOS support HLS natively
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsManifest;
        // If native HLS fails to load, fall back to MP4
        const onError = () => {
          video.removeEventListener("error", onError);
          video.src = buildMp4Url(cloudName, publicId);
          if (autoPlay) video.play().catch(() => {});
        };
        video.addEventListener("error", onError, { once: true });
        if (autoPlay) video.play().catch(() => {});
        return;
      }

      try {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const hls = new Hls({
            // Faster start: begin with lowest rendition, then ramp up
            startLevel: 0,
            capLevelToPlayerSize: true,
            maxBufferLength: 10,
            maxMaxBufferLength: 20,
            lowLatencyMode: true,
            // Conservative network timeouts
            manifestLoadingTimeOut: 10000,
            fragLoadingTimeOut: 15000,
          });
          hlsRef.current = hls;
          hls.loadSource(hlsManifest);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (autoPlay) video.play().catch(() => {});
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data?.fatal) {
              try { hls.destroy(); } catch (_) {}
              hlsRef.current = null;
              // Fallback to MP4 on fatal HLS errors (e.g., manifest/frag not found)
              video.src = buildMp4Url(cloudName, publicId);
              if (autoPlay) video.play().catch(() => {});
            }
          });
        } else {
          // Fallback to MP4
          video.src = buildMp4Url(cloudName, publicId);
          if (autoPlay) video.play().catch(() => {});
        }
      } catch (e) {
        // As a last resort, try MP4 fallback
        video.src = buildMp4Url(cloudName, publicId);
        if (autoPlay) video.play().catch(() => {});
      }
    };

    setup();

    return () => {
      // Cleanup
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        try { video.pause(); } catch (_) {}
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [isOpen, publicId, cloudName, streamingProfile, autoPlay]);

  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="video-modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label={title || "Video Player"}>
      <div className="video-modal-content">
        <button className="video-modal-close" onClick={onClose} aria-label="Close video">×</button>
        <div className="video-modal-player">
          <video
            ref={videoRef}
            className="video-el"
            poster={posterUrl}
            controls
            playsInline
            muted
            preload="none"
          />
        </div>
        {title ? <div className="video-modal-title"><h3>{title}</h3></div> : null}
      </div>
    </div>
  );
};

export default VideoModal;
