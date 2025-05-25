import React from "react";
import "./About.css";

import AnimatedCopy from "../../components/AnimatedCopy/AnimatedCopy";
import ContactForm from "../../components/ContactForm/ContactForm";
import Footer from "../../components/Footer/Footer";
import CloudinaryImage from "../../components/CloudinaryImage";

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
            <CloudinaryImage 
              publicId="win_jcrs6g" 
              alt="About hero image" 
              width={1920}
              loading="eager"
            />
          </div>
        </section>

        <section className="about-me-copy">
          <div className="about-me-copy-wrapper">
            <AnimatedCopy animateOnScroll={true} tag="h3">
              I'm Ilan — a builder, storyteller, and technologist from Kerala (india). I'm driven by the need to create meaningful things through technology, and to make the most of this one life I've been given.
            </AnimatedCopy>

            <AnimatedCopy animateOnScroll={true} tag="h3">
              I see stories everywhere. Whether it's code, a frame of video, or a quiet moment — I love capturing what matters. I shoot wherever I go, because documenting life is part of how I live it.
            </AnimatedCopy>

            <AnimatedCopy animateOnScroll={true} tag="h3">
              My work is grounded in purpose. I believe in honest expression, bold experimentation, and building things that have real-world impact. At my core, I'm here to build — and building through tech is my way of giving back.
            </AnimatedCopy>
          </div>
        </section>

        <section className="services">
          <div className="services-col">
            <div className="services-banner">
              <CloudinaryImage 
                publicId="cool_c10obi" 
                alt="Services banner image" 
                width={800}
              />
            </div>
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
            <CloudinaryImage 
              publicId="stand_bl1yvj" 
              alt="About banner image" 
              width={1600}
            />
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
                  <CloudinaryImage 
                    publicId="next_iowilf" 
                    alt="Next.js logo" 
                    width={400}
                  />
                </div>

                <p className="primary sm">Web Development</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <CloudinaryImage 
                    publicId="node_ulyy44" 
                    alt="Node.js logo" 
                    width={400}
                  />
                </div>

                <p className="primary sm">Backend Logic</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <CloudinaryImage 
                    publicId="firebase_xq90w6" 
                    alt="Firebase logo" 
                    width={400}
                  />
                </div>

                <p className="primary sm">Database</p>
              </div>
            </div>
            <div className="fav-tools-list-row">
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <CloudinaryImage 
                    publicId="after_bnry9h" 
                    alt="After Effects logo" 
                    width={400}
                  />
                </div>

                <p className="primary sm">Video Editing</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <CloudinaryImage 
                    publicId="python_xmklub" 
                    alt="Python logo" 
                    width={400}
                  />
                </div>

                <p className="primary sm">Programming Language</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <CloudinaryImage 
                    publicId="git_lzegge" 
                    alt="Git logo" 
                    width={400}
                  />
                </div>

                <p className="primary sm">Version Control</p>
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
