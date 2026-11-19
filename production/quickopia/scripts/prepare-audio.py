"""Assemble one approved Kiswahili clip per shot. Emit seekable props and both SRTs."""
import argparse
import array
import json
import math
from pathlib import Path
import subprocess
import tempfile
import wave

FPS, RATE = 60, 48_000
STEP = RATE // FPS
ROOT = Path(__file__).resolve().parents[1]
VERSIONS = {
    'v1': dict(script='voice-cues.json',
               shots=('hook', 'catalog', 'locale', 'cart', 'gate', 'help', 'cta'),
               tempo=1.14, gaps=(11, 11, 11, 11, 11, 11, 52),
               clicks=(('hook', .18, 620), ('catalog', .44, 690), ('cart', .47, 540), ('gate', .25, 455)),
               srt='Subtitles-Quickopia'),
    'v2': dict(script='voice-cues-v2.json', shots=('hook', 'catalog', 'cart', 'gate', 'cta'),
               tempo=.92, gaps=(37, 62, 47, 42, 78), clicks=(('cart', .45, 540),),
               srt='Subtitles-Quickopia-V2'),
}


def read_pcm(path):
    with wave.open(str(path), 'rb') as w:
        if w.getnchannels() != 1 or w.getsampwidth() != 2:
            raise ValueError(f'{path}: expected mono 16-bit PCM')
        return w.getframerate(), array.array('h', w.readframes(w.getnframes()))


def write_pcm(path, rate, samples):
    with wave.open(str(path), 'wb') as w:
        w.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
        w.writeframes(samples.tobytes())


def trim(rate, samples):
    step = rate // 50
    active = []
    for offset in range(0, len(samples), step):
        window = samples[offset:offset + step]
        if sum(s * s for s in window) / len(window) > 142 ** 2:
            active.append(offset)
    if not active:
        raise ValueError('No audible speech in clip')
    return samples[max(0, active[0] - rate // 24):active[-1] + step + rate // 13]


def stamp(frame):
    sec, ms = divmod(round(frame * 1000 / FPS), 1000)
    return f'{sec // 3600:02d}:{sec // 60 % 60:02d}:{sec % 60:02d},{ms:03d}'


def ui_click(mix, frame, hz):
    """Original quiet, short feedback pulse rather than unlicensed music."""
    for i in range(RATE // 12):
        t = i / RATE
        idx = frame * STEP + i
        env = min(1, t * 520) * math.exp(-53 * t)
        mix[idx] = max(-32768, min(32767, mix[idx] + round(940 * env * math.sin(2 * math.pi * hz * t))))


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('clips', type=Path)
    cli.add_argument('output', type=Path)
    cli.add_argument('--ffmpeg', default='ffmpeg')
    cli.add_argument('--version', choices=tuple(VERSIONS), default='v1')
    cli.add_argument('--tempo', type=float)
    args = cli.parse_args()
    version = VERSIONS[args.version]
    daylight = args.version == 'v2'
    tempo = version['tempo'] if args.tempo is None else args.tempo
    limit = 1.0 if daylight else 1.25
    if not 0.85 <= tempo <= limit:
        cli.error(f'--tempo must be between 0.85 and {limit:g} for {args.version}')

    def ff(infile, *argv):
        subprocess.run([args.ffmpeg, '-nostdin', '-hide_banner', '-loglevel', 'error', '-y',
                        '-i', str(infile), *map(str, argv)], check=True)

    script = json.loads((ROOT / version['script']).read_text(encoding='utf-8'))
    assert tuple(c['shot'] for c in script) == version['shots']
    assert all('QUICKOPIA' in script[-1][lang][0].upper() for lang in ('sw', 'en'))
    assert all(1 <= len(c[lang]) <= 2 and all(0 < len(s) <= 47 for s in c[lang])
               for c in script for lang in ('sw', 'en'))
    args.output.mkdir(parents=True, exist_ok=True)
    mix = array.array('h', [0]) * (8 * STEP)
    cues = []
    with tempfile.TemporaryDirectory() as tmp:
        a, b = Path(tmp) / 'trim.wav', Path(tmp) / 'rate.wav'
        for index, line in enumerate(script, 1):
            rate, clip = read_pcm(args.clips / f'{index:02d}.wav')
            write_pcm(a, rate, trim(rate, clip))
            ff(a, '-af', f'atempo={tempo}', '-ar', RATE, '-ac', 1, '-c:a', 'pcm_s16le', b)
            rate, clip = read_pcm(b)
            assert rate == RATE
            start = len(mix) // STEP
            end = start + math.ceil(len(clip) / STEP)
            cues.append(dict(line, start=start, end=end))
            mix.extend(clip)
            gap = version['gaps'][index - 1]
            mix.extend(array.array('h', [0]) * ((end + gap) * STEP - len(mix)))
        for shot, frac, freq in version['clicks']:
            cue = next(c for c in cues if c['shot'] == shot)
            ui_click(mix, cue['start'] + round((cue['end'] - cue['start']) * frac), freq)
        duration = len(mix) // STEP
        if daylight:
            if duration >= 25 * FPS:
                cli.error(f'{duration / FPS:.2f}s is not under 25s; trim the script, not the pauses')
            # Hold each caption through its reading pause. The next cut leads its voice by 7 frames.
            for i, cue in enumerate(cues):
                cue['captionEnd'] = cues[i + 1]['start'] - 7 if i + 1 < len(cues) else duration
                assert cue['captionEnd'] >= cue['end']
        write_pcm(a, RATE, mix)
        ff(a, '-af', 'loudnorm=I=-16:LRA=9:TP=-1.5', '-ar', RATE, '-ac', 1, args.output / 'narration.wav')
    rate, speech = read_pcm(args.output / 'narration.wav')
    assert rate == RATE and len(speech) == duration * STEP
    (args.output / 'props.json').write_text(json.dumps(dict(cues=cues, durationInFrames=duration), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for lang, label in [('sw', 'Kiswahili'), ('en', 'English')]:
        blocks = []
        for i, c in enumerate(cues, 1):
            end = c.get('captionEnd', duration if i == len(cues) else c['end'])
            text = '\n'.join(c[lang])
            blocks.append(f'{i}\n{stamp(c["start"])} --> {stamp(end)}\n{text}')
        (args.output / f'{version["srt"]}-{label}.srt').write_text('\n\n'.join(blocks) + '\n', encoding='utf-8')
    print(f'{duration} frames @ {FPS}fps; {duration/FPS:.3f} s; {len(cues)} speech cues at {tempo:.2f}× source tempo')
    for cue in cues:
        print(f'{cue["shot"]:8} {cue["start"]:4}..{cue["end"]:4} {((cue["end"]-cue["start"])/FPS):.2f}s')


if __name__ == '__main__':
    main()
