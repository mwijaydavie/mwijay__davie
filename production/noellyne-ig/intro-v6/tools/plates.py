"""V6 subject extraction: real character from the approved footage, on paper.

After three failed matte strategies in V3-V5 the working recipe turned out to
be a HYBRID, which is what this file implements:

  * SelfieSeg supplies body coverage — shoulders, hoodie, hands.
  * A hue/luma test supplies the hair line. The plum set is both DARK and
    BLUE-dominant, while her hoodie is blue but BRIGHT and her hair is warm.
    Testing `luma < ~80 and blue-g > 0` therefore separates hair from set while
    keeping the hoodie, which no single model managed.
  * The two masks are combined (selfie keeps the body, hue sharpens the hair),
    then closed morphologically so hoodie shadow folds do not punch holes.

Composited onto the page beige, which is what makes the edge disappear: the few
semi-transparent pixels at the join are beige-on-beige.

Poses: desk (talking), phone (holding phone), point (pointing up).
Writes .cache/noellyne-v6/plates/plate-<pose>.png (RGBA) + plates.json
"""
import json
import os
import warnings
from pathlib import Path

import numpy as np
from PIL import Image

warnings.filterwarnings("ignore")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT.parents[2] / ".cache" / "noellyne-v6"
FRAMES = CACHE / "frames"
OUT = CACHE / "plates"

PAGE = np.array([238, 231, 218], dtype=np.float32)

POSES = {
    # name: source time, crop window (chosen to exclude every baked graphic)
    "desk": (7.60, (576, 396, 1079, 1290)),
    "phone": (1.30, (40, 548, 700, 1290)),
    "point": (17.35, (598, 690, 1075, 1290)),
}


def frame(t):
    idx = int(round(t * 30)) + 1
    return np.asarray(Image.open(FRAMES / f"f_{idx:04d}.png").convert("RGB")).astype(np.float32)


def alpha_for(s, seg):
    import cv2

    m = seg.process(s.astype(np.uint8)).segmentation_mask
    a_selfie = cv2.resize(np.clip(m, 0, 1), (s.shape[1], s.shape[0]), interpolation=cv2.INTER_LINEAR)

    b, g, r = s[..., 2], s[..., 1], s[..., 0]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    hue = b - g
    # the set: dark AND blue-dominant. 80 keeps hoodie shadows, drops the wall.
    bg = ((lum < 80) & (hue > 8)).astype(np.float32)
    bg = cv2.GaussianBlur(bg, (0, 0), 1.8)
    a_hue = np.clip(1 - bg, 0, 1)

    a = np.where(a_selfie > 0.55, np.maximum(a_selfie * 0.55, a_hue), a_selfie * a_hue * 1.25)
    a = np.clip(a, 0, 1)
    # close small holes (folds in the hoodie) without eating the hair
    a8 = (a > 0.45).astype(np.uint8) * 255
    a8 = cv2.morphologyEx(a8, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    a = np.maximum(a, cv2.GaussianBlur(a8, (0, 0), 2.5) / 255.0 * (a_selfie > 0.3))
    return np.clip(cv2.GaussianBlur(a, (0, 0), 0.9), 0, 1)


def build():
    import mediapipe as mp

    OUT.mkdir(parents=True, exist_ok=True)
    seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=1)
    meta = {}
    for name, (t, box) in POSES.items():
        x0, y0, x1, y1 = box
        src = frame(t)
        s = src[y0:y1, x0:x1]
        a = alpha_for(s, seg)
        rgba = np.dstack([np.clip(s, 0, 255), a * 255]).astype(np.uint8)
        Image.fromarray(rgba, "RGBA").save(OUT / f"plate-{name}.png")
        meta[name] = dict(size=[x1 - x0, y1 - y0], win=list(box), t=t)
        print(name, meta[name], "coverage", round(float((a > 0.5).mean()), 3))
    json.dump(meta, open(OUT / "plates.json", "w"), indent=1)
    print("wrote", OUT / "plates.json")


if __name__ == "__main__":
    build()
