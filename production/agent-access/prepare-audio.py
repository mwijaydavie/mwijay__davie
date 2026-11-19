"""Assemble the five Kiswahili clips into 1,800 frames at a calm pace; generate aligned SRTs."""
import argparse
from array import array
import json
from math import ceil, sin, pi, exp
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import wave

FPS, RATE, FRAMES = 60, 48000, 1800
SAMPLES = RATE // FPS
LEAD = (7, 9, 8, 10, 11)
MIN_TAIL = (21, 21, 23, 28, 84)
WEIGHT = (15, 19, 14, 14, 38)


def pcm(path):
    with wave.open(str(path), 'rb') as f:
        if (f.getnchannels(), f.getsampwidth()) != (1, 2):
            raise ValueError(f'{path}: expected mono 16-bit PCM')
        return f.getframerate(), array('h', f.readframes(f.getnframes()))


def write(path, rate, samples):
    with wave.open(str(path), 'wb') as f:
        f.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
        f.writeframes(samples.tobytes())


def trim(rate, samples):
    step = rate // 50
    active = []
    for off in range(0, len(samples), step):
        view = samples[off:off + step]
        if sum(n*n for n in view) > len(view)*142**2:
            active.append(off)
    if not active:
        raise ValueError('A narration clip is silent.')
    return samples[max(0, active[0] - rate//20):active[-1] + step + rate//12]


def stamp(frame):
    s, ms = divmod(round(frame*1000/FPS), 1000)
    return f'{s//3600:02}:{s//60%60:02}:{s%60:02},{ms:03}'


def foley(track, frame, base, intensity, length):
    # Quiet hand-made earcons. A 15ms fade stops clicks on entry.
    start = frame * SAMPLES
    for i in range(min(round(RATE*length), len(track)-start)):
        t = i/RATE
        env = min(1, t/.015) * exp(-5*t/length)
        note = .68*sin(2*pi*(base*t-65*t*t))+.32*sin(2*pi*base*1.704*t)
        track[start+i] = max(-32768,min(32767,track[start+i] + round(intensity*env*note)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('clips', type=Path)
    parser.add_argument('out', type=Path)
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--tempo', default=.94, type=float)
    args = parser.parse_args()
    if not 0.86 <= args.tempo <= 1:
        parser.error('Keep the voice at or below original speech rate.')
    source = json.loads(Path(__file__).with_name('voice-cues.json').read_text(encoding='utf-8'))
    assert len(source) == 5
    assert all(1 <= len(c[lang]) <= 2 and all(0 < len(s) <= 43 for s in c[lang])
               for c in source for lang in ('sw','en'))
    args.out.mkdir(parents=True, exist_ok=True)

    def apply(src, filt, dst):
        subprocess.run([args.ffmpeg, '-nostdin','-v','error','-y','-i',str(src),'-af',filt,
                        '-ar',str(RATE),'-ac','1','-c:a','pcm_s16le',str(dst)], check=True)

    cues = []
    with TemporaryDirectory() as d:
        a,b = Path(d)/'pre.wav',Path(d)/'post.wav'
        clips = []
        for i in range(1,6):
            rate,raw = pcm(args.clips / f'{i:02d}.wav')
            write(a,rate,trim(rate,raw))
            apply(a,f'atempo={args.tempo}',b)
            rate,speech = pcm(b)
            assert rate == RATE
            clips.append(speech)
        speech_length = [ceil(len(c)/SAMPLES) for c in clips]
        extra = FRAMES - sum(speech_length) - sum(LEAD) - sum(MIN_TAIL)
        if extra < 0:
            parser.error(f'The narration needs {-extra/FPS:.2f}s more. Shorten a line instead of accelerating the voice.')
        spread = [extra*w//100 for w in WEIGHT]
        spread[-1] += extra - sum(spread)
        mix = array('h',[0]) * (FRAMES*SAMPLES)
        pos = 0
        for i,(text,speech) in enumerate(zip(source,clips)):
            start=pos+LEAD[i]; end=start+speech_length[i]
            stop=end+MIN_TAIL[i]+spread[i]
            dest=start*SAMPLES
            mix[dest:dest+len(speech)]=speech
            cues.append(dict(text, sceneStart=pos, start=start, end=end,
                             captionEnd=end+min(28,stop-end-5), sceneEnd=stop))
            pos=stop
        assert pos==FRAMES
        for c,(off,hz,lev,dur) in zip(cues,((36,228,930,.27),(68,378,870,.22),(114,544,1380,.26),
                                         (130,157,1650,.24),(93,312,1040,.22))):
            foley(mix,c['sceneStart']+off,hz,lev,dur)
        write(a,RATE,mix)
        apply(a,'loudnorm=I=-16:LRA=8:TP=-1.5',args.out/'mix.wav')
    rate,render=pcm(args.out/'mix.wav')
    assert rate==RATE and len(render)==FRAMES*SAMPLES
    (args.out/'props.json').write_text(json.dumps({'cues':cues,'durationInFrames':FRAMES},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    for lang,label in [('sw','Kiswahili'),('en','English')]:
        out='\n\n'.join(f'{i}\n{stamp(c["start"])} --> {stamp(c["captionEnd"])}\n'+'\n'.join(c[lang])
                        for i,c in enumerate(cues,1))
        (args.out/f'Subtitles-AI-Isome-Stoo-{label}.srt').write_text(out+'\n',encoding='utf-8')
    print(f'{FRAMES} frames · {FRAMES/FPS:.3f}s · {args.tempo:.2f}×')
    for c in cues:
        print(c['scene'],f'scene {c["sceneStart"]}–{c["sceneEnd"]}, voice {c["start"]}–{c["end"]}; subtitle to {c["captionEnd"]}')


if __name__=='__main__':
    main()
