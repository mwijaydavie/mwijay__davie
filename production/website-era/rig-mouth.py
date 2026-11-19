"""Make texture-preserving Rhubarb mouth overlays for the Business host.

Reuse the keyed wave + point art. Warp the lip edges of the source image, then
shade the inside of each opening at 3x. Do not change the original face or jawline.
"""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import shutil

import cv2
import numpy as np
from PIL import Image

BOX=(421,452,553,523)
XL,XR=431,543
CENTER=487
# Upper motion, lower motion, lip width ratio, upper teeth height, tongue level.
SHAPES={'A':(0,0,.86,0,0),'B':(1.4,3.8,1.03,2.5,0),'C':(2.6,9.6,1.0,4.0,.06),
        'D':(3.8,15.4,.99,4.3,.22),'E':(4.9,12.2,.78,3.2,.10),'F':(4.2,6.1,.68,0,0),
        'G':(1.5,4.3,.91,3.0,0),'H':(2.9,10.7,.92,3.8,.37)}


def shape(im,k):
    x,y,r,b=BOX;w,h=r-x,b-y;mult=3
    yy,xx=np.mgrid[y:b:complex(0,h*mult),x:r:complex(0,w*mult)].astype(np.float32)
    up,down,ratio,teeth,tongue=SHAPES[k]
    # Reduce the lip width for the rounded vowels but leave the cheek still.
    lips=np.exp(-((yy-483)/20)**4)
    # Piecewise monotonic warp with fixed outer edges: never sample outside the cheek.
    target=[x,CENTER-(CENTER-XL)*ratio,CENTER,CENTER+(XR-CENTER)*ratio,r]
    sx=xx+(np.interp(xx,target,[x,XL,CENTER,XR,r])-xx)*lips
    u=np.clip((sx-XL)/(XR-XL),0,1)
    width=np.sin(np.pi*u).clip(0,1)**.72
    seam=np.interp(sx,[421,431,443,457,474,491,508,525,538,543,553],[458,466,474,479,483.7,484.0,482.6,479.0,473.3,469.1,464])
    high=seam-up*width;low=seam+down*width
    sy=yy+up*width*np.clip(1-(high-yy)/19,0,1)*(yy<high)-down*width*np.clip(1-(yy-low)/np.maximum(5,523-low),0,1)*(yy>=low)
    data=np.asarray(im.convert('RGB'))
    warped=cv2.remap(data,sx.astype(np.float32),sy.astype(np.float32),cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101).astype(np.float32)
    inside=np.clip(np.minimum(yy-high,low-yy)*1.9+.15,0,1)*(width>.05)*(low>high+.5)
    depth=np.clip((yy-high)/np.maximum(.2,low-high),0,1)
    shade=(depth*.79+np.clip(1-(u-.55)**2*5,0,1)*.21)[:,:,None]
    cavity=np.array([54,21,22])+shade*np.array([38,13,12])
    tongue_area=np.clip((depth-.69)*4,0,1)*np.clip(1-((u-.53)/.37)**4,0,1)*tongue
    cavity=cavity*(1-tongue_area[:,:,None])+np.array([142,63,57])*tongue_area[:,:,None]
    tooth_height=teeth*np.maximum(0,1-((u-.51)/.44)**4)
    enamel=(np.clip(tooth_height-(yy-high)+.1,0,1)*np.clip((yy-high)*1.75,0,1)*(teeth>0)*.94)[:,:,None]
    highlight=(np.clip(1-(yy-high)/6,0,1)*.34)[:,:,None]
    enamel_rgb=np.array([193,151,126])+highlight*np.array([104,112,127])
    cavity=cavity*(1-enamel)+enamel_rgb*enamel
    warped=warped*(1-inside[:,:,None])+cavity*inside[:,:,None]
    mask=np.clip(np.minimum.reduce([xx-x,r-xx,yy-y,b-yy])/5,0,1)
    mask*=np.clip((np.abs(sx-xx)+np.abs(sy-yy)+inside*4)*1.8,0,1)
    mask*=cv2.remap(np.asarray(im)[:,:,3],xx,yy,cv2.INTER_LINEAR).astype(np.float32)/255
    return Image.fromarray(np.dstack((np.clip(warped,0,255),mask*255)).astype(np.uint8)).resize((w,h),Image.Resampling.LANCZOS)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('source',type=Path);p.add_argument('out',type=Path);a=p.parse_args()
    prev=json.loads((a.source/'qa/host-rig.json').read_text());assets=a.out/'assets';qa=a.out/'qa';assets.mkdir(parents=True,exist_ok=True);qa.mkdir(exist_ok=True)
    rig=dict(width=prev['width'],height=prev['height'],poses={},files=[],method='Exact prior Business host keyed sprites; texture-warped mouth patches A–H; X is closed/rest.')
    for pose in ('wave','point'):
        record=prev['poses'][pose];rig['poses'][pose]=record
        for c in (record['base'],record['hand'],record['lids']):
            path=a.source/'assets'/c['file'];assert sha256(path.read_bytes()).hexdigest()==c['sha256'];shutil.copyfile(path,assets/c['file']);rig['files'].append(c)
        im=Image.open(assets/record['base']['file']).convert('RGBA');record['mouth']={}
        for k in SHAPES:
            layer=shape(im,k);name=f'{pose}-mouth-{k}.png';path=assets/name;layer.save(path,optimize=True)
            meta=dict(file=name,x=BOX[0],y=BOX[1],width=layer.width,height=layer.height,sha256=sha256(path.read_bytes()).hexdigest());rig['files'].append(meta);record['mouth'][k]=meta
            prev_img=im.copy();prev_img.alpha_composite(layer,BOX[:2]);prev_img.crop((365,347,623,534)).convert('RGB').resize((516,374)).save(qa/f'mouth-{pose}-{k}.jpg',quality=94)
    (qa/'host-rig.json').write_text(json.dumps(rig,indent=2)+'\n')
    print(f'{len(rig["files"])} layers; original Business poses + {len(SHAPES)} mouth-shape patches per pose.')


if __name__=='__main__':main()
