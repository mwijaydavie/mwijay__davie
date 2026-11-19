"""Check final encoded media and collect the private owner kit and separate portable skill."""
import argparse
from fractions import Fraction
from hashlib import md5, sha256
import json
from pathlib import Path
import re
import shutil
import subprocess
import wave
from zipfile import ZIP_DEFLATED, ZipFile

import numpy as np
from PIL import Image, ImageDraw
from pypdf import PdfReader

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
SKILL=ROOT/'.agents/skills/altraware-search-reels'
CONTENT=ROOT/'content/pilots'
WIDTH,HEIGHT,FPS,SEC,RATE=1080,1920,60,45,48000
FRAMES,SAMPLES=SEC*FPS,SEC*RATE
CUTS=[0,360,708,1176,1656,2256,2700]
CUES='Record-Your-Voiceover.txt'
STEMS=['reference.wav','SFX-Only.wav','Voice-and-SFX.wav']


def run(*args):
    return subprocess.run(list(map(str,args)),check=True,capture_output=True)


def load(path):
    return json.loads(path.read_text(encoding='utf-8'))


def info(path):
    b=path.read_bytes()
    return dict(bytes=len(b),md5=md5(b).hexdigest(),sha256=sha256(b).hexdigest())


def pcm(path):
    with wave.open(str(path),'rb') as w:
        assert w.getparams()[:4]==(1,2,RATE,SAMPLES),path.name
        return np.frombuffer(w.readframes(SAMPLES),dtype='<i2')


def measure(ff,path):
    meter=run(ff,'-nostdin','-hide_banner','-xerror','-i',path,'-vn','-af','ebur128=peak=true','-f','null','-').stderr.decode().rsplit('Summary:',1)[-1]
    return {k:float(re.search(pattern,meter)[1]) for k,pattern in dict(lufs=r'\bI:\s+(-?\d+\.\d+) LUFS',
            lra=r'\bLRA:\s+(\d+\.\d+) LU',dbtp=r'\bPeak:\s+(-?\d+\.\d+) dBFS').items()}


def verify_video(ff,probe,path,mix=None):
    d=json.loads(run(probe,'-v','error','-show_streams','-show_format','-of','json',path).stdout)
    assert [s['codec_type'] for s in d['streams']]==(['video'] if mix is None else ['video','audio']),path.name
    v=d['streams'][0]
    assert (v['codec_name'],v['pix_fmt'],v['width'],v['height'],v['avg_frame_rate'],v['r_frame_rate'])==('h264','yuv420p',WIDTH,HEIGHT,'60/1','60/1')
    assert Fraction(v['duration'])==Fraction(d['format']['duration'])==SEC
    pts=json.loads(run(probe,'-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp','-of','json',path).stdout)['frames']
    tb=Fraction(v['time_base']);step=Fraction(1,FPS)/tb
    assert len(pts)==FRAMES and all(int(t['best_effort_timestamp'])==i*step for i,t in enumerate(pts))
    grey=run(ff,'-nostdin','-v','error','-xerror','-i',path,'-an','-vf','scale=48:86,format=gray','-threads:v',1,'-f','rawvideo','-').stdout
    assert len(grey)==48*86*FRAMES
    span=int(np.ptp(np.frombuffer(grey,dtype=np.uint8).reshape(FRAMES,-1),axis=1).min());assert span>=55,'Blank/flat frame'
    report=dict(**info(path),video='h264/yuv420p',size=[WIDTH,HEIGHT],frames=FRAMES,duration_s=SEC,fps=FPS,cfr_pts=True,min_luma_span=span,audio=None)
    if mix is not None:
        a=d['streams'][1];assert (a['codec_name'],int(a['sample_rate']),a['channels'])==('aac',RATE,1)
        assert int(a['duration_ts'])*Fraction(a['time_base'])==SEC
        raw=run(ff,'-nostdin','-v','error','-xerror','-i',path,'-vn','-f','s16le','-').stdout
        take=np.frombuffer(raw,dtype='<i2');assert SAMPLES<=len(take)<=SAMPLES+1024
        corr=float(np.corrcoef(take[:SAMPLES],mix)[0,1]);levels=measure(ff,path)
        assert corr>.98 and -17.3<=levels['lufs']<=-14.7 and levels['dbtp']<=-1.0,(corr,levels)
        report['audio']=dict(codec='aac',sample_rate=RATE,channels=1,same_time_correlation=round(corr,5),**levels)
    print(f'{path.name}: {FRAMES} decoded frames · {SEC}s · 60 CFR · {report["audio"] or "silent"}',flush=True)
    return report


def stamp(f):
    ms=round(f*1000/FPS)
    return f'00:00:{ms//1000:02},{ms%1000:03}'


def verify_sources(out):
    q=out/'qa';assets=out/'assets';rig=load(q/'host-rig.json');meta=load(q/'capture-assets.json');bongo=load(q/'bongo-source.json');aud=load(q/'audenic-source.json')
    assert [rig['width'],rig['height']]==[939,1136] and len(rig['files'])==22
    for fn,record in [*meta.items(),*((x['file'],x) for x in rig['files'])]:
        assert info(assets/fn)['sha256']==record['sha256'],fn
    bongo_check={x['file']:x['sha256'] for x in bongo['files']}
    for fn in ('menu-before.png','menu-pilau.png','pilau-result.png'):
        assert meta['bongo-'+fn]['sha256']==bongo_check[fn]
    aud_check={x['file']:x['sha256'] for x in aud['assets']}
    for fn in ('name.png','specs.png'):assert meta['audenic-'+fn]['sha256']==aud_check[fn]
    assert bongo['before']==11 and bongo['visibleMenu']==['Pilau ya Kuku'] and aud['scrollBefore']<aud['scrollAfter']
    return {'asset_hashes':len(meta)+len(rig['files']),'bongo_ref':bongo['sourceRef'],'audenic_ref':aud['ref']}


def verify_audio(ff,out,edition,locale):
    a=out/'audio';d=load(a/'timeline.json');lip=load(a/'mouth-timeline.json');effects=load(a/'sfx-cues.json')
    assert (d['frames'],d['fps'],d.get('locale','sw'))==(FRAMES,FPS,locale)
    shots,cap=d['shots'],d['captions'];assert [s['start'] for s in shots]+[shots[-1]['end']]==CUTS and [s['end'] for s in shots]==CUTS[1:]
    cues=load(HERE/edition['cues']);assert len(cap)==sum(len(s['parts']) for s in cues)
    assert all(x['start']<x['end']<=y['start'] for x,y in zip(cap,cap[1:])) and cap[-1]['end']<FRAMES
    for lang,name in edition['sidecars'].items():
        assert all(1<=len(c[lang])<=2 and max(map(len,c[lang]))<=43 for c in cap)
        assert (a/name).read_text().strip()=='\n\n'.join(f'{i}\n{stamp(c["start"])} --> {stamp(c["end"])}\n'+'\n'.join(c[lang]) for i,c in enumerate(cap,1))
    vo,fx,mix=(pcm(a/name) for name in STEMS)
    assert np.array_equal(vo.astype(np.int32)+fx,mix) and len(effects['events'])==16
    meter={x:measure(ff,a/x) for x in STEMS}
    assert -16.6<=meter[STEMS[0]]['lufs']<=-15.4 and meter[STEMS[1]]['dbtp']<=-25 and meter[STEMS[2]]['dbtp']<=-1.5
    frames=lip['frames'];assert lip['fps']==FPS and len(frames)==FRAMES and set(frames)<=set('ABCDEFGHX')
    assert lip['source_sha256']==info(a/STEMS[0])['sha256']
    for s in shots:
        speaks=s['shot'] in ['link','own','close'];r=frames[s['start']:s['end']]
        if not speaks:assert set(r)=={'X'};continue
        assert len(set(r))>=5 and all(k=='X' for k in frames[s['start']:s['voiceStart']]+frames[s['voiceEnd']:s['end']])
    assert set(frames[2550:])=={'X'} and np.max(np.abs(vo[2550*RATE//FPS:]))<4
    return {'stems':meter,'sfx_events':16,'captions_per_language':len(cap),'poses':lip['counts']},d,lip,mix


def read_frames(ff,file,numbers):
    ns=sorted(set(numbers));expr='+'.join(f'eq(n,{i})' for i in ns)
    data=run(ff,'-nostdin','-v','error','-xerror','-i',file,'-an','-vf',f"select='{expr}'",'-fps_mode','passthrough',
             '-frames:v',len(ns),'-pix_fmt','rgb24','-threads:v',1,'-f','rawvideo','-').stdout
    assert len(data)==len(ns)*WIDTH*HEIGHT*3
    raw=np.frombuffer(data,dtype=np.uint8).reshape(len(ns),HEIGHT,WIDTH,3)
    return dict(zip(ns,raw))


def check_picture(ff,out,tl,lip,edition,locale):
    qa=out/'qa';frame=load(qa/'still-receipt.json')['vowel'];parts=load(qa/'picture-cut.json');layout=load(HERE/'layout.json')
    if locale=='en':layout.update(layout['english'])
    assert parts['signature']==load(qa/'still-receipt.json')['signature']
    preview,master,cover=(out/edition[key] for key in ('preview','master','cover'))
    sync=qa/'picture-synced.mp4';assert info(sync)['sha256']==parts['sync'] and info(master)['sha256']==parts['master']
    assert Image.open(cover).size==(WIDTH,HEIGHT) and info(cover)['sha256']==load(qa/'still-receipt.json')['cover']
    ns=[(c['start']+c['end'])//2 for c in tl['captions']];sub=read_frames(ff,preview,ns);plain=read_frames(ff,sync,ns)
    bboxes=[]
    for n in ns:
        band=slice(1296,1449)
        d=np.max(np.abs(sub[n][band].astype(np.int16)-plain[n][band]),axis=2)
        y,x=np.where(d>35);assert len(x)>1600,(n,len(x));bounds=[int(x.min()),int(y.min()+1296),int(x.max()),int(y.max()+1296)]
        assert bounds[0]>=70 and bounds[2]<=865 and bounds[1]>=1306 and bounds[3]<=1433,(n,bounds)
        bboxes.append(bounds)
    del plain,sub
    seq=lip['frames']
    def active(start,end):
        return next(n for n in range(start+17,end-6) if seq[n] in 'CE' and seq[n-1]==seq[n]==seq[n+1])
    rects={frame:(690,979,902,1110),active(708,1176):(727,946,927,1080),active(2256,2500):(701,994,925,1139),2640:(701,994,925,1139)}
    poses=read_frames(ff,preview,list(rects));neutral=read_frames(ff,master,list(rects));counts=[]
    for n,(x,y,r,b) in rects.items():
        rgb=poses[n][y:b,x:r];un=neutral[n][y:b,x:r]
        changes=int((np.max(np.abs(rgb.astype(np.int16)-un),axis=2)>25).sum())
        assert (changes>70 if n!=2640 else changes<35),(n,seq[n],changes)
        counts.append(dict(frame=n,viseme=seq[n],changed_pixels=changes,compared_rect=[x,y,r,b]))
    # Compare several actual encoded mouth positions, not only a Photoshop still.
    clip=[frame-12,frame-7,frame,frame+6,frame+14,frame+22]
    mouth=read_frames(ff,preview,clip)
    strip=Image.new('RGB',(212*len(clip),164),'#2b1e42');d=ImageDraw.Draw(strip)
    for i,n in enumerate(clip):
        strip.paste(Image.fromarray(mouth[n][979:1110,690:902]),(i*212,0));d.text((i*212+9,138),f'{n/FPS:.2f}s / {seq[n]}',fill='white')
    strip.save(qa/'Encoded-Viseme-Review.jpg',quality=93)
    r=layout['review']
    focus={'typing':r['type'],'waiting':134,'result':r['searchResult'],'click':r['click'],'page':r['open'],
           'promise':r['link'],'own':r['own'],'bongo':r['bongo'],'audenic':r['audenic'],'offer':r['offer'],'WEB':2400,'rest':r['hold']}
    cols,w,h=4,270,480;cut=read_frames(ff,preview,list(focus.values()));sheet=Image.new('RGB',(cols*w,3*(h+22)),'#2b1e42');d=ImageDraw.Draw(sheet)
    for i,(key,n) in enumerate(focus.items()):
        x=i%cols*w;y=i//cols*(h+22);phone=Image.fromarray(cut[n]).resize((w,h),Image.Resampling.LANCZOS)
        sheet.paste(phone,(x,y));d.text((x+8,y+h+3),f'{n/FPS:05.2f}s - {key}',fill='#fff5e3')
        if key in ('click','promise','own','WEB'):phone.save(qa/f'Encoded-{key}.png')
    sheet.save(qa/'Encoded-Phone-Review.jpg',quality=94)
    return {'caption_bounds':bboxes,'decoded_mouth_comparisons':counts,'labels_only':parts['labelsOnly'],'locale':locale,'cover':info(cover)}


def verify_pdf(out,edition,locale):
    path=out/'audience'/edition['pdf'];p=PdfReader(path)
    assert len(p.pages)==2 and all(418<=float(s.mediabox.width)<=421 and 594<=float(s.mediabox.height)<=596 for s in p.pages)
    text='\n'.join(s.extract_text() for s in p.pages)
    words=['Services and prices','What this check tells you'] if locale=='en' else ['Huduma na bei','Hakuna guarantee.']
    assert all(x in text for x in ['WEB / CHECKLIST','WhatsApp','URL Inspection','noindex',*words])
    links={a.get_object()['/A']['/URI'] for s in p.pages for a in s.get('/Annots',[]) if a.get_object().get('/A',{}).get('/URI')}
    assert links=={'https://support.google.com/webmasters/answer/9012289','https://developers.google.com/search/docs/appearance/ai-features'}
    fit=load(out/'qa/web-guide-fit.json');assert len(fit)==2 and all(s['reserve']>=12 and s['overflow']<=1 for s in fit)
    return dict(**info(path),pages=2,format='A5',fit=fit,links=sorted(links))


def zip_files(path,entries,readme=None):
    assert path not in entries.values()
    with ZipFile(path,'w',ZIP_DEFLATED,compresslevel=6) as z:
        for name,src in sorted(entries.items()):z.write(src,name)
        if readme:z.writestr('00-START-HERE.txt',readme)
    with ZipFile(path) as z:
        assert z.testzip() is None and set(z.namelist())==set(entries)|({'00-START-HERE.txt'} if readme else set())
        for name,src in entries.items():assert sha256(z.read(name)).hexdigest()==info(src)['sha256']
        print(f'{path.name}: {len(z.namelist())} verified entries, {path.stat().st_size:,} bytes',flush=True)


def pack(out,dest,labels_only,edition,locale):
    q=out/'qa';a=out/'audio';dest.mkdir(parents=True,exist_ok=True)
    preview,master,cover,guide=(edition[k] for k in ('preview','master','cover','pdf'))
    guide_path=out/'audience'/guide;sidecars=list(edition['sidecars'].values());pilot='14-website-era-en' if locale=='en' else '14-website-era'
    editorial=[f'{pilot}{x}' for x in ('.md','-caption.txt','-dm.md')]
    files=[out/n for n in (preview,master,cover)]+[guide_path,*(CONTENT/n for n in editorial)]
    for f in files:shutil.copy2(f,dest/f.name)
    s_entries={str(f.relative_to(SKILL.parent)):f for f in [SKILL/'SKILL.md',*sorted((SKILL/'examples').glob('*.json')),*sorted((SKILL/'scripts').glob('*.mjs'))]}
    skill=dest/'Altraware-Search-Reels-Skill.zip';zip_files(skill,s_entries,'''ALTRAWARE SEARCH REELS · portable skill
Extract the altraware-search-reels directory to your agent's skills location.
Start with SKILL.md. Run scripts/check-opening.mjs and scripts/preview-opening.mjs using Node 18+.
Includes no logo, customer input, reference clip, artwork or voice asset.
''')
    entry={f'01-Review/{name}':out/name for name in (preview,cover)}
    entry.update({f'01-Review/{name}':CONTENT/name for name in editorial})
    entry.update({f'02-Record/{name}':a/name for name in [CUES,*sidecars,'SFX-Only.wav']});entry[f'02-Record/{master}']=out/master
    entry[f'03-Audience/{guide}']=guide_path
    entry[f'05-Agent-Handoff/{skill.name}']=skill;entry['05-Agent-Handoff/Quick-Tricks.md']=ROOT/'content/quick-tricks-series.md'
    entry['04-Rebuild/content/assets/altraware-mark.png']=ROOT/'content/assets/altraware-mark.png'
    entry.update({f'04-Rebuild/content/pilots/{n}':CONTENT/n for n in {*editorial,'14-website-era.md'}})
    entry['04-Rebuild/content/quick-tricks-series.md']=ROOT/'content/quick-tricks-series.md'
    entry.update({f'04-Rebuild/production/website-era/{f.name}':f for f in HERE.iterdir() if f.is_file() and f.suffix in {'.mjs','.json','.py','.md','.tsx','.ts','.css'}})
    entry.update({f'04-Rebuild/.agents/skills/{key}':val for key,val in s_entries.items()})
    base=f'04-Rebuild/out/{edition["slug"]}'
    entry.update({f'{base}/audio/{name}':a/name for name in [*sidecars,CUES,*STEMS,'mouth-timeline.json','sfx-cues.json','timeline.json']})
    entry.update({f'{base}/assets/{name}':out/'assets'/name for name in [*load(q/'capture-assets.json'),*(f['file'] for f in load(q/'host-rig.json')['files'])]})
    entry.update({f'{base}/qa/{name}':q/name for name in ('host-rig.json','capture-assets.json','bongo-source.json','audenic-source.json')})
    entry.update({f'06-Checks/{name}':q/name for name in ('export-checks.json','Encoded-Phone-Review.jpg','Encoded-Viseme-Review.jpg','web-guide-fit.json')})
    marked='This version identifies ChatGPT and Gemini in text only.' if labels_only else 'The review has candidate AI marks. Clear promotional usage or render the names-only version before posting.'
    version='ENGLISH' if locale=='en' else 'SWANGLISH'
    zip_files(dest/edition['kit'],entry,f'''ALTRAWARE · BUSINESS STORY 02 · {version} PRIVATE OWNER KIT

01-Review: 45s scratch Reel, cover, breakdown, post/DM copy. {marked}
02-Record: import the silent VO Master at 0:00, add SFX-Only once and record to the six-beat guide. Retime the captions. The master has a resting mouth; re-render against your own dry take to sync lips. Do not reuse the scratch lip timing as if it were an exact match to your new read.
03-Audience: send only the WEB PDF when the resource destination is approved and tested. Keep this ZIP private.
04-Rebuild: source with keyed art, checked UI crops, dry scratch mix/stems and timings. Start from production/website-era/README.md in that tree.
05-Agent-Handoff: portable skill and Quick Tricks backlog, starting with restoring a closed Chrome tab.
06-Checks: decoded CFR/audio, caption positions, measured levels, mouth differences and print fit.

Release gates: Play on a phone with and without audio; check names, framing and subtitle sync. Verify mark clearance or use names-only; approve WEB and verify correct in-app delivery. No posting, schedule, deployment or permission changes performed.
''')


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('out',type=Path);p.add_argument('private',type=Path)
    p.add_argument('--ffmpeg',default='ffmpeg');p.add_argument('--ffprobe',default='ffprobe')
    p.add_argument('--locale',choices=['sw','en'],default='sw');a=p.parse_args();out=a.out
    edition=load(HERE/'editions.json')[a.locale]
    src=verify_sources(out);audio,tl,lip,mix=verify_audio(a.ffmpeg,out,edition,a.locale);pdf=verify_pdf(out,edition,a.locale)
    video={f:verify_video(a.ffmpeg,a.ffprobe,out/f,m) for f,m in [(edition['preview'],mix),(edition['master'],None)]}
    pictures=check_picture(a.ffmpeg,out,tl,lip,edition,a.locale)
    report=dict(timing={'shot_boundaries':CUTS,'exact_seconds':SEC},proof=src,video=video,pictures=pictures,audio=audio,guide=pdf,
                owner_checks_remaining=['phone listen/watch','trademark approval or names-only cut','in-Instagram WEB delivery'])
    (out/'qa/export-checks.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    pack(out,a.private,pictures['labels_only'],edition,a.locale)


if __name__=='__main__':main()
