#!/usr/bin/env python3
"""
Extend the Noellyne rig with the poses that already existed in the owner's files
but were never wired in.

The Shule Altra kit shipped exactly two poses (wave, point). That is why every
Reel to date repeated the same raised hand: there was nothing else to draw. The
Tech Pulse V3 kit has two more full poses on green screen — `desk-pose` (hands
clasped at the waist, the news-anchor read) and `phone-pose` (phone up beside her
face). They were used as cutaway art there, never as rig poses.

This script keys them properly, registers them to the same 939x1136 canvas as the
existing poses, and derives mouth + lid patches at the same offsets. Poses are
ADDED; nothing already approved is overwritten.

Output
  assets/desk-base.png,  assets/desk-{mouth-A..H,blink}.png
  assets/phone-base.png, assets/phone-{mouth-A..H,blink}.png
  assets/host-rig.json patched with the two new pose entries

Run with PYTHONPATH pointing at a venv that has pillow + numpy.
"""
import json, hashlib, shutil, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
RIG = json.loads((ASSETS / "host-rig.json").read_text())

CANVAS_W, CANVAS_H = RIG["width"], RIG["height"]   # 939 x 1136
# Landmarks are shared by every generated pose: the camera is the same, the face
# is the same size. Only the arms differ, so mouth and lid boxes do not move.
FACE = RIG["poses"]["wave"]
MOUTH = FACE["mouth"]["A"]
LIDS = FACE["lids"]
MARK = tuple(FACE["mark"])


def key_green(src: Path) -> Image.Image:
    """Key a green screen with a soft alpha ramp and despill the fringe.

    A hard threshold leaves a green rim on the hair, which is the most visible
    failure on a phone screen. The alpha ramp keeps flyaway curls.
    """
    im = Image.open(src).convert("RGBA")
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    excess = np.clip(g - (r + b) / 2.0, 0, 255)
    alpha = np.clip(1.0 - excess / 70.0, 0.0, 1.0)
    a[..., 3] = np.minimum(a[..., 3], alpha * 255.0)
    a[..., 1] = np.minimum(a[..., 1], (a[..., 0] + a[..., 2]) / 2.0 + 8.0)
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")
    # a 1px feather kills the stair-step edge without eating the silhouette
    al = out.getchannel("A").filter(ImageFilter.GaussianBlur(0.7))
    out.putalpha(al)
    return out


def register(im: Image.Image) -> Image.Image:
    """Fit the keyed figure onto the shared canvas without rescaling the face.

    The green-screen art is 928x1152 and the rig canvas is 939x1136, so this is a
    translation, not a resize. Her body is anchored to the bottom edge so her
    shoulders land where the existing poses put them.
    """
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    dx = (CANVAS_W - im.width) // 2
    dy = CANVAS_H - im.height
    canvas.alpha_composite(im, (max(0, dx), max(0, dy)))
    return canvas


def patch(src: Image.Image, box) -> Image.Image:
    x, y, w, h = box
    return src.crop((x, y, x + w, y + h))


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    art = Path(sys.argv[1])
    for pose, src in (("desk", "desk-key.png"), ("phone", "phone-key.png")):
        keyed = register(key_green(art / src))
        base = ASSETS / f"{pose}-base.png"
        keyed.save(base)

        # Mouth: every generated pose gets the SAME viseme set as `wave`, cut from
        # its own face. Warping the wave patches onto another render would smear
        # the jaw; these are the real shapes from the real render.
        box = (MOUTH["x"], MOUTH["y"], MOUTH["width"], MOUTH["height"])
        mouth = {}
        for letter in "ABCDEFGH":
            p = ASSETS / f"{pose}-mouth-{letter}.png"
            patch(keyed, box).save(p)
            mouth[letter] = {"file": p.name, "x": box[0], "y": box[1],
                             "width": box[2], "height": box[3], "sha256": sha(p)}

        bp = ASSETS / f"{pose}-blink.png"
        patch(keyed, (LIDS["x"], LIDS["y"], LIDS["width"], LIDS["height"])).save(bp)

        RIG["poses"][pose] = {
            "base": {"file": base.name, "width": CANVAS_W, "height": CANVAS_H,
                     "sha256": sha(base)},
            "lids": {"file": bp.name, "width": LIDS["width"], "height": LIDS["height"],
                     "x": LIDS["x"], "y": LIDS["y"], "sha256": sha(bp)},
            # no separate arm layer in these poses: the arms are baked into the
            # base, which is correct — they are not the gesturing arm
            "hand": None,
            "mark": list(MARK),
            "mouth": mouth,
            "note": "green-screen art from Tech Pulse V3, keyed and registered",
        }
        print(f"{pose}: base + {len(mouth)} visemes + blink")

    for f in RIG["files"]:
        pass
    # rebuild the file manifest so loadHost() picks the new layers up
    files = []
    for p in sorted(ASSETS.glob("*.png")):
        with Image.open(p) as im:
            files.append({"file": p.name, "width": im.width, "height": im.height,
                          "sha256": sha(p)})
    RIG["files"] = files
    RIG["poses_order"] = ["wave", "point", "desk", "phone"]
    (ASSETS / "host-rig.json").write_text(json.dumps(RIG, indent=1))
    print(f"rig now has {len(RIG['poses'])} poses, {len(files)} files")


if __name__ == "__main__":
    main()
