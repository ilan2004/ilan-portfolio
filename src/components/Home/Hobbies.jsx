import React from "react";
import AnimatedCopy from "../AnimatedCopy/AnimatedCopy";
import { Link } from "react-router-dom";

/**
 * Hobbies/Interests section extracted from Home
 */
const Hobbies = () => {
  return (
    <section className="hobbies">
      <div className="hobby">
        <Link to="/work" className="hobby-link">
          <AnimatedCopy tag="h4" animateOnScroll={true}>
            Projects
          </AnimatedCopy>
        </Link>
      </div>
      <div className="hobby">
        <Link to="/videos" className="hobby-link">
          <AnimatedCopy tag="h4" animateOnScroll={true}>
            Videos
          </AnimatedCopy>
        </Link>
      </div>
      <div className="hobby">
        <Link to="/posts" className="hobby-link">
          <AnimatedCopy tag="h4" animateOnScroll={true}>
            Blog
          </AnimatedCopy>
        </Link>
      </div>
    </section>
  );
};

export default Hobbies;
