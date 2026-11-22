"""V5 sound: one continuous music bed and two soft transition cues.

The V4 mix was rejected as "audios zimekuwa nyingi ka uchafu, hamna muelewano"
(too many sounds, nothing readable). So V5 is deliberately plain:

  * ONE bed, the same four-bar loop the whole reel. No second layer, no risers.
  * TWO cues total, both soft: a low thump when the media panel lands and a
    short blip on the follow button. Nothing on every word or every cut.
  * The bed is filtered to leave the 1-4 kHz speech band alone, and ducked
    under the voice in the mixer, not here.

Everything is synthesised, so there is no licensing question.

Writes intro-v5/sfx/
"""
import math
import wave
from pathlib import Path

import numpy as np

SR = 48000
HERE = Path(__file__).resolve().parents[1]
OUT = HERE / "sfx"

# A minor 9 -> F major 9, 2 bars each at 84 BPM. Warm, unhurried, "editorial".
BPM = 84.0
BEAT = 60.0 / BPM
BAR = BEAT * 4
CHORDS = [
    (0, [220.00, 261.63, 329.63, 493.88]),      # Am9
    (2, [174.61, 220.00, 261.63, 392.00]),      # Fmaj9
]


def env(n, a=0.02, d=0.1, s=0.7, r=0.25):
    """Simple ADSR shaped over n samples (fractions of n)."""
    e = np.ones(n, dtype=np.float32)
    ai, di, ri = int(n * a), int(n * d), int(n * r)
    si = max(0, n - ai - di - ri)
    seg = np.concatenate([
        np.linspace(0, 1, max(1, ai), dtype=np.float32),
        np.linspace(1, s, max(1, di), dtype=np.float32),
        np.full(si, s, dtype=np.float32),
        np.linspace(s, 0, max(1, ri), dtype=np.float32),
    ])
    if len(seg) >= n:
        e[:] = seg[:n]
    else:
        e[: len(seg)] = seg
    return e


def lowpass(x, cutoff):
    """One-pole lowpass; enough to keep the bed out of the speech band."""
    a = math.exp(-2 * math.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def pad(dur, freqs, gain=0.16, detune=0.004):
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = np.zeros(n, dtype=np.float32)
    for k, f in enumerate(freqs):
        for d in (-detune, 0.0, detune):
            ph = 2 * math.pi * f * (1 + d) * t + k
            x += np.sin(ph).astype(np.float32) * (0.9 if d == 0 else 0.45)
    x /= max(1, len(freqs)) * 2.2
    # gentle swell so bars do not click
    x *= env(n, a=0.16, d=0.2, s=0.85, r=0.3)
    return x * gain


def music_bed(bars=8):
    """Loopable bed: pads + a soft plucked arpeggio + a heartbeat-ish sub."""
    total = int(SR * BAR * bars)
    bed = np.zeros(total + SR, dtype=np.float32)

    for i in range(bars):
        at = i * BAR
        root, freqs = CHORDS[0] if (i // 2) % 2 == 0 else CHORDS[1]
        seg = pad(BAR * 1.02, freqs, gain=0.15)
        s0 = int(SR * at)
        bed[s0 : s0 + len(seg)] += seg

        # arpeggio: one note per beat, very quiet, on top of the pad
        for b in range(4):
            f = freqs[(i + b) % len(freqs)] * 2
            note = np.sin(2 * math.pi * f * np.arange(int(SR * BEAT * 0.9)) / SR).astype(np.float32)
            note *= env(len(note), a=0.004, d=0.25, s=0.10, r=0.6)
            s1 = int(SR * (at + b * BEAT))
            bed[s1 : s1 + len(note)] += note * 0.035

        # sub pulse on the downbeat, felt rather than heard
        if i % 2 == 0:
            sub = np.sin(2 * math.pi * (root / 2) * np.arange(int(SR * 0.5)) / SR).astype(np.float32)
            sub *= env(len(sub), a=0.01, d=0.4, s=0.2, r=0.5)
            s2 = int(SR * at)
            bed[s2 : s2 + len(sub)] += sub * 0.10

    bed = bed[:total]
    # keep the bed under the voice: cut everything above the vocal presence band
    bed = lowpass(bed, 900.0)
    # smooth the loop seam
    fade = int(SR * 0.35)
    bed[:fade] *= np.linspace(0, 1, fade, dtype=np.float32)
    bed[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
    peak = np.max(np.abs(bed)) or 1.0
    return (bed / peak * 0.72).astype(np.float32)


def soft_thump(dur=0.34):
    """Panel landing: a round low thump with no click."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = 132 * np.exp(-t * 9) + 62
    x = np.sin(2 * math.pi * np.cumsum(f) / SR).astype(np.float32)
    x *= env(n, a=0.004, d=0.5, s=0.06, r=0.5)
    return (x / (np.max(np.abs(x)) or 1) * 0.5).astype(np.float32)


def blip(dur=0.16):
    """Follow button: two-note blip, quiet and short."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = (
        0.55 * np.sin(2 * math.pi * 880 * t)
        + 0.35 * np.sin(2 * math.pi * 1320 * t)
        + 0.20 * np.sin(2 * math.pi * 1760 * t)
    ).astype(np.float32)
    x *= env(n, a=0.005, d=0.25, s=0.2, r=0.6)
    return (x / (np.max(np.abs(x)) or 1) * 0.28).astype(np.float32)


def write(name, x):
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / name
    with wave.open(str(p), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"{p}  {len(x)/SR:.2f}s  peak {20*math.log10(np.max(np.abs(x))+1e-9):.1f} dBFS")


if __name__ == "__main__":
    import sys

    if "--no-music" not in sys.argv:
        write("bed.wav", music_bed())
    write("thump.wav", soft_thump())
    write("blip.wav", blip())
