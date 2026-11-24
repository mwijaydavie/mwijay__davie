# Noellyne — Tech Bila Hype · EP.1: MAANDISHI HAYASOMEKI

Reference: `google_drive/From Klickpin.com- 924363892282992611-pin-id-924363892282992611.mp4`
(720×1280, 30 fps, 19.11 s, Pinterest re-pin of a motion-design studio's self-promo).
Chosen because its palette (violet + cream + ink, halftone grids, starburst corner spikes,
big serif display type) is our Altraware palette, and its motion grammar is the missing
piece for kinetic captions in this repo.

## Fidelity

**mixed** — the *technique* is cloned motion-faithful; the *content* is entirely ours.

| Cloned (motion-faithful) | Ours (additions) |
|---|---|
| Word-by-word slam-in of display serif lines | All copy (Kiswahili, proofed) |
| Pill banner pop-in over a "hero" subject | Noellyne rig plates (present/wave/point/thumbsup) + breathing + blinks |
| Halftone dot grid atmosphere | Altraware tokens (cream #FBF7EF, sand #F4E3C4, violet #5B3FB5, ink #1D2A33, gold #F2C66D), Fraunces/Inter/JetBrains Mono |
| Starburst corner spikes on violet beats | SFX-only audio (no music, no VO — there is no cleared track or recorded take for this script) |
| Hard cuts + white flash between beats | End-card with Altraware logo draw + `altra.tanzaniareach.com` typeout |
| "KANUNI 01/02/03" mono section labels | The actual three caption rules (Kifungu 1: neno moja kubwa · 2: rangi mbili · 3: anza na swali) |

**Not cloned:** the reference's 3D brain, the 3D eyeball, the retro TV, the slipping-man
illustration, the Nike/McDonald's imagery, the studio wordmark. None of those appear,
get redrawn, or get traced. Motion and layout only. Sources of those assets are unknown;
Pinterest/Klickpin re-pins are not a licence.

## Beat map (60 fps, 1080×1920, T = 1320 frames = 22.0 s)

| Beat | Frames | Seconds | On screen | Technique cloned |
|---|---|---|---|---|
| B1 hook | 0–131 | 0:00.0–0:02.2 | Cream + halftone; Noellyne (present) rises; violet pill "TECH BILA HYPE — EP.1"; Fraunces "MAANDISHI / HAYASOMEKI." | pill pop + slam-in lines + spring rise (ref 0:00–0:02.7) |
| B2 problem | 132–341 | 0:02.2–0:05.7 | Ink slab; mono "KWA NINI?" types; wall of 9 unreadable caption lines rises staggered; red ✗ slashes; mono "watu hawasomi mistari ndogo ndogo." | list-climb + stamp-slash (ref 0:02.7–0:06 "SOME BRANDS" grid → replaced by type wall) |
| flash | 334–341 | — | White flash + whip | card-swap flash (ref 0:06 cut) |
| B3 rule 1 | 342–563 | 0:05.7–0:09.4 | Cream; mono "KANUNI 01"; Fraunces italic violet "NENO MOJA." → ink "KUBWA."; gold stamp "WEBSITE" −6°; violet underline grows | stamp + slam pair (ref 0:06–0:09.5 "stick in your mind?") |
| B4 rule 2 | 564–785 | 0:09.4–0:13.1 | Sand; mono "KANUNI 02"; Fraunces "RANGI / MBILI / TU." word-stagger; two swatch dots (VIOLET / CREAM) spring in; Noellyne (point) slides in; mono kicker | word-stagger + dichromatic swatches (ref 0:09.5–0:13 "Motion Design" words + eye close-up → simplified) |
| B5 rule 3 | 786–1007 | 0:13.1–0:16.8 | Violet; white starbursts 2 corners; mono "KANUNI 03"; Fraunces italic cream "ANZA NA / SWALI."; cream card slam "UNATAKA WEBSITE?" with blink; Noellyne (thumbsup) rises; mono kicker | slam pair + card pop on saturated field (ref 0:13–0:15.5 "Motion brings" → rebuilt as violet beat) |
| B6 outro | 1008–1320 | 0:16.8–0:22.0 | Cream; Noellyne (wave) right; logo stroke draws itself; mono "TECH BILA HYPE · EP.1"; Fraunces "HIYO NDIYO." + italic violet "UFUATE."; mono "Tips fupi. Bila hype."; typeout "altra.tanzaniareach.com▌"; chime; 6-frame cut to black | logo draw + typeout + resolve (ref 0:15.5–0:19 "Feelings to your Story" TV era, replaced by brand end-card) |

## SFX only (48 kHz stereo, synthesized — no licensed music in this repo)

pop @ f16 · thump @ f40, f52 · tick @ f138 · wall rise (soft ticks f172–f264) · stamp/✗ @ f262 ·
whoosh @ f335 · thump @ f372, f410 · stamp @ f444 · tick @ f566 · pop @ f652, f700 · pop + whoosh
@ f816, f830 · pop (card) @ f866 · pop @ f898 · whoosh @ f1008 · draw-sweep @ f1045 · tick @ f1090 ·
cursor ticks f1176–f1215 · chime @ f1216.

## Numbers used from the reference (measured by eye at 10 fps probe sheets)

- Entrance springs: critically-damped-ish easeOutBack (overshoot ≈ 8–12 %), 480–700 ms.
- Slam-in per word: alpha+y translate over ~8–10 frames @60 (≈ 140–170 ms), holds 2–3 s.
- Halftone dots: 10–14 px pitch, 22–30 % alpha.
- Starburst wedges: 6–8 spikes, 60–110 px, from the corner, white.
- Section-label cadence: ~3.5 s per beat; hooks land inside 1.5 s.

## Verification

Clone vs reference comparison is qualitative (our assets differ by definition): stills at
every beat boundary were grouped into sheets and checked for layout, safe-box and pacing.
Two real defects were caught and fixed: (1) the B1 display lines overflowed the right edge —
fixed with `fitSize()`; (2) `measure()` was called without a context — replaced by an
internal scratch context. Code path is deterministic (frame-driven); `out/` holds the
encode and `mix.wav`; stills in `proof/`; frames are not committed (rebuild from `render.mjs`).
