# Menu iko wapi? · Altraware Website Action

A 32-second 1080×1920/60 fps Remotion cut using real Bongo Foodie showcase captures. [Pilot brief and evidence](../../content/pilots/09-website-action.md) · [post and one-DM copy](../../content/pilots/09-website-action-caption.txt).

**No deployment.** The pinned source is a separate project, copied into ignored cache. Use the public URL only as the intended audience destination; local QA is not a certification of that deployment. Leave `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` unset; do not use another project's env file. `capture.mjs` only serves the home/menu and local assets briefly, restricts browser requests to the sandbox, checks the tab's guest state and stops the server. Native hero link is followed with decorative JS/3D off, then client search runs in a fresh context; screenshot crops omit the displayed rating/cart controls and delivery copy. Meal data is fixture only.

## Rebuild

Node 22+, Python 3.11+ with Pillow for QA, Chrome, FFmpeg with libx264/libass/DejaVu Sans and ffprobe. Set `CHROME_PATH`, `FFMPEG_PATH`, `FFPROBE_PATH` and Chromium supporting library path as needed. Run from the repo root:

```sh
ref=f469acbb6dc3fb2274e87d8c1a22379fcda2ea36
work="$PWD/.cache/website-action/bongofoodie"
mkdir -p "$work"
curl -fLsS "https://codeload.github.com/mwijay12/bongofoodie/tar.gz/$ref" \
  | tar -xz -C "$work" --strip-components=1 "bongofoodie-$ref/web"
unset NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY NEXT_PUBLIC_SUPABASE_ANON_KEY
(cd "$work/web" && npm ci --ignore-scripts && NEXT_TELEMETRY_DISABLED=1 npm run build)
npm ci --prefix production/website-action
npm --prefix production/website-action run capture -- "$work/web"
# Five Swanglish reference takes 01..05.wav; trims/cut boundaries are in cues.json.
python3 production/website-action/prepare-voice.py /path/to/takes out/website-action/audio --ffmpeg "$FFMPEG_PATH"
npm --prefix production/website-action run reel -- all
python3 production/website-action/verify-and-pack.py out/website-action private-media/website-action \
  --ffmpeg "$FFMPEG_PATH" --ffprobe "$FFPROBE_PATH"
```

`reel -- stills` = keyframes + cover, `-- cover` = just the cover, `-- video` = both videos using the approved current stills, `-- caption` = replace narration + captions without re-rendering picture if same cut. To rebuild from the review kit, copy its `assets/`, `qa/capture-proof.json` and `voiceover/` (rename to `audio/`) into `out/website-action/` before calling Remotion; no original voices, order data or full site distribution needed. Quote the exact upstream commit if re-capturing. Recheck the actual audience site on a real phone before treating a DM link as ready for a live Reel.
