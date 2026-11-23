# Noellyne — identity pack (IG + YouTube)

One character, one palette, four formats. Everything here is generated from the
same rig in `production/noellyne-host/`, so the banners, the avatar, the feed
scenes and the video all agree with each other.

Read `../CREATIVE-GUIDE.md` first — it carries the identity rules. This file
carries the files.

## What is in here

| File | Size | Use |
|---|---|---|
| `out/banner-ig.png` | 1080 × 1920 | IG Story / Reel cover / highlight cover |
| `out/banner-yt.png` | 2048 × 1152 | YouTube channel banner (text inside the 1235 × 338 safe area) |
| `out/avatar.png` | 1024 × 1024 | profile picture for both platforms |
| `out/scenes/look-plum.png` | 1080 × 1350 | feed post — mint intro |
| `out/scenes/look-studio.png` | 1080 × 1350 | feed post — the desk |
| `out/scenes/look-room.png` | 1080 × 1350 | feed post — making a point |
| `out/scenes/look-sky.png` | 1080 × 1350 | feed post — the sign-off |
| `out/intro.mp4` | 1080 × 1920, 16.5 s | Reel / Story / Shorts intro |
| `out/intro-yt.mp4` | 1920 × 1080, 16.5 s | the same cut, re-framed for YouTube |
| `GOOGLE-FLOW-PROMPT.md` | — | paste-ready prompt for a cinematic motion version |

## The video

16.47 s, four shots, one voice.

| # | Set | Pose | On screen | In |
|---|---|---|---|---|
| 01 | violet sky | wave | `Tech` / `inakuchanganya?` | 0.27 s |
| 02 | plum studio | clasped | `MIMI NI` / `Noellyne.` | 3.90 s |
| 03 | amber room | point | `APPS · AI · TOOLS` / `bila hype.` | 8.43 s |
| 04 | desk, mint | peace | `FOLLOW` / `tukutane hapa.` | 12.87 s |

Every shot pushes in ~5 %, has its own travelling light, and ends on a six-frame
dip so the cuts do not snap. The type sits under her measured hem on a floor
scrim — never over her silhouette, never on a card.

### The audio

Four spoken lines, one 62 Hz bed at −26 dB, four soft cues — one per cut. No
risers, no whooshes, no impacts. The restraint is the point.

The cut points in `out/timeline.json` are **measured from the actual voice
clips**, not typed by hand. Re-record a line, re-run `mix.py`, re-run
`intro.mjs`, and the picture follows the voice.

## Rebuilding

```bash
# stills
node production/noellyne-ig/identity/banners.mjs

# audio (writes out/intro.wav + out/timeline.json)
export FFMPEG=$(ls $PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-* | head -1)
PYTHONPATH=$PWD/.cache/rt python3 production/noellyne-ig/identity/mix.py

# video — both aspects
node production/noellyne-ig/identity/intro.mjs                     # out/intro.mp4
node production/noellyne-ig/identity/intro.mjs --landscape         # out/intro-yt.mp4

# a contact sheet of one frame per shot, to check placement without encoding
node production/noellyne-ig/identity/intro.mjs --stills=a:40,b:150,c:260,d:400
```

Voice lines live in `audio/01-hook.mp3` … `04-cta.mp3`. Replacing a file with a
different length is safe — `mix.py` re-measures and the edit moves with it.

## Layout rules learned the hard way

- **IG banner**: she is 880 px wide at `0.190 H`. Her ink bottom is at
  `y + w × 0.985`; the wordmark block starts at `max(hem + 210, 0.735 H)`. The
  wordmark must own a measured clear band — type over the silhouette was tried
  three times and failed three times.
- **YT banner**: never centre her. Type in the left column inside the
  1235 × 338 safe area, her cropped by the right edge. Centring puts the name
  through her head.
- **Feed scenes (4:5)**: she is 780–800 px at `0.10–0.13 H`; the headline starts
  at `max(hem + 96, 0.855 H)` above a floor scrim, and the bottom-corner paper
  sheets live in the top third so they cannot cross the type.
- **Video**: tall frames type from the hem down; wide frames put type in a left
  column with a gradient scrim that fades out by `0.78 W`.

## Palette

`VIOLET #6444bf` · `PLUM #0e0716` · `LAV #b8a6ff` · `CREAM #f7f1e6` ·
`GOLD #f2c66d` · `MINT #3ddc97`

## What not to do

- Do not put the sunglasses over her eyes. They live on top of her hair.
- Do not frame her full-body. She is a half-body rig; the desk is what makes the
  bottom of the frame honest.
- Do not add a text card on a cream mat. Every frame is built, full bleed.
- Do not stack two audios. One voice, one bed.

## Drive links (public)

| Item | Link |
|---|---|
| IG Reel / Story — `intro.mp4` | https://drive.google.com/file/d/18chfAQkXp0MJJRkiUMbZEaoLgz83czzx/view |
| YouTube — `intro-yt.mp4` | https://drive.google.com/file/d/1YIa3HgFClkC5pV438qXLhRhJUX18WHUR/view |
| IG banner | https://drive.google.com/file/d/1mPNt1n1U4ISCkNrBNzqRptgBw_oErmnV/view |
| YouTube banner | https://drive.google.com/file/d/1DYlIasvMbL7qw_hBWwXK0KkxYtl5yk57/view |
| Avatar | https://drive.google.com/file/d/1KmJ6_apeDlP6hLiZv5CjMntpYG01xfwv/view |
| Feed 01 — plum | https://drive.google.com/file/d/1-0bFxEkURT1F3xEz8GZTRwEseB-aRkV2/view |
| Feed 02 — desk | https://drive.google.com/file/d/1aidtQ2tufCToHzVPcYWvYYOr0ARfOJen/view |
| Feed 03 — room | https://drive.google.com/file/d/126lzAY2RBR97cT-riuTMjEW-ffV3KZ3T/view |
| Feed 04 — sky | https://drive.google.com/file/d/1x8qkQBOaIchHHImMGEdV7-1l_jO5Aj9Z/view |
| YouTube thumbnail | https://drive.google.com/file/d/1PPPgyS6t_mYbu7fi7CMmU8nL00pNS7FX/view |
| Reel cover / story poster | https://drive.google.com/file/d/1ItpzbJmfRLcTK29lgydsjTVNiSkGz0Id/view |
