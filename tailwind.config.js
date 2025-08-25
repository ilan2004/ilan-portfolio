/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Project palette extracted from src/index.css and components
        light: {
          bg: "#e3e3db", // from :root --bg
          text: "#0f0f0f", // from :root --fg
          accent: "#0b93f6", // user bubble in ChatInterface
          border: "#e5e5ea", // neutral bubble border/bg
          tag: "#f3f1ea", // soft tag tone (derived from bg)
        },
        dark: {
          bg: "#0f0f0f", // dark surface used across project
          text: "#ffffff", // white text in dark mode bubbles
          accent: "#0b93f6", // keep same accent for consistency
          border: "#303030", // dark bubble background/border
          tag: "#1f1f1f", // from :root --fg200
        },
      },
      fontFamily: {
        sans: ["Messina Sans", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["Messina Sans Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"],
        display: ["Rader", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        typing: {
          "0%": { opacity: "0.3" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.3" },
        },
      },
      animation: {
        typing: "typing 1.5s ease-in-out infinite",
        "typing-middle": "typing 1.5s ease-in-out infinite 0.2s",
        "typing-last": "typing 1.5s ease-in-out infinite 0.4s",
      },
    },
  },
  plugins: [typography()],
};