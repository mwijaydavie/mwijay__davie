"""Prepare cleared stock footage and a small owner preview crop, not product evidence."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageOps

PIN='45b658dbbb85a2c52c46ee15fe2d2483cdfa5b3c'
WAREHOUSE={
  'packing': ('9e26eb95348c63c1c814cdb686fb5a5148efc1f73d5902c12e2a064a4f752c65',
    'Tima Miroshnichenko','https://www.pexels.com/video/man-placing-a-cardboard-box-on-a-shelf-6170331/',
    'cam-05-shelf3-shelf_addition-202610240930',2.8,7.1,'500:720:416:0','720:1036'),
  'dispatch': ('79ac76c459125ff00102c1ed3c9c42d006efca4e448e4248ab04d750eee0634b',
    'Erkan Avanoğlu','https://www.pexels.com/video/packages-moving-on-a-conveyor-belt-5903898/',
    'cam-04-dispatch-dispatch_belt-202610241000',5.1,8.1,'1060:368:130:236','1080:374'),
}
CAPTURE='Screenshot 2026-10-09 005445.png'
CAPTURE_HASH='100103023fe7f7877457a6c3214e787a14ccc7b65cd5ef187e34eddb6338431b'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('stock',type=Path)
    ap.add_argument('uploads',type=Path)
    ap.add_argument('out',type=Path)
    ap.add_argument('--ffmpeg',default='ffmpeg')
    args=ap.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    rows=[]
    for name,(digest,credit,url,folder,offset,dur,crop,scale) in WAREHOUSE.items():
        src=args.stock/f'{name}.mp4'
        assert sha(src)==digest, f'{src}: file changed, check provenance and crop'
        out=args.out/f'{name}.mp4'
        subprocess.run([args.ffmpeg,'-nostdin','-v','error','-xerror','-y','-ss',str(offset),'-i',str(src),
                        '-t',str(dur),'-an','-vf',f'crop={crop},scale={scale}:flags=lanczos,setsar=1,fps=30',
                        '-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(out)],check=True)
        rows.append(dict(file=out.name,sha256=sha(out),kind='illustrative B-roll; no real client/product claim',author=credit,
                         url=url,license='https://www.pexels.com/license/',source_sha256=digest,
                         mirror=f'https://github.com/Garimas144/stocklens/blob/{PIN}/web/public/media/{folder}/original.mp4',
                         crop=crop,start_seconds=offset,duration_seconds=dur,muted=True))
    capture=args.uploads/CAPTURE
    assert sha(capture)==CAPTURE_HASH,'Revise the crop if owner media changes.'
    original=Image.open(capture).convert('RGB'); assert original.size==(1919,1076)
    crop=Image.new('RGB',(510,197),'#f8fafb')
    crop.paste(original.crop((22,17,219,80)),(21,15))
    # Only title, icon and outline of its Stock Warning pane. No numeric demo claim displayed.
    slab=original.crop((1035,771,1415,883))
    ImageDraw.Draw(slab).rectangle((36,48,359,95),fill='#F5F7F9')
    crop.paste(ImageOps.contain(slab,(468,126)),(65,81))
    p=args.out/'faida-context.webp'; crop.save(p,lossless=True)
    rows.append(dict(file=p.name,sha256=sha(p),kind='redacted owner landing preview, not lab data',
                     source=CAPTURE,source_sha256=CAPTURE_HASH,url='https://faida-hq.vercel.app/'))
    (args.out/'manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Prepared {len(rows)} audited visual assets')


if __name__=='__main__':
    main()
