"""Validate encoded Tech Tip deliverables, PDF annotations, and subtitle timing."""
import argparse
from array import array
from fractions import Fraction
from hashlib import sha256, md5
import json
from math import sqrt
from pathlib import Path
import re
import subprocess

from PIL import Image
from pypdf import PdfReader

FPS, FRAME_COUNT, RATE = 60, 1800, 48000
DURATION = FRAME_COUNT // FPS


def run(bin_path, *args):
    return subprocess.run([bin_path, *map(str, args)], capture_output=True, check=True)


def millis(fr):
    return round(fr*1000/FPS)


def srt_time(text):
    h, m, s, ms = map(int, re.split('[:,]', text))
    return ((h*60+m)*60+s)*1000+ms


def check_srt(path, cues, language):
    blocks = path.read_text(encoding='utf-8').strip().split('\n\n')
    assert len(blocks) == len(cues) == 5
    last = 0
    for i, (block, cue) in enumerate(zip(blocks, cues), 1):
        index, time, *text = block.splitlines()
        assert index == str(i) and text == cue[language]
        assert 1 <= len(text) <= 2 and all(0 < len(s) <= 41 for s in text)
        a,b = map(srt_time, time.split(' --> '))
        assert last < a < b <= DURATION*1000
        assert (a,b) == (millis(cue['start']),millis(cue['captionEnd']))
        last = b
    return len(blocks)


def identity(path):
    b = path.read_bytes()
    return {'bytes':len(b),'sha256':sha256(b).hexdigest(),'md5':md5(b).hexdigest()}


def check_pdf(path):
    pdf = PdfReader(path)
    assert not pdf.is_encrypted and len(pdf.pages) == 6
    root = pdf.root_object
    assert root['/Lang'] == 'sw' and root['/MarkInfo']['/Marked']
    assert len(pdf.named_destinations) >= 5
    urls = []
    internal = 0
    for page in pdf.pages:
        assert abs(float(page.mediabox.width)-419.53) < 2 and abs(float(page.mediabox.height)-595.28) < 2
        assert len(page.extract_text()) > 360
        for item in page.get('/Annots') or []:
            ann = item.get_object()
            assert ann['/Subtype'] == '/Link'
            if '/A' in ann:
                a = ann['/A']; assert a['/S'] == '/URI' and a['/URI'].startswith('https://')
                urls.append(str(a['/URI']))
            else:
                assert '/Dest' in ann
                internal += 1
    assert internal == 5 and len(urls)==11 and len(set(urls))==9
    for domain in ('developers.openai.com','platform.claude.com','aistudio.google.com','docs.ollama.com',
                   'modelcontextprotocol.io','faida-hq.vercel.app','altra.tanzaniareach.com'):
        assert any(u.startswith('https://'+domain+'/') for u in urls)
    return {**identity(path),'pages':6,'tagged':True,'language':'sw','internal_links':internal,'unique_https_links':sorted(set(urls))}


def check_video(p, ffmpeg, ffprobe, *, narrated, cues):
    probe=json.loads(run(ffprobe,'-v','error','-show_streams','-show_format','-of','json',p).stdout)
    streams=probe['streams']; assert [s['codec_type'] for s in streams]==(['video','audio'] if narrated else ['video'])
    v=streams[0]
    assert (v['codec_name'],v['width'],v['height'],v['pix_fmt'])==('h264',1080,1920,'yuv420p')
    assert (v['avg_frame_rate'],v['r_frame_rate'])==('60/1','60/1')
    assert Fraction(probe['format']['duration'])==Fraction(v['duration'])==DURATION
    tb=Fraction(v['time_base'])
    frames=json.loads(run(ffprobe,'-v','error','-select_streams','v:0','-show_frames','-show_entries',
                          'frame=best_effort_timestamp','-of','json',p).stdout)['frames']
    assert [int(f['best_effort_timestamp'])*tb for f in frames]==[Fraction(i,FPS) for i in range(FRAME_COUNT)]
    thumbs=run(ffmpeg,'-nostdin','-v','error','-xerror','-i',p,'-map','0:v:0','-vf','scale=54:96','-c:v','rawvideo','-pix_fmt','gray','-f','rawvideo','-').stdout
    tile=54*96
    assert len(thumbs)==tile*FRAME_COUNT
    # No full-field or decode-black frames. Glassy live footage should retain real contrast at phone scale.
    span=min(max(x)-min(x) for x in (thumbs[j:j+tile] for j in range(0,len(thumbs),tile)))
    assert span>=54, span
    checks={**identity(p),'duration_s':DURATION,'frames':len(frames),'fps':FPS,'dimensions':[1080,1920],
            'video':'H.264/yuv420p','min_luma_span':span,'cfr_pts':True,'audio_track':narrated}
    if narrated:
        a=streams[1]
        assert (a['codec_name'],int(a['sample_rate']),a['channels'])==('aac',RATE,1)
        assert Fraction(a['duration'])==30 and int(a['duration_ts'])*Fraction(a['time_base'])==30
        log=run(ffmpeg,'-nostdin','-hide_banner','-xerror','-i',p,'-map','0:a:0','-af','ebur128=peak=true','-f','null','-').stderr.decode()
        summary=log.rsplit('Summary:',1)[-1]
        loud=float(re.search(r'\bI:\s+(-?\d+\.\d+) LUFS',summary)[1]); peak=float(re.search(r'\bPeak:\s+(-?\d+\.\d+) dBFS',summary)[1]);
        assert -18<=loud<=-14 and peak<=-1
        samples=array('h',run(ffmpeg,'-nostdin','-v','error','-xerror','-i',p,'-map','0:a:0','-f','s16le','-').stdout)
        assert len(samples)>=30*RATE
        spf=RATE//FPS
        rms=[sqrt(sum(v*v for v in samples[n:n+spf])/spf) for n in range(0,30*RATE,spf)]
        for c in cues:
            voiced=rms[c['start']:c['end']]
            assert sum(a>450 for a in voiced)>.3*len(voiced), f'Quiet or missing voice: {c["shot"]}'
        assert max(rms[-65:])<35
        checks.update(audio='AAC 48 kHz mono',lufs=loud,true_peak_dbtp=peak)
    return checks


def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument('output',type=Path)
    cli.add_argument('--ffmpeg',default='ffmpeg')
    cli.add_argument('--ffprobe',default='ffprobe')
    args=cli.parse_args(); d=args.output.resolve()
    guide=d/'Mwongozo-Bure-API-na-MCP.pdf'
    ref=d/'Tech-Tip-01-MCP-au-API.mp4'
    clean=d/'Tech-Tip-01-Voiceover-Master.mp4'
    cover=d/'Cover-Tech-Tip-01.png'
    captions=json.loads((d/'audio/timeline.json').read_text(encoding='utf-8'))
    assert captions['frames']==FRAME_COUNT
    cues=captions['cues']
    with Image.open(cover) as img:
        assert img.size==(1080,1920)
        img.verify()
    qa={'guide':check_pdf(guide),'cover':identity(cover),
        'srt':{lang:check_srt(d/'audio'/f'API-MCP-{label}.srt',cues,lang)
               for lang,label in [('sw','Kiswahili'),('en','English')]},
        'reference':check_video(ref,args.ffmpeg,args.ffprobe,narrated=True,cues=cues),
        'voiceover_master':check_video(clean,args.ffmpeg,args.ffprobe,narrated=False,cues=cues)}
    (d/'qa/encoded-checks.json').write_text(json.dumps(qa,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps(qa,indent=2,ensure_ascii=False))


if __name__=='__main__':
    main()
