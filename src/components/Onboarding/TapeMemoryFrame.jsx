import React, { useEffect, useMemo, useState } from "react";
import "./TapeMemoryFrame.css";

const DEFAULT_IMAGES = [{ src: "/onboarding/etched-group.png", timestamp: "00:00:07" }];

const TapeMemoryFrame = ({
  images = DEFAULT_IMAGES,
  interval = 5200,
}) => {
  const validImages = useMemo(() => {
    return images
      .map((image, index) => {
        if (typeof image === "string") {
          return { src: image, timestamp: `00:00:${String(index + 7).padStart(2, "0")}` };
        }

        return image;
      })
      .filter((image) => image?.src);
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (validImages.length < 2) return undefined;

    const rotation = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % validImages.length);
    }, interval);

    return () => window.clearInterval(rotation);
  }, [interval, validImages.length]);

  const activeImage = validImages[activeIndex] || DEFAULT_IMAGES[0];

  return (
    <figure className="tape-memory" aria-label="Rotating personal memory frame">
      <div className="tape-memory__stage">
        <div className="tape-memory__viewport" aria-hidden="true">
          <img src={activeImage.src} alt="" className="tape-memory__image" />
        </div>

        <img
          src="/onboarding/vhs-frame-overlay-cropped.png"
          alt=""
          className="tape-memory__overlay"
          draggable="false"
        />

        <figcaption className="tape-memory__timestamp">
          {activeImage.timestamp || "00:00:07"}
        </figcaption>
      </div>
    </figure>
  );
};

export default TapeMemoryFrame;
