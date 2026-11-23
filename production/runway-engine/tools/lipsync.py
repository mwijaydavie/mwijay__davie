"""Bake a per-frame mouth envelope from a rendered mix, for lip-sync.

    python3 tools/lipsync.py <mix.wav> <slug>

Why the mix and not the text: a mouth that follows a syllable counter drifts within two
words. The mix already contains the answer — the voiced band (180–3600 Hz, which is
speech, not the bass of the soundtrack) rises and falls exactly on the syllables that
are being said.

Three steps, because raw RMS is not a mouth:
  1 · voiced band only, so a bass hit does not open her mouth
  2 · fast attack, slow release — a jaw drops quickly and relaxes slowly; the other way
      round reads as chewing
  3 · squashed with a floor, so the lips hover just apart between words instead of
      slamming shut on every pause
"""
import glob, json, os, subprocess, sys
import numpy as np

def ffmpeg_bin():
    """the repo ships ffmpeg inside the node_modules installer; just use that"""
    for pat in ('node_modules/@ffmpeg-installer/*/ffmpeg', '../node_modules/@ffmpeg-installer/*/ffmpeg'):
        hit = glob.glob(pat)
        if hit:
            return hit[0]
    return 'ffmpeg'


def main(mix, slug, out=None):
    raw = '/tmp/_lipsync.raw'
    subprocess.run([ffmpeg_bin(), '-y', '-hide_banner', '-loglevel', 'error', '-i', mix,
                    '-ac', '1', '-af', 'highpass=f=180,lowpass=f=3600,aresample=8000',
                    '-f', 'f32le', raw], check=True)
    a = np.fromfile(raw, dtype=np.float32)
    w = 80                                   # 10 ms windows at 8 kHz
    n = len(a) // w
    env = np.sqrt((a[:n * w].reshape(n, w) ** 2).mean(1))
    env = env / max(np.percentile(env, 95), 1e-6)
    env = np.convolve(np.clip(env, 0, 1.6), np.ones(3) / 3, 'same')
    out_env = np.zeros_like(env)
    prev = 0.0
    for i, v in enumerate(env):
        k = 0.55 if v > prev else 0.22        # fast attack, slow release
        prev += (v - prev) * k
        out_env[i] = prev
    out_env = np.clip(out_env * 1.25, 0, 1)
    gate = np.convolve((out_env > 0.12).astype(np.float32), np.ones(20) / 20, 'same')

    seconds = len(a) / 8000
    frames = int(round(seconds * 60))
    xs = np.arange(frames) * 100 / 60
    data = dict(fps_render=60, fps_source=100, slug=slug, seconds=round(seconds, 3),
                frames=frames,
                mouth=[round(float(v), 3) for v in np.interp(xs, np.arange(len(out_env)), out_env)],
                speaking=[round(float(v), 3) for v in np.interp(xs, np.arange(len(gate)), gate)])
    out = out or f'content/runway/character/mouth-{slug}.json'
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump(data, open(out, 'w'))
    print(f'{out}  {frames} frames  {seconds:.2f}s  '
          f'mean {np.mean(data["mouth"]):.2f}  peak {max(data["mouth"]):.2f}')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
