import React from "react";
import AnimatedCopy from "../AnimatedCopy/AnimatedCopy";

/**
 * About Me sticky titles section.
 * Expects refs from parent for GSAP pinning/animations.
 */
const AboutMe = ({ stickyTitlesRef, titlesRef }) => {
  return (
    <section ref={stickyTitlesRef} className="sticky-titles">
      <div className="sticky-titles-nav">
        <p className="primary sm">About Me</p>
        <p className="primary sm">Let’s Connect</p>
      </div>
      <div className="sticky-titles-footer">
        <p className="primary sm">Curiosity-Driven Tech</p>
        <p className="primary sm">Open to Collaborations</p>
      </div>

      <h2 ref={(el) => (titlesRef.current[0] = el)}>
        I approach technology the way Da Vinci approached art—
        exploring different fields and connecting ideas.
      </h2>
      <h2 ref={(el) => (titlesRef.current[1] = el)}>
        From software engineering to cinematic storytelling,
        I blend disciplines to build meaningful experiences.
      </h2>
      <h2 ref={(el) => (titlesRef.current[2] = el)}>
        This portfolio is a reflection of my belief:
        true innovation happens at the intersections.
      </h2>
    </section>
  );
};

export default AboutMe;
