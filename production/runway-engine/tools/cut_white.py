"""Cut a character off a pure-white studio backdrop, with a clean hair edge.

    python3 tools/cut_white.py <in.png> <out.png> [--feather 0.8]

A white backdrop is the easy case for a flood fill and the hard case for hair: the
strands pick up white anti-aliasing, so a plain threshold leaves a pale halo that
glows the moment the cut-out sits on a dark background. Three passes fix it:

  1. flood fill from the frame edge (only backdrop connected to the border goes)
  2. drop any *interior* near-white pixel (the gaps between braids), so hair reads
     as hair instead of a solid comb
  3. erode the matte by one pixel and feather it, which removes the fringe the
     renderer blended with the backdrop
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter


def cut(src, dst, white=236, feather=0.8, pad=10, ground=True):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    h, w, _ = a.shape

    near_white = (a[..., 0] >= white) & (a[..., 1] >= white) & (a[..., 2] >= white)

    # 1 · flood the border
    seen = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near_white[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near_white[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and near_white[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))

    # 2 · any near-white pixel still standing is an interior gap (between braids)
    mask = (~seen) & (~near_white)
    m = Image.fromarray((mask * 255).astype(np.uint8))

    # 3 · close pinholes, shave the fringe, feather
    m = m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    m = m.filter(ImageFilter.MinFilter(3))          # one-pixel shave = the white fringe
    m = m.filter(ImageFilter.GaussianBlur(feather))

    out = Image.new('RGBA', (w, h))
    out.paste(im, (0, 0))
    out.putalpha(m)
    bb = out.getbbox()
    if bb:
        out = out.crop((max(0, bb[0] - pad), max(0, bb[1] - pad),
                        min(w, bb[2] + pad), min(h, bb[3] + pad)))
    out.save(dst)
    print(f'{dst}  {out.size[0]}x{out.size[1]}  kept {(np.asarray(m) > 128).mean() * 100:.1f}%')
    return out


if __name__ == '__main__':
    args = [x for x in sys.argv[1:] if not x.startswith('--')]
    feather = 0.8
    if '--feather' in sys.argv:
        feather = float(sys.argv[sys.argv.index('--feather') + 1])
    cut(args[0], args[1], feather=feather)
