"""Derive Zuri's skeleton from her neutral master render.

Everything is found in the pixels, then converted to HEAD UNITS measured from the
chin. Head units are the only scale that survives being resized in a scene, and
the chin is the one landmark that never moves when she breathes.

Anatomy rules encoded here (these are the corrections to the first attempt):
  * the shoulder JOINT is where the arm tube begins, not the widest row of the
    sweater — the widest row is the hip flare, three heads too low
  * a joint sits on the LIMB AXIS, half a sleeve in from the outline; sampling the
    outline put every pivot on her silhouette edge
  * the wrist is the CUFF line, where the knitted sleeve ends and skin begins,
    not the bottom of the hand
"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw

SRC      = sys.argv[1] if len(sys.argv) > 1 else 'assets/character/zuri-full-src.png'
OUT_IMG  = sys.argv[2] if len(sys.argv) > 2 else '../../content/runway/character/zuri-rig.png'
OUT_JSON = sys.argv[3] if len(sys.argv) > 3 else '../../content/runway/character/zuri-rig.json'

im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(float)
H, W = a.shape[:2]
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mx, mn = a.max(2), a.min(2)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)

white  = (mn > 236) & (sat < 0.07)
skin   = (r > g + 16) & (r > b + 28) & (r > 55) & (r < 220) & ~white
sleeve = (b > r + 6) & (sat > 0.07) & (sat < 0.42) & (mx > 110) & (mx < 240) & ~white
braid  = (mx < 95) & ~white

# ---- head ---------------------------------------------------------------
hair_top = int(np.nonzero(braid.any(1))[0].min())
face = skin.copy(); face[int(H * 0.62):] = False
chin = int(np.nonzero(face.any(1))[0].max())
mid_row = (hair_top + chin) // 2
fx = np.nonzero(face[mid_row])[0]
head_cx = int((fx.min() + fx.max()) / 2)
h = float(chin - hair_top)                      # head height in px

def hu(x, y):
    """head units from the chin centre — y grows downward, like the render"""
    return dict(x=round((x - head_cx) / h, 3), y=round((y - chin) / h, 3))

def row_span(y, lo=0, hi=W):
    xs = np.nonzero(sleeve[y, lo:hi])[0]
    return (lo + int(xs.min()), lo + int(xs.max())) if len(xs) else None

# ---- shoulder: the row where the arm tube starts -------------------------
sh_y = None
for y in range(int(chin + 0.10 * h), int(chin + 0.60 * h)):
    sp = row_span(y)
    if sp and (sp[1] - sp[0]) > 0.50 * h:
        sh_y = y; break
sh_y = sh_y or int(chin + 0.22 * h)
sh_l0, sh_r0 = row_span(sh_y)
sleeve_r = 0.11 * h                             # half a sleeve depth
sh_l = int(sh_l0 + sleeve_r)
sh_r = int(sh_r0 - sleeve_r)

# ---- cuff / wrist: last sleeve row, skin starts below it -----------------
cuff_y = max(y for y in range(H) if sleeve[y, :head_cx].sum() > 3)
def wrist_x(lo, hi):
    ys = [y for y in range(cuff_y, min(H, cuff_y + int(0.16 * h))) if skin[y, lo:hi].sum() > 10]
    if not ys: return (lo + hi) // 2
    px = [int(np.median(np.nonzero(skin[y, lo:hi])[0])) + lo for y in ys]
    return int(np.median(px))
wr_l, wr_r = wrist_x(0, head_cx), wrist_x(head_cx, W)
wr_y = cuff_y

# ---- elbow: midpoint on the outer edge, stepped in to the axis -----------
def elbow(side):
    y = int((sh_y + wr_y) / 2)
    xs = np.nonzero(sleeve[y])[0]
    if not len(xs): return None
    x = int(xs.min() + sleeve_r) if side == 'l' else int(xs.max() - sleeve_r)
    return dict(x=x, y=y)
el_l, el_r = elbow('l'), elbow('r')

# ---- torso landmarks ----------------------------------------------------
prof = [(y, *sp) for y in range(sh_y, H) if (sp := row_span(y))]
waist_y = min(prof, key=lambda t: t[2] - t[1])[0]
lower   = [p for p in prof if p[0] > waist_y + 0.2 * h] or prof[-8:]
hip_y   = max(lower, key=lambda t: t[2] - t[1])[0]

J = {
    'neck':       hu(head_cx, int(sh_y - 0.10 * h)),
    'shoulder_l': hu(sh_l, sh_y), 'shoulder_r': hu(sh_r, sh_y),
    'elbow_l':    hu(el_l['x'], el_l['y']), 'elbow_r': hu(el_r['x'], el_r['y']),
    'wrist_l':    hu(wr_l, wr_y),           'wrist_r': hu(wr_r, wr_y),
    'waist':      hu(head_cx, waist_y),
    'hip':        hu(head_cx, hip_y),
    'chin':       dict(x=0.0, y=0.0),
}
rig = dict(
    source=SRC, sheet=dict(w=W, h=H),
    px=dict(head_top=hair_top, chin=chin, head_h=int(h), head_cx=head_cx,
            shoulder_y=sh_y, wrist_y=wr_y, waist_y=waist_y, hip_y=hip_y,
            cuff_y=cuff_y, elbow_l=el_l, elbow_r=el_r, wrist_l=dict(x=wr_l, y=wr_y),
            wrist_r=dict(x=wr_r, y=wr_y)),
    units=dict(
        head_h=int(h),
        head_w=round((np.nonzero(braid[mid_row])[0].max() -
                      np.nonzero(braid[mid_row])[0].min()) / h, 3),
        shoulder_w=round((sh_r - sh_l) / h, 3),
        chin_to_shoulder=round((sh_y - chin) / h, 3),
        shoulder_to_wrist=round((wr_y - sh_y) / h, 3),
        chin_to_waist=round((waist_y - chin) / h, 3),
        chin_to_hip=round((hip_y - chin) / h, 3),
        upper_arm=round((el_l['y'] - sh_y) / h, 3),
        forearm=round((wr_y - el_l['y']) / h, 3),
    ),
    joints=J,
    # the sheet is 843 wide; a scene needs the figure's on-screen height to place it
    sheet_ratio=dict(h_over_w=round(H / W, 4), head_over_sheet=round(h / H, 4)),
)
json.dump(rig, open(OUT_JSON, 'w'), indent=2)
print(json.dumps(rig['units'], indent=2))

# ---- overlay ------------------------------------------------------------
ov = im.copy(); d = ImageDraw.Draw(ov, 'RGBA')
def P(k):
    j = J[k]; return int(head_cx + j['x'] * h), int(chin + j['y'] * h)
CY, MG, OR, RD, BL = (0, 225, 255, 255), (255, 60, 175, 255), (255, 175, 0, 255), (255, 95, 95, 255), (105, 170, 255, 255)
d.line([head_cx, hair_top, head_cx, hip_y], fill=CY, width=2)
for side, col in (('l', RD), ('r', BL)):
    for a1, a2 in (('shoulder_', 'elbow_'), ('elbow_', 'wrist_')):
        p, q = P(a1 + side), P(a2 + side)
        d.line([*p, *q], fill=col, width=3)
    for k, t in (('shoulder_', 'SHOULDER '), ('elbow_', 'ELBOW '), ('wrist_', 'WRIST ')):
        x, y = P(k + side)
        d.ellipse([x - 9, y - 9, x + 9, y + 9], outline=col, width=3)
        d.line([x - 16, y, x + 16, y], fill=col, width=1)
        d.line([x, y - 16, x, y + 16], fill=col, width=1)
        d.text((x + 13, y - 24), t + side.upper(), fill=col)
for k, c, t in (('neck', CY, 'NECK'), ('waist', OR, 'WAIST'), ('hip', OR, 'HIP'), ('chin', MG, 'CHIN = origin')):
    x, y = P(k)
    d.ellipse([x - 9, y - 9, x + 9, y + 9], outline=c, width=3)
    d.text((x + 13, y - 22), t, fill=c)
for i in range(5):
    y = int(chin + i * h)
    d.line([W - 58, y, W - 16, y], fill=(255, 255, 255, 170), width=2)
    d.text((W - 14, y - 6), f'{i}h', fill=(255, 255, 255, 210))
ov.save(OUT_IMG)
print('wrote', OUT_IMG, OUT_JSON)
