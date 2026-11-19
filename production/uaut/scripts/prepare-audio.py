"""Assemble four approved Kiswahili clips with unhurried holds and matched SW/EN captions."""
import argparse
from array import array
import json
import math
from pathlib import Path
import subprocess
import tempfile
import wave

FPS = 60
RATE = 48_000
SAMPLES = RATE // FPS
ROOT = Path(__file__).resolve().parents[1]
GAPS = (46, 44, 54, 83)


def read_pcm(path):
    with wave.open(str(path), 'rb') as f:
        if (f.getnchannels(), f.getsampwidth()) != (1, 2):
            raise ValueError(f'{path}: expected mono 16-bit PCM WAV')
        return f.getframerate(), array('h', f.readframes(f.getnframes()))


def write_pcm(path, rate, samples):
    with wave.open(str(path), 'wb') as f:
        f.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
        f.writeframes(samples.tobytes())


def trim(rate, samples):
    step = rate // 50
    audible = []
    for off in range(0, len(samples), step):
        window = samples[off:off + step]
        if sum(s * s for s in window) > len(window) * 142**2:
            audible.append(off)
    if not audible:
        raise ValueError('The narration clip is silent.')
    return samples[max(0, audible[0] - rate // 24):audible[-1] + step + rate // 13]


def stamp(frame):
    sec, ms = divmod(round(frame * 1000 / FPS), 1000)
    return f'{sec // 3600:02}:{sec // 60 % 60:02}:{sec % 60:02},{ms:03}'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('clips', type=Path)
    parser.add_argument('out', type=Path)
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--tempo', type=float, default=.92)
    args = parser.parse_args()
    if not .85 <= args.tempo <= 1:
        parser.error('Use .85–1× tempo. Shorten the script instead of rushing it.')
    script = json.loads((ROOT / 'voice-cues.json').read_text(encoding='utf-8'))
    assert [x['shot'] for x in script] == ['fursa', 'lengo', 'hatua', 'live']
    if not all(1 <= len(c[lang]) <= 2 and all(0 < len(line) <= 44 for line in c[lang]) for c in script for lang in ('sw', 'en')):
        parser.error('Keep each subtitle to 1–2 short lines')
    args.out.mkdir(parents=True, exist_ok=True)
    cues = []
    mix = array('h', [0]) * (8 * SAMPLES)

    def ff(src, filter_, dst):
        subprocess.run([args.ffmpeg, '-nostdin', '-hide_banner', '-v', 'error', '-y', '-i', str(src), '-af', filter_,
                        '-ar', str(RATE), '-ac', '1', '-c:a', 'pcm_s16le', str(dst)], check=True)

    with tempfile.TemporaryDirectory() as scratch:
        a, b = Path(scratch) / 'in.wav', Path(scratch) / 'scaled.wav'
        for i, (cue, gap) in enumerate(zip(script, GAPS), 1):
            rate, samples = read_pcm(args.clips / f'{i:02}.wav')
            write_pcm(a, rate, trim(rate, samples))
            ff(a, f'atempo={args.tempo}', b)
            rate, speech = read_pcm(b)
            assert rate == RATE
            start = len(mix) // SAMPLES
            end = start + math.ceil(len(speech) / SAMPLES)
            mix.extend(speech)
            mix.extend(array('h', [0]) * ((end + gap) * SAMPLES - len(mix)))
            cues.append(dict(cue, start=start, end=end, captionEnd=end + gap - (7 if i < len(script) else 0)))
        duration = len(mix) // SAMPLES
        if duration >= 25 * FPS:
            parser.error(f'{duration / FPS:.2f} s; shorten the script and keep the holds')
        assert cues[-1]['captionEnd'] == duration
        assert all(cues[i]['captionEnd'] == c['start'] - 7 for i,c in enumerate(cues[1:]))
        write_pcm(a, RATE, mix)
        ff(a, 'loudnorm=I=-16:LRA=9:TP=-1.5', args.out / 'narration.wav')
    rate, pcm = read_pcm(args.out / 'narration.wav')
    assert rate == RATE and len(pcm) == duration * SAMPLES
    (args.out / 'props.json').write_text(json.dumps({'cues': cues, 'durationInFrames': duration}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for lang, suffix in [('sw','Kiswahili'), ('en','English')]:
        blocks = [f'{i}\n{stamp(c["start"])} --> {stamp(c["captionEnd"])}\n'+'\n'.join(c[lang]) for i,c in enumerate(cues,1)]
        (args.out / f'Subtitles-UAUT-Connect-{suffix}.srt').write_text('\n\n'.join(blocks)+'\n', encoding='utf-8')
    print(f'{duration} frames / {duration/FPS:.3f} s, tempo {args.tempo:.2f}×')
    for c in cues:
        print(f'{c["shot"]:6} {c["start"]:4}..{c["end"]:4} speech; caption to {c["captionEnd"]}')

if __name__ == '__main__':
    main()
