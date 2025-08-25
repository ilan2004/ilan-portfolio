import React from "react";
import AnimatedCopy from "../AnimatedCopy/AnimatedCopy";

/**
 * Hobbies/Interests section extracted from Home
 */
const Hobbies = () => {
  return (
    <section className="hobbies">
      <div className="hobby">
        <AnimatedCopy tag="h4" animateOnScroll={true}>
          Product
        </AnimatedCopy>
      </div>
      <div className="hobby">
        <AnimatedCopy tag="h4" animateOnScroll={true}>
          Storytelling
        </AnimatedCopy>
      </div>
      <div className="hobby">
        <AnimatedCopy tag="h4" animateOnScroll={true}>
          DEVELOP
        </AnimatedCopy>
      </div>
      <div className="hobby">
        <AnimatedCopy tag="h4" animateOnScroll={true}>
          Cinematography
        </AnimatedCopy>
      </div>
    </section>
  );
};

export default Hobbies;
