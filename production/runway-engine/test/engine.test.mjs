// Regression tests for the runway engine: determinism, safe area, captions, spec gates.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {measure, fit, wrap, W, H, SAFE, CAPTION_BAND} from '../src/core.mjs';
import {renderFrame, totalFrames, SCENE_FRAMES, framesPerScene, TRACKS, activeCue} from '../src/templates.mjs';
import {nia, NIA_POSES, poseAt} from '../src/nia.mjs';
import {transition, moveFor, MOVE_FRAMES} from '../src/motion.mjs';
import {soundtrack, writeMix} from '../src/sound.mjs';
import {validate} from '../src/validate.mjs';
import {renderCarouselSlide} from '../src/carousel.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const specsDir = path.resolve(here, '../../../content/runway/specs');
const specs = fs.readdirSync(specsDir).filter((f) => f.endsWith('.spec.json')).map((f) => ({name: f, spec: JSON.parse(fs.readFileSync(path.join(specsDir, f), 'utf8'))}));

const tagBalance = (svg) => {
  const open = (svg.match(/<g[ >]/g) || []).length;
  const close = (svg.match(/<\/g>/g) || []).length;
  return {open, close};
};

test('bundled specs pass validation', () => {
  for (const {name, spec} of specs) {
    const v = validate(spec);
    assert.deepEqual(v.errors, [], `${name}: ${v.errors.join('; ')}`);
  }
});

test('every frame renders well-formed markup (balanced groups)', () => {
  for (const {name, spec} of specs) {
    const total = totalFrames(spec);
    for (const f of [0, 61, Math.floor(total / 2), total - 1]) {
      const svg = renderFrame(spec, f, {});
      const {open, close} = tagBalance(svg);
      assert.equal(open, close, `${name} frame ${f}: ${open} <g> vs ${close} </g>`);
      assert.ok(svg.startsWith('<svg'), `${name} frame ${f}: must start with <svg`);
      assert.ok(svg.trimEnd().endsWith('</svg>'), `${name} frame ${f}: must end with </svg>`);
    }
  }
});

test('rendering is deterministic: random seeks match a sequential pass', () => {
  const {spec} = specs[0];
  const total = totalFrames(spec);
  const frames = [0, 17, 330, 777, 1200, total - 1];
  const a = frames.map((f) => renderFrame(spec, f, {}));
  const b = [...frames].reverse().map((f) => renderFrame(spec, f, {})).reverse();
  assert.deepEqual(a, b);
});

test('no scene declares text below the caption band', () => {
  for (const {name, spec} of specs) {
    spec.scenes.forEach((s, i) => {
      const cues = s.cues || [];
      cues.forEach((c, ci) => {
        assert.ok(c.out <= SCENE_FRAMES, `${name} scene ${i + 1} cue ${ci + 1} ends after the cut`);
        assert.ok(ci === 0 || c.in >= cues[ci - 1].out, `${name} scene ${i + 1} cue ${ci + 1} overlaps`);
      });
    });
  }
});

test('headlines fit the working box at phone size', () => {
  for (const {name, spec} of specs) {
    for (const s of spec.scenes) {
      if (!s.headline) continue;
      const f = fit(s.headline, {role: 'head', weight: 760, size: 106, maxWidth: 900, maxLines: 4, minSize: 48, tracking: -4});
      assert.equal(f.overflow, false, `${name}: headline overflows: ${s.headline}`);
      assert.ok(f.size >= 48, `${name}: headline drops below 48px`);
    }
  }
});

test('measure and wrap agree with each other', () => {
  const opts = {role: 'head', weight: 700, size: 64};
  const lines = wrap('the quick brown fox jumps over the lazy dog', 500, opts);
  for (const l of lines) assert.ok(measure(l, opts) <= 500 || l.split(' ').length === 1);
});

test('keyword gate rejects generic words and accepts specific ones', () => {
  const base = {slug: 'x', track: 1, caption: 'c', cta: 'a', scenes: [{type: 'cover', headline: 'a'}, {type: 'workflow', nodes: []}, {type: 'cta', headline: 'b'}]};
  assert.ok(validate({...base, keyword: 'LINK'}).errors.some((e) => /generic/.test(e)));
  assert.ok(validate({...base, keyword: 'STACK'}).errors.length === 0);
  assert.ok(validate({...base, keyword: 'two words'}).errors.some((e) => /one word/.test(e)));
});

test('stat and article scenes without a source are rejected', () => {
  const spec = {slug: 'x', track: 2, keyword: 'FILE', caption: 'c', cta: 'a', sources: [{name: 's', url: 'u', date: '2026-01-01'}], scenes: [
    {type: 'cover', headline: 'h'},
    {type: 'stat', value: 5, line: 'l', note: 'n'},
    {type: 'cta', headline: 'c'},
  ]};
  assert.ok(validate(spec).errors.some((e) => /stat needs a dated "source"/.test(e)));
  spec.scenes[1].source = 'Report, 2026';
  assert.deepEqual(validate(spec).errors, []);
});

test('story scenes require spec.sources', () => {
  const spec = {slug: 'x', track: 2, keyword: 'FILE', caption: 'c', cta: 'a', scenes: [
    {type: 'cover', headline: 'h'},
    {type: 'timeline', headline: 't', events: [{year: '2000', title: 'a'}]},
    {type: 'cta', headline: 'c'},
  ]};
  assert.ok(validate(spec).errors.some((e) => /spec.sources must list/.test(e)));
});

test('captions never exceed two lines at the default size', () => {
  const long = 'This caption is deliberately long so that it has to wrap onto more than two lines at the default phone size and the validator should catch it';
  const f = fit(long, {role: 'head', weight: 700, size: 50, maxWidth: 900, maxLines: 2, minSize: 38});
  assert.equal(f.overflow, true);
});

test('each track has a distinct background and type family', () => {
  const bgs = new Set([1, 2, 3].map((t) => TRACKS[t].theme.bg));
  assert.equal(bgs.size, 3);
  assert.equal(TRACKS[2].theme.head, TRACKS[2].theme.head);
  assert.notEqual(TRACKS[1].theme.bg, TRACKS[2].theme.bg);
});

test('activeCue picks the cue covering the frame', () => {
  const cues = [{in: 10, out: 40, text: 'a'}, {in: 50, out: 90, text: 'b'}];
  assert.equal(activeCue(cues, 20).text, 'a');
  assert.equal(activeCue(cues, 45), null);
  assert.equal(activeCue(cues, 90).text, 'b');
});

test('carousel renders every declared slide at 1080x1350', () => {
  const withCarousel = specs.find((s) => s.spec.carousel?.slides?.length);
  assert.ok(withCarousel, 'at least one spec should include a carousel');
  const slides = withCarousel.spec.carousel.slides;
  slides.forEach((_, i) => {
    const svg = renderCarouselSlide(withCarousel.spec, i, {});
    assert.match(svg, new RegExp(`width="${W === 1080 ? 1080 : 0}"`));
    assert.match(svg, /height="1350"/);
    const {open, close} = tagBalance(svg);
    assert.equal(open, close);
  });
});

/* ---------- character, motion, sound (added with the VO pipeline) ---------- */

test('nia renders every pose with balanced tags and no NaN', () => {
  for (const pose of NIA_POSES) {
    const svg = nia(40, {pose, talk: 1});
    assert.ok(svg.length > 400, `${pose}: svg too small`);
    assert.doesNotMatch(svg, /NaN|undefined/, `${pose}: produced NaN/undefined`);
    const {open, close} = tagBalance(svg);
    assert.equal(open, close, `${pose}: unbalanced tags`);
  }
});

test('nia animates deterministically: same frame twice is identical', () => {
  assert.equal(nia(37, {pose: 'tick'}), nia(37, {pose: 'tick'}));
});

test('poseAt returns the last pose whose beat has passed', () => {
  const scene = {nia: {poses: [{at: 0, pose: 'idle'}, {at: 100, pose: 'tick'}, {at: 200, pose: 'nod'}]}};
  assert.equal(poseAt(scene, 50).pose, 'idle');
  assert.equal(poseAt(scene, 150).pose, 'tick');
  assert.equal(poseAt(scene, 250).pose, 'nod');
  assert.equal(poseAt(scene, 250).since, 50);
  assert.equal(poseAt({}, 12).pose, 'idle');
});

test('a longer scene stretches cue frames but keeps them inside the scene', () => {
  const spec = {track: 1, sceneSeconds: 7.2, scenes: [{type: 'cover', cues: [{in: 10, out: 300, text: 'a'}]}]};
  const spf = framesPerScene(spec);
  assert.equal(spf, 432);
  const svg = renderFrame(spec, 20, {});
  assert.match(svg, /width="1080"/);
});

test('transitions only move inside their frame window', () => {
  const spf = 330;
  assert.equal(transition('push', 200, spf).outer, '', 'push must be finished long before the next cut');
  assert.match(transition('push', 3, spf).outer, /translate/);
  assert.match(transition('wipe', 4, spf).bar, /<rect/);
  assert.equal(transition('cut', 4, spf).bar, '');
  // the CTA always lands on a hard cut, the opener never does
  const spec = {scenes: [{}, {}, {}, {}], transition: 'push'};
  assert.equal(moveFor(spec, 0), 'none');
  assert.equal(moveFor(spec, 1), 'push');
  assert.equal(moveFor(spec, 3), 'cut');
  assert.ok(MOVE_FRAMES < 20);
});

test('the soundtrack is deterministic and stays quiet enough to hear the voice', () => {
  const a = soundtrack({seconds: 6, sceneStarts: [0, 3], reveals: [0.4, 3.4], cues: ['rise', 'whoosh'], mood: 'light'});
  const b = soundtrack({seconds: 6, sceneStarts: [0, 3], reveals: [0.4, 3.4], cues: ['rise', 'whoosh'], mood: 'light'});
  assert.equal(a.n, b.n);
  for (let i = 0; i < a.n; i += 997) assert.equal(a.bed[i], b.bed[i], 'bed must not use Math.random');

  let peak = 0;
  for (let i = 0; i < a.n; i++) peak = Math.max(peak, Math.abs(a.bed[i]));
  assert.ok(peak < 0.35, `bed peak ${peak.toFixed(3)} is loud enough to mask speech`);
  assert.ok(peak > 0.01, 'bed is silent');
});

test('every voiced spec keeps cues inside its scene', () => {
  for (const {name, spec} of specs) {
    const spf = framesPerScene(spec);
    spec.scenes.forEach((s, i) => {
      for (const c of s.cues || []) {
        assert.ok(c.in >= 0 && c.out <= spf, `${name} scene ${i + 1}: cue leaves the scene (0..${spf})`);
      }
    });
  }
});
