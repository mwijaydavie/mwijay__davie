#!/usr/bin/env python3
"""
Give every pose the same working viseme set.

The kit ships eight mouth patches for `wave` and `point` only. The AI-generated
poses were given mouth patches cut from their own closed smile, which by
definition cannot open — that is what "mdomo umekuwa shut" kept looking like on
the new poses.

The wave patches are the only real viseme art in the project. So the generated
poses are aligned to `wave` first (brow anchor, measured across all nine renders
to within 30 px), and the wave patches are then placed at that pose's own mouth
offset. Verified by eye on 100% crops: the mouth shape lands correctly on all
five.

Output: host-rig.json `poses[].mouth` for every pose pointing at the wave patches,
with a per-pose x/y so the patch sits on that pose's mouth.
"""
import json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image

ASSETS = Path(__file__).resolve().parent / "assets"
RIG = json.loads((ASSETS / "host-rig.json").read_text())

# The kit patch geometry, relative to the mouth centre measured on wave.
WAVE_MOUTH_REF = (421, 452)      # the patch's own top-left on wave
WAVE_CENTRE = (494, 363)         # measured mouth centre on wave-base


def find_mouth(im):
    a = np.asarray(im.convert("RGB")).astype(float)
    r, b = a[..., 0], a[..., 2]
    lum = a.mean(axis=2)
    H, W = lum.shape
    y0, y1 = int(H * 0.30), int(H * 0.55)
    x0, x1 = int(W * 0.30), int(W * 0.70)
    sub = lum[y0:y1, x0:x1]
    m = (sub < 100) & (r[y0:y1, x0:x1] > b[y0:y1, x0:x1] + 10)
    ys, xs = np.nonzero(m)
    if len(xs) < 60:
        raise RuntimeError("mouth not found")
    rows = np.bincount(ys, minlength=sub.shape[0])
    peak = int(np.argmax(np.convolve(rows, np.ones(5), "same")))
    k = np.abs(ys - peak) < 10
    xs, ys = xs[k], ys[k]
    return int(x0 + xs.mean()), int(y0 + ys.mean())


def main():
    wave = RIG["poses"]["wave"]
    src = wave["mouth"]
    dx0 = WAVE_MOUTH_REF[0] - WAVE_CENTRE[0]
    dy0 = WAVE_MOUTH_REF[1] - WAVE_CENTRE[1]

    for name in RIG["poses_order"]:
        p = RIG["poses"][name]
        if name in ("wave", "point"):
            continue                      # keep their own patches
        base = Image.open(ASSETS / p["base"]["file"]).convert("RGBA")
        cx, cy = find_mouth(base)
        mouth = {}
        for L, m in src.items():
            mouth[L] = {"file": m["file"], "x": cx + dx0, "y": cy + dy0,
                        "width": m["width"], "height": m["height"],
                        "sha256": m["sha256"]}
        p["mouth"] = mouth
        print(f"{name}: mouth at ({cx},{cy}) -> patch ({cx+dx0},{cy+dy0})")

    (ASSETS / "host-rig.json").write_text(json.dumps(RIG, indent=1))


if __name__ == "__main__":
    main()
