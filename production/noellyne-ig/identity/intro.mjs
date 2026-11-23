/**
 * Noellyne IG / YT intro — 16.5 s identity sting.
 *
 * Rebuilt after the owner's notes:
 *
 *   · "dont prioritize dark bgs … neons nyeusi kisa tupo in tech" — every set is
 *     daylight. Cream paper, soft mint, warm sand, lilac sky. Accents stay
 *     saturated, the field does not. Nothing in this file paints a black frame.
 *
 *   · "mbona mouth movements hamna" — she now speaks. `out/mouth.json` is a real
 *     viseme track measured from the mix by `production/noellyne-host/lipsync.py`
 *     and handed to `performerDraw`, which picks her own AI mouth plate per frame.
 *     58.9 % of frames are open.
 *
 *   · "hana legs … isionekane kama floating sticker" — every shot ends on a
 *     physical desk, and her hem goes BEHIND it. Nothing is cropped mid-air.
 *
 * Run:
 *   export FFMPEG=…
 *   python3 production/noellyne-host/lipsync.py out/intro.wav out/mouth.json --fps 30
 *   node production/noellyne-ig/identity/intro.mjs
 *   node production/noellyne-ig/identity/intro.mjs --landscape
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, FONTS } from "../../noellyne-host/host.mjs";

const ROOT = process.cwd();
const HERE = path.join(ROOT, "production/noellyne-ig/identity");
const OUT = path.join(HERE, "out");
const FF = process.env.FFMPEG;

/**
 * `--landscape` renders the same timeline at 1920×1080 for YouTube. The
 * composition has to change with the aspect: a centred portrait in 16:9 leaves
 * two dead columns and puts the name on her head, so wide frames move the type
 * into a left column and crop her against the right edge.
 */
const WIDE = process.argv.includes("--landscape");
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920, FPS = 30;

/* --------------------------------------------------------------- palette */

const PAPER = "#fbf7ef";
const CREAM = "#f7f1e6";
const INK = "#1d2a33";
const SLATE = "#5b6b76";
const LILAC = "#b9a6f2";
const VIOLET = "#5b3fb5";
const MINT = "#2fa87a";
const SAND = "#f4e3c4";
const CORAL = "#e8735a";
const GOLD = "#c98a1f";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, f) => { const q = clamp((f - a) / (b - a)); return q * q * (3 - 2 * q); };
const hash = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

/* --------------------------------------------------------------- helpers */

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function rect(c, x, y, w, h, r, col) { rr(c, x, y, w, h, r); c.fillStyle = col; c.fill(); }
function dot(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); }
function line(c, pts, col, px = 2) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
  c.strokeStyle = col; c.lineWidth = px; c.lineCap = "round"; c.stroke();
}
function orbit(c, cx, cy, r, col, dash = 24, lw = 2, phase = 0) {
  c.save();
  c.strokeStyle = col; c.lineWidth = lw;
  c.setLineDash([dash, dash * 0.85]); c.lineDashOffset = phase;
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  c.restore();
}
function pool(c, cx, cy, r, rgb, strength = 0.5) {
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(${rgb},${strength})`);
  g.addColorStop(0.55, `rgba(${rgb},${strength * 0.42})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(cx - r, cy - r, r * 2, r * 2);
}
function type(c, s, x, y, size, o = {}) {
  const { family = FONTS.sans, color = INK, weight = 700, align = "left",
          track = 0, alpha = 1 } = o;
  c.save();
  c.globalAlpha *= alpha;
  c.font = `${weight} ${size}px '${family}'`;
  c.fillStyle = color; c.textAlign = align; c.textBaseline = "alphabetic";
  if (track) {
    const chars = [...s];
    const ws = chars.map((ch) => c.measureText(ch).width + track);
    const total = ws.reduce((a, b) => a + b, 0) - track;
    let cx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    chars.forEach((ch, i) => { c.fillText(ch, cx, y); cx += ws[i]; });
  } else c.fillText(s, x, y);
  c.restore();
}
function mono(c, s, x, y, size, o = {}) { type(c, s, x, y, size, { family: FONTS.mono, weight: 500, ...o }); }

/** Daylight wash — the base of every set. */
function wash(c, top, mid, low) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(0.52, mid); g.addColorStop(1, low);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

/**
 * The desk. This is the answer to "hana legs": her hem goes behind the top
 * surface, so the frame never shows her ending. Depth in three parts — the
 * contact shadow, the receding top plane, then the apron.
 */
function desk(c, y, { color = "#eee2cd", apron = "#e2d3b9", bottom = H } = {}) {
  const inset = W * 0.072;
  const depth = W * 0.058;
  const sg = c.createLinearGradient(0, y - 10, 0, y + depth);
  sg.addColorStop(0, "rgba(31,44,54,0.22)");
  sg.addColorStop(1, "rgba(31,44,54,0)");
  c.fillStyle = sg; c.fillRect(0, y - 10, W, depth + 10);

  c.beginPath();
  c.moveTo(inset, y); c.lineTo(W - inset, y);
  c.lineTo(W, y + depth); c.lineTo(0, y + depth);
  c.closePath();
  const tg = c.createLinearGradient(0, y, 0, y + depth);
  tg.addColorStop(0, color); tg.addColorStop(1, "#f4ecdd");
  c.fillStyle = tg; c.fill();
  line(c, [[0, y + depth], [W, y + depth]], "rgba(255,255,255,0.9)", 3);

  const ag = c.createLinearGradient(0, y + depth, 0, bottom);
  ag.addColorStop(0, apron);
  ag.addColorStop(0.55, "#e9dcc4");
  ag.addColorStop(1, "#f2e9d8");
  c.fillStyle = ag; c.fillRect(0, y + depth, W, bottom - (y + depth));
  return { y, front: y + depth };
}

/** Loose sheets lying on the floor — the bottom band needs something to be. */
function floorPapers(c, top, seed = 3) {
  for (let i = 0; i < 2; i++) {
    const w = W * (0.13 + hash(seed + i) * 0.06);
    const h = w * 0.72;
    const x = W * (0.14 + i * 0.56) + hash(seed + i * 7) * W * 0.08;
    const y = top + (H - top) * (0.30 + hash(seed + i * 5) * 0.30);
    c.save();
    c.translate(x, y);
    c.rotate((hash(seed + i * 3) - 0.5) * 0.5);
    c.globalAlpha = 0.85;
    c.shadowColor = "rgba(31,44,54,0.20)"; c.shadowBlur = 18; c.shadowOffsetY = 8;
    c.fillStyle = "#fffdf8";
    c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 3); c.fill();
    c.shadowColor = "transparent"; c.shadowBlur = 0;
    for (let j = 0; j < 2; j++) {
      c.fillStyle = "rgba(29,42,51,0.13)";
      c.beginPath();
      c.roundRect(-w * 0.34, -h * 0.18 + j * h * 0.22, w * (0.4 + hash(seed + i + j) * 0.3), h * 0.055, 2);
      c.fill();
    }
    c.restore();
  }
}

/** The floor, so the desk sits on something. */
function floorPlane(c, top, tone = "222,208,244") {
  const g = c.createLinearGradient(0, top - 30, 0, H);
  g.addColorStop(0, `rgba(${tone},0)`);
  g.addColorStop(0.35, `rgba(${tone},0.34)`);
  g.addColorStop(1, `rgba(${tone},0.85)`);
  c.fillStyle = g; c.fillRect(0, top - 30, W, H - (top - 30));
  const sg = c.createLinearGradient(0, top, 0, top + H * 0.045);
  sg.addColorStop(0, "rgba(31,44,54,0.15)");
  sg.addColorStop(1, "rgba(31,44,54,0)");
  c.fillStyle = sg; c.fillRect(0, top, W, H * 0.045);
}

/** Paper with a real drop shadow, so the cut-outs sit IN the set. */
function paper(c, x, y, w, h, deg, { seed = 1, rules = 0, grid = false } = {}) {
  c.save();
  c.translate(x + w / 2, y + h / 2);
  c.rotate((deg * Math.PI) / 180);
  c.shadowColor = "rgba(31,44,54,0.20)"; c.shadowBlur = 26; c.shadowOffsetY = 12;
  c.fillStyle = "#fffdf8";
  c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 4); c.fill();
  c.shadowColor = "transparent"; c.shadowBlur = 0;
  c.strokeStyle = "rgba(29,42,51,0.10)"; c.lineWidth = 1.4;
  c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 4); c.stroke();
  const pad = Math.min(w, h) * 0.14;
  if (grid) {
    c.strokeStyle = "rgba(91,107,118,0.22)"; c.lineWidth = 1;
    const step = w / 9;
    for (let i = 1; i < 9; i++) {
      c.beginPath(); c.moveTo(-w / 2 + i * step, -h / 2 + pad);
      c.lineTo(-w / 2 + i * step, h / 2 - pad); c.stroke();
    }
    for (let j = 1; j < 8; j++) {
      c.beginPath(); c.moveTo(-w / 2 + pad, -h / 2 + j * (h / 8));
      c.lineTo(w / 2 - pad, -h / 2 + j * (h / 8)); c.stroke();
    }
  } else if (rules) {
    for (let i = 0; i < rules; i++) {
      const y2 = -h / 2 + pad + (i + 1) * ((h - pad * 2) / (rules + 1.4));
      const wid = (w - pad * 2) * (0.55 + hash(seed + i) * 0.42);
      rect(c, -w / 2 + pad, y2, wid, Math.max(5, h * 0.022), 3,
           i === 0 ? "rgba(91,63,181,0.62)" : "rgba(29,42,51,0.17)");
    }
  } else {
    rect(c, -w / 2 + pad, -h / 2 + pad, (w - pad * 2) * 0.44, h * 0.055, 3, "rgba(91,63,181,0.55)");
    for (let i = 0; i < 3; i++) {
      rect(c, -w / 2 + pad, -h / 2 + pad + h * 0.17 * (i + 1),
           (w - pad * 2) * (0.5 + hash(seed + i) * 0.4), Math.max(4, h * 0.018), 2, "rgba(29,42,51,0.16)");
    }
  }
  c.restore();
}

/** Laptop in three-quarter, so it reads as a machine and not a picture frame. */
function laptop(c, x, baseY, w) {
  const h = w * 0.60, lean = w * 0.10;
  c.save();
  c.shadowColor = "rgba(31,44,54,0.24)"; c.shadowBlur = 20; c.shadowOffsetY = 8;
  c.beginPath();
  c.moveTo(x, baseY); c.lineTo(x + w, baseY - w * 0.04);
  c.lineTo(x + w + w * 0.06, baseY + w * 0.09); c.lineTo(x - w * 0.05, baseY + w * 0.12);
  c.closePath(); c.fillStyle = "#eef1f4"; c.fill();
  c.shadowColor = "transparent"; c.shadowBlur = 0;
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const kx = x + w * 0.07 + t * w * 0.80;
      const ky = baseY + (r * w * 0.024) - t * w * 0.028 + w * 0.016;
      rect(c, kx, ky, w * 0.072, w * 0.014, 2, "rgba(29,42,51,0.13)");
    }
  }
  c.beginPath();
  c.moveTo(x, baseY); c.lineTo(x + w - lean * 0.2, baseY - w * 0.04);
  c.lineTo(x + w - lean * 0.2, baseY - w * 0.04 - h); c.lineTo(x, baseY - h);
  c.closePath(); c.fillStyle = "#f4f6f8"; c.fill();
  c.strokeStyle = "rgba(29,42,51,0.10)"; c.lineWidth = 1.6; c.stroke();
  const sx = x + w * 0.055, sy = baseY - h + w * 0.05;
  const sw = w * 0.88, sh = h - w * 0.12;
  const sg = c.createLinearGradient(sx, sy, sx + sw, sy + sh);
  sg.addColorStop(0, "#f1ecfe"); sg.addColorStop(1, "#ddd2f9");
  rect(c, sx, sy, sw, sh, w * 0.012, sg);
  for (let i = 0; i < 3; i++) {
    rect(c, sx + sw * 0.10, sy + sh * (0.22 + i * 0.19),
         sw * (0.30 + hash(i + 3) * 0.38), sh * 0.072, 3, "rgba(91,63,181,0.38)");
  }
  rect(c, sx + sw * 0.10, sy + sh * (0.22 + 3 * 0.19), sw * 0.17, sh * 0.072, 3, "rgba(47,168,122,0.70)");
  c.restore();
}

function mug(c, x, baseY, w, col = "#ffffff", tea = "#c98a4b") {
  const h = w * 1.02;
  c.save();
  c.shadowColor = "rgba(31,44,54,0.22)"; c.shadowBlur = 16; c.shadowOffsetY = 7;
  rect(c, x, baseY - h, w, h, w * 0.16, col);
  c.shadowColor = "transparent"; c.shadowBlur = 0;
  c.strokeStyle = col; c.lineWidth = w * 0.15;
  c.beginPath(); c.arc(x + w + w * 0.02, baseY - h * 0.56, w * 0.26, -Math.PI * 0.46, Math.PI * 0.46); c.stroke();
  c.fillStyle = tea;
  c.beginPath(); c.ellipse(x + w / 2, baseY - h + w * 0.03, w * 0.41, w * 0.10, 0, 0, Math.PI * 2); c.fill();
  c.restore();
}

function plant(c, x, baseY, w, { pot = "#e8d3b3", leaf = "#4f9e78" } = {}) {
  const potH = w * 0.72, trunk = w * 0.42;
  c.save();
  c.shadowColor = "rgba(31,44,54,0.22)"; c.shadowBlur = 18; c.shadowOffsetY = 8;
  c.beginPath();
  c.moveTo(x - w * 0.5, baseY - potH); c.lineTo(x + w * 0.5, baseY - potH);
  c.lineTo(x + w * 0.38, baseY); c.lineTo(x - w * 0.38, baseY);
  c.closePath(); c.fillStyle = pot; c.fill();
  c.shadowColor = "transparent"; c.shadowBlur = 0;
  c.strokeStyle = "#3f7d5e"; c.lineWidth = w * 0.06; c.lineCap = "round";
  c.beginPath();
  c.moveTo(x, baseY - potH);
  c.quadraticCurveTo(x + w * 0.05, baseY - potH - trunk * 0.7, x, baseY - potH - trunk);
  c.stroke();
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1;
    const rise = (0.28 + (i / 6) * 0.95) * w;
    const reach = side * w * (0.34 + hash(i + 4) * 0.30) * (1 - i * 0.06);
    const ty = baseY - potH - trunk - rise * 0.72;
    const tx = x + reach;
    c.strokeStyle = i % 3 === 1 ? "#6bb491" : "#3f7d5e";
    c.lineWidth = w * 0.04;
    c.beginPath();
    c.moveTo(x, baseY - potH - trunk * (0.85 - i * 0.10));
    c.quadraticCurveTo(x + reach * 0.45, ty - rise * 0.28, tx, ty);
    c.stroke();
    c.fillStyle = i % 3 === 1 ? "#6bb491" : leaf;
    c.beginPath();
    c.ellipse(tx, ty, w * 0.185, w * 0.098, side * -0.42 + (hash(i + 9) - 0.5) * 0.5, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

function books(c, x, baseY, w) {
  const cols = ["#cfe3d6", "#f3ddc0", "#dcd2f8"];
  let y = baseY;
  for (let i = 0; i < 3; i++) {
    const bw = w * (0.86 + hash(i + 21) * 0.3), bh = w * 0.14;
    c.save();
    c.shadowColor = "rgba(31,44,54,0.16)"; c.shadowBlur = 12; c.shadowOffsetY = 5;
    rect(c, x, y - bh, bw, bh, 4, cols[i % cols.length]);
    c.restore();
    y -= bh;
  }
}

/* ------------------------------------------------------------------ host */

await loadFonts();
const HOST = await loadHost();

/**
 * Real photographed props, cut out of their studio white by `cut-props.py`.
 * The owner asked for "real reference za vitu kama picha … umezicut out vyema":
 * hand-drawn props read as clip art next to a rendered character at feed size,
 * so the desk objects are photographs now. The cut carries no shadow, so a
 * soft contact ellipse is painted under each one — that is what seats it on
 * the surface.
 */
const PROPS = {};
for (const n of ["laptop", "mug", "plant"]) {
  PROPS[n] = await loadImage(path.join(HERE, "props", n + ".png"));
}

/**
 * Stamp a photographed prop. `x` is the LEFT edge for laptop/mug and the
 * CENTRE for plant, matching the drawn versions they replace, so call sites
 * keep their numbers. `baseY` is where the object stands.
 */
function photoProp(c, name, x, baseY, w, { center = false } = {}) {
  const img = PROPS[name];
  const h = (w * img.height) / img.width;
  const cx = center ? x : x + w / 2;
  const g = c.createRadialGradient(cx, baseY, 0, cx, baseY, w * 0.55);
  g.addColorStop(0, "rgba(31,44,54,0.28)");
  g.addColorStop(0.55, "rgba(31,44,54,0.12)");
  g.addColorStop(1, "rgba(31,44,54,0)");
  c.save();
  c.translate(cx, baseY); c.scale(1, 0.22); c.translate(-cx, -baseY);
  c.fillStyle = g;
  c.beginPath(); c.arc(cx, baseY, w * 0.55, 0, Math.PI * 2); c.fill();
  c.restore();
  c.drawImage(img, center ? x - w / 2 : x, baseY - h, w, h);
}
const INK_H = 0.985;

/**
 * Feathered mouth plates.
 *
 * The AI viseme PNGs carry a little opaque near-black outside her jaw — the
 * render's background where the white-key did not bite. Drawn square that lands
 * on her cheek as a dark smudge. So each plate is masked to the pose's OWN alpha
 * (the exact shape of her) plus a soft radial falloff, once, at load.
 */
const PLATES = new Map();
function plate(pose, file) {
  const key = pose + "|" + file;
  if (PLATES.has(key)) return PLATES.get(key);
  const src = HOST.layers[file];
  const cv = createCanvas(src.width, src.height);
  const c = cv.getContext("2d");
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = "destination-in";
  const g = c.createRadialGradient(
    cv.width / 2, cv.height / 2, 0, cv.width / 2, cv.height / 2, cv.width * 0.46,
  );
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.62, "rgba(0,0,0,1)");
  g.addColorStop(0.86, "rgba(0,0,0,0.65)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
  c.globalCompositeOperation = "destination-in";
  c.drawImage(HOST.layers[HOST.rig.poses[pose].base.file], 0, 0);
  PLATES.set(key, cv);
  return cv;
}

/**
 * Her, on a light set. `mouth` is a viseme track (or `false` for none). Her own
 * AI plates are stamped by `performerDraw`; we only re-mask them here.
 */
function her(c, pose, x, y, w, opts = {}) {
  const { mouth = false, frame = 0, cues = [], nods = [] } = opts;
  const draw = performerDraw(c, HOST, FPS);
  draw(frame, "review", { pose, mouth, x, y, w, cues, nods });
  return { x, y, w, hemY: y + w * INK_H, cx: x + w / 2 };
}

function herShadow(c, cx, atY, w) {
  const g = c.createRadialGradient(cx, atY, 0, cx, atY, w * 0.44);
  g.addColorStop(0, "rgba(31,44,54,0.24)");
  g.addColorStop(0.5, "rgba(31,44,54,0.09)");
  g.addColorStop(1, "rgba(31,44,54,0)");
  c.save();
  c.translate(cx, atY); c.scale(1, 0.20); c.translate(-cx, -atY);
  c.fillStyle = g;
  c.beginPath(); c.arc(cx, atY, w * 0.44, 0, Math.PI * 2); c.fill();
  c.restore();
}

/* ------------------------------------------------------------------ sets */

function setLilac(c, f, s, e) {
  wash(c, "#faf6ff", "#f0e8ff", "#e2d3fa");
  const u = clamp((f - s) / (e - s));
  pool(c, W * 0.50, H * 0.30, W * 0.66, "255,255,255", 0.85);
  pool(c, W * 0.74, H * 0.18, W * 0.30, "206,236,255", 0.40);
  // the sun disc drifts a little, so the light feels alive without flicker
  c.save();
  c.globalAlpha = 0.46;
  c.fillStyle = "#ffd9c6";
  c.beginPath(); c.arc(W * 0.80 + u * W * 0.02, H * 0.15, W * 0.20, 0, Math.PI * 2); c.fill();
  c.restore();
  orbit(c, W * 0.5, H * 0.31, W * 0.42, "rgba(91,63,181,0.16)", 26, 2.5, f * 1.1);
  orbit(c, W * 0.5, H * 0.31, W * 0.55, "rgba(91,63,181,0.09)", 40, 2, -f * 0.7);
  // a few motes drifting up — she is in daylight, dust is honest
  for (let i = 0; i < 22; i++) {
    const h1 = hash(i + 1), h2 = hash(i + 91);
    const yy = H * 0.62 - ((h2 + u * 0.5) % 1) * H * 0.44;
    dot(c, W * (0.1 + h1 * 0.8), yy, 1 + h1 * 1.8, `rgba(255,255,255,${0.25 + h1 * 0.4})`);
  }
  floorPlane(c, H * 0.86, "236,222,250");
}

function setMint(c, f, s, e) {
  wash(c, "#f4fbf7", "#e4f4ec", "#cfe9dd");
  const u = clamp((f - s) / (e - s));
  pool(c, W * 0.50, H * 0.30, W * 0.64, "255,255,255", 0.80);
  pool(c, W * 0.82, H * 0.14, W * 0.34, "255,240,206", 0.34);
  c.save();
  c.globalAlpha = 0.40;
  const ag = c.createLinearGradient(0, H * 0.06, 0, H * 0.72);
  ag.addColorStop(0, "#cfeade"); ag.addColorStop(1, "rgba(207,234,222,0.15)");
  c.fillStyle = ag;
  c.beginPath();
  c.arc(W * 0.5, H * 0.30, W * 0.30, Math.PI, 0);
  c.lineTo(W * 0.80, H * 0.72); c.lineTo(W * 0.20, H * 0.72);
  c.closePath(); c.fill();
  c.restore();
  orbit(c, W * 0.5, H * 0.31, W * 0.42, "rgba(47,168,122,0.16)", 24, 2.5, f * 1.2);
  // a light bar travelling across the back wall
  const bx = ((u * 0.7) % 1) * (W + 700) - 350;
  const bg = c.createLinearGradient(bx - 320, 0, bx + 320, 0);
  bg.addColorStop(0, "rgba(255,255,255,0)");
  bg.addColorStop(0.5, "rgba(255,255,255,0.30)");
  bg.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = bg; c.fillRect(bx - 320, 0, 640, H);
  floorPlane(c, H * 0.86, "206,232,218");
}

function setSand(c, f, s, e) {
  wash(c, "#fdf8ee", "#f7ecd7", "#efdfc2");
  const u = clamp((f - s) / (e - s));
  pool(c, W * 0.50, H * 0.28, W * 0.66, "255,255,255", 0.82);
  pool(c, W * 0.20, H * 0.16, W * 0.34, "255,226,186", 0.42);
  // slatted window light, drifting very slowly so the pattern breathes
  c.save();
  c.globalAlpha = 0.26;
  c.translate(u * W * 0.012, 0);
  for (let i = 0; i < 7; i++) {
    const x = W * 0.58 + i * W * 0.058;
    c.fillStyle = "#ffe6bd";
    c.beginPath();
    c.moveTo(x, 0); c.lineTo(x + W * 0.030, 0);
    c.lineTo(x + W * 0.008, H * 0.72); c.lineTo(x - W * 0.020, H * 0.72);
    c.closePath(); c.fill();
  }
  c.restore();
  orbit(c, W * 0.5, H * 0.31, W * 0.44, "rgba(201,138,31,0.16)", 28, 2.5, f * 0.9);
  floorPlane(c, H * 0.86, "240,224,196");
}

function setSky(c, f, s, e) {
  wash(c, "#f8fbff", "#eaf2fd", "#dce8f8");
  const u = clamp((f - s) / (e - s));
  pool(c, W * 0.50, H * 0.28, W * 0.68, "255,255,255", 0.9);
  pool(c, W * 0.30, H * 0.14, W * 0.34, "255,240,214", 0.40);
  // three soft clouds, rising slowly
  for (let i = 0; i < 3; i++) {
    const cy = H * (0.20 + i * 0.10) - u * H * 0.02;
    const cx = W * (0.24 + i * 0.28);
    c.save();
    c.globalAlpha = 0.55;
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.ellipse(cx, cy, W * 0.16, W * 0.055, 0, 0, Math.PI * 2);
    c.ellipse(cx + W * 0.09, cy + W * 0.012, W * 0.11, W * 0.045, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  orbit(c, W * 0.5, H * 0.30, W * 0.42, "rgba(91,63,181,0.14)", 30, 2.5, f * 1.15);
  floorPlane(c, H * 0.86, "214,228,246");
}

/* ------------------------------------------------------------------ shots */

const TL = JSON.parse(fs.readFileSync(path.join(OUT, "timeline.json"), "utf8"));
const MOUTH = JSON.parse(fs.readFileSync(path.join(OUT, "mouth.json"), "utf8")).frames;

const COPY = {
  hook:    { set: setSky,  pose: "wave",  accent: VIOLET,
             head: ["Tech", "inakuchanganya?"], sub: "TUIWEKE RAHISI", tag: "01 — HELLO" },
  name:    { set: setLilac, pose: "desk", accent: VIOLET,
             head: ["MIMI NI", "Noellyne."], sub: "TECH HOST · ALTRAWARE", tag: "02 — STUDIO" },
  promise: { set: setSand, pose: "point", accent: GOLD,
             head: ["APPS · AI · TOOLS", "bila hype."], sub: "KILA SIKU, KITU KIMOJA", tag: "03 — FLOOR" },
  cta:     { set: setMint, pose: "peace", accent: MINT,
             head: ["FOLLOW", "tukutane hapa."], sub: "IG · YOUTUBE · @noellyne", tag: "04 — OUTRO" },
};
const SHOT = TL.spans.map((sp) => ({ ...COPY[sp.id], id: sp.id, at: sp.start, len: sp.end - sp.start }));
const TOTAL = TL.frames;

function drawFrame(c, f) {
  const sh = SHOT.find((s) => f >= s.at && f < s.at + s.len) || SHOT[SHOT.length - 1];
  const s = sh.at, e = s + sh.len;
  const u = clamp((f - s) / (e - s));

  c.save();
  const cam = 1 + 0.05 * u;
  c.translate(W / 2, H / 2); c.scale(cam, cam); c.translate(-W / 2, -H / 2);
  sh.set(c, f, s, e);
  c.restore();

  // her: big, cropped by the frame, never rescaled mid-shot
  const w = WIDE ? (sh.pose === "peace" ? 810 : 790) : (sh.pose === "peace" ? 885 : 870);
  const x = WIDE
    ? W - w * 0.80 + (sh.pose === "point" ? -50 : 0)
    : (W - w) / 2 + (sh.pose === "point" ? -22 : 0);
  const y = WIDE
    ? H * (sh.pose === "point" ? 0.070 : 0.090)
    : H * (sh.pose === "point" ? 0.088 : 0.104);
  const hem = y + w * INK_H;

  pool(c, x + w * 0.5, y + w * 0.28, w * 0.76, "255,255,255", 0.55);

  // ── her mouth. `mouth: false` tells performerDraw to draw NO plate — we
  //    stamp our own masked one below. Passing the track here drew the raw AI
  //    plate (opaque dark background beyond her jaw) straight onto the wall.
  const m0 = MOUTH[f] || [0, "X"];
  her(c, sh.pose, x, y, w, {
    frame: f,
    mouth: false,
    cues: [{ kind: sh.pose === "point" ? "point" : sh.pose === "desk" ? "accent" : "wave",
             start: s + 6, len: Math.min(72, sh.len - 12) }],
    nods: [s + 12],
  });

  // re-stamp her own mouth plate, masked, over the base
  const p = HOST.rig.poses[sh.pose];
  const [openness, letter] = m0;
  const voicing = letter !== "X" && openness > 0.06;
  const lv = !voicing ? "closed" : openness < 0.42 ? "mid" : "open";
  const v = p.ai?.[lv];
  if (v) {
    const k = w / HOST.rig.width;
    c.drawImage(plate(sh.pose, v.file),
      x + (v.cx - v.w / 2) * k, y + (v.cy - v.h / 2) * k, v.w * k, v.h * k);
  }

  // ── the desk, IN FRONT of her. Drawn after her, so her hem disappears
  //    behind the top surface instead of hanging past the edge. This is the
  //    whole fix for "isionekane kama floating sticker".
  const deskY = hem - Math.max(18, w * 0.035);
  const floorY = WIDE ? H * 0.845 : H * 0.785;
  herShadow(c, x + w / 2, deskY + 26, w);
  const d = desk(c, deskY, { bottom: floorY });
  if (sh.pose === "point") photoProp(c, "plant", W - 150, d.front + 2, 130, { center: true });
  else if (sh.pose === "peace") photoProp(c, "plant", 150, d.front + 2, 125, { center: true });
  else if (sh.pose === "desk") photoProp(c, "mug", W - 210, d.front - 6, 74);
  else books(c, W - 300, d.front - 4, 150);
  floorPapers(c, floorY, 7);

  // paper, top corners — below the header rule (y 112) so it never eats the tag
  if (!WIDE) {
    if (sh.pose === "wave") paper(c, W - 168, H * 0.080, 200, 150, 8, { rules: 4, seed: 9 });
    else if (sh.pose === "desk") paper(c, -52, H * 0.086, 196, 148, -8, { grid: true, seed: 11 });
    else if (sh.pose === "point") paper(c, W - 176, H * 0.082, 198, 146, 7, { rules: 5, seed: 17 });
    else paper(c, -46, H * 0.084, 190, 144, -7, { rules: 3, seed: 19 });
  } else {
    // wide: one sheet, high and left, above the type block and clear of her
    paper(c, W * 0.045, H * 0.075, 190, 142, -6, { rules: 4, seed: 23 });
  }

  // ── type: on the desk apron, well below her hem
  const tIn = smooth(s + 3, s + 20, f);
  const M = WIDE ? 110 : 62;
  const BLOCK = 176;
  // Tall frames put the block in the apron band, measured between the desk's
  // front edge and the floor line, so it can never float or crowd either one.
  // Tall: the type rides the desk apron. Wide: there is no apron band deep
  // enough, so the type goes back into a left column over a soft wash — the
  // composition the YouTube banner already proves works.
  const by = WIDE ? H * 0.560 : d.front + 104;
  c.save();
  c.globalAlpha = tIn;
  c.translate(0, (1 - tIn) * 24);
  if (WIDE) {
    const sg = c.createLinearGradient(0, 0, W * 0.66, 0);
    sg.addColorStop(0, "rgba(251,247,239,0.90)");
    sg.addColorStop(0.45, "rgba(251,247,239,0.62)");
    sg.addColorStop(0.75, "rgba(251,247,239,0.20)");
    sg.addColorStop(1, "rgba(251,247,239,0)");
    c.fillStyle = sg; c.fillRect(0, 0, W * 0.66, H);
  }
  rect(c, M, by - 52, 5, WIDE ? 172 : 176, 2.5, sh.accent);
  type(c, sh.head[0], M + 26, by - 8, WIDE ? 30 : 34,
       { weight: 620, color: SLATE, track: 7 });
  type(c, sh.head[1], M + 22, by + 60, WIDE ? 62 : 72, { weight: 830, color: INK });
  mono(c, sh.sub, M + 26, by + 104, WIDE ? 21 : 22, { color: sh.accent, track: 4 });
  c.restore();

  // ── chrome
  c.save();
  c.globalAlpha = 0.95;
  c.drawImage(HOST.mark, M, 54, 44, 44);
  type(c, "ALTRAWARE", M + 56, 86, 23, { weight: 750, track: 1.6, color: INK });
  mono(c, sh.tag, W - M, 86, 19, { align: "right", color: "rgba(29,42,51,0.48)", track: 3 });
  line(c, [[M, 112], [W - M, 112]], "rgba(29,42,51,0.13)", 2);
  c.restore();

  // ── the cut: a short paper-white flash, not a fade to black
  const dipIn = 1 - smooth(s, s + 4, f);
  const dipOut = smooth(e - 5, e, f);
  const flash = Math.max(dipIn, dipOut * 0.6);
  if (flash > 0.001) {
    c.fillStyle = `rgba(251,247,239,${flash * 0.92})`;
    c.fillRect(0, 0, W, H);
  }

  // progress hairline, so a looping story reads as a loop
  rect(c, 0, H - 6, W, 6, 0, "rgba(29,42,51,0.10)");
  rect(c, 0, H - 6, W * clamp(f / TOTAL), 6, 0, VIOLET);
}

/* ------------------------------------------------------------------ encode */
const audio = path.join(OUT, "intro.wav");
const outFile = (process.argv[2] && !process.argv[2].startsWith("--"))
  ? process.argv[2]
  : path.join(OUT, WIDE ? "intro-yt.mp4" : "intro.mp4");
const stills = process.argv.find((a) => a.startsWith("--stills="));
const stillDir = path.join(ROOT, ".cache/stills-" + (WIDE ? "wide" : "tall"));

const cv = createCanvas(W, H);
const ctx = cv.getContext("2d");

if (stills) {
  fs.mkdirSync(stillDir, { recursive: true });
  for (const pair of stills.split("=")[1].split(",")) {
    const [id, fr] = pair.split(":");
    drawFrame(ctx, Number(fr));
    fs.writeFileSync(path.join(stillDir, `intro-${id}.png`), cv.toBuffer("image/png"));
  }
  process.stderr.write(`stills -> ${stillDir}\n`);
  process.exit(0);
}

if (!FF) throw new Error("FFMPEG env var required");
const args = ["-y", "-hide_banner", "-loglevel", "error",
  "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-"];
if (fs.existsSync(audio)) args.push("-i", audio);
args.push("-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p");
if (fs.existsSync(audio)) args.push("-c:a", "aac", "-b:a", "192k", "-shortest");
args.push("-movflags", "+faststart", outFile);

const ff = spawn(FF, args, { stdio: ["pipe", "inherit", "inherit"] });
ff.stdin.on("error", (err) => process.stderr.write(`stdin: ${err.message}\n`));
for (let f = 0; f < TOTAL; f++) {
  drawFrame(ctx, f);
  const d = ctx.getImageData(0, 0, W, H).data;
  const buf = Buffer.from(d.buffer, d.byteOffset, d.byteLength);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 90 === 0) process.stderr.write(`frame ${f}/${TOTAL}\n`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`)))));
process.stderr.write(`wrote ${outFile}\n`);
