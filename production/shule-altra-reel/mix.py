"""
Shule Altra Reel audio.

Eight Swanglish takes, cut at the MP3 boundaries but each placed on a beat grid
so the visuals can be deterministic. The bed is a soft school-bell motif, low
and quiet: one bell tone on each scene change, nothing else. The owner's note on
the intro was "audios zimekuwa nyingi ka uchafu", so this keeps exactly two
voices in the mix: the narration and the bell.
"""
import json, sys, wave, subprocess, os
from pathlib import Path
import numpy as np

RATE = 48000
FPS = 60
HERE = Path(__file__).resolve().parent
FF = os.environ["FFMPEG"]

# Scene timings, in frames. Gaps are deliberate: the hand needs time to move.
PLAN = [
    dict(id="hook",      say=2.60, hold=0.50),
    dict(id="intro",     say=4.48, hold=0.40),
    dict(id="timetable", say=3.68, hold=0.40),
    dict(id="lesson",    say=6.32, hold=0.45),
    dict(id="modules",   say=3.56, hold=0.40),
    dict(id="pdf",       say=4.40, hold=0.40),
    dict(id="offer",     say=4.24, hold=0.42),
    dict(id="cta",       say=3.08, hold=1.10),
]

def decode(mp3):
    raw = subprocess.run([FF, "-v", "error", "-i", str(mp3), "-f", "f32le",
                          "-ac", "1", "-ar", str(RATE), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

def read_wav(p):
    w = wave.open(str(p), "rb")
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768.0
    if a.ndim > 1: a = a.mean(axis=1)
    return a, w.getframerate()

def main():
    takes, spans, f = [], [], 11  # 11 frames of lead-in, like the original build
    for p in PLAN:
        a = decode(HERE / "voice" / f"{len(takes)+1:02}-{p['id']}.mp3")
        n = len(a)
        if n != int(round(p['say'] * RATE)):
            sys.stderr.write(f"{p['id']}: mp3 says {n/RATE:.2f}s, plan says {p['say']:.2f}s\n")
        start = f
        f += int(round(len(a) / RATE * FPS))
        spans.append(dict(id=p['id'], start=start, end=f))
        f += int(round(p['hold'] * FPS))
        takes.append(a)

    total_frames = f + 12
    total_samples = int(round(total_frames / FPS * RATE))
    out = np.zeros(total_samples, np.float64)
    for a, sp in zip(takes, spans):
        i = int(round(sp['start'] / FPS * RATE))
        fin = int(0.010 * RATE)
        a = a.copy()
        a[:fin] *= np.linspace(0, 1, fin)
        a[-fin:] *= np.linspace(1, 0, fin)
        m = min(len(a), total_samples - i)
        out[i:i + m] += a[:m]

    # one soft bell on each scene change: a 1046 Hz body with two short partials
    t = np.arange(total_samples) / RATE
    for sp in spans[1:] + [dict(id="end", start=total_frames - 12)]:
        at = int(round(sp['start'] / FPS * RATE))
        dur = int(0.55 * RATE)
        n = min(dur, total_samples - at)
        if n <= 0: continue
        tt = np.arange(n) / RATE
        env = np.exp(-tt * 6.2)
        bell = (0.55 * np.sin(2 * np.pi * 1046 * tt)
                + 0.26 * np.sin(2 * np.pi * 1568 * tt)
                + 0.12 * np.sin(2 * np.pi * 2093 * tt)) * env
        out[at:at + n] += bell * 0.055

    out = np.tanh(out * 1.25) * 0.92
    rms = np.sqrt((out ** 2).mean())
    out *= min(3.0, (10 ** (-15.5 / 20)) / max(rms, 1e-9))
    pk = np.abs(out).max()
    if pk > 0.85: out *= 0.85 / pk

    stereo = np.stack([out, out], axis=1)
    outdir = HERE / "out"
    outdir.mkdir(exist_ok=True)
    w = wave.open(str(outdir / "mix.wav"), "wb")
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(RATE)
    w.writeframes((np.clip(stereo, -1, 1) * 32767).astype("<i2").tobytes())
    w.close()

    meta = dict(fps=FPS, frames=total_frames, seconds=round(total_frames / FPS, 2),
                spans=spans, keyword="SHULE")
    json.dump(meta, open(outdir / "timeline.json", "w"), indent=2)
    print(f"{total_frames} frames / {total_frames/FPS:.2f}s  rms {20*np.log10(np.sqrt((out**2).mean())):.2f} dBFS")

main()
