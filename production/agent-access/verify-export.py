"""Check the finished MP4 and subtitle files, not the timeline in the browser."""
import argparse
from array import array
from fractions import Fraction
from hashlib import sha256
import json
from math import sqrt
from pathlib import Path
import re
import subprocess

FRAMES, FPS, RATE = 1800, 60, 48000
SAMPLES = RATE // FPS


def run(bin_path, *argv):
    return subprocess.run([bin_path, *map(str, argv)], capture_output=True, check=True)


def milliseconds(t):
    h, m, s, ms = [int(k) for k in re.split('[:,]', t)]
    return (h*3600 + m*60 + s)*1000 + ms


def line_check(path, cues, lang):
    blocks = path.read_text(encoding='utf-8').strip().split('\n\n')
    assert len(blocks) == len(cues) == 5
    end_of_last = -1
    for i, (block, cue) in enumerate(zip(blocks, cues), 1):
        index, bounds, *lines = block.splitlines()
        assert index == str(i) and lines == cue[lang] and all(0 < len(s) <= 43 for s in lines) and len(lines) <= 2
        a, b = map(milliseconds, bounds.split(' --> '))
        assert end_of_last < a < b <= 30_000
        assert (a, b) == tuple(round(cue[f] * 1000/FPS) for f in ('start', 'captionEnd'))
        end_of_last = b
    return len(blocks)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('export', type=Path, help='Render root, including the audio and qa subfolders')
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--ffprobe', default='ffprobe')
    args = parser.parse_args()
    p = args.export.resolve()
    film=p/'Reel-AI-Isome-Stoo-Bei-Ibaki-30s.mp4'
    probe=json.loads(run(args.ffprobe, '-v','error','-show_streams','-show_format','-of','json', film).stdout)
    assert len(probe['streams']) == 2
    video=next(s for s in probe['streams'] if s['codec_type']=='video')
    audio=next(s for s in probe['streams'] if s['codec_type']=='audio')
    assert (video['codec_name'],video['pix_fmt'],video['width'],video['height']) == ('h264','yuv420p',1080,1920)
    assert (video['r_frame_rate'],video['avg_frame_rate']) == ('60/1','60/1')
    assert float(probe['format']['duration']) == float(video['duration']) == 30
    assert (audio['codec_name'],int(audio['sample_rate'])) == ('aac',RATE)
    assert abs(float(audio['duration']) - 30) <= 1/FPS
    pts=json.loads(run(args.ffprobe,'-v','error','-select_streams','v:0','-show_frames',
                       '-show_entries','frame=best_effort_timestamp','-of','json',film).stdout)
    stamps=[int(f['best_effort_timestamp'])*Fraction(video['time_base']) for f in pts['frames']]
    assert stamps == [Fraction(i,FPS) for i in range(FRAMES)]
    thumbs=run(args.ffmpeg,'-nostdin','-v','error','-xerror','-i',film,'-map','0:v:0','-vf','scale=54:96',
               '-c:v','rawvideo','-pix_fmt','gray','-f','rawvideo','-').stdout
    tile=54*96
    assert len(thumbs) == tile*FRAMES
    span=min(max(f)-min(f) for f in (thumbs[i:i+tile] for i in range(0,len(thumbs),tile)))
    assert span >= 50, f'A decoded frame looks blank (minimum 8-bit luminance span: {span})'
    measured=run(args.ffmpeg,'-nostdin','-hide_banner','-xerror','-i',film,'-vn','-af','ebur128=peak=true',
                 '-f','null','-').stderr.decode()
    summary=measured.rsplit('Summary:',1)[-1]
    lufs=float(re.search(r'\bI:\s+(-?\d+\.\d+) LUFS',summary)[1])
    dbtp=float(re.search(r'\bPeak:\s+(-?\d+\.\d+) dBFS',summary)[1])
    assert -18 <= lufs <= -14 and dbtp <= -1
    decoded=run(args.ffmpeg,'-nostdin','-v','error','-xerror','-i',film,'-vn','-ar',RATE,'-ac','1',
                '-f','s16le','-').stdout
    samples=array('h',decoded)
    assert len(samples) >= (FRAMES-1)*SAMPLES
    rms=[]
    for n in range(FRAMES-1):
        frame=samples[n*SAMPLES:(n+1)*SAMPLES]
        rms.append(sqrt(sum(k*k for k in frame)/SAMPLES))
    cues=json.loads((p/'audio/props.json').read_text(encoding='utf-8'))['cues']
    assert cues[0]['sceneStart']==0 and cues[-1]['sceneEnd']==FRAMES
    for c in cues:
        voiced=rms[c['start']:c['end']]
        assert sum(v>450 for v in voiced)/len(voiced)>.30, f'No clear spoken audio during {c["scene"]}'
    # The late hold is deliberate, after the last line of speech.
    assert max(rms[-68:]) < 32
    counts={language:line_check(p/'audio'/f'Subtitles-AI-Isome-Stoo-{label}.srt',cues,language)
            for language,label in [('sw','Kiswahili'),('en','English')]}
    output=dict(duration_seconds=30,frame_count=FRAMES,dimensions=[1080,1920],fps=FPS,
                video='H.264/yuv420p',audio='AAC 48 kHz',full_decode_ok=True,cfr_pts_ok=True,
                minimum_frame_luma_span=span,integrated_lufs=lufs,true_peak_db_tp=dbtp,subtitle_cues=counts,
                bytes=film.stat().st_size,sha256=sha256(film.read_bytes()).hexdigest())
    (p/'qa'/'encoded-checks.json').write_text(json.dumps(output,indent=2)+'\n', encoding='utf-8')
    print(json.dumps(output,indent=2))


if __name__ == '__main__':
    main()
