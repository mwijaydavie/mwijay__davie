// Scene-to-scene motion. Every cut in the film gets one of three moves, all driven by the
// frame counter so the render stays deterministic and can be resumed mid-reel.
//
//  push   the outgoing scene slides up while the incoming one rises into place (default)
//  wipe   a solid accent bar crosses the frame, hiding the cut behind it
//  cut    a hard cut on the beat (used once per reel at the turn, so it stays loud)
//
// The move lives here, not in the templates, because it needs both frames: the last pose of
// the old scene and the first pose of the new one.
import {W, H, clamp, unlerp, easeInOut, easeOut, round} from './core.mjs';

export const MOVES = ['push', 'wipe', 'cut'];

/** Frames a move occupies. 12 at 60fps = 200ms, long enough to read, short enough to hide. */
export const MOVE_FRAMES = 12;

/**
 * @param {string} move
 * @param {number} frame  global frame
 * @param {number} sceneFrames length of one scene in frames
 * @param {string} accent accent colour for the wipe bar
 * @returns {{outer: string, inner: string, bar: string}} wrappers to inject around each scene body
 */
export function transition(move, frame, sceneFrames, accent = '#3343C5') {
  if (move === 'cut' || !move) return {outer: '', bar: ''};
  const into = frame % sceneFrames;                 // frames since this scene started
  const p = easeInOut(clamp(into / MOVE_FRAMES));   // 0 -> 1 across the move

  if (move === 'push') {
    // The incoming body rises 150px and fades in. Once the move is over the wrapper is
    // dropped entirely: an identity wrapper would be harmless but would break the guard
    // that a finished transition costs nothing.
    if (into >= MOVE_FRAMES) return {outer: '', bar: ''};
    const dy = (1 - p) * 150;
    const o = easeOut(clamp(into / (MOVE_FRAMES * 0.75)));
    return {
      outer: `<g opacity="${round(o)}" transform="translate(0 ${round(dy)})">`,
      bar: '',
      close: '</g>',
    };
  }

  if (move === 'wipe') {
    // a 96px accent bar sweeps left to right across the cut, then leaves
    const sweep = easeInOut(clamp(into / MOVE_FRAMES));
    const x = -W * 0.25 + sweep * (W * 1.5);
    const bar = `<rect x="${round(x)}" y="0" width="${round(W * 0.42)}" height="${H}" fill="${accent}" opacity="${round(0.92 * (1 - Math.abs(sweep - 0.5) * 1.1))}"/>`;
    const o = easeOut(clamp(into / (MOVE_FRAMES * 0.6)));
    return {
      outer: `<g opacity="${round(o)}">`,
      bar,
      close: '</g>',
    };
  }

  return {outer: '', bar: ''};
}

/**
 * Move schedule for a spec. A reel gets a default move plus one hard cut at the turn
 * (the scene before the CTA), so the last beat lands harder than the rest.
 */
export function moveFor(spec, sceneIdx) {
  const count = spec.scenes.length;
  const explicit = spec.scenes[sceneIdx]?.transition;
  if (explicit) return explicit;
  if (sceneIdx === 0) return 'none';                  // the opening fades in, no move needed
  if (sceneIdx === count - 1) return 'cut';           // CTA lands hard
  return spec.transition || 'push';
}
