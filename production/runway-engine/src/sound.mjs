// Sound design, synthesised from scratch. No sample library, no downloads, no licence
// questions: every cue is generated from a deterministic formula, so the same spec
// always produces the same audio.
//
// The bed is deliberately quiet and ducked under the voice: a Reel is watched on a phone
// speaker in a room, so the music has to survive a 60% volume slider without masking words.
import fs from 'node:fs';

export const SR = 48000;

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- primitives ---------- */

/** Deterministic white noise (xorshift), so a render never changes between runs. */
function makeNoise(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return (s / 4294967296) * 2 - 1;
  };
}

/** One-pole low-pass; cheap, stable, and enough for noise shaping. */
function lowpass(prev, x, cut) {
  const a = clamp(cut, 0.00001, 0.9);
  return prev + a * (x - prev);
}

/** Additive tone with exponential decay and optional harmonics. */
function tone({freq, dur, amp = 0.2, decay = 4, harmonics = [1, 0.4, 0.15], glide = 0}) {
  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 900)); // fast but click-free attack
    const f = freq * (1 + glide * (t / dur));
    let v = 0;
    for (let h = 0; h < harmonics.length; h++) v += harmonics[h] * Math.sin(TAU * f * (h + 1) * t);
    out[i] = v * env * amp;
  }
  return out;
}

/** Filtered noise with an amplitude envelope; the base material for whooshes. */
function noiseSweep({dur, from = 400, to = 6000, amp = 0.2, seed = 7, shape = 'up'}) {
  const n = Math.floor(dur * SR);
  const out = new Float32Array(n);
  const rnd = makeNoise(seed);
  let lp = 0, hp = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const t = i / SR;
    const cut = clamp(lerp(from, to, shape === 'up' ? p * p : 1 - p * p) / SR * 6, 0.00001, 0.92);
    const x = rnd();
    lp = lowpass(lp, x, cut);
    hp = x - lp;
    // slow in, fast out: a whoosh that does not click at the tail
    const env = Math.sin(Math.PI * Math.pow(p, 0.7)) ** 2;
    out[i] = hp * env * amp;
  }
  return out;
}

/** Short bright tick for a text reveal. */
function tick({freq = 1650, amp = 0.16, dur = 0.11}) {
  return tone({freq, dur, amp, decay: 34, harmonics: [1, 0.25], glide: -0.12});
}

/** Low impact, used at scene changes on the story track. */
function thud({amp = 0.3, dur = 0.42}) {
  return tone({freq: 62, dur, amp, decay: 7, harmonics: [1, 0.3, 0.1], glide: -0.35});
}

/* ---------- arrangement ---------- */

const mix = (a, b) => {
  const n = Math.max(a.length, b.length);
  const out = new Float32Array(n);
  out.set(a);
  for (let i = 0; i < b.length; i++) out[i] += b[i];
  return out;
};

/**
 * Build the full soundtrack.
 * @param {object} o
 * @param {number} o.seconds      total duration
 * @param {number[]} o.scenStarts scene start times, in seconds
 * @param {number[]} o.reveals    times of on-screen text reveals, in seconds
 * @param {string[]} o.cues       per-scene sound cue: 'whoosh' | 'tick' | 'rise' | 'none'
 * @param {'light'|'dark'|'idea'} o.mood
 */
export function soundtrack({seconds, sceneStarts = [], reveals = [], cues = [], mood = 'light'}) {
  const n = Math.ceil(seconds * SR);
  const bed = new Float32Array(n);
  const fx = new Float32Array(n);

  // ---- bed: a slow two-note pad plus filtered air. Kept under -30 dBFS.
  // 'story' is a warm minor figure with a slow swell — it should feel like a room with a
  // fan in it, not like a product demo. Three notes, no drums, nothing to date it.
  const padNotes = mood === 'dark' ? [110, 164.81, 220]
    : mood === 'story' ? [130.81, 155.56, 196.0, 261.63]
    : [146.83, 220, 293.66];
  const padAmp = mood === 'dark' ? 0.05 : mood === 'story' ? 0.042 : 0.038;
  const rnd = makeNoise(23);
  let air = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (let k = 0; k < padNotes.length; k++) {
      const detune = 1 + Math.sin(t * 0.13 + k) * 0.0015; // slow chorus, no beating artefact
      v += Math.sin(TAU * padNotes[k] * detune * t) * (0.6 - k * 0.15);
    }
    // fade the pad in over 1.2s and out over the last 0.8s; the story bed also breathes
    const swell = mood === 'story' ? 0.82 + 0.18 * Math.sin(TAU * 0.055 * t) : 1;
    const env = clamp(t / 1.2) * clamp((seconds - t) / 0.8) * swell;
    air = lowpass(air, rnd(), 0.0025);
    bed[i] = (v * padAmp + air * 0.05) * env;
  }

  // ---- scene transitions
  sceneStarts.forEach((s, i) => {
    const cue = cues[i] || (i === 0 ? 'rise' : 'whoosh');
    if (cue === 'none') return;
    let buf;
    if (cue === 'whoosh') buf = noiseSweep({dur: 0.28, from: 900, to: 7200, amp: 0.16, seed: 11 + i});
    else if (cue === 'thud') buf = thud({amp: 0.26});
    else if (cue === 'rise') buf = noiseSweep({dur: 0.7, from: 300, to: 4800, amp: 0.13, seed: 31 + i});
    else buf = tick({amp: 0.12});
    const at = Math.max(0, Math.floor((s - 0.18) * SR)); // lead the cut slightly
    for (let j = 0; j < buf.length && at + j < n; j++) fx[at + j] += buf[j];
  });

  // ---- text reveals: soft ticks, first beat of a scene louder than the rest
  reveals.forEach((r, i) => {
    const buf = tick({freq: i % 3 === 0 ? 1320 : 1760, amp: i % 3 === 0 ? 0.11 : 0.07});
    const at = Math.max(0, Math.floor(r * SR));
    for (let j = 0; j < buf.length && at + j < n; j++) fx[at + j] += buf[j];
  });

  // ---- outro sting on the last two seconds
  const sting = Math.floor((seconds - 1.55) * SR);
  const notes = mood === 'dark' ? [220, 277.18] : mood === 'story' ? [196.0, 261.63, 392.0] : [293.66, 440];
  notes.forEach((f, k) => {
    const buf = tone({freq: f, dur: 1.5, amp: 0.1, decay: 2.2, harmonics: [1, 0.35, 0.12]});
    const at = sting + Math.floor(k * 0.16 * SR);
    for (let j = 0; j < buf.length && at + j < n; j++) fx[at + j] += buf[j];
  });

  return {bed, fx, n};
}

/* ---------- ducking + write ---------- */

/** Smooth envelope follower so the bed dips under speech without pumping. */
function envelope(v, n) {
  const env = new Float32Array(n);
  let e = 0;
  for (let i = 0; i < n; i++) {
    const x = Math.abs(v[i] || 0);
    e = x > e ? e + (x - e) * 0.02 : e + (x - e) * 0.0006;
    env[i] = e;
  }
  return env;
}

/** Write a 16-bit stereo WAV; `voice` may be null. */
export function writeMix(file, {seconds, bed, fx, voice = null, voiceAmp = 1, bedAmp = 1, fxAmp = 1}) {
  const n = Math.ceil(seconds * SR);
  const env = voice ? envelope(voice, n) : null;
  const data = Buffer.alloc(44 + n * 4);
  data.write('RIFF', 0); data.writeUInt32LE(36 + n * 4, 4); data.write('WAVE', 8);
  data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22); data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
  data.write('data', 36); data.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    // duck: full bed when nobody speaks, -9 dB under speech
    const duck = env ? 1 / (1 + 7 * clamp(env[i] * 3)) : 1;
    let l = (bed[i] || 0) * bedAmp * duck + (fx[i] || 0) * fxAmp;
    let r = l;
    if (voice) {
      const v = (voice[i] || 0) * voiceAmp;
      l += v; r += v;
    }
    // soft clip keeps a loud tick from crackling on phone speakers
    l = Math.tanh(l * 1.1) * 0.92;
    r = Math.tanh(r * 1.1) * 0.92;
    data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(l * 32767))), 44 + i * 4);
    data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(r * 32767))), 46 + i * 4);
  }
  fs.writeFileSync(file, data);
  return file;
}

/** Read a mono 48 kHz float WAV written by ffmpeg (pcm_s16le), used to duck the bed. */
export function readWavMono(file) {
  const buf = fs.readFileSync(file);
  const idx = buf.indexOf(Buffer.from('data'));
  const start = idx + 8;
  const n = Math.floor((buf.length - start) / 2);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = buf.readInt16LE(start + i * 2) / 32768;
  return out;
}
