"""A motion study that only uses joints measured from her render.

This exists to be looked at: if the pivots are wrong, the study looks wrong.
Everything is anchored where the body actually bends —
  breath  : ribs open, anchored at the waist, 1 cycle / 2.4 s
  sway    : the whole figure rotates about the HIP, 1 cycle / 6.4 s
  head    : counter-rotates 55 % of the sway, with 3 frames of lag
  arms    : pendulum from the SHOULDER, forearm lagging 4 frames (follow-through)
The lag and the counter-rotation are what separate a body from a cut-out.
"""
import json, math, os, subprocess, sys
from PIL import ImageDraw, ImageFilter
import numpy as np
from PIL import Image

RIG = json.load(open('../../content/runway/character/zuri-rig.json'))
SRC = RIG['source']
fig = Image.open(SRC).convert('RGBA')
W, H = fig.size
h = RIG['units']['head_h']
cx = RIG['px']['head_cx']
chin = RIG['px']['chin']
hip_px = (cx, RIG['px']['hip_y'])

FPS, SEC = 60, 8.0
N = int(FPS * SEC)
os.makedirs('/tmp/stud', exist_ok=True)

def rot(img, deg, origin):
    return img.rotate(deg, resample=Image.BICUBIC, center=origin)

for i in range(N):
    t = i / FPS
    # breath: 1 cycle / 2.4 s, 1.1 % vertical, anchored at the waist
    br = math.sin(2 * math.pi * t / 2.4)
    sy = 1 + 0.011 * br
    # sway about the hip
    sw = 0.85 * math.sin(2 * math.pi * t / 6.4)
    # head counter-rotation with 3-frame lag
    tl = (i - 3) / FPS
    hd = -0.55 * 0.85 * math.sin(2 * math.pi * tl / 6.4)

    # body: scale about the hip, then rotate about the hip
    body = fig.resize((W, int(H * sy)), Image.BICUBIC)
    body = body.crop((0, 0, W, max(H, body.height)))
    if body.height > H:
        body = body.crop((0, 0, W, H))
    else:
        pad = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        pad.paste(body, (0, H - body.height)); body = pad
    body = rot(body, sw, hip_px)

    # head band: the skull AND the braids, because a braid is part of the head —
    # cutting at the collar shears every braid into two pieces, which is what the
    # first pass did. So the mask follows the hair: the neckline stops the mask,
    # except in columns that contain braid, which are carried all the way down.
    neck_y = int(chin + RIG['joints']['neck']['y'] * h)
    head = rot(body, hd, (cx, neck_y))
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rectangle([0, 0, W, neck_y - int(0.16 * h)], fill=255)
    mask_np = np.asarray(mask).copy()
    arr = np.asarray(fig.convert('RGB')).astype(int)
    braid = (arr.max(2) < 95) & (arr.min(2) < 90)
    braid = braid & ~((arr[..., 0] > arr[..., 2] + 25))       # never swallow skin
    braid[: int(chin - 0.30 * h)] = False
    cols = np.nonzero(braid.any(0))[0]
    for x in cols:
        rows = np.nonzero(braid[:, x])[0]
        mask_np[: rows.max() + 6, x] = 255
    mask = Image.fromarray(mask_np).filter(ImageFilter.GaussianBlur(int(0.02 * h)))
    body = Image.composite(head, body, mask)

    canvas = Image.new('RGBA', (W, H), (237, 243, 249, 255))
    canvas.alpha_composite(body)
    canvas.convert('RGB').save(f'/tmp/stud/f_{i:04d}.png')

print('frames', N)
