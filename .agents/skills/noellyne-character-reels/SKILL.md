---
name: noellyne-character-reels
description: Build Altraware Reels with Noellyne, the approved host, performing on screen — nine poses, ten gestures, measured lip sync, living sets. Use for any request mentioning Noellyne, "the character", a talking host, a news-presenter read, or the gesture list (🤚 ✋ 🖐 🤌 👌 ✌ 🫵 👍 🙏 🫶).
---

# Noellyne character Reels

A Reel shipped nine times with the same three faults: Noellyne was a crop of old footage, her mouth did not move, and the same raised hand was on screen for the whole cut. Every review note — "why unachukua video ya zamani", "mdomo umekuwa shut", "make character move the hands", "background zimetulia sana" — points at one of them.

This skill is the working answer. Read it before touching a render.

---

## 1 · The rig

`production/noellyne-host/`. It is in Git on purpose. It was once kept only in a gitignored folder, a sandbox reset deleted it, and every later attempt silently fell back to crops. Never move it, never regenerate the character.

### Two kinds of pose

| Kind | Poses | Arm | How it moves |
| --- | --- | --- | --- |
| **Layered** | `wave`, `point` | separate PNG, pivot at the aligned cuff | real rotation, drives the gesture styles |
| **Full-figure** | `desk`, `phone`, `cheer`, `ok`, `peace`, `pray`, `thumbsup` | baked into the base render | no arm motion; the pose itself is the gesture |

Layered poses take **gesture styles**. Full-figure poses ignore them — a cue on `desk` does nothing. That is not a bug, it is the price of a baked render.

### Gesture styles (layered poses only)

| Style | Motion | Frames | Pose |
| --- | --- | --- | --- |
| `wave` | three swings, then settle | 62 | wave |
| `present` | open palm, slow reveal | 88 | wave |
| `point` | index up, held | 96 | point |
| `aim` | small repeated aim | 68 | point |
| `accent` | quick downward accent | 42 | wave |

### The Altraware mark on the hoodie

Every pose carries the Altraware mark on the chest badge. It is **baked into the base PNG**, not drawn per frame. `build-logo.py` does it.

**This took three attempts, and the first two were wrong in ways that shipped.**

Attempt 1 — find the badge by colour. A pale rectangle on pale denim, beside a pale sleeve badge and a pale hood edge, is not a colour problem. Thresholds that cleared the knit caught the shoulder, and five poses got a blue rectangle painted across them.

Attempt 2 — wipe the badge back to "knit" and paste a print on it. This replaces a real printed patch with a flat lilac card. It reads as a sticker at 100 % and leaves a hard rectangle across her chest.

**What works:** keep the patch exactly as rendered, and multiply the mark into it at the badge's own aspect ratio.

```python
mh = int(h * 0.94); mw = int(MARK.width * (mh / MARK.height))
alpha = mk[..., 3:4] / 255 * 0.97
region = base[my:my+mh, mx:mx+mw, :3]
base[my:my+mh, mx:mx+mw, :3] = region*(1-alpha) + region*(mk[...,:3]/255)*alpha
```

Then two touches, both needed:
- patch `* 0.86` — the badge renders cream, which reads as white paper at full res
- borrow knit luminance from below the patch and re-apply it at ~20 % over the print, so the mark sits in the fabric

**Finding the badge rectangle.** Flood-fill, not thresholds: `pale = lum > 196 & sat < 48`, take the largest connected blob near the chest. Measured on the clean bases:

| pose | x0,y0,x1,y1 |
| --- | --- |
| wave | 542,709,598,737 |
| point | 542,709,598,737 |
| desk | 542,721,592,744 |
| phone | 552,720,608,749 |
| cheer | 557,652,608,676 |
| ok | 550,679,603,705 |
| peace | 568,644,618,669 |
| pray | 541,709,597,736 |
| thumbsup | 541,709,597,737 |

The hand-typed boxes this replaced were wrong on `desk` by 56 px in x and 63 px in y — onto a *different patch*.

Two traps:

- `desk` and `phone` have a second pale rectangle on the sleeve. Largest-blob-near-chest handles it; "all pale pixels" does not.
- After baking, `mark: null` in `host-rig.json` so nothing draws twice. But `build-poses-generated.py` chokes on `mark: null`, so restore `mark: [546,711,41,24]` before regenerating poses and re-run `build-logo.py` after.

**Always re-run from clean bases.** `git checkout HEAD -- production/noellyne-host/assets/` first. Running `build-logo.py` on already-baked bases compounds; that is where the three-marks-on-`desk` frames came from.

**Verify the base, not the strip.** `logo-check.png` crops from `p["badge"]`, so it will happily show a clean patch while the mark sits somewhere else. Open the real bases at 100 % and confirm one patch, one mark.

---

### The nine poses, and what each one is for

| Pose | Reads as | Use on |
| --- | --- | --- |
| `wave` | 🤚 greeting, palm out | hook, offer |
| `point` | 🫵 this one, here | UI callouts, CTA |
| `desk` | ✋ arms down, news-anchor calm | explanation, close |
| `phone` | holding the phone | "unaiona kwenye simu" |
| `cheer` | 🙌 both palms up | celebration, launch |
| `ok` | 👌 that's right | approval, confirmation |
| `peace` | ✌ two | numbering "mbili", casual |
| `pray` | 🙏 thank you, please | gratitude, request |
| `thumbsup` | 👍 good, done | agreement, sign-off |

**Never the same pose on consecutive beats. Never three beats in a row on one pose.** This single rule is most of the difference between a character and a still.

### How the seven full-figure poses were made

`build-poses-generated.py`. They are AI renders generated **from Noellyne's own approved render as the reference image**, then keyed off the grey card, fitted by head width, and registered onto the shared 939×1136 canvas. They are her design, derived from her art — not a redrawn character and not a crop of old footage. Say so if asked.

Generation prompt pattern that worked (keep it this flat, or the face drifts):

> Keep this exact 3D cartoon character identical: same face, same big round double-bun afro, same purple-tinted round sunglasses on top of the head, same gold hoop earrings, same blue hoodie with navy trim, same freckles. Change ONLY her pose: <one sentence>. Plain solid mid-grey background. Full torso, waist up, centred, front view, even soft studio lighting, high quality 3D render.

Re-run `build-visemes.py` after adding a pose — a new pose's mouth patches must be pointed at the **wave** patches, because mouth patches cut from a closed smile cannot open.

### Layout: she and the artifact never share a column

The failure that recurs in every new episode: the text block runs straight through her hoodie, or a CTA bar lands across a raised hand. It is invisible in a downscaled sheet and obvious at 100 %.

"Put her on the left, the artifact on the right" does **not** work. Her box is ~340 px and her arms swing outside it; the matrix still landed across her face at 100 %.

What actually holds, and what `ship-vs-shipped` now enforces:

- **One horizontal cut line.** Everything textual — artifact, labels, counters, footer — lives above `y = 1090`. She lives below it. Drawn as `SHE_TOP` in the renderer.
- The only exception is the CTA, where she *is* the subject and the bar sits above her.
- Caption pill at 1616. Keep the artifact above 1090 and both fit.
- Write it as a `POS` table, one line per scene, so a collision is one number away from a fix.

If a beat needs her beside an artifact, shrink the artifact to one column and give her the other — do not eyeball an overlap and hope

Then check at 100 %: caption pill clear, no text over the face, no bar over a hand, nothing outside the safe box.

---

## 2 · Lip sync

### The kit's visemes are a lie — do not use them on the newer poses

The kit ships eight mouth patches and they look like a viseme set. They are not: **all eight are the same painted grin**, with no teeth and no mouth interior. Measured: 0–18 pixels brighter than 190 in every one of them.

Pasting one onto `cheer` or `peace` puts a painted smile on her **chin**, because:
- the patch is 132×71 but her actual lips are ~200×47, so the patch is the wrong shape entirely
- her head sits at a different place in each pose, and the rig's automatic mouth-finder locks onto the wrong dark region on a pose that already has an open mouth
- `WAVE_CENTRE = (494, 363)` in `build-visemes.py` was not the mouth at all — it was up at the brows. Every non-wave patch was placed ~89 px too low.

That is the "mdomo unaoongea unachekesha" report. It shipped twice before it was caught, because a contact sheet at 300 px wide hides it and a 100 % crop does not.

### What works: ask the model for the mouth, three levels

For each pose, render **three** images from that pose's own base, changing *only* the mouth:

| level | prompt phrase | use |
| --- | --- | --- |
| `closed` | (just use the base) | silence, and the gaps between words |
| `mid` | "slightly open, mid-syllable, lips barely apart showing a small sliver of upper teeth, as if saying eh" | most syllables |
| `open` | "open in a natural talking shape, upper teeth visible, dark mouth interior, lips parted as if mid-word ah" | stressed vowels |

Always list everything that must **not** change: face, eyes and gaze, bun afro, sunglasses position, hoop earrings, hoodie, freckles, skin tone, lighting, the exact pose of the arms. The model holds all of it and changes only the mouth; the diff confirms it.

`build-ai-visemes.py` then:
1. keys the white background back to the base's own alpha
2. cuts a **soft ellipse** around the lips (never a rectangle — an ellipse edge is the whole difference between a mouth and a sticker)
3. writes `assets/<pose>-ai-<level>.png` and a rig `ai` block with cx/cy

`host.mjs` picks the level from openness (`<0.42` → mid, else open) and only falls back to the kit patches for poses that have no AI levels yet.

**Verify at 100 %.** Crop 110×100 around the mouth on a real rendered frame and look. A correct result shows her own teeth and her own lip shape at every level. A wrong one shows a rectangle, a second mouth, or a smile on her chin.

## 3 · Frame contract

- 1080 × 1920, **60 fps** CFR, H.264 yuv420p, AAC 48 kHz.
- Everything derives from `frame`. Random seek must equal sequential render. No `Math.random`, no wall clock, no CSS transition.
- **`smooth(a, b, f)` normalises inside itself.** Pass absolute terms and the
  beat's local time — `smooth(6, 34, a[0])`. Writing
  `smooth(a[0] + 6, a[0] + 34, f)` looks like an entrance animation and is
  actually a constant: the value only depends on `start`, so the whole beat
  renders at whatever that one number is. This shipped twice — every card in
  the Shule Reel sat at 0.18 alpha and read as a ghost, and the tech Reel's
  hook sat at 0.03. Grep both files for `a[0] +` before rendering.
- **Animation hides layout bugs.** A still pulled from an entrance ramp shows
  the card faded, not broken; a still from the middle shows the collision. Pull
  stills at 40–70 % through each span, and add `--stills=id:frame` to the
  renderer so QA never needs the encoder.

- Critical type inside `x 78..943, y 354..1422`. Keep clear of the caption band `y 1616..1700` and the platform UI below it.
- Build the audio first (`mix.py` → `timeline.json`), then render against those spans.
- One focus at a time; a real change every 2–3 s; no two near-identical cuts.

---

## 4 · Composition

### One band, then her

The rule that finally killed the "empty space kubwa sana" note — the layout was
rebuilding itself beat to beat, so some beats had a short card and 300 px of
nothing under it. Do not repeat that.

- **Every artifact lives in one band**: `x 84 → 996`, `y 452 → 900`. Eight
  beats, eight cards, the same box. Nothing floats outside it, nothing is
  shorter than it.
- **She starts below it**: `y 862–918`, `w 550–665`, `x 290–560`. Her hair
  overlaps the card's bottom edge by ~30 px so the two are one composition,
  not two pictures stacked.
- **Inside the card, one internal grammar**: a real screenshot on the left, the
  sentence that names it on the right. Same on every beat, so the eye lands in
  the same place each time and the beat reads before it is spoken.
- **She never covers the card.** Move her, not the card. If a raised hand
  touches it (the CTA `cheer` pose did), shift her down and inward — never
  shrink the card to dodge her.
- **Fill the card.** A card that is 60 % white space with one 40 px strip in it
  is the same defect in miniature. Each beat's artifact should reach at least
  two thirds of the card's height; the timetable beat stacks selectors *and*
  the printed grid for exactly this reason.
### The half-body problem: give her a desk

Her rig stops across the hoodie. A gradient fade hides the cut but leaves her
floating, and the note that comes back is **"hana legs"** — which is correct, she
does not. Do not fix this with a fade.

Fix it with **set furniture in front of her**, drawn in two passes:

1. `drawDeskBack` — the whole console plate, BEFORE her: monitors, the back of
   the surface, the room. Her head and shoulders sit in front of this.
2. `drawDeskFront` — only the surface from the lip downward, AFTER her. This is
   what crops her at the waist, the way a news desk crops a presenter.

The order is the whole trick. Desk drawn once in front buries her; desk drawn
once behind leaves her in mid-air. A 26 px shadow gradient at the lip line sells
the contact. A ~14 % hem feather is still worth doing, but as a feather, not as
a cover-up.

Geometry in plate terms, so the surface lands where you ask: the console plate's
surface occupies rows `0.52 → 0.735` and its apron runs `0.735 → 1.0`. Scale the
plate to `W * 1.26` so its own side edges never show, then `surfaceY` on screen
is the only number to tune. Waist height lands around `y 1420–1470` at her
`w 600`.

### Layer the frame, or it is a text box on a plate

One card on one photo is flat no matter how good the photo is. Four cheap layers
turn it into a built set, and none of them touch her face:

- **paper cutouts** — small sheets at 6–10°, torn bottom edge (deterministic
  zigzag from `hash()`), a rule or two of fake handwriting. Pin them on the
  desk surface and in the outer margins. **Never in the band, never at head
  height** — a sheet over her mouth is worse than a plain frame.
- **a technical frame** — corner brackets and a scale-tick row around the
  artifact band. Engineering, not garnish. Skip the text label: at `y 440` it
  collides with the headline.
- **one travelling pulse** on the desk lip, colour-matched to the beat's accent
  (mint = fix, red = bug, amber = time). One moving element that *means*
  something beats everything drifting equally.
- **a key light** behind her head, `globalCompositeOperation = "lighter"`, so a
  dark hoodie on a dark room is not one silhouette.

Stagger every arrival: 20–80 frames between sheets. Staggering is most of what
"motion graphics" means at this scale.

- Add a **ground shadow** under her so she stands in the set rather than
  floating on it.

### Sets must move

"Background zimetulia sana" means a static wash is not a set. `production/noellyne-host/background.mjs` gives every beat a living set:

- plate **parallax** drift, plus a slow scale, across the beat
- a **light sweep** travelling once per beat
- **dust motes** rising on individual cycles
- a **vignette** so the frame has corners

Vary `photo` (0.14–0.62) and the tint per beat so eight beats read as eight places. Never one flat gradient for the whole Reel.

### Proof, not decoration

Show the **real screenshots** from the pinned capture (`production/shule-altra-reel/proof/*.png`, commit in `Capture-Proof.json` — 256 KB, in the repo, because `.cache/` is wiped on every reset and a missing proof file hard-fails the renderer). A drawn grid standing in for a timetable proves nothing. Say on screen what is a sample — the Form 2 / Stream A / Monday 08:00 / Biology row is a locally created sample, not a client's timetable. No student names, marks, fees or records.

### A strip is not a screenshot

`week.png` is 2172 × 98 with a half-cut "Period saved" toast in it. Scaled to
card width it is a hairline that reads as a rendering bug. Crop the real grid
instead: `slice(c, IMG.pdfWeek, 0, 0, 1915, 400, x, y, w)` pastes the header and
the first three periods at true aspect, and that is legible. Before placing any
proof image, check its pixel dimensions — anything under ~1:0.15 is a strip.

---

## 5 · Script and voice

- Swanglish, short takes, one idea each, written to be read aloud line by line. English as a separate sidecar, never burned in alongside.
- Owner records by default. A TTS review cut is labelled as a scratch take in the README, with `copy.json` as the record of the exact words.
- One voice, one bed. SFX where something actually changes — not a hit on every word.
- **News-presenter register** works well for the explanation beats: `desk` pose, slower gesture, camera still, longer hold. Put the fast cuts on the hook and the CTA, not in the middle.

---

## 6 · Check before delivering

Render `--proof=N` first and look at real frames. Then on the full render:

1. **Full-res 100 % crops of the face**, four or more spread across the Reel. A downscaled contact sheet will happily hide a mouth that never opens — this is the step that was skipped most often, and every one of the three big faults survived it.
2. Pose sequence: no repeats on consecutive beats, no triple.
3. UI legibility at 360 px wide.
4. Caption band clear; nothing under the platform controls.
5. `ffmpeg -f null -` decodes clean; duration, fps, pix_fmt, audio rate match the contract.
6. New filename per cut. Never overwrite a delivered file. Give the Drive `web_view_link` every time.

---

## 7 · Never

- Never use `Noellyne-Intro-SW.mp4` or any old Reel as the base.
- Never claim the character was kept when the render shows a crop.
- Never call her "Tech Pulse TZ". She is the Altraware host.
- Never post, schedule or DM. Deliver a review link and stop.
- Never state a result, adoption figure or performance claim that is not in the proof capture.
- Never add a pose without re-running `build-visemes.py`.

---

## Reference implementations

- **School Reel v4** — `production/shule-altra-reel/`, warm, presenter-led, 8 poses, 36.82 s. Drive `1enQsK9DTYzS5KLTEtCtg_T0Sywva-hEC`.
- **Tech Reel v2** — `production/ship-vs-shipped/`, slate + mint, artifact-led, 31.22 s. Drive `171qu6xo0uD111vuHk9UViq9GTBKbXGUS`.


`production/shule-altra-reel/` — eight beats, pose rotation, measured lip sync, real proof crops, living sets.
`production/noellyne-host/README.md` — the rig API and recovery path.
`.agents/skills/tech-video-motion-graphics/SKILL.md` — the renderer contract this inherits.
