"""Put every Zuri pose on one scale and one origin.

Each render comes back at its own zoom and its own crop: the chin lands anywhere
between y 514 and 756 across the eight sheets. Splicing two of those mid-shot makes
her jump, so each pose is scaled so the HEAD is the same height, then translated so
the head centre and the top of the braids sit on one common origin.

The head is the right ruler: it is the one thing that must never change between
poses, and it is measured from the hairline, not from the hands (which is how the
chin detector gets fooled when she raises a hand to chest height).
"""
import json, sys
import numpy as np
from PIL import Image
from collections import deque

REF = 'assets/character/zuri-full-src.png'
CANVAS = (843, 1264)     # the master's sheet size, so every pose crops the same way

def head_box(path):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(2), a.min(2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    white = (mn > 236) & (sat < 0.07)
    skin = (r > g + 16) & (r > b + 28) & (r > 55) & (r < 220) & ~white
    braid = (mx < 95) & ~white
    h, w = skin.shape
    # largest skin blob = face+neck; search only the upper 45 % to avoid hands
    top_zone = skin.copy(); top_zone[int(h * 0.45):] = False
    lab = np.zeros((h, w), np.int32); best = None; cur = 0
    ys, xs = np.nonzero(top_zone)
    for y0, x0 in zip(ys, xs):
        if lab[y0, x0]: continue
        cur += 1; q = deque([(y0, x0)]); lab[y0, x0] = cur; pts = []
        while q:
            y, x = q.popleft(); pts.append((y, x))
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny, nx = y+dy, x+dx
                if 0 <= ny < h and 0 <= nx < w and top_zone[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = cur; q.append((ny, nx))
        if best is None or len(pts) > best[0]:
            best = (len(pts), np.array(pts))
    pts = best[1]
    chin = int(pts[:, 0].max())
    cx = int((pts[:, 1].min() + pts[:, 1].max()) / 2)
    # braid top: highest hair pixel in the columns around the head
    band = braid[:chin, max(0, cx-260):cx+260]
    rows = np.nonzero(band.any(1))[0]
    hair_top = int(rows.min()) if len(rows) else int(pts[:, 0].min())
    return dict(cx=cx, chin=chin, hair_top=hair_top, head_h=int(chin - hair_top))

ref = head_box(REF)
print('reference', ref)
poses = ['open', 'point', 'peace', 'like', 'ok', 'pray', 'heart', 'count']
out = {}
for p in poses:
    src = f'assets/character/pose-{p}-src.png'
    hb = head_box(src)
    s = ref['head_h'] / hb['head_h']
    im = Image.open(src).convert('RGB')
    nw, nh = int(im.width * s), int(im.height * s)
    im2 = im.resize((nw, nh), Image.LANCZOS)
    dx = int(ref['cx'] - hb['cx'] * s)
    dy = int(ref['hair_top'] - hb['hair_top'] * s)
    canvas = Image.new('RGB', CANVAS, (255, 255, 255))
    canvas.paste(im2, (dx, dy))
    canvas.save(f'assets/character/pose-{p}-norm.png')
    out[p] = dict(scale=round(s, 4), dx=dx, dy=dy, head_h=hb['head_h'])
    print(f'{p:6s} head_h {hb["head_h"]:3d}  scale {s:.3f}  shift ({dx:+4d},{dy:+4d})')
json.dump(dict(reference=ref, poses=out), open('../../content/runway/character/pose-normalisation.json', 'w'), indent=2)
