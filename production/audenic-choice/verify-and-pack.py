"""Verify both 26s exports and build the private Audenic review kit."""
import argparse
from array import array
from fractions import Fraction
from hashlib import md5, sha256
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import wave
from zipfile import ZipFile, ZIP_DEFLATED
from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[2]
FPS, FRAMES, RATE = 60, 1560, 48000
SECONDS = FRAMES // FPS
PREVIEW, MASTER, COVER = 'Audenic-Specs-Reel.mp4', 'Audenic-Voiceover-Master.mp4', 'Cover-Audenic-Specs.png'


def run(cmd,*args):
    return subprocess.run([cmd,*map(str,args)],check=True,capture_output=True)


def identity(path):
    b=path.read_bytes()
    return dict(bytes=len(b),md5=md5(b).hexdigest(),sha256=sha256(b).hexdigest())


def rms(samples):
    step=RATE//FPS
    return [math.sqrt(sum(v*v for v in samples[i:i+step])/step) for i in range(0,RATE*SECONDS,step)]


def verify_video(path,ff,probe,voice,cues):
    meta=json.loads(run(probe,'-v','error','-show_streams','-show_format','-of','json',path).stdout)
    assert [s['codec_type'] for s in meta['streams']]==(['video','audio'] if voice else ['video'])
    v=meta['streams'][0]
    assert (v['codec_name'],v['pix_fmt'],v['width'],v['height'])==('h264','yuv420p',1080,1920)
    assert (v['r_frame_rate'],v['avg_frame_rate'])==('60/1','60/1')
    assert Fraction(v['duration'])==Fraction(meta['format']['duration'])==SECONDS
    f=json.loads(run(probe,'-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp','-of','json',path).stdout)['frames']
    base=Fraction(v['time_base']); assert [int(x['best_effort_timestamp'])*base for x in f]==[Fraction(i,FPS) for i in range(FRAMES)]
    frames=run(ff,'-nostdin','-v','error','-xerror','-i',path,'-map','0:v:0','-vf','scale=48:86','-pix_fmt','gray','-c:v','rawvideo','-threads:v','1','-f','rawvideo','-').stdout
    size=48*86; assert len(frames)==size*FRAMES
    span=min(max(b)-min(b) for b in (frames[i:i+size] for i in range(0,len(frames),size)))
    assert span>=55, 'Blank or clipped frame'
    result=dict(**identity(path),duration_s=SECONDS,fps=FPS,frames=FRAMES,resolution=[1080,1920],h264=True,yuv420p=True,cfr_pts=True,min_luma_span=span,audio_track=voice)
    if voice:
        a=meta['streams'][1]; assert (a['codec_name'],int(a['sample_rate']),a['channels'])==('aac',RATE,1)
        assert Fraction(a['duration'])==int(a['duration_ts'])*Fraction(a['time_base'])==SECONDS
        meter=run(ff,'-nostdin','-hide_banner','-xerror','-i',path,'-vn','-af','ebur128=peak=true','-f','null','-').stderr.decode().rsplit('Summary:',1)[-1]
        loud=float(re.search(r'\bI:\s+(-?\d+\.\d+) LUFS',meter)[1]); peak=float(re.search(r'\bPeak:\s+(-?\d+\.\d+) dBFS',meter)[1])
        assert -18<=loud<=-14 and peak<=-1
        pcm=array('h',run(ff,'-nostdin','-v','error','-xerror','-i',path,'-vn','-f','s16le','-').stdout);assert len(pcm)>=RATE*SECONDS
        y=rms(pcm)
        for i,c in enumerate(cues,1):
            spoken=y[c['start']:c['end']];assert sum(x>400 for x in spoken)>.22*len(spoken), i
        assert max(y[-65:])<35
        ref=path.parent/'audio/reference.wav'
        with wave.open(str(ref),'rb') as w:
            assert (w.getnchannels(),w.getsampwidth(),w.getframerate(),w.getnframes())==(1,2,RATE,RATE*SECONDS)
            x=rms(array('h',w.readframes(w.getnframes())))
        match=sum(a*b for a,b in zip(x,y))/math.sqrt(sum(a*a for a in x)*sum(b*b for b in y))
        assert match>.995
        result.update(lufs=loud,peak_dbtp=peak,reference_wav=identity(ref),reference_time_correlation=round(match,6))
    return result


def read_frames(ff,path,indices):
    selector='+'.join(f'eq(n\\,{f})' for f in indices)
    raw=run(ff,'-nostdin','-v','error','-xerror','-i',path,'-an','-vf',f'select={selector},scale=540:960:flags=lanczos',
            '-vsync','0','-pix_fmt','rgb24','-c:v','rawvideo','-threads:v','1','-f','rawvideo','-').stdout
    stride=540*960*3; assert len(raw)==len(indices)*stride
    return {f:Image.frombytes('RGB',(540,960),raw[i*stride:(i+1)*stride]) for i,f in enumerate(indices)}


def caption_checks(out,ff,t):
    cues=t['captions'];assert len(cues)==9
    def ms(x):
        h,m,s,t=map(int,re.split('[:,]',x));return ((h*60+m)*60+s)*1000+t
    for lang,label in [('sw','Swanglish'),('en','English')]:
        blocks=(out/'audio'/f'Audenic-Specs-{label}.srt').read_text(encoding='utf-8').strip().split('\n\n');assert len(blocks)==len(cues)
        last=-1
        for i,(s,c) in enumerate(zip(blocks,cues),1):
            num,tm,*lines=s.splitlines();a,b=map(ms,tm.split(' --> '))
            assert num==str(i) and (a,b)==tuple(round(c[k]*1000/FPS) for k in ('start','end')) and last<a<b<=SECONDS*1000 and lines==c[lang]
            assert 1<=len(lines)<=2 and max(map(len,lines))<=43
            last=b
    mid=[(c['start']+c['end'])//2 for c in cues];hold=[1490,1559];assert max(c['end'] for c in cues)<hold[0]
    evidence=[t['shots'][1]['start']+63,t['shots'][2]['start']+246]
    samples=sorted(set(mid+hold+evidence))
    voiced=read_frames(ff,out/PREVIEW,samples);clean=read_frames(ff,out/MASTER,samples)
    voiced[evidence[0]].save(out/'qa/encoded-shop.png')
    voiced[evidence[1]].save(out/'qa/encoded-specs.png')
    boxes=[]
    for i,f in enumerate(mid,1):
        diff=ImageChops.difference(voiced[f],clean[f]).convert('L').crop((0,642,540,711))
        box=diff.point(lambda p:255 if p>32 else 0).getbbox()
        assert box and 40<=box[0]<box[2]<=470 and box[2]-box[0]>=75 and box[3]-box[1]>=11, (i,box)
        boxes.append([2*box[0],1284+2*box[1],2*box[2],1284+2*box[3]])
    for cut in (voiced,clean):
        assert max(ImageStat.Stat(ImageChops.difference(cut[hold[0]],cut[hold[1]])).mean)<2
    assert max(ImageStat.Stat(ImageChops.difference(voiced[hold[1]],clean[hold[1]])).mean)<2
    sheet=Image.new('RGB',(1350,480),'#f4e5d4')
    for i,s in enumerate(t['shots']):
        f=max(f for f in mid if s['start']<=f<s['end']);sheet.paste(voiced[f].resize((270,480),Image.Resampling.LANCZOS),(i*270,0))
        voiced[f].save(out/'qa'/f'encoded-{s["shot"]}.png')
    sheet.save(out/'qa/encoded-phone-review.jpg',quality=93,optimize=True)
    voiced[hold[-1]].save(out/'qa/end-hold.png')
    return dict(verified_caption_boxes_at_1080=boxes,stable_end_hold_frames=hold)


def package(out,private,receipt):
    private.mkdir(parents=True,exist_ok=True)
    files={n:out/n for n in (PREVIEW,MASTER,COVER)}
    for n in ('reference.wav','timeline.json','Record-Your-Voiceover.txt','Audenic-Specs-Swanglish.srt','Audenic-Specs-English.srt'):
        files[f'voiceover/{n}']=out/'audio'/n
    for n in ('10-audenic-specs.md','10-audenic-specs-caption.txt'):
        files[f'publish/{n}']=ROOT/'content/pilots'/n
    for n in ('capture-proof.json','hero-credit.json','export-checks.json'):
        files[f'qa/{n}']=out/'qa'/n
    for a in [*receipt['assets'],json.loads((out/'qa/hero-credit.json').read_text(encoding='utf-8'))]:
        n=a['file']; p=out/'assets'/n; assert identity(p)['sha256']==a['sha256'],n
        files[f'assets/{n}']=p
    notes='''ALTRAWARE · AUDENIC SPECS · PRIVATE OWNER REVIEW

Watch Audenic-Specs-Reel.mp4 (scratch Swanglish voice and burn-in captions).
Use Audenic-Voiceover-Master.mp4 to record your own voice: no audio or dialogue captions.
voiceover/ has the scratch WAV, timed recording script and editable SW/EN SRTs. Retime after rerecording.
Cover-Audenic-Specs.png is the separate vertical cover.

Single CTA: Comment SPECS → https://audenic.vercel.app/shop/audenic-classic-red
Before posting, open the product page on a logged-out phone including Instagram's browser.
Send the demo page, never this owner-only ZIP. Caption and one-DM reply are in publish/.
This is a website showcase. UI crops are from the local pinned build and the specs are examples.
The unbranded headphone image is illustrative, not an Audenic product photo. Nothing is posted or automated.
'''
    dest=private/'Audenic-Specs-Review-Kit.zip'
    with ZipFile(dest,'w',ZIP_DEFLATED,compresslevel=7) as z:
        for n,p in files.items():z.write(p,n)
        z.writestr('START-HERE.txt',notes)
    with ZipFile(dest) as z:
        assert z.testzip() is None and set(z.namelist())==set(files)|{'START-HERE.txt'}
        for n in (PREVIEW,MASTER,COVER):assert z.read(n)==(out/n).read_bytes()
        print(dest,len(z.namelist()),'files',json.dumps(identity(dest)))
    for n in (PREVIEW,MASTER,COVER):shutil.copyfile(out/n,private/n)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('out',type=Path);p.add_argument('private',type=Path)
    p.add_argument('--ffmpeg',default='ffmpeg');p.add_argument('--ffprobe',default='ffprobe');a=p.parse_args();out=a.out.resolve()
    t=json.loads((out/'audio/timeline.json').read_text(encoding='utf-8'));assert (t['frames'],t['fps'])==(FRAMES,FPS)
    proof=json.loads((out/'qa/capture-proof.json').read_text(encoding='utf-8'))
    assert proof['viewport']==[390,844] and proof['scrollAfter']>proof['scrollBefore']+260
    assert [r['value'] for r in proof['rows'][-2:]]==['60h playback','248g']
    with Image.open(out/COVER) as im:assert im.size==(1080,1920);im.verify()
    q={COVER:identity(out/COVER),PREVIEW:verify_video(out/PREVIEW,a.ffmpeg,a.ffprobe,True,t['captions']),
       MASTER:verify_video(out/MASTER,a.ffmpeg,a.ffprobe,False,t['captions'])}
    q.update(caption_checks(out,a.ffmpeg,t))
    (out/'qa/export-checks.json').write_text(json.dumps(q,indent=2)+'\n',encoding='utf-8');print(json.dumps(q))
    package(out,a.private,proof)


if __name__=='__main__':main()
