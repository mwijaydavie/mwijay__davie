# Noellyne IG intro — V8

**Review:** <https://drive.google.com/file/d/1hryxjKlzlNgRGrDzs6OvyzbqZrbOuX3s/view>
1080×1920 · 30 fps · 19.80 s · H.264 + AAC 48 kHz · link-viewable.

## What is different from V1–V7 (read this first)

V1–V7 all did the same thing: take her reel, cut a rectangle out of it, lay the
rectangle on a cream page, and then argue about the edge of the rectangle —
matte it, feather it, print it, mat it, card it. Eight versions went into that
argument. The owner rejected every one, and he was right: **a rectangle of her
footage on a page is a cutout however it is dressed, and the page was never
his.**

V8 has no page. There is no cream, no card, no print, no mat, no hairline rule,
no numbered section chrome, no caption pill, no UI kit. Every shot is
**full bleed** — her own frame, edge to edge, 1080×1920. The only things drawn
on top are type, the real Altraware mark, and a type floor.

## Where the pixels come from

Only `Noellyne-Intro-SW.mp4` — the approved reel. 1 080×1 920, 24.8 s, 60 fps,
extracted to `.cache/frames/f_0001..0744.png` at 30 fps.

No reference reel contributes a pixel. LIMS / MwijayNote / Model Mpya are not
opened by `tools/build.mjs`; the only mention of them is in the V6 README, as a
record of what went wrong there.

## Where the words come from

**Her own voice.** The audio is four cuts of the approved reel's Swahili track,
taken at measured pauses (0.02 s resolution) so no word is clipped:

| cut | source | placed at | on screen |
| --- | --- | --- | --- |
| 1 | 0.00–4.10 s | 0.0 s | Tech / inakuchanganya? / *Tuiweke rahisi.* |
| 2 | 4.50–8.55 s | 4.4 s | MIMI NI / Noellyne. / TECH HOST · ALTRAWARE |
| 3 | 14.25–18.70 s | 8.8 s | HAPA UTAPATA / Bila hype. / 01–03 |
| 4 | 19.00–23.46 s | 14.6 s | TUKUTANE / Nifuate / *hapa.* / FOLLOW |

The screen words are the words she is saying. Nothing is invented, and no line
claims anything about her reach or results.

The 4.2–8.7 s block is **not** used: it is the product-demo card, a white UI on
lavender that is a different visual world from the rest of the reel.

Audio bed: one 58 Hz drone at −27 dB. No risers, no impacts, no whooshes —
"audios zimekuwa nyingi ka uchafu hamna muelewano". Master: −15.5 dBFS RMS,
peak −1.69 dBFS.

## Baked text, and why it is cropped rather than erased

The source is itself a finished edit, so most shots carry burned-in text. Two
options were tested:

- **Inpaint** (`cv2.inpaint`, Telea): destroys the artwork — smears the quote
  card into a grey wedge and drags the set's gradient across the frame. Rejected.
- **Crop to a text-free region**: works, and is what V8 does.

Measured per-shot crop rects (source pixels):

| shot | frames | crop | why |
| --- | --- | --- | --- |
| hook | 3–126 | x 30–430, y 400–1700 | quote card starts at x=455 |
| name | 156–258 | x 600–1075, y 160–1700 | baked name card is x<560, y<960 |
| promise | 436–566 | x 610–1076, y 380–1700 | baked list is x<560, y<1000 |
| cta | 662–742 | x 320–750, y 470–1120 | baked header y<400, headline y>1160, circle x<320 |

Each crop is cover-fitted to 1080×1920 with a slow push (max 1.05×) and a pan,
so it is always full bleed and never letterboxed. The baked ALTRAWARE header
survives at the top of every source shot; the real mark bar sits on the same
strip and covers it.

## Build

```bash
export FFMPEG="$PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2"
PYTHONPATH="$PWD/.cache/rt" python3 production/noellyne-ig/intro-v8/tools/mix.py
node production/noellyne-ig/intro-v8/tools/build.mjs \
     production/noellyne-ig/intro-v8/out/v8.mp4 \
     --audio=production/noellyne-ig/intro-v8/out/mix.wav
```

### Two bugs worth remembering

1. **`Buffer.from(getImageData().data)` silently truncates.** It copies through
   the typed array's *array* length, producing 5.7 MB of the needed 8.3 MB per
   frame; ffmpeg then wrote a 0.98 s file with no error. The correct form wraps
   the same memory:
   `Buffer.from(d.buffer, d.byteOffset, d.byteLength)`.
2. **Preloading every source frame OOM-kills the process.** A 1080×1920 PNG is
   ~8 MB decoded, and the 439 frames this edit touches need >3.5 GB. Node was
   SIGKILLed (exit 137), which looked like an encoder crash. `build.mjs` now
   decodes on demand through a 48-slot cache.

## Files

- `tools/build.mjs` — the renderer (one canvas, raw RGBA piped to ffmpeg).
- `tools/mix.py` — the audio, built in numpy so every cut point is explicit.
- `out/mix.wav`, `out/v8-c.mp4` — the delivered render.
