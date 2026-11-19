# Avocado Farmers Njombe · software-first render source

Six Instagram PNGs (1080 × 1350) and a vertical Kiswahili Reel (1080 × 1920, 60 fps). We lead with Altraware’s **software for avocado businesses**, then show the demo flow: **farm record → search and harvest status → detailed buyer request**. The literal comment keyword is **PARACHICHI** across the artwork, spoken VO, copy and SRTs. See the [pilot](../../content/pilots/01-njombe.md) and [per-project content playbook](../../content/project-content-playbook.md).

## Project-specific identity and proof

- `project.json`: the builder/product names, demo URL, exact keyword, slide order, and palette. The homepage capture provides button green `#1B7A36`, hero yellow `#D9B000` and white `#FFFFFF`. Forest ink and warm paper are supporting tones. The cleared studio lockup keeps its original purple mark.
- `src/Carousel.tsx` and `src/Reel.tsx` share the product framing, UI diagrams, and original fruit/field SVGs (`src/illustrations.tsx`). The cover is rendered from the composition, not substituted from an old cover file. Motion is frame-driven. Illustrative cards show the public [marketplace](https://mwijay.ct.ws/marketplace.php) filters, harvest status, buyer-account requirement and inquiry fields. No sign-up, request submission, completed sale or actual inventory is shown.
- `public/njombe/harvest.jpg` and `homepage.jpg` are decorative/product-proof crops of Mwijay's Nov 9 supplied screenshot; the latter stops above the unverified homepage body copy. `mark.png` trims transparent margins from [the original logo](../../content/assets/altraware-mark.png). Fonts: Fraunces, Inter and JetBrains Mono (self-hosted OFL Fontsource packages). Voice: selected Kiswahili TTS, plus quiet synthesized UI ticks; no reference audio used.

## Re-render

Node 22, Python 3 and FFmpeg. Confirm [Remotion licensing](https://www.remotion.dev/license) before commercial use. Optionally set `CHROME_PATH` to a compatible Chromium/Chrome Headless Shell. The Remotion scene uses local assets only.

```bash
npm ci --prefix production/njombe
# Use the nine recorded/approved numbered mono, 16-bit clips 01.wav–09.wav.
python3 production/njombe/scripts/prepare-audio.py /path/to/voice-clips out/njombe/audio --tempo 1.2
npm --prefix production/njombe run render -- stills
npm --prefix production/njombe run render -- reel
```

`voice-cues.json` is the Kiswahili caption script (the CTA is spoken as the word parachichi); `english-cues.json` holds the English translation. Audio prep assembles and normalizes WAV, then writes `props.json` and both SRTs measured against the audio. To re-render with the same voice without raw clips, use the identical `narration.wav` and `props.json` in `out/njombe/audio/`. The deliverables are exported under ignored `out/njombe/` and delivered via Drive, not committed to the repo.
