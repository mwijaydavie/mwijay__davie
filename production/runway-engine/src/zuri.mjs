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
import {hand} from './hands.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '../assets/character');

/** Every sheet we hold. Keys are what a spec writes in `cast.pose`. */
export const POSES = {
  // `body` is the wave sheet with the drawn hand erased: the rig in hands.mjs then puts
  // whatever gesture the scene asks for at the wrist. Every other pose keeps its own
  // rendered hands, because a full pose swap mid-shot would pop.
  calm:  {file: 'zuri-full-cut.png',  aspect: 573 / 1197, note: 'default, hands low'},
  body:  {file: 'zuri-body-cut.png',  aspect: 620 / 1207, note: 'wave body, no hand — rigged'},
  point: {file: 'zuri-point-cut.png', aspect: 826 / 1177, note: 'points to her left (viewer right)'},
  shock: {file: 'zuri-shock-cut.png', aspect: 524 / 1203, note: 'hand to chest'},
  laugh: {file: 'zuri-laugh-cut.png', aspect: 725 / 1168, note: 'sign-off'},
  wave:  {file: 'zuri-wave-cut.png',  aspect: 625 / 1176, note: 'hello — opens every light reel'},
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
 * Draw her, bottom-anchored: `h` is her height in frame pixels, `y` is where her feet
 * would be (past the frame edge on purpose).
 *
 * She is a photograph, so the motion has to be authored — a still cut-out that slides
 * looks like a sticker. Three layers, all cheap and all deterministic:
 *
 *   breathe · a 0.22 % scale on a ~4 s sine, plus a 1.5 px rise. The torso moves, not
 *             the whole figure, so it reads as breath rather than as a bump.
 *   sway    · a 0.35° rotation about a pivot just below her hips. This is the one that
 *             does most of the work: it is what a person standing still actually does.
 *   arm     · for `wave` and `point`, a small counter-rotation of the raised side,
 *             approximated by a horizontal squash. A waving hand is never still.
 *
 * `enter` adds a 16-frame rise-and-fade on the first frame of a scene.
 */
export function pose(name, t, {
  x = 790, y = 1930, h = 1180, flip = false, enter = true, o = 1,
  motion = true, phase = 0, sway = 1, breath = 1, gesture = null, gestureScale = 0.98,
  gestureAngle = 0,
} = {}) {
  if (name === '__rigOnly') {
    return `<g opacity="${round(clamp((enter ? easeOut(unlerp(t, 0, 16)) : 1) * o))}">${hand(gesture || 'wave', x, y, {
      h: gestureScale * 300, angle: gestureAngle, t,
    })}</g>`;
  }
  const data = sheet(name);
  const w = h * (POSE_ASPECT[name] || 0.48);
  const e = enter ? easeOut(unlerp(t, 0, 16)) : 1;
  const rise = enter ? (1 - easeInOut(unlerp(t, 0, 22))) * 26 : 0;

  const tsec = t / 60;
  // breath: two cycles in a smoker's rhythm, never faster than ~3.6 s
  const br = motion ? Math.sin(((tsec + phase) / 2.6) * Math.PI * 2) : 0;
  const breathe = 1 + br * 0.0052 * breath;
  const lift = motion ? br * 4.2 * breath : 0;
  // sway: a slower, wider period so it never looks locked to the breath
  const sw = motion ? Math.sin(((tsec + phase) / 4.1) * Math.PI * 2 + 0.7) : 0;
  const angle = sw * 0.85 * sway * (flip ? -1 : 1);
  // arm: the raised side gets its own faster tick
  const armT = motion && (name === 'wave' || name === 'point')
    ? Math.sin(((tsec + phase) / 1.55) * Math.PI * 2) * 0.024 : 0;

  const sx = flip ? -1 : 1;
  const pivotY = -h * 0.30;                      // just under the hips
  // the wrist anchor, in her local pixels: measured off zuri-wave-cut.png where the
  // drawn hand used to sit (u 0.755, v 0.335 of the sheet)
  const wr = WRIST[name];
  const gh = h * 0.30 * (gestureScale || 1);
  const rig = gesture && wr
    ? hand(gesture, wr.u * w - w / 2, -h + wr.v * h, {
        h: gh, angle: wr.a, t: t + phase * 60, flip: !!wr.flip,
      })
    : '';
  return `<g transform="translate(${round(x)} ${round(y + rise)}) scale(${sx} 1)" opacity="${round(clamp(e * o))}">
    <g transform="rotate(${round(angle * 100) / 100} 0 ${round(pivotY)}) scale(${round((1 + armT) * 1000) / 1000} ${round(breathe * 1000) / 1000})">
      <image href="${data}" x="${round(-w / 2)}" y="${round(-h - lift)}" width="${round(w)}" height="${round(h)}" preserveAspectRatio="xMidYMax meet"/>
      ${rig}
    </g>
  </g>`;
}

/** Where the rigged hand sits on each sheet, in sheet-normalised coordinates. */
const WRIST = {
  body: {u: 0.800, v: 0.235, a: 6, flip: false},
};

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
