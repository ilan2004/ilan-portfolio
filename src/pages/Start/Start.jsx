import React from "react";
import { Link } from "react-router-dom";
import ThemeSwitch from "../../components/ThemeSwitch/ThemeSwitch";
import "./Start.css";

const navItems = [
  { to: "/posts", label: "archive", icon: "/icons/archive/archive-box.png" },
  { to: "/work", label: "work", icon: "/icons/archive/work-tape-case.png" },
  { to: "/videos", label: "videos", icon: "/icons/archive/vhs-tape.png" },
  { to: "/random", label: "random", icon: "/icons/archive/random-tracking.png" },
  { to: "/contact", label: "signal", icon: "/icons/archive/signal-waves.png" },
  { to: "/posts", label: "gallery", icon: "/icons/archive/contact-sheet.png" },
  { to: "/posts", label: "notes", icon: "/icons/archive/timestamp-note.png" },
  { to: "/start", label: "now", icon: "/icons/archive/camcorder.png" },
];

const Start = () => {
  return (
    <main className="start-page">
      <ThemeSwitch className="start-page__theme" />

      <header className="start-page__header">
        <Link to="/" className="start-page__brand">
          ILAN
        </Link>
        <p>TAPE 01 / START</p>
      </header>

      <nav className="start-page__nav" aria-label="Archive navigation">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} aria-label={item.label}>
            <span aria-hidden="true">
              <img src={item.icon} alt="" />
            </span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>

      <article className="start-page__copy">
        <p>
          i'm ilan. i build interfaces, edit videos, write notes, and keep
          small fragments from the internet.
        </p>
        <p>
          this site is my tape archive:{" "}
          <Link to="/work">work</Link>, <Link to="/videos">videos</Link>,{" "}
          <Link to="/posts">posts</Link>, experiments, and things i'm trying to
          understand.
        </p>
        <p>
          browse the <Link to="/posts">archive</Link>, roll a{" "}
          <Link to="/random">random tape</Link>, or send a{" "}
          <Link to="/contact">signal</Link>.
        </p>
      </article>
    </main>
  );
};

export default Start;
