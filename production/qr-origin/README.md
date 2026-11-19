# QR ilianzia wapi? · Tech Story 01

A 36-second Swanglish Reel (1080 × 1920 at 60 fps) about the factory problem behind the QR Code. The picture uses labelled AI illustrations and an actual local decoder test. [Pilot brief](../../content/pilots/11-qr-origin.md) has sources, claim limits, shots and copy. No credentials, network requests during tests, payments, account changes or release steps.

## Inputs and tests

- `proof.mjs`: `qrcode@1.5.4` creates the version 1, error correction M symbol containing `HABARI DAR`. Keep a four-module quiet zone. `jsqr@1.4.0` locally decodes four separate images (0°, 90°, 180° and 270°); a blank negative control must return `null`. Writes the exact PNGs and their SHA-256 in `qa/rotation-proof.json`. The render consumes the 0° and 90° files and the decoded values; not a mock response or camera capture.
- `stage-art.py`: stage `factory.jpg` and `cafe.jpg` from the two image-generation inputs. Crops out letterbox-like blur on the factory reproduction. Writes labelled provenance/hashes. The kit already has the staged images plus `qa/art-credits.json`; place them under the same paths to rebuild.
- `prepare-voice.py`: builds `audio/reference.wav`, timed read, timeline and SW/EN SRTs from `01.wav`…`06.wav` using measured windows in `cues.json`. No speedup. The kit's `voiceover/` contains the generated `audio/` files. For another VO, revise trim/splits to match the owner's takes.
- `layout.json`: frame contract and exact QR crop for verifying the encoded picture. `verify-encoded.mjs` decodes the actual compressed 0° and 90° frames from both cuts, full size and at ~360px-wide preview scale, and checks rotation via finder locations. No claim that arbitrary damaged codes or every camera condition will decode.

## Build and review

Use Node 22+, a compatible Chromium (`CHROME_PATH` if needed), Python 3/Pillow, FFmpeg with libass, libx264 and DejaVu Sans, and FFprobe. `QR_ORIGIN_OUT` may override `out/qr-origin` for the Node scripts; use the same path for the Python steps.

```sh
npm --prefix production/qr-origin ci
npm --prefix production/qr-origin run proof
python3 production/qr-origin/stage-art.py /private/qr-illustrations out/qr-origin
python3 production/qr-origin/prepare-voice.py /private/qr-takes out/qr-origin/audio
npm --prefix production/qr-origin run reel -- all
npm --prefix production/qr-origin run verify:qr
python3 production/qr-origin/verify-and-pack.py out/qr-origin private-media/qr-origin
```

`reel -- stills` makes representative frames and the cover. `-- cover` makes just the cover; `-- video` renders clean and captioned cuts; `-- caption` remuxes a matching clean cut without re-rendering pictures. Set `FFMPEG_PATH` for Node tools. Python `prepare-voice.py` and `verify-and-pack.py` accept `--ffmpeg`; QA accepts `--ffprobe` as well.

QA checks full decode and stable PTS, caption placement/timing in the encoded version, audio headroom/time alignment, cover and stable hold. The private review kit includes the scratch cut, silent master, cover, recording script, SRTs, source-linked brief/caption and proof. It is not an audience download. Verify scratch pronunciation, Instagram crop and caption before posting.
