"""Verify the exact 60-second model guide exports and both language PDFs."""
import argparse
from array import array
from fractions import Fraction
from hashlib import sha256, md5
import json
import math
from pathlib import Path
import re
import subprocess
import wave
from PIL import Image, ImageChops, ImageStat
from pypdf import PdfReader

FPS,FRAMES,RATE=60,3600,48000
SECONDS=FRAMES//FPS


def run(tool,*args):return subprocess.run([tool,*map(str,args)],check=True,capture_output=True)


def identity(p):
    b=p.read_bytes();return dict(bytes=len(b),sha256=sha256(b).hexdigest(),md5=md5(b).hexdigest())


def pdf(path,lang):
    d=PdfReader(path); assert len(d.pages)==7 and not d.is_encrypted
    assert d.root_object['/Lang']==lang and d.root_object['/MarkInfo']['/Marked']
    assert len(d.named_destinations)==6
    urls=[];internal=0
    for p in d.pages:
        assert abs(float(p.mediabox.width)-419.53)<2 and abs(float(p.mediabox.height)-595.28)<2
        assert len(p.extract_text())>=330
        for n in p.get('/Annots') or []:
            link=n.get_object(); assert link['/Subtype']=='/Link'
            if '/A' in link:
                a=link['/A'];assert a['/S']=='/URI' and str(a['/URI']).startswith('https://')
                urls.append(str(a['/URI']))
            else:
                assert '/Dest' in link; internal+=1
    table=json.loads(Path(__file__).with_name('routes.json').read_text(encoding='utf-8'))
    assert len(table)==16 and {r['url'] for r in table}<=set(urls)
    assert len(set(urls))==27 and internal==6
    return {**identity(path),'lang':lang,'tagged':True,'pages':7,'internal_links':internal,'unique_https':sorted(set(urls))}


def millis(t):
    a,b,c,d=map(int,re.split('[:,]',t));return (a*3600+b*60+c)*1000+d


def srt(path,captions,lang):
    last=-1; parts=path.read_text(encoding='utf-8').strip().split('\n\n')
    assert len(parts)==len(captions)==17
    for i,(block,c) in enumerate(zip(parts,captions),1):
        n,interval,*lines=block.splitlines(); assert n==str(i) and lines==c[lang]
        first,end=map(millis,interval.split(' --> '))
        assert (first,end)==tuple(round(c[f]*1000/FPS) for f in ('start','end'))
        assert last<first<end<=SECONDS*1000
        assert 1<=len(lines)<=2 and max(map(len,lines))<=42
        last=end
    return len(parts)


def audio_rms(pcm):
    sf=RATE//FPS
    return [math.sqrt(sum(v*v for v in pcm[i:i+sf])/sf) for i in range(0,RATE*SECONDS,sf)]


def video(path,ff,probe,voice,timeline):
    meta=json.loads(run(probe,'-v','error','-show_streams','-show_format','-of','json',path).stdout)
    assert [s['codec_type'] for s in meta['streams']]==(['video','audio'] if voice else ['video'])
    v=meta['streams'][0];a=meta['streams'][1] if voice else None
    assert (v['codec_name'],v['width'],v['height'],v['pix_fmt'])==('h264',1080,1920,'yuv420p')
    assert (v['r_frame_rate'],v['avg_frame_rate'])==('60/1','60/1')
    assert Fraction(meta['format']['duration'])==Fraction(v['duration'])==SECONDS
    f=json.loads(run(probe,'-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp','-of','json',path).stdout)['frames']
    time_base=Fraction(v['time_base']); assert [int(x['best_effort_timestamp'])*time_base for x in f]==[Fraction(i,FPS) for i in range(FRAMES)]
    luma=run(ff,'-nostdin','-v','error','-xerror','-i',path,'-map','0:v:0','-vf','scale=48:86','-c:v','rawvideo','-pix_fmt','gray','-f','rawvideo','-').stdout
    size=48*86;assert len(luma)==FRAMES*size
    span=min(max(p)-min(p) for p in (luma[i:i+size] for i in range(0,len(luma),size)))
    assert span>=54
    result={**identity(path),'duration_s':SECONDS,'frames':FRAMES,'fps':FPS,'dimensions':[1080,1920],
            'pixel_format':'yuv420p','video':'H.264','CFR_PTS':True,'minimum_luma_span':span,'audio_track':voice}
    if a:
        assert (a['codec_name'],int(a['sample_rate']),a['channels'])==('aac',RATE,1)
        assert Fraction(a['duration'])==int(a['duration_ts'])*Fraction(a['time_base'])==SECONDS
        e=run(ff,'-nostdin','-hide_banner','-xerror','-i',path,'-vn','-af','ebur128=peak=true','-f','null','-').stderr.decode().rsplit('Summary:',1)[-1]
        loud=float(re.search(r'\bI:\s+(-?\d+\.\d+) LUFS',e)[1]);peak=float(re.search(r'\bPeak:\s+(-?\d+\.\d+) dBFS',e)[1]);assert -18<=loud<=-14 and peak<=-1
        pcm=array('h',run(ff,'-nostdin','-v','error','-xerror','-i',path,'-vn','-f','s16le','-').stdout)
        assert len(pcm)>=RATE*SECONDS
        rms=audio_rms(pcm)
        for i,c in enumerate(timeline['captions'],1):
            clip=rms[c['start']:c['end']]
            assert sum(x>400 for x in clip)>.21*len(clip), ('No speech in cue',i)
        assert max(rms[-65:])<35
        wav=path.parent/'audio/reference.wav'
        with wave.open(str(wav),'rb') as f:
            assert (f.getnchannels(),f.getsampwidth(),f.getframerate(),f.getnframes())==(1,2,RATE,RATE*SECONDS)
            ref=audio_rms(array('h',f.readframes(RATE*SECONDS)))
        cosine=sum(x*y for x,y in zip(ref,rms))/math.sqrt(sum(x*x for x in ref)*sum(y*y for y in rms))
        assert cosine>.995, 'Wrong scratch voice or timing drift'
        result.update(lufs=loud,peak_dbtp=peak,audio='AAC 48kHz mono',reference=identity(wav),reference_timing_correlation=round(cosine,6))
    return result


def frame_samples(path, ff, indices):
    w,h=540,960
    filt='select='+ '+'.join(f'eq(n\\,{i})' for i in indices)+f',scale={w}:{h}:flags=lanczos'
    b=run(ff,'-nostdin','-v','error','-xerror','-i',path,'-an','-vf',filt,'-vsync','0','-pix_fmt','rgb24','-c:v','rawvideo','-threads:v','1','-f','rawvideo','-').stdout
    length=w*h*3
    assert len(b)==length*len(indices), (len(b),len(indices))
    return {f:Image.frombytes('RGB',(w,h),b[i*length:(i+1)*length]) for i,f in enumerate(indices)}


def compare_picture(out, ff, voiced, master, t):
    cues=t['captions']
    centers=[(c['start']+c['end'])//2 for c in cues]
    hold=[FRAMES-96, FRAMES-1]
    assert hold[0]>max(c['end'] for c in cues)
    frames=centers+hold
    active=frame_samples(voiced,ff,frames)
    clean=frame_samples(master,ff,frames)
    # Isolate the burned-in text from the same silent master frame after encode.
    boxes=[]
    for i,f in enumerate(centers,1):
        diff=ImageChops.difference(active[f],clean[f]).convert('L').crop((0,642,540,711))
        box=diff.point(lambda v:255 if v>32 else 0).getbbox()
        assert box and 40<=box[0]<box[2]<=470 and box[2]-box[0]>=84 and box[3]-box[1]>=11, (i,box)
        boxes.append({'cue':i,'frame':f,'bounds_at_1080':[2*box[0],1284+2*box[1],2*box[2],1284+2*box[3]]})
    for version in (active,clean):
        assert max(ImageStat.Stat(ImageChops.difference(*(version[i] for i in hold))).mean)<2, 'End hold moves'
    assert max(ImageStat.Stat(ImageChops.difference(active[hold[-1]],clean[hold[-1]])).mean)<2, 'End hold still has captions'
    small=Image.new('RGB',(1080,960),'#f6edde')
    for i,s in enumerate(t['scenes']):
        c=max(f for f in centers if s['start']<=f<s['end'])
        small.paste(active[c].resize((270,480),Image.Resampling.LANCZOS),(i%4*270,i//4*480))
    # Save the final hold separately and keep the sheet limited to the eight scenes.
    active[hold[-1]].save(out/'qa/end-hold.png')
    small.save(out/'qa/encoded-phone-review.jpg',quality=92,optimize=True)
    return {'all_cues_sampled':len(boxes),'caption_boxes':boxes,'stable_caption_free_end_hold_frames':hold}


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('out',type=Path);p.add_argument('--ffmpeg',default='ffmpeg');p.add_argument('--ffprobe',default='ffprobe');p.add_argument('--only-guides',action='store_true')
    a=p.parse_args();d=a.out.resolve(); langs=[('sw','Swanglish'),('en','English')]
    q={f'Free-AI-API-Guide-{label}.pdf':pdf(d/f'Free-AI-API-Guide-{label}.pdf',lang) for lang,label in langs}
    assert q['Free-AI-API-Guide-Swanglish.pdf']['unique_https']==q['Free-AI-API-Guide-English.pdf']['unique_https']
    if not a.only_guides:
        t=json.loads((d/'audio/timeline.json').read_text(encoding='utf-8')); assert (t['fps'],t['frames'])==(FPS,FRAMES)
        q['subtitles']={lang:srt(d/'audio'/f'Model-Providers-{label}.srt',t['captions'],lang) for lang,label in langs}
        c=d/'Cover-Free-AI-API.png'
        with Image.open(c) as im:assert im.size==(1080,1920);im.verify()
        q[c.name]=identity(c)
        voiced=d/'Tech-Tip-Free-AI-API-60s.mp4'; master=d/'Tech-Tip-Model-Providers-Voiceover-Master.mp4'
        q[voiced.name]=video(voiced,a.ffmpeg,a.ffprobe,True,t)
        q[master.name]=video(master,a.ffmpeg,a.ffprobe,False,t)
        q['compare_picture']=compare_picture(d,a.ffmpeg,voiced,master,t)
        (d/'qa/encoded-checks.json').write_text(json.dumps(q,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    for name,v in q.items():
        if 'unique_https' in v:v={**v,'unique_https':len(v['unique_https'])}
        print(name,json.dumps(v,ensure_ascii=False))


if __name__=='__main__':main()
