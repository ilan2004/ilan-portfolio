# AGENTS.md

Guidance for AI agents and contributors working on this portfolio.

## Product Direction

This site is being rebuilt as a quiet personal archive, not a conventional portfolio.

Core phrase:

> A VHS zine archive where memories look photocopied and the interface feels like an old camcorder.

The reference mood is sparse, personal, and browsable: minimal onboarding, a simple start page, icon-based navigation, and deep archive pages for work, writing, videos, thoughts, and current life.

Primary inspiration:

- `https://www.bneo.xyz/`
- `https://www.bneo.xyz/start`

Read `docs/reference-bneo.md` before making major design decisions. The goal is to borrow bneo's restraint, entry ritual, personal archive depth, and object-like navigation, then translate those ideas into Ilan's VHS zine archive language.

## Design Principles

- Prefer restraint over spectacle.
- Keep the first screen quiet: name, tape label, one rotating memory artifact, a tiny theme toggle, and `start here`.
- Use personal media and archive artifacts instead of generic illustrations.
- Keep pages readable and simple. Depth should come from content, not decoration.
- Avoid glossy SaaS, neon retro, cyberpunk, gradients, large marketing heroes, and card-heavy layouts.
- Use texture as evidence of a human hand: photocopy grain, ink skips, tape, contact sheets, timecodes.
- Use motion lightly: image rotation, small flicker, soft cuts/fades. Do not add large animated transitions unless they feel like tape/video behavior.

## Typography

- Primary interface/display font: `VCR OSD Mono`.
- Use `VCR OSD Mono` for identity, tape labels, timestamps, metadata, and small UI hints.
- Keep VCR text light: `font-weight: 400`, no faux bold, no heavy text shadows.
- Body and quiet links may use `Averia Serif Libre` when a softer personal tone is needed.
- Avoid negative letter spacing. Use small positive tracking for VCR labels when useful.

## Color

- Light mode: warm paper cream, black ink, muted red `REC` accent.
- Dark mode: charcoal background, warm cream ink, muted red or low green/amber accents.
- Keep the palette mostly two-color. Red should be rare and meaningful.
- No dominant purple, neon, synthetic gradients, or colorful retro palettes.

## Assets

- Store onboarding assets in `public/onboarding/`.
- Generated frame overlays should be transparent PNGs whenever possible.
- Do not bake dynamic values like timestamps into frame art. Render them in React.
- The tape frame overlay currently lives at:
  - `public/onboarding/vhs-frame-overlay-cropped.png`
- The rotating onboarding memory image currently lives at:
  - `public/onboarding/etched-group.png`
- Use source images from `public/home/` and `public/about/` only when they fit the archive/memory tone.

## Implementation Rules

- Keep components reusable and small.
- Onboarding frame behavior belongs in `src/components/Onboarding/TapeMemoryFrame.jsx`.
- Onboarding page composition belongs in `src/components/Onboarding/OnboardingHero.jsx`.
- Do not reintroduce the old portfolio hero/chat UI on `/` unless explicitly requested.
- Hide the old global `Menu` on `/`; onboarding should remain uncluttered.
- The site must fit in one viewport on desktop onboarding. No required scrolling on the first screen.
- Test responsive behavior before finalizing visual changes.
- Run `npm run build` after code changes.

## Content Architecture

Target structure:

- `/` onboarding tape
- `/start` short personal intro and links
- `/posts` archive
- `/thoughts` short notes
- `/work` project list
- `/videos` video archive
- `/now` current state
- `/contact` ways to reach Ilan

Keep route/content changes incremental. Preserve existing posts and routes unless intentionally replacing them.

## Files To Read First

- `docs/design.md`
- `docs/reference-bneo.md`
- `docs/assets.md`
- `src/components/Onboarding/OnboardingHero.jsx`
- `src/components/Onboarding/TapeMemoryFrame.jsx`
- `src/components/Onboarding/OnboardingHero.css`
- `src/components/Onboarding/TapeMemoryFrame.css`
