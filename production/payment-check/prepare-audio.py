"""Build a short, paced 60 fps voice track and matched subtitle files from four mono TTS clips."""
import argparse
from array import array
import json
from math import ceil
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import wave

FPS, RATE = 60, 48000
SAMPLES = RATE // FPS
HOLDS = [24, 28, 29, 56]


def pcm(path):
    with wave.open(str(path), 'rb') as f:
        if (f.getnchannels(), f.getsampwidth()) != (1, 2):
            raise ValueError(f'{path}: expected mono 16-bit PCM')
        return f.getframerate(), array('h', f.readframes(f.getnframes()))


def save(path, rate, samples):
    with wave.open(str(path), 'wb') as f:
        f.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
        f.writeframes(samples.tobytes())


def trim(rate, samples):
    step = rate // 50
    audible = []
    for off in range(0, len(samples), step):
        win = samples[off:off + step]
        if sum(s * s for s in win) > len(win) * 142**2:
            audible.append(off)
    if not audible:
        raise ValueError('Silence in source clip')
    return samples[max(0, audible[0] - rate // 24):audible[-1] + step + rate // 14]


def stamp(frame):
    sec, ms = divmod(round(frame * 1000 / FPS), 1000)
    return f'{sec//3600:02}:{sec//60%60:02}:{sec%60:02},{ms:03}'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('clips', type=Path)
    parser.add_argument('out', type=Path)
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--tempo', type=float, default=.92)
    args = parser.parse_args()
    if not .85 <= args.tempo <= 1:
        parser.error('Choose a tempo from .85 to 1. Shorten the script rather than speeding it up.')
    script = json.loads(Path(__file__).with_name('voice-cues.json').read_text(encoding='utf-8'))
    assert len(script) == len(HOLDS)
    for s in script:
        assert all(1 <= len(s[lang]) <= 2 and max(map(len, s[lang])) <= 44 for lang in ('sw', 'en'))
    args.out.mkdir(parents=True, exist_ok=True)
    mix, cues = array('h', [0]) * (7 * SAMPLES), []

    def filter_audio(src, f, dst):
        subprocess.run([args.ffmpeg, '-nostdin', '-v', 'error', '-y', '-i', str(src), '-af', f,
                        '-ar', str(RATE), '-ac', '1', '-c:a', 'pcm_s16le', str(dst)], check=True)

    with TemporaryDirectory() as tmp:
        a, b = Path(tmp) / 'input.wav', Path(tmp) / 'processed.wav'
        for i, (cue, hold) in enumerate(zip(script, HOLDS)):
            rate, samples = pcm(args.clips / f'{i+1:02d}.wav')
            save(a, rate, trim(rate, samples))
            filter_audio(a, f'atempo={args.tempo}', b)
            rate, speech = pcm(b)
            assert rate == RATE
            start = len(mix) // SAMPLES
            end = start + ceil(len(speech) / SAMPLES)
            mix.extend(speech)
            mix.extend(array('h', [0]) * ((end + hold) * SAMPLES - len(mix)))
            cues.append(dict(cue, start=start, end=end, captionEnd=end + hold - (5 if i < len(script) - 1 else 0)))
        frames = len(mix) // SAMPLES
        if not frames < 25 * FPS:
            parser.error(f'{frames / FPS:.3f}s. Rewrite the longest line and regenerate that clip.')
        save(a, RATE, mix)
        filter_audio(a, 'loudnorm=I=-16:LRA=9:TP=-1.5', args.out / 'narration.wav')
    final_rate, final_samples = pcm(args.out / 'narration.wav')
    assert final_rate == RATE and len(final_samples) == frames * SAMPLES
    (args.out / 'props.json').write_text(json.dumps(dict(cues=cues, durationInFrames=frames), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for lang, suffix in [('sw', 'Kiswahili'), ('en', 'English')]:
        blocks = [f'{i}\n{stamp(c["start"])} --> {stamp(c["captionEnd"])}\n'+'\n'.join(c[lang]) for i, c in enumerate(cues, 1)]
        (args.out / f'Subtitles-Payment-Check-{suffix}.srt').write_text('\n\n'.join(blocks) + '\n', encoding='utf-8')
    print(f'{frames} frames, {frames / FPS:.3f}s, voice tempo {args.tempo:.2f}×')
    for c in cues:
        print(f'{c["shot"]:<8} {c["start"]}..{c["end"]} speech; caption to {c["captionEnd"]}')


if __name__ == '__main__':
    main()
