// Core helpers: deterministic motion math, font measuring, SVG primitives.
// No wall clock, no Math.random, no CSS animation. Everything derives from frame.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));

export const W = 1080;
export const H = 1920;
export const FPS = 60;
/** Conservative working box for critical text on 1080x1920. */
export const SAFE = {x0: 84, x1: 996, y0: 300, y1: 1440};
export const CAPTION_BAND = {x0: 84, x1: 996, y0: 1470, y1: 1620};
export const FOOTER_Y = 1816;

/* ---------- deterministic math ---------- */

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const unlerp = (v, a, b) => (b === a ? 0 : clamp((v - a) / (b - a)));

export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t) => (t = clamp(t), t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Damped spring settle, 0 -> 1 with a small overshoot; deterministic. */
export function spring(t, {damping = 0.72, freq = 2.4} = {}) {
  const x = clamp(t);
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - Math.exp(-6.5 * damping * x) * Math.cos(freq * Math.PI * x * 1.55);
}
/** Interpolate over a frame window with clamping. */
export const between = (v, a, b, from, to) => lerp(from, to, easeOut(unlerp(v, a, b)));
/** Reveal state for staggered items. */
export function reveal(t, start, dur = 16) {
  const p = spring(unlerp(t, start, start + dur));
  return {p, o: easeOut(unlerp(t, start, start + dur * 0.55)), dy: (1 - p) * 46};
}
/** Stable pseudo-random 0..1 from a string, used only for static composition choices. */
export function hash01(seed) {
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}
export const pick = (seed, list) => list[Math.floor(hash01(seed) * list.length) % list.length];

/* ---------- fonts ---------- */

// Static weight files only. A variable font instance is fine for measuring but the
// SVG rasteriser silently drops glyphs for named instances, so each weight ships
// its own subset file and the renderer picks it by `font-weight`.
const WEIGHT_ROLES = {
  head: {pkg: 'space-grotesk', family: 'Space Grotesk', weights: [400, 500, 600, 700]},
  body: {pkg: 'inter', family: 'Inter', weights: [400, 500, 600, 700, 800]},
  mono: {pkg: 'jetbrains-mono', family: 'JetBrains Mono', weights: [400, 500, 600, 700, 800]},
  serif: {pkg: 'fraunces', family: 'Fraunces', weights: [400, 500, 600, 700, 800, 900]},
};

const pkgRoot = path.resolve(here, '../node_modules/@fontsource');
const fontPath = (role, weight) => {
  const r = WEIGHT_ROLES[role];
  const w = r.weights.reduce((best, cur) => (Math.abs(cur - weight) < Math.abs(best - weight) ? cur : best), r.weights[0]);
  return path.join(pkgRoot, r.pkg, 'files', `${r.pkg}-latin-${w}-normal.woff2`);
};

export const FAMILY = Object.fromEntries(Object.entries(WEIGHT_ROLES).map(([k, v]) => [k, v.family]));

/** Every weight file the renderer needs registered up front. */
export function fontFiles() {
  const out = [];
  for (const [role, r] of Object.entries(WEIGHT_ROLES)) for (const w of r.weights) out.push(fontPath(role, w));
  return out;
}

let kit = null;
const measureCache = new Map();
function getKit() {
  if (!kit) kit = require('fontkit');
  return kit;
}
const fontCache = new Map();
function loadFace(role, weight) {
  const file = fontPath(role, weight);
  if (fontCache.has(file)) return fontCache.get(file);
  const face = getKit().openSync(file);
  fontCache.set(file, face);
  return face;
}

const metaCache = new Map();
/**
 * The family name + weight + style the rasteriser will match. Google's static
 * subsets rename the family per weight ("Fraunces ExtraBold"), so we read the
 * real names out of the font instead of assuming "Fraunces" + weight 800 works.
 */
export function faceMeta(role, weight) {
  const file = fontPath(role, weight);
  if (metaCache.has(file)) return metaCache.get(file);
  const face = loadFace(role, weight);
  const sub = String(face.subfamilyName || 'Regular').toLowerCase();
  const style = /italic|oblique/.test(sub) ? 'italic' : 'normal';
  const w = /black|heavy/.test(sub) ? 900 : /extrabold|ultrabold/.test(sub) ? 800 : /semibold|demibold/.test(sub) ? 600 : /bold/.test(sub) ? 700 : /medium/.test(sub) ? 500 : 400;
  const meta = {family: face.familyName, weight: w, style, file};
  metaCache.set(file, meta);
  return meta;
}

/** Measured width of a single line in px. */
export function measure(str, {role = 'body', weight = 500, size = 40, tracking = 0} = {}) {
  const text = glyphSafe(str);
  const key = `${role}|${weight}|${size}|${tracking}|${text}`;
  if (measureCache.has(key)) return measureCache.get(key);
  const face = loadFace(role, weight);
  const run = face.layout(glyphSafe(text));
  const scale = size / (face.unitsPerEm || 1000);
  const n = run.glyphs.length;
  const w = run.advanceWidth * scale + Math.max(0, n - 1) * tracking;
  measureCache.set(key, w);
  return w;
}

/** Greedy wrap; returns lines. Long words are left intact and reported. */
export function wrap(text, maxWidth, opts) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (measure(next, opts) <= maxWidth || !cur) cur = next;
    else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * Fit a text block: shrink size (down to min) until lines <= maxLines and each fits.
 * Returns {size, lines, width, overflow}.
 */
export function fit(text, {maxWidth, size, minSize = Math.round(size * 0.52), maxLines = 3, ...opts}) {
  for (let s = size; s >= minSize; s -= 2) {
    const lines = wrap(text, maxWidth, {...opts, size: s});
    if (lines.length <= maxLines && Math.max(...lines.map((l) => measure(l, {...opts, size: s}))) <= maxWidth) {
      return {size: s, lines, widest: Math.max(...lines.map((l) => measure(l, {...opts, size: s}))), overflow: false};
    }
  }
  const lines = wrap(text, maxWidth, {...opts, size: minSize});
  return {
    size: minSize,
    lines: lines.slice(0, maxLines),
    widest: Math.max(...lines.map((l) => measure(l, {...opts, size: minSize}))),
    overflow: true,
  };
}

/* ---------- svg primitives ---------- */

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function attrs(o) {
  return Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false && v !== '')
    .map(([k, v]) => `${k}="${typeof v === 'number' ? round(v) : esc(v)}"`)
    .join(' ');
}

export const round = (n) => Math.round(n * 100) / 100;

export function rect(x, y, w, h, {fill = '#000', rx = 0, o, stroke, sw = 2, extra = ''} = {}) {
  return `<rect ${attrs({x, y, width: w, height: h, rx, fill, opacity: o, stroke, 'stroke-width': stroke ? sw : undefined})} ${extra}/>`;
}

export function circle(cx, cy, r, {fill = '#000', o, stroke, sw = 2} = {}) {
  return `<circle ${attrs({cx, cy, r, fill, opacity: o, stroke, 'stroke-width': stroke ? sw : undefined})}/>`;
}

export function line(x1, y1, x2, y2, {stroke = '#000', sw = 2, o, dash, cap = 'round'} = {}) {
  return `<line ${attrs({x1, y1, x2, y2, stroke, 'stroke-width': sw, opacity: o, 'stroke-linecap': cap, 'stroke-dasharray': dash})}/>`;
}

/**
 * Text line. Always passes an explicit family + weight so the renderer never guesses.
 * `anchor` start|middle|end. `opacity` and transforms are applied by the caller via `extra`.
 */
/** Latin subsets drop arrows and math glyphs; map them to readable ASCII before typing. */
const GLYPHS = {'≠': 'si', '→': '>', '←': '<', '≥': '>=', '≤': '<=', '×': 'x', '÷': '/', '—': '-', '–': '-', '€': 'EUR ', '≈': '~'};
export const glyphSafe = (s) => String(s).replace(/[≠→←≥≤×÷€≈]/g, (m) => GLYPHS[m] ?? m);

export function text(str, x, y, {
  role = 'body', weight = 500, size = 40, fill = '#111', tracking = 0,
  anchor = 'start', o, extra = '', lineHeight,
} = {}) {
  const runs = layoutRun(glyphSafe(str), {role, weight, size, tracking});
  const shift = anchor === 'end' ? -runs.width : anchor === 'middle' ? -runs.width / 2 : 0;
  return `<g ${attrs({'data-t': 'text', transform: `translate(${round(x + shift)} ${round(y)})`, fill, opacity: o, style: 'font-kerning:normal'})} ${extra}>${runs.d}</g>`;
}

/** Glyph outlines for one line, translated so the baseline sits at y=0, x starts at 0. */
export function layoutRun(str, {role, weight, size, tracking = 0}) {
  const face = loadFace(role, weight);
  const run = face.layout(str);
  const scale = size / (face.unitsPerEm || 1000);
  let x = 0;
  const parts = [];
  const n = run.glyphs.length;
  for (let i = 0; i < n; i++) {
    const g = run.glyphs[i];
    const pos = run.positions[i];
    const gx = x + (pos?.xOffset || 0) * scale;
    if (g.path && g.path.commands.length) {
      parts.push(`<path transform="translate(${round(gx)} 0) scale(${round(scale * 10000) / 10000} ${round(-scale * 10000) / 10000})" d="${g.path.toSVG()}"/>`);
    }
    x += (pos?.xAdvance ?? g.advanceWidth) * scale;
    if (i < n - 1) x += tracking;
  }
  return {d: parts.join(''), width: Math.max(0, x), face};
}

/** Multi-line block; returns svg + total height. `y` is the first baseline. */
export function block(str, x, y, {
  role = 'body', weight = 500, size = 42, fill = '#111', tracking = 0,
  maxWidth = 840, maxLines = 3, lineHeight = 1.06, anchor = 'start', o, minSize, extra = '',
} = {}) {
  const f = fit(str, {role, weight, size, tracking, maxWidth, maxLines, minSize});
  const lh = f.size * lineHeight;
  const aligned = anchor === 'end' ? x + maxWidth : anchor === 'middle' ? x + maxWidth / 2 : x;
  const svg = f.lines
    .map((l, i) => text(l, aligned, y + i * lh, {role, weight, size: f.size, fill, tracking, anchor, o, extra}))
    .join('');
  return {svg, size: f.size, lines: f.lines, height: f.lines.length * lh - (lh - f.size), overflow: f.overflow};
}

/** Pill / chip with text; auto width. Returns {svg,width}. */
export function pill(label, x, y, {
  role = 'mono', weight = 700, size = 30, fill = '#DFFC77', ink = '#161827',
  padX = 22, padY = 14, rx = 8, tracking = 1.2, stroke, o = 1, anchor = 'start', extra = '',
} = {}) {
  const w = measure(label, {role, weight, size, tracking}) + padX * 2;
  const h = size + padY * 2;
  const left = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  const svg =
    `<g ${attrs({opacity: o})} ${extra}>` +
    rect(left, y, w, h, {fill, rx, stroke, sw: 2}) +
    text(label, left + w / 2, y + h / 2 + size * 0.35, {role, weight, size, fill: ink, tracking, anchor: 'middle'}) +
    `</g>`;
  return {svg, width: w, height: h, x: left, y};
}

/** Sticker: rotated card with shadow, deterministic angle from seed. */
export function sticker(inner, {x, y, angle = -4, shadow = 0.16} = {}) {
  return `<g transform="translate(${round(x)} ${round(y)}) rotate(${round(angle)})"><g filter="url(#soft)">${inner}</g></g>`;
}

export function arrow(x1, y1, x2, y2, {stroke = '#161827', sw = 5, o = 1, head = 16} = {}) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2 - Math.cos(ang) * head * 0.9;
  const hy = y2 - Math.sin(ang) * head * 0.9;
  const p = (a) => `${round(x2 + Math.cos(a) * head)},${round(y2 + Math.sin(a) * head)}`;
  return `<g ${attrs({opacity: o})}>${line(x1, y1, hx, hy, {stroke, sw})}<path d="M${round(hx)},${round(hy)} L${p(ang + 2.5)} L${p(ang - 2.5)} Z" fill="${stroke}"/></g>`;
}

/** Rounded-rect path used for animated strokes (draw-on). */
export function roundedPath(x, y, w, h, r = 16) {
  return `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
}

/** Cover flow: animated dashed route between two points. */
export function route(x1, y1, x2, y2, p, {stroke = '#3343C5', sw = 4, dash = '12 14', o = 1} = {}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  return line(x1, y1, lerp(x1, x2, p), lerp(y1, y2, p), {stroke, sw, dash, o});
}

/** Small crosshair ticks, a quiet signature detail. */
export function ticks(seed, {color = '#161827', o = 0.18} = {}) {
  const spots = [[36, 36], [W - 36, 36], [36, H - 36], [W - 36, H - 36]];
  return spots
    .map(([x, y]) => {
      const s = 12 + Math.round(hash01(`${seed}${x}${y}`) * 6);
      return line(x - s, y, x + s, y, {stroke: color, sw: 2, o}) + line(x, y - s, x, y + s, {stroke: color, sw: 2, o});
    })
    .join('');
}

export function gridLines({x = 0, y = 0, w = W, h = H, step = 64, color = '#161827', o = 0.05} = {}) {
  let out = '';
  for (let gx = x; gx <= x + w; gx += step) out += line(gx, y, gx, y + h, {stroke: color, sw: 1, o});
  for (let gy = y; gy <= y + h; gy += step) out += line(x, gy, x + w, gy, {stroke: color, sw: 1, o});
  return out;
}

export function readImage(file) {
  if (!file) return null;
  const p = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return null;
  const ext = path.extname(p).toLowerCase().replace('.', '') || 'png';
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  return `data:image/${mime};base64,${fs.readFileSync(p).toString('base64')}`;
}

export const isImage = (v) => typeof v === 'string' && v.startsWith('data:image/');
