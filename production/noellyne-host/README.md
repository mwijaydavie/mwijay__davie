# Noellyne host rig — the real character

**Read this before making any Noellyne video.**

## Why this directory exists

Earlier sessions built this rig inside `private-media/`, which is gitignored. The
sandbox was reset, the rig was gone, and later work fell back to cutting
rectangles out of the old `Noellyne-Intro-SW.mp4` footage and calling that "the
character". The owner rejected eight versions of that. **The rig is checked in
here so it can never happen again.**

## What is here

| file | what it is |
| --- | --- |
| `assets/host-rig.json` | every offset: pose canvases (939×1136), hand positions, pivot points, mouth and lid boxes, mark box |
| `assets/wave-base.png`, `point-base.png` | the two approved poses, RGBA, transparent |
| `assets/wave-hand.png`, `point-hand.png` | the arm as a SEPARATE layer, rotating about the aligned cuff |
| `assets/{wave,point}-mouth-{A..H}.png` | 8 visemes per pose for lip sync |
| `assets/{wave,point}-blink.png` | lid overlay |
| `assets/altraware.png` | maker mark drawn on her hoodie |
| `assets/*.ttf` | Inter, JetBrains Mono, Fraunces (OFL) |
| `host.mjs` | `loadHost()`, `performerDraw()` with the approved gesture profiles, `makeScene()` |

## Poses vs gestures — the distinction that matters

There are **exactly nine poses**: `wave`, `point` (layered arms) and `desk`,
`phone`, `cheer`, `ok`, `peace`, `pray`, `thumbsup` (full figures, arms baked). Anything else is a
*gesture style* applied to the arm of one of those poses:

| style | what it looks like | length |
| --- | --- | --- |
| `wave` | 3 horizontal swings, then settle | 62 f |
| `present` | open palm held out, slow reveal | 88 f |
| `point` | index up, held while the eye follows | 96 f |
| `aim` | small repeated aim, for marking two things | 68 f |
| `accent` | quick downward accent, no lift | 42 f |

Never write `pose: "present"` — there is no such base image. Use
`pose: "wave"` plus a `present` cue.

## Usage

```js
import { loadFonts, loadHost, performerDraw, makeScene } from "../noellyne-host/host.mjs";
const host = await loadHost();
const draw = performerDraw(ctx, host, 60);
draw(frame, "review", { pose: "wave", x: 54, y: 560, w: 900,
  cues: [{ kind: "wave", start: 20, len: 62 }], blinks: [46, 156] });
```

`w` sets her width in pixels; the rig scales from 939 px. `y + w * 0.98` is
roughly where her body ends — use that for any gradient that settles her into
the set, otherwise the half-body PNG cuts a hard horizontal line through her.

## The two extra poses, and where they came from

`wave` and `point` were the only poses in the Shule Altra kit. That is the direct
cause of every Reel repeating the same raised hand: there was nothing else to
draw. The Tech Pulse V3 kit had two more full figures on green screen —
`desk-pose.png` (hands clasped, the news-anchor read) and `phone-pose.png` (phone
up beside her face) — used there as cutaway art and never wired into the rig.

`build-poses.py` keys them off green, registers them to the same 939x1136 canvas
and derives mouth and lid patches at the same offsets. They are ADDED; the
approved poses are untouched. Re-run only if you have the source art:

```sh
PYTHONPATH=.cache/rt python3 production/noellyne-host/build-poses.py \
  .cache/zips/v3/Source/private-media/tech-pulse-tz-v3/inputs/art
```

Their arms are baked into the base render, so a gesture cue has no effect on
them. Use them for listening, explaining and holding a phone; use `wave`/`point`
when the arm has to move.

## Mouth, part two

`build-visemes.py` points every pose at the **wave** mouth patches. A new pose
must be run through it: patches cut from a closed smile cannot open, which is why
the generated poses stayed mute until this existed.

The kit patches must be drawn at **full opacity**. Partial alpha leaves the closed
smile visible through the open lips and the mouth reads shut while it animates —
that is the exact failure the owner kept reporting.

Do not paint teeth over the opening. A white band across a dark interior reads as
a bandage at phone size.

## Sets

`background.mjs` builds a living set per beat: plate parallax, a light sweep, dust
motes and a vignette, all derived from `frame`. "Background zimetulia sana" is
what a static wash looks like; a set has to move.

## Mouth

`performerDraw` draws **no mouth unless you pass one**. Forgetting this is how a
Reel shipped with a closed mouth while the jaw kept moving.

```sh
python3 production/noellyne-host/lipsync.py out/mix.wav out/mouth.json --fps 60
```

That analyses the final dry mix and emits one `[openness, visemeLetter]` per
frame; the renderer cross-fades the kit patches by openness. Natural speech sits
around 55-65 % open frames. The eight patches per pose are real visemes — do not
synthesise replacements by warping, which was tried twice and failed visibly
both times.

## Provenance

Recovered from `Altraware - Shule Altra (Owner Kit).zip` →
`Inputs/host/` (the same rig as the Tech Pulse V3 kit, byte-identical).

## Recovering the original performer

If `performerDraw()` ever needs to be re-checked against the approved motion, the
verbatim original is in the Owner Kits on Drive:

- `Altraware - Shule Altra (Owner Kit).zip` → `Source/production/lims-role-workspaces/host.mjs` and `gfx.mjs`
- `Altraware-Tech-Pulse-TZ-V3-Owner-Kit.zip` → `Source/production/tech-pulse-tz-v3/`

`host.mjs` in this directory is a cleaned-up port of that performer, with the
same gesture profiles and the same cue timing.
