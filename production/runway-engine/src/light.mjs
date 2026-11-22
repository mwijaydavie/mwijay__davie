// Track 6 — the light "product reel": the Altraware look that shipped on MwijayNote,
// LIMS (Simu Moja, Kazi Tatu) and Model Mpya.
//
// Measured off those three reels (1080×1920, 60 fps):
//   · the page is PALE, not dark. LIMS is #EDF3F9, MwijayNote is a warm #D8D2C8,
//     Model Mpya is a mint #E6F6EE. Every shot is lit like a product photo.
//   · type is navy #0B1B33, heavy grotesk, with the SECOND line set in a blue
//     (#1755C9) serif italic. That one-two is the whole identity.
//   · a white pill at the top carries the mark + a slash lockup: "LIMS / LOAN & INVENTORY".
//   · the UI is a white rounded card with a real screen inside it, never a screenshot
//     frame. Content changes inside a card that stays put — that is the motion.
//   · the character stands at the right, cropped by the frame edge, waving in the first
//     shot and pointing afterwards. She is NEVER alone on screen.
//   · captions are one navy rounded bar at the bottom, 1–2 lines, centred.
//   · a single diagonal light streak crosses the frame for depth.
//
// Scenes describe themselves with `mode`: hook · card · compare · cta.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  W, H, clamp, lerp, unlerp, easeOut, easeInOut, spring, round, hash01,
  rect, circle, line, text, fit, measure, readImage,
} from './core.mjs';
import {pose, floorShadow, POSE_ASPECT} from './zuri.mjs';

/** Palette sampled from the three reference reels. */
export const LT = {
  paper: '#EDF3F9',       // LIMS background
  paperWarm: '#D8D2C8',   // MwijayNote background
  paperMint: '#E6F6EE',   // Model Mpya background
  ink: '#0B1B33',         // headline navy
  inkSoft: '#4A5B74',
  accent: '#1755C9',      // the italic blue, and the product colour
  card: '#FBFDFF',
  cardEdge: '#0B1B3314',
  pill: '#FFFFFF',
  pillEdge: '#B2C6DF',
  gold: '#F2B437',
  capBg: '#0B1B33',
};

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MARK_PATH = path.resolve(HERE, '../../../content/assets/altraware-mark.png');
const MARK = fs.existsSync(MARK_PATH) ? `data:image/png;base64,${fs.readFileSync(MARK_PATH).toString('base64')}` : null;

const BG = {paper: LT.paper, warm: LT.paperWarm, mint: LT.paperMint};

/**
 * The room: a pale wall with one diagonal light streak, a soft vignette at the bottom
 * so the character and the caption bar have something to sit on, and a floor line.
 */
function room(t, {tone = 'paper', streak = true} = {}) {
  const base = BG[tone] || LT.paper;
  const drift = easeInOut(unlerp(t, 0, 340));
  let grain = '';
  for (let i = 0; i < 60; i++) {
    grain += circle(round(hash01(`lt${i}`) * W), round(hash01(`lm${i}`) * H), 1.6, {fill: LT.ink, o: 0.018});
  }
  const shaft = streak
    ? `<g opacity="0.55" transform="translate(${round(lerp(-30, 30, drift))} 0)">
        <path d="M660 -60 L840 -60 L420 1980 L240 1980 Z" fill="url(#streak)"/>
        <path d="M300 -60 L360 -60 L-60 1980 L-120 1980 Z" fill="url(#streak)" opacity="0.7"/>
      </g>`
    : '';
  return rect(0, 0, W, H, {fill: base}) +
    `<defs>
      <linearGradient id="streak" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0.85"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${LT.ink}" stop-opacity="0"/>
        <stop offset="1" stop-color="${LT.ink}" stop-opacity="0.09"/>
      </linearGradient>
      <radialGradient id="vig" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.55" stop-color="${LT.ink}" stop-opacity="0"/>
        <stop offset="1" stop-color="${LT.ink}" stop-opacity="0.07"/>
      </radialGradient>
    </defs>` +
    shaft + grain +
    rect(0, 1640, W, 280, {fill: 'url(#floor)'}) +
    rect(0, 0, W, H, {fill: 'url(#vig)'});
}

/** The pill lockup: mark, then "PRODUCT / SECTION" in tracked mono caps. */
function pillLockup(scene, t, {x = 64, y = 226, start = 0} = {}) {
  if (!scene.eyebrow) return '';
  const o = easeOut(unlerp(t, start, start + 14));
  const label = scene.eyebrow;
  const size = 25;
  const tw = measure(label, {role: 'mono', weight: 600, size, tracking: 2.2});
  const w = tw + 140;
  return `<g opacity="${round(o)}">
    ${rect(x, y, w, 60, {fill: LT.pill, rx: 30, stroke: LT.pillEdge, sw: 2})}
    ${MARK ? `<image href="${MARK}" x="${x + 20}" y="${y + 12}" width="36" height="36"/>` : circle(x + 40, y + 31, 18, {fill: LT.accent})}
    ${text(label, x + 70, y + 40, {role: 'mono', weight: 600, size, fill: LT.ink, tracking: 2.2})}
  </g>`;
}

/**
 * The headline: a heavy navy line, and the turn in blue serif italic.
 * Sizes are set so three words fill the width the way the reels do.
 */
function headline(scene, t, {x = 64, y = 380, size = 128, maxWidth = 940, start = 4} = {}) {
  const lines = scene.lines || (scene.headline ? [scene.headline] : []);
  if (!lines.length) return '';
  let out = '';
  let cur = y;
  let n = 0;
  for (const ln of lines) {
    const accent = typeof ln === 'object' && ln.accent;
    const body = typeof ln === 'object' ? ln.text : ln;
    const sz = typeof ln === 'object' && ln.size ? ln.size : size;
    const f = fit(body, {
      role: accent ? 'serif' : 'head', weight: accent ? 500 : 700,
      size: sz, maxWidth, maxLines: 1, lineHeight: 1, tracking: accent ? -2 : -4, minSize: 54,
    });
    const o = easeOut(unlerp(t, start + n * 7, start + 20 + n * 7));
    out += `<g transform="translate(0 ${round((1 - o) * 26)})">${text(f.lines[0], x, cur, {
      role: accent ? 'serif' : 'head', weight: accent ? 500 : 700, size: f.size,
      fill: accent ? LT.accent : LT.ink, tracking: accent ? -2 : -4, o,
    })}</g>`;
    cur += f.size * (accent ? 0.99 : 1.0);
    n++;
  }
  headline.lastY = cur;
  return out;
}

/**
 * A white card. `ui` draws a real screen inside it; `steps` draws a stepped flow
 * (the "STOO · COUNTER · MIKOPO" slider from the LIMS reel, the A/B/C steps from Model Mpya).
 */
function card(scene, t, {x = 64, y = 560, w = 520, start = 10} = {}) {
  const c = scene.ui || scene.steps;
  if (!c) return '';
  const isUi = !!scene.ui;
  const under = scene.cardUnder === true;   // headline-first beat: card takes the middle band
  const pad = 28;
  const rows = c.rows || [];
  const steps = c.steps || [];
  const rowH = c.rowH || 116;
  const h = isUi
    ? 172 + (c.search ? 82 : 0) + rows.length * rowH + (c.footer ? 76 : 0) + (c.total ? 104 : 0)
    : 168 + steps.length * 78 + 34;
  const p = easeOut(unlerp(t, start, start + 24));
  let out = `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 30)})">`;
  out += `<rect x="${x + 6}" y="${y + 12}" width="${w}" height="${h}" rx="26" fill="${LT.ink}" opacity="0.10"/>`;
  out += rect(x, y, w, h, {fill: LT.card, rx: 26, stroke: LT.cardEdge, sw: 2});

  if (isUi) {
    // title row: a small icon tile, then the product name in two weights
    out += rect(x + pad, y + 28, 66, 66, {fill: LT.ink, rx: 15});
    out += `<rect x="${round(x + pad + 18)}" y="${round(y + 42)}" width="29" height="36" rx="5" fill="${LT.card}"/>`;
    out += text(c.title || '', x + pad + 86, y + 56, {role: 'head', weight: 700, size: 30, fill: LT.ink});
    if (c.sub) out += text(c.sub, x + pad + 86, y + 98, {role: 'body', weight: 700, size: 36, fill: LT.ink});
    let yy = y + 148;
    if (c.search) {
      out += rect(x + pad, yy, w - pad * 2, 58, {fill: '#EFF4FA', rx: 10});
      out += text(c.search, x + pad + 18, yy + 40, {role: 'body', weight: 500, size: 28, fill: LT.inkSoft});
      yy += 85;
    }
    rows.forEach((r, i) => {
      const o = easeOut(unlerp(t, start + 14 + i * 7, start + 30 + i * 7));
      const ry = yy + i * rowH;
      out += `<g opacity="${round(o)}">`;
      out += text(r.name, x + pad, ry + 40, {role: 'body', weight: 600, size: 33, fill: LT.ink});
      if (r.value) {
        const bad = r.tone === 'bad';
        const shift = r.chip ? measure(r.chip, {role: 'mono', weight: 700, size: 24}) + 26 : 0;
        out += text(r.value, x + w - pad - shift, ry + 40, {role: 'body', weight: 700, size: 34, fill: bad ? '#C0392B' : LT.ink, anchor: 'end'});
      }
      if (r.chip) {
        const cw = measure(r.chip, {role: 'mono', weight: 700, size: 24}) + 34;
        out += rect(x + w - pad - cw, ry + 12, cw, 40, {fill: r.tone === 'bad' ? '#FBE3E0' : '#E3F0E6', rx: 20});
        out += text(r.chip, x + w - pad - cw / 2, ry + 40, {role: 'mono', weight: 700, size: 24, fill: r.tone === 'bad' ? '#C0392B' : '#1E7A46', anchor: 'middle'});
      }
      out += '</g>';
    });
    if (c.total) {
      const ty = y + h - (c.footer ? 104 : 50);
      out += line(x + pad, ty - 58, x + w - pad, ty - 58, {stroke: LT.ink, sw: 2, o: 0.12});
      out += text(c.totalLabel || 'Total', x + pad, ty, {role: 'body', weight: 600, size: 30, fill: LT.inkSoft});
      out += text(c.total, x + w - pad, ty, {role: 'head', weight: 700, size: 52, fill: LT.ink, anchor: 'end', tracking: -1});
    }
    if (c.footer) {
      const fw = measure(c.footer, {role: 'body', weight: 600, size: 25}) + 52;
      out += rect(x + pad, y + h - 66, fw, 44, {fill: LT.ink, rx: 22});
      out += text(c.footer, x + pad + fw / 2, y + h - 36, {role: 'body', weight: 600, size: 25, fill: '#FFFFFF', anchor: 'middle'});
    }
  } else {
    // stepped flow: one label per line, a rail with a node per step
    out += text(c.title || '', x + pad, y + 52, {role: 'mono', weight: 700, size: 24, fill: LT.inkSoft, tracking: 2.4});
    steps.forEach((s, i) => {
      const o = easeOut(unlerp(t, start + 12 + i * 6, start + 26 + i * 6));
      const sy = y + 116 + i * 78;
      out += `<g opacity="${round(o)}">`;
      out += circle(x + pad + 11, sy - 11, 9, {fill: s.on ? LT.accent : LT.pillEdge});
      out += text(s.label, x + pad + 42, sy, {role: 'body', weight: s.on ? 700 : 500, size: 34, fill: s.on ? LT.ink : LT.inkSoft});
      out += '</g>';
    });
    const railY = y + h - 34;
    out += line(x + pad + 11, railY, x + w - pad - 11, railY, {stroke: LT.pillEdge, sw: 4});
    const on = steps.findIndex((s) => s.on);
    if (on >= 0) {
      const node = x + pad + 11 + (on * (w - pad * 2 - 22)) / Math.max(1, steps.length - 1);
      out += circle(node, railY, 12, {fill: LT.accent});
    }
  }
  out += '</g>';
  return out;
}

/** A big number beat, used when the number is the story. */
function bigNumber(scene, t, {x = 64, y = 860, start = 10} = {}) {
  const s = scene.stat;
  if (!s) return '';
  const p = easeOut(unlerp(t, start, start + 26));
  return `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 24)})">
    ${text(s.value, x, y, {role: 'head', weight: 700, size: s.size || 240, fill: s.color || LT.ink, tracking: -10})}
    ${s.label ? text(s.label, x, y + 56, {role: 'mono', weight: 600, size: 24, fill: LT.inkSoft, tracking: 2.4}) : ''}
  </g>`;
}

/** The call to action: a navy pill with the keyword, then a plain line under it. */
function cta(scene, t, {x = 64, y = 1240, start = 18} = {}) {
  const c = scene.cta;
  if (!c) return '';
  const p = easeOut(unlerp(t, start, start + 26));
  const label = c.label || 'Andika KIT';
  const w = measure(label, {role: 'body', weight: 700, size: 34}) + 96;
  return `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 22)})">
    ${rect(x + 5, y + 9, w, 78, {fill: LT.ink, rx: 39, o: 0.16})}
    ${rect(x, y, w, 78, {fill: LT.ink, rx: 39})}
    ${text(label, x + 46, y + 51, {role: 'body', weight: 700, size: 34, fill: '#FFFFFF'})}
    ${c.hint ? text(c.hint, x + 4, y + 132, {role: 'body', weight: 600, size: 30, fill: LT.inkSoft}) : ''}
  </g>`;
}

/** What the DM actually delivers: a short white card with three ticks. */
function summaryCard(sum, t, {x = 64, y = 1000, w = 620, start = 26} = {}) {
  const p = easeOut(unlerp(t, start, start + 26));
  const pad = 28;
  const h = 92 + sum.items.length * 62;
  let out = `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 20)})">`;
  out += `<rect x="${x + 6}" y="${y + 10}" width="${w}" height="${h}" rx="24" fill="${LT.ink}" opacity="0.10"/>`;
  out += rect(x, y, w, h, {fill: LT.card, rx: 24, stroke: LT.cardEdge, sw: 2});
  out += text(sum.title || 'KIT', x + pad, y + 50, {role: 'mono', weight: 700, size: 24, fill: LT.inkSoft, tracking: 2.6});
  sum.items.forEach((it, i) => {
    const iy = y + 96 + i * 62;
    out += `<g opacity="${round(easeOut(unlerp(t, start + 8 + i * 5, start + 22 + i * 5)))}">`;
    out += circle(x + pad + 11, iy - 11, 11, {fill: LT.accent, o: 0.14});
    out += `<path d="M${round(x + pad + 5)} ${round(iy - 12)} L${round(x + pad + 10)} ${round(iy - 6)} L${round(x + pad + 18)} ${round(iy - 18)}" fill="none" stroke="${LT.accent}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    out += text(it, x + pad + 40, iy, {role: 'body', weight: 600, size: 31, fill: LT.ink});
    out += '</g>';
  });
  return out + '</g>';
}

/** One navy bar, one or two lines, centred — the only caption the reels use. */
function caption(scene, t, {y = 1734} = {}) {
  const s = scene.captionLine;
  if (!s) return '';
  const p = easeOut(unlerp(t, 8, 26));
  const f = fit(s, {role: 'body', weight: 600, size: 42, maxWidth: 820, maxLines: 2, lineHeight: 1.18, tracking: -0.6, minSize: 30});
  const lh = f.size * 1.18;
  const boxH = f.lines.length * lh + 40;
  const x0 = 44;
  return `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 14)})">
    ${rect(x0, y - boxH + 12, W - x0 * 2, boxH, {fill: LT.capBg, rx: 18})}
    ${f.lines.map((l, i) => text(l, W / 2, y - boxH + 32 + lh * (i + 0.8), {
      role: 'body', weight: 600, size: f.size, fill: '#FFFFFF', anchor: 'middle', tracking: -0.6,
    })).join('')}
  </g>`;
}

/**
 * Draw one frame. The cast is drawn first so cards land in front of her hands, exactly
 * like the p2 finger-on-the-card shot in the shipped reels.
 */
export function light(spec, scene, t, images, track) {
  const mode = scene.mode || (scene.ui || scene.steps ? 'card' : 'hook');
  let out = room(t, {tone: scene.tone || 'paper', streak: scene.streak !== false});

  const c = scene.cast;
  if (c && c.pose) {
    out += floorShadow({x: c.x ?? 860, y: c.groundY ?? 1700, w: (c.h ?? 1180) * 0.22, o: 0.18});
    out += pose(c.pose, t, {
      x: c.x ?? 860, y: c.y ?? 1980, h: c.h ?? 1240,
      enter: c.enter ?? true, flip: !!c.flip,
    });
  }

  if (mode === 'card' || (mode === 'hook' && (scene.steps || scene.ui)))
    out += card(scene, t, {x: scene.cardX ?? 64, y: scene.cardY ?? 600, w: scene.cardW ?? 540, start: scene.cardDelay ?? 10});
  if (mode === 'stat') out += bigNumber(scene, t, {x: scene.statX ?? 64, y: scene.statY ?? 900});
  if (mode === 'cta') {
    out += cta(scene, t, {x: scene.ctaX ?? 64, y: scene.ctaY ?? 1240});
    if (scene.summary) out += summaryCard(scene.summary, t, {x: scene.ctaX ?? 64, y: (scene.ctaY ?? 1240) + 200, w: scene.cardW ?? 620});
  }

  out += headline(scene, t, {
    x: scene.headX ?? 64,
    y: scene.headY ?? 380,
    size: scene.headSize ?? 128,
    maxWidth: scene.headW ?? 940,
  });
  out += pillLockup(scene, t, {x: 64, y: scene.eyebrowY ?? 226});
  return out + caption(scene, t, {y: scene.captionY ?? 1734});
}
