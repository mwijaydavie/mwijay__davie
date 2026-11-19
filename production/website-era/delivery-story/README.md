# Free delivery? · Business Story 03

A 39-second 1080×1920 Remotion Reel at 60 fps. Reuses `../Host.tsx`, `../motion.mjs`, `../visemes.mjs` and the pinned dependencies in the parent package. Checkout numbers are a fixture, not recorded orders. `checkout.mjs` is shared by the proof and worksheet. Captions (Swanglish and translated English) align to the scratch VO. Only Swanglish is burned into the review. The reference videos are not inputs to the build.

## Rebuild locally

Requirements: Node 22+, Chromium (`CHROME_PATH`), FFmpeg with `libass`, FFprobe and Python with NumPy, Pillow and pypdf for final verification. Rebuild from the unpacked kit's `04-Rebuild` directory or the repository root. The kit already includes the hash-verified `out/delivery-story/assets/*.png`, `out/delivery-story/qa/{assets,host-rig}.json`, and assembled audio in `out/delivery-story/audio`. Restore these private inputs from the owner kit instead of painting a replacement face. Keep raw takes and all exports outside Git.

```sh
npm --prefix production/website-era ci
npm --prefix production/website-era test
export CHROME_PATH=/absolute/path/to/chromium
export FFMPEG_PATH=/absolute/path/to/ffmpeg
D=production/website-era/delivery-story
OUT=out/delivery-story
# Only needed to rebuild the voice stems/timing from the five private WAV takes:
python3 "$D/prepare.py" inputs/voice "$OUT/audio" --ffmpeg "$FFMPEG_PATH"
node production/website-era/visemes.mjs "$OUT/audio"
node "$D/render.mjs" all     # or stills, video, mux (mux checks picture/build hashes)
node "$D/worksheet.mjs"
```

After rebuilding, `python3 "$D/verify.py" "$OUT" inputs/voice private-media/delivery-story --ffmpeg "$FFMPEG_PATH" --ffprobe /absolute/path/to/ffprobe` decodes both MP4s, checks caption boxes and resting/active mouth samples, verifies the A5 worksheet and builds the private kit. In the repository, substitute your path to the private WAV takes for `inputs/voice`. Set `DELIVERY_STORY_OUT` for non-default render/worksheet paths.

## Owner voiceover

Start with the silent master and a separate `SFX-Only.wav`. The mouth rests there on purpose. For a newly lip-synced version, record fresh and update the five trim, join, caption and shot timings in `cues.json` against the new audio before running the phonetic pass. Do not use the original viseme sequence for a different take. Check pronunciation and read in the real phone UI before posting. The audience asset is the worksheet PDF alone.
