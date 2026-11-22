#!/usr/bin/env node
// CLI for the 3-track runway engine.
//   node src/cli.mjs check    <spec.json>
//   node src/cli.mjs stills   <spec.json> [--frames 90,420,...] [--name f]
//   node src/cli.mjs video    <spec.json> [--limit N] [--from A --to B]
//   node src/cli.mjs carousel <spec.json>
//   node src/cli.mjs sheet    <spec.json>
//   node src/cli.mjs list
// Outputs go to out/runway/<slug>/ (gitignored).
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {Resvg} from '@resvg/resvg-js';
import {W, H, FPS, readImage, measure, fit, round} from './core.mjs';
import {renderFrame, totalFrames, SCENE_FRAMES, framesPerScene, TRACKS} from './templates.mjs';
import {renderCarouselSlide, carouselSize} from './carousel.mjs';
import {validate} from './validate.mjs';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '../..', '..');

const args = process.argv.slice(2);
const cmd = args[0];
const specPath = args.find((a, i) => i > 0 && !a.startsWith('--'));
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};

function loadSpec(p) {
  const abs = path.resolve(p);
  if (!fs.existsSync(abs)) throw new Error(`spec not found: ${p}`);
  const spec = JSON.parse(fs.readFileSync(abs, 'utf8'));
  spec.__file = abs;
  spec.brand = {handle: '@mwijay__davie', ...(spec.brand || {})};
  return spec;
}

function assets(spec) {
  const images = {};
  if (spec.cover) images.cover = readImage(spec.cover);
  for (const [k, v] of Object.entries(spec.clips || {})) {
    if (v?.image) images[k] = readImage(v.image);
  }
  const mark = readImage(spec.mark || 'content/assets/altraware-mark.png');
  return {images, mark};
}

// Text is emitted as vector glyph paths, so the rasteriser never resolves fonts.
// That keeps every still and frame identical on any machine.
const renderPng = (svg, width = W) => {
  const r = new Resvg(svg, {
    font: {loadSystemFonts: false},
    fitTo: {mode: 'width', value: width},
    background: '#00000000',
  });
  return r.render().asPng();
};

/** Raw RGBA frame for the encoder pipe (skips PNG encoding). */
const renderRaw = (svg) => new Resvg(svg, {font: {loadSystemFonts: false}, fitTo: {mode: 'width', value: W}}).render().pixels;

function outDir(spec) {
  const slug = spec.slug || path.basename(spec.__file, '.json');
  const dir = path.resolve(REPO, 'out/runway', slug);
  fs.mkdirSync(dir, {recursive: true});
  return {slug, dir};
}

function framesArg(spec) {
  const raw = flag('frames');
  if (raw) return raw.split(',').map((n) => parseInt(n.trim(), 10)).filter(Number.isFinite);
  // one still in the middle of every scene, plus the hook hold of scene 1
  const out = [120];
  const total = totalFrames(spec);
  const spf = framesPerScene(spec);
  for (let i = 0; i < spec.scenes.length; i++) out.push(i * spf + Math.round(spf * 0.64));
  out.push(total - 1);
  return [...new Set(out)].filter((f) => f >= 0 && f < total);
}

const srtTime = (frame) => {
  const ms = Math.round((frame / FPS) * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const ms3 = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms3).padStart(3, '0')}`;
};

function writeSrt(spec, dir) {
  const lines = [];
  let n = 0;
  // cues are authored in frames of a 5.5s scene; a longer scene stretches them with it
  const spf = framesPerScene(spec);
  const k = spf / SCENE_FRAMES;
  spec.scenes.forEach((scene, i) => {
    for (const c of scene.cues || []) {
      const a = i * spf + Math.round(c.in * k);
      const b = i * spf + Math.round(c.out * k);
      n += 1;
      lines.push(String(n), `${srtTime(a)} --> ${srtTime(b)}`, c.text, '');
    }
  });
  fs.writeFileSync(path.join(dir, 'captions.srt'), lines.join('\n'), 'utf8');
  return n;
}

function writeCueSheet(spec, dir) {
  const spf = framesPerScene(spec);
  const rows = spec.scenes.map((s, i) => {
    const start = (i * spf) / FPS;
    const end = ((i + 1) * spf) / FPS;
    return {
      scene: i + 1,
      start: `${start.toFixed(2)}s`,
      end: `${end.toFixed(2)}s`,
      type: s.type,
      headline: s.headline || s.text || '',
      read: (s.cues || []).map((c) => c.text).join(' / '),
    };
  });
  fs.writeFileSync(path.join(dir, 'cue-sheet.json'), JSON.stringify({slug: spec.slug, track: spec.track, keyword: spec.keyword, rows}, null, 2));
  return rows;
}

function ffmpegPath() {
  const p = require('@ffmpeg-installer/ffmpeg').path;
  if (!fs.existsSync(p)) throw new Error('ffmpeg binary missing; run npm install');
  return p;
}

async function main() {
  if (cmd === 'list') {
    const dir = path.resolve(REPO, 'content/runway');
    const files = [];
    for (const track of fs.readdirSync(dir)) {
      const d = path.join(dir, track);
      if (!fs.statSync(d).isDirectory()) continue;
      for (const f of fs.readdirSync(d)) if (f.endsWith('.spec.json')) files.push(path.join(d, f));
    }
    for (const f of files) {
      const s = JSON.parse(fs.readFileSync(f, 'utf8'));
      const v = validate(s);
      console.log(`${v.ok ? 'OK  ' : 'FAIL'}  ${s.slug.padEnd(28)} track ${s.track}  ${s.scenes.length} scenes  ${(totalFrames(s) / FPS).toFixed(1)}s  ${path.relative(REPO, f)}`);
    }
    return;
  }
  if (!specPath) throw new Error('usage: node src/cli.mjs <check|stills|video|carousel|sheet> <spec.json>');
  const spec = loadSpec(specPath);
  const v = validate(spec);
  if (cmd === 'check') {
    console.log(JSON.stringify({slug: spec.slug, track: spec.track, ok: v.ok, errors: v.errors, warnings: v.warnings, scenes: spec.scenes.length, seconds: round(totalFrames(spec) / FPS)}, null, 2));
    process.exitCode = v.ok ? 0 : 1;
    return;
  }
  if (!v.ok) {
    console.error('spec has errors; fix them before rendering:\n' + v.errors.map((e) => ` - ${e}`).join('\n'));
    process.exitCode = 1;
    return;
  }
  const {images, mark} = assets(spec);
  const {slug, dir} = outDir(spec);

  if (cmd === 'stills') {
    const frames = framesArg(spec);
    const sdir = path.join(dir, 'stills');
    fs.mkdirSync(sdir, {recursive: true});
    const safe = frames.filter((f) => f >= 0 && f < totalFrames(spec));
    if (safe.length !== frames.length) console.warn(`skipped ${frames.length - safe.length} frame(s) outside 0..${totalFrames(spec) - 1}`);
    for (const f of safe) {
      const png = renderPng(renderFrame(spec, f, {mark, images}));
      const file = path.join(sdir, `f${String(f).padStart(5, '0')}.png`);
      fs.writeFileSync(file, png);
      console.log(`${path.relative(REPO, file)}  ${(png.length / 1024).toFixed(0)} KB`);
    }
    console.log(`\n${safe.length} stills · ${slug}`);
    return;
  }

  if (cmd === 'carousel') {
    const slides = spec.carousel?.slides || [];
    if (!slides.length) throw new Error('spec has no carousel.slides');
    const cdir = path.join(dir, 'carousel');
    fs.mkdirSync(cdir, {recursive: true});
    const {width, height} = carouselSize();
    slides.forEach((slide, i) => {
      const svg = renderCarouselSlide(spec, i, {mark, images});
      const png = renderPng(svg, width);
      const file = path.join(cdir, `slide-${String(i + 1).padStart(2, '0')}.png`);
      fs.writeFileSync(file, png);
      console.log(`${path.relative(REPO, file)}  ${width}x${height}  ${(png.length / 1024).toFixed(0)} KB`);
    });
    console.log(`\n${slides.length} slides · ${slug}`);
    return;
  }

  if (cmd === 'sheet') {
    const frames = framesArg(spec).slice(0, 6);
    const thumbs = frames.map((f) => renderPng(renderFrame(spec, f, {mark, images})));
    const tw = 300;
    const th = (H / W) * tw;
    const cols = Math.min(3, thumbs.length);
    const rows = Math.ceil(thumbs.length / cols);
    const sheetW = cols * tw + (cols + 1) * 16;
    const sheetH = rows * th + (rows + 1) * 16;
    const imgs = thumbs
      .map((b, i) => {
        const x = 16 + (i % cols) * (tw + 16);
        const y = 16 + Math.floor(i / cols) * (th + 16);
        return `<image href="data:image/png;base64,${b.toString('base64')}" x="${x}" y="${y}" width="${tw}" height="${th}"/>`;
      })
      .join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}"><rect width="100%" height="100%" fill="#22252E"/>${imgs}</svg>`;
    const file = path.join(dir, 'contact-sheet.png');
    fs.writeFileSync(file, renderPng(svg, sheetW));
    console.log(`${path.relative(REPO, file)}  ${sheetW}x${sheetH}`);
    return;
  }

  if (cmd === 'video') {
    const total = totalFrames(spec);
    const from = parseInt(flag('from', '0'), 10);
    const to = Math.min(total, parseInt(flag('to', String(total)), 10));
    const limit = flag('limit') ? parseInt(flag('limit'), 10) : null;
    const end = limit ? Math.min(to, from + limit) : to;
    const name = flag('name', `${slug}.mp4`);
    const out = path.join(dir, name);
    const ff = ffmpegPath();
    writeSrt(spec, dir);
    writeCueSheet(spec, dir);
    // A spec with an audio mix gets a second input and an AAC track; without one the reel
    // stays silent rather than carrying a fake bed that will not match the voice.
    const mixPath = spec.audio?.mix ? path.resolve(REPO, spec.audio.mix) : null;
    const hasAudio = mixPath && fs.existsSync(mixPath);
    const inputArgs = ['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-'];
    if (hasAudio) inputArgs.push('-i', mixPath);
    const outArgs = hasAudio
      ? ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
         '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out]
      : ['-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
         '-movflags', '+faststart', out];
    const ffm = spawn(ff, ['-y', '-hide_banner', '-loglevel', 'error', ...inputArgs, ...outArgs],
      {stdio: ['pipe', 'inherit', 'inherit']});
    const done = new Promise((res, rej) => {
      ffm.on('error', rej);
      ffm.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))));
    });
    for (let f = from; f < end; f++) {
      const raw = renderRaw(renderFrame(spec, f, {mark, images}));
      if (!ffm.stdin.write(raw)) await new Promise((r) => ffm.stdin.once('drain', r));
      if ((f - from) % 120 === 0) process.stdout.write(`\r frame ${f - from + 1}/${end - from}`);
    }
    ffm.stdin.end();
    await done;
    writeSrt(spec, dir);
    writeCueSheet(spec, dir);
    console.log(`\n${path.relative(REPO, out)}  ${end - from} frames @ ${FPS}fps`);
    return;
  }

  throw new Error(`unknown command ${cmd}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exitCode = 1;
});
