# Shule Altra Reel — "Period ya kwanza ni somo gani?"

**v2 review:** <https://drive.google.com/file/d/18b2tYXA47BNCnnarZLfBs2mNfOfsWyt4/view>
**v1 (superseded):** <https://drive.google.com/file/d/15sSWSbraDIBKtbzN8F_W9yNdTb7CuWyj/view>
1080×1920 · 60 fps · 36.82 s · H.264 yuv420p + AAC 48 kHz stereo.

## What changed in v2

Two real defects were found by looking at the actual frames rather than the plan:

1. **The mouth never moved.** `performerDraw` drew no mouth layer at all. The rig
   ships eight viseme patches per pose and the renderer used none of them, which
   is exactly the "mdomo umekuwa shut" note. Fixed by `production/noellyne-host/lipsync.py`,
   which analyses the dry mix and drives the patches per frame.
2. **She had only two poses**, so the same raised hand came back every beat. Two
   more poses existed in the Tech Pulse V3 kit and were never wired in. Fixed by
   `production/noellyne-host/build-poses.py` — see that rig's README.

The sets were also rebuilt on the kit's real proof crops instead of drawn grids,
and she now stands in the right third whenever the artifact needs the left.

## What it is

Noellyne, the approved female host, running a school day through Shule Altra.
Eight beats: hook → what it is → timetable → the actual Monday 08:00 lesson →
the three modules → the PDF → the Altraware offer → one CTA.

She is drawn from the **real rig** (`production/noellyne-host`), not from
cropped footage. Her arm is a separate layer rotating about the aligned cuff, so
the wave and the point are gestures, not crossfades. Mouth shapes follow the
voice; the lids blink; the camera pushes on every scene.

## Host and artifact take turns

| beat | host position | what is beside her |
| --- | --- | --- |
| hook | centred | soft question-mark watermark |
| intro | centred | three window panes |
| timetable | right, lower | a real grid filling in, column by column |
| lesson | right | a gold path drawn from Monday to Biology |
| modules | right | three cards: Attendance 276, Academics A–C, Finance TSh |
| pdf | right | a page turning up, with a PRINT control |
| offer | centred | three scope pills: Design / Build / Security |
| cta | right | the SHULE keyword bar |

Putting her in the centre on every beat is what made earlier cuts read as one
card repeated. Where a beat has UI, she moves so the left column stays readable.

## Audio

Eight Swanglish takes, ~32 s of speech, laid on a frame grid in
`out/timeline.json` (produced by `mix.py`). One soft bell (1046 Hz with two
short partials) on each scene change — two voices in the mix, nothing else.
−16.5 dBFS RMS, peak below −1 dBFS.

The voice is a Kiswahili scratch take for review. The owner records his own
lines by default; `copy.json` carries the exact script and the English sidecar.

## Build

```bash
export FFMPEG="$PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2"
PYTHONPATH="$PWD/.cache/rt" python3 production/shule-altra-reel/mix.py
node production/shule-altra-reel/render.mjs \
     production/shule-altra-reel/out/shule-altra.mp4 \
     production/shule-altra-reel/out/mix.wav
```

`--proof=N` renders the first N frames for a look before committing to the full
run. The full 2 209 frames take about 110 s.

## Evidence and limits

- Sample build pinned at `27fef99`; Form Two / Stream A, Monday 08:00, Biology
  was verified in the capture (see the Shule Altra Owner Kit `Inputs/proof/`).
- No student data, names, marks or fee records appear anywhere in frame.
- No claim about school performance, adoption or results.
- The "276" in the Attendance card is a layout value on a sample screen, not a
  measured figure. It is visual scaffolding only.

## Files

- `copy.json` — eight takes, Swanglish + English, pose and gesture cues
- `mix.py` → `out/mix.wav`, `out/timeline.json`
- `render.mjs` — the renderer
- `out/shule-altra.mp4` — the delivered cut
