#!/usr/bin/env python3
"""
SFX-only mix for Tech Bila Hype EP.1 (48 kHz stereo).

There is no licensed music in this repo and no VO take was recorded for this
script — the reference this episode is built against is caption-driven, so the
sound design is synthesised percussion: pops, thumps, stamps, one whoosh,
cursor ticks and a closing chime. Everything is placed by frame number, which
is the same contract render.mjs uses, so picture and sound can never drift.
"""
import json
import numpy as np

SR = 48000
TOTAL_FRAMES = 1320
T = TOTAL_FRAMES / 60.0

def env(n, attack=0.008, decay=0.12):
    t = np.arange(n) / SR
    a = np.minimum(t / attack, 1.0)
    d = np.exp(-t / decay)
    return a * d

def add(*parts):
    n = max(len(p) for p in parts)
    out = np.zeros(n)
    for p in parts:
        out[:len(p)] += p
    return out

def sine(freq, dur, attack=0.004, decay=0.25, bend_to=None):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if bend_to:
        f = freq + (bend_to - freq) * (t / dur)
        phase = 2 * np.pi * np.cumsum(f) / SR
    else:
        phase = 2 * np.pi * freq * t
    return np.sin(phase) * env(n, attack, decay)

def noise(dur, attack=0.002, decay=0.08, lp=8000):
    n = int(dur * SR)
    x = np.random.default_rng(7).standard_normal(n)
    # crude low-pass by cumulative smoothing
    k = max(1, int(SR / lp))
    ker = np.ones(k) / k
    x = np.convolve(x, ker, mode="same")
    return x * env(n, attack, decay)

def pan(mono, p=0.0):
    ang = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(ang), mono * np.sin(ang)], axis=1)

def place(mix, stamp, frame, p=0.0, gain=1.0):
    t0 = int(frame / 60 * SR)
    s = pan(stamp, p) * gain
    end = min(t0 + len(s), len(mix))
    mix[t0:end] += s[: end - t0]

mix = np.zeros((int(T * SR), 2), dtype=np.float64)

# B1 — pill pop, two headline slams
place(mix, add(sine(720, 0.16, 0.002, 0.05, bend_to=420) * 0.9, noise(0.16, 0.001, 0.03) * 0.3), 16, 0.0, 0.9)
place(mix, sine(120, 0.30, 0.004, 0.18, bend_to=52) * 1.0, 40, -0.15, 1.1)
place(mix, sine(110, 0.30, 0.004, 0.18, bend_to=48) * 1.0, 52, 0.15, 1.1)
# B2 — mono type ticks, staggered wall ticks, red slash stamp, whip out
place(mix, sine(1800, 0.03, 0.001, 0.02), 138, 0.3, 0.5)
for i, f in enumerate(range(172, 265, 11)):
    place(mix, sine(1500 - i * 40, 0.025, 0.001, 0.02), f, -0.3 + i * 0.07, 0.35)
place(mix, add(noise(0.18, 0.002, 0.10, lp=2500) * 1.1, sine(95, 0.35, 0.004, 0.22, bend_to=44) * 1.0), 262, 0.0, 1.15)
place(mix, noise(0.30, 0.001, 0.16, lp=1200) * 0.8, 335, 0.0, 0.8)
# B3 — the two slams and the gold stamp
place(mix, sine(105, 0.30, 0.004, 0.2, bend_to=46), 372, -0.1, 1.05)
place(mix, sine(98, 0.30, 0.004, 0.2, bend_to=42), 410, 0.1, 1.05)
place(mix, add(noise(0.14, 0.002, 0.07, lp=3000) * 0.9, sine(80, 0.32, 0.004, 0.26, bend_to=38) * 1.0), 444, 0.0, 1.25)
# B4 — section tick, swatch pops
place(mix, sine(1600, 0.03, 0.001, 0.02), 566, 0.3, 0.45)
place(mix, sine(660, 0.13, 0.002, 0.05, bend_to=380), 652, -0.3, 0.8)
place(mix, sine(990, 0.13, 0.002, 0.05, bend_to=560), 700, 0.3, 0.8)
# B5 — word slams, card pop, thumbsup pop, kicker tick
place(mix, noise(0.25, 0.001, 0.14, lp=1100) * 0.9, 816, 0.0, 0.9)
place(mix, sine(100, 0.28, 0.004, 0.18, bend_to=45), 830, 0.0, 1.1)
place(mix, sine(700, 0.17, 0.002, 0.06, bend_to=390), 866, 0.0, 1.0)
place(mix, sine(780, 0.14, 0.002, 0.05, bend_to=430), 898, 0.2, 0.85)
# B6 — open whoosh, logo sweep, cursor ticks, closing chime
place(mix, noise(0.35, 0.001, 0.2, lp=1000) * 0.75, 1008, 0.0, 0.85)
place(mix, noise(0.55, 0.001, 0.3, lp=500) * 0.5, 1045, -0.1, 0.7)
place(mix, sine(1500, 0.03, 0.001, 0.02), 1090, -0.35, 0.4)
for f in range(1176, 1216, 7):
    place(mix, sine(2100, 0.02, 0.001, 0.018), f, 0.2, 0.33)
for fq, g in [(880, 0.5), (1320, 0.4), (1760, 0.3)]:
    place(mix, sine(fq, 1.1, 0.004, 0.55) * g, 1216, 0.0, 0.75)

peak = np.max(np.abs(mix))
if peak > 0.89:
    mix *= 0.89 / peak
mix = mix * 0.96

with open("out/mix.wav", "wb") as fh:
    import struct
    n = mix.shape[0]
    fh.write(b"RIFF"); fh.write(struct.pack("<I", 36 + n * 4)); fh.write(b"WAVE")
    fh.write(b"fmt "); fh.write(struct.pack("<IHHIIHH", 16, 1, 2, SR, SR * 4, 4, 16))
    fh.write(b"data"); fh.write(struct.pack("<I", n * 4))
    fh.write((mix * 32767).astype("<i2").tobytes())
print("out/mix.wav", n / SR, "seconds", "peak", float(np.max(np.abs(mix))))
