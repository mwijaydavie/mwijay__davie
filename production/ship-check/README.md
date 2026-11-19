# Ship Check · carousel, Reel and release guide

A Kiswahili-first seven-slide Instagram carousel, a vertical Reel, and a three-page PDF per language. The **TEST** comment gets seven release checks, pass criteria, a worked example, a test-planning prompt and a printable worksheet. See the [pilot brief](../../content/pilots/02-ship-check.md), [project playbook](../../content/project-content-playbook.md) and [tech scan](../../content/research/2026-11-18-tech-scan.md).

## Proof

`lab.html` is an original teaching lab. Build A intentionally says “Saved” for in-memory state; B writes the same dummy note to browser storage. `render.mjs` isolates the builds, enters `QA-01`, clicks Save, checks the toast, reloads in the same browser and checks that A has zero notes and B has one matching note. It captures the forms before reload and ledgers afterward. Both formats use those browser captures. This does **not** test MwijayNote, AI behavior, cloud sync or a real service. The interrupted connection and duplicate-click scenes are instructions/expected outcomes, not observed incidents. The lab's page assets are served from the checkout, without deployment.

## Build

```sh
npm ci --prefix production/ship-check
CHROME_PATH=/path/to/chromium npm --prefix production/ship-check test
CHROME_PATH=/path/to/chromium npm --prefix production/ship-check run render

# Use the approved Kiswahili voice; clips 01.wav–08.wav follow reel-cues.json.
python3 production/ship-check/scripts/prepare-reel-audio.py /path/to/clips out/ship-check/audio --tempo 1.17
CHROME_PATH=/path/to/chromium npm --prefix production/ship-check run reel -- all
```

When `CHROME_PATH` is omitted the browser dependencies use their own installed browsers. The audio assembler requires FFmpeg on `PATH` or `--ffmpeg /path/to/binary`. Keep raw narration out of Git. If it must be regenerated, rebuild the timing and captions from the new audio. Use `SHIP_CHECK_OUT` to override the output root for both renderers.

Playwright creates the ordered **1080 × 1350** PNGs, searchable carousel review PDF, two A4 guides and proof receipts. Remotion's `ShipCheckReel` uses frame-derived motion and the same proof artwork, then renders **1080 × 1920**, **60 fps**, H.264/AAC MP4 with burned-in Kiswahili captions plus a cover. The assembler outputs separate Kiswahili and English SRT files. `npm ... run reel -- stills` previews each scene; `-- reel` renders only the MP4. Validate the decoded video (not just the stills) and CTA before upload.

## Handoff

Files under `out/ship-check/` are ignored render outputs, not durable links. For an owner handoff, upload the final files and verify remote sizes/checksums. Keep the private creative folder separate from the TEST guide link; verify audience access before using the guide link in a DM. No publishing or messaging is part of this build.
