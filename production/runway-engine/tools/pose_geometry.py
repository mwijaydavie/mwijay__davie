"""Geometry of every cut pose, in CUT-IMAGE pixels.

The scene places her by the CHIN, not by the bottom edge: the cut crops to the
content, and the content differs per pose (a raised hand makes the bbox wider, a
hand at the hip makes it shorter). Anchoring on the bottom edge means every pose
lands on a slightly different shelf — which is one of the reasons a gesture change
looked like a jump.
"""
import json
import numpy as np
from PIL import Image
from collections import deque

POSES = ['open', 'point', 'peace', 'like', 'ok', 'pray', 'heart', 'count']
REF = 'assets/character/zuri-full-src.png'

def measure(path, alpha=False):
    im = Image.open(path).convert('RGBA' if alpha else 'RGB')
    a = np.asarray(im).astype(float)
    r, g, b, mx, mn = a[...,0], a[...,1], a[...,2], a.max(2), a.min(2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    body = (a[...,3] > 40) if alpha else ((mn > 236) & (sat < 0.07) == False)
    white = (mn > 236) & (sat < 0.07)
    skin = (r > g + 16) & (r > b + 28) & (r > 55) & (r < 220) & ~white
    braid = (mx < 95) & ~white
    knit = (b > r + 6) & (sat > 0.07) & (sat < 0.42) & (mx > 110) & (mx < 240) & ~white
    h, w = skin.shape
    # face blob: largest skin component in the top half
    zone = skin.copy(); zone[int(h*0.48):] = False
    lab = np.zeros((h, w), np.int32); best = None; cur = 0
    for y0, x0 in zip(*np.nonzero(zone)):
        if lab[y0, x0]: continue
        cur += 1; q = deque([(y0, x0)]); lab[y0, x0] = cur; pts = []
        while q:
            y, x = q.popleft(); pts.append((y, x))
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny, nx = y+dy, x+dx
                if 0 <= ny < h and 0 <= nx < w and zone[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = cur; q.append((ny, nx))
        if best is None or len(pts) > best[0]: best = (len(pts), np.array(pts))
    pts = best[1]
    chin = int(pts[:,0].max()); head_cx = int((pts[:,1].min()+pts[:,1].max())/2)
    band = braid[:chin, max(0, head_cx-260):head_cx+260]
    rows = np.nonzero(band.any(1))[0]
    hair_top = int(rows.min()) if len(rows) else int(pts[:,0].min())
    # torso rows: knit width excludes the arms only approximately; the waist is the
    # narrowest row well below the collar, the hip the widest below that
    prof = []
    for y in range(int(chin + 0.5*(chin-hair_top)), h):
        xs = np.nonzero(knit[y])[0]
        if len(xs) > 40: prof.append((y, int(xs.min()), int(xs.max())))
    waist_y = hip_y = None
    if prof:
        top = prof[0][0]
        cand = [p for p in prof if p[0] > top + 0.25*(chin-hair_top)]
        if cand:
            waist_y = min(cand, key=lambda t: t[2]-t[1])[0]
            lower = [p for p in cand if p[0] > waist_y + 0.25*(chin-hair_top)]
            if lower: hip_y = max(lower, key=lambda t: t[2]-t[1])[0]
    return dict(w=w, h=h, chin=chin, head_cx=head_cx, hair_top=hair_top,
                head_h=int(chin-hair_top), waist_y=waist_y, hip_y=hip_y)

ref = measure(REF)
geo = dict(reference=ref, poses={})
for p in POSES:
    g = measure(f'assets/character/pose-{p}-cut.png', alpha=True)
    geo['poses'][p] = g
    print(f'{p:6s} {g["w"]}x{g["h"]}  chin {g["chin"]:4d}  head_cx {g["head_cx"]:4d}  head_h {g["head_h"]:3d}  waist {g["waist_y"]}  hip {g["hip_y"]}')
json.dump(geo, open('../../content/runway/character/pose-geometry.json', 'w'), indent=2)
print('reference chin', ref['chin'], 'head_h', ref['head_h'])
