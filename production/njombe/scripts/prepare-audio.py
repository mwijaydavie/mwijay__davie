"""Assemble the approved numbered TTS clips; write frame-aligned props and SRT."""
import argparse
import array
import json
import math
from pathlib import Path
import subprocess
import tempfile
import wave

ROOT = Path(__file__).resolve().parents[1]
FPS = 60
SR = 48_000
SAMPLES_PER_FRAME = SR // FPS


def read_wave(path):
    with wave.open(str(path), 'rb') as handle:
        if handle.getsampwidth() != 2 or handle.getnchannels() != 1:
            raise ValueError(f'{path}: expected a mono 16-bit WAV')
        return handle.getframerate(), array.array('h', handle.readframes(handle.getnframes()))


def write_wave(path, rate, samples):
    with wave.open(str(path), 'wb') as handle:
        handle.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
        handle.writeframes(samples.tobytes())


def trim_silence(rate, samples):
    step = rate // 50
    active = []
    for index in range(0, len(samples), step):
        window = samples[index:index + step]
        rms = math.sqrt(sum(sample * sample for sample in window) / len(window))
        if rms >= 145:
            active.append(index)
    if not active:
        raise ValueError('No speech detected')
    start = max(0, active[0] - rate // 25)
    end = min(len(samples), active[-1] + step + rate // 12)
    return samples[start:end]


def timestamp(frame):
    millis = round(frame * 1000 / FPS)
    seconds, millis = divmod(millis, 1000)
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f'{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}'


def tick_effect(mix, frame, frequency):
    """Small original UI accent, far below the narration."""
    offset = frame * SAMPLES_PER_FRAME
    for i in range(min(int(0.16 * SR), len(mix) - offset)):
        t = i / SR
        edge = min(1, t * 400, (0.16 - t) * 75)
        tone = 650 * edge * math.exp(-23 * t) * math.sin(2 * math.pi * (frequency * t - 280 * t * t))
        mix[offset + i] = max(-32768, min(32767, round(mix[offset + i] + tone)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('clips_dir', type=Path)
    parser.add_argument('out_dir', type=Path)
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--tempo', type=float, default=1.16)
    args = parser.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    script = json.loads((ROOT / 'voice-cues.json').read_text())
    cues = []
    mix = array.array('h', [0]) * (10 * SAMPLES_PER_FRAME)
    with tempfile.TemporaryDirectory() as temp:
        temp = Path(temp)
        for index, beat in enumerate(script, 1):
            rate, original = read_wave(args.clips_dir / f'{index:02d}.wav')
            trimmed = temp / 'trimmed.wav'
            processed = temp / 'processed.wav'
            write_wave(trimmed, rate, trim_silence(rate, original))
            subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(trimmed),
                            '-af', f'atempo={args.tempo},aresample={SR}', '-ar', str(SR), str(processed)], check=True)
            rate, clip = read_wave(processed)
            assert rate == SR
            start = len(mix) // SAMPLES_PER_FRAME
            end = start + math.ceil(len(clip) / SAMPLES_PER_FRAME)
            cues.append(dict(beat, start=start, end=end))
            mix.extend(clip)
            # Align the next cue to a whole frame after a short breath.
            gap = 12 if index in {1, 3, 6, 8} else 7
            mix.extend(array.array('h', [0]) * ((end + gap) * SAMPLES_PER_FRAME - len(mix)))
        # One readable final hold. The last cue stays on for that hold in the visual composition.
        mix.extend(array.array('h', [0]) * (38 * SAMPLES_PER_FRAME))
        for cue, freq in zip((cues[i] for i in (3, 4, 6, 8)), (480, 670, 545, 780)):
            tick_effect(mix, cue['start'] - 4, freq)
        duration = len(mix) // SAMPLES_PER_FRAME
        raw = temp / 'mix.wav'
        write_wave(raw, SR, mix)
        subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(raw),
                        '-af', 'loudnorm=I=-16:LRA=9:TP=-1.5', '-ar', str(SR),
                        str(args.out_dir / 'narration.wav')], check=True)
    props = {'cues': cues, 'durationInFrames': duration, 'audio': True}
    (args.out_dir / 'props.json').write_text(json.dumps(props, ensure_ascii=False, indent=2) + '\n')
    english = json.loads((ROOT / 'english-cues.json').read_text(encoding='utf-8'))
    if set(english) != {c['shot'] for c in cues}:
        raise ValueError('The English translation must cover every cue.')
    for language in ('Kiswahili', 'English'):
        blocks = []
        for i, c in enumerate(cues, 1):
            lines = c['lines'] if language == 'Kiswahili' else english[c['shot']]
            end = c['end'] if i < len(cues) else duration
            blocks.append(f'{i}\n{timestamp(c["start"])} --> {timestamp(end)}\n' + '\n'.join(lines))
        (args.out_dir / f'Subtitles-{language}.srt').write_text('\n\n'.join(blocks) + '\n', encoding='utf-8')
    print(f'{duration} frames / {duration / FPS:.2f}s; {len(cues)} synchronized voice cues')
    for cue in cues:
        print(cue['shot'], cue['start'], cue['end'], f'{(cue["end"]-cue["start"])/FPS:.2f}s')


if __name__ == '__main__':
    main()
