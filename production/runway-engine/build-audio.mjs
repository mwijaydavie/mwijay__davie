#!/usr/bin/env node
// Voice-over + soundtrack for one Reel, built from a vo.json manifest.
//
//   node build-audio.mjs <spec.slug>                 # read content/runway/specs/<slug>.spec.json
//   node build-audio.mjs <slug> --mood dark
//
// Why a manifest: a spec stores what is on screen; vo.json stores what is said and when.
// Keeping them separate means the voice can be re-cut (new take, new language, owner's own
// recording) without touching the visuals, and the spec validator stays about layout.
//
// Clips may be mp3, wav or m4a. ffmpeg normalises each one to 48 kHz mono and measures its
// spoken length, so a long take pushes the cue and the scene boundary instead of overlapping.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {soundtrack, writeMix, readWavMono, SR} from './src/sound.mjs';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '../..');
const FPS = 60;

const ff = () => require('@ffmpeg-installer/ffmpeg').path;

const slug = process.argv[2];
if (!slug) {
  console.error('usage: node build-audio.mjs <slug> [--mood light|dark|idea] [--dry]');
  process.exit(1);
}
const flag = (name, def = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? def : (process.argv[i + 1] ?? true);
};

const specPath = path.join(REPO, 'content/runway/specs', `${slug}.spec.json`);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const dir = path.join(REPO, 'out/runway', slug);
fs.mkdirSync(dir, {recursive: true});

// The manifest is committed next to the specs: it is the only record of what is said, when.
const voPath = path.join(REPO, 'content/runway/specs/vo', `${slug}.vo.json`);
if (!fs.existsSync(voPath)) throw new Error(`missing ${path.relative(REPO, voPath)} (see production/runway-engine/voice/README.md)`);
const vo = JSON.parse(fs.readFileSync(voPath, 'utf8'));

const mood = flag('mood', vo.mood || (spec.track === 2 ? 'dark' : spec.track === 3 ? 'idea' : spec.track === 4 ? 'story' : 'light'));

/** Spoken length of a clip after normalisation (trailing silence trimmed to 120 ms). */
function clipInfo(file) {
  const out = path.join(dir, 'build', path.basename(file).replace(/\.[^.]+$/, '') + '.f32.wav');
  fs.mkdirSync(path.dirname(out), {recursive: true});
  // A narrator who reads at 1.1 words/s makes a 45s story into a 70s one. `pace` stretches
  // time without moving pitch, so the words stay hers and the cut stays fast.
  const pace = vo.pace && vo.pace !== 1 ? `atempo=${vo.pace.toFixed(3)},` : '';
  const r = spawnSync(ff(), [
    '-y', '-hide_banner', '-loglevel', 'error', '-i', file,
    '-af', `${pace}silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_len=5760`,
    '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', out,
  ], {encoding: 'utf8'});
  if (r.status !== 0) throw new Error(`ffmpeg failed on ${file}: ${r.stderr}`);
  const pcm = readWavMono(out);
  return {pcm, seconds: pcm.length / SR, wav: out};
}


/**
 * Scene boundaries in seconds.
 * A reel whose scenes share one length (tracks 1-3) uses the flat model: every scene is
 * `sceneSeconds`, so `framesPerScene(spec)` can stretch cue frames with one multiplier.
 * A story reel (vo.scenes) gives each beat its own hook, because a 2-word turn and a
 * 12-word reveal do not deserve the same screen time.
 */
function sceneLayout() {
  if (!Array.isArray(vo.scenes)) {
    const len = vo.sceneSeconds ?? 5.5;
    return {flat: len, hooks: vo.clips.map((_, i) => i).map(() => null).length ? null : null,
            start: (n) => (n - 1) * len, length: () => len, count: null};
  }
  const starts = [];
  let cursor = 0;
  for (const s of vo.scenes) {
    starts.push(cursor);
    cursor += s.hook;
  }
  const lengths = vo.scenes.map((s) => s.hook);
  return {
    flat: null,
    starts,
    lengths,
    count: vo.scenes.length,
    start: (n) => starts[n - 1] ?? 0,
    length: (n) => lengths[n - 1] ?? 0,
  };
}
const layout = sceneLayout();

/**
 * Lay the clips out. Each clip waits for its scene's earliest start, and a clip that runs
 * long pushes the next one — and, if needed, the scene boundary itself.
 */
function schedule() {
  const lead = vo.lead ?? 0.35;              // silence before the first word
  const gap = vo.gap ?? 0.22;                // air between two clips in the same scene
  const sceneSlack = vo.sceneSlack ?? 0.55;  // how much a scene may grow past its nominal length
  const sceneLenForLayout = vo.sceneSeconds ?? 5.5;
  // A "spaced" scene starts where the previous clip ended instead of snapping to the grid,
  // so three short chips (who / what / how much) stay one beat instead of becoming 3 scenes.
  // A spaced scene starts on the grid when the reel is opening, and then runs straight on
  // from the previous dialogue, so a second pass lands later in time rather than earlier.
  const spacedUntil = vo.spacedThrough ?? 0;
  const rows = [];
  let sceneNo = 0;
  let cursor = lead;
  let sceneStart = 0;

  for (const clip of vo.clips) {
    const info = vo.cache?.[clip.file]
      ? {seconds: vo.cache[clip.file].seconds, pcm: null}
      : clipInfo(path.resolve(REPO, clip.file));
    if (clip.scene !== sceneNo) {
      sceneNo = clip.scene;
      const nominal = layout.start(sceneNo);
      sceneStart = sceneNo <= spacedUntil ? Math.max(nominal, cursor + gap) : cursor + gap;
      cursor = sceneStart + lead;
      rows.push({kind: 'scene', scene: sceneNo, at: sceneStart});
    } else {
      cursor += gap;
    }
    const at = Math.max(cursor, sceneStart + lead);
    rows.push({kind: 'clip', scene: sceneNo, file: clip.file, at, seconds: info.seconds, text: clip.text, pcm: info.pcm});
    cursor = at + info.seconds;
    if (!layout.count && cursor - sceneStart > Math.min(vo.maxSceneSeconds ?? 7.4, (vo.sceneSeconds ?? 5.5) + sceneSlack + 1.5)) {
      console.warn(`scene ${sceneNo}: ${(cursor - sceneStart).toFixed(2)}s of dialogue — trim the ` +
                   `read or the scene will hit the ${vo.maxSceneSeconds ?? 7.4}s cap`);
    }
  }
  return rows;
}

const rows = schedule();
const clips = rows.filter((r) => r.kind === 'clip');
const sceneRows = rows.filter((r) => r.kind === 'scene');

// Scene length comes from the dialogue itself: the longest scene sets the slot for all of
// them, so a scene never holds a long silent tail and the reel does not slowly drift.
const lastClipEnd = clips.length ? clips.at(-1).at + clips.at(-1).seconds : 0;
const tail = vo.tail ?? 1.1;
let sceneSeconds = vo.sceneSeconds ?? 5.5;
let seconds;
if (layout.count) {
  // Per-scene hooks. Solve twice: the first pass sizes each beat to its dialogue, the
  // second pass re-places the clips on the final boundaries so no cue can land outside
  // its own scene (a beat that grows pushes everything after it).
  const lead = vo.lead ?? 0.35;
  const gap = vo.gap ?? 0.22;
  const byScene = (n) => clips.filter((k) => k.scene === n);
  const needFor = (n) => {
    const mine = byScene(n);
    if (!mine.length) return layout.lengths[n - 1] ?? 5.5;
    const speech = mine.reduce((a, c) => a + c.seconds, 0) + gap * (mine.length - 1);
    return Math.ceil((lead + speech + 0.3) * 10) / 10;
  };
  const finals = layout.lengths.map((hook, i) => Math.max(hook, needFor(i + 1)));
  // The reel must be exactly as long as its mix. A flat reel gets that from `tail`; here the
  // tail becomes a hold on the final card, which is what a story wants to end on anyway.
  finals[finals.length - 1] = finals.at(-1);
  layout.starts.length = 0;
  let acc = 0;
  for (const h of finals) { layout.starts.push(acc); acc += h; }
  layout.lengths = finals;
  // place clips on the final boundaries
  for (const c of clips) {
    const mine = byScene(c.scene);
    const i = mine.indexOf(c);
    c.at = i === 0 ? layout.start(c.scene) + lead : mine[i - 1].at + mine[i - 1].seconds + gap;
  }
  // A beat's own hook must cover its dialogue; re-solve once with the clips actually placed,
  // so `seconds` (the mix) and sum(sceneHooks) (the frames) cannot disagree.
  const recheck = layout.lengths.map((h, i) => {
    const mine = byScene(i + 1);
    if (!mine.length) return h;
    const end = mine.at(-1).at + mine.at(-1).seconds;
    return Math.max(h, Math.ceil((end - layout.starts[i] + 0.35) * 10) / 10);
  });
  layout.starts.length = 0;
  let acc2 = 0;
  for (const h of recheck) { layout.starts.push(acc2); acc2 += h; }
  layout.lengths = recheck;
  for (const c of clips) {
    const mine = byScene(c.scene);
    const i = mine.indexOf(c);
    c.at = i === 0 ? layout.start(c.scene) + lead : mine[i - 1].at + mine[i - 1].seconds + gap;
  }
  for (const r of sceneRows) r.at = layout.start(r.scene);
  for (const r of sceneRows) r.at = layout.start(r.scene);
  seconds = Math.round(acc2 * 10) / 10;
  sceneSeconds = null;
} else {
  for (const c of sceneRows) {
    const inScene = clips.filter((k) => k.scene === c.scene);
    if (!inScene.length) continue;
    const span = inScene.at(-1).at + inScene.at(-1).seconds - (c.scene - 1) * sceneSeconds;
    sceneSeconds = Math.max(sceneSeconds, Math.ceil((span + 0.35) * 10) / 10);
  }
  sceneSeconds = Math.min(vo.maxSceneSeconds ?? 7.4, sceneSeconds);
  seconds = Math.round((spec.scenes.length * sceneSeconds + tail) * 10) / 10;
}

// place clips into one 48 kHz buffer, pads trimmed to the actual voice
const total = Math.ceil(seconds * SR);
const voice = new Float32Array(total);
const placed = [];
for (const c of clips) {
  const at = Math.round(c.at * SR);
  const pcm = c.pcm || [];
  for (let i = 0; i < pcm.length && at + i < total; i++) voice[at + i] += pcm[i];
  placed.push({scene: c.scene, file: c.file, at: +c.at.toFixed(3), seconds: +c.seconds.toFixed(3), text: c.text || ''});
}

// transitions: one cue per scene change; reveals: one tick per clip start
const sceneStarts = sceneRows.map((r) => layout.start(r.scene));
const cues = sceneStarts.map((_, i) => (i === 0 ? 'rise' : vo.cues?.[i] || 'whoosh'));
const reveals = clips.map((c) => c.at);

const {bed, fx} = soundtrack({seconds, sceneStarts, reveals, cues, mood});
const outWav = path.join(dir, 'mix.wav');
writeMix(outWav, {seconds, bed, fx, voice});

const audio = {
  slug,
  mood,
  ...(layout.count ? {sceneHooks: layout.lengths} : {sceneSeconds}),
  seconds,
  scenes: spec.scenes.length,
  voice: vo.voice || null,
  voiceId: vo.voiceId || null,
  clips: placed,
};

fs.writeFileSync(path.join(dir, 'audio.json'), JSON.stringify(audio, null, 2) + '\n');

// The spec needs the new scene length *and* the measured cue windows before the video
// renders: captions must appear with the voice, not with the frame numbers guessed by hand.
const specOut = JSON.parse(fs.readFileSync(specPath, 'utf8'));
if (layout.count) {
  specOut.sceneHooks = layout.lengths;
  delete specOut.sceneSeconds;
} else {
  specOut.sceneSeconds = sceneSeconds;
  // A flat reel keeps ONE scene length. A leftover per-scene hook array from an earlier
  // pass would silently win over sceneSeconds and cut the picture short of the voice.
  delete specOut.sceneHooks;
}
specOut.audio = {mix: path.relative(REPO, outWav), seconds, voice: vo.voice, voiceId: vo.voiceId || null};
const startOf = (n) => layout.start(n);
// Cues come from the mix: a caption may not appear before its line or outlive it.
for (let i = 0; i < specOut.scenes.length; i++) {
  const mine = clips.filter((c) => c.scene === i + 1);
  if (!mine.length) { delete specOut.scenes[i].cues; continue; }
  specOut.scenes[i].cues = mine.map((c) => ({
    in: Math.max(0, Math.round((c.at - startOf(c.scene) - 0.06) * 60)),
    out: Math.min(Math.round(layout.length(c.scene) * 60) - 4, Math.round((c.at + c.seconds - startOf(c.scene) + 0.06) * 60)),
    text: c.text || '',
  }));
}
fs.writeFileSync(specPath, JSON.stringify(specOut, null, 2) + '\n');

console.log(`${path.relative(REPO, outWav)}  ${seconds.toFixed(1)}s  ${placed.length} clips  ` +
  (layout.count ? `beats ${layout.lengths.map((h) => h.toFixed(1)).join(' / ')}s` : `scene ${sceneSeconds}s`));
if (clips.some((c) => !c.pcm && !vo.cache)) console.log('note: clips were re-measured, not re-used');
if (flag('dry')) fs.rmSync(outWav);
