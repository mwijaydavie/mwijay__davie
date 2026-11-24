"""
Tech Bila Hype — TANGAZO: Altraware × BongoFoodie — audio.

Same grammar as the EP.1/EP.2 mixes: voice-led cut, one low bed (62 Hz + fifth),
one soft tick per scene change. No risers, no whooshes.
"""
import json, os, subprocess, wave
from pathlib import Path
import numpy as np

RATE, FPS = 48000, 60
HERE = Path(__file__).resolve().parent
FF = os.environ["FFMPEG"]

PLAN = [
    dict(id="hook",    hold=0.55),
    dict(id="problem", hold=0.50),
    dict(id="menu",    hold=0.50),
    dict(id="brains",  hold=0.50),
    dict(id="pitch",   hold=0.50),
    dict(id="cta",     hold=1.30),
]

def decode(mp3):
    raw = subprocess.run([FF, "-v", "error", "-i", str(mp3), "-f", "f32le",
                          "-ac", "1", "-ar", str(RATE), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

def main():
    takes, spans, f = [], [], 10
    for i, p in enumerate(PLAN):
        a = decode(HERE / "voice" / f"{i + 1:02}-{p['id']}.mp3")
        start = f
        f += int(round(len(a) / RATE * FPS))
        spans.append(dict(id=p["id"], start=start, end=f))
        f += int(round(p["hold"] * FPS))
        takes.append(a)

    total_frames = f + 12
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

    # the bed: 62 Hz plus a fifth, slow swell, sits under speech
    env = 0.5 + 0.5 * np.cos(2 * np.pi * (2 / max(t[-1], 1e-6)) * t) ** 2
    bed = (0.60 * np.sin(2 * np.pi * 62 * t)
           + 0.26 * np.sin(2 * np.pi * 93 * t)
           + 0.14 * np.sin(2 * np.pi * 124 * t)) * env
    out += bed * 0.045

    # one soft tick per scene change — a relay, not a chime
    for sp in spans[1:] + [dict(id="end", start=total_frames - 12)]:
        at = int(round(sp["start"] / FPS * RATE))
        n = min(int(0.09 * RATE), total_samples - at)
        if n <= 0:
            continue
        tt = np.arange(n) / RATE
        tick = (0.7 * np.sin(2 * np.pi * 2400 * tt)
                + 0.3 * np.sin(2 * np.pi * 3100 * tt)) * np.exp(-tt * 55.0)
        out[at:at + n] += tick * 0.045

    out = np.tanh(out * 1.25) * 0.92
    rms = np.sqrt((out ** 2).mean())
    out *= min(3.0, (10 ** (-15.5 / 20)) / max(rms, 1e-9))
    pk = np.abs(out).max()
    if pk > 0.85:
        out *= 0.85 / pk

    stereo = np.stack([out, out], axis=1)
    (HERE / "out").mkdir(exist_ok=True)
    with wave.open(str(HERE / "out/mix.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(RATE)
        w.writeframes((np.clip(stereo, -1, 1) * 32767).astype("<i2").tobytes())
    json.dump(dict(fps=FPS, frames=total_frames, seconds=round(total_frames / FPS, 2),
                   spans=spans, keyword="APP"),
              open(HERE / "out/timeline.json", "w"), indent=2)
    print(f"{total_frames} frames / {total_frames/FPS:.2f}s  "
          f"rms {20*np.log10(np.sqrt((out**2).mean())):.2f} dBFS")

main()
