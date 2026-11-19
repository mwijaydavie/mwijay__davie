# Quickopia · screenshot-led software content

[Brief, proof boundaries and CTA](../../content/pilots/03-quickopia.md) · [caption, alt text and reply](../../content/pilots/03-quickopia-caption.txt).

## Current Reel · V2 / Daylight

`QuickopiaDaylight` is the white-first edit, separate from the seven-slide carousel and the earlier Reel. It uses five short Kiswahili clips, the selected male voice, a large navy headline, and the category screenshot from frame 0. The SVG stepper is explicitly marked as an illustration; the paused checkout notice is a screenshot. The end card keeps the same comment keyword and public walkthrough destination.

```sh
npm ci --prefix production/quickopia
python3 production/quickopia/scripts/prepare-captures.py /path/to/owner-captures out/quickopia-v2/assets
python3 production/quickopia/scripts/prepare-audio.py /path/to/numbered-v2-sw-clips out/quickopia-v2/audio --version v2
CHROME_PATH=/path/to/chromium npm --prefix production/quickopia run render -- all v2
```

Use `01.wav`–`05.wav` in `voice-cues-v2.json` order. The V2 default tempo is 0.92×; `prepare-audio.py` rejects a speed-up and a timeline at or above 25 seconds. Shorten copy before sacrificing reading pauses. For V2, `stills` renders the cover and QA frames only; `reel` renders the MP4. SW/EN subtitles live in `out/quickopia-v2/audio/`.

## Original carousel and V1 Reel

`prepare-captures.py` expects the five named preview files supplied by the owner, with the reviewed dimensions. It extracts the first three category tiles, language controls, cart nav, help panel, checkout notice and actual logo crop/wordmark. It records hashes, sample colors and crop coordinates in an ignored evidence manifest. It neither visits nor modifies the live app. The cart interior remains a labeled illustration. Do not replace inputs with different screens without reviewing each crop and claim.

`QuickopiaCarousel` is a 7-frame 1080 × 1350 carousel. `QuickopiaReel` is 1080 × 1920 and 60 fps, with a stroke-mask reveal of the owner’s original Quickopia mark, moving UI highlights, SVG path and lock animation, an illustrative quantity stepper, and Kiswahili narration with burned-in captions. Its timeline derives from the assembled audio. Separate Kiswahili and English SRTs are included. The earlier `motion-proof` script remains a study, not an export to post.

```sh
npm ci --prefix production/quickopia
# Python with Pillow, and FFmpeg on PATH (or pass --ffmpeg /path/to/ffmpeg).
python3 production/quickopia/scripts/prepare-captures.py /path/to/owner-captures out/quickopia/assets
python3 production/quickopia/scripts/prepare-audio.py /path/to/numbered-sw-clips out/quickopia/audio --tempo 1.14
CHROME_PATH=/path/to/chromium npm --prefix production/quickopia run render -- all
```

Voice clips `01.wav`–`07.wav` must follow `voice-cues.json`; regenerate timing/SRTs if a voice clip changes. `-- stills` previews the carousel, cover and sampled motion beats; `-- reel` renders only the MP4. `QUICKOPIA_OUT` can override the output root. Chromium and its host libraries must be compatible. Inspect the rendered PNGs and decoded MP4 before releasing them. Never include raw user screenshots, audio clips, private URLs, or export binaries in Git.
