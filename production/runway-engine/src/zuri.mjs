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
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  clamp, lerp, unlerp, easeOut, easeInOut, round, readImage, circle,
} from './core.mjs';

const smoothstep = (x) => { const t = clamp(x); return t * t * (3 - 2 * t); };

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '../assets/character');

/** Every sheet we hold. Keys are what a spec writes in `cast.pose`. */
// Every pose is a COMPLETE render of her, hand included: no composite hand is ever
// pasted onto a body, because a body with a pasted hand is not one person. Poses are
// normalised to one head size and one origin (`tools/normalize_poses.py`), so a
// gesture change is a move inside the same animated body, not a picture swap.
export const POSES = {
  calm:  {file: 'zuri-full-cut.png',    note: 'default, relaxed, hands low'},
  open:  {file: 'pose-open-cut.png',    note: '✋🏾 raised palm'},
  wave:  {file: 'pose-open-cut.png',    note: 'alias of open'},
  point: {file: 'pose-point-cut.png',   note: '🫵🏾 pointing at the viewer'},
  peace: {file: 'pose-peace-cut.png',   note: '✌🏾'},
  like:  {file: 'pose-like-cut.png',    note: '👍🏾 thumbs up'},
  ok:    {file: 'pose-ok-cut.png',      note: '👌🏾'},
  pray:  {file: 'pose-pray-cut.png',    note: '🙏🏾 palms together'},
  heart: {file: 'pose-heart-cut.png',   note: '🫶🏾 heart hands'},
  count: {file: 'pose-count-cut.png',   note: '🤌🏾 pinched'},
  shock: {file: 'zuri-shock-cut.png',   note: 'hand to chest'},
  laugh: {file: 'zuri-laugh-cut.png',   note: 'sign-off'},
};

// face states: blink and a talking mouth, baked per pose as feathered patches
const FACE = JSON.parse(fs.readFileSync(path.join(HERE, '../../../content/runway/character/face-states.json'), 'utf8'));
const IMG_DIR = path.join(HERE, '../assets/character');
const PATCH_CACHE = new Map();
function patchData(file) {
  if (!PATCH_CACHE.has(file)) {
    const p = path.resolve(HERE, '../', file);
    PATCH_CACHE.set(file, fs.existsSync(p)
      ? `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`
      : null);
  }
  return PATCH_CACHE.get(file);
}

/**
 * Blink schedule, in frames at 60 fps. A real blink is 100–150 ms: that is 6–9 frames
 * total, with only 2–3 of them fully shut. Getting this wrong is invisible in a still
 * and obvious in motion — too short and the eye never appears to close, too long and
 * she looks sleepy. Two blinks per ~4 s, and never evenly spaced.
 */
function blinkAt(t, seed = 0) {
  const per = 232;
  const phase = (t + Math.round(seed * 53)) % per;
  // the lid closes in one frame, holds shut, then opens through a half state. Going
  // half -> shut -> half at 60 fps reads as a flicker, because the half states are on
  // the way DOWN, not on the way up.
  if (phase < 2) return 'half';
  if (phase < 5) return 'blink';
  if (phase < 7) return 'half';
  // a double blink, which is what people actually do
  if (phase > 24 && phase < 26) return 'half';
  if (phase > 26 && phase < 29) return 'blink';
  if (phase > 29 && phase < 31) return 'half';
  return null;
}

/** measured in cut-image pixels by tools/pose_geometry.py */
const GEO = JSON.parse(fs.readFileSync(path.join(HERE, '../../../content/runway/character/pose-geometry.json'), 'utf8'));

/** Where the chin and the head centre sit inside each cut image, as fractions. */
function geo(name) {
  const g = GEO.poses[name] || GEO.poses.open;
  return {
    cx: g.head_cx / g.w,
    chin: g.chin / g.h,
    w: g.w, h: g.h,
  };
}

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
 * Draw her, anchored on the CHIN.
 *
 * `h` is her height in frame pixels; `y` is where her chin sits. The chin is the
 * anchor because it is the one landmark every pose shares after normalisation —
 * anchoring on the bottom of the cut makes each pose land on its own invisible
 * shelf, which is what made a gesture change look like a hop.
 *
 * What she does NOT do: she never floats. There is no vertical bob on the whole
 * figure. A standing body is planted; what moves is
 *
 *   breath  · ribs open and the shoulders rise a little; the pelvis does not move
 *   sway    · a slow roll of the torso ABOVE the hip, so the hip stays the pivot
 *   head    · counter-rotates part of the sway, with a few frames of lag
 *   weight  · a 0.35 % squash that keeps the chin height fixed, so she settles
 *             instead of bobbing
 *
 * `gesture` changes pose. Pass `handover` in frames: for that many frames after the
 * change she is cross-dissolved from the previous pose, which reads as a fast,
 * soft move of the arm rather than as a paper swap.
 */
export function pose(name, t, {
  x = 790, y = 1690, h = 1180, flip = false, enter = false, o = 1,
  motion = true, phase = 0, sway = 1, breath = 1,
  from = null, handover = 0, talk = 0, blink = true, mouth = true,
} = {}) {
  const data = sheet(name);
  const g = geo(name);
  const w = h * (g.w / g.h);

  const e = enter ? easeOut(unlerp(t, 0, 14)) : 1;
  const tsec = t / 60;
  const br = motion ? Math.sin(((tsec + phase) / 2.6) * Math.PI * 2) : 0;   // ~2.6 s
  const sw = motion ? Math.sin(((tsec + phase) / 5.9) * Math.PI * 2 + 0.7) : 0; // ~5.9 s

  // pivot: the hip, in px below her chin (2.05 head heights, measured)
  const pivotY = h * 0.62;
  // she is planted: the hip is the pivot, so the head travels more than the hip does.
  // 1.15 deg of roll is what a person actually does while talking; more reads drunk.
  const angle = sw * 1.15 * sway * (flip ? -1 : 1);
  // weight shift: a small horizontal drift of the upper body over the planted hip,
  // phase-shifted 90 deg from the roll so the figure does not pivot like a metronome
  const shiftX = Math.cos(((tsec + phase) / 5.9) * Math.PI * 2 + 0.7) * h * 0.004;
  const breathe = 1 + br * 0.0075 * breath;          // ribs
  const settle = 1 - Math.abs(br) * 0.0035 * breath; // weight, never a bob
  // shoulders drop a little on the exhale — the detail that makes breath read
  const shoulderDrop = br * h * 0.0022 * breath;

  const sx = flip ? -1 : 1;
  const img = (n) => {
    const gg = geo(n);
    const ww = h * (gg.w / gg.h);
    return `<image href="${sheet(n)}" x="${round(-gg.cx * ww)}" y="${round(-gg.chin * h)}" width="${round(ww)}" height="${round(h)}" preserveAspectRatio="none"/>`;
  };

  // ---- face: blink and mouth, drawn in sheet space on top of the pose -------------
  // `talk` is 0 (shut) .. 1 (open); a talking head never holds one mouth shape, so the
  // caller can pass a small wobble and we add a second, slower one here.
  const f = FACE.poses[name];
  let fx = 1, fy = 1;
  if (f) {
    const k = 1 + Math.sin(((tsec + phase) / 2.6) * Math.PI * 2) * 0.004 * breath;
    fx = k; fy = 1 / k;
  }
  const talkAmt = mouth ? talk : 0;   // the mouth is independent of the eyes
  const faceLayer = (n) => {
    if (!f) return '';
    const b = blink ? blinkAt(t, (n.length + phase * 10) / 4) : null;
    let out = '';
    // the mouth opens BEFORE the eyes close in reading order, so a blink does not
    // swallow the talk patch
    // Two mouths, not one. A quiet syllable gets the mid shape and a loud one the wide
    // shape, cross-faded — a single wide mouth faded in and out is a muppet.
    if (talkAmt > 0.02) {
      const mid = f.patches.talkMid, wide = f.patches.talk;
      const hi = smoothstep(unlerp(talkAmt, 0.28, 0.72));
      const lo = smoothstep(unlerp(talkAmt, 0.02, 0.30));
      if (mid && lo > 0.01) {
        out += `<image href="${patchData(mid.file)}" x="${mid.x}" y="${mid.y}" width="${mid.w}" height="${mid.h}" opacity="${round(lo * (1 - 0.55 * hi) * 100) / 100}"/>`;
      }
      if (wide && hi > 0.01) {
        out += `<image href="${patchData(wide.file)}" x="${wide.x}" y="${wide.y}" width="${wide.w}" height="${wide.h}" opacity="${round(hi * 100) / 100}"/>`;
      }
    }
    if (b) {
      for (const side of ['l', 'r']) {
        const p = f.patches[`${b}_${side}`] || f.patches[`blink_${side}`];
        if (p) out += `<image href="${patchData(p.file)}" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}"/>`;
      }
    }
    return out;
  };
  // where the previous pose's chin sits, so a handover dissolves exactly in place
  let layers = img(name);
  if (from && handover > 0) {
    const k = clamp(unlerp(t, 0, handover));
    const a = 1 - k;
    if (a > 0.001) layers = `<g opacity="${round(a * 1000) / 1000}">${img(from)}</g>${layers}`;
  }

  return `<g transform="translate(${round(x)} ${round(y)}) scale(${sx} 1)" opacity="${round(clamp(e * o))}">
    <g transform="translate(${round(shiftX)} 0) rotate(${round(angle * 100) / 100} 0 ${round(pivotY + shoulderDrop)}) scale(${round(settle * breathe * 1000) / 1000} ${round((1 / breathe) * 1000) / 1000})">
      ${layers}
      <g transform="translate(${round(-g.cx * w)} ${round(-g.chin * h)}) scale(${round((h / g.h) * 10000) / 10000}) scale(${round((1 / fx) * 10000) / 10000} ${round((1 / fy) * 10000) / 10000})">${faceLayer(name)}</g>
    </g>
  </g>`;
}

/**
 * Where she stands for a given shot, in frame pixels. Same presets idea as the story
 * track, but tuned to a full-body cut-out that is meant to be cropped by the frame.
 */
/** width / height of each cut sheet, for callers that need to reserve space */
export const POSE_ASPECT = Object.fromEntries(Object.keys(POSES).map(k => [k, geo(k).w / geo(k).h]));

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
