# Ship vs Shipped

**Review:** <https://drive.google.com/file/d/1-SFh6YdVqiKMBHHVFyMfThK8hbUwkbE-/view>
1080×1920 · 60 fps · 31.22 s · H.264 yuv420p + AAC 48 kHz

## The angle

A dev Reel that is not "look at my stack". The claim is narrow and provable:
**there is a difference between code that runs and software an organisation can
use on a Monday morning** — and every number on screen was measured in this
repository, not estimated.

| Beat | What the screen shows |
| --- | --- |
| hook | a code pane that passes its own test, and a question mark |
| gap | two panes side by side — `IT RUNS` / `IT IS USED` — with the gap drawn between them |
| auth | an access matrix: Teacher / Bursar / Parent / Owner against Marks / Fees / Contacts |
| empty | the empty state, then the same screen with a sample term filling in |
| offline | a request trace that flatlines at 42 %, and the queue that keeps going |
| receipt | the measured numbers, counting up |
| cta | `Comment SHIP` |

## Why it looks nothing like the Shule Reel

On purpose, so the two do not compete:

| | Shule Altra Reel | Ship vs Shipped |
| --- | --- | --- |
| palette | eggshell, warm | slate + mint, night-editorial |
| subject | the product UI | code, matrices, traces |
| her | large, presenter-led | small, in the margin |
| set | classroom plate | same plate at 20–26 %, much darker wash |

## Measured numbers

`facts.json` is generated, not typed. Reproduce:

```sh
PYTHONPATH=.cache/rt python3 - <<'PY'
import json
from pathlib import Path
prods = sorted(p for p in Path('production').iterdir() if p.is_dir())
mjs = list(Path('production').rglob('*.mjs')) + list(Path('production').rglob('*.js'))
r = json.load(open('production/noellyne-host/assets/host-rig.json'))
print(json.dumps({
  "projects": len(prods),
  "with_readme": sum(1 for p in prods if (p/'README.md').exists()),
  "js_files": len(mjs),
  "js_lines": sum(len(open(f, encoding='utf8', errors='ignore').readlines()) for f in mjs),
  "checks": len(list(Path('production').rglob('*check*'))) + len(list(Path('production').rglob('*.test.*'))),
  "poses": len(r['poses']),
  "mouth_shapes": sum(len(p.get('mouth', {})) for p in r['poses'].values()),
}, indent=1))
PY
```

At the time of this cut: 19 projects, 17 with a README, 67 source files,
6 166 lines, 15 checks, 9 poses, 72 mouth shapes.

**What the numbers do not say.** They count files and lines in this repository.
They are not a quality score, not a performance figure and not a client result.
Nothing here claims adoption, reliability in production, or that any school runs
this.

## Build

```sh
export FFMPEG="$PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2"
PYTHONPATH=.cache/rt python3 production/ship-vs-shipped/mix.py
PYTHONPATH=.cache/rt python3 production/noellyne-host/lipsync.py \
  production/ship-vs-shipped/out/mix.wav production/ship-vs-shipped/out/mouth.json --fps 60
node production/ship-vs-shipped/render.mjs \
  production/ship-vs-shipped/out/ship.mp4 production/ship-vs-shipped/out/mix.wav
```

`--proof=N` renders the first N frames. The full 1 873 frames take about 135 s.

## Voice

Scratch Kiswahili TTS for review. `copy.json` holds the exact script plus the
English sidecar for the owner's own read. The bed is a single low tick on each
scene change — no melody, no riser, no whoosh, because this episode is about
restraint.
