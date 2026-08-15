# Implementation Notes

## Current Onboarding Components

### `OnboardingHero`

Path:

```text
src/components/Onboarding/OnboardingHero.jsx
```

Owns the first screen composition:

- Theme toggle placeholder
- `ILAN`
- `TAPE 01`
- `TapeMemoryFrame`
- `start here`

### `TapeMemoryFrame`

Path:

```text
src/components/Onboarding/TapeMemoryFrame.jsx
```

Owns:

- Rotating memory images
- Per-image timestamps
- Frame overlay composition

The frame art is not CSS-drawn. It uses:

```text
public/onboarding/vhs-frame-overlay-cropped.png
```

## Adding A New Rotating Image

Edit `onboardingImages` in:

```text
src/components/Onboarding/OnboardingHero.jsx
```

Example:

```js
{ src: "/home/new-memory.png", timestamp: "00:00:31" }
```

## Desktop Fit

The onboarding page must fit within a normal desktop viewport without required scroll.

Known check:

- `1280x720`
- `document.documentElement.scrollHeight <= window.innerHeight`

The current frame size is controlled by:

```css
.tape-memory {
  width: min(48vw, 380px);
}
```

Mobile size is controlled separately:

```css
@media (max-width: 680px) {
  .tape-memory {
    width: min(82vw, 410px);
  }
}
```

## Background

The first screen background should remain plain cream.

Use only subtle speckles. Avoid visible stripes or heavy texture.

## Theme Toggle

The current theme toggle is CSS-drawn and temporary.

Future direction:

- Light mode icon: small ink sun/tape-reel mark.
- Dark mode icon: small ink moon/tape-reel mark.
- Same footprint as bneo-like corner toggle.
- Transparent background.
- Black ink in light mode, cream ink in dark mode.

## Build

Run:

```bash
npm run build
```

Warnings about chunk size and old browserslist data are pre-existing and not blockers for this design work.
