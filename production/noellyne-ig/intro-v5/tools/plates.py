"""V5 plates: clean cutouts of the approved likeness + mouth/eye/neck geometry.

Rebuilt for V5 after the owner rejected V4's "pasted" cutouts. Changes:
  * The card platform and the baked-in caption bar are cropped out entirely
    (crop ends at y=1398, above the platform at ~1400). V4 kept them, which is
    why the plate carried a stray bar and a bright ellipse.
  * The alpha edge is not eroded inward by a large feather; instead the mask is
    cleaned against the *gradient* of the source, so soft hair keeps its shape
    and hard edges stay hard.
  * Semi-transparent edges are recoloured from interior pixels
    (decontaminate) and any residual violet rim is cancelled (despill), which is
    what actually removes the purple fringe on a cream background.
  * Only the head+shoulders is kept; the bottom is a soft vignette to the card
    so the figure never ends on a straight line.

Writes .cache/noellyne-v5/plates/
"""
import json
import os
import sys
import warnings
from pathlib import Path

import numpy as np
from PIL import Image

warnings.filterwarnings("ignore")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT.parents[2] / ".cache" / "noellyne-v5"
FRAMES = CACHE / "frames"
OUT = CACHE / "plates"
LM = json.load(open(CACHE / "work" / "landmarks.json"))

sys.path.insert(0, str(CACHE / "work"))
from matte4 import alpha_for, decontaminate, despill  # noqa: E402

# Platform (~y1400) and the baked caption bar are cropped out: y1 max = 1398.
PLATES = {
    "phone": dict(src=1.30, box=(70, 560, 530, 1390)),
    "host": dict(src=7.60, box=(600, 500, 1060, 1390)),
    "point": dict(src=21.00, box=(600, 470, 1075, 1390)),
    "desk": dict(src=16.40, box=(600, 500, 1060, 1390)),
}


def frame(t):
    idx = int(round(t * 30)) + 1
    return np.asarray(Image.open(FRAMES / f"f_{idx:04d}.png").convert("RGB"))


def near(t):
    """Nearest frame with usable face landmarks (detection is spotty on wide shots)."""
    keys = [float(k) for k, v in LM.items() if v]
    return LM[f"{min(keys, key=lambda k: abs(k - t)):.4f}"]


def bottom_vignette(a, height=120, start=0.55):
    """Fade the plate into the card instead of ending on a hard horizontal line."""
    h = a.shape[0]
    y0 = int(h * start)
    yy = np.arange(h)[:, None].astype(np.float32)
    ramp = np.clip((h - yy) / max(1.0, (h - y0)), 0, 1) ** 1.35
    return a * ramp


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    for name, cfg in PLATES.items():
        x0, y0, x1, y1 = cfg["box"]
        src = frame(cfg["src"])
        a = alpha_for(src, grow=5, feather=1.2)
        rgb = despill(decontaminate(src, a, iters=4), a)
        sub_a = bottom_vignette(a[y0:y1, x0:x1])
        sub = np.dstack([rgb[y0:y1, x0:x1], (sub_a * 255).astype(np.uint8)])
        Image.fromarray(sub, "RGBA").save(OUT / f"plate-{name}.png")

        v = near(cfg["src"])
        loc = lambda k: [round(v[k][0] - x0, 1), round(v[k][1] - y0, 1)]  # noqa: E731
        chin = loc("152")
        eyes = loc("168")
        meta[name] = dict(
            size=[x1 - x0, y1 - y0],
            src=cfg["src"],
            lips={k: loc(k) for k in ("61", "291", "13", "14")},
            neck=[round(chin[0], 1), round(chin[1] + 26, 1)],
            head=[round(eyes[0], 1), round(eyes[1], 1)],
            mouthW=round((loc("291")[0] - loc("61")[0]), 1),
            eyes_box=[round(loc("33")[0]), round(min(loc("159")[1], loc("374")[1]) - 46),
                      round(loc("263")[0]), round(max(loc("159")[1], loc("374")[1]) + 46)],
        )
        print(name, meta[name]["size"], "neck", meta[name]["neck"], "head", meta[name]["head"])
    json.dump(meta, open(OUT / "plates.json", "w"), indent=1)
    print("wrote", OUT / "plates.json")


if __name__ == "__main__":
    build()
