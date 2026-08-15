import React from "react";
import { Link } from "react-router-dom";
import TapeMemoryFrame from "./TapeMemoryFrame";
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch";
import "./OnboardingHero.css";

const onboardingImages = [
  { src: "/onboarding/etched-group.png", timestamp: "00:00:07" },
  { src: "/home/group.png", timestamp: "00:00:12" },
  { src: "/home/academ.jpeg", timestamp: "00:00:19" },
  { src: "/home/mountain.png", timestamp: "00:00:26" },
];

const OnboardingHero = () => {
  return (
    <section className="onboarding-hero" aria-label="Ilan onboarding">
      <ThemeSwitch className="onboarding-hero__theme" />

      <div className="onboarding-hero__identity">
        <h1>ILAN</h1>
        <p>TAPE 01</p>
      </div>

      <TapeMemoryFrame images={onboardingImages} />

      <Link className="onboarding-hero__start" to="/start">
        start here
      </Link>
    </section>
  );
};

export default OnboardingHero;
