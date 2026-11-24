# Noellyne — Tech Bila Hype · EP.1 v4: MAANDISHI? HAYASOMEKI.

Reference: `google_drive/From Klickpin.com- 924363892282992611-pin-id-924363892282992611.mp4`
(720×1280, 30 fps, 19.11 s, Pinterest re-pin of a motion-design studio's self-promo).
Chosen because its palette (violet + cream + ink, halftone grids, starburst corner spikes,
big serif display type) is our Altraware palette, and its motion grammar is the missing
piece for kinetic captions in this repo. (The owner re-sent the same six reference links on
2026-11-24; they are the same pins already on disk — nothing new to clone from.)

## Fidelity

**mixed** — the *technique* is cloned motion-faithful; the *content* is entirely ours.

| Cloned (motion-faithful) | Ours (additions) |
|---|---|
| Word-by-word slam-in of display serif lines | All copy (Kiswahili, proofed, VO-read) |
| Pill banner pop-in over a "hero" subject | Noellyne rig plates (wave/phone/desk/ok/point/thumbsup) + breathing + blinks + real visemes |
| Halftone dot grid atmosphere | Altraware tokens (cream #FBF7EF, sand #F4E3C4, violet #5B3FB5, ink #1D2A33, gold #F2C66D), Fraunces/Inter/JetBrains Mono |
| Starburst corner spikes on violet beats | Six Kiswahili VO takes (scratch TTS) + measured mouth track |
| Hard cuts + cream flash between beats | End-card with Altraware logo draw + `altra.tanzaniareach.com` typeout |
| "KANUNI 01/02/03" mono section labels | The actual three caption rules (Kifungu 1: neno moja kubwa · 2: rangi mbili · 3: anza na swali) |

**Not cloned:** the reference's 3D brain, the 3D eyeball, the retro TV, the slipping-man
illustration, the Nike/McDonald's imagery, the studio wordmark. None of those appear,
get redrawn, or get traced. Motion and layout only. Sources of those assets are unknown;
Pinterest/Klickpin re-pins are not a licence.

## Revision history

- **v1** — rejected by owner: hands clipped at frame edges, no voice, weak copy.
- **v2** — hands visible, Kiswahili TTS, voice-led timeline, kit viseme mouth (aperture
  re-mapped after measuring the real kit). Mouth read as a fixed smile — "haiongei".
- **v3** — masked AI mouth plates (elliptical destination-in masks over the dark-backdrop
  plates so her face didn't show a hard edge). She actually talked, but the owner rejected
  the whole delivery: the mouth looked **"kama unusual"** — not natural.
- **v4** — masked AI plates **removed from the code path entirely** (`host.mjs`). Mouth =
  kit visemes only, aperture ladder A,F,G,B,C,H,D,E with gamma **0.75**. Poses swapped for
  takes whose kit patches actually open with teeth: `problem` present→**phone**, `rule1`
  one→**desk**. Hook title renamed to owner's pick: **"MAANDISHI? HAYASOMEKI."**

## Timeline (measured from the takes, 60 fps, 2276 frames = 37.93 s)

| # | span | seconds | beat | pose |
|---|---|---|---|---|
| 1 | 10–351 | 0.17–5.85 | hook — pill, "MAANDISHI?" / "HAYASOMEKI.", kicker "UNALISOMA?" | wave |
| 2 | 384–826 | 6.40–13.77 | problem — ink slab, typed "KWA NINI?", wall of 9 bars + red slashes | phone |
| 3 | 856–1142 | 14.27–19.03 | rule 1 — "NENO MOJA." / "KUBWA.", gold stamp WEBSITE | desk |
| 4 | 1169–1493 | 19.48–24.88 | rule 2 — "RANGI / MBILI / TU.", VIOLET/CREAM swatches | ok |
| 5 | 1523–1873 | 25.38–31.22 | rule 3 — violet field, starbursts, card "UNATAKA WEBSITE?" | point |
| 6 | 1903–2186 | 31.72–36.43 | outro — logo wipe, "HIYO NDIYO." / "FUATA HIYO.", domain typeout | thumbsup |
| — | 2186–2276 | 36.43–37.93 | hold + 12-frame fade to black | — |

Lead-in 10 frames (0.17 s black) → 6-frame cream flash on every cut (`f ≥ span.start`,
not on the hook's own cut-in).

## Audio

- Voice: 6 Kiswahili takes (Ms. voice-18, `add_voice('sw')` + `generate_speech`),
  scratch review take — **owner to record the final read** (copy.json is the script of record; EN sidecar included). Takes:
  5.68 / 7.36 / 4.76 / 5.40 / 5.84 / 4.72 s.
- Bed: 62 Hz + 93 Hz + 124 Hz, slow 2-cycle swell, ≈ −26 dB under the voice.
- One soft tick per scene change (2.4/3.1 kHz, exp decay). No risers, no whooshes, no music.
- Loudness: tanh-soft clip → RMS −15.5 dBFS, peak 0.85.
- Mouth: `lipsync.py` (300–1200 Hz vowel band vs 150–3000 Hz full band, per-utterance
  normalisation) → `out/mouth.json`; 56.9 % of frames voiced (letter ≠ X, openness > 0.06).

## Pose placement (safe box, ≥ 24 px margins)

| beat | pose | w (px) | cx | left | right | bottomY |
|---|---|---|---|---|---|---|
| hook | wave | 660 | 540 | 210 | 870 | 1912 |
| problem | phone | 520 | 795 | 535 | 1055 | 1904 |
| rule1 | desk | 580 | 760 | 470 | 1050 | 1904 |
| rule2 | ok | 560 | 775 | 495 | 1055 | 1904 |
| rule3 | point | 530 | 780 | 515 | 1045 | 1904 |
| cta | thumbsup | 720 | 560 | 200 | 920 | 1914 |

## Calibration log

- `wave`, `point`: hand layers are real rig layers — they rotate at the wrist (STYLES).
- Kit viseme aperture ladder re-measured by compositing all 8 patches per face:
  **A,F closed · G,B,C smile-teeth · H wide · D,E open** (host.mjs `LADDER`, gamma **0.75**
  in v4 — was 0.7 in v2/v3 so median voiced openness lands on H, peaks reach D/E).
- **AI masked plates: rejected in v3, removed in v4.** They talked, but the elliptical
  backdrop mask read as "unusual" to the owner. `host.mjs` no longer contains the ellipse
  constant or the masked-plate path. Do not re-enable without the owner's explicit go-ahead.
- `peace` rig metadata is misaligned for this build (kit patch lands on her neck) →
  rule 2 uses **ok**. `cheer`/`pray`/`hold`: usable in principle, uncalibrated — kit fallback.
- `present`/`one` kit patches are near-identical low-aperture smiles in the source art —
  that is why rule1/problem were moved to `desk`/`phone` in v4 (real open-mouth patches with teeth).
- pose-eye lids (`{pose}-blink.png`) are used as scheduled blinks at start+44/+160/+276.

## Numbers used from the reference (measured by eye at 10 fps probe sheets)

- Entrance springs: critically-damped-ish easeOutBack (overshoot ≈ 8–12 %), 480–700 ms.
- Slam-in per word: alpha+y translate over ~8–10 frames @60 (≈ 140–170 ms), holds 2–3 s.
- Halftone dots: 10–14 px pitch, 22–30 % alpha.
- Starburst wedges: 6–8 spikes, 60–110 px, from the corner, white.
- Section-label cadence: ~3.5 s per beat; hooks land inside 1.5 s.

## Verification

- Deterministic (frame-driven). 2276 frames @60 fps; timeline.json measured from the
  takes — re-recording a take shifts picture automatically (mix.py → lipsync.py → render.mjs).
- Full-res stills at every beat (`proof/v4-*.png`) checked for: safe-box margins,
  no text overflow (fitSize), type never over her silhouette, hands visible and in-frame,
  blink timing, badge vs starburst collision (KANUNI 03 moved right).
- Mouth motion tuned to owner feedback across three rejections: v2 (fixed smile, too subtle)
  → v3 (masked AI, owner: "unusual") → v4 (kit-only, gamma 0.75, phone/desk poses for real
  aperture). Amplitude is limited by the source art for ok/point/thumbsup; the mouth does
  swap patches across voiced frames and teeth show on phone/desk/ok/point/thumbsup peaks.
- Encode: H.264 High, 1080×1920, 60 fps CFR, yuv420p, AAC 48 kHz stereo, ≈ 3.8 Mbps,
  17.9 MB, faststart.
- Frames are not committed (rebuild from `render.mjs`); mp4 + mix.wav are.
