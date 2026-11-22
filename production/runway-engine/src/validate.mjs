// Deterministic pre-flight checks. A spec that fails here should not be rendered.
import fs from 'node:fs';
import path from 'node:path';
import {measure, fit, SAFE} from './core.mjs';
import {SCENE_FRAMES, framesPerScene, totalFrames} from './templates.mjs';

const TYPES = {
  1: ['cover', 'clip', 'workflow', 'table', 'stat', 'checklist', 'cta'],
  2: ['cover', 'clip', 'article', 'timeline', 'chart', 'quote', 'stat', 'cta'],
  3: ['cover', 'compare', 'bars', 'demo', 'roi', 'checklist', 'cta'],
  4: ['cover', 'face', 'card', 'stack', 'tally', 'cta'],
  // track 5 is driven by `mode` (hook · ui · stat · cta), so every beat is a valid card type
  5: ['cover', 'clip', 'demo', 'stat', 'cta'],
};

/** Words that are too generic to gate a DM on (the "type a comment" CTA). */
const GENERIC = new Set(['link', 'info', 'more', 'dm', 'yes', 'send', 'hi', 'hey', 'nice', 'wow', 'me', 'help', 'give', 'now']);

const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

/** Reading speed for burned-in captions; Swahili and English both sit near 3.0–4.2 wps. */
const MAX_WPS = 4.4;

export function validate(spec) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  if (!spec.slug) err('missing slug (used for the output folder)');
  if (![1, 2, 3, 4, 5].includes(spec.track)) err('track must be 1–5');
  const allowed = TYPES[spec.track] || [];
  if (!Array.isArray(spec.scenes) || !spec.scenes.length) err('no scenes');
  else {
    if (spec.scenes.length < 3) err('need at least 3 scenes (hook / body / CTA)');
    if (spec.scenes.length > 10) err('keep a Reel to 10 scenes or fewer');
    if (totalFrames(spec) > 60 * 60) warn('over 60s; keep episodes 25–55s unless the brief says otherwise');
    if (spec.scenes[0].type !== 'cover') err('scene 1 must be type "cover"');
    if (spec.scenes[spec.scenes.length - 1].type !== 'cta') warn('last scene is not a "cta"; state the keyword and the payoff on the last card');
  }

  if (!spec.keyword) err('missing keyword (one word the viewer comments)');
  else {
    const k = String(spec.keyword).trim();
    if (/\s/.test(k)) err(`keyword "${k}" must be one word`);
    if (GENERIC.has(k.toLowerCase())) err(`keyword "${k}" is generic; pick a word a person would not type by accident (e.g. STACK, FLOW, SHEET)`);
    if (k !== k.toUpperCase()) warn('keyword should be upper case so on-screen, spoken and DM copy match');
  }

  (spec.scenes || []).forEach((s, i) => {
    const where = `scene ${i + 1} (${s.type || 'no type'})`;
    // the character is drawn in a 200x200 box; its feet must clear the caption band
    if (s.nia?.y != null) {
      const feet = s.nia.y + 130 * (s.nia.scale ?? 0.9);
      if (feet > 1462 && !s.captionsOverCharacter) {
        warn(`${where}: character feet at y=${Math.round(feet)} overlap the caption band (1470); move nia.y up`);
      }
    }
    if (!allowed.includes(s.type)) err(`${where}: type must be one of ${allowed.join(', ')}`);
    if (s.type === 'cover' || s.type === 'clip' || s.type === 'article' || s.type === 'compare' || s.type === 'demo') {
      if (s.headline && words(s.headline) > 14) warn(`${where}: headline is ${words(s.headline)} words; hooks read best at 4–10`);
    }
    if (s.type === 'stat') {
      if (typeof s.value !== 'number') err(`${where}: stat needs a numeric "value"`);
      if (!s.source) err(`${where}: a stat needs a dated "source" caption; never ship an unsourced number`);
      if (!s.note) warn(`${where}: add a note that says what the number is not`);
    }
    if (s.type === 'article' && !s.source) err(`${where}: article needs a "source" (outlet + date)`);
    if (s.type === 'chart') {
      const vals = (s.series || []).map((p) => p.value);
      if (vals.length < 3) err(`${where}: chart needs 3+ points`);
      if (vals.some((v) => typeof v !== 'number')) err(`${where}: every series point needs a numeric value`);
      if (!s.source) warn(`${where}: chart without a source line`);
    }
    if (s.type === 'timeline' || s.type === 'chart' || s.type === 'article') {
      // stories must be checkable: require a sources list on the spec
      if (!Array.isArray(spec.sources) || !spec.sources.length) err(`${where}: spec.sources must list the dated primary sources for this episode`);
    }
    // track 5's demo beat is a drawn UI card, not a screen capture, so it needs no clip
    if ((s.type === 'clip' || s.type === 'demo') && !(spec.track === 5 && s.ui)) {
      const c = spec.clips?.[s.clip];
      if (!c) err(`${where}: clip "${s.clip}" is not defined in clips{}`);
      else {
        if (!c.credit) err(`${where}: clip "${s.clip}" needs a credit line (author · source · license)`);
        if (c.image && !fs.existsSync(path.resolve(c.image))) err(`${where}: clip image not found: ${c.image}`);
      }
    }
    if (s.type === 'compare' && (!s.columns || s.columns.length < 2)) err(`${where}: compare needs 2+ columns`);

    // caption timing
    const cues = s.cues || [];
    let last = -1;
    cues.forEach((c, ci) => {
      if (typeof c.in !== 'number' || typeof c.out !== 'number') err(`${where}: cue ${ci + 1} needs numeric in/out frames`);
      if (c.in >= c.out) err(`${where}: cue ${ci + 1} ends before it starts`);
      if (c.in < last) err(`${where}: cue ${ci + 1} overlaps the previous cue`);
      // a flat reel authors cues on a 5.5s grid; a story beat has its own hook, so the
      // clamp is the scale factor for that specific scene
      const limit = Array.isArray(spec.sceneHooks)
        ? Math.round(spec.sceneHooks[i] * 60) - 4
        : SCENE_FRAMES - 6;
      if (c.out > limit) warn(`${where}: cue ${ci + 1} runs into the scene cut (${c.out} > ${limit})`);
      last = c.out;
      const f = fit(c.text, {role: 'head', weight: 700, size: 50, maxWidth: 900, maxLines: 2, minSize: 38});
      if (f.overflow) err(`${where}: cue ${ci + 1} is too long for two lines at phone size: "${c.text}"`);
      const wps = words(c.text) / ((c.out - c.in) / 60);
      if (wps > MAX_WPS) warn(`${where}: cue ${ci + 1} reads at ${wps.toFixed(1)} words/s; slow the read or shorten it`);
      if (/\?$/.test(String(c.text).trim())) warn(`${where}: cue ${ci + 1} ends on a question; the research on this account shows caption questions underperform. State the value instead.`);
    });
    if (!cues.length && s.type !== 'cover') warn(`${where}: no cues (silent card). Fine for a b-roll card, not for a narrated beat.`);
  });

  // every keyword that appears anywhere should be the approved one
  const kw = String(spec.keyword || '');
  for (const s of spec.scenes || []) {
    const shown = [s.keyword, s.keywordFooter].filter(Boolean);
    for (const k of shown) if (k !== kw) err(`scene keyword "${k}" does not match spec.keyword "${kw}"`);
  }
  if (spec.brand?.handle && !/^@/.test(spec.brand.handle)) err('brand.handle must start with @');
  // safe-area sanity: no scene may declare a headline longer than the box can hold
  for (const s of spec.scenes || []) {
    if (s.headline) {
      const f = fit(s.headline, {role: 'head', weight: 760, size: 106, maxWidth: 900, maxLines: 4, minSize: 48, tracking: -4});
      if (f.overflow) err(`headline overflows four lines even at 48px: "${s.headline}"`);
    }
  }
  if (!spec.caption) warn('no caption text on the spec; the Instagram caption is part of the deliverable');
  if (!spec.cta) warn('no cta block; write the delivery step (ManyChat keyword → file) before publishing');

  return {ok: errors.length === 0, errors, warnings};
}
