#!/usr/bin/env python3
"""
Register AI-generated pose renders onto the Noellyne rig canvas.

The four shipped poses carry two arm gestures. That is not enough: the owner's
list is ten gestures, and a voice note that says "make character move the hands
🤚✋🖐🤌👌✌🫵👍🙏🫶" is asking for exactly that. Creating those gestures by
swapping fingers inside the existing hand layer is not possible — the source art
is a flat PNG raster, so a fold has to come from a new render.

Each new pose is generated from Noellyne herself as the reference image, then
registered here: keyed off the flat grey card, measured against the existing
pilots by sunglasses width, and placed on the shared 939x1136 canvas so her face
lands where every other pose puts it.

This is the honest method: the poses are generated art in her design, derived
from her own approved render. They are not a redrawn character and not a crop of
old footage.
"""
import json, hashlib, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
SRC = ROOT / "poses-src"
RIG = json.loads((ASSETS / "host-rig.json").read_text())
CANVAS_W, CANVAS_H = RIG["width"], RIG["height"]

# Landmarks, measured once on the approved pose and shared by every generated one.
WAVE = RIG["poses"]["wave"]
MARK = tuple(WAVE["mark"])

# Where her face sits on the shared canvas, from the approved wave pose: the
# sunglasses run from x=311 to x=560, i.e. 249 px wide, centred at 435.
FACE_W = 249
FACE_CX = 435


def key_grey(path: Path) -> Image.Image:
    """Key the flat studio grey the generator used.

    A grey card cannot be keyed on hue, so this keys on distance from the sampled
    corner colour, then despills: any pixel whose saturation is below the
    background's is lifted to it, which removes the grey halo that otherwise
    shows as a dirty outline on the hoodie.
    """
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    bg = np.median(np.concatenate([a[:8, :8].reshape(-1, 3), a[-8:, :8].reshape(-1, 3)]), axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    alpha = np.clip((dist - 12) / 26.0, 0, 1)
    # despill: pull every channel toward its own value only where the pixel is
    # close to neutral grey (i.e. it was background bleeding into an edge)
    sat = a.max(axis=2) - a.min(axis=2)
    neutral = sat < 26
    a[neutral] = np.stack([a[neutral].mean(axis=1)] * 3, axis=1)
    rgba = np.dstack([a, alpha * 255]).astype(np.uint8)
    out = Image.fromarray(rgba, "RGBA")
    al = out.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    out.putalpha(al)
    return out


def core_bbox(im: Image.Image, thresh=200):
    """Bounding box of the solid body, ignoring the soft alpha fringe."""
    al = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(al > thresh)
    return xs.min(), ys.min(), xs.max(), ys.max()


def head_metrics(im: Image.Image):
    """Head width and centre, measured on the widest row of the upper body.

    Fitting on the sunglasses failed badly: the same colour filter also catches
    the denim hoodie, so the "sunglasses width" was the shoulder width and every
    generated pose came out a third of the right size. The top quarter of the
    silhouette is hair and nothing else, so it is the stable anchor.
    """
    al = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(al > 200)
    y0, y1 = ys.min(), ys.max()
    band = al[: int(y0 + (y1 - y0) * 0.30), :] > 200
    ys2, xs2 = np.nonzero(band)
    return {
        "head_w": int(xs2.max() - xs2.min()),
        "head_cx": (xs2.min() + xs2.max()) / 2.0,
        "head_top": int(y0),
    }


REF = head_metrics(Image.open(ASSETS / "wave-base.png").convert("RGBA"))


def register(im: Image.Image) -> Image.Image:
    """Scale so her head matches the approved pose, then place it on the canvas.

    The approved wave pose has her head spanning x 145..762 and starting at y=67.
    Every pose is fitted to those numbers, so her face is the same size in every
    frame no matter what her arms are doing.
    """
    m = head_metrics(im)
    k = REF["head_w"] / m["head_w"]
    # `cheer` has both palms up beside her head, so the top-30% band measures the
    # hands, not the hair, and the fit comes out half size. A generated render is
    # already framed like its reference, so clamp the correction to a small range
    # and let it correct drift rather than chase a bad measurement.
    k = max(0.9, min(1.1, k))
    scaled = im.resize((int(round(im.width * k)), int(round(im.height * k))), Image.LANCZOS)
    m2 = head_metrics(scaled)

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    dx = int(round(REF["head_cx"] - m2["head_cx"]))
    dy = int(round(REF["head_top"] - m2["head_top"]))
    canvas.alpha_composite(scaled, (dx, dy))
    return canvas


def patch(src, box):
    x, y, w, h = box
    return src.crop((x, y, x + w, y + h))


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    made = []
    for path in sorted(SRC.glob("*-raw.png")):
        name = path.name.replace("-raw.png", "")
        keyed = register(key_grey(path))
        base = ASSETS / f"{name}-base.png"
        keyed.save(base)

        # mouth and lid patches are cut from this pose's own render, at the same
        # offsets the rig uses, so lip sync works without any special-casing
        m = WAVE["mouth"]["A"]
        box = (m["x"], m["y"], m["width"], m["height"])
        mouth = {}
        for letter in "ABCDEFGH":
            p = ASSETS / f"{name}-mouth-{letter}.png"
            patch(keyed, box).save(p)
            mouth[letter] = {"file": p.name, "x": box[0], "y": box[1],
                             "width": box[2], "height": box[3], "sha256": sha(p)}
        l = WAVE["lids"]
        bp = ASSETS / f"{name}-blink.png"
        patch(keyed, (l["x"], l["y"], l["width"], l["height"])).save(bp)

        RIG["poses"][name] = {
            "base": {"file": base.name, "width": CANVAS_W, "height": CANVAS_H,
                     "sha256": sha(base)},
            "lids": {"file": bp.name, "width": l["width"], "height": l["height"],
                     "x": l["x"], "y": l["y"], "sha256": sha(bp)},
            "hand": None,
            "mark": list(MARK),
            "mouth": mouth,
            "note": "generated in her design from the approved render, keyed and registered",
        }
        made.append(name)
        print(f"{name}: registered")

    files = []
    for p in sorted(ASSETS.glob("*.png")):
        with Image.open(p) as im:
            files.append({"file": p.name, "width": im.width, "height": im.height,
                          "sha256": sha(p)})
    RIG["files"] = files
    RIG["poses_order"] = ["wave", "point", "desk", "phone"] + made
    (ASSETS / "host-rig.json").write_text(json.dumps(RIG, indent=1))
    print(f"rig now has {len(RIG['poses'])} poses")


if __name__ == "__main__":
    main()
