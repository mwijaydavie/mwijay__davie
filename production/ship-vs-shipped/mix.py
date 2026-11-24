"""
Ship vs Shipped — audio.

Seven takes, same frame-grid method as the Shule Reel: decode each MP3, measure
it, place it on a 60 fps frame grid, and write the spans the renderer reads.

The bed is different on purpose. The Shule Reel used a school bell because the
subject was a school. This one is about engineering discipline, so it uses a
single low tick on each scene change and nothing else — no melody, no riser, no
whoosh on every cut. One voice, one tick.
"""
import json, sys, wave, subprocess, os
from pathlib import Path
import numpy as np

RATE, FPS = 48000, 60
HERE = Path(__file__).resolve().parent
FF = os.environ["FFMPEG"]

TAKES = [
    dict(id="hook",     say=4.40, hold=0.42),
    dict(id="gap",      say=3.92, hold=0.38),
    dict(id="auth",     say=3.52, hold=0.38),
    dict(id="empty",    say=4.40, hold=0.38),
    dict(id="offline",  say=4.40, hold=0.38),
    dict(id="receipt",  say=3.80, hold=0.38),
    dict(id="cta",      say=3.00, hold=1.10),
]


def decode(mp3):
    raw = subprocess.run([FF, "-v", "error", "-i", str(mp3), "-f", "f32le",
                          "-ac", "1", "-ar", str(RATE), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def main():
    takes, spans, f = [], [], 9
    for i, t in enumerate(TAKES):
        a = decode(HERE / "voice" / f"{i+1:02}-{t['id']}.mp3")
        start = f
        f += int(round(len(a) / RATE * FPS))
        spans.append(dict(id=t["id"], start=start, end=f))
        f += int(round(t["hold"] * FPS))
        takes.append(a)

    total_frames = f + 12
    total = int(round(total_frames / FPS * RATE))
    out = np.zeros(total, np.float64)

    for a, sp in zip(takes, spans):
        i = int(round(sp["start"] / FPS * RATE))
        fin = int(0.008 * RATE)
        a = a.copy()
        a[:fin] *= np.linspace(0, 1, fin)
        a[-fin:] *= np.linspace(1, 0, fin)
        n = min(len(a), total - i)
        out[i:i + n] += a[:n]

    # one tick per scene change: a short filtered click, not a musical note
    rng = np.random.default_rng(7)
    for sp in spans[1:] + [dict(id="end", start=total_frames - 12)]:
        at = int(round(sp["start"] / FPS * RATE))
        n = int(0.06 * RATE)
        n = min(n, total - at)
        if n <= 0:
            continue
        tt = np.arange(n) / RATE
        env = np.exp(-tt * 90)
        body = (np.sin(2 * np.pi * 1760 * tt) * 0.5 +
                np.sin(2 * np.pi * 2637 * tt) * 0.25)
        noise = rng.normal(0, 1, n) * 0.25
        out[at:at + n] += (body + noise) * env * 0.05

    out = np.tanh(out * 1.25) * 0.92
    rms = np.sqrt((out ** 2).mean())
    out *= min(3.0, (10 ** (-15.5 / 20)) / max(rms, 1e-9))
    pk = np.abs(out).max()
    if pk > 0.85:
        out *= 0.85 / pk

    stereo = np.stack([out, out], axis=1)
    (HERE / "out").mkdir(exist_ok=True)
    w = wave.open(str(HERE / "out/mix.wav"), "wb")
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(RATE)
    w.writeframes((np.clip(stereo, -1, 1) * 32767).astype("<i2").tobytes())
    w.close()

    json.dump(dict(fps=FPS, frames=total_frames, seconds=round(total_frames / FPS, 2),
                   spans=spans, keyword="SHIP"),
              open(HERE / "out/timeline.json", "w"), indent=2)
    print(f"{total_frames} frames / {total_frames/FPS:.2f}s  "
          f"rms {20*np.log10(np.sqrt((out**2).mean())):.2f} dBFS")


main()
