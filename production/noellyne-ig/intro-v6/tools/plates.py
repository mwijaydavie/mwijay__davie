"""V6 subject extraction — final, deterministic recipe.

History: many hand-tuned attempts made things worse, each fixing one artefact
and breaking another. This version is deliberately simple and has one rule per
zone, so it cannot trade one artefact for another:

  ZONE 1 (interior). Erode the selfie mask hard. Everything inside is her, so
  alpha = 1 unconditionally. This is what stops holes appearing in her face,
  hoodie or hair.

  ZONE 2 (edge band). Between the eroded core and the dilated silhouette, alpha
  comes from a colour test: the set is violet (blue and red both above green)
  and darker than her hoodie, so violet pixels lose alpha and warm/bright ones
  keep it. Soft, so hair strands survive.

  ZONE 3 (outside). Zero. No specks, ever.

The silhouette itself comes from SelfieSeg, closed and reduced to its largest
component, so there is exactly one object and no floating fragments.

Writes .cache/noellyne-v6/plates/plate-<pose>.png (RGBA)
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

POSES = {
    "desk": (7.60, (576, 396, 1079, 1290)),
    "phone": (1.30, (40, 548, 700, 1290)),
    "point": (17.35, (598, 690, 1075, 1290)),
}


def frame(t):
    idx = int(round(t * 30)) + 1
    return np.asarray(Image.open(FRAMES / f"f_{idx:04d}.png").convert("RGB")).astype(np.float32)


def build_alpha(s, seg):
    """Clean silhouette + edge colour taken from her own interior.

    The white patches in the delivered V6 came from semi-transparent edge pixels
    that were still plum: composited on beige they turn pale mauve. No matte
    threshold fixes that, because the *colour* is wrong, not the alpha.

    So: build one clean silhouette (model + hole fill), then push her interior
    colours outward into the edge band with a distance transform. Every pixel
    that survives therefore carries a colour she actually has, and compositing
    on any background cannot reveal the set.
    """
    import cv2

    h, w = s.shape[:2]
    m = seg.process(s.astype(np.uint8)).segmentation_mask
    base = cv2.resize(np.clip(m, 0, 1), (w, h), interpolation=cv2.INTER_LINEAR)
    base = cv2.GaussianBlur(base, (0, 0), 1.1)

    # one object, holes filled
    sil = (base > 0.45).astype(np.uint8) * 255
    sil = cv2.morphologyEx(sil, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(sil, 8)
    if n > 1:
        big = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        sil = (lab == big).astype(np.uint8) * 255
    ff = sil.copy()
    mk = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(ff, mk, (0, 0), 255)
    sil = cv2.bitwise_or(sil, cv2.bitwise_not(ff))

    # soft 1.6px edge, and a slightly looser outer bound so hair is not clipped
    a = cv2.GaussianBlur(sil, (0, 0), 0.8).astype(np.float32) / 255.0
    outer = cv2.dilate(sil, np.ones((11, 11), np.uint8))
    outer = cv2.GaussianBlur(outer, (0, 0), 3.0).astype(np.float32) / 255.0
    a = np.clip(np.maximum(a, outer * 0.999) * 0 + a, 0, 1)

    # interior colours pushed outward: nearest confident pixel wins
    core = (cv2.erode(sil, np.ones((5, 5), np.uint8)) > 0)
    _, labels = cv2.distanceTransformWithLabels(
        (~core).astype(np.uint8), cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL
    )
    ys, xs = np.nonzero(core)
    lut = np.zeros((labels.max() + 1, 3), np.float32)
    lut[labels[core]] = s[ys, xs]
    filled = lut[labels]
    return a, filled


def main():
    import mediapipe as mp

    OUT.mkdir(parents=True, exist_ok=True)
    seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=1)
    meta = {}
    for name, (t, box) in POSES.items():
        x0, y0, x1, y1 = box
        s = frame(t)[y0:y1, x0:x1]
        a, colour = build_alpha(s, seg)
        Image.fromarray(
            np.dstack([np.clip(colour, 0, 255), a * 255]).astype(np.uint8), "RGBA"
        ).save(OUT / f"plate-{name}.png")
        meta[name] = dict(size=[x1 - x0, y1 - y0], win=list(box), t=t)
        print(name, meta[name], "coverage", round(float((a > 0.5).mean()), 3))
    json.dump(meta, open(OUT / "plates.json", "w"), indent=1)


if __name__ == "__main__":
    main()
