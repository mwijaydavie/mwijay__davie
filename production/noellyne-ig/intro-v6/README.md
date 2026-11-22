# Noellyne IG intro — V7 (current review cut)

Review cut: **`Noellyne-Intro-V7-Altraware-Review.mp4`**
<https://drive.google.com/file/d/1JrR7iJYIpoXuiJ2hM_rWvhxuGW0tpJgb/view>
1080×1920 · 30 fps · 19.80 s · H.264 + AAC 48 kHz · −15.3 LUFS · link-viewable.
QA sheet: <https://drive.google.com/file/d/1MGm0vgGu1auSo116M0IFw27uYiTKmOKA/view>

## V7: the two V6 defects, and how they are closed

**1. The logo was invented.** V6 drew a circle and a ring by hand. Three
hand-drawn attempts (circle, "Q", blob) all failed, because the mark already
existed in the repo: **`content/assets/altraware-mark.png`** — 256×256 RGBA,
two overlapping violet lobes with a leaf inside the left lobe. V7 loads that
file, cuts it onto white rounded tiles (`assets/logo-tile-{72,144}.png`,
radius 0.225·S) and draws the tile plus the "ALTRAWARE" wordmark in the header
of every beat. `tools/logo.py` was deleted; nothing about the mark is drawn in
code any more.

**2. The cutout.** This is the important one. Her approved footage is shot on a
plum set that is **not separable** from her: the lenses, the hair edge and the
hoodie all sit within the set's own hue range. Seven matte strategies were
tried across V4, V5 and V6 — SelfieSeg+holefill, single-component, colour-first,
threshold-at-5.0, distance-transform colour propagation, GrabCut, and a
downloaded matting model (blocked). Every one left a defect, because *the defect
is in the source, not the code*. The measured separation says exactly that:
`min(b,r) − g` is **+14** for the set, **−4** for the hoodie and **−27** for the
lens — the hoodie and the wall are closer to each other than either is to the
matte that is supposed to divide them.

So **V7 does not matte her at all.** Each beat shows a plain, untrimmed crop of
the approved footage as a *studio print*: white mat, hairline rule, a 1° tilt, a
soft cast shadow, standing on the same table plane as the type. It reads as a
deliberate editorial object, which is what the Model Mpya reference does with
its own panels, instead of as a compositing failure. No pixel of her is
recoloured, ghosted, dilated or hole-filled by the renderer.

The crops are chosen to exclude every baked element of the source: the header
(y≈300), the hook's quote card (x≥470), the desk column's own lower thirds
(x<610) and the source caption pills (y≥1275). All four prints share one height
(742 px) and one baseline (y=1436) so the beats feel set by one hand.

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

## V7 render, in order

```
# 1. audio (unchanged from V6: −15.3 LUFS, LRA 4.9, 19.80 s)
PYTHONPATH="$PWD/.cache/rt" python3 production/noellyne-ig/intro-v6/tools/sfx.py
node production/noellyne-ig/intro-v6/tools/mix-audio.mjs      # -> out/noellyne-ig-intro-v6/mix.wav

# 2. picture (needs the 744 source frames in .cache/noellyne-v6/frames)
export FFMPEG="$PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2"
node production/noellyne-ig/intro-v6/tools/render.mjs google_drive/Noellyne-Intro-V7-Altraware-Review.mp4 \
     --audio=out/noellyne-ig-intro-v6/mix.wav

# 3. QA — full-res crops, never only a downscaled sheet
```

The renderer preloads only the source ranges it uses (1.25–2.10, 7.15–8.15,
14.15–15.45, 17.05–18.15). Frames **must** be decoded with `loadImage`; `new
Image(); img.src = buffer` silently yields an empty bitmap in this canvas build.

## Still open

- Beat boundaries and shot choice are tunable in `SHOTS`/`WIN` in
  `tools/render.mjs`; the four beats are the locked 0–5.0 / 5.0–11.0 /
  11.0–16.6 / 16.6–19.8 structure.
- `tools/plates.py` is kept only as the record of the failed matte attempts. It
  is not used by the V7 render.
