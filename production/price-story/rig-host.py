"""Make an articulated 2D cutout from three edits of the supplied Altraware host.

Landmarks below are in the original 939 x 1136 image coordinates. The painted
closed lids and articulated hands are separate transparent layers, not a face swap.
"""
import argparse
from hashlib import sha256
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 939, 1136
EYE_POLYS = [
    [(369, 370), (389, 365), (415, 361), (440, 364), (459, 377), (470, 397), (471, 413), (448, 418), (421, 417), (394, 410), (376, 398)],
    [(518, 407), (525, 391), (540, 378), (561, 370), (588, 371), (617, 381), (618, 392), (600, 405), (581, 416), (557, 421), (529, 419)],
]
LIDS = [((377, 389), (401, 414), (443, 420), (467, 406)),
        ((523, 410), (551, 427), (594, 416), (612, 393))]


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def key_green(im):
    rgb = np.asarray(im).astype(np.float32)
    peak = np.maximum(rgb[:, :, 0], rgb[:, :, 2])
    excess = rgb[:, :, 1] - peak
    k = np.clip((excess-13)/95, 0, 1)
    alpha = 1 - k*k*(3-2*k)
    rgb[:, :, 1] = np.minimum(rgb[:, :, 1], peak+5)
    rgb[alpha < .012] = 0
    alpha[alpha < .012] = 0
    return np.dstack((rgb, alpha*255)).astype(np.uint8)


def bezier(points):
    a, b, c, d = map(np.asarray, points)
    return [tuple(np.round((1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d, 2)) for t in np.linspace(0, 1, 41)]


def closed_lid(rgba):
    # Generous eye masks, but not the eyebrows or freckles on the nose.
    crop = (359, 348, 627, 435)
    x, y, r, b = crop
    rgb = rgba[y:b, x:r, :3].copy()
    M = Image.new('L', (r-x, b-y))
    pen = ImageDraw.Draw(M)
    for polygon in EYE_POLYS:
        pen.polygon([(i-x,j-y) for i,j in polygon], fill=255)
    mask = cv2.dilate(np.asarray(M), np.ones((5,5),dtype=np.uint8))
    painted = cv2.inpaint(rgb, mask, 6, cv2.INPAINT_TELEA)
    opacity = Image.fromarray(mask).filter(ImageFilter.GaussianBlur(2.7))
    patch = Image.fromarray(painted).convert('RGBA')
    patch.putalpha(opacity)
    # Render the lash curves at 4x to keep them soft at mobile scale.
    scalp = Image.new('RGBA', ((r-x)*4,(b-y)*4))
    ink = ImageDraw.Draw(scalp)
    for i, curve in enumerate(LIDS):
        points = [(round((i-x)*4),round((j-y)*4)) for i,j in bezier(curve)]
        ink.line(points, fill=(97, 53, 43, 152), width=19, joint='curve')
        ink.line(points, fill=(45, 22, 23, 241), width=11, joint='curve')
        start = np.asarray(points[5 if i==0 else -6])
        for dx,dy in ([(-26,-18),(-19,-27)] if i==0 else [(27,-17),(18,-28)]):
            ink.line([tuple(start), tuple(start+(dx,dy))], fill=(51,24,27,222), width=8)
    patch.alpha_composite(scalp.resize(patch.size, Image.Resampling.LANCZOS))
    return patch, crop


def save(layer, path):
    layer.save(path, optimize=True)
    return dict(file=path.name, width=layer.width, height=layer.height, sha256=digest(path))


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('raw', type=Path);p.add_argument('reference',type=Path);p.add_argument('out',type=Path)
    args=p.parse_args();assets=args.out/'assets';qa=args.out/'qa'
    assets.mkdir(parents=True,exist_ok=True);qa.mkdir(parents=True,exist_ok=True)
    yy, xx = np.indices((H, W))
    poses={}; files=[]; art=[]
    for pose in ('wave','point','think'):
        raw=args.raw/f'{pose}-raw.png'
        with Image.open(raw) as im:
            assert im.size==(W,H), f'{pose}: update landmarks for a new crop'
            rgba=key_green(im.convert('RGB'))
        assert rgba[0,0,3]==0 and rgba[730,490,3]==255, pose
        source=Image.fromarray(rgba)
        base=rgba.copy();hand=None
        if pose != 'think':
            if pose=='wave':
                cut=np.full((H,W), 574, dtype=np.float32);px,py=221,583; xmin_y=325;xmax=326;feather=49
            else:
                cut=610+.56*(200-xx);px,py=209,625; xmin_y=473;xmax=273;feather=47
            palm=rgba.copy()
            a=np.clip(1-(yy-(cut+12))/feather,0,1)*(xx<xmax)*(yy>xmin_y)
            palm[:,:,3]=np.round(a*rgba[:,:,3]).astype(np.uint8)
            palm[palm[:,:,3]==0,:3]=0
            bodyCut=(yy<cut)&(xx<xmax)&(yy>xmin_y)
            base[bodyCut]=0
            layer=Image.fromarray(palm);bbox=layer.getbbox();assert bbox and bbox[0]<px<bbox[2] and bbox[1]<py<bbox[3], pose
            record=save(layer.crop(bbox),assets/f'{pose}-hand.png');files.append(record)
            hand={**record,'x':bbox[0],'y':bbox[1],'pivot':[px-bbox[0],py-bbox[1]]}
        record=save(Image.fromarray(base),assets/f'{pose}-base.png');files.append(record)
        blink,box=closed_lid(rgba)
        eye=save(blink,assets/f'{pose}-blink.png');files.append(eye)
        poses[pose]={'base':record,'lids':{**eye,'x':box[0],'y':box[1]},'hand':hand,'mark':[546,711,41,24]}
        art.append(dict(pose=pose,source_sha256=digest(raw),source='AI pose edit of the owner-supplied character; green-screen cutout'))
        # Compact diagnostic with the eyelids closed and the original silhouette.
        test=Image.new('RGBA',source.size,'#fff6e9');test.alpha_composite(source);test.alpha_composite(blink,box[:2]);test.resize((376,455),Image.Resampling.LANCZOS).save(qa/f'{pose}-closed.png')
    proof={'width':W,'height':H,'reference_sha256':digest(args.reference),'pose_sources':art,'poses':poses,'files':files,
           'method':'Two wrist pivots with feathered overlap, two painted eyelids per pose, wave / point / side-eye sprites. Motion is deterministic. No lip sync or generated video.'}
    (qa/'host-rig.json').write_text(json.dumps(proof,indent=2)+'\n',encoding='utf-8')
    print(f'{len(files)} keyed, articulated layers for {len(poses)} poses')


if __name__=='__main__':main()
