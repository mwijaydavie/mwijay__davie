# Noellyne IG intro — V6

Review cut: **`Noellyne-Intro-V6-Altraware-Review.mp4`**
<https://drive.google.com/file/d/1pCbmkkdpeHGTrwCQ09QgdbKteQiwPpBB/view>
1080×1920 · 30 fps · 19.8 s · −15.3 LUFS · owner-only.

## What changed from V5, and why

The owner sent three Altraware reels and said they were all made by code, and to
study them for the character and the video logic. All three (LIMS, MwijayNote,
Model Mpya) share the same six rules, so V6 implements those instead of V5's
"footage in a white box":

1. **Cream-on-cream.** The room behind her is the same beige as the page
   (`#EEE7DA`). This is the single most important thing — it is why those reels
   never show a matte line. V5 put plum-set footage on a cream page, which is
   why every flaw showed.
2. **She stands in the scene.** Her re-keyed figure is planted on a real table
   plane and dissolves into it at the bottom. No box, no frame, no card border.
3. **Serif type.** Every reference uses a high-contrast serif with one italic
   accent line. V5 used a sans and read like a template.
4. **Numbered sections.** `01 / UTANGULIZI`, `02 / NANI`, `03 / UTAPATA`,
   `04 / TUKUTANE`, top right, with a hairline rule and a violet mark.
5. **UI that builds.** LIMS and Model Mpya never cut to a finished card; rows
   appear one at a time, then a total lands. The "Kila wiki" card does the same.
6. **One navy caption pill**, centred, over her.

## The extraction recipe that finally worked

Four matte strategies had failed by V5 (SelfieSeg+GrabCut, alpha unmixing
against a rebuilt background, a downloaded matting model, and plain re-keying).
The one that works is a **hybrid**, in `tools/plates.py`:

- SelfieSeg supplies **body** coverage (shoulders, hoodie, hands).
- A **hue + luma** test supplies the **hair** line: the plum set is both *dark*
  and *blue-dominant*, while her hoodie is blue but *bright* and her hair is
  warm. So `luma < 80 and blue−green > 8` separates hair from set while keeping
  the hoodie.
- The two masks are combined, then closed morphologically so hoodie folds do not
  punch holes.
- The result is saved as **RGBA** and composited on the page, which is why the
  join is invisible: the few semi-transparent pixels are beige-on-beige.

If you re-time a pose, change its window in `POSES` and re-check that no baked
source graphic (header, `TECH PULSE TZ`, source cards, caption pill) enters it.

## Crops and poses

| pose | source | window | use |
| --- | --- | --- | --- |
| `phone` | 1.30 s | x 40–700, y 548–1290 | hook — she holds the phone |
| `desk` | 7.60 s | x 576–1079, y 396–1290 | name + promise — talking |
| `point` | 17.35 s | x 598–1075, y 690–1290 | cta — pointing up |

## Build

```bash
export FFMPEG=$PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2
export PYTHONPATH="$PWD/.cache/rt"

python3 production/noellyne-ig/intro-v6/tools/sfx.py        # bed + 2 cues
node production/noellyne-ig/intro-v6/tools/mix-audio.mjs out/noellyne-ig-intro-v6/mix.wav
node production/noellyne-ig/intro-v6/tools/render.mjs \
  google_drive/Noellyne-Intro-V6-Altraware-Review.mp4 \
  --audio=out/noellyne-ig-intro-v6/mix.wav
```

`--proof=N` renders only N frames, for checking layout fast.

Prerequisites not in git: `.cache/noellyne-v6/frames/` (30 fps extract of the
approved source) and `.cache/noellyne-v6/plates/` (from `tools/plates.py`).

## Timing

| beat | in | out | on screen |
| --- | --- | --- | --- |
| hook | 0.0 | 5.0 | Tech inakuchanganya? / Tuiweke rahisi. |
| name | 5.0 | 11.0 | Mimi ni / Noellyne. + TECH HOST · ALTRAWARE |
| promise | 11.0 | 16.6 | Hapa utapata / Bila hype. + building card |
| cta | 16.6 | 19.8 | Tukutane / hapa. + FOLLOW |

VO: hook 0.00, name 4.72, promise 10.75, together 16.33.

## Audio

One low-passed bed, sidechain-ducked by the voice, plus two cues (panel thump at
5.0 s, follow blip at 17.65 s). −15.3 LUFS, LRA 4.9. Do not add a cue per cut —
that is what made V4 unreadable.
