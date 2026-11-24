#!/usr/bin/env python3
"""
Put the Altraware mark on her hoodie badge, on every pose.

Two things went wrong before this version, and both are worth not repeating:

1. Finding the badge by colour. A pale rectangle on pale denim, next to a pale
   sleeve badge and a pale hood edge, is not a colour problem. The rectangles
   here were found by flood-filling pale, low-saturation regions and taking the
   largest blob near the chest. That is stable on every pose — and it found that
   the old hand-typed `desk` box was on the wrong patch entirely.

2. Wiping the badge back to "knit" and then drawing the mark. The wipe replaced a
   real printed patch with a flat lilac card and left a hard rectangle across her
   chest. The patch is already part of the artwork. Keep it, and print into it.

So: the pale patch stays exactly as rendered, the mark is multiplied into it at
the badge's own aspect, and a little of the real knit grain is borrowed back over
the top so the print sits in the fabric instead of on a card.

Rebuild the source bases before re-running:
  unzip "Altraware - Shule Altra (Owner Kit).zip" -> wave, point, desk, phone
  PYTHONPATH=.cache/rt python3 build-poses-generated.py      -> the other five
"""
import json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image

ASSETS = Path(__file__).resolve().parent / "assets"
RIG = json.loads((ASSETS / "host-rig.json").read_text())
MARK = Image.open(ASSETS / "altraware.png").convert("RGBA")

# x0, y0, x1, y1 — flood-filled from the pale patch, per pose, on the clean base.
BADGES = {
    "wave":     (542, 709, 598, 737),
    "point":    (542, 709, 598, 737),
    "desk":     (542, 721, 592, 744),
    "phone":    (552, 720, 608, 749),
    "cheer":    (557, 652, 608, 676),
    "ok":       (550, 679, 603, 705),
    "peace":    (568, 644, 618, 669),
    "pray":     (541, 709, 597, 736),
    "thumbsup": (541, 709, 597, 737),
    "present":  (541, 707, 599, 735),
    "one":      (541, 707, 599, 735),
    "hold":     (541, 707, 599, 735),
}
COVER = 0.94      # how much of the patch height the print fills
INK = 0.97        # print opacity
GRAIN = 0.20      # how much real knit texture is put back over the print
PATCH = 0.86      # the patch is cream, not white; knock it back into the denim


def apply(im: Image.Image, box) -> Image.Image:
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    base = np.asarray(im.convert("RGBA")).astype(np.float32)
    out = base.copy()

    # 1. the print, multiplied onto the patch
    mh = max(6, int(h * COVER))
    mw = int(MARK.width * (mh / MARK.height))
    if mw > w * 0.80:
        mw = int(w * 0.80)
        mh = max(5, int(MARK.height * (mw / MARK.width)))
    mk = np.asarray(MARK.resize((mw, mh), Image.LANCZOS)).astype(np.float32)
    mx, my = x0 + (w - mw) // 2, y0 + (h - mh) // 2

    region = out[my:my + mh, mx:mx + mw, :3]
    alpha = (mk[..., 3:4] / 255.0) * INK
    out[my:my + mh, mx:mx + mw, :3] = region * (1 - alpha) + region * (mk[..., :3] / 255.0) * alpha

    # 2. the patch itself: cream reads as a white sticker at 100 %. Warm it down
    #    toward the hoodie so it looks dyed rather than pasted on.
    out[y0:y1, x0:x1, :3] *= PATCH

    # 3. borrow knit grain from just below the patch, so the print is not glassy
    src = out[min(y1 + 6, out.shape[0] - h):][:h, x0:x1, :3]
    if src.shape[:2] == (h, w):
        lum = src.mean(axis=2, keepdims=True)
        grain = (lum - lum.mean()) / 255.0 * GRAIN
        patch = out[y0:y1, x0:x1, :3] * (1.0 + grain)
        out[y0:y1, x0:x1, :3] = np.clip(patch, 0, 255)

    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")


def main():
    import sys
    wanted = set(sys.argv[1:])
    check = []
    for name in RIG["poses_order"]:
        if wanted and name not in wanted:
            continue
        p = RIG["poses"][name]
        box = BADGES.get(name)
        if not box:
            print(f"{name}: no measured badge, skipped")
            continue
        f = ASSETS / p["base"]["file"]
        res = apply(Image.open(f), box)
        res.save(f)
        p["base"]["sha256"] = hashlib.sha256(f.read_bytes()).hexdigest()
        p["mark"] = None          # baked in; the renderer must not paint a second
        p["badge"] = list(box)
        check.append((name, res.crop((box[0] - 26, box[1] - 22, box[2] + 26, box[3] + 22))))
        print(f"{name}: mark at {box}")

    if check:
        W = max(c.width for _, c in check)
        H = max(c.height for _, c in check)
        sheet = Image.new("RGB", (W * len(check), H), (255, 255, 255))
        for i, (_, c) in enumerate(check):
            sheet.paste(c.convert("RGB"), (i * W, 0))
        sheet.save(ASSETS.parent / "logo-check.png")

    (ASSETS / "host-rig.json").write_text(json.dumps(RIG, indent=1))


if __name__ == "__main__":
    main()
