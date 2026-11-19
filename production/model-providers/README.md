# Tech Tip · Free AI API? / Model Providers

60-second deterministic Remotion cut, two tagged PDF guides and a local mock. See [owner handoff](../../content/pilots/08-model-providers.md), [research and marks](../../content/research/2026-11-18-model-providers.md). No deployment hooks or API secrets.

## Rebuild/verify

Node 22+, Python with Pillow and pypdf, FFmpeg with libx264/libass and a DejaVu Sans font, ffprobe and Chrome. Set `FFMPEG_PATH` and `FFPROBE_PATH` to absolute binary paths, `CHROME_PATH` to a compatible executable if not using default browser installations, and `LD_LIBRARY_PATH` as needed. Run from repo root:

```sh
npm ci --prefix production/model-providers
npm --prefix production/model-providers test
# Inputs: eight phonetic scratch takes 01..08, exact trim bounds in cues.json.
python3 production/model-providers/prepare-voice.py /path/to/takes out/model-providers/audio --ffmpeg "$FFMPEG_PATH"
# Place prepared editorial JPG crops + manifest.json in out/model-providers/assets.
npm --prefix production/model-providers run guide
npm --prefix production/model-providers run reel -- stills
npm --prefix production/model-providers run reel -- all
python3 production/model-providers/verify-export.py out/model-providers --ffmpeg "$FFMPEG_PATH" --ffprobe "$FFPROBE_PATH"
python3 production/model-providers/package-kit.py out/model-providers private-media/model-providers
node production/model-providers/check-download.mjs
```

- `assets/` is ignored output, not public source. Two cleared generated stills `key-desk.jpg` and `local-desk.jpg` prepared to 765×1360, with `manifest.json` array of `{file, sha256, source_sha256, origin}`. Replace art only after checking contrast/rights. Render source sets motion and typography deterministically; original SVG shapes drawn in `Reel.tsx`; seven identification marks from pinned MIT upstream package with independent-trademark credits.
- PDF `routes.json` is a snapshot, not live claims. Verify each offer and source first if republishing. Both versions use the same data with localized descriptions, preserve working hyperlinks, shown in the CTA. Guides don't call providers; the quickstart example is documentation-based.
- `reel -- video` assumes approved stills/cover already exist. `reel -- caption` only replaces captions/voice with the same picture cut (guarded by `qa/picture-cut.json`). The prepared screenplay is measured against eight scratch takes; the owner's voice needs its own cue boundaries. Do not try to fit using time compression.
- `--stage-only` on `package-kit.py` prepares the five audience files for local QA without creating a ZIP. Test download from a fresh browser. Only ship this audience directory to an owner-approved path after verifying real HTTPS/IG in-app access, not any private test data or review file. No server is left running by the tests.
