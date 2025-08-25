import React from "react";
import AnimatedCopy from "../AnimatedCopy/AnimatedCopy";
import ChatInterface from "../ChatInterface/ChatInterface";

/**
 * Hero section with small title and tagline and embedded ChatInterface
 */
const Hero = ({ backgroundImage, onChangeBackgroundAction }) => {
  return (
    <section className="hero">
      <div className="hero-text">
        <div className="hero-header">
          <AnimatedCopy tag="h1" animateOnScroll={false} delay={0.7}>
            Ilan
          </AnimatedCopy>
          <AnimatedCopy tag="h1" animateOnScroll={false} delay={0.8}>
            Usman
          </AnimatedCopy>
        </div>
        <div className="hero-tagline hero-tagline--desktop">
          <AnimatedCopy tag="p" animateOnScroll={false} delay={1.0} className="primary">
            Developer • Storyteller • Tinkerer
          </AnimatedCopy>
        </div>
      </div>

      <div className="hero-chatGroup">
        <div className="hero-chat">
          <ChatInterface
            backgroundImage={backgroundImage}
            onChangeBackgroundAction={onChangeBackgroundAction}
          />
        </div>

        {/* Mobile tagline below chat */}
        <div className="hero-tagline hero-tagline--mobile">
          <AnimatedCopy tag="p" animateOnScroll={false} delay={0.2} className="primary">
            Developer • Storyteller • Tinkerer
          </AnimatedCopy>
        </div>
      </div>
    </section>
  );
};

export default Hero;
