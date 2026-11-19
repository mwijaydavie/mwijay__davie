"""Decode the deliverables, validate the PDF code, and package private vs audience assets."""
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
from tempfile import TemporaryDirectory
import wave
from zipfile import ZipFile, ZIP_DEFLATED

from PIL import Image, ImageChops, ImageStat
from pypdf import PdfReader

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
FPS,FRAMES,RATE=60,2220,48000
SECONDS=37
SAMPLES=RATE*SECONDS
STEP=RATE//FPS
PREVIEW='Mbona-Pilau-Imerudi-Reel.mp4'
PICTURE='Search-Race-Clean-Picture.mp4'
FX='Search-Race-Picture-and-SFX.mp4'
COVER='Cover-Mbona-Pilau.png'
AUDIENCE_PDF='SEARCH-Mfano-wa-Code.pdf'
WORKSHEET='SIZE-Worksheet-ya-Bei.pdf'
CODE_KIT='SEARCH-Code-Kit.zip'
STEMS=('reference.wav','SFX-Only.wav','Voice-and-SFX.wav')
RECORD=(*STEMS,'timeline.json','sfx-cues.json','Record-Your-Voiceover.txt','Search-Race-Swanglish.srt','Search-Race-English.srt')


def run(cmd,*args):
    return subprocess.run([cmd,*map(str,args)],check=True,capture_output=True)


def info(path):
    b=path.read_bytes()
    return dict(bytes=len(b),md5=md5(b).hexdigest(),sha256=sha256(b).hexdigest())


def load(path):
    return json.loads(path.read_text(encoding='utf-8'))


def pcm_read(path):
    with wave.open(str(path),'rb') as w:
        assert (w.getframerate(),w.getnchannels(),w.getsampwidth(),w.getnframes())==(RATE,1,2,SAMPLES)
        return array('h',w.readframes(SAMPLES))


def envelope(a):
    return [math.sqrt(sum(x*x for x in a[i:i+STEP])/STEP) for i in range(0,SAMPLES,STEP)]


def correlation(x,y):
    return sum(a*b for a,b in zip(x,y))/math.sqrt(sum(a*a for a in x)*sum(b*b for b in y))


def verify_video(path,ff,probe,stem=None,voiced=False):
    meta=json.loads(run(probe,'-v','error','-show_streams','-show_format','-of','json',path).stdout)
    assert [s['codec_type'] for s in meta['streams']]==(['video','audio'] if stem is not None else ['video'])
    v=meta['streams'][0]
    assert (v['codec_name'],v['pix_fmt'],v['width'],v['height'])==('h264','yuv420p',1080,1920)
    assert (v['r_frame_rate'],v['avg_frame_rate'])==('60/1','60/1')
    assert Fraction(v['duration'])==Fraction(meta['format']['duration'])==SECONDS
    f=json.loads(run(probe,'-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp','-of','json',path).stdout)['frames']
    assert [int(x['best_effort_timestamp'])*Fraction(v['time_base']) for x in f]==[Fraction(i,FPS) for i in range(FRAMES)]
    raw=run(ff,'-nostdin','-v','error','-xerror','-i',path,'-an','-vf','scale=48:86','-pix_fmt','gray','-c:v','rawvideo','-threads:v','1','-f','rawvideo','-').stdout
    size=48*86;assert len(raw)==size*FRAMES
    span=min(max(b)-min(b) for b in (raw[i:i+size] for i in range(0,len(raw),size)))
    assert span>=55,'Blank/flat frame'
    result=dict(**info(path),duration_s=SECONDS,fps=FPS,frames=FRAMES,resolution=[1080,1920],video='h264 yuv420p',cfr_pts=True,min_luma_span=span,audio=stem is not None)
    if stem is not None:
        a=meta['streams'][1];assert (a['codec_name'],int(a['sample_rate']),a['channels'])==('aac',RATE,1)
        assert int(a['duration_ts'])*Fraction(a['time_base'])==SECONDS
        meter=run(ff,'-nostdin','-hide_banner','-xerror','-i',path,'-vn','-af','ebur128=peak=true','-f','null','-').stderr.decode().rsplit('Summary:',1)[-1]
        loud=float(re.search(r'\bI:\s+(-?\d+\.\d+) LUFS',meter)[1]);peak=float(re.search(r'\bPeak:\s+(-?\d+\.\d+) dBFS',meter)[1]);
        y=array('h',run(ff,'-nostdin','-v','error','-xerror','-i',path,'-vn','-f','s16le','-').stdout);assert len(y)>=SAMPLES
        match=correlation(envelope(stem),envelope(y));assert match>.995,(path.name,match)
        assert max(map(abs,y[-RATE:]))<20,'Audio on final hold'
        assert (-18<=loud<=-14 and peak<=-1) if voiced else -37<peak<-24,(path.name,loud,peak)
        result.update(lufs=loud,peak_dbtp=peak,stem_envelope_correlation=round(match,6))
    print(path.name,result,flush=True)
    return result


def read_frames(ff,path,indices):
    selector='+'.join(f'eq(n\\,{f})' for f in indices)
    raw=run(ff,'-nostdin','-v','error','-xerror','-i',path,'-an','-vf',f'select={selector},scale=540:960:flags=lanczos',
            '-fps_mode','passthrough','-pix_fmt','rgb24','-c:v','rawvideo','-threads:v','1','-f','rawvideo','-').stdout
    stride=540*960*3;assert len(raw)==len(indices)*stride
    return {f:Image.frombytes('RGB',(540,960),raw[i*stride:(i+1)*stride]) for i,f in enumerate(indices)}


def picture_checks(out,ff,t,score,ref):
    cues=t['captions'];assert len(cues)==16
    def ms(x):
        h,m,s,sub=map(int,re.split('[:,]',x));return ((h*60+m)*60+s)*1000+sub
    voice=envelope(ref);scorems=[e['frame'] for e in score['events']]
    assert scorems==sorted(set(scorems)) and len(scorems)==14
    for lang,label in [('sw','Swanglish'),('en','English')]:
        blocks=(out/'audio'/f'Search-Race-{label}.srt').read_text(encoding='utf-8').strip().split('\n\n');assert len(blocks)==len(cues)
        last=-1
        for i,(s,c) in enumerate(zip(blocks,cues),1):
            num,tm,*lines=s.splitlines();a,b=map(ms,tm.split(' --> '))
            assert num==str(i) and (a,b)==tuple(round(c[k]*1000/FPS) for k in ('start','end')) and last<a<b<=SECONDS*1000 and lines==c[lang]
            assert 1<=len(lines)<=2 and max(map(len,lines))<=43
            assert max(voice[c['start']:c['end']])>260, f'No speech energy under cue {i}'
            last=b
    mid=[(c['start']+c['end'])//2 for c in cues]
    layout=load(HERE/'layout.json');rp={**layout['review'],'reopen':114}  # f96 and f114 have nearly identical torso lean.
    hold=[rp['cta'],FRAMES-1];assert max(c['end'] for c in cues)<hold[0]
    ap=t['shots'][1]['start']+layout['race'][-1];point_samples=[ap-14,ap+14]
    samples=sorted(set(mid+hold+list(rp.values())+point_samples+[a['start'] for a in t['shots']]))
    clean=read_frames(ff,out/PICTURE,samples);review=read_frames(ff,out/PREVIEW,samples)
    part=read_frames(ff,out/FX,sorted(set(hold+list(rp.values()))));assert all(ImageChops.difference(clean[k],im).getbbox() is None for k,im in part.items())
    for k,f in rp.items(): review[f].save(out/'qa'/f'encoded-{k}.png')
    def delta(a,b,region=None,cut=clean):
        im=ImageChops.difference(cut[a],cut[b]);im=im.crop(region) if region else im
        return sum(ImageStat.Stat(im).mean)/3
    motion=dict(blink=delta(rp['open'],rp['blink'],(374,305,411,324)),
      reopen=delta(rp['open'],rp['reopen'],(374,305,411,324)),
      wave=delta(rp['waveA'],rp['waveB'],(303,318,356,388)),
      wave_shoes=delta(rp['waveA'],rp['waveB'],(334,607,455,640)),
      point=delta(*point_samples,(340,382,368,426)),
      point_shoes=delta(*point_samples,(371,604,474,644)))
    print('Decoded pixel deltas',motion,flush=True)
    assert motion['blink']>5 and motion['reopen']<motion['blink']*.6 and motion['wave']>5 and motion['point']>3
    assert motion['wave_shoes']<2 and motion['point_shoes']<2, 'A shoe moved within the shot'
    boxes=[]
    for i,f in enumerate(mid,1):
        diff=ImageChops.difference(review[f],clean[f]).convert('L').crop((0,637,540,713))
        box=diff.point(lambda p:255 if p>32 else 0).getbbox()
        assert box and 40<=box[0]<box[2]<=470 and box[2]-box[0]>=75 and box[3]-box[1]>=11,(i,box)
        boxes.append([2*box[0],1274+2*box[1],2*box[2],1274+2*box[3]])
    for cut in (clean,review): assert delta(*hold,cut=cut)<2,'Unstable final hold'
    assert max(ImageStat.Stat(ImageChops.difference(clean[hold[1]],review[hold[1]])).mean)<2
    names=['waveB','before','guard','after','oldError','cta'];sheet=Image.new('RGB',(1800,640),'#eff5fb')
    for i,name in enumerate(names):sheet.paste(review[rp[name]].resize((300,533),Image.Resampling.LANCZOS),(i*300,0))
    sheet=sheet.crop((0,0,1800,533));sheet.save(out/'qa/encoded-phone-review.jpg',quality=94,optimize=True)
    return dict(verified_caption_boxes=boxes,stable_end_hold_frames=hold,decoded_motion_rgb={k:round(v,2) for k,v in motion.items()},motion_samples=rp,point_samples=point_samples)


def pdf_checks(audience):
    search=PdfReader(audience/AUDIENCE_PDF);pricing=PdfReader(audience/WORKSHEET)
    assert (len(search.pages),len(pricing.pages))==(3,2)
    links={str(a.get_object()['/A']['/URI']) for doc in (search,pricing) for p in doc.pages for a in p.get('/Annots',[]) if '/A' in a.get_object() and '/URI' in a.get_object()['/A']}
    assert links=={'https://react.dev/reference/react/useEffect#fetching-data-with-effects','https://www.gsb.stanford.edu/faculty-research/publications/choice-based-reasons-case-attraction-compromise-effects'}
    assert all(419<=p.mediabox.width<=421 and 594<=p.mediabox.height<=596 for doc in (search,pricing) for p in doc.pages)
    full='\n\n'.join(search.pages[i].extract_text().split(start,1)[1].split(end,1)[0].strip() for i,start,end in [(1,'SEARCH-DEMO.MJS · 1 / 2','USISAHAU CLEAR'),(2,'SEARCH-DEMO.MJS · 2 / 2','node search-demo.mjs')])+'\n'
    src=(HERE/'quick-example.mjs').read_text(encoding='utf-8');assert (audience/'search-demo.mjs').read_text()==src
    assert full==src.replace('// Local simulation: no fetch, timer or API key.\n','')
    with TemporaryDirectory() as d:
        p=Path(d)/'search-demo.mjs';p.write_text(full)
        for args in ([],['--old-error']):assert run('node',p,*args).stdout.strip()==b'chai Chai ready'
    text=pricing.pages[0].extract_text();assert all(x in text for x in ('3,000','5,000','9,000','1,200','1,000','900','si ofa'))
    print('PDF code extraction → both runs pass; 3p SEARCH, 2p SIZE.',flush=True)
    return {AUDIENCE_PDF:dict(**info(audience/AUDIENCE_PDF),pages=3,paste_and_run=['chai Chai ready']*2),WORKSHEET:dict(**info(audience/WORKSHEET),pages=2), 'sources':sorted(links)}


def zip_check(dest,files,notes):
    with ZipFile(dest,'w',ZIP_DEFLATED,compresslevel=6) as z:
        for target,src in files.items():z.write(src,target)
        for k,v in notes.items():z.writestr(k,v)
    with ZipFile(dest) as z:
        assert z.testzip() is None and set(z.namelist())==set(files)|set(notes)
        for target,src in files.items():assert sha256(z.read(target)).hexdigest()==info(src)['sha256']
        print(dest,len(z.namelist()),'files',info(dest),flush=True)


def package(out,private,rig):
    private.mkdir(parents=True,exist_ok=True);audience=out/'audience';qa=out/'qa';content=ROOT/'content/pilots'
    codefiles={n:audience/n for n in (AUDIENCE_PDF,'search-demo.mjs')}
    codefiles.update({n:HERE/n for n in ('latest.mjs','latest.test.mjs')})
    codefiles['search-proof.json']=qa/'search-proof.json'
    zip_check(audience/CODE_KIT,codefiles,{'START-HERE.txt':'''ALTRAWARE · SEARCH · JAVASCRIPT

Open SEARCH-Mfano-wa-Code.pdf for the explanation and a copyable example.
Unzip the files to one directory. Use Node.js 18+ in that directory. No install, API or credentials.

    node search-demo.mjs
    node search-demo.mjs --old-error
    node --test latest.test.mjs

First two runs: chai Chai ready. Seven tests exercise the full trace used in the Reel.
Compare search-proof.json: before = Pilau for query chai, guard on = Chai, old error = Chai.
This is a local simulation, not timing or behaviour of an actual menu site.
'''})
    files={f'01-Watch/{n}':out/n for n in (PREVIEW,COVER)}
    files.update({f'02-Record/{n}':out/n for n in (PICTURE,FX)})
    files.update({f'02-Record/{n}':out/'audio'/n for n in RECORD})
    files.update({f'03-Comment-Resources/{n}':audience/n for n in (AUDIENCE_PDF,WORKSHEET,CODE_KIT)})
    files.update({f'03-Comment-Resources/{n}':content/n for n in ('13-search-race-caption.txt','13-search-race-dm.md','12-price-story-caption.txt')})
    files['04-Source-And-QA/Production-Breakdown.md']=HERE/'README.md'
    files['04-Source-And-QA/Pilot.md']=content/'13-search-race.md'
    files.update({f'04-Source-And-QA/source/{p.name}':p for p in HERE.iterdir() if p.is_file() and p.name!='README.md'})
    for n in ('host-rig.json','search-proof.json','guide-checks.json','export-checks.json','picture-cut.json','encoded-phone-review.jpg'):
        files[f'04-Source-And-QA/qa/{n}']=qa/n
    for a in rig['files']:
        n=a['file'];p=out/'assets'/n;assert info(p)['sha256']==a['sha256'];files[f'04-Source-And-QA/rig-assets/{n}']=p
    files['04-Source-And-QA/rig-assets/altraware.png']=ROOT/'content/assets/altraware-mark.png'
    zip_check(private/'Mbona-Pilau-Owner-Kit.zip',files,{'START-HERE.txt':'''ALTRAWARE · CODE STORY 01 · PRIVATE OWNER REVIEW

01-Watch: 37s Reel with the selected masculine scratch VO, quiet SFX and Swanglish subtitles. Cover included.
02-Record: picture with SFX (no speech), or clean picture plus separate SFX WAV. Don't layer SFX twice.
           Timed read guide and SW / EN captions. Retime captions to your actual recorded take.
03-Comment-Resources: SEARCH code PDF + tested JS ZIP, SIZE worksheet and caption update for Business.
                      Send only the approved audience-facing assets. Never send this owner ZIP.
04-Source-And-QA: build notes, composition, keyed rig, traces, export checks and one phone-sized review strip.

The Tech host is new original illustration art. The Business host and delivered Bei Ileile Reel stay as-is.
No Pinterest audio (403 on all three), no accounts changed, nothing posted or made public.
'''})
    for n in (PREVIEW,PICTURE,FX,COVER):shutil.copyfile(out/n,private/n)
    aud=private/'comment-resources';aud.mkdir(exist_ok=True)
    for n in (AUDIENCE_PDF,WORKSHEET,CODE_KIT):shutil.copyfile(audience/n,aud/n)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('out',type=Path);p.add_argument('private',type=Path)
    p.add_argument('--ffmpeg',default='ffmpeg');p.add_argument('--ffprobe',default='ffprobe');a=p.parse_args();out=a.out.resolve()
    t=load(out/'audio/timeline.json');assert (t['frames'],t['fps'])==(FRAMES,FPS)
    rig=load(out/'qa/host-rig.json');assert list(rig['poses'])==['hello','point'] and rig['sole']==1309 and len(rig['files'])==7
    p=load(out/'qa/search-proof.json')
    assert [x['id'] for x in p['before']['trace']]==[1,2,2,1]
    assert (p['before']['final']['rows'],p['after']['final']['rows'],p['oldError']['final']['rows'])==(['Pilau'],['Chai'],['Chai']) and p['oldError']['trace'][3]['event']=='ignored-error'
    with Image.open(out/COVER) as im:assert im.size==(1080,1920);im.verify()
    ref,sfx,mix=(pcm_read(out/'audio'/n) for n in STEMS);assert all(x+y==z for x,y,z in zip(ref,sfx,mix))
    score=load(out/'audio/sfx-cues.json');assert score['fx_dBFS']<-24 and score['mix_dBFS']<=-1.4
    gate=dict(scope='technical export validation, not human listen-through or production/IG test',pdf=pdf_checks(out/'audience'),sfx=score)
    gate['video']={PREVIEW:verify_video(out/PREVIEW,a.ffmpeg,a.ffprobe,mix,True),FX:verify_video(out/FX,a.ffmpeg,a.ffprobe,sfx),PICTURE:verify_video(out/PICTURE,a.ffmpeg,a.ffprobe),COVER:info(out/COVER)}
    gate.update(picture_checks(out,a.ffmpeg,t,score,ref))
    (out/'qa/export-checks.json').write_text(json.dumps(gate,indent=2)+'\n',encoding='utf-8')
    package(out,a.private,rig)


if __name__=='__main__':main()
