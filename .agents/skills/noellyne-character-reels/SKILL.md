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

Every pose carries the Altraware logo on the chest patch. It is **baked into the base PNG**, not drawn per frame.

`build-logo.py` does it: wipe the patch to knit colour, multiply-blend the mark, write the new base. `assets/altraware.png` is 256×256 RGBA.

The badge rectangle is per-pose and **measured by eye**, hard-coded in `BADGES`:

| pose | x0,y0,x1,y1 |
| --- | --- |
| wave | 541,707,599,739 |
| point | 541,707,599,738 |
| desk | 598,658,656,690 |
| phone | 552,712,610,744 |
| cheer | 556,648,612,680 |
| ok | 548,676,606,706 |
| peace | 566,640,622,672 |
| pray | 541,707,599,739 |
| thumbsup | 541,706,599,738 |

**Do not try to find the badge by colour.** Every threshold that clears the knit also catches the sleeve badge, the hood edge or the background. On five poses a blob search painted a blue rectangle across her shoulders. Measure the rectangle once, in `.cache/badgegrid.png` (3×3 grid crops at 25 px), and write the numbers down.

Two traps:

- `desk` and `phone` have **two** pale rectangles — chest and sleeve. The sleeve one is not the badge.
- After baking, set `mark: null` in `host-rig.json` so nothing draws a second copy. But `build-poses-generated.py` chokes on `mark: null` (`NoneType is not iterable`), so restore `mark: [546,711,41,24]` before regenerating poses, and re-run `build-logo.py` after.

`logo-check.png` is the audit strip — all nine poses, mark visible. Regenerate and actually look at it whenever a base is rebuilt.

---

### Choosing a palette for a *second* show

If you make a second Reel, change more than the words, or the audience reads it as the same video twice. In `ship-vs-shipped` the school Reel's eggshell went to slate + mint, the product UI went to code and matrices, and she went from presenter-scale to margin-scale. Same character, same rig, different show.

And do not let the "dark editorial" instinct take the plate to near-black. On the first pass the tint was `#0b1522` at 10 % photo and the set read as a void with dust in it — the flat-background complaint again, only darker. `#152536` at 26 % photo kept the night mood and the classroom.

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

The rule that fixed it in `ship-vs-shipped`:

- The **artifact** (code pane, matrix, trace, counter) owns a band, usually `y 600–920` or `y 760–1060`.
- **She** owns a column on the side, or the band below the artifact. Never both in the same rectangle.
- Keep all text above `y ≈ 1422` (the caption pill sits at 1440).
- Write the positions as a `POS` table at the top of the renderer, one line per scene, so a collision is one number away from a fix.

Then check at 100 %: caption pill clear, no text over the face, no bar over a hand, nothing outside the safe box.

---

## 2 · Lip sync

`performerDraw` draws **no mouth unless you pass one**. Forgetting this is how a Reel shipped with a closed mouth and a moving jaw.

```sh
python3 production/noellyne-host/lipsync.py out/mix.wav out/mouth.json --fps 60
```

Then:

```js
draw(f, "review", { pose, mouth: MOUTH, x, y, w, cues, blinks, nods });
```

The track is one `[openness, visemeLetter]` per frame, analysed from the **final dry mix**. Natural speech lands around **55–65 % open frames**; far outside that means the analysis or the mix is wrong.

### Rules that were learned the hard way

- **Draw the patch at full opacity.** Partial alpha leaves the closed smile showing through the new lips and the mouth reads shut even while it animates. Pick the shape by openness; do not blend.
- **Use the kit's patches.** They are real visemes — open, round, wide, with teeth. Do not synthesize replacements: repainting the lip area smears the mouth shut, and row-shifting drags the hoop earrings and the transparent neck edge into frame as ghosting. Both were tried; both are in the git history.
- **Do not paint teeth over the opening.** A white band across a dark interior reads as a bandage at phone size, not teeth.
- **Align by the eyebrows.** The gold hoops also match lit skin (167 px error), the lens purple also matches the denim hoodie, and the eye whites also match the teeth. Brows are the only feature that is unambiguously dark, central, and stable — measured spread under 30 px across all nine poses.

---

## 3 · Frame contract

- 1080 × 1920, **60 fps** CFR, H.264 yuv420p, AAC 48 kHz.
- Everything derives from `frame`. Random seek must equal sequential render. No `Math.random`, no wall clock, no CSS transition.
- Critical type inside `x 78..943, y 354..1422`. Keep clear of the caption band `y 1616..1700` and the platform UI below it.
- Build the audio first (`mix.py` → `timeline.json`), then render against those spans.
- One focus at a time; a real change every 2–3 s; no two near-identical cuts.

---

## 4 · Composition

### She and the artifact take turns

- **Beats with real UI**: she stands in the **right third** (`x 560–590`, `w 600–640`); the screenshot owns the left two-thirds. They must not overlap. Overlapping was the last visible defect.
- **Address-only beats** (hook, offer): centred and large, `x 54, y 560, w 900`.
- Her rig is **half-body**. Put a short gradient the exact colour of the page from `y + w * 0.98` downward, or the cut across her body reads as pasted-on.
- Add a **ground shadow** under her so she stands in the set rather than floating on it.

### Sets must move

"Background zimetulia sana" means a static wash is not a set. `production/noellyne-host/background.mjs` gives every beat a living set:

- plate **parallax** drift, plus a slow scale, across the beat
- a **light sweep** travelling once per beat
- **dust motes** rising on individual cycles
- a **vignette** so the frame has corners

Vary `photo` (0.14–0.62) and the tint per beat so eight beats read as eight places. Never one flat gradient for the whole Reel.

### Proof, not decoration

Show the **real screenshots** from the pinned capture (`Inputs/proof/*.png`, commit in `Capture-Proof.json`). A drawn grid standing in for a timetable proves nothing. Say on screen what is a sample — the Form 2 / Stream A / Monday 08:00 / Biology row is a locally created sample, not a client's timetable. No student names, marks, fees or records.

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

- **School Reel** — `production/shule-altra-reel/`, warm, presenter-led, 8 poses, 36.82 s.
- **Tech Reel** — `production/ship-vs-shipped/`, slate + mint, artifact-led, 31.22 s.


`production/shule-altra-reel/` — eight beats, pose rotation, measured lip sync, real proof crops, living sets.
`production/noellyne-host/README.md` — the rig API and recovery path.
`.agents/skills/tech-video-motion-graphics/SKILL.md` — the renderer contract this inherits.
