"""Measure Zuri's skeleton from a rendered sheet, so animation can be built on her
real proportions instead of guessed numbers.

Segmentation is by material, not by colour distance alone:
  skin   -> warm hue, high saturation-ish, mid value
  sleeve -> periwinkle: blue-dominant, low saturation, high value
  braid  -> near-black
Landmarks come from the silhouette, and joint lengths are reported in HEAD UNITS,
which is the only scale that transfers when she is resized in a scene.
"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw

SRC = sys.argv[1] if len(sys.argv) > 1 else 'assets/character/zuri-wave-src.png'
OUT = sys.argv[2] if len(sys.argv) > 2 else '../../content/runway/character/zuri-joints.png'

im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(float)
H, W = a.shape[:2]
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mx, mn = a.max(2), a.min(2)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
val = mx / 255.0

white = (mn > 238) & (sat < 0.06)
body = ~white

skin = (r > g + 18) & (r > b + 30) & (r > 60) & (r < 215) & body & ~white
sleeve = (b > r + 8) & (b > g + 2) & (sat > 0.08) & (sat < 0.45) & (val > 0.45) & (val < 0.92) & body
braid = (mx < 90) & body

def blobs(mask, minpx=400):
    """4-neighbour connected components, largest first."""
    seen = np.zeros_like(mask, bool); out = []
    ys, xs = np.nonzero(mask)
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]: continue
        stack = [(y0, x0)]; seen[y0, x0] = True; px = []
        while stack:
            y, x = stack.pop(); px.append((y, x))
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny, nx = y+dy, x+dx
                if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True; stack.append((ny, nx))
        if len(px) >= minpx:
            p = np.array(px)
            out.append(dict(px=len(px), y0=int(p[:,0].min()), y1=int(p[:,0].max()),
                            x0=int(p[:,1].min()), x1=int(p[:,1].max()),
                            cy=float(p[:,0].mean()), cx=float(p[:,1].mean())))
    return sorted(out, key=lambda d: -d['px'])

sk = blobs(skin, 3000)
br = blobs(braid, 2000)
head = sk[0]                       # face + neck is always the biggest skin blob
# the raised hand is the skin blob that sits highest and to the right of the face
hands = [d for d in sk[1:] if d['px'] > 1500]
hand_up = min(hands, key=lambda d: d['y0']) if hands else None

head_top = min(d['y0'] for d in br) if br else head['y0'] - 40
chin = head['y1']
head_h = chin - head_top
head_w = max(d['x1'] - d['x0'] for d in br[:2]) if len(br) >= 2 else head['x1'] - head['x0']

# torso: widest sleeve run in the vertical middle band
cols = sleeve.sum(0)
rows = sleeve.sum(1)
sh_y = None
for y in range(int(chin), H):
    if rows[y] > 0.28 * W:
        sh_y = y; break
sh_y = sh_y or int(chin + head_h * 0.25)
xs = np.nonzero(sleeve[sh_y])[0]
shoulder_l, shoulder_r = int(xs.min()), int(xs.max())

# the down arm: sleeve columns left of the torso centre, lowest extent
tor_cx = (shoulder_l + shoulder_r) // 2
low = [(y, x) for y, x in zip(*np.nonzero(sleeve)) if y > sh_y + head_h * 1.2]
wrist_y = max(y for y, x in low) if low else sh_y + head_h * 3
wrist_x = int(np.median([x for y, x in low if y > wrist_y - 20])) if low else shoulder_l

joints = dict(
    head=dict(cx=float(head['cx']), top=int(head_top), chin=int(chin), h=int(head_h), w=int(head_w)),
    shoulder=dict(l=shoulder_l, r=shoulder_r, y=int(sh_y)),
    torso=dict(cx=int(tor_cx), w=int(shoulder_r - shoulder_l)),
    down_arm=dict(elbow=dict(x=int(shoulder_l + 6), y=int(sh_y + head_h * 1.55)),
                  wrist=dict(x=wrist_x, y=int(wrist_y))),
    raised_hand=hand_up,
    ratios=dict(
        shoulder_w_heads=round((shoulder_r - shoulder_l) / head_h, 2),
        head_w_heads=round(head_w / head_h, 2),
        arm_len_heads=round((wrist_y - sh_y) / head_h, 2),
        head_px=int(head_h),
        shoulder_to_chin_heads=round((sh_y - chin) / head_h, 2),
    ),
)
print(json.dumps(joints['ratios'], indent=2))
json.dump(joints, open('../../content/runway/character/zuri-joints.json', 'w'), indent=2)

# ---- labelled overlay -------------------------------------------------------
ov = im.copy(); d = ImageDraw.Draw(ov, 'RGBA')
def dot(x, y, txt, col=(255, 40, 90)):
    d.ellipse([x-7, y-7, x+7, y+7], fill=col+(255,))
    d.line([x-16, y, x+16, y], fill=col+(200,), width=2)
    d.line([x, y-16, x, y+16], fill=col+(200,), width=2)
    d.text((x+12, y-26), txt, fill=col+(255,))
dot(int(head['cx']), int(chin), 'CHIN')
dot(int(head['cx']), int(head_top), 'HEAD TOP')
dot(shoulder_l, int(sh_y), 'SHOULDER L'); dot(shoulder_r, int(sh_y), 'SHOULDER R')
el = joints['down_arm']['elbow']; dot(el['x'], el['y'], 'ELBOW')
wr = joints['down_arm']['wrist']; dot(wr['x'], wr['y'], 'WRIST')
d.line([shoulder_l, sh_y, el['x'], el['y']], fill=(0, 200, 255, 220), width=3)
d.line([el['x'], el['y'], wr['x'], wr['y']], fill=(0, 200, 255, 220), width=3)
d.line([shoulder_r, sh_y, int(head['cx']), sh_y], fill=(255, 180, 0, 200), width=2)
# head-unit ruler on the right edge
for i in range(6):
    y = int(head_top + i * head_h)
    d.line([W-70, y, W-20, y], fill=(0, 200, 255, 180), width=2)
    d.text((W-18, y-6), str(i), fill=(0, 200, 255, 220))
ov.save(OUT)
print('wrote', OUT)
