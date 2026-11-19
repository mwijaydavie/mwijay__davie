# UAUT Connect · Tulipata nafasi

[Story and source boundaries](../../content/pilots/04-uaut-connect.md) · [Instagram copy, alt text and English adaptation](../../content/pilots/04-uaut-caption.txt).

`UautCarousel` renders five 1080 × 1350 slides. `UautReel` is white-first, 1080 × 1920 / 60 fps, with an SVG connection from student to university, real nav from frame zero, the original logo crop, and Kiswahili narration. The steps are an illustration; programme names are sourced text. No applicant data, background poster, enrolment figures or admission result.

```sh
npm ci --prefix production/uaut
# Pillow for crops, FFmpeg for voice assembly. Pass --ffmpeg if not on PATH.
python3 production/uaut/scripts/prepare-captures.py /path/to/owner-captures out/uaut/assets
python3 production/uaut/scripts/prepare-audio.py /path/to/approved-sw-wavs out/uaut/audio
CHROME_PATH=/path/to/compatible/chromium npm --prefix production/uaut run render -- all
```

The crop script expects two exact owner-supplied screenshots (hashes and dimensions in the script); recheck the boundaries before replacing them. `voice-cues.json` maps clips `01.wav`–`04.wav` to shots, SW and EN captions. Tempo defaults to 0.92×; the assembly rejects acceleration and any duration of 25 s or longer. `stills` exports the slides, phone QA keyframes and cover only; `reel` only exports MP4. `UAUT_OUT` can override the output root. Raw captures, audio and renders stay in ignored folders, not Git. Validate encoded playback, captions, phone-scale readability and checksums before handoff.
