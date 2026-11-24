"""
Noellyne IG/YT intro audio — 14 s, one voice, one bed.

The guide's rule: "audios zimekuwa nyingi ka uchafu". So the whole mix is her
voice, a 62 Hz drone at -26 dB, and four soft cues — one per shot. No risers,
no impacts, no whooshes.
"""
import json, os, subprocess, wave
from pathlib import Path
import numpy as np

RATE = 48000
FPS = 30
HERE = Path(__file__).resolve().parent
FF = os.environ["FFMPEG"]

# say = the clip's own length, hold = the tail in seconds
PLAN = [
    dict(id="hook",    hold=0.26),
    dict(id="name",    hold=0.30),
    dict(id="promise", hold=0.30),
    dict(id="cta",     hold=0.72),
]


def decode(mp3):
    raw = subprocess.run([FF, "-v", "error", "-i", str(mp3), "-f", "f32le",
                          "-ac", "1", "-ar", str(RATE), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def main():
    takes, spans, f = [], [], 8
    for i, p in enumerate(PLAN):
        a = decode(HERE / "audio" / f"{i + 1:02}-{p['id']}.mp3")
        start = f
        f += int(round(len(a) / RATE * FPS))
        spans.append(dict(id=p["id"], start=start, end=f))
        f += int(round(p["hold"] * FPS))
        takes.append(a)

    total_frames = f + 10
    total_samples = int(round(total_frames / FPS * RATE))
    out = np.zeros(total_samples, np.float64)
    for a, sp in zip(takes, spans):
        i = int(round(sp["start"] / FPS * RATE))
        a = a.copy()
        fin = int(0.008 * RATE)
        a[:fin] *= np.linspace(0, 1, fin)
        a[-fin:] *= np.linspace(1, 0, fin)
        m = min(len(a), total_samples - i)
        out[i:i + m] += a[:m]

    t = np.arange(total_samples) / RATE

    # the bed: 62 Hz plus a fifth, with a slow swell that follows the cut count
    env = 0.5 + 0.5 * np.cos(2 * np.pi * (1 / max(t[-1], 1e-6)) * 2 * t) ** 2
    bed = (0.60 * np.sin(2 * np.pi * 62 * t)
           + 0.26 * np.sin(2 * np.pi * 93 * t)
           + 0.14 * np.sin(2 * np.pi * 124 * t)) * env
    out += bed * 0.048

    # one soft cue per shot: a short filtered blip, not a chime
    for sp in spans:
        at = int(round(sp["start"] / FPS * RATE))
        n = min(int(0.16 * RATE), total_samples - at)
        if n <= 0:
            continue
        tt = np.arange(n) / RATE
        e = np.exp(-tt * 30.0) * (1 - np.exp(-tt * 220.0))
        blip = (0.62 * np.sin(2 * np.pi * 880 * tt)
                + 0.28 * np.sin(2 * np.pi * 1320 * tt)) * e
        out[at:at + n] += blip * 0.055

    out = np.tanh(out * 1.2) * 0.92
    rms = np.sqrt((out ** 2).mean())
    out *= min(3.0, (10 ** (-15.5 / 20)) / max(rms, 1e-9))
    pk = np.abs(out).max()
    if pk > 0.85:
        out *= 0.85 / pk

    outdir = HERE / "out"
    outdir.mkdir(exist_ok=True)
    w = wave.open(str(outdir / "intro.wav"), "wb")
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype("<i2").tobytes())
    w.close()

    meta = dict(fps=FPS, frames=total_frames, seconds=round(total_frames / FPS, 2), spans=spans)
    json.dump(meta, open(outdir / "timeline.json", "w"), indent=2)
    print(f"{total_frames} frames / {total_frames / FPS:.2f}s  "
          f"rms {20 * np.log10(np.sqrt((out ** 2).mean())):.2f} dBFS")


main()
