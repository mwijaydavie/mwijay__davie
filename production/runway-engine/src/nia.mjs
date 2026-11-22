// Nia — the account character. A document card with a folded corner, a lime tab, and
// two amber eyes. Her head is literally the object every Reel is about (a form, a sheet,
// a page), so the silhouette reads as "this channel" before the text is legible.
//
// Pure SVG from a frame counter: same input, same pixels. No external assets, so she
// costs nothing per render. Each appearance flexes ONE parameter from a fixed set:
//     0 idle   ·  1 perk   ·  2 lean   ·  3 present  ·  4 tick (with on-screen step)
//     5 nod    ·  6 point  ·  7 celebrate  ·  8 solve
//
// Usage:  nia(frameInScene, {x, y, scale, pose, accent, tab, ink})
// Drawn in a 200x200 box with the transform applied by the caller, so motion stays
// inside the safe area.
import {clamp, lerp, unlerp, easeInOut, easeOut, round} from './core.mjs';

export const NIA_POSES = ['idle', 'perk', 'lean', 'present', 'tick', 'nod', 'point', 'celebrate', 'solve'];

const EASE = (t) => easeInOut(clamp(t));

/* Small helper: eye with a lid that closes over `blink` (0..1) and a look offset. */
function eye(cx, cy, r, {blink = 0, lookX = 0, lookY = 0, ink}) {
  const lid = clamp(blink);
  const h = r * (1 - lid * 0.94);
  return `<g transform="translate(${round(cx + lookX)} ${round(cy + lookY)})">
    <ellipse rx="${round(r)}" ry="${round(Math.max(1.2, h))}" fill="${ink}"/>
    ${lid > 0.35 ? '' : `<circle cx="${round(-r * 0.28)}" cy="${round(-r * 0.3)}" r="${round(r * 0.28)}" fill="#FFFFFF" opacity="0.9"/>`}
  </g>`;
}

/**
 * @param {number} t   frames into the current scene
 * @param {object} o   {x,y,scale,pose,accent,tab,ink,talk}
 */
export function nia(t, {x = 540, y = 900, scale = 1, pose = 'idle', accent = '#3343C5',
                        tab = '#DFFC77', ink = '#161827', talk = 0, label = 'NIA'} = {}) {
  const p = typeof pose === 'number' ? NIA_POSES[pose] || 'idle' : pose;
  const enter = easeOut(unlerp(t, 0, 14));
  const blob = easeInOut(unlerp(t, 0, 40));

  // per-pose target transforms, all settled with a spring so nothing snaps
  const P = {
    idle:      {dy: 0, rot: 0, tilt: 0, sx: 1, sy: 1, arm: 0, brow: 0},
    perk:      {dy: -14, rot: 0, tilt: 0, sx: 1.04, sy: 0.985, arm: 0, brow: 1},
    lean:      {dy: -4, rot: -7, tilt: -4, sx: 1.02, sy: 1, arm: 0, brow: 0.4},
    present:   {dy: -6, rot: 3, tilt: 4, sx: 1, sy: 1, arm: 1, brow: 0.2},
    tick:      {dy: -8, rot: -2, tilt: -2, sx: 1.02, sy: 1, arm: 1, brow: 0.7},
    nod:       {dy: 6, rot: 0, tilt: 0, sx: 1, sy: 0.97, arm: 0, brow: 0.3},
    point:     {dy: -6, rot: 6, tilt: 6, sx: 1.01, sy: 1, arm: 1, brow: 0.9},
    celebrate: {dy: -22, rot: 0, tilt: 0, sx: 1.05, sy: 0.97, arm: 1, brow: 1},
    solve:     {dy: -8, rot: 0, tilt: 0, sx: 1.02, sy: 1, arm: 1, brow: 0.8},
  }[p] || {dy: 0, rot: 0, tilt: 0, sx: 1, sy: 1, arm: 0, brow: 0};

  const settle = EASE(unlerp(t, 4, 26));
  // idle breathing (2.4s) and a blink every ~3.1s, both deterministic
  const breathe = Math.sin((t / 144) * Math.PI * 2) * 4;
  const blinkPhase = (t % 186) / 186;
  const blink = blinkPhase > 0.94 ? Math.sin(((blinkPhase - 0.94) / 0.06) * Math.PI) : 0;
  // talking mouth: open/close driven by a fast deterministic wave while `talk` > 0
  const mouthOpen = talk ? 0.35 + 0.65 * Math.abs(Math.sin((t / 5.5) * Math.PI)) : 0.18;

  const dy = lerp(28, P.dy, settle) + breathe * (1 - settle * 0.4);
  const rot = lerp(-9, P.rot, settle);
  const sx = lerp(0.92, P.sx, settle);
  const sy = lerp(0.92, P.sy, settle);
  const op = clamp(enter * 1.2);

  const tilt = P.tilt * blob;
  const tabLift = p === 'perk' || p === 'celebrate' ? -7 : 0;
  const brow = P.brow;

  // arm: a rounded stick with a glove, drawn outside the head so it is never occluded
  const armA = lerp(14, p === 'celebrate' ? -62 : p === 'point' ? -8 : -30, settle);
  const gloveY = p === 'celebrate' ? -30 : -4;

  return `<g opacity="${round(op)}" transform="translate(${round(x)} ${round(y + dy)}) scale(${round(scale)}) rotate(${round(rot)})">
  <g transform="scale(${round(sx)} ${round(sy)})">
    <!-- ground shadow, tightens as she lifts -->
    <ellipse cx="0" cy="104" rx="${round(58 * (1 - Math.abs(dy) / 240))}" ry="11" fill="${ink}" opacity="0.14"/>

    <!-- body: a short stack of sheets, so she is made of paper rather than being a person -->
    <g transform="rotate(${round(tilt)} 0 40)">
      <rect x="-50" y="6" width="100" height="74" rx="16" fill="${ink}" opacity="0.07" transform="translate(4 4)"/>
      <rect x="-50" y="6" width="100" height="74" rx="16" fill="#FFFFFF" stroke="${ink}" stroke-width="4"/>
      <line x1="-28" y1="32" x2="18" y2="32" stroke="${ink}" stroke-width="4" stroke-opacity="0.16" stroke-linecap="round"/>
      <line x1="-28" y1="48" x2="4" y2="48" stroke="${ink}" stroke-width="4" stroke-opacity="0.16" stroke-linecap="round"/>
      <!-- arm pivots at the shoulder, glove swings wide of the silhouette -->
      <g transform="rotate(${round(armA)} 50 34)">
        <line x1="50" y1="34" x2="74" y2="${round(30 + gloveY)}" stroke="${ink}" stroke-width="8" stroke-linecap="round" stroke-opacity="0.8"/>
        <circle cx="78" cy="${round(28 + gloveY)}" r="9" fill="${accent}"/>
      </g>
    </g>

    <!-- head: the document itself -->
    <g transform="rotate(${round(P.rot * 0.35)} 0 -60)">
      <!-- lime bookmark tab, drawn behind the head so it reads as part of it -->
      <g transform="translate(0 ${round(tabLift)})">
        <path d="M 46 -132 L 84 -132 L 84 -96 L 46 -96 Z" fill="${tab}"/>
        <path d="M 46 -132 L 84 -132 L 84 -96 L 46 -96 Z" fill="none" stroke="${ink}" stroke-width="3.5" stroke-opacity="0.55"/>
      </g>
      <rect x="-66" y="-124" width="132" height="124" rx="18" fill="#FFFFFF" stroke="${ink}" stroke-width="4.5"/>
      <!-- folded corner, the shape carried by every card in the Reels -->
      <path d="M 44 -124 L 66 -102 L 44 -102 Z" fill="${ink}" opacity="0.12"/>
      <path d="M 44 -124 L 66 -102 L 44 -102 Z" fill="none" stroke="${ink}" stroke-width="3.5" stroke-opacity="0.6"/>
      <!-- brows: the main emotion channel across poses -->
      <g opacity="${round(0.4 + brow * 0.6)}">
        <line x1="-46" y1="${round(-96 - brow * 5)}" x2="-20" y2="${round(-99 - brow * 8)}" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
        <line x1="20" y1="${round(-99 - brow * 8)}" x2="46" y2="${round(-96 - brow * 5)}" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
      </g>
      <!-- eyes: rust-orange, so the character is findable in a thumbnail -->
      ${eye(-31, -74, 10, {blink, ink: '#C2410C'})}
      ${eye(31, -74, 10, {blink, ink: '#C2410C'})}
      <!-- mouth opens while the voice is speaking -->
      <path d="M -15 -44 Q 0 ${round(-44 + mouthOpen * 17)} 15 -44" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
      <!-- ruled lines under the face keep her reading as a form -->
      <line x1="-40" y1="-22" x2="12" y2="-22" stroke="${ink}" stroke-width="4" stroke-opacity="0.16" stroke-linecap="round"/>
      <line x1="-40" y1="-9" x2="-8" y2="-9" stroke="${ink}" stroke-width="4" stroke-opacity="0.16" stroke-linecap="round"/>
    </g>
  </g>
  ${label ? `<text x="0" y="124" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="13" letter-spacing="3" fill="${ink}" opacity="0.45">${label}</text>` : ''}
</g>`;
}

/**
 * Pose track for a scene: which pose at which frame, so a template only says
 * `niaPose(scene, t)` instead of hard-coding beats.
 */
export function poseAt(scene, t) {
  const track = scene?.nia?.poses;
  if (!Array.isArray(track) || !track.length) return {pose: scene?.nia?.pose || 'idle', since: t};
  let cur = track[0];
  for (const k of track) if (t >= (k.at || 0)) cur = k;
  return {pose: cur.pose, since: t - (cur.at || 0)};
}
