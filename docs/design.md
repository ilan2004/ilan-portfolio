# Design System

## Direction

The site should feel like a quiet VHS zine archive: personal memories, photocopied marks, tape labels, timecodes, and simple writing.

The goal is not to copy another personal site. The goal is to translate the same clarity and depth into Ilan's own language: video edits, archived moments, rough ink, and old camcorder UI.

Primary reference:

- `https://www.bneo.xyz/`
- `https://www.bneo.xyz/start`

See `docs/reference-bneo.md` for the full breakdown of what we are borrowing and why the reference works.

## Design Sentence

> Memories look photocopied. The interface feels like an old camcorder.

## Visual Ingredients

- Off-white paper field
- Black ink
- Tiny muted red `REC` accent
- Transparent tape overlays
- Etched or photocopied personal images
- Contact-sheet framing
- VCR timestamps
- Minimal icon navigation
- Sparse lower-case links

## Layout Rules

- Keep the onboarding screen centered and sparse.
- Use large empty space as part of the design.
- Avoid normal portfolio sections on the first screen.
- Page sections should be unframed layouts, not stacked cards.
- Icon navigation can appear after onboarding/start, not as a loud global header on `/`.
- Archive pages should be list-first and scannable.

## Onboarding Screen

Required pieces:

- Top-right theme toggle icon
- Centered `ILAN`
- Smaller `TAPE 01`
- Rotating tape memory frame
- Dynamic timestamp rendered in React
- Small `start here` link near the lower center

Current tone:

- `ILAN`: VCR OSD Mono, uppercase, light weight, positive letter spacing.
- `start here`: small, soft serif, underlined.
- Background: plain cream with subtle paper speckle only.

Avoid:

- Required scrolling on desktop
- Large hero copy
- Marketing taglines
- Buttons that look like app UI
- Heavy texture patterns

## Typography

### VCR OSD Mono

Use for:

- `ILAN`
- `TAPE 01`
- Timestamps
- REC/play/status metadata
- Small page labels
- Video/archive details

Rules:

- Use `font-weight: 400`.
- Use letter spacing for air, not boldness.
- Do not use it for long paragraphs.

### Averia Serif Libre

Use for:

- `start here`
- Simple body writing
- Soft personal notes
- Links that should feel less mechanical

## Color Tokens

Suggested values:

```css
--archive-paper: #eee6d6;
--archive-ink: #11100d;
--archive-muted: rgba(17, 16, 13, 0.62);
--archive-red: #a84732;
--archive-dark: #191817;
--archive-cream: #f1eadc;
```

Use red only for `REC`, active state, or rare emphasis.

## Icon Style

Icons should feel like old video-deck symbols drawn through a photocopier.

Good icon subjects:

- VHS tape
- Camcorder
- Play triangle
- Folder/tape case
- Timestamp note
- Contact sheet
- Signal waves
- REC dot
- Battery
- Subtitle box
- Archive box
- Tracking/random arrows

Icon rules:

- Transparent background
- Single-color black/cream where possible
- Slightly imperfect ink edges
- Simple enough to recognize at 32-48px
- No app-store style glyphs
- No polished filled-color icon packs

## Motion

Use motion like analog video:

- Still rotation every few seconds
- Subtle flicker
- Frame jump by 1px
- Fade/cut between pages
- Hover state as a small tracking glitch

Avoid:

- Big spring animations
- Parallax-heavy landing-page motion
- Constant distracting noise

## Page System

### `/`

Onboarding tape. No global menu.

### `/start`

Simple personal introduction with inline links to the deeper archive.

Example tone:

```text
i'm ilan.

this site is my archive: work, videos, notes, experiments, and things i'm trying to understand.
```

### `/posts`

Dense archive list. Favorites and dates are useful. Keep it scannable.

### `/thoughts`

Short timestamped fragments. Tiny notes, not full essays.

### `/work`

Plain project list with short descriptions and links. Avoid large cards.

### `/videos`

Video/edit archive. Contact-sheet or tape-list language fits here.

### `/now`

Current state: where, what building, what learning, what watching/reading.

### `/contact`

Simple signal page: email/social links, maybe one small icon/artifact.
