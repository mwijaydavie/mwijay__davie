/**
 * Noellyne identity pack — banners, avatar and feed scenes.
 *
 * Three notes from the owner drove this version:
 *
 *   1. "dont prioritize dark bgs … neons nyeusi kisa tupo in tech" — she is a
 *      tech host, not a nightclub. Every set here is daylight: cream paper,
 *      soft mint, warm sand, lilac. Accents stay saturated; the field does not.
 *
 *   2. "mbona mouth movements hamna" — the rig has real AI visemes at three
 *      openness levels per pose and the renderer only uses them when it is
 *      handed a track. The feed scenes are stills, so they get a mid-open mouth
 *      and read as if she has just spoken; the video gets `mouth.json`.
 *
 *   3. "hana legs … isionekane kama floating sticker" — nothing is cropped in
 *      mid-air any more. Every composition ends on a physical object in front of
 *      her: a desk with a laptop, a worktable with drawing sheets, a counter
 *      with a plant. Her hem disappears BEHIND it. That is what stops the
 *      figure reading as a cut-out held up to the frame.
 *
 * Run:
 *   node production/noellyne-ig/identity/banners.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, FONTS } from "../../noellyne-host/host.mjs";

const ROOT = process.cwd();
const HERE = path.join(ROOT, "production/noellyne-ig/identity");
const OUT = path.join(HERE, "out");
fs.mkdirSync(path.join(OUT, "scenes"), { recursive: true });

/* --------------------------------------------------------------- palette */

const PAPER = "#fbf7ef";
const CREAM = "#f7f1e6";
const INK = "#1d2a33";
const SLATE = "#5b6b76";
const LILAC = "#b9a6f2";
const VIOLET = "#5b3fb5";
const MINT = "#2fa87a";
const MINT_SOFT = "#dff0e6";
const SAND = "#f4e3c4";
const CORAL = "#e8735a";
const GOLD = "#e0a63c";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* --------------------------------------------------------------- helpers */

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function rect(c, x, y, w, h, r, col) { rr(c, x, y, w, h, r); c.fillStyle = col; c.fill(); }

function type(c, s, x, y, size, o = {}) {
  const { family = FONTS.sans, color = INK, weight = 700, align = "left",
          track = 0, alpha = 1 } = o;
  c.save();
  c.globalAlpha *= alpha;
  c.font = `${weight} ${size}px '${family}'`;
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = "alphabetic";
  if (track) {
    const chars = [...s];
    const ws = chars.map((ch) => c.measureText(ch).width + track);
    const total = ws.reduce((a, b) => a + b, 0) - track;
    let cx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    chars.forEach((ch, i) => { c.fillText(ch, cx, y); cx += ws[i]; });
  } else c.fillText(s, x, y);
  c.restore();
}
function mono(c, s, x, y, size, o = {}) {
  type(c, s, x, y, size, { family: FONTS.mono, weight: 500, ...o });
}

function dot(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); }
function line(c, pts, col, px = 2) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
  c.strokeStyle = col; c.lineWidth = px; c.lineCap = "round"; c.stroke();
}
function orbit(c, cx, cy, r, col, dash = 22, lw = 2) {
  c.save();
  c.strokeStyle = col; c.lineWidth = lw; c.setLineDash([dash, dash * 0.85]);
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  c.restore();
}
function hash(n) { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }

/** A soft light pool — this replaces every `glow(…, "lighter")` dark-set trick. */
function pool(c, cx, cy, r, rgb, strength = 0.5) {
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(${rgb},${strength})`);
  g.addColorStop(0.55, `rgba(${rgb},${strength * 0.42})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(cx - r, cy - r, r * 2, r * 2);
}

/** Paper with a real drop shadow, so cut-outs sit IN the set, not on it. */
function paper(c, x, y, w, h, deg, { seed = 1, rules = 0, grid = false } = {}) {
  c.save();
  c.translate(x + w / 2, y + h / 2);
  c.rotate((deg * Math.PI) / 180);
  c.shadowColor = "rgba(31,44,54,0.20)";
  c.shadowBlur = 26;
  c.shadowOffsetY = 12;
  c.fillStyle = "#fffdf8";
  c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 4); c.fill();
  c.shadowColor = "transparent";
  c.shadowBlur = 0;
  c.strokeStyle = "rgba(29,42,51,0.10)";
  c.lineWidth = 1.4;
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
      rect(c, -w / 2 + pad, -h / 2 + pad + h * 0.17 * (i + 1), (w - pad * 2) * (0.5 + hash(seed + i) * 0.4),
           Math.max(4, h * 0.018), 2, "rgba(29,42,51,0.16)");
    }
  }
  c.restore();
}

/**
 * The desk. This is the whole answer to "hana legs".
 *
 * Depth in three layers, drawn after her: the shadow she casts onto the floor
 * and the desktop, then the top surface (a trapezoid, so it reads as a plane
 * in perspective and not as a bar), then the apron and the objects standing on
 * it. Her hem is behind the top surface, so the frame never shows her ending.
 */
function desk(c, { y, w, bottom, color = "#e8dcc8", apron = "#ddcfb8" }) {
  const L = 0, R = w;
  const inset = w * 0.072;
  const depth = w * 0.075;

  // contact shadow: widest at the top, fading down, so she stands ON it
  const sg = c.createLinearGradient(0, y - 8, 0, y + depth * 0.9);
  sg.addColorStop(0, "rgba(31,44,54,0.24)");
  sg.addColorStop(1, "rgba(31,44,54,0)");
  c.fillStyle = sg;
  c.fillRect(0, y - 8, w, depth);

  // top surface — a shallow trapezoid, front edge wider than the back
  c.beginPath();
  c.moveTo(L + inset, y);
  c.lineTo(R - inset, y);
  c.lineTo(R, y + depth);
  c.lineTo(L, y + depth);
  c.closePath();
  const tg = c.createLinearGradient(0, y, 0, y + depth);
  tg.addColorStop(0, color);
  tg.addColorStop(1, "#f2e9d9");
  c.fillStyle = tg;
  c.fill();

  // front edge highlight, then the apron below it
  line(c, [[L, y + depth], [R, y + depth]], "rgba(255,255,255,0.85)", 3);
  const ag = c.createLinearGradient(0, y + depth, 0, bottom);
  ag.addColorStop(0, apron);
  ag.addColorStop(0.55, "#e6d7be");
  ag.addColorStop(1, "#f0e6d4");
  c.fillStyle = ag;
  c.fillRect(0, y + depth, w, bottom - (y + depth));
  line(c, [[0, y + depth + 1.5], [w, y + depth + 1.5]], "rgba(31,44,54,0.14)", 3);
}

/** The floor. A soft plane under the desk, darker at the front, with a contact
 *  shadow right under the apron so the desk sits on the ground. */
function floorPlane(c, W, H, top, tone = "224,211,240") {
  const g = c.createLinearGradient(0, top - 40, 0, H);
  g.addColorStop(0, `rgba(${tone},0)`);
  g.addColorStop(0.30, `rgba(${tone},0.34)`);
  g.addColorStop(1, `rgba(${tone},0.88)`);
  c.fillStyle = g;
  c.fillRect(0, top - 40, W, H - (top - 40));
  // the desk's own shadow, a soft band directly beneath the apron
  const sg = c.createLinearGradient(0, top, 0, top + H * 0.055);
  sg.addColorStop(0, "rgba(31,44,54,0.16)");
  sg.addColorStop(1, "rgba(31,44,54,0)");
  c.fillStyle = sg;
  c.fillRect(0, top, W, H * 0.055);
}

/** Laptop, standing open on the desk. Reads as "tech" without a dark room. */
function laptop(c, x, baseY, w) {
  // Front three-quarter: the lid rises on the left, the deck comes toward the
  // viewer on the right. Drawn as two quads so it has real perspective; a
  // frontal rectangle read as a picture frame.
  const h = w * 0.62;
  const lean = w * 0.10;
  c.save();
  c.shadowColor = "rgba(31,44,54,0.26)"; c.shadowBlur = 20; c.shadowOffsetY = 8;

  // deck: a quad, wider at the front
  c.beginPath();
  c.moveTo(x, baseY);
  c.lineTo(x + w, baseY - w * 0.045);
  c.lineTo(x + w + w * 0.06, baseY + w * 0.10);
  c.lineTo(x - w * 0.05, baseY + w * 0.13);
  c.closePath();
  c.fillStyle = "#eef1f4"; c.fill();
  c.shadowColor = "transparent"; c.shadowBlur = 0;
  // keyboard, drawn as sparse rows so it reads at banner size
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 7; i++) {
      const t = i / 6, u = (r + 1) / 5;
      const kx = x + w * 0.07 + t * w * 0.80;
      const ky = baseY + w * 0.02 + (r * w * 0.026) - t * w * 0.030 + u * w * 0.010;
      rect(c, kx, ky, w * 0.075, w * 0.016, 2, "rgba(29,42,51,0.13)");
    }
  }
  // trackpad
  c.beginPath();
  c.moveTo(x + w * 0.33, baseY + w * 0.088);
  c.lineTo(x + w * 0.61, baseY + w * 0.075);
  c.lineTo(x + w * 0.63, baseY + w * 0.108);
  c.lineTo(x + w * 0.34, baseY + w * 0.121);
  c.closePath();
  c.fillStyle = "rgba(255,255,255,0.85)"; c.fill();

  // lid: leans back to the left
  c.beginPath();
  c.moveTo(x, baseY);
  c.lineTo(x + w - lean * 0.2, baseY - w * 0.045);
  c.lineTo(x + w - lean * 0.2, baseY - w * 0.045 - h);
  c.lineTo(x, baseY - h);
  c.closePath();
  c.fillStyle = "#f4f6f8"; c.fill();
  c.strokeStyle = "rgba(29,42,51,0.10)"; c.lineWidth = 1.6; c.stroke();

  // screen: light lilac with three code bars and a mint result line
  const sx = x + w * 0.055, sy = baseY - h + w * 0.055;
  const sw = w * 0.88, sh = h - w * 0.13;
  const sg = c.createLinearGradient(sx, sy, sx + sw, sy + sh);
  sg.addColorStop(0, "#f1ecfe");
  sg.addColorStop(1, "#ddd2f9");
  rect(c, sx, sy, sw, sh, w * 0.012, sg);
  for (let i = 0; i < 3; i++) {
    rect(c, sx + sw * 0.10, sy + sh * (0.22 + i * 0.19),
         sw * (0.30 + hash(i + 3) * 0.38), sh * 0.075, 3, "rgba(91,63,181,0.38)");
  }
  rect(c, sx + sw * 0.10, sy + sh * (0.22 + 3 * 0.19), sw * 0.17, sh * 0.075, 3, "rgba(47,168,122,0.70)");
  c.restore();
}

/** A mug: the smallest possible proof that the surface is a real surface. */
function mug(c, x, baseY, w, col = "#ffffff", tea = "#c98a4b") {
  const h = w * 1.02;
  c.save();
  c.shadowColor = "rgba(31,44,54,0.24)"; c.shadowBlur = 16; c.shadowOffsetY = 7;
  rect(c, x, baseY - h, w, h, w * 0.16, col);
  c.shadowColor = "transparent"; c.shadowBlur = 0;
  c.strokeStyle = col; c.lineWidth = w * 0.16;
  c.beginPath(); c.arc(x + w + w * 0.03, baseY - h * 0.56, w * 0.27, -Math.PI * 0.46, Math.PI * 0.46); c.stroke();
  c.fillStyle = tea;
  c.beginPath(); c.ellipse(x + w / 2, baseY - h + w * 0.03, w * 0.42, w * 0.10, 0, 0, Math.PI * 2); c.fill();
  c.restore();
}

/** Potted plant. Fewer, larger leaves off a short trunk, so it reads as a
 *  houseplant at banner size instead of a sprig. */
function plant(c, x, baseY, w, { pot = "#e8d3b3", leaf = "#4f9e78" } = {}) {
  const potH = w * 0.72;
  const trunk = w * 0.42;
  c.save();
  c.shadowColor = "rgba(31,44,54,0.22)"; c.shadowBlur = 18; c.shadowOffsetY = 8;
  c.beginPath();
  c.moveTo(x - w * 0.50, baseY - potH);
  c.lineTo(x + w * 0.50, baseY - potH);
  c.lineTo(x + w * 0.38, baseY);
  c.lineTo(x - w * 0.38, baseY);
  c.closePath();
  c.fillStyle = pot; c.fill();
  c.shadowColor = "transparent"; c.shadowBlur = 0;
  c.strokeStyle = "rgba(29,42,51,0.10)"; c.lineWidth = 2;
  c.beginPath(); c.moveTo(x - w * 0.50, baseY - potH); c.lineTo(x + w * 0.50, baseY - potH); c.stroke();

  // trunk
  c.strokeStyle = "#3f7d5e"; c.lineWidth = w * 0.062; c.lineCap = "round";
  c.beginPath();
  c.moveTo(x, baseY - potH);
  c.quadraticCurveTo(x + w * 0.05, baseY - potH - trunk * 0.7, x, baseY - potH - trunk);
  c.stroke();

  // six leaves, alternating sides, each a filled ellipse on its own stem
  const tips = [];
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1;
    const rise = (0.28 + (i / 6) * 0.95) * w;
    const reach = side * w * (0.34 + hash(i + 4) * 0.30) * (1 - i * 0.06);
    const ty = baseY - potH - trunk - rise * 0.72;
    const tx = x + reach;
    tips.push([tx, ty]);
    c.strokeStyle = i % 3 === 1 ? "#6bb491" : "#3f7d5e";
    c.lineWidth = w * 0.042;
    c.beginPath();
    c.moveTo(x, baseY - potH - trunk * (0.85 - i * 0.10));
    c.quadraticCurveTo(x + reach * 0.45, ty - rise * 0.28, tx, ty);
    c.stroke();
    c.fillStyle = i % 3 === 1 ? "#6bb491" : leaf;
    c.beginPath();
    c.ellipse(tx, ty, w * 0.185, w * 0.098, (side * -0.42) + (hash(i + 9) - 0.5) * 0.5, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

/** Stack of books — horizontal weight on the desk line. */
function books(c, x, baseY, w) {
  const cols = ["#cfe3d6", "#f3ddc0", "#dcd2f8", "#f7e7d6"];
  let y = baseY;
  for (let i = 0; i < 3; i++) {
    const bw = w * (0.86 + hash(i + 21) * 0.3);
    const bh = w * 0.15;
    c.save();
    c.shadowColor = "rgba(31,44,54,0.18)"; c.shadowBlur = 12; c.shadowOffsetY = 5;
    rect(c, x, y - bh, bw, bh, 4, cols[i % cols.length]);
    c.restore();
    line(c, [[x + 6, y - bh * 0.5], [x + bw - 6, y - bh * 0.5]], "rgba(29,42,51,0.10)", 1.5);
    y -= bh;
  }
}

/* ------------------------------------------------------------------ host */

await loadFonts();
const HOST = await loadHost();

/**
 * Her, on a light set.
 *
 * `inkH` is the fraction of her box height that actually has ink in it. At
 * 0.985 the hem lands exactly where we draw the desk's back edge, which is why
 * every composition can put furniture at `y + w * 0.985` and get a clean occlu-
 * sion instead of a floating crop.
 */
const INK_H = 0.985;

/**
 * Feathered mouth plates.
 *
 * The AI viseme PNGs carry a little opaque near-black at the plate's edge — the
 * render's background where the white-key did not bite. Drawn square, that
 * lands on her jaw and her ear as a dark smudge, and it is the first thing you
 * see. So each plate is masked to a soft ellipse ONCE, here, and the feathered
 * version is what gets stamped.
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
    cv.width / 2, cv.height / 2, 0,
    cv.width / 2, cv.height / 2, cv.width * 0.46,
  );
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.62, "rgba(0,0,0,1)");
  g.addColorStop(0.86, "rgba(0,0,0,0.65)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, cv.width, cv.height);
  // …then cut it to her actual silhouette. The AI plate carries a dark corner
  // beyond her jaw where the render's background survived the white-key; the
  // base's own alpha is the exact shape of her, so this removes it precisely.
  c.globalCompositeOperation = "destination-in";
  c.drawImage(HOST.layers[HOST.rig.poses[pose].base.file], 0, 0);
  PLATES.set(key, cv);
  return cv;
}
function her(c, pose, x, y, w, { mouth = "mid", frame = 0, cues = [], nod = false } = {}) {
  const draw = performerDraw(c, HOST, 30);
  // Draw the base rig with `mouth: null` — we stamp the mouth ourselves below.
  draw(frame, "review", { pose, mouth: false, x, y, w, cues, nods: nod ? [frame] : [] });

  const p = HOST.rig.poses[pose];
  const v = p?.ai?.[mouth];
  if (!v) return { x, y, w, hemY: y + w * INK_H, cx: x + w / 2 };

  // A still is not a lipsync track, so the plate is stamped once. The kit's
  // plate carries a little opaque black at its edge (the render's background
  // that the white-key missed); feathered to zero over 6 px, it cannot land on
  // her jaw or her ear as a dark smudge.
  const k = w / HOST.rig.width;
  const pw = v.w * k, ph = v.h * k;
  const px = x + (v.cx - v.w / 2) * k, py = y + (v.cy - v.h / 2) * k;
  c.save();
  c.shadowColor = "transparent";
  c.globalAlpha = 0.99;
  c.drawImage(plate(pose, v.file), px, py, pw, ph);
  c.restore();
  return { x, y, w, hemY: y + w * INK_H, cx: x + w / 2 };
}

/** A truthful contact shadow on the desk surface, under her. */
function herShadow(c, cx, atY, w) {
  const g = c.createRadialGradient(cx, atY, 0, cx, atY, w * 0.46);
  g.addColorStop(0, "rgba(31,44,54,0.26)");
  g.addColorStop(0.5, "rgba(31,44,54,0.10)");
  g.addColorStop(1, "rgba(31,44,54,0)");
  c.save();
  c.translate(cx, atY); c.scale(1, 0.20); c.translate(-cx, -atY);
  c.fillStyle = g;
  c.beginPath(); c.arc(cx, atY, w * 0.46, 0, Math.PI * 2); c.fill();
  c.restore();
}

/* ------------------------------------------------------------------ sets */
/**
 * Every set is a room in daylight. The formula is the same in all four so the
 * pack reads as one world: a soft vertical wash, one big light pool behind her
 * head, a horizon line for the floor, then foreground furniture.
 */
function skyWash(c, W, H, top, mid, low) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(0.52, mid);
  g.addColorStop(1, low);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

function setStudio(c, W, H) {
  skyWash(c, W, H, "#f7f2ff", "#efe6ff", "#e6d9fb");
  pool(c, W * 0.50, H * 0.34, W * 0.66, "255,255,255", 0.85);
  pool(c, W * 0.16, H * 0.14, W * 0.34, "255,236,205", 0.36);
  orbit(c, W * 0.5, H * 0.33, W * 0.40, "rgba(91,63,181,0.16)", 20, 2.5);
  orbit(c, W * 0.5, H * 0.33, W * 0.54, "rgba(91,63,181,0.09)", 34, 2);
  // floor
  const fg = c.createLinearGradient(0, H * 0.74, 0, H);
  fg.addColorStop(0, "rgba(214,201,238,0)");
  fg.addColorStop(1, "rgba(206,190,233,0.55)");
  c.fillStyle = fg; c.fillRect(0, H * 0.74, W, H * 0.26);
}

function setMint(c, W, H) {
  skyWash(c, W, H, "#f4fbf7", "#e4f4ec", "#cfe9dd");
  pool(c, W * 0.50, H * 0.33, W * 0.64, "255,255,255", 0.80);
  pool(c, W * 0.82, H * 0.16, W * 0.36, "255,240,206", 0.34);
  // a wide arc behind her, drawn as a flat shape — set dressing, not decoration
  c.save();
  c.globalAlpha = 0.42;
  const ag = c.createLinearGradient(0, H * 0.10, 0, H * 0.70);
  ag.addColorStop(0, "#cfeade");
  ag.addColorStop(1, "rgba(207,234,222,0.20)");
  c.fillStyle = ag;
  c.beginPath();
  c.arc(W * 0.5, H * 0.34, W * 0.30, Math.PI, 0);
  c.lineTo(W * 0.80, H * 0.70);
  c.lineTo(W * 0.20, H * 0.70);
  c.closePath(); c.fill();
  c.restore();
  orbit(c, W * 0.5, H * 0.36, W * 0.40, "rgba(47,168,122,0.18)", 22, 2.5);
}

function setSand(c, W, H) {
  skyWash(c, W, H, "#fdf8ee", "#f7ecd7", "#efdfc2");
  pool(c, W * 0.50, H * 0.30, W * 0.68, "255,255,255", 0.82);
  pool(c, W * 0.20, H * 0.18, W * 0.34, "255,226,186", 0.42);
  // slatted light on the back wall — the one piece of "studio" in the set
  c.save();
  c.globalAlpha = 0.30;
  for (let i = 0; i < 7; i++) {
    const x = W * 0.60 + i * W * 0.055;
    c.fillStyle = "#ffe6bd";
    c.beginPath();
    c.moveTo(x, 0); c.lineTo(x + W * 0.028, 0);
    c.lineTo(x + W * 0.010, H * 0.70); c.lineTo(x - W * 0.018, H * 0.70);
    c.closePath(); c.fill();
  }
  c.restore();
  orbit(c, W * 0.5, H * 0.32, W * 0.42, "rgba(224,166,60,0.20)", 26, 2.5);
}

function setLilac(c, W, H) {
  skyWash(c, W, H, "#faf6ff", "#f0e8ff", "#e2d3fa");
  pool(c, W * 0.50, H * 0.30, W * 0.66, "255,255,255", 0.85);
  pool(c, W * 0.74, H * 0.20, W * 0.30, "206,236,255", 0.40);
  // a big soft sun disc, high and off-centre — kills the "neon dark" memory
  c.save();
  c.globalAlpha = 0.5;
  c.fillStyle = "#ffd9c6";
  c.beginPath(); c.arc(W * 0.80, H * 0.15, W * 0.20, 0, Math.PI * 2); c.fill();
  c.restore();
  orbit(c, W * 0.5, H * 0.31, W * 0.44, "rgba(91,63,181,0.15)", 30, 2.5);
}

/* ---------------------------------------------------------------- scenes */

const SCENES = {
  studio: {
    set: setStudio,
    pose: "desk",
    accent: VIOLET,
    head: ["MIMI NI", "Noellyne."],
    sub: "TECH HOST · ALTRAWARE",
    tag: "01 — STUDIO",
  },
  desk: {
    set: setMint,
    pose: "ok",
    accent: MINT,
    head: ["NINAJENGA", "kwa mikono."],
    sub: "BUILD · TEST · SHIP",
    tag: "02 — DESK",
  },
  room: {
    set: setSand,
    pose: "point",
    accent: GOLD,
    head: ["KILA SIKU", "kitu kipya."],
    sub: "APPS · AI · TOOLS",
    tag: "03 — FLOOR",
  },
  sky: {
    set: setLilac,
    pose: "peace",
    accent: CORAL,
    head: ["TUKUTANE", "hapa."],
    sub: "FOLLOW FOR TECH IN SWAHILI",
    tag: "04 — OUTRO",
  },
};

/**
 * A feed scene is 4:5. Bottom fifth is type, the middle holds her, and the desk
 * line sits just under her hem so the furniture occludes the crop.
 */
function feedScene(id) {
  const W = 1080, H = 1350;
  const S = SCENES[id];
  const cv = createCanvas(W, H);
  const c = cv.getContext("2d");

  S.set(c, W, H);

  const w = 780;
  const x = (W - w) / 2 + (S.pose === "point" ? -18 : 0);
  const y = H * 0.107;
  const hem = y + w * INK_H;

  // light behind her head, so she separates from the wall by value, not by glow
  pool(c, x + w * 0.5, y + w * 0.30, w * 0.78, "255,255,255", 0.55);

  const h = her(c, S.pose, x, y, w, { mouth: "mid" });

  // ── furniture: this is where "no legs" stops being visible
  herShadow(c, h.cx, hem + 26, w);
  desk(c, { y: hem + 6, w: W, bottom: H * 0.812, color: "#eee2cd", apron: "#e2d3b9" });
  floorPlane(c, W, H, H * 0.812, "222,208,244");

  if (id === "studio") {
    laptop(c, W * 0.635, hem + 40, 250);
    mug(c, W * 0.185, hem + 34, 74, "#ffffff");
    books(c, W * 0.14, hem + 30, 150);
  } else if (id === "desk") {
    laptop(c, W * 0.155, hem + 38, 205);
    mug(c, W * 0.755, hem + 32, 70, "#fdf8ee");
    // a drawing sheet laid flat, held by a second hand-sized weight
    c.save();
    c.translate(W * 0.70, hem + 54);
    c.rotate(-0.05);
    c.shadowColor = "rgba(31,44,54,0.22)"; c.shadowBlur = 18; c.shadowOffsetY = 8;
    rect(c, 0, 0, 250, 150, 5, "#fffdf8");
    c.shadowColor = "transparent"; c.shadowBlur = 0;
    for (let i = 0; i < 3; i++) {
      rect(c, 22, 26 + i * 34, 90 + hash(i + 41) * 110, 7, 3, "rgba(47,168,122,0.42)");
    }
    c.restore();
  } else if (id === "room") {
    plant(c, W * 0.845, hem + 40, 138, { pot: "#f0d8bb" });
    books(c, W * 0.10, hem + 34, 165);
  } else {
    plant(c, W * 0.115, hem + 38, 140, { pot: "#ffe2d6", leaf: "#5aa88b" });
    mug(c, W * 0.80, hem + 34, 76, "#ffffff", "#e8735a");
  }

  // foreground papers, hung off the top corners — depth above, furniture below
  if (id === "studio") {
    paper(c, W - 150, H * 0.048, 210, 158, 8, { rules: 4, seed: 9 });
  } else if (id === "desk") {
    paper(c, -46, H * 0.060, 200, 150, -8, { grid: true, seed: 11 });
  } else if (id === "room") {
    paper(c, W - 158, H * 0.052, 205, 152, 7, { rules: 5, seed: 17 });
  } else {
    paper(c, -40, H * 0.056, 196, 148, -7, { rules: 3, seed: 19 });
  }

  // ── chrome
  c.save();
  c.globalAlpha = 0.95;
  c.drawImage(HOST.mark, 56, 52, 44, 44);
  type(c, "NOELLYNE", 112, 85, 23, { weight: 750, track: 1.6, color: INK });
  mono(c, S.tag, W - 56, 85, 19, { align: "right", color: "rgba(29,42,51,0.50)", track: 3 });
  line(c, [[56, 110], [W - 56, 110]], "rgba(29,42,51,0.14)", 2);
  c.restore();

  // ── type: on the apron, well below the desk edge, so it never touches her
  rect(c, 56, H * 0.838, 5, H * 0.100, 2.5, S.accent);
  type(c, S.head[0], 84, H * 0.868, 29, { weight: 600, color: SLATE, track: 7 });
  type(c, S.head[1], 82, H * 0.936, 68, { weight: 820, color: INK });
  mono(c, S.sub, 84, H * 0.972, 20, { color: S.accent, track: 4 });
  return cv;
}

/* ---------------------------------------------------------------- banner */
/**
 * IG is 9:16 and the type has to be big. The desk is what makes that possible:
 * she is placed so her hem lands at 0.615 H, the desk surface covers the crop,
 * and the wordmark sits on the apron underneath — in a band that is measured,
 * not guessed.
 */
function bannerIG() {
  const W = 1080, H = 1920;
  const cv = createCanvas(W, H);
  const c = cv.getContext("2d");

  setStudio(c, W, H);
  pool(c, W * 0.50, H * 0.30, W * 0.70, "255,255,255", 0.70);

  // decorative paper, top corners, kept clear of type
  paper(c, -54, H * 0.052, 216, 168, -8, { grid: true, seed: 23 });
  paper(c, W - 168, H * 0.040, 208, 160, 8, { rules: 4, seed: 29 });

  const w = 830;
  const x = (W - w) / 2;
  const y = H * 0.150;
  const hem = y + w * INK_H;

  pool(c, x + w * 0.5, y + w * 0.30, w * 0.80, "255,255,255", 0.50);
  const h = her(c, "wave", x, y, w, { mouth: "mid" });

  herShadow(c, h.cx, hem + 24, w);
  desk(c, { y: hem + 4, w: W, bottom: H * 0.700, color: "#eee2cd", apron: "#e3d4ba" });
  floorPlane(c, W, H, H * 0.700, "222,208,244");
  laptop(c, W * 0.665, hem + 46, 240);
  mug(c, W * 0.175, hem + 40, 78, "#ffffff");
  books(c, W * 0.135, hem + 36, 148);

  // ── type on the apron
  // Baselines are explicit, not stacked: the eyebrow sits ABOVE its rule and
  // the wordmark below it, so the two can never overlap whatever the sizes are.
  rect(c, 62, H * 0.729, 5, H * 0.132, 2.5, VIOLET);
  type(c, "MIMI NI", 92, H * 0.764, 34, { weight: 620, color: SLATE, track: 8 });
  type(c, "Noellyne.", 88, H * 0.851, 116, { weight: 830, color: INK });
  mono(c, "TECH HOST · ALTRAWARE", 92, H * 0.896, 24, { color: VIOLET, track: 4 });

  // handle pill
  const pw = 430, ph = 66, py = H - 120;
  rect(c, 62, py, pw, ph, ph / 2, "rgba(255,255,255,0.80)");
  c.save();
  c.strokeStyle = "rgba(29,42,51,0.16)"; c.lineWidth = 2;
  c.beginPath(); c.roundRect(62, py, pw, ph, ph / 2); c.stroke();
  c.restore();
  mono(c, "IG · YOUTUBE · @noellyne", 92, py + 44, 26, { color: INK, track: 3 });

  c.drawImage(HOST.mark, 62, 60, 46, 46);
  type(c, "ALTRAWARE", 120, 95, 25, { weight: 750, track: 1.6, color: INK });
  mono(c, "01 — STUDIO", W - 62, 95, 20, { align: "right", color: "rgba(29,42,51,0.48)", track: 3 });
  line(c, [[62, 122], [W - 62, 122]], "rgba(29,42,51,0.14)", 2);
  return cv;
}

/**
 * YouTube is 16:9 with a 1235×338 safe area. Type goes inside it on the left,
 * she is cropped by the right edge, and the desk runs the full width so the
 * bottom of the frame is a surface — never a floating cut-out.
 */
function bannerYT() {
  const W = 2048, H = 1152;
  const cv = createCanvas(W, H);
  const c = cv.getContext("2d");

  setLilac(c, W, H);
  pool(c, W * 0.66, H * 0.32, W * 0.42, "255,255,255", 0.75);

  paper(c, -70, H * 0.10, 250, 190, -7, { grid: true, seed: 31 });
  paper(c, W * 0.30, H * 0.02, 210, 160, 6, { rules: 4, seed: 37 });

  const sw = 1235, sh = 338;
  const sx = (W - sw) / 2, sy = (H - sh) / 2;

  const w = 900;
  const x = W - w * 0.78;
  const y = H * 0.085;
  const hem = y + w * INK_H;

  pool(c, x + w * 0.5, y + w * 0.30, w * 0.80, "255,255,255", 0.45);
  const h = her(c, "peace", x, y, w, { mouth: "mid" });

  herShadow(c, h.cx, hem + 22, w);
  desk(c, { y: hem + 2, w: W, bottom: H * 0.875, color: "#f3e6d2", apron: "#e8d8bd" });
  floorPlane(c, W, H, H * 0.875, "238,222,250");
  plant(c, W - 120, hem + 34, 155, { pot: "#ffe2d6", leaf: "#5aa88b" });
  mug(c, W * 0.735, hem + 30, 66, "#ffffff", "#e8735a");

  // ── type: inside the safe area
  rect(c, sx, sy + 26, 5, 286, 2.5, VIOLET);
  type(c, "MIMI NI", sx + 32, sy + 44, 30, { weight: 620, color: SLATE, track: 8 });
  type(c, "Noellyne.", sx + 28, sy + 156, 118, { weight: 830, color: INK });
  mono(c, "TECH HOST · ALTRAWARE", sx + 32, sy + 210, 24, { color: VIOLET, track: 4 });

  // subscribe pill, also inside the safe area
  const pw = 360, ph = 62, py = sy + 236;
  rect(c, sx + 30, py, pw, ph, ph / 2, VIOLET);
  mono(c, "SUBSCRIBE", sx + 30 + 44, py + 41, 25, { color: "#fff", track: 4 });

  c.drawImage(HOST.mark, sx + 32, sy - 96, 44, 44);
  type(c, "ALTRAWARE", sx + 88, sy - 63, 24, { weight: 750, track: 1.6, color: INK });
  return cv;
}

/* ---------------------------------------------------------------- avatar */
function avatar() {
  const S = 1024;
  const cv = createCanvas(S, S);
  const c = cv.getContext("2d");
  setLilac(c, S, S);
  pool(c, S * 0.5, S * 0.32, S * 0.72, "255,255,255", 0.9);

  const w = 1240;
  const x = (S - w) / 2;
  const y = S * 0.035;
  her(c, "wave", x, y, w, { mouth: "mid" });

  // a soft bottom wash so the crop is a portrait, not a cut-out
  const g = c.createLinearGradient(0, S * 0.74, 0, S);
  g.addColorStop(0, "rgba(226,211,250,0)");
  g.addColorStop(1, "rgba(226,211,250,0.85)");
  c.fillStyle = g; c.fillRect(0, S * 0.74, S, S * 0.26);
  return cv;
}

/* ------------------------------------------------------------------ main */

const targets = [
  ["banner-ig.png", bannerIG()],
  ["banner-yt.png", bannerYT()],
  ["avatar.png", avatar()],
  ["scenes/look-studio.png", feedScene("studio")],
  ["scenes/look-desk.png", feedScene("desk")],
  ["scenes/look-room.png", feedScene("room")],
  ["scenes/look-sky.png", feedScene("sky")],
];

for (const [name, cv] of targets) {
  fs.writeFileSync(path.join(OUT, name), cv.toBuffer("image/png"));
  process.stdout.write(`  ${name}  ${cv.width}×${cv.height}\n`);
}
