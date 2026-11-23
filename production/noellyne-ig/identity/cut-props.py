#!/usr/bin/env python3
"""
Cut the props out of their white studio backgrounds.

The owner asked for "real reference za vitu kama picha … umezicut out vyema".
Drawn props were fine at banner size and wrong at feed size: a hand-drawn mug
has no reflection, no rim light, no thickness, and it reads as clip art next to
a rendered character.

The sources in `props-src/` are generated product shots on seamless white. The
cut is three passes, because a single luminance key eats the white mug and
leaves a white halo on everything:

  1. **outside flood** — everything reachable from the border through pixels
     that are near-white AND low-saturation. This is the true background, and
     it cannot leak into the mug because the mug's rim is not near-white.
  2. **enclosed whites** — near-white pockets the flood could not reach are
     *inside* the object (a highlight on the mug, the gap in the handle), so
     they stay opaque.
  3. **edge decontamination** — the boundary pixels are a blend of object and
     white background. Un-premultiplying pulls the white out of them, which is
     what removes the halo.

Outputs: `props/*.png` — RGBA, trimmed, with a 2 px transparent gutter.
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

HERE = Path(__file__).resolve().parent
SRC = HERE / "props-src"
OUT = HERE / "props"
OUT.mkdir(exist_ok=True)

WHITE = 240          # measured: the seamless is 246–255 on every source
SAT_MAX = 16         # …and only if it has almost no colour
FEATHER = 1.6        # px of blur on the final alpha


def border_holes(bg: np.ndarray) -> np.ndarray:
    """Transparent pixels that are reachable from the border.

    A key on luminance alone punches out anything white, and a white mug is
    white. What separates the mug's rim from the backdrop is not its value —
    it is that the rim is *surrounded by mug*. So the alpha does not trust the
    key: it keeps only the background it can walk to from the frame edge, and
    everything else is sealed. Holes the key opened inside the object get
    filled from the nearest opaque neighbour.
    """
    h, w = bg.shape
    reach = np.zeros((h, w), bool)
    stack = [(y, x) for x in range(w) for y in (0, h - 1) if bg[y, x]]
    stack += [(y, x) for y in range(h) for x in (0, w - 1) if bg[y, x]]
    while stack:
        y, x = stack.pop()
        if reach[y, x] or not bg[y, x]:
            continue
        reach[y, x] = True
        if y > 0: stack.append((y - 1, x))
        if y < h - 1: stack.append((y + 1, x))
        if x > 0: stack.append((y, x - 1))
        if x < w - 1: stack.append((y, x + 1))
    return reach


def seal(img_rgba: Image.Image, reach: np.ndarray) -> Image.Image:
    """Fill every enclosed transparent pocket by expanding the outside inward."""
    a = np.array(img_rgba)
    hole = ~reach
    # iterative push of colour into the holes from the sealed region
    filled = a.copy()
    known = hole.copy()
    for _ in range(400):
        if not known.any():
            break
        grew = known.copy()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            shifted_known = np.roll(known, (dy, dx), axis=(0, 1))
            shifted_fill = np.roll(filled, (dy, dx), axis=(0, 1))
            take = known & shifted_known
            if take.any():
                filled[take] = shifted_fill[take]
                grew[take] = False
        known = grew
    out = Image.fromarray(filled, "RGBA")
    return out


def key(img: Image.Image) -> Image.Image:
    rgb = np.array(img.convert("RGB")).astype(np.float32)
    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    # Pass 1 floods the clean white backdrop only (strict, so it cannot eat a
    # white mug or a pale leaf). Pass 2 then grows that region into the soft grey
    # contact shadow the generator drew — but only into pixels the strict mask
    # could not reach, and only where they are colourless and contiguous with
    # the backdrop. A shadow under an object is exactly that; the inside of the
    # mug is not.
    near_white = (lum > WHITE) & (sat < SAT_MAX)
    shadow = (lum > 170) & (sat < 16)

    # ── 1. flood the background in from the border
    h, w = near_white.shape
    bg = np.zeros((h, w), bool)
    stack = []
    for x in range(w):
        for y in (0, h - 1):
            if near_white[y, x]:
                stack.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near_white[y, x]:
                stack.append((y, x))
    while stack:
        y, x = stack.pop()
        if bg[y, x] or not near_white[y, x]:
            continue
        bg[y, x] = True
        if y > 0: stack.append((y - 1, x))
        if y < h - 1: stack.append((y + 1, x))
        if x > 0: stack.append((y, x - 1))
        if x < w - 1: stack.append((y, x + 1))

    # grow into the shadow: one dilation step at a time keeps it honest
    for _ in range(6):
        grow = bg.copy()
        grow[1:, :] |= bg[:-1, :]
        grow[:-1, :] |= bg[1:, :]
        grow[:, 1:] |= bg[:, :-1]
        grow[:, :-1] |= bg[:, 1:]
        bg = grow & shadow

    alpha = np.where(bg, 0.0, 1.0).astype(np.float32)

    # ── 3. decontaminate the rim: undo the blend with white
    a_img = Image.fromarray((alpha * 255).astype(np.uint8), "L")
    edge = np.array(a_img.filter(ImageFilter.FIND_EDGES)).astype(np.float32)
    edge = np.array(Image.fromarray(edge.astype(np.uint8), "L")
                    .filter(ImageFilter.GaussianBlur(2.2))).astype(np.float32) / 255.0
    edge = np.clip(edge * 2.4, 0, 1)
    # a = 1 - k where white bleeds in; re-scale the colour by 1/a
    a = np.clip(1.0 - edge * 0.30, 0.62, 1.0)
    rgb_out = np.clip((rgb - (1.0 - a[..., None]) * 255.0) / np.maximum(a[..., None], 0.35), 0, 255)
    rgb_out = rgb * (1 - edge[..., None] * 0.14) + rgb_out * (edge[..., None] * 0.14)

    base = Image.fromarray(np.dstack([rgb_out, alpha * 255]).astype(np.uint8), "RGBA")
    reach = border_holes(bg)
    out = seal(base, reach)
    out.putalpha(out.split()[-1].filter(ImageFilter.GaussianBlur(FEATHER)))

    box = out.split()[-1].getbbox()
    if box:
        x0, y0, x1, y1 = box
        out = out.crop((max(0, x0 - 2), max(0, y0 - 2), min(out.width, x1 + 2), min(out.height, y1 + 2)))
    return out


def main():
    made = {}
    for src in sorted(SRC.glob("*.jpg")):
        img = Image.open(src)
        cut = key(img)
        dst = OUT / f"{src.stem}.png"
        cut.save(dst)
        made[src.stem] = dict(file=dst.name, w=cut.width, h=cut.height)
        print(f"{src.stem:10s} {img.width}x{img.height} -> {cut.width}x{cut.height}")
    (OUT / "props.json").write_text(json.dumps(made, indent=2))
    print(f"wrote {OUT/'props.json'}")


if __name__ == "__main__":
    main()
