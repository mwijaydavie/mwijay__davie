---
name: tech-video-motion-graphics
description: Create deterministic 60 fps programmatic tech videos, Reels, code diffs, system architecture walkthroughs, kinetic type and MP4s using Remotion, Motion Canvas or a seekable HTML renderer. Use when a user wants a real project, code artifact, UI, diagram or sourced datum turned into motion.
---

# Tech video motion graphics

## 1. Brief and proof

Start with an audience, one provable claim, one hero action, an artifact/source URL and one CTA. Read the [project content playbook](../../../content/project-content-playbook.md), [strategy](../../../content/strategy.md), [project register](../../../content/projects.md) and [brand kit](https://github.com/mwijaydavie/instagram-agent-skill/blob/main/content-kit/02-brand-system.md). Lead with the software and the business action it enables. Use the product's verified palette and sector illustrations; keep Altraware's logo as the maker mark. Use a cleared screen recording, a local build with sample data, or a redacted screenshot. Mark prototypes, diagrams and simulated actions on screen. Render code, UI labels, numbers and captions as real typeset text. Generated images may illustrate a concept, never pose as a real app, client or data source.

For a reference, note shots, holds, direction of movement, type hierarchy and one memorable action. Borrow the storytelling mechanism, not the reference's copy, voice, media or characters. Get approval for the claim and one keyframe/cover before a full render if the user is still planning.

## 2. Engine, frame contract and motion

- **Remotion (default):** React/TypeScript UI, product demos and audio-led shorts. Read [llms.txt](https://www.remotion.dev/llms.txt) and pinned-version docs. Use `useCurrentFrame()` and `useVideoConfig()` for every animated value. `spring({fps, frame: frame - start, config: {damping: 14, stiffness: 120, mass: 0.8}})` is a starting point, not a preset to apply to everything. Use `interpolate(..., {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})`; constrain opacity and scale if a spring can overshoot.
- **Motion Canvas (or Revideo):** code diffs, architecture and procedural diagrams. `yield*` each timeline action; group explicit parallel work with `yield* all(...)`. Drive animation from signals and deterministic generator timing. Use `Code` with a language-aware highlighter and `selection(lines(...), duration)` to direct the eye.
- **HyperFrames/HTML:** use only when approved and the source is HTML. A paused timeline explicitly seeked by the renderer is acceptable; a live CSS transition or ticking JS state determining pixels is not. Read the CLI docs and `--help` for the pinned release before rendering.

Default **60 fps**, **1080 × 1920** for Reels or **1920 × 1080** for landscape. Define timeline intervals as `[startFrame, endFrame)`; 30 seconds = 1,800 frames. A random seek and a sequential render of the same frame must look the same. No wall clock (`Date.now()`), unseeded randomness, `setTimeout`, free-running CSS `animation`/`transition`, or `requestAnimationFrame` as a source of motion. Load pinned local assets and fonts before capture.

- **Pace:** one visual focus at a time; a meaningful change (cut, highlight, state, camera move or revealing an object) every 2–3s, at most 180 frames between beats. Use a readable hold on the action/CTA; do not fill gaps with arbitrary shake. A brand-relevant object should cause the next beat rather than a fade between unrelated slides.
- **Camera and type:** focus on the active action (roughly 1.0–1.35×) then pull back for the system view; stagger successive objects 3–5 frames. Use Inter or the actual brand display face for text and JetBrains Mono/tabular figures for metadata and counters. With no brand, use `#090D16` / `#F8FAFC` with `#38BDF8` or `#818CF8`. Brand tokens override these defaults. Keep a visible hierarchy at phone size.
- **Code:** show a 3–8-line slice, not a whole IDE. Tokenize the actual code (e.g. Shiki in Remotion, Motion Canvas Code highlighter). Keep the active lines at full opacity; dim surroundings to about 25%, with a subtle highlight behind the changed line. Reveal or edit tokens in 0.6–0.9s when the narration gets to them. Keep indentation and widths stable, and label illustrative code. Use harmless public examples and keep credentials, identifiers and real records out of frame.

## 3. Voice, captions and assets

Choose real voice or audition and approve TTS by language before generating full clips. Prefer an available Tanzanian Kiswahili voice; use generic Kiswahili if the region is unavailable, and verify pronunciation with the owner. Use separate, natural English copy. Split at phrases, assemble the final audio first, then align cues to its actual words and timestamps; adjust scene frames to fit. Keep max two lines, no overlapping/out-of-range cues, one on-screen language per version, and deliver SRT alongside any burned-in captions. Use only cleared music, effects and media; keep music below voice. Do not clone reference voices or invent footage as proof.

For the first vertical preview keep all critical text in the conservative working box `x: 80..940, y: 360..1420`; verify against current platform UI before final. Background imagery may fill bleed. Preview at about 360 px wide, muted and with sound.

**Altraware voice and visual direction:** see the [owner playbook](../../../content/creative-direction.md). Check the last two episodes before choosing the background. For stock video, verify the specific clip license and record author, source, cut/crop and consent context. Deliver an optional clean picture track plus read-aloud cue sheet for a founder VO when requested; do not use a caption-timed synthetic take as proof of human pronunciation.

## 4. Render and release gate

With a pinned Remotion project and an approved composition (replace these example paths/IDs with the actual ones):

```bash
npx remotion still src/index.ts NjombeReel out/hook.png --frame=60
npx remotion still src/index.ts NjombeReel out/cta.png --frame=-1
npx remotion render src/index.ts NjombeReel out/njombe-sw.mp4 --codec=h264 --pixel-format=yuv420p
ffprobe -v error -count_frames \
  -show_entries stream=codec_name,codec_type,width,height,r_frame_rate,avg_frame_rate,nb_read_frames,pix_fmt,duration \
  -of json out/njombe-sw.mp4
ffmpeg -v error -xerror -i out/njombe-sw.mp4 -f null -
```

Check keyframes at the hook, each transition, strongest proof and CTA. Validate dimensions, H.264/yuv420p, exactly the intended frame count at constant 60 fps, readable/cropped text, no dropped/blank transition frames, AAC voice track when expected, speech/caption sync and no clipping. Decode once end-to-end and review the output, not just the source. For Motion Canvas confirm all intended generators yield and inspect the exported MP4 with the same checks. For HyperFrames run `lint`, the release's `check` layout/runtime gate, and sampled stills before rendering. Never mark these example commands as run on a planning-only turn.

Hand off the composition source, input asset manifest/credits, dated claims, preview stills, final MP4 and captions. Keep raw/large media and secrets outside Git. Do not publish, deploy or schedule from this skill.
