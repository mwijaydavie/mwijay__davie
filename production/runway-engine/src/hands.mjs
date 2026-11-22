// Gesture sheets: six hands rendered in the character's own style (same skin, same cuff,
// same light) and cut off white with tools/cut_white.py. The vector rig that used to live
// here could not hold up next to a photographic character, so it is kept only as a
// fallback for a gesture with no sheet.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {round, clamp} from './core.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '../assets/character');

/** Gesture → sheet. `aspect` is width/height of the cut, used for sizing. */
export const GESTURES = {
  open:  {file: 'hand-open-cut.png'},
  palm:  {file: 'hand-open-cut.png'},
  wave:  {file: 'hand-open-cut.png', tick: 14},
  point: {file: 'hand-point-cut.png'},
  peace: {file: 'hand-peace-cut.png'},
  like:  {file: 'hand-like-cut.png', thumb: true},
  ok:    {file: 'hand-ok-cut.png'},
  pray:  {file: 'hand-pray-cut.png'},
};

const cache = new Map();
function data(file) {
  if (cache.has(file)) return cache.get(file);
  const p = path.join(DIR, file);
  const uri = fs.existsSync(p) ? `data:image/png;base64,${fs.readFileSync(p).toString('base64')}` : null;
  cache.set(file, uri);
  return uri;
}
export const handNames = () => Object.keys(GESTURES);

/**
 * Draw a gesture at (x, y) in frame pixels. `h` is the hand's height; the anchor is the
 * bottom-centre of the sheet, i.e. the cuff, so it joins the sleeve.
 *
 * A still hand reads as a sticker, so every gesture gets a slow wrist rock: `tick` degrees
 * for a wave (it has to wave), 1.6 for everything else. The rock is a rotation about the
 * cuff, which is exactly where a real wrist pivots.
 */
export function hand(name, x, y, {
  h = 340, angle = 0, t = 0, flip = false, o = 1, tick = null, enter = true,
} = {}) {
  const g = GESTURES[name] || GESTURES.open;
  const src = data(g.file);
  if (!src) return '';
  const tsec = t / 60;
  const amp = tick != null ? tick : (g.tick != null ? g.tick : 1.6);
  const rock = Math.sin(tsec * Math.PI * 2 * (g.tick ? 0.9 : 0.42)) * amp;
  const w = h * (g.file.includes('pray') ? 0.81 : 0.58);
  const sx = flip ? -1 : 1;
  const pop = enter ? easeOut(clamp(t / 14)) : 1;
  return `<g transform="translate(${round(x)} ${round(y)}) scale(${sx} 1) rotate(${round(angle + rock)})" opacity="${round(clamp(o * pop))}">
    <image href="${src}" x="${round(-w / 2)}" y="${round(-h)}" width="${round(w)}" height="${round(h)}" preserveAspectRatio="xMidYMax meet"/>
  </g>`;
}

const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
