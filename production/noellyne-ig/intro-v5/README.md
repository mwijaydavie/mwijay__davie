# Noellyne IG intro — V5

Review cut: **`Noellyne-Intro-V5-Altraware-Review.mp4`** in Drive (owner-only),
1080×1920, 30 fps, 19.6 s, −15.4 LUFS, true peak −1 dBFS.

V4 was rejected on three counts, and V5 fixes exactly those three:

| V4 complaint | What V5 does instead |
| --- | --- |
| "Tech kwa viteno" is nonsense | Every line was rewritten and checked. See `copy.json` — each entry carries the spoken line, the on-screen words, the English, and why it is safe. |
| "audios zimekuwa nyingi ka uchafu, hamna muelewano" | 19 cues + bed + compressor became **one bed, two cues**. The bed is low-passed at 900 Hz and sidechain-ducked under every word, so the voice owns the speech band. |
| "cutout inaonekana poorly done" | **No cutout at all.** Her approved footage sits inside a designed media panel, so there is no matte edge to look pasted. |

## The decision that matters

V3 and V4 kept trying to composite a *cutout* of Noellyne onto a stage. On a
light page the matte edge always showed — a pale halo or a violet rim — and the
owner read that as the character being pasted on. Three approaches were tried
for V5 (SelfieSeg + narrow GrabCut, alpha unmixing against a rebuilt background,
and a downloaded matting model) and none of them produced a clean hair edge.

So V5 removes the failure mode instead of hiding it: the footage lives inside a
rounded panel with a designed edge, which is exactly how the Altraware reference
reels present screenshots. Nothing looks pasted because nothing is pasted.

## Source-window rule (important)

The approved source reel has its own graphics baked in — a header, a
`TECH PULSE TZ` credit, its own cards, and a caption pill around y≈1350. The
windows in `SHOTS` are measured to exclude all of it:

- `hook` — x 60–520, y 556–1344 (phone pose; stops left of the "AI IKISEMA" box)
- `name` / `promise` — x 596–1079, y 396+ (starts right of the baked credits)
- `cta` — x 598–1060, y 690–1290

If you change a window, re-check a frame before rendering: leaving the source's
text in would put the rejected brand back on screen.

## Build

```bash
export FFMPEG=$PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2

PYTHONPATH="$PWD/.cache/rt" python3 production/noellyne-ig/intro-v5/tools/sfx.py
export FFMPEG=...
node production/noellyne-ig/intro-v5/tools/mix-audio.mjs out/noellyne-ig-intro-v5/mix.wav
node production/noellyne-ig/intro-v5/tools/render.mjs \
  google_drive/Noellyne-Intro-V5-Review.mp4 --audio=out/noellyne-ig-intro-v5/mix.wav
```

`tools/plates.py` is the V5 matte experiment. It is kept because `matte5.py`
documents why the alpha route was abandoned, but **the renderer does not use
any plate**.

## Layout, measured off the references

Cream `#FDF7EB` field with a warm corner and a soft desk plane at y=1616, navy
`#14202B` display type, royal `#1F5AA5` for the accent word, one navy caption
pill at y=1560 that overlaps the media panel, violet mark plus a hairline header
with four progress ticks.

## Timing

| beat | in | out | on screen |
| --- | --- | --- | --- |
| hook | 0.0 | 4.9 | Tech inakuchanganya? / Tuiweke rahisi. |
| name | 4.9 | 11.0 | Noellyne / Tech host wa Altraware. |
| promise | 11.0 | 16.6 | Bila hype. + three promise chips |
| cta | 16.6 | 19.6 | Tujaribu pamoja. + FOLLOW |

VO placement: hook 0.00, name 4.62, promise 10.75, together 16.33 (seconds).

## Mix

- Voice: high-pass 95 Hz, 2:1 leveller at 1.35 make-up. Never ducked.
- Bed: one loop, `volume=0.16`, sidechain-compressed by the VO (9:1, 8 ms
  attack, 320 ms release) — it drops out of the way of every word.
- Cues: `thump` at 4.9 s (panel lands), `blip` at 17.65 s (follow button).
- Master: limiter at −1 dBTP, `loudnorm` to −15 LUFS. LRA 4.7.

Do not add "one SFX per cut". That rule is exactly what made V4 unreadable.
