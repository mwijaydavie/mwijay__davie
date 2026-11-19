"""Decode both Business Story exports, check the worksheet/captions, and package the private owner files."""
import argparse
from fractions import Fraction
from hashlib import sha256
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

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
WIDTH, HEIGHT, FPS, SEC, RATE = 1080, 1920, 60, 39, 48000
FRAMES, SAMPLES = SEC * FPS, SEC * RATE
REEL = 'Free-Delivery-Angalia-Total-Reel.mp4'
MASTER = 'Free-Delivery-Silent-Master.mp4'
COVER = 'Free-Delivery-Cover.png'
PDF = 'TOTAL-Checkout-Worksheet.pdf'
STEMS = ['reference.wav', 'SFX-Only.wav', 'Voice-and-SFX.wav']
SRT = {'sw': 'Free-Delivery-Swanglish.srt', 'en': 'Free-Delivery-English.srt'}


def run(*args):
    return subprocess.run(list(map(str, args)), check=True, capture_output=True)


def data(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(path):
    return sha256(path.read_bytes()).hexdigest()


def clock(f):
    ms = round(f * 1000 / FPS)
    return f'00:00:{ms//1000:02},{ms%1000:03}'


def wave_data(path):
    with wave.open(str(path), 'rb') as w:
        assert w.getparams()[:4] == (1, 2, RATE, SAMPLES)
        return np.frombuffer(w.readframes(w.getnframes()), dtype='<i2')


def levels(ff, path):
    report = run(ff, '-nostdin', '-hide_banner', '-xerror', '-i', path, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-').stderr.decode().rsplit('Summary:', 1)[-1]
    return {k: float(re.search(p, report)[1]) for k, p in dict(lufs=r'\bI:\s+(-?\d+\.\d+) LUFS', lra=r'\bLRA:\s+(\d+\.\d+) LU', dbtp=r'\bPeak:\s+(-?\d+\.\d+) dBFS').items()}


def video(ff, probe, path, expected_audio=None):
    streams = data_from_probe(probe, '-show_format', '-show_streams', path)
    assert [s['codec_type'] for s in streams['streams']] == (['video'] if expected_audio is None else ['video', 'audio'])
    v = streams['streams'][0]
    assert (v['codec_name'], v['pix_fmt'], v['width'], v['height'], v['avg_frame_rate'], v['r_frame_rate']) == ('h264', 'yuv420p', WIDTH, HEIGHT, '60/1', '60/1')
    assert Fraction(v['duration']) == Fraction(streams['format']['duration']) == SEC
    pts = data_from_probe(probe, '-threads', '2', '-select_streams', 'v:0', '-show_frames', '-show_entries', 'frame=best_effort_timestamp', path)['frames']
    scale = Fraction(1, FPS) / Fraction(v['time_base'])
    assert len(pts) == FRAMES and all(int(x['best_effort_timestamp']) == i * scale for i, x in enumerate(pts))
    # Full decode with errors fatal; tiny luma raster catches black or blank transitions.
    raster = run(ff, '-nostdin', '-v', 'error', '-xerror', '-threads', '2', '-i', path, '-an', '-vf', 'scale=48:86,format=gray', '-threads:v', '1', '-f', 'rawvideo', '-').stdout
    assert len(raster) == FRAMES * 48 * 86
    span = int(np.ptp(np.frombuffer(raster, dtype=np.uint8).reshape(FRAMES, -1), axis=1).min())
    assert span >= 50
    meta = dict(frames=FRAMES, duration=SEC, fps=FPS, picture=[WIDTH, HEIGHT], video='h264/yuv420p', cfr_pts=True, min_luma_span=span, sha256=sha(path), audio=None)
    if expected_audio is not None:
        a = streams['streams'][1]
        assert (a['codec_name'], int(a['sample_rate']), a['channels']) == ('aac', RATE, 1)
        assert Fraction(a['time_base']) * int(a['duration_ts']) == SEC
        pcm = np.frombuffer(run(ff, '-nostdin', '-v', 'error', '-xerror', '-i', path, '-vn', '-f', 's16le', '-').stdout, dtype='<i2')
        assert SAMPLES <= len(pcm) <= SAMPLES + 1024
        corr = float(np.corrcoef(pcm[:SAMPLES], expected_audio)[0, 1]); meter = levels(ff, path)
        assert corr > .98 and -17.3 <= meter['lufs'] <= -14.7 and meter['dbtp'] <= -1.0, (corr, meter)
        meta['audio'] = dict(codec='aac', rate=RATE, channels=1, same_time_correlation=round(corr, 5), **meter)
    print(f'{path.name}: {FRAMES} decoded frames at {FPS} CFR · {SEC}s · {meta["audio"] or "silent"}', flush=True)
    return meta


def data_from_probe(probe, *args):
    return json.loads(run(probe, '-v', 'error', '-of', 'json', *args).stdout)


def sampled(ff, path, frames):
    ns = sorted(set(frames)); filt = '+'.join(f'eq(n,{f})' for f in ns)
    raw = run(ff, '-nostdin', '-v', 'error', '-xerror', '-threads', '2', '-i', path, '-an', '-vf', f"select='{filt}'", '-fps_mode', 'passthrough',
              '-frames:v', len(ns), '-pix_fmt', 'rgb24', '-threads:v', '1', '-f', 'rawvideo', '-').stdout
    assert len(raw) == len(ns) * HEIGHT * WIDTH * 3
    return dict(zip(ns, np.frombuffer(raw, dtype=np.uint8).reshape(len(ns), HEIGHT, WIDTH, 3)))


def verify_picture(ff, out, tl, seq):
    q = out/'qa'; sync = q/'picture-synced.mp4'; ref = data(q/'picture-cut.json'); still = data(q/'still-receipt.json')
    assert ref['signature'] == still['signature'] and ref['sync'] == sha(sync) and ref['master'] == sha(out/MASTER)
    with Image.open(out/COVER) as cover:
        assert cover.size == (WIDTH, HEIGHT) and sha(out/COVER) == still['cover']
    cap_frames = [(c['start'] + c['end'])//2 for c in tl['captions']]
    active = lambda begin, end: next(i for i in range(begin, end) if seq[i] in 'CEFG' and seq[i-1] == seq[i] == seq[i+1])
    hook = active(43, 325); close = active(1990, 2209); rest = 2290
    rects = {hook: (750, 912, 929, 1034), close: (765, 974, 939, 1080), rest: (765, 974, 939, 1080)}
    review_points = data(HERE/'layout.json')['review']
    boundary = [s['start'] for s in tl['shots']]
    pic = sampled(ff, out/REEL, [*cap_frames, *review_points.values(), *rects, *boundary])
    plain = sampled(ff, sync, cap_frames); subs = []
    for f in cap_frames:
        y0 = 1276
        change = np.max(np.abs(pic[f][y0:1447].astype(np.int16) - plain[f][y0:1447]), axis=2)
        y, x = np.where(change > 36)
        assert len(x) > 1000, (f, len(x))
        box = [int(x.min()), int(y.min()+y0), int(x.max()), int(y.max()+y0)]
        assert box[0] >= 80 and box[2] <= 940 and box[1] >= 1280 and box[3] <= 1420, (f, box)
        subs.append(dict(frame=f, box=box))
    del plain
    neutral = sampled(ff, out/MASTER, rects); deltas = []
    rows = Image.new('RGB', (3*2*190, 144), '#29183c'); d = ImageDraw.Draw(rows)
    for j, (f, (l, t, r, b)) in enumerate(rects.items()):
        a, m = pic[f][t:b, l:r], neutral[f][t:b, l:r]
        pixels = int((np.max(np.abs(a.astype(np.int16)-m), axis=2) > 27).sum())
        assert (pixels > 70 if f != rest else pixels < 45), (f, seq[f], pixels)
        deltas.append(dict(frame=f, viseme=seq[f], changed_pixels=pixels))
        for k, (array, label) in enumerate([(a, 'Review'), (m, 'Master')]):
            x = (j*2+k)*190; rows.paste(Image.fromarray(array), (x+5, 0)); d.text((x+5, 124), f'{f/FPS:.2f}s · {label}', fill='white')
    rows.save(q/'Encoded-Viseme-Review.jpg', quality=94)
    phone = Image.new('RGB',(1080, 1512),'#29183c'); draw=ImageDraw.Draw(phone)
    for j,(key,f) in enumerate(review_points.items()):
        img = Image.fromarray(pic[f]).resize((270, 480), Image.Resampling.LANCZOS)
        x,y = j%4*270,j//4*504; phone.paste(img, (x, y)); draw.text((x+7,y+483),f'{f/FPS:.2f}s / {key}', fill='#fff4eb')
    phone.save(q/'Encoded-Phone-Review.jpg',quality=94)
    return dict(subtitle_boxes=subs, mouth_checks=deltas)


def verify_inputs(ff, out, takes):
    a = out/'audio'; q = out/'qa'; tl = data(a/'timeline.json'); lip = data(a/'mouth-timeline.json'); events = data(a/'sfx-cues.json')['events']
    assert [s['start'] for s in tl['shots']]+[tl['shots'][-1]['end']] == [0, 366, 810, 1332, 1740, 2340]
    assert tl['frames']==FRAMES and tl['fps']==FPS and tl['portraitShots']==['hook','close']
    cap = tl['captions']; assert len(cap)==17 and all(x['start']<x['end']<=y['start'] for x,y in zip(cap,cap[1:]))
    for lang,filename in SRT.items():
        expected='\n\n'.join(f'{i}\n{clock(c["start"])} --> {clock(c["end"])}\n'+'\n'.join(c[lang]) for i,c in enumerate(cap,1))+'\n'
        assert (a/filename).read_text(encoding='utf-8')==expected
    for i,s in enumerate(tl['shots'],1): assert s['take_sha256']==sha(takes/f'{i:02d}.wav')
    vo,fx,mix=(wave_data(a/name) for name in STEMS)
    assert np.array_equal(vo.astype(np.int32)+fx,mix) and len(events)==11
    assert np.max(np.abs(vo[2240*RATE//FPS:]))<4
    vo_m,fx_m,mix_m=(levels(ff,a/f) for f in STEMS)
    assert -16.7 <= vo_m['lufs'] <= -15.3 and fx_m['dbtp'] <= -25 and mix_m['dbtp'] <= -1.4
    seq=lip['frames']; assert lip['fps']==FPS and lip['source_sha256']==sha(a/'reference.wav') and len(seq)==FRAMES and set(seq)<=set('ABCDEFGHX')
    for shot in tl['shots']:
        l,r=shot['start'],shot['end']; assert set(seq[l:shot['voiceStart']]+seq[shot['voiceEnd']:r])=={'X'}
        assert (len(set(seq[l:r]))>=5 if shot['shot'] in tl['portraitShots'] else set(seq[l:r])=={'X'})
    assets=data(q/'assets.json')['sha256']; assert len(assets)==23 and all(d==sha(out/'assets'/f) for f,d in assets.items())
    p=PdfReader(out/'audience'/PDF); assert len(p.pages)==1
    assert 418<=float(p.pages[0].mediabox.width)<=421 and 594<=float(p.pages[0].mediabox.height)<=596
    text=p.pages[0].extract_text(); assert all(x in text for x in ['24,000', '29,000', '30,000', '6,000', '1,000', 'MFANO'])
    fit=data(q/'worksheet-fit.json'); assert fit['room']>=12 and fit['overflow']<=1
    return tl,seq,mix,dict(captions_per_language=len(cap), stem_levels=dict(zip(STEMS,[vo_m,fx_m,mix_m])), foley_events=len(events),
                         verified_art_hashes=len(assets), worksheet=dict(pages=1,size='A5',**fit), visemes=lip['counts'])


def pack(out, dest, takes):
    dest.mkdir(parents=True, exist_ok=True)
    for p in [out/REEL, out/MASTER, out/COVER, out/'audience'/PDF]: shutil.copy2(p,dest/p.name)
    d=out/'audio'; q=out/'qa'; content=ROOT/'content/pilots'; prod='04-Rebuild/production/website-era'; redo='04-Rebuild/out/delivery-story'
    entries={
        f'01-Reel/{REEL}':out/REEL, f'01-Reel/{COVER}':out/COVER,
        f'02-Owner-VO/{MASTER}':out/MASTER, '02-Owner-VO/Record-Your-Voiceover.txt':d/'Record-Your-Voiceover.txt',
        f'03-Audience/{PDF}':out/'audience'/PDF,
        '03-Audience/Caption.txt':content/'15-free-delivery-caption.txt', '03-Audience/Release-Check.md':content/'15-free-delivery.md',
        '05-Checks/Export-Checks.json':q/'export-checks.json',
        '04-Rebuild/content/assets/altraware-mark.png':ROOT/'content/assets/altraware-mark.png',
        **{f'04-Rebuild/content/pilots/{f}':content/f for f in ('15-free-delivery.md','15-free-delivery-caption.txt')},
        **{f'04-Rebuild/{f}':ROOT/f for f in (
            '.agents/skills/altraware-search-reels/scripts/search-opening.mjs',
            '.agents/skills/altraware-search-reels/examples/opening.plan.json')},
        **{f'02-Owner-VO/{f}':d/f for f in [*STEMS,*SRT.values()]},
        **{f'{redo}/audio/{f}':d/f for f in [*STEMS,*SRT.values(),'timeline.json','mouth-timeline.json','sfx-cues.json']},
        **{f'{redo}/assets/{f}':out/'assets'/f for f in data(q/'assets.json')['sha256']},
        **{f'{redo}/qa/{f}':q/f for f in ('assets.json','host-rig.json')},
        **{f'04-Rebuild/inputs/voice/{i:02d}.wav':takes/f'{i:02d}.wav' for i in range(1,6)},
        **{f'{prod}/{f}':HERE.parent/f for f in ('Host.tsx','motion.mjs','motion.test.mjs','visemes.mjs','package.json','package-lock.json')},
        **{f'{prod}/delivery-story/{f}':HERE/f for f in ('README.md','Story.tsx','index.ts','story.css','checkout.mjs',
            'checkout.test.mjs','example.json','layout.json','cues.json','prepare.py','render.mjs','worksheet.mjs','verify.py')},
    }
    note=('BUSINESS STORY 03 — PRIVATE OWNER REVIEW\n\n'
          '01-Reel: Swanglish synthetic VO and original light foley. 39 seconds.\n'
          '02-Owner-VO: silent, uncaptioned picture with resting mouth. Use the cue sheet and SFX-Only.wav for an owner take.\n'
          'The English SRT translates the Swanglish cut; it is not an English dub.\n'
          '03-Audience: only the TOTAL worksheet and caption are audience assets. No link or automation is live.\n'
          '04-Rebuild: see production/website-era/delivery-story/README.md. Private host art and takes are not for release.\n'
          'Both outside video references were study only; no media from them is included.\n')
    zip_path=dest/'Free-Delivery-Owner-Kit.zip'
    with ZipFile(zip_path,'w',ZIP_DEFLATED,compresslevel=5) as z:
        z.writestr('00-START-HERE.txt',note)
        for label,src in sorted(entries.items()): z.write(src,label)
    with ZipFile(zip_path) as z:
        assert z.testzip() is None and set(z.namelist()) == {'00-START-HERE.txt',*entries}
        assert all(sha256(z.read(label)).hexdigest()==sha(src) for label,src in entries.items())
    print(f'{zip_path.name}: {len(entries)+1} verified files · {zip_path.stat().st_size:,} bytes',flush=True)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('out',type=Path);p.add_argument('takes',type=Path);p.add_argument('destination',type=Path)
    p.add_argument('--ffmpeg',default='ffmpeg');p.add_argument('--ffprobe',default='ffprobe');a=p.parse_args()
    tl,seq,mix,checks=verify_inputs(a.ffmpeg,a.out,a.takes)
    checks['reel']=video(a.ffmpeg,a.ffprobe,a.out/REEL,mix)
    checks['master']=video(a.ffmpeg,a.ffprobe,a.out/MASTER)
    checks['picture']=verify_picture(a.ffmpeg,a.out,tl,seq)
    (a.out/'qa/export-checks.json').write_text(json.dumps(checks,indent=2)+'\n')
    pack(a.out,a.destination,a.takes)


if __name__=='__main__': main()
