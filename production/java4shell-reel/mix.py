"""
Java4Shell Reel audio.

Seven Swanglish takes over one bed: a soft low pulse, like a machine room that
never quite stops, plus a single tick on each scene change. Two voices total —
her, and the room. The owner's note on the school Reel was "audios zimekuwa
nyingi ka uchafu", so nothing else goes in.
"""
import json, os, subprocess, wave
from pathlib import Path
import numpy as np

RATE = 48000
FPS = 60
HERE = Path(__file__).resolve().parent
FF = os.environ["FFMPEG"]

# say = the clip's own length (checked below), hold = the beat's tail in seconds.
PLAN = [
    dict(id="hook",   hold=0.55),
    dict(id="found",  hold=0.45),
    dict(id="bug",    hold=0.45),
    dict(id="apps",   hold=0.50),
    dict(id="patch",  hold=0.45),
    dict(id="action", hold=0.55),
    dict(id="cta",    hold=1.30),
]


def decode(mp3):
    raw = subprocess.run([FF, "-v", "error", "-i", str(mp3), "-f", "f32le",
                          "-ac", "1", "-ar", str(RATE), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def main():
    takes, spans, f = [], [], 11  # 11 frames of lead-in
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
        fin = int(0.010 * RATE)
        a[:fin] *= np.linspace(0, 1, fin)
        a[-fin:] *= np.linspace(1, 0, fin)
        m = min(len(a), total_samples - i)
        out[i:i + m] += a[:m]

    t = np.arange(total_samples) / RATE

    # the bed: a very low two-note pulse, 5.5 s cycle, quiet enough to sit under
    # speech without ever competing with it
    bed = np.zeros(total_samples)
    for j, (fr, amp) in enumerate([(55.0, 0.28), (82.5, 0.16), (110.0, 0.08)]):
        ph = 2 * np.pi * fr * t
        env = 0.45 + 0.55 * np.cos(2 * np.pi * (0.1818) * t) ** 2
        bed += amp * np.sin(ph) * env
    out += bed * 0.030

    # one tick on every scene change: short, dry, high — a relay, not a chime
    for sp in spans[1:] + [dict(id="end", start=total_frames - 14)]:
        at = int(round(sp["start"] / FPS * RATE))
        n = min(int(0.09 * RATE), total_samples - at)
        if n <= 0:
            continue
        tt = np.arange(n) / RATE
        env = np.exp(-tt * 55.0)
        tick = (0.7 * np.sin(2 * np.pi * 2400 * tt)
                + 0.3 * np.sin(2 * np.pi * 3100 * tt)) * env
        out[at:at + n] += tick * 0.045

    out = np.tanh(out * 1.25) * 0.92
    rms = np.sqrt((out ** 2).mean())
    out *= min(3.0, (10 ** (-15.5 / 20)) / max(rms, 1e-9))
    pk = np.abs(out).max()
    if pk > 0.85:
        out *= 0.85 / pk

    stereo = np.stack([out, out], axis=1)
    outdir = HERE / "out"
    outdir.mkdir(exist_ok=True)
    w = wave.open(str(outdir / "mix.wav"), "wb")
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(RATE)
    w.writeframes((np.clip(stereo, -1, 1) * 32767).astype("<i2").tobytes())
    w.close()

    meta = dict(fps=FPS, frames=total_frames, seconds=round(total_frames / FPS, 2),
                spans=spans, keyword="PATCH")
    json.dump(meta, open(outdir / "timeline.json", "w"), indent=2)
    print(f"{total_frames} frames / {total_frames / FPS:.2f}s  "
          f"rms {20 * np.log10(np.sqrt((out ** 2).mean())):.2f} dBFS")


main()
