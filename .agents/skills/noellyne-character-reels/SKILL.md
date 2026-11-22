---
name: noellyne-character-reels
description: Build an Altraware Reel with Noellyne, the approved female character, actually performing on screen — gestures, lip sync, blinks, pose changes — instead of cutting rectangles out of old footage. Use for any request that mentions Noellyne, "the character", a talking host, or the emoji gesture list (🤚 ✋ 🖐 🤌 👌 ✌ 🫵 👍 🙏 🫶).
---

# Noellyne character Reels

The delivery problem this skill exists to prevent is specific and it has happened nine times: a Reel is shipped in which Noellyne is a crop of the old intro video, the mouth does not move, and the same raised hand is on screen for forty seconds. The owner's notes — "why unachukua video ya zamani", "mdomo umekuwa shut tu", "make character move the hands" — are all the same complaint. This skill is the answer.

**The character is drawn, not cropped.** Her rig is `production/noellyne-host/`. If you are about to composite old footage, stop and read that README instead.

## 1 · The rig, and what it can and cannot do

`production/noellyne-host/` is checked into Git on purpose. It was previously kept only in a gitignored folder, a sandbox reset deleted it, and every later attempt silently fell back to crops. Never move it, never regenerate the character.

| Pose | Arms | Use for |
| --- | --- | --- |
| `wave` | separate hand layer, pivot at the cuff | greetings, open-palm present, accents |
| `point` | separate hand layer, pivot at the cuff | pointing at UI, "this one here" |
| `desk` | hands clasped at the waist, baked in | listening, explaining calmly, CTA |
| `phone` | phone up beside her face, baked in | "unaiona kwenye simu", app open |

There are exactly **four** poses. Anything else you write in a plan is a lie and will throw.

`wave` and `point` accept **gesture styles** on the arm. `desk` and `phone` do not — their arms are baked into the base render, so a cue on them does nothing.

| Style | Motion | Frames | Pairs with |
| --- | --- | --- | --- |
| `wave` | three swings then a settle | 62 | `wave` |
| `present` | open palm, slow reveal | 88 | `wave` |
| `point` | index up, held | 96 | `point` |
| `aim` | small repeated aim | 68 | `point` |
| `accent` | quick downward accent | 42 | `wave` |

**Rule: never the same pose on two consecutive beats, and never the same pose on more than two beats in a row.** That single constraint is most of the difference between "a character" and "a still image of a character".

## 2 · Lip sync is not optional and it is measured

`performerDraw` draws no mouth unless you pass one. Forgetting that is exactly how a Reel ships with a closed mouth and a moving jawline.

```sh
python3 production/noellyne-host/lipsync.py out/mix.wav out/mouth.json --fps 60
```

Then `performerDraw(...)(f, "review", { mouth: MOUTH })`. The track is one `[openness, visemeLetter]` per frame, analysed from the **final dry mix**, not from a script or a timer. Expect roughly 55–65 % of frames open on natural speech; far outside that range means the analysis or the mix is wrong.

The kit's eight patches per pose are real visemes (open, round, wide, closed). The renderer cross-fades neighbours by openness with a fast alpha ramp — a slow ramp leaves the closed smile showing through the lower lip and the mouth reads as shut even while it animates.

Do not synthesise new viseme patches with image warping. Two attempts are recorded in `build-mouth.py`'s git history and both failed visibly: repainting smears the mouth shut, and row-shifting drags the earrings and the transparent neck edge into view as ghosting. The kit patches already work once they are actually drawn.

## 3 · Frame contract

- 1080 × 1920, **60 fps** CFR, H.264 yuv420p, AAC 48 kHz. Everything derives from `frame`; a random seek must equal a sequential render.
- Keep critical type inside `x 78..943, y 354..1422`, and keep it clear of the caption band at `y 1616..1700` and the Instagram UI at the very bottom.
- Mouth, blinks and gestures all read from the same frame index as the audio. Build the audio first (`mix.py`), write `timeline.json`, then render against those spans.
- One visual focus at a time. A real change every 2–3 s. No two near-identical cuts.

## 4 · Composition: she and the artifact take turns

This is the second-biggest failure mode after the closed mouth. Centring her on every beat makes eight different screenshots look like one card repeated.

- **Beats with real UI** (timetable, modules, PDF): she stands in the **right third**, roughly `x 560–590`, width `w 600–640`, and the screenshot owns the left two-thirds. They must not overlap.
- **Beats that are pure address** (hook, offer): she is centred and large, `x 54, y 560, w 900`.
- Her rig is **half-body**: the PNG ends across the hoodie. Put a short gradient, the exact colour of the page, from `y + w * 0.98` downward, or the cut across her body reads as pasted-on.
- Every beat needs a different set. Never a flat gradient; a plate photo at 15–60 % under a tinted wash is enough depth.

## 5 · Proof, not decoration

When the Reel is about a real product, show the **actual screenshots** from the pinned capture (`Inputs/proof/*.png` in the Owner Kit, commit recorded in `Capture-Proof.json`). Drawing a neat little grid to stand in for a timetable proves nothing and the owner will say so.

Say on screen what is a sample. The Form 2 / Stream A / Monday 08:00 / Biology row is a locally created sample, not a client's real timetable. No student names, marks, fees or records ever appear.

## 6 · Script and voice

- Swanglish, short takes, one idea each, written to be read aloud line by line. English as a separate sidecar, never burned in alongside.
- Owner records by default. If using TTS for a review cut, label it as a scratch take in the README and keep `copy.json` as the record of the exact words.
- One voice, one bed. SFX on state changes only — a bell or a tick where something actually changes, not a hit on every word.

## 7 · Check before delivering

Render `--proof=N` first and look at real frames. Then, on the full render:

1. **Full-res 100 % crops of the face**, for at least four frames spread across the Reel. A downscaled contact sheet will happily hide a mouth that never opens. This is the step that was skipped most often.
2. Pose sequence: no repeats across consecutive beats.
3. UI legibility at 360 px wide.
4. Caption band clear; nothing under the Instagram controls.
5. `ffmpeg -f null -` decodes clean; duration, fps, pix_fmt and audio rate match the contract.
6. New filename for each cut. Never overwrite a delivered file. Give the Drive `web_view_link` every time.

## 8 · Never

- Never use `Noellyne-Intro-SW.mp4` or any old Reel as the base. That is the rejected approach, not a shortcut.
- Never claim the character was kept when the render shows a crop.
- Never call her "Tech Pulse TZ". She is the Altraware host.
- Never post, schedule or DM. Deliver a review link and stop.
- Never state a result, adoption figure or performance claim that is not in the proof capture.

## Reference implementation

`production/shule-altra-reel/` — eight beats, four poses, measured lip sync, real proof crops.
`production/noellyne-host/README.md` — rig API, the four poses, the recovery path.
`.agents/skills/tech-video-motion-graphics/SKILL.md` — the renderer contract this inherits.
