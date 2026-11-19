"""Verify both 32s exports and build the private Website Action review kit."""
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
FPS, FRAMES, RATE = 60, 1920, 48000
SECONDS = FRAMES // FPS
PREVIEW, MASTER, COVER = 'Menu-Iko-Wapi-Reel.mp4', 'Website-Action-Voiceover-Master.mp4', 'Cover-Menu-Iko-Wapi.png'


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
        blocks=(out/'audio'/f'Website-Action-{label}.srt').read_text(encoding='utf-8').strip().split('\n\n');assert len(blocks)==len(cues)
        last=-1
        for i,(s,c) in enumerate(zip(blocks,cues),1):
            num,tm,*lines=s.splitlines();a,b=map(ms,tm.split(' --> '))
            assert num==str(i) and (a,b)==tuple(round(c[k]*1000/FPS) for k in ('start','end')) and last<a<b<=32000 and lines==c[lang]
            assert 1<=len(lines)<=2 and max(map(len,lines))<=43
            last=b
    mid=[(c['start']+c['end'])//2 for c in cues];hold=[1848,1919];assert max(c['end'] for c in cues)<hold[0]
    voiced=read_frames(ff,out/PREVIEW,mid+hold);clean=read_frames(ff,out/MASTER,mid+hold)
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
    for n in ('reference.wav','timeline.json','Record-Your-Voiceover.txt','Website-Action-Swanglish.srt','Website-Action-English.srt'):
        files[f'voiceover/{n}']=out/'audio'/n
    for n in ('09-website-action.md','09-website-action-caption.txt'):
        files[f'publish/{n}']=ROOT/'content/pilots'/n
    for n in ('capture-proof.json','export-checks.json'):
        files[f'qa/{n}']=out/'qa'/n
    for a in receipt['files']:
        n=a['file']; p=out/'assets'/n; assert identity(p)['sha256']==a['sha256'],n
        files[f'assets/{n}']=p
    notes='''ALTRAWARE · MENU IKO WAPI? · PRIVATE OWNER REVIEW

Watch Menu-Iko-Wapi-Reel.mp4 (TTS reference and Swanglish subtitles).
Use Website-Action-Voiceover-Master.mp4 for your real voice: no audio or dialogue captions.
voiceover/ has the scratch WAV, cue sheet and editable SW/EN SRTs. Retime after rerecording.
Cover-Menu-Iko-Wapi.png is the separate vertical cover.

Single CTA: Comment LINK → https://bongofoodie.vercel.app/
Send the website, never this owner-only ZIP. Check the menu in Instagram's browser before publishing.
This is a website showcase, not a food offer. Search proof is from the local pinned build.
Caption and one-DM reply are in publish/; no automation or post is live.
'''
    dest=private/'Menu-Iko-Wapi-Review-Kit.zip'
    with ZipFile(dest,'w',ZIP_DEFLATED,compresslevel=7) as z:
        for n,p in files.items():z.write(p,n)
        z.writestr('START-HERE.txt',notes)
    with ZipFile(dest) as z:
        assert z.testzip() is None and set(z.namelist())==set(files)|{'START-HERE.txt'}
        for n in (PREVIEW,MASTER,COVER):assert z.read(n)==(out/n).read_bytes()
        print(dest,len(z.namelist()),'files',json.dumps(identity(dest)))
    shutil.copyfile(out/PREVIEW,private/PREVIEW)
    shutil.copyfile(out/COVER,private/COVER)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('out',type=Path);p.add_argument('private',type=Path)
    p.add_argument('--ffmpeg',default='ffmpeg');p.add_argument('--ffprobe',default='ffprobe');a=p.parse_args();out=a.out.resolve()
    t=json.loads((out/'audio/timeline.json').read_text(encoding='utf-8'));assert (t['frames'],t['fps'])==(FRAMES,FPS)
    proof=json.loads((out/'qa/capture-proof.json').read_text(encoding='utf-8'))
    assert (proof['before'],proof['visibleMenu'],proof['highlight']['priceExample'])==(11,['Pilau ya Kuku'],'TSh 10,000')
    with Image.open(out/COVER) as im:assert im.size==(1080,1920);im.verify()
    q={COVER:identity(out/COVER),PREVIEW:verify_video(out/PREVIEW,a.ffmpeg,a.ffprobe,True,t['captions']),
       MASTER:verify_video(out/MASTER,a.ffmpeg,a.ffprobe,False,t['captions'])}
    q.update(caption_checks(out,a.ffmpeg,t))
    (out/'qa/export-checks.json').write_text(json.dumps(q,indent=2)+'\n',encoding='utf-8');print(json.dumps(q))
    package(out,a.private,proof)


if __name__=='__main__':main()
