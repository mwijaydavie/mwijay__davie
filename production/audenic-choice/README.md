# Audenic · Battery inakaa muda gani?

26 s at 60 fps, 1080 × 1920. Five authored scenes, a cover, a Swanglish TTS scratch cut, silent clean master, SW/EN SRTs and a private editor kit. See [pilot brief](../../content/pilots/10-audenic-specs.md) for the public evidence, publish gate and single **SPECS** reply. This pipeline does not post or deploy.

## Local proof and inputs

- Capture [the Audenic production build at `e4b211085f78181421fb9f4562395a8fb2568d0b`](https://github.com/mwijay12/audenic/tree/e4b211085f78181421fb9f4562395a8fb2568d0b) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` unset (no `.env`). Use `npm ci` then `npm run build` in a separate private/ignored extraction. Do not modify the build's marketing text to make proof. The capture script serves only the two guest routes and required assets; it blocks external requests and does not interact with purchase or account controls. This is a local regression/footage check, not a test of deployed services.
- `capture.mjs` taps the actual catalogue link on a 390×844 mobile viewport, verifies product/scroll and sample specs, and captures four cropped excerpts. No network images are included. The browser may use fallback fonts; captures are not byte-for-byte screenshots of the public site.
- Supply the clearly labelled generated art at `out/audenic-choice/assets/hero.jpg`. Put `file`, `source` and its SHA-256 as `sha256` in `out/audenic-choice/qa/hero-credit.json` (both are in the private review kit). It is a concept image, never used inside the captured site.
- `cues.json` contains five measured take windows (`01.wav`…`05.wav`), timeline frame endpoints, and bilingual caption splits. Use the kit's `audio` equivalents in `voiceover/` if rebuilding with the same cuts. For new reads, update trim/part offsets to match the recording; do not accelerate the voice to fit. Art/VO should come from cleared inputs only.

## Render and verify

Node 22+, Python 3 with Pillow, FFmpeg with `libx264`/`libass`/DejaVu Sans, FFprobe, and compatible headless Chromium. Set `CHROME_PATH` if Chrome is not otherwise discoverable. Set `FFMPEG_PATH` for a non-default FFmpeg; set `AUDENIC_OUT` consistently if choosing another output directory.

```sh
npm --prefix production/audenic-choice ci
npm --prefix production/audenic-choice run capture -- /absolute/path/to/pinned-audenic/dist
python3 production/audenic-choice/prepare-voice.py /private/directory/of/takes out/audenic-choice
npm --prefix production/audenic-choice run reel -- all
python3 production/audenic-choice/verify-and-pack.py out/audenic-choice private-media/audenic-choice
```

Use `-- stills` for frame/cover checks or `-- cover` for only the cover. `-- video` renders both cuts without the stills/cover. `-- caption` remuxes a matching master/shot cut without a picture render (e.g. caption spelling changes). `prepare-voice.py` and `verify-and-pack.py` accept `--ffmpeg`, and verification also accepts `--ffprobe`.

Verification checks both files decode completely, frame PTS, format, audio levels and timing, both SRTs, captions on representative encoded frames vs the clean master, and an end-card hold. Review the final video and cover on a phone as well; verification does not test pronunciation or Instagram transcoding. Keep WAV, screenshots, and media exports out of Git. The owner kit is for editing; the product page is the only audience resource.
