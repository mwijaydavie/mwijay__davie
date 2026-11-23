"""Blink and mouth, assembled from her own pixels.

A hand-drawn eyelid on a photographic face looks like a sticker, which is the exact
mistake the pasted hand made. So the closed eye is BUILT: the aperture (sclera +
iris) is found, filled by pulling the lid skin down and the cheek skin up, and the
lash line is redrawn with the colour of her own lashes. Same lighting, same grain.

The mouth works the same way: the lip line is found, and an opening is cut between
the lips with a mouth-interior colour, so the lips part instead of being redrawn.
"""
import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

BASE = 'assets/character/zuri-full-src.png'
EYES = {'l': dict(x=383, y=326), 'r': dict(x=478, y=326)}
EYE_W, EYE_H = 104, 62
MOUTH = dict(x=430, y=422)
MOUTH_W, MOUTH_H = 132, 74
OUT_PNG = 'assets/character/face-patches.png'
OUT_JSON = '../../content/runway/character/face-patches.json'


def aperture(rgb, box):
    """Pixels inside the eye box that are NOT lid skin: sclera and iris."""
    x0, y0, x1, y1 = box
    w = rgb[y0:y1, x0:x1].astype(float)
    lum = w.mean(2)
    mx, mn = w.max(2), w.min(2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    sclera = (lum > 72) & (sat < 0.55)
    iris = (lum < 92) & (sat < 0.62)
    m = sclera | iris
    # keep only the largest round-ish blob near the centre
    return m


def shut_eye(rgb, box, open_frac=0.0):
    """Return an RGB patch of the eye box with the aperture closed to `open_frac`."""
    x0, y0, x1, y1 = box
    patch = rgb[y0:y1, x0:x1].astype(np.float32).copy()
    ap = aperture(rgb, box)
    # vertical extent per column
    h, w = ap.shape
    lash_cols = []
    for x in range(w):
        col = np.nonzero(ap[:, x])[0]
        if len(col) < 3:
            continue
        t, b = int(col.min()), int(col.max())
        if b - t < 4:
            continue
        # keep a thin aperture if the caller wants a half blink
        keep = max(0, int((b - t) * open_frac))
        ct, cb = t, b
        mid_t = t + (b - t - keep) // 2
        # lid skin from just above, cheek skin from just below
        top_src = patch[max(0, t - 4):t, x].mean(0) if t > 4 else patch[t, x].copy()
        bot_src = patch[b + 1:min(h, b + 5), x].mean(0) if b + 5 < h else patch[b, x].copy()
        top_src = np.asarray(top_src, dtype=np.float32).reshape(3)
        bot_src = np.asarray(bot_src, dtype=np.float32).reshape(3)
        for y in range(ct, cb + 1):
            if mid_t <= y <= mid_t + keep:
                continue
            u = (y - ct) / max(1, (cb - ct))
            # ease the blend so the lid reads as a curve, not a gradient ramp
            u = u * u * (3 - 2 * u)
            patch[y, x] = top_src * (1 - u) + bot_src * u
        lash_cols.append((x, mid_t + keep * 0.55, t, b))
    # the lash line, drawn with her own lash colour
    lash_px = rgb[y0 + 0:y0 + 8, x0:x1].reshape(-1, 3)
    dark = lash_px[lash_px.mean(1) < 60]
    lash = dark.mean(0) if len(dark) else np.array([22, 14, 10])
    img = Image.fromarray(patch.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img, 'RGBA')
    for x, yc, t, b in lash_cols:
        thick = 2.2 + 0.6 * np.sin(x / max(1, w) * np.pi)
        d.line([(x, yc - thick / 2), (x, yc + thick / 2)], fill=tuple(int(v) for v in lash) + (235,))
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    return img


def mouth_patch(rgb, box, open_amt=0.0):
    """Lips parted by `open_amt` (0 closed, 1 wide)."""
    x0, y0, x1, y1 = box
    patch = Image.fromarray(rgb[y0:y1, x0:x1].astype(np.uint8)).convert('RGB')
    if open_amt <= 0.01:
        return patch
    w, h = patch.size
    # lip line: darkest row in the middle third
    a = np.asarray(patch).astype(float).mean(2)
    mid = a[int(h * 0.30):int(h * 0.75)]
    row = int(np.argmin(mid.mean(1))) + int(h * 0.30)
    # mouth interior: a lens between the lips, widest at the centre
    d = ImageDraw.Draw(patch, 'RGBA')
    hh = 1.2 + 7.5 * open_amt
    half = w * (0.30 + 0.06 * open_amt)
    cx = w / 2
    pts_top, pts_bot = [], []
    for i in range(41):
        u = i / 40
        x = cx - half + 2 * half * u
        k = np.sin(u * np.pi) ** 0.75
        pts_top.append((x, row - 1.2 - 1.8 * k * open_amt))
        pts_bot.append((x, row + 1.0 + hh * k))
    d.polygon(pts_top + pts_bot[::-1], fill=(48, 20, 16, 255))
    # a hint of teeth on the upper lip only when really open
    if open_amt > 0.55:
        d.polygon([(cx - half * 0.55, row - 0.6), (cx + half * 0.55, row - 0.6),
                   (cx + half * 0.5, row + 1.2 * open_amt), (cx - half * 0.5, row + 1.2 * open_amt)],
                  fill=(226, 214, 205, 210))
    patch = patch.filter(ImageFilter.GaussianBlur(0.7))
    return patch


def build():
    rgb = np.asarray(Image.open(BASE).convert('RGB')).astype(int)
    parts = {}
    # three blink states and two mouth states, packed into one sheet
    for side, e in EYES.items():
        box = (e['x'] - EYE_W // 2, e['y'] - EYE_H // 2, e['x'] + EYE_W // 2, e['y'] + EYE_H // 2)
        parts[f'{side}-half'] = shut_eye(rgb, box, 0.45)
        parts[f'{side}-shut'] = shut_eye(rgb, box, 0.0)
    mbox = (MOUTH['x'] - MOUTH_W // 2, MOUTH['y'] - MOUTH_H // 2,
            MOUTH['x'] + MOUTH_W // 2, MOUTH['y'] + MOUTH_H // 2)
    for lvl, name in ((0.35, 'm1'), (0.7, 'm2'), (1.0, 'm3')):
        parts[name] = mouth_patch(rgb, mbox, lvl)

    sheet_w = sum(p.width for p in parts.values())
    sheet_h = max(p.height for p in parts.values())
    sheet = Image.new('RGB', (sheet_w, sheet_h), (255, 255, 255))
    place = {}
    x = 0
    for name, p in parts.items():
        sheet.paste(p, (x, 0))
        place[name] = dict(sx=x, sy=0, w=p.width, h=p.height)
        x += p.width
    sheet.save(OUT_PNG)
    meta = dict(
        eye_l=dict(x=EYES['l']['x'] - EYE_W // 2, y=EYES['l']['y'] - EYE_H // 2, w=EYE_W, h=EYE_H),
        eye_r=dict(x=EYES['r']['x'] - EYE_W // 2, y=EYES['r']['y'] - EYE_H // 2, w=EYE_W, h=EYE_H),
        mouth=dict(x=mbox[0], y=mbox[1], w=MOUTH_W, h=MOUTH_H),
        sheet=place, sheet_size=sheet.size, base_size=[Image.open(BASE).width, Image.open(BASE).height],
    )
    json.dump(meta, open(OUT_JSON, 'w'), indent=2)
    print(OUT_PNG, sheet.size)
    print(json.dumps(place))


if __name__ == '__main__':
    build()
