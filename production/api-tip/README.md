# Tech Tip 01 · MCP au API?

Local, read-only lab → Kiswahili motion graphics and an A5 field guide. See the [editorial/owner handoff](../../content/pilots/07-api-tip.md) for publishing, evidence boundaries, licenses and voiceover. Nothing is deployed by these scripts.

## Build from cleared inputs

Node 22+, Python 3.11+ with Pillow and pypdf, FFmpeg (libx264 and libass), ffprobe and Chrome. Install these through your environment/package manager. ImageIO FFmpeg is acceptable; point `FFMPEG_PATH` to an **absolute** path. Set `CHROME_PATH` (and system libraries if needed) for Playwright/Remotion or provision their default browsers. From repo root:

```bash
npm ci --prefix production/api-tip
npm --prefix production/api-tip test
npm --prefix production/api-tip run proof --silent

python3 production/api-tip/prepare-assets.py /path/to/stock /path/to/owner-input out/api-tip/assets --ffmpeg "$FFMPEG_PATH"
python3 production/api-tip/prepare-voice.py /path/to/five-takes out/api-tip/audio --ffmpeg "$FFMPEG_PATH"
npm --prefix production/api-tip run guide
npm --prefix production/api-tip run reel -- stills
npm --prefix production/api-tip run reel -- all
python3 production/api-tip/verify-export.py out/api-tip --ffmpeg "$FFMPEG_PATH" --ffprobe "$FFPROBE_PATH"
python3 production/api-tip/package-kit.py out/api-tip private-media/api-tip
node production/api-tip/check-download.mjs
```

- `prepare-assets` requires pinned originals named `packing.mp4` and `dispatch.mp4`, and `Screenshot 2026-10-09 005445.png` from the owner. The provenance and pinned paths are in [the research notes](../../content/research/2026-11-18-api-tip.md). Script checks input hashes; never accept a crop on an unknown file. Original media and credentials are **not** stored in Git or the kit. B-roll outside the Reel is not distributed as a reusable stock asset.
- `prepare-voice` needs takes `01` through `05` (one WAV/M4A each), trims silence, keeps natural pace (default 0.98×), creates a frame-exact mix and two SRTs. `cues.json` contains reference spellings and script. Change text and time the owner's new takes together; do not rubber-stamp synthetic timing. If the new takes don't fit, trim words or adjust the cut, not the owner's natural tempo.
- `guide` uses the same `runLab()` proof as the Reel. It embeds its own fonts, checks print bounds, and generates the tagged PDF and preview pages needed for the CTA. No external requests in generation.
- `reel -- all` renders 1,800 frames and a 9:16 cover. `reel -- stills` produces stills/cover only; `-- video` skips stills; `-- caption` burns in the latest captions/audio onto an **existing** cut with the same scene boundaries (do not use after changing scene timing). The voiceover master is H.264 with neither an audio track nor spoken captions. The reference MP4 includes the synthetic voice and caption burn-in; label it as such. Exact media duration and both SRTs are checked after encoding.
- `package-kit` makes a private review kit and a separate `out/api-tip/audience-page/` (just the PDF, thumbnail, mark and `index.html`), useful to stage a branded public link later. The kit intentionally lacks original stock/captures or reusable source video. Download QA checks a local HTTP server and fresh mobile browser. Deploy **only** the `audience-page` contents to a host/path explicitly approved by the owner; retest real HTTPS and real Instagram Requests/DM before promising anything in public. Only the guide, not the kit, is for the public.
