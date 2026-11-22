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

There are **exactly two poses**: `wave` and `point`. Anything else is a
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

## Known constraint

The rig is **half-body**. There is no hand-down pose, so beats that need her
"listening" with arms low are not possible yet. If a script needs one, either
animate a settle on the existing arm or generate a third pose — do not fake it.

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
