import React from "react";
import "./About.css";

import AnimatedCopy from "../../components/AnimatedCopy/AnimatedCopy";
import ContactForm from "../../components/ContactForm/ContactForm";
import Footer from "../../components/Footer/Footer";

import ReactLenis from "lenis/react";

import Transition from "../../components/Transition/Transition";

const About = () => {
  return (
    <ReactLenis root>
      <div className="page about">
        <section className="about-header">
          <h1>Est</h1>
          <h1>2004</h1>
        </section>

        <section className="about-hero">
          <div className="about-hero-img">
            <img src="/about/about-hero.jpg" alt="" />
          </div>
        </section>

        <section className="about-me-copy">
          <div className="about-me-copy-wrapper">
            <AnimatedCopy animateOnScroll={true} tag="h3">
              I'm Ilan — a builder, storyteller, and technologist from Kerala (india). I'm driven by the need to create meaningful things through technology, and to make the most of this one life I’ve been given.
            </AnimatedCopy>

            <AnimatedCopy animateOnScroll={true} tag="h3">
              I see stories everywhere. Whether it's code, a frame of video, or a quiet moment — I love capturing what matters. I shoot wherever I go, because documenting life is part of how I live it.
            </AnimatedCopy>

            <AnimatedCopy animateOnScroll={true} tag="h3">
              My work is grounded in purpose. I believe in honest expression, bold experimentation, and building things that have real-world impact. At my core, I’m here to build — and building through tech is my way of giving back.
            </AnimatedCopy>
          </div>
        </section>

        <section className="services">
          <div className="services-col">
            <div className="services-banner">
              <img src="/about/services-banner.jpg" alt="" />
            </div>
            <p className="primary">Created with Purpose</p>
          </div>
          <div className="services-col">
            <h4>
              Every project is a chance to learn, to explore, and to leave something valuable behind. I bring intention, clarity, and care to every step of the process — from idea to execution.
            </h4>

            <div className="services-list">
              <div className="service-list-row">
                <div className="service-list-col">
                  <h5>Software Development</h5>
                </div>
                <div className="service-list-col">
                  <p>
                    I build full-stack applications using modern frameworks like Next.js and Node.js. I love creating tools, products, and systems that solve problems and scale beautifully.
                  </p>
                </div>
              </div>

              <div className="service-list-row">
                <div className="service-list-col">
                  <h5>Visual Storytelling</h5>
                </div>
                <div className="service-list-col">
                  <p>
                    From short videos to cinematic edits, I capture moments that matter. I treat every frame like a sentence in a story — it should say something, feel something, and be worth watching.
                  </p>
                </div>
              </div>

              <div className="service-list-row">
                <div className="service-list-col">
                  <h5>Tech Direction</h5>
                </div>
                <div className="service-list-col">
                <p>
  I build to feel, and to make others feel.  
  Some things I make for myself —  
  others, for the ones it's meant to reach.  
  Their reactions stay with me.  
  Building is how I make sense of the world —  
  through stories, through code, through light.
</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-banner-img">
          <div className="about-banner-img-wrapper">
            <img src="/about/about-banner.jpg" alt="" />
          </div>
        </section>

        <section className="fav-tools">
          <div className="fav-tools-header">
            <AnimatedCopy tag="p" animateOnScroll={true} className="primary sm">
              My Stack
            </AnimatedCopy>
            <AnimatedCopy tag="h2" animateOnScroll={true} delay={0.25}>
              Skills
            </AnimatedCopy>
            <AnimatedCopy
              tag="p"
              animateOnScroll={true}
              className="secondary"
              delay={0.5}
            >
              I work across code, design, and visual media — building experiences that are efficient, elegant, and expressive.
            </AnimatedCopy>
          </div>

          <div className="fav-tools-list">
            <div className="fav-tools-list-row">
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/next.png" alt="" />
                </div>
                <h4>Next.js</h4>
                <p className="primary sm">Web Development</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/node.png" alt="" />
                </div>
                <h4>Node.js</h4>
                <p className="primary sm">Backend Logic</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/firebase.png" alt="" />
                </div>
                <h4>Firebase</h4>
                <p className="primary sm">Database</p>
              </div>
            </div>
            <div className="fav-tools-list-row">
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/after.png" alt="" />
                </div>
                <h4>After Effects</h4>
                <p className="primary sm">Video Editing</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/python.png" alt="" />
                </div>
                <h4>Python</h4>
                <p className="primary sm">Daily Coding</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/git.png" alt="" />
                </div>
                <h4>Github</h4>
                <p className="primary sm">Visual Capture</p>
              </div>
            </div>
          </div>
        </section>

        <ContactForm />

        <Footer />
      </div>
    </ReactLenis>
  );
};

export default Transition(About);
