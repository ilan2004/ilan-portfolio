# Asset Guide

## Asset Philosophy

Assets should feel discovered, scanned, or archived. They should not feel like stock illustrations or generic UI decoration.

The strongest visual identity combines:

- Personal images
- Etched / pen-ink processing
- Photocopy texture
- Tape/contact-sheet framing
- VCR metadata rendered in code

## Current Assets

### Onboarding

- `public/onboarding/etched-group.png`
  - Personal etched group image.
  - Used as the first rotating memory still.

- `public/onboarding/vhs-frame-overlay.png`
  - Original exported frame overlay.
  - Preserved as source/reference.

- `public/onboarding/vhs-frame-overlay-cropped.png`
  - Cropped transparent frame used by the app.
  - Includes frame, tape, and `REC`.
  - Does not include timestamp.

### Fonts

- `public/fonts/vcr-osd-mono/VCR_OSD_MONO.woff`
- `public/fonts/vcr-osd-mono/VCR_OSD_MONO.ttf`

These are wired in `src/fonts.css` as `VCR OSD Mono`.

## Frame Overlay Rules

The tape frame should be an image overlay, not a CSS imitation.

The overlay should include:

- Worn white/black photocopied frame
- Tape strip
- `REC` label and red dot
- Transparent outer background
- Transparent or semi-transparent inner window

The overlay should not include:

- Timestamp
- People/photo content
- Page background
- Extra text

Dynamic values belong in React:

- Timestamp
- Active image
- Future playback labels

## Rotating Memory Images

Each rotating still should be represented as:

```js
{ src: "/path/to/image.png", timestamp: "00:00:07" }
```

Keep timestamps curated. They are not real video durations; they are archive marks.

Good timestamp style:

- `00:00:07`
- `00:00:12`
- `00:00:19`
- `00:00:26`

## Generating New Frame Assets

Prompt:

```text
Create a standalone empty VHS/photo memory frame asset for a personal portfolio onboarding page.

Style:
- etched / photocopied / zine / pen-ink memory
- black ink on transparent-looking paper
- imperfect hand-printed border
- old taped contact-sheet / VHS still frame
- quiet analog archive feeling
- tiny muted red REC dot with black "REC" text in the top-left
- small piece of translucent masking tape at the top
- subtle photocopy scratches, grain, ink skips, and worn edges

Important:
- The center area must be empty/transparent so an image can sit behind it.
- Do not include any photo or people inside.
- Do not include a paper background beyond the frame itself.
- Do not make it a full webpage mockup.
- Do not add a timestamp.
- Do not add extra text besides "REC".
- No neon, no gradients, no glossy UI, no colorful retro design.
- Make it usable as an overlay asset on a website.

Composition:
- landscape rectangular frame
- generous inner transparent window
- border should look photocopied and imperfect
- output should be isolated on a flat bright green chroma-key background (#00ff00) or native transparency
```

If the result has a green background, remove it and save a transparent PNG. If it already has alpha, preserve the alpha.

## Generating New Icon Assets

Prompt:

```text
Create a navigation icon set for a quiet VHS zine archive personal website.

Style:
- etched / photocopied / pen-ink linework
- black ink
- transparent background
- old camcorder/VHS manual symbols
- simple enough to read at 32px
- imperfect but not messy

Icons:
- VHS cassette
- camcorder
- play triangle
- folder/tape case
- timestamp note
- contact sheet
- signal waves
- REC dot
- battery
- subtitle box
- archive box
- tracking/random arrows

Constraints:
- no colorful app icons
- no neon
- no glossy gradients
- no text labels except unavoidable tiny symbol marks
- keep each icon isolated with consistent visual weight
```

## File Naming

Use descriptive lowercase filenames:

- `vhs-frame-overlay-cropped.png`
- `icon-vhs-tape.png`
- `icon-contact-sheet.png`
- `memory-group-etched.png`

Avoid spaces in project asset filenames.

## Processing Notes

- Use PNG for transparent overlays.
- Use JPG/WebP for large photographic stills when transparency is not needed.
- Keep generated source variants if they may be useful later.
- Do not overwrite selected assets without a reason. Add `-v2`, `-cropped`, or `-source`.
