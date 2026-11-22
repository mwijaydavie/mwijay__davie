// Zuri — the Altraware house character.
//
// A young woman in a soft periwinkle turtleneck, two long braids, chunky silver
// hoops and a stud above her lip. She is a photographic cut-out on a pure-white
// studio sheet, so she drops onto the dark room without a fringe: `tools/cut_white.py`
// shaves the white matte that the renderer blends into the hair.
//
// Difference from Nia (tracks 1–3): Nia is a drawn document. Zuri is a person, and
// she does what a presenter does — stands, points at the UI, reacts, signs off.
// That means the shots are chosen like photography, not like icons:
//   · she is cropped by the frame (head high, feet below the edge), never floated
//   · one pose per shot; a pose change is a cut
//   · she is never scaled inside a shot — the room and the card move instead
//
// The sheets are tall enough to reach past the frame edge, because the shipped
// Altraware reels always crop her at the knees or the hip.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  clamp, lerp, unlerp, easeOut, easeInOut, round, readImage, circle,
} from './core.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '../assets/character');

/** Every sheet we hold. Keys are what a spec writes in `cast.pose`. */
export const POSES = {
  calm:  {file: 'zuri-full-cut.png',  aspect: 573 / 1197, note: 'default, hands low'},
  point: {file: 'zuri-point-cut.png', aspect: 826 / 1177, note: 'points to her left (viewer right)'},
  shock: {file: 'zuri-shock-cut.png', aspect: 524 / 1203, note: 'hand to chest'},
  laugh: {file: 'zuri-laugh-cut.png', aspect: 725 / 1168, note: 'sign-off'},
};

export const POSE_ASPECT = Object.fromEntries(Object.entries(POSES).map(([k, v]) => [k, v.aspect]));

const cache = new Map();
function sheet(name) {
  if (cache.has(name)) return cache.get(name);
  const p = POSES[name];
  if (!p) throw new Error(`zuri: unknown pose "${name}" (have ${Object.keys(POSES).join(', ')})`);
  const data = readImage(path.join(DIR, p.file));
  if (!data) throw new Error(`zuri: missing sheet ${path.join(DIR, p.file)}`);
  cache.set(name, data);
  return data;
}

/** Bind a logo/mark path into an SVG data URI once, for the eyebrow lockup. */
export function logoData(file) {
  if (!file) return null;
  return readImage(path.isAbsolute(file) ? file : path.resolve(file));
}

/**
 * Draw her, bottom-anchored: `h` is her height in frame pixels, `y` is where her
 * feet would be (past the frame edge on purpose).
 *
 * `enter` gives a 16-frame rise-and-fade on the first shot of a scene. There is no
 * idle bob: a photograph that bobs looks like a bug. Life comes from the room's
 * lamp drift and the slow push, which the caller owns.
 */
export function pose(name, t, {x = 790, y = 1930, h = 1180, flip = false, enter = true, o = 1} = {}) {
  const data = sheet(name);
  const w = h * (POSE_ASPECT[name] || 0.48);
  const e = enter ? easeOut(unlerp(t, 0, 16)) : 1;
  const rise = enter ? (1 - easeInOut(unlerp(t, 0, 22))) * 26 : 0;
  const sx = flip ? -1 : 1;
  return `<g transform="translate(${round(x)} ${round(y + rise)}) scale(${sx} 1)" opacity="${round(clamp(e * o))}">
    <image href="${data}" x="${round(-w / 2)}" y="${round(-h)}" width="${round(w)}" height="${round(h)}" preserveAspectRatio="xMidYMax meet"/>
  </g>`;
}

/**
 * Where she stands for a given shot, in frame pixels. Same presets idea as the story
 * track, but tuned to a full-body cut-out that is meant to be cropped by the frame.
 */
export const SHOT = {
  hero:  {x: 800, y: 1980, h: 1300},   // stands at the right, head near y≈690
  tall:  {x: 820, y: 2040, h: 1520},   // head near y≈520, for a hook with no UI
  close: {x: 760, y: 1890, h: 1150},   // head near y≈740, warmer, for a reaction
  left:  {x: 300, y: 1980, h: 1280},   // mirrored side, used when the UI is on the right
};

/** Soft floor shadow under her, so she stands in the room rather than on top of it. */
export function floorShadow({x = 800, y = 1660, w = 300, o = 0.35} = {}) {
  return `<ellipse cx="${round(x)}" cy="${round(y)}" rx="${round(w)}" ry="${round(w * 0.13)}" fill="#000000" opacity="${round(o)}"/>`;
}
