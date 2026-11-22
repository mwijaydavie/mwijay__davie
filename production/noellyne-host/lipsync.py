#!/usr/bin/env python3
"""
Real lip sync for Noellyne.

Two things were wrong before this existed:

1. `performerDraw` never drew a mouth layer at all. The rig ships eight viseme
   patches per pose; the renderer used none of them, so she talked with a closed
   mouth for an entire Reel. That is the "mdomo umekuwa shut" note.

2. A hand-written viseme list is not sync. It is a guess that drifts.

This analyses the dry voice actually used in the cut and emits, per frame, the
openness of the mouth (0..1) and the viseme letter. The renderer cross-fades the
kit patches with those weights.

Method: formant-ish band energy. Energy in 300-1200 Hz relative to 150-3000 Hz
tracks vowel openness well enough for a stylised character, and it is derived
from the real waveform, so it follows the take instead of a stopwatch.

Usage:
  python3 lipsync.py out/mix.wav out/mouth.json --fps 60
"""
import json, sys, wave, os
from pathlib import Path
import numpy as np

RATE_TARGET = 48000


def read_mono(path: Path):
    w = wave.open(str(path), "rb")
    n, ch, sw, sr = w.getnframes(), w.getnchannels(), w.getsampwidth(), w.getframerate()
    raw = w.readframes(n)
    if sw != 2:
        raise SystemExit("expects 16-bit PCM wav")
    a = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    if ch > 1:
        a = a.reshape(-1, ch).mean(axis=1)
    if sr != RATE_TARGET:
        idx = np.linspace(0, len(a) - 1, int(len(a) * RATE_TARGET / sr))
        a = np.interp(idx, np.arange(len(a)), a).astype(np.float32)
    return a, RATE_TARGET


def band_energy(x, sr, lo, hi):
    """Energy in a band, via a windowed FFT per hop. Small frames, cheap."""
    n = 1024
    hop = 256
    win = np.hanning(n).astype(np.float32)
    freqs = np.fft.rfftfreq(n, 1.0 / sr)
    sel = (freqs >= lo) & (freqs <= hi)
    frames = max(1, 1 + (len(x) - n) // hop)
    out = np.empty(frames, dtype=np.float32)
    for i in range(frames):
        seg = x[i * hop:i * hop + n] * win
        if len(seg) < n:
            seg = np.pad(seg, (0, n - len(seg)))
        spec = np.abs(np.fft.rfft(seg))
        out[i] = float(np.sqrt((spec[sel] ** 2).mean()))
    return out, hop, sr


def analyse(path: Path, fps: int):
    x, sr = read_mono(path)
    low, hop, sr = band_energy(x, sr, 300, 1200)
    full, _, _ = band_energy(x, sr, 150, 3000)
    # normalise per utterance so a quiet passage still opens the mouth
    ref = np.percentile(full, 92) or 1.0
    low_n = low / (np.percentile(low, 92) or 1.0)
    full_n = full / ref

    voiced = full_n > np.percentile(full_n, 35)
    ratio = np.clip(low_n / (full_n + 1e-4) * 0.55, 0, 1.4)
    energy = np.clip(full_n, 0, 1.2)

    spans = len(x) / sr
    n_frames = int(round(spans * fps))
    spl = np.arange(len(low))
    out = []
    for f in range(n_frames):
        t = f / fps
        i = int(t * sr / hop)
        i = min(max(i, 0), len(low) - 1)
        j = min(i + 1, len(low) - 1)
        frac = (t * sr / hop) - i
        r = float(ratio[i] * (1 - frac) + ratio[j] * frac)
        e = float(energy[i] * (1 - frac) + energy[j] * frac)
        v = bool(voiced[min(i, len(voiced) - 1)])
        openness = 0.0 if not v else float(np.clip(r * 0.85 + e * 0.25, 0, 1))
        if openness < 0.08:
            letter = "X"
        elif openness < 0.22:
            letter = "A"
        elif openness < 0.36:
            letter = "H"
        elif openness < 0.50:
            letter = "G"
        elif openness < 0.64:
            letter = "C"
        elif openness < 0.76:
            letter = "D"
        elif openness < 0.88:
            letter = "B"
        else:
            letter = "F"
        out.append([round(openness, 3), letter])

    # ease: a mouth does not snap between shapes in 1/60 s
    sm = []
    prev = out[0][0]
    for o, l in out:
        prev = prev + (o - prev) * 0.55
        sm.append([round(prev, 3), l if prev >= 0.08 else "X"])
    return sm


def main():
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    fps = int(sys.argv[sys.argv.index("--fps") + 1]) if "--fps" in sys.argv else 60
    frames = analyse(src, fps)
    open_frac = sum(1 for o, _ in frames if o > 0.2) / max(1, len(frames))
    dst.write_text(json.dumps({"fps": fps, "frames": frames,
                               "source": src.name, "openFraction": round(open_frac, 3)}))
    print(f"{len(frames)} frames, mouth open on {open_frac*100:.1f}% of them -> {dst}")


if __name__ == "__main__":
    main()
