"""Key two original tech-host poses; preserve the same planted legs in both."""
import argparse
from hashlib import sha256
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W,H=768,1376
LOW=710
# Within the glasses, avoiding the rims. Points in the raw image's coordinates.
EYES={
 'hello': [[(346,223),(357,215),(371,215),(382,223),(379,233),(365,236),(350,233)],
           [(409,223),(419,213),(432,213),(445,221),(447,230),(433,236),(415,234)]],
 'point': [[(334,222),(341,215),(355,216),(366,225),(362,233),(350,236),(337,232)],
           [(388,223),(399,215),(411,215),(425,223),(424,230),(412,237),(394,235)]],
}
CURVES={
 'hello': [((347,225),(356,236),(372,237),(381,227)),((410,226),(419,237),(437,237),(446,225))],
 'point': [((335,225),(343,236),(358,236),(366,227)),((389,225),(397,238),(416,238),(425,226))],
}

def key(im):
    a=np.asarray(im.convert('RGB')).astype(np.float32)
    peak=np.maximum(a[:,:,0],a[:,:,2]);s=np.clip((a[:,:,1]-peak-14)/87,0,1)
    alpha=1-s*s*(3-2*s);alpha[alpha<.024]=0
    a[:,:,1]=np.minimum(a[:,:,1],peak+4);a[alpha==0]=0
    return np.dstack((a,alpha*255)).astype(np.uint8)


def blink(a,pose):
    x,y,w,h=324,207,132,38
    m=Image.new('L',(w,h));d=ImageDraw.Draw(m)
    for pts in EYES[pose]:d.polygon([(i-x,j-y) for i,j in pts],fill=255)
    mask=cv2.dilate(np.asarray(m),np.ones((3,3),dtype=np.uint8));rgb=a[y:y+h,x:x+w,:3].copy()
    im=Image.fromarray(cv2.inpaint(rgb,mask,4,cv2.INPAINT_TELEA)).convert('RGBA')
    im.putalpha(Image.fromarray(mask).filter(ImageFilter.GaussianBlur(1.2)))
    lashes=Image.new('RGBA',(w*4,h*4));d=ImageDraw.Draw(lashes)
    for curve in CURVES[pose]:
        A,B,C,D=map(np.asarray,curve)
        pts=[tuple(np.round(((1-t)**3*A+3*(1-t)**2*t*B+3*(1-t)*t*t*C+t**3*D-[x,y])*4)) for t in np.linspace(0,1,26)]
        d.line(pts,fill=(62,39,36,238),width=7,joint='curve')
    im.alpha_composite(lashes.resize(im.size,Image.Resampling.LANCZOS));return im,x,y


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('raw',type=Path);p.add_argument('out',type=Path);a=p.parse_args()
    assets=a.out/'assets';qa=a.out/'qa';assets.mkdir(parents=True,exist_ok=True);qa.mkdir(parents=True,exist_ok=True)
    files=[];records={};yy,xx=np.indices((H,W))
    def write(name,im,x=0,y=0):
        file=assets/f'{name}.png'; im.save(file,optimize=True);r=dict(file=file.name,x=x,y=y,width=im.width,height=im.height,sha256=sha256(file.read_bytes()).hexdigest());files.append(r);return r
    leg=None; sole=None
    for pose in ('hello','point'):
        raw=a.raw/f'{pose}-raw.png'; im=Image.open(raw);assert im.size==(W,H)
        a0=key(im);whole=Image.fromarray(a0);assert whole.getbbox()[3]>1290
        if leg is None:
            leg=write('legs',whole.crop((0,LOW,W,H)),0,LOW)
            sole=int(np.where((a0[:,202:591,3]>235).any(axis=1))[0].max())
            assert 1302<=sole<=1315
        if pose=='hello':
            front=(yy>255)&(xx<255);cut=np.full((H,W),430,dtype=np.float32);px,py=182,438
        else:
            front=(yy>338)&(xx<225);cut=452-.57*(xx-151);px,py=178,451
        hand=a0.copy();hand[:,:,3]=np.round(hand[:,:,3]*front*np.clip(1-(yy-(cut+9))/37,0,1)).astype(np.uint8)
        hand[hand[:,:,3]==0]=0;hand=Image.fromarray(hand);box=hand.getbbox();assert box and box[0]<px<box[2] and box[1]<py<box[3]
        grip=write(f'{pose}-hand',hand.crop(box),*box[:2]);grip['pivot']=[px-box[0],py-box[1]]
        upper=a0.copy();upper[front&(yy<cut)]=0
        upper[:,:,3]=np.round(upper[:,:,3]*np.clip(1-(yy-730)/39,0,1)).astype(np.uint8);upper[upper[:,:,3]==0]=0
        top=write(f'{pose}-torso',Image.fromarray(upper[:769]));lid,x,y=blink(a0,pose);lids=write(f'{pose}-blink',lid,x,y)
        thumb=Image.new('RGBA',(W,H),'#d8efea');thumb.alpha_composite(whole);thumb.alpha_composite(lid,(x,y));thumb.resize((384,688),Image.Resampling.LANCZOS).save(qa/f'{pose}-closed.png')
        records[pose]=dict(torso=top,hand=grip,blink=lids,mark=[463,436,27,15],source_sha256=sha256(raw.read_bytes()).hexdigest())
    proof=dict(width=W,height=H,sole=sole,footX=[273,533],hip=[397,729],legs=leg,poses=records,files=files,
               source='Original AI-illustrated male host; second pose edited from first. Shared static legs, planted shadow, torso tilt, wrist and eye patches. No lip sync or Pinterest assets.')
    (qa/'host-rig.json').write_text(json.dumps(proof,indent=2)+'\n',encoding='utf-8')
    print(f'{len(files)} transparent layers; sole row {sole}; common legs in both poses.')

if __name__=='__main__':main()
