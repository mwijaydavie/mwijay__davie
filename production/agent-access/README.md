# Agent access Reel · AI isome stoo. Bei ibaki.

[Editorial proof and assets](../../content/pilots/06-agent-access.md) · [Dated sources](../../content/research/2026-11-18-agent-permissions.md) · [Post copy](../../content/pilots/06-agent-access-caption.txt).

**Output:** one 30-second SW cut at 1080×1920 / 60 fps, 9:16 cover, SW/EN SRTs, caption, five editable SVG stickers and local proof JSON. A fictional in-memory MCP fixture runs for every render. The `read_stock` call returns 12 and a non-exposed `change_price` call is rejected, leaving the dummy price unchanged. It never starts a listening server, authenticates to a product or contacts a real model. Human approval for write actions is a design recommendation rather than a feature of this read-only fixture.

## Build from local inputs

From the repo root. Requirements: Node 22, pinned dependencies, compatible Chromium (`CHROME_PATH`), Python 3 with Pillow, and FFmpeg. Use the owner screenshot with the SHA in `prepare-captures.py`. The two generated *illustrative* PNGs go in an ignored directory (`desk-hero.png` and `desk-approval.png`); keep crop/illustration input files and original TTS outside Git. Obtain SW clips `01.wav`–`05.wav` from the approved male voice using the `spoken` text in `voice-cues.json`. TTS is 0.94×; the prep sizes breathing holds to exactly 1,800 frames instead of accelerating voice. The only non-voice audio is original synthesized foley.

```sh
npm ci --prefix production/agent-access
npm --prefix production/agent-access test
python3 production/agent-access/prepare-captures.py /path/to/owner-captures /path/to/illustrations out/agent-access/assets
python3 production/agent-access/prepare-audio.py /path/to/sw-wavs out/agent-access/audio
CHROME_PATH=/path/to/chromium npm --prefix production/agent-access run render -- stills
CHROME_PATH=/path/to/chromium npm --prefix production/agent-access run render -- video
```

`render -- all` builds both. Set `FFMPEG_PATH` when FFmpeg is not on `PATH`; the final mux copies the H.264 frames and encodes the prepared PCM to AAC with an exact 30-second track end. `AGENT_ACCESS_OUT` can override the output root with the prep paths adjusted as well. `npm --prefix production/agent-access run stickers` exports original vectors independent of render. `sticker-art.mjs` implements the point-doodle / die-cut technique from the studio's Motion Lab without including its source or artwork. Geometry, chart travel, sticker entry, print reveal, moment of permission refusal and camera movement are deterministic functions of the current frame. No free-running CSS timers, external scripts or background videos.

`out/agent-access/qa/local-mcp-results.json` is the observed lab receipt. The renderer verifies evidence hashes before reading images. Inspect scene boundaries and proof at 360px with the app UI in mind; the encoded gate also decodes the full export, measures audio and checks presentation timestamps and subtitle ranges. Then package the approved export:

```sh
python3 production/agent-access/verify-export.py out/agent-access
python3 production/agent-access/package-kit.py out/agent-access private-media/agent-access
```

Pass `--ffmpeg` and `--ffprobe` if not on `PATH`. Keep media and private links out of Git. The ZIP includes a rebuild from prepared assets, not the raw uploads. Do not infer an implemented MCP feature from the FaidaHQ preview image or the independent local MCP lab, or make files publicly available without permission.
