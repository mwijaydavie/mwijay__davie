# Bei ileile, chaguo jipya · Business Story 01

47 seconds, 1080 × 1920 at 60 fps. One half-litre at TSh 5,000, offered first among two choices then among three. The chart values are derived from the same `example.json` tuple. See the [production brief](../../content/pilots/12-price-story.md), [caption](../../content/pilots/12-price-story-caption.txt) and [story queue](../../content/business-story-series.md). No sales test, offer, profile changes or publication.

## Character and voice

- [Host rig notes](HOST.md): three coordinated AI pose edits of the supplied reference and eight keyed PNG layers. Blink uses painted eyelids; each gesture uses a wrist pivot, with idle movement. Not lip sync or a generated motion clip. The full kit includes the rig metadata, alpha layers, logo mark and reusable component.
- `rig-host.py` expects the approved green-screen `wave-raw.png`, `point-raw.png` and `think-raw.png` at **939 × 1136**. Landmarks are image-specific. Keep the owner image and the green-screen inputs in private storage; don't propagate them if only the edited layers are needed. You can use the already staged alpha layers and `qa/host-rig.json` from the kit instead.
- `prepare-voice.py` uses measured windows in `cues.json` to stitch `01.wav`…`06.wav` at original tempo. The chosen feminine Swanglish narration is synthetic. For new narration revise trim and caption offsets; don't treat the current waveform as owner VO. The clean cut has no audio or dialogue captions.

## Build and verify

Node 22+, Python 3 with Pillow/NumPy/OpenCV headless, FFmpeg with libass and libx264, FFprobe, DejaVu Sans, and compatible Chromium (`CHROME_PATH` when needed). Set `FFMPEG_PATH` for non-default FFmpeg. `PRICE_STORY_OUT` changes Node output paths; use matching paths for the Python steps.

```sh
npm --prefix production/price-story ci
npm --prefix production/price-story test
python3 production/price-story/rig-host.py /private/raw-poses /private/reference.png out/price-story
python3 production/price-story/prepare-voice.py /private/voice-takes out/price-story/audio
npm --prefix production/price-story run reel -- all
python3 production/price-story/verify-and-pack.py out/price-story private-media/price-story
```

`reel -- stills` samples wave, point, blink and story framing, and renders the cover. `-- cover` makes only the cover; `-- video` makes both cuts; `-- caption` remuxes a matching master if only the captions change. `layout.json` pins frame/sample offsets. QA checks frame decode/PTS, both SRTs, caption placement, loudness, picture-motion samples and the stable end. Review actual encoded frames for hand seams, eye placement, price alignment, and phone-safe captions. Verify voice pronunciation in review. These checks do not establish real customer behavior.
