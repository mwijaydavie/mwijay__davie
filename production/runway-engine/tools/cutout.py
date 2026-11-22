"""Cut a character out of a flat-ish backdrop and write a transparent PNG.

    python3 tools/cutout.py <in.png> <out.png> [--bg purple|auto]

Written for the generated portrait used as the channel character: a purple gradient
backdrop, subject in warm browns. The mask is a colour test plus a flood fill from the
frame edge, so a region of similar colour inside the art is never punched out.
No ML model, no download, deterministic.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter


def _passes(a, mode):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if mode == "purple":
        # backdrop: blue clearly above red, red clearly above green, and not too dark
        return (b > r + 16) & (b > g + 30) & (b > 50) & (g < b - 25)
    # auto: match within a tolerance of the median corner colour
    corners = np.stack([a[0, 0], a[0, -1], a[-1, 0], a[-1, -1]])
    ref = np.median(corners, axis=0)
    return np.abs(a - ref).sum(axis=2) < 90


def cut(path_in, path_out, mode="purple", pad=8):
    im = Image.open(path_in).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    bg = _passes(a, mode)

    # flood from the border so only backdrop connected to the frame is removed
    seen = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if bg[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if bg[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and bg[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))

    mask = Image.fromarray(((~seen) * 255).astype(np.uint8))
    # close pinholes, then shave the 1px halo where the subject picked up backdrop colour
    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    mask = mask.filter(ImageFilter.GaussianBlur(0.7))  # feather the edge

    out = Image.new("RGBA", (w, h))
    out.paste(im, (0, 0))
    out.putalpha(mask)
    bbox = out.getbbox()
    if bbox:
        out = out.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad),
                        min(w, bbox[2] + pad), min(h, bbox[3] + pad)))
    out.save(path_out)
    kept = (np.asarray(mask) > 128).mean() * 100
    print(f"{path_out}  {out.size[0]}x{out.size[1]}  subject {kept:.1f}% of frame")
    return out


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    mode = "purple" if "--bg" not in sys.argv else sys.argv[sys.argv.index("--bg") + 1]
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    cut(args[0], args[1], mode)
