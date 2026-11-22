// Track 5 — "Altraware reel": the house look that shipped on the Altraware projects
// (Faida POS, Nyama TZ, LIMS), rebuilt as a deterministic template.
//
// What makes it read the way it does, measured off those reels:
//   · a very dark navy-blue room (#030815 → #031027), never pure black, never grey
//   · one warm lamp from the left (#B06040 at low opacity) so the room has a direction
//   · ONE hero sentence top-left, huge and heavy, with the key word in warm gold italic
//   · the character is a photographic cut-out standing on the right, cropped by the frame
//   · real UI sits *in front of* her, cream cards on navy, and she points at it
//   · captions in a dark rounded bar at the bottom, 1–2 short lines, Kiswahili
//   · a light beam and dust motes for depth; nothing else moves except a slow push
//
// A scene says what it wants with `mode`: hook · ui · stat · cta.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  W, H, clamp, lerp, unlerp, easeOut, easeInOut, spring, round, hash01,
  rect, circle, line, text, fit, measure, readImage,
} from './core.mjs';
import {pose, floorShadow, POSE_ASPECT, SHOT} from './zuri.mjs';

/* ---- palette, sampled from the shipped reels ---- */
export const ALT = {
  night: '#030815',
  nightMid: '#04102B',
  nightEdge: '#020814',
  lamp: '#B06040',
  ink: '#F5F5F0',
  inkDim: '#98A3BC',
  gold: '#FDCD81',
  card: '#F5F5F2',
  cardInk: '#12141C',
  cardDim: '#6B7280',
  violet: '#7C5CFF',
  capBg: '#0A1026F2',
};

/**
 * The room. `t` drives a slow drift of the lamp so a held shot still breathes.
 * `beam` draws the diagonal light shaft the shipped reels use between scenes.
 */
function room(t, {tone = 'night', beam = false} = {}) {
  const drift = easeInOut(unlerp(t, 0, 400));
  const top = tone === 'deep' ? '#02060F' : ALT.night;
  const mid = tone === 'warm' ? '#0A1024' : ALT.nightMid;
  let grain = '';
  for (let i = 0; i < 90; i++) {
    grain += circle(round(hash01(`n${i}`) * W), round(hash01(`m${i}`) * H), 1.3, {fill: '#FFFFFF', o: 0.04});
  }
  const shaft = beam
    ? `<g opacity="0.16"><path d="M-80 0 L300 0 L${round(430 + drift * 30)} 1920 L-80 1920 Z" fill="url(#shaft)"/></g>`
    : '';
  return rect(0, 0, W, H, {fill: top}) +
    `<defs>
      <linearGradient id="roomY" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${mid}" stop-opacity="1"/>
        <stop offset="1" stop-color="${top}" stop-opacity="1"/>
      </linearGradient>
      <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="${ALT.lamp}" stop-opacity="0.55"/>
        <stop offset="1" stop-color="${ALT.lamp}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="shaft" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFF6E0" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#FFF6E0" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#FFF6E0" stop-opacity="0"/>
      </linearGradient>
    </defs>` +
    rect(0, 0, W, H, {fill: 'url(#roomY)'}) +
    `<ellipse cx="${round(lerp(-40, 120, drift))}" cy="1080" rx="620" ry="900" fill="url(#lampGlow)"/>` +
    // a faint horizon rule so the room has a floor line, like the POS reel's counter
    `<rect x="0" y="1508" width="${W}" height="3" fill="#FFFFFF" opacity="0.05"/>` +
    grain + shaft;
}

/** Hero sentence: one weight, tight leading, the money word in gold italic serif. */
function hero(scene, t, {x = 84, y = 400, size = 104, maxWidth = 880, start = 0} = {}) {
  const lines = scene.lines || (scene.headline ? [scene.headline] : []);
  if (!lines.length) return '';
  const p = easeOut(unlerp(t, start, start + 18));
  let out = '';
  let cur = y;
  for (const [i, ln] of lines.entries()) {
    const isAccent = typeof ln === 'object' && ln.accent;
    const body = typeof ln === 'object' ? ln.text : ln;
    const sz = typeof ln === 'object' && ln.size ? ln.size : size;
    const f = fit(body, {role: 'body', weight: 800, size: sz, maxWidth, maxLines: 2, lineHeight: 1.02, tracking: -3, minSize: 44});
    const lh = f.size * 1.04;
    for (const [j, l] of f.lines.entries()) {
      const o = easeOut(unlerp(t, start + (i * 2 + j) * 4, start + 18 + (i * 2 + j) * 4));
      out += `<g transform="translate(0 ${round((1 - o) * 30)})">${text(l, x, cur, {
        role: isAccent ? 'serif' : 'body',
        weight: isAccent ? 600 : 800,
        size: f.size, fill: isAccent ? ALT.gold : ALT.ink,
        tracking: isAccent ? -1 : -3, o,
      })}</g>`;
      cur += lh;
    }
  }
  hero.lastHeight = cur - y;   // reported for callers that want to stack under it
  return out;
}

const MARK_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../content/assets/altraware-mark.png');
let MARK_CACHE;
/** The Altraware mark, inlined once. False if the repo does not carry it. */
const MARK = (() => {
  if (MARK_CACHE !== undefined) return MARK_CACHE;
  MARK_CACHE = fs.existsSync(MARK_PATH) ? fs.readFileSync(MARK_PATH).toString('base64') : null;
  MARK_CACHE = MARK_CACHE ? `data:image/png;base64,${MARK_CACHE}` : null;
  return MARK_CACHE;
})();

/** Eyebrow: small caps + a slash, exactly how the reels sign a project. */
function eyebrow(scene, t, {x = 84, y = 268, start = 0} = {}) {
  if (!scene.eyebrow) return '';
  const o = easeOut(unlerp(t, start, start + 14));
  const href = typeof scene.logo === 'string' ? scene.logo : (scene.logo ? MARK : null);
  const mark = href
    ? `<image href="${href}" x="${x}" y="${y - 32}" width="44" height="44" opacity="${round(o)}"/>`
    : circle(x + 21, y - 10, 17, {fill: '#FFFFFF', o: round(o * 0.14)});
  return `<g opacity="${round(o)}">${mark}${text(scene.eyebrow, x + 64, y + 3, {
    role: 'mono', weight: 700, size: 27, fill: ALT.ink, tracking: 2.6,
  })}</g>`;
}

/** Caption bar: 1–2 short Kiswahili lines, dark rounded bar, never more than 3 lines. */
function captionBar(scene, t, {y = 1700} = {}) {
  const s = scene.captionLine;
  if (!s) return '';
  const p = easeOut(unlerp(t, 6, 24));
  const f = fit(s, {role: 'body', weight: 600, size: 47, maxWidth: 860, maxLines: 2, lineHeight: 1.14, tracking: -0.8, minSize: 34});
  const lh = f.size * 1.14;
  const boxH = f.lines.length * lh + 44;
  return `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 18)})">
    ${rect(W / 2 - 470, y - boxH + 10, 940, boxH, {fill: ALT.capBg, rx: 16})}
    ${f.lines.map((l, i) => text(l, W / 2, y - boxH + 32 + lh * (i + 0.82), {
      role: 'body', weight: 600, size: f.size, fill: ALT.ink, anchor: 'middle', tracking: -0.8,
    })).join('')}
  </g>`;
}

/**
 * UI card — a cream panel that sits in front of the character, as in the POS reel.
 * `rows` are receipt lines; the total is the last, emphasised.
 */
function uiCard(scene, t, {x = 70, y = 520, w = 700, start = 8} = {}) {
  const ui = scene.ui;
  if (!ui) return '';
  const p = easeOut(unlerp(t, start, start + 22));
  const pad = 26;
  const rows = ui.rows || [];
  const rowH = 84;
  const h = 132 + rows.length * rowH + (ui.total ? 96 : 0) + (ui.foot ? 54 : 0);
  let out = `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 34)})">`;
  out += `<rect x="${x}" y="${y + 14}" width="${w}" height="${h}" rx="18" fill="#000" opacity="0.45"/>`;
  out += rect(x, y, w, h, {fill: ALT.card, rx: 18});
  out += text(ui.title || 'Receipt', x + pad, y + 54, {role: 'mono', weight: 700, size: 21, fill: ALT.cardDim, tracking: 2.2});
  if (ui.ref) out += text(ui.ref, x + w - pad, y + 54, {role: 'mono', weight: 500, size: 18, fill: ALT.cardDim, anchor: 'end'});
  out += line(x + pad, y + 78, x + w - pad, y + 78, {stroke: ALT.cardInk, sw: 2, o: 0.12});
  rows.forEach((r, i) => {
    const ry = y + 116 + i * rowH;
    const o = easeOut(unlerp(t, start + 10 + i * 8, start + 26 + i * 8));
    out += `<g opacity="${round(o)}">`;
    if (r.swatch) {
      out += rect(x + pad, ry - 26, 62, 62, {fill: r.swatch, rx: 12});
      out += circle(x + pad + 31, ry + 5, 11, {fill: '#FFFFFF', o: 0.55});
    }
    out += text(r.name, x + pad + (r.swatch ? 80 : 0), ry, {role: 'body', weight: 700, size: 30, fill: ALT.cardInk});
    out += text(r.price || '', x + w - pad - (r.qty ? 56 : 0), ry, {role: 'body', weight: 600, size: 28, fill: ALT.cardDim, anchor: 'end'});
    if (r.qty) out += `<g><circle cx="${x + w - pad - 18}" cy="${ry - 8}" r="20" fill="${ALT.violet}"/>${text(String(r.qty), x + w - pad - 18, ry + 0, {role: 'body', weight: 700, size: 22, fill: '#FFFFFF', anchor: 'middle'})}</g>`;
    out += '</g>';
  });
  if (ui.total) {
    const ty = y + h - (ui.foot ? 78 : 34);
    out += line(x + pad, ty - 60, x + w - pad, ty - 60, {stroke: ALT.cardInk, sw: 2, o: 0.12});
    out += text(ui.totalLabel || 'Total', x + pad, ty, {role: 'body', weight: 700, size: 28, fill: ALT.cardDim});
    const tp = easeOut(unlerp(t, start + 26, start + 40));
    out += `<g opacity="${round(tp)}">${text(ui.total, x + w - pad, ty, {role: 'body', weight: 800, size: 40, fill: ALT.cardInk, anchor: 'end', tracking: -1})}</g>`;
  }
  if (ui.foot) out += text(ui.foot, x + pad, y + h - 22, {role: 'mono', weight: 600, size: 20, fill: ALT.cardDim, tracking: 1.4});
  out += '</g>';
  return out;
}

/** A big number, for the beat where the number IS the story. */
function bigStat(scene, t, {x = 84, y = 760, start = 10} = {}) {
  const s = scene.stat;
  if (!s) return '';
  const p = easeOut(unlerp(t, start, start + 26));
  return `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 28)})">
    ${text(s.value, x, y, {role: 'body', weight: 800, size: s.size || 210, fill: s.color || ALT.gold, tracking: -8})}
    ${s.label ? text(s.label, x, y + 54, {role: 'mono', weight: 700, size: 26, fill: ALT.inkDim, tracking: 3}) : ''}
  </g>`;
}

/** CTA chip: one button-like pill, plus a plain URL line, like the shipped reels. */
function ctaChip(scene, t, {x = 84, y = 1180, start = 20} = {}) {
  const c = scene.cta;
  if (!c) return '';
  const p = easeOut(unlerp(t, start, start + 26));
  const label = c.label || 'Jaribu demo';
  const w = measure(label, {role: 'body', weight: 700, size: 34}) + 124;
  return `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 26)})">
    ${rect(x, y, w, 84, {fill: ALT.gold, rx: 42})}
    ${text(label, x + 40, y + 54, {role: 'body', weight: 700, size: 34, fill: '#1B1205'})}
    <path d="M${round(x + w - 46)} ${round(y + 30)} L${round(x + w - 34)} ${round(y + 42)} L${round(x + w - 46)} ${round(y + 54)}" fill="none" stroke="#1B1205" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    ${c.url ? text(c.url, x, y + 140, {role: 'mono', weight: 500, size: 22, fill: ALT.inkDim, tracking: 0.6}) : ''}
  </g>`;
}

/**
 * One frame of an Altraware-style reel.
 * `scene.mode`: hook · ui · stat · cta  (default: ui if a UI block exists, else hook)
 * `scene.cast`: {pose, x, h, y, flip} — she is drawn first, so UI cards sit in front.
 */
export function altraware(spec, scene, t, images, track) {
  const mode = scene.mode || (scene.ui ? 'ui' : 'hook');
  const push = 1 + (scene.push ?? 0.035) * easeInOut(unlerp(t, 0, 340));
  const cx = 540; const cy = 980;
  const tone = scene.tone || 'night';
  let out = room(t, {tone, beam: !!scene.beam});

  // the cast goes down before the UI, so paper overlaps her exactly like the shipped reel
  const c = scene.cast;
  if (c && c.pose) {
    const pr = pose(c.pose, t, {
      x: c.x ?? 790, y: c.y ?? 1930, h: c.h ?? 1180,
      enter: c.enter ?? true, flip: !!c.flip,
    });
    out += pr;
  }
  if (c && c.pose && c.shadow !== false) out += floorShadow({x: c.x ?? 790, y: c.groundY ?? 1690, w: (c.h ?? 1180) * 0.26});

  if (mode === 'ui') out += uiCard(scene, t, {x: scene.uiX ?? 70, y: scene.uiY ?? 520, w: scene.uiW ?? 700, start: scene.uiStart ?? 8});
  if (mode === 'stat') out += bigStat(scene, t, {x: scene.statX ?? 84, y: scene.statY ?? 760});
  if (mode === 'cta') out += ctaChip(scene, t, {x: scene.ctaX ?? 84, y: scene.ctaY ?? 1180});

  out += hero(scene, t, {
    x: scene.headX ?? 84,
    y: scene.headY ?? (mode === 'ui' ? 330 : 400),
    size: scene.headSize ?? 104,
    maxWidth: scene.headWidth ?? 900,
  });
  out += eyebrow(scene, t, {x: 84, y: scene.eyebrowY ?? 268});
  const cap = captionBar(scene, t, {y: scene.captionY ?? 1700});
  // the push wraps everything except the caption bar, which must stay phone-legible
  return `<g transform="translate(${cx} ${cy}) scale(${round(push)}) translate(${-cx} ${-cy})">${out}</g>` + cap;
}

export const alt = altraware;
