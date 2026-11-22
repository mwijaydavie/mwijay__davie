"""
V8 audio, built sample by sample in numpy rather than with an ffmpeg filter
graph: the filter version doubled the length (39.6 s instead of 19.8 s) and was
not worth debugging. Here every cut point is explicit and checkable.

Voice: Noellyne's own from Noellyne-Intro-SW.mp4, four cuts taken from measured
pauses (0.02 s resolution): 0.00-4.10, 4.50-8.55, 14.25-18.70, 19.00-23.46.
Bed: one 58 Hz drone at -27 dB. No other layers — "audios zimekuwa nyingi ka
uchafu".
"""
import wave, numpy as np, os

SR = 48000
TOTAL = 19.8
SEG = [(".cache/vo_1.wav", 0.00), (".cache/vo_2.wav", 4.40),
       (".cache/vo_3.wav", 8.80), (".cache/vo_4.wav", 14.60)]

n = int(TOTAL * SR)
out = np.zeros(n, np.float64)

def read(p):
    w = wave.open(p, "rb")
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768.0
    assert w.getframerate() == SR, (p, w.getframerate())
    if a.ndim > 1:
        a = a.mean(axis=1)
    return a

for p, at in SEG:
    a = read(p)
    # 12 ms fades so no cut pops
    f = int(0.012 * SR)
    a[:f] *= np.linspace(0, 1, f)
    a[-f:] *= np.linspace(1, 0, f)
    i = int(at * SR)
    m = min(len(a), n - i)
    out[i:i + m] += a[:m]

# one quiet bed, low passed, slowly breathing
t = np.arange(n) / SR
bed = np.sin(2 * np.pi * 58 * t) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t))
bed *= 0.020
out += bed

# gentle two-stage level control: soft clip then normalise to -15.5 LUFS-ish
out = np.tanh(out * 1.35) * 0.92
rms = np.sqrt((out ** 2).mean())
target = 10 ** (-15.5 / 20)
out *= min(3.0, target / max(rms, 1e-9))
peak = np.abs(out).max()
if peak > 0.85:
    out *= 0.85 / peak

st = np.stack([out, out], axis=1)
os.makedirs("production/noellyne-ig/intro-v8/out", exist_ok=True)
w = wave.open("production/noellyne-ig/intro-v8/out/mix.wav", "wb")
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())
w.close()
print(f"dur {len(out)/SR:.2f}s  rms {20*np.log10(np.sqrt((out**2).mean())):.2f} dBFS  peak {20*np.log10(np.abs(out).max()):.2f} dBFS")
