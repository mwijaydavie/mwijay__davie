"""Bake blink and talk patches from the two generated face states.

The two states were rendered from her own master, so they sit within a pixel or two of
it. For each pose we therefore only need to carry a SMALL patch — the eyes, the mouth —
not a second full render of her. The patch is feathered to alpha 0 at its edge, so it
drops onto any pose without a seam, and it is stored at sheet scale, so the engine can
place it with one transform.

Per pose the face can drift a couple of pixels after normalisation, so the patch
position is found by matching the face box, not assumed.
"""
import json, os
import numpy as np
from PIL import Image, ImageFilter

POSES = ['open', 'point', 'peace', 'like', 'ok', 'pray', 'heart', 'count']
REF = 'assets/character/pose-open-norm.png'
BLINK = 'assets/character/face-blink-src.png'
TALK = 'assets/character/face-talk-src.png'
TALK_MID = 'assets/character/face-talk-mid-src.png'
OUTDIR = 'assets/character/face'
os.makedirs(OUTDIR, exist_ok=True)
GEO = json.load(open('../../content/runway/character/pose-geometry.json'))
ref = np.asarray(Image.open(REF).convert('RGB')).astype(np.float32)

# Each pose is a DIFFERENT crop of the same head, so master coordinates are useless for
# placing a patch: the eye has to be found relative to that pose's own head centre and
# chin. Both are measured per cut by tools/pose_geometry.py.
REF_HEAD = GEO['reference']          # master: head_cx 439, chin 459, head_h 391
blink = np.asarray(Image.open(BLINK).convert('RGB')).astype(np.float32)
talk = np.asarray(Image.open(TALK).convert('RGB')).astype(np.float32)
talk_hi = np.asarray(Image.open(TALK).convert('RGB')).astype(np.uint8)
talk_mid = np.asarray(Image.open(TALK_MID).convert('RGB')).astype(np.uint8)

# patch windows on the master sheet (measured: eye centres 383,326 / 478,326; mouth 430,422)
EYES = dict(l=dict(cx=383, cy=326, w=112, h=76), r=dict(cx=478, cy=326, w=112, h=76))
MOUTH = dict(cx=430, cy=422, w=132, h=86)
FACEBOX = (300, 240, 600, 470)
# where the eye/mouth sit relative to this pose's own head centre and chin
EYE_REL = {k: dict(dx=v['cx'] - REF_HEAD['head_cx'], dy=v['cy'] - REF_HEAD['chin'])
           for k, v in EYES.items()}
MOUTH_REL = dict(dx=MOUTH['cx'] - REF_HEAD['head_cx'], dy=MOUTH['cy'] - REF_HEAD['chin'])


def best_offset(pose_arr, span=8):
    """offset (dx,dy) that best aligns this pose's face with the reference face"""
    x0, y0, x1, y1 = FACEBOX
    ref_box = ref[y0:y1, x0:x1]
    best, bxy = 1e18, (0, 0)
    for dy in range(-span, span + 1):
        for dx in range(-span, span + 1):
            sub = pose_arr[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
            if sub.shape != ref_box.shape:
                continue
            d = np.abs(sub - ref_box).mean()
            if d < best:
                best, bxy = d, (dx, dy)
    return bxy, best


def feathered(w, h, feather=11):
    """alpha: full inside, 0 at the border, elliptical"""
    y, x = np.mgrid[0:h, 0:w]
    nx = (x - (w - 1) / 2) / ((w - 1) / 2)
    ny = (y - (h - 1) / 2) / ((h - 1) / 2)
    r = np.sqrt(nx ** 2 + ny ** 2)
    a = np.clip((1.04 - r) / (feather / (min(w, h) / 2)), 0, 1)
    return (a * 255).astype(np.uint8)


def make_patch(src, cx, cy, w, h, dx, dy, feather):
    """Patch cut from the state render on MASTER coordinates, placed at the pose's own
    coordinate. The state render is aligned to the master, so the pixels are right —
    but the pose has drifted by (dx,dy), and the patch has to follow the pose, not the
    master, or the lid lands a couple of pixels off the eye it is meant to close."""
    mx0 = int(cx - w / 2); my0 = int(cy - h / 2)
    crop = src[my0:my0 + h, mx0:mx0 + w].clip(0, 255).astype(np.uint8)
    rgba = np.dstack([crop, feathered(w, h, feather)])
    return Image.fromarray(rgba, 'RGBA'), (mx0 + dx, my0 + dy)


meta = {}
for p in POSES:
    arr = np.asarray(Image.open(f'assets/character/pose-{p}-norm.png').convert('RGB')).astype(np.float32)
    arr_uint8 = arr.clip(0, 255).astype(np.uint8)
    (dx, dy), score = best_offset(arr)
    entry = dict(drift=[dx, dy], score=round(float(score), 2), patches={})
    g = GEO['poses'][p]
    for side, e in EYES.items():
        rel = EYE_REL[side]
        # the whole eye window comes from the closed state, so the patch carries her own
        # shut lid AND the shadow under it — no sclera is left behind to flash open
        img, _ = make_patch(blink, e['cx'], e['cy'] + int(e['h'] * 0.18), e['w'], int(e['h'] * 1.25), 0, 0, 11)
        px = int(g['head_cx'] + rel['dx'] - e['w'] / 2)
        py = int(g['chin'] + rel['dy'] + int(e['h'] * 0.18) - int(e['h'] * 1.25) / 2)
        f = f'{OUTDIR}/{p}-blink-{side}.png'
        img.save(f)
        entry['patches'][f'blink_{side}'] = dict(file=f, x=px, y=py, w=e['w'], h=int(e['h'] * 1.25))
        # half blink: 55 % of the closed patch over the open eye, which lands between the
        # two states the eye actually passes through
        open_patch = make_patch(arr_uint8, e['cx'], e['cy'], e['w'], e['h'], 0, 0, 13)[0]
        # the open patch has to come from THIS pose at THIS position, so re-cut it there
        ph = int(e['h'] * 1.25)
        mx0 = int(e['cx'] - e['w'] / 2); my0 = int(e['cy'] + e['h'] * 0.18 - ph / 2)
        crop = arr_uint8[my0:my0 + ph, mx0:mx0 + e['w']]
        open_patch = Image.fromarray(np.dstack([crop, feathered(e['w'], ph, 13)]), 'RGBA')
        half = Image.blend(open_patch, img.convert('RGBA'), 0.62)
        hf = f'{OUTDIR}/{p}-half-{side}.png'
        half.save(hf)
        entry['patches'][f'half_{side}'] = dict(file=hf, x=px, y=py, w=e['w'], h=ph)
    px = int(g['head_cx'] + MOUTH_REL['dx'] - MOUTH['w'] / 2)
    py = int(g['chin'] + MOUTH_REL['dy'] - MOUTH['h'] / 2)
    # three mouth states: quiet (her own), mid, and wide. The engine picks between them
    # from the audio envelope, so a half-volume syllable gets a half-open mouth.
    for key, src_img in (('talk', talk_hi), ('talkMid', talk_mid)):
        img, _ = make_patch(src_img, MOUTH['cx'], MOUTH['cy'], MOUTH['w'], MOUTH['h'], 0, 0, 14)
        f = f'{OUTDIR}/{p}-{key}.png'
        img.save(f)
        entry['patches'][key] = dict(file=f, x=px, y=py, w=MOUTH['w'], h=MOUTH['h'])
    meta[p] = entry
    print(f'{p:6s} drift {dx:+d},{dy:+d}  match {score:.2f}')

json.dump(dict(anchor_frame=[843, 1264], poses=meta),
          open('../../content/runway/character/face-states.json', 'w'), indent=2)
print('wrote', f'{OUTDIR}/ and face-states.json')
