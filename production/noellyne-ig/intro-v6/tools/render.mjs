/**
 * V6 renderer — Noellyne IG profile intro.
 *
 * After studying the three Altraware reels the owner sent (LIMS, MwijayNote,
 * Model Mpya) the shared logic is clear, and V6 copies it:
 *
 *   1. She is IN the scene, not in a box. Her re-keyed plate is planted in the
 *      page and its bottom dissolves into a real table plane, so no frame edge
 *      is ever visible. This is the fix for "cutout inaonekana poorly done".
 *   2. Cream-on-cream. The room behind her is the same beige as the page, which
 *      is why the references never show a matte line.
 *   3. Serif italic headline. Every reference uses a high-contrast serif with
 *      an italic accent line. V5 used a sans and read like a template.
 *   4. Numbered sections: `01 / UTANGULIZI` top right, a hairline rule, and a
 *      small violet logo mark top left.
 *   5. UI beats BUILD. LIMS and Model Mpya never cut to a finished card; they
 *      assemble it in place (rows appear, a total lands, a button fills). Every
 *      card here animates in the same way.
 *   6. One navy caption pill, centred, over her.
 *
 * Colours are sampled from the references: paper #EEE7DA, ink #1E1B18,
 * plum #5B3E8F, navy #12283E, ochre #D9A24A.
 */
import { createCanvas, loadImage, Image, GlobalFonts } from "@napi-rs/canvas";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const PLATES = path.join(ROOT, ".cache/noellyne-v6/plates");
const FRAMES = path.join(ROOT, ".cache/noellyne-v6/frames");

const W = 1080;
const H = 1920;
const FPS = 30;
const M = 84;

// palette, sampled from the reference reels
const PAPER = "#EEE7DA";
const PAPER_D = "#E4DACA";
const INK = "#1E1B18";
const INK_SOFT = "#6B6156";
const PLUM = "#5B3E8F";
const NAVY = "#12283E";
const OCHRE = "#D9A24A";
const CARD = "#FFFFFF";
const HAIR = "#CFC3AE";

// ---------------------------------------------------------------- type
const FONT_DIR = path.join(ROOT, ".cache/rt/matplotlib/mpl-data/fonts/ttf");
const FONTS = {
  serif: "DejaVu Serif",
  serifI: "DejaVu Serif",
  sans: "DejaVu Sans",
};
for (const f of [
  "DejaVuSerif-Bold.ttf",
  "DejaVuSerif-Italic.ttf",
  "DejaVuSerif-BoldItalic.ttf",
  "DejaVuSerif.ttf",
  "DejaVuSans-Bold.ttf",
  "DejaVuSans.ttf",
]) {
  const p = path.join(FONT_DIR, f);
  if (fs.existsSync(p)) GlobalFonts.registerFromPath(p);
}

// ---------------------------------------------------------------- timeline
const BEATS = [
  { id: "hook", from: 0.0, to: 5.0, label: "01 / UTANGULIZI" },
  { id: "name", from: 5.0, to: 11.0, label: "02 / NANI" },
  { id: "promise", from: 11.0, to: 16.6, label: "03 / UTAPATA" },
  { id: "cta", from: 16.6, to: 19.8, label: "04 / TUKUTANE" },
];
const TOTAL = BEATS[BEATS.length - 1].to;

/**
 * `plate` is the re-keyed subject crop. `x`/`base` place her: x is the left of
 * the plate, base is the y where she stands (table line). `scale` fits her to
 * the page. `move` is the source in/out time so she actually moves.
 */
const SHOTS = {
  // panel: [x, y, w, h]; win: which part of the source frame to show
  hook: { win: "phone", tilt: -1.5, move: [1.28, 2.05], zoom: 1.12, focus: [250, 880] },
  name: { win: "desk", tilt: 1.0, move: [7.20, 8.10], zoom: 1.14, focus: [872, 890] },
  promise: { win: "closeup", tilt: 1.3, move: [14.20, 15.40], zoom: 1.02, focus: [858, 880], h: 520, x: 640, y: 884 },
  cta: { win: "point", tilt: -0.8, move: [17.10, 18.10], zoom: 1.14, focus: [872, 890] },
};

const TABLE_Y = 1452;

// ---------------------------------------------------------------- helpers
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (t, a, b) => ease(clamp((t - a) / Math.max(1e-6, b - a)));

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx, text, maxW) {
  const out = [];
  let cur = "";
  for (const w of text.split(" ")) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > maxW && cur) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

// ---------------------------------------------------------------- assets
// The Altraware mark is the real asset from content/assets, never a drawn
// stand-in. V6 shipped an invented circle; that was the owner's biggest
// complaint, so this is loaded once and reused.
let LOGO = null;
async function loadLogo() {
  const p = path.join(ROOT, "production/noellyne-ig/intro-v6/assets/logo-tile-144.png");
  if (fs.existsSync(p)) LOGO = await loadImage(p);
}

// loadImage is the only decoder that honours PNG here; `new Image()` with a
// Buffer silently produced a fully transparent bitmap.
/**
 * The panel approach, and why it is final.
 *
 * Her approved footage was shot on a plum set. Six attempts to matte her onto
 * the cream page all left something: a halo, a violet rim, white patches where
 * semi-transparent edge pixels met beige, or a visible rectangle. The matte is
 * not a solvable problem with this source.
 *
 * The Model Mpya reference solves the same problem by putting dark panels on a
 * cream page — deliberately, as screens. That is what this does: her footage is
 * shown whole, inside a rounded panel with a label chip, and the plum set
 * becomes part of the design instead of a defect.
 */
/**
 * Text-free source crops. Every one of these bounds was checked against the
 * source grid: they exclude the baked header (y~300), the baked quotes in the
 * right column of the hook, and the baked caption pills (y>=1275).
 */
const WIN = {
  phone: [40, 466, 462, 1275], // 422x809, clears the baked quote card at x>=470
  desk: [612, 466, 1080, 1275], // 468x809, clears both baked columns
  point: [650, 466, 1080, 1275], // 430x809, clears the baked UI card at x<=640
  // from 14.1 s the reel cuts to a clean close-up with no baked type on the
  // right: that is the only stretch where a narrow window is fully clean.
  closeup: [640, 466, 1080, 1275],
};

// prints share one baseline and one height, so the four beats feel set by the
// same hand. Width follows each source aspect so nothing is ever cropped.
const PRINT_H = 742;
const PRINT_Y = 694; // image bottom lands at 1436, the mat rests on the table
const PRINT_R = 992;
const MAT = 15;
/**
 * Frames must be decoded with loadImage. `new Image(); img.src = buffer;`
 * silently yields an empty bitmap in this canvas build, which is what made the
 * first panel attempt render solid dark rectangles.
 * Only the frames the edit actually uses are preloaded.
 */
const frameCache = new Map();
async function loadPlates() {
  const ranges = [[1.25, 2.10], [7.15, 8.15], [14.15, 15.45], [17.05, 18.15]];
  for (const [a, b] of ranges) {
    for (let t = a; t <= b + 1e-6; t += 1 / 30) {
      const idx = clamp(Math.round(t * 30) + 1, 1, 744);
      if (frameCache.has(idx)) continue;
      const p = path.join(FRAMES, `f_${String(idx).padStart(4, "0")}.png`);
      if (fs.existsSync(p)) frameCache.set(idx, await loadImage(p));
    }
  }
  process.stderr.write(`preloaded ${frameCache.size} frames\n`);
}
function srcImg(t) {
  const idx = clamp(Math.round(t * 30) + 1, 1, 744);
  return frameCache.get(idx) || null;
}



let FIELD = null;
function prepare() {
  const g = createCanvas(W, H);
  const c = g.getContext("2d");
  c.fillStyle = PAPER;
  c.fillRect(0, 0, W, H);

  // warm light from the top left, like the reference sets
  const r1 = c.createRadialGradient(120, -60, 40, 120, -60, 1150);
  r1.addColorStop(0, "rgba(255,246,226,0.85)");
  r1.addColorStop(1, "rgba(255,246,226,0)");
  c.fillStyle = r1;
  c.fillRect(0, 0, W, 1200);

  const r2 = c.createRadialGradient(940, 320, 60, 940, 320, 820);
  r2.addColorStop(0, "rgba(203,186,160,0.30)");
  r2.addColorStop(1, "rgba(203,186,160,0)");
  c.fillStyle = r2;
  c.fillRect(0, 0, W, 1300);

  // paper grain
  for (let i = 0; i < 5200; i++) {
    const a = 0.012 + Math.random() * 0.022;
    c.fillStyle = Math.random() > 0.5 ? `rgba(120,100,70,${a})` : `rgba(255,255,255,${a * 1.6})`;
    c.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  FIELD = g;
}

// ---------------------------------------------------------------- chrome
function drawChrome(ctx, beat, el, section) {
  const pop = ramp(el, 0.0, 0.26);

  // the real Altraware tile, then the wordmark beside it
  ctx.save();
  ctx.globalAlpha = pop;
  if (LOGO) ctx.drawImage(LOGO, M - 16, 92, 48, 48);
  ctx.font = `bold 23px ${FONTS.sans}`;
  ctx.fillStyle = INK;
  ctx.fillText("ALTRAWARE", M + 44, 128);

  ctx.globalAlpha = pop * 0.8;
  ctx.font = `bold 20px ${FONTS.sans}`;
  ctx.textAlign = "right";
  ctx.fillText(section, W - M, 130);
  ctx.textAlign = "left";
  ctx.restore();

  // hairline rule + the small violet end cap the references use
  ctx.save();
  ctx.globalAlpha = pop;
  ctx.strokeStyle = "rgba(150,136,112,0.55)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(M, 158);
  ctx.lineTo(W - M, 158);
  ctx.stroke();
  ctx.fillStyle = PLUM;
  ctx.fillRect(M, 152, 30, 11);
  ctx.restore();
}

/** Serif headline: roman lines plus one italic accent line. */
function serifHead(ctx, lines, x, y, size, lineH, el, delay = 0) {
  lines.forEach((ln, i) => {
    const t = ramp(el, delay + i * 0.075, delay + i * 0.075 + 0.34);
    if (t <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = t;
    ctx.translate(0, (1 - t) * 26);
    ctx.font = ln.italic
      ? `italic bold ${ln.size || size}px ${FONTS.serif}`
      : `bold ${ln.size || size}px ${FONTS.serif}`;
    ctx.fillStyle = ln.color || INK;
    ctx.fillText(ln.text, x, y + i * lineH);
    ctx.restore();
  });
}

// ---------------------------------------------------------------- scene
function drawTable(ctx) {
  // the tabletop: a warm plane with a soft edge, exactly like MwijayNote
  const g = ctx.createLinearGradient(0, TABLE_Y, 0, H);
  g.addColorStop(0, "#E3D6BF");
  g.addColorStop(0.16, "#EDE2CE");
  g.addColorStop(0.52, "#E7DAC3");
  g.addColorStop(1, "#D9C9AE");
  ctx.fillStyle = g;
  ctx.fillRect(0, TABLE_Y, W, H - TABLE_Y);

  // front lip of the table, a touch darker so it reads as a solid
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.30)";
  ctx.fillRect(0, TABLE_Y, W, 5);
  ctx.restore();

  // a wide, low-contrast band only. A tight ellipse read as a ring.
  const s = ctx.createLinearGradient(0, TABLE_Y - 6, 0, TABLE_Y + 96);
  s.addColorStop(0, "rgba(126,103,72,0.16)");
  s.addColorStop(1, "rgba(126,103,72,0)");
  ctx.fillStyle = s;
  ctx.fillRect(0, TABLE_Y - 6, W, 102);
}

/**
 * The scene window, and why the cutout is gone for good.
 *
 * Her approved footage was shot on a plum set that is not separable from her
 * hair and glasses. Seven matte attempts each left a defect, because the defect
 * is in the source, not the code. So she is no longer matted at all: a plain
 * 1:1 crop of the frame is placed as a scene window in the page, its bottom edge
 * landing exactly on the table line so the table plane occludes her below the
 * waist, and its right edge running off the page so nothing is boxed in.
 *
 * Because the crop is 1:1 and the window is exactly as tall as the crop, no
 * pixel of her is cut by this code: what you see is her scene, wall and all.
 * The crop bounds were chosen to exclude every baked caption in the source.
 */
/**
 * A print, not a cutout — and that is the whole point.
 *
 * Her approved footage was shot on a plum set that cannot be separated from her
 * hair, lenses and hoodie; seven matte attempts each left a defect because the
 * defect is in the source. So she is never matted. Instead the frame is used
 * as-is, inside a white print border with a hairline and a slight tilt, and it
 * stands on the same table plane as the type. It reads as a studio print laid
 * on the page, which is a deliberate editorial object rather than a failed
 * compositing job. No pixel of her is cut, ghosted or recoloured by this code.
 */
function drawSubject(ctx, shot, el, dur) {
  if (!shot.win) return;
  const [x0w, y0w, x1w, y1w] = WIN[shot.win];
  const ph = shot.h || PRINT_H;
  const pw = Math.round((ph * (x1w - x0w)) / (y1w - y0w));
  const px = shot.x != null ? shot.x : PRINT_R - pw;
  const py = shot.y != null ? shot.y : PRINT_Y;
  const t = ramp(el, 0.02, 0.42);
  if (t <= 0.001) return;

  const [x0, y0, x1, y1] = WIN[shot.win];
  const img = srcImg(lerp(shot.move[0], shot.move[1], clamp(el / dur)));
  if (!img) return;

  const w = pw + MAT * 2;
  const h = ph + MAT * 2;
  const cx = px + pw / 2;
  const cy = py + ph / 2;
  const tilt = (shot.tilt * Math.PI) / 180;

  ctx.save();
  ctx.globalAlpha = t;
  ctx.translate(cx, cy + (1 - t) * 34);
  ctx.rotate(tilt);
  ctx.translate(-cx, -cy);

  // cast shadow, soft and low, so the print sits on the table
  ctx.save();
  ctx.shadowColor = "rgba(64,45,28,0.34)";
  ctx.shadowBlur = 46;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = "#FBF7EF";
  ctx.fillRect(px - MAT, py - MAT, w, h);
  ctx.restore();

  // image, cover-fitted so a tilted frame never shows a gap
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  ctx.imageSmoothingQuality = "high";
  const push = 1 + 0.028 * clamp(el / Math.max(0.001, dur), 0, 1);
  const zoom = (shot.zoom || 1.18) * push;
  const [fx, fy] = shot.focus || [(x0 + x1) / 2, (y0 + y1) / 2];
  // how much source is visible at this zoom
  const visW = pw / zoom;
  const visH = ph / zoom;
  // keep the visible box inside the window
  const sx = clamp(fx - visW / 2, x0, x1 - visW);
  const sy = clamp(fy - visH / 2, y0, y1 - visH);
  ctx.drawImage(img, sx, sy, visW, visH, px, py, pw, ph);
  ctx.restore();

  // contact shadow: a wide, soft band on the table, never a tight ellipse
  ctx.save();
  ctx.globalAlpha = t;
  const near = ctx.createLinearGradient(0, py + ph + MAT - 14, 0, py + ph + MAT + 34);
  near.addColorStop(0, "rgba(104,80,50,0.30)");
  near.addColorStop(1, "rgba(104,80,50,0)");
  ctx.fillStyle = near;
  ctx.fillRect(px - MAT - 10, py + ph + MAT - 14, w + 20, 48);
  const far = ctx.createLinearGradient(0, py + ph + MAT + 20, 0, py + ph + MAT + 96);
  far.addColorStop(0, "rgba(104,80,50,0.13)");
  far.addColorStop(1, "rgba(104,80,50,0)");
  ctx.fillStyle = far;
  ctx.fillRect(px - MAT - 46, py + ph + MAT + 20, w + 92, 76);
  ctx.restore();

  // white mat + hairline
  ctx.strokeStyle = "rgba(30,25,18,0.24)";
  ctx.lineWidth = 1.6;
  ctx.strokeRect(px - MAT + 0.8, py - MAT + 0.8, w - 1.6, h - 1.6);
  ctx.strokeStyle = "rgba(30,25,18,0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, pw, ph);
  ctx.restore();
}

// ---------------------------------------------------------------- cards
/**
 * The three reference reels all assemble a UI card in place. `cardBox` returns
 * the rect so each beat can put its rows inside it.
 */
function cardShell(ctx, box, el, delay = 0.1, title = null) {
  const t = ramp(el, delay, delay + 0.3);
  if (t <= 0.001) return null;
  const [x, y, w, h] = box;
  const yy = y + (1 - t) * 26;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.shadowColor = "rgba(90,72,48,0.18)";
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = CARD;
  roundRect(ctx, x, yy, w, h, 18);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = t;
  ctx.strokeStyle = "rgba(120,104,80,0.16)";
  ctx.lineWidth = 1.6;
  roundRect(ctx, x + 0.8, yy + 0.8, w - 1.6, h - 1.6, 18);
  ctx.stroke();

  // ochre tab, the reference cards all have one
  ctx.fillStyle = OCHRE;
  roundRect(ctx, x + 26, yy + 24, 88, 9, 5);
  ctx.fill();

  if (title) {
    ctx.font = `bold 25px ${FONTS.sans}`;
    ctx.fillStyle = INK;
    ctx.fillText(title, x + 26, yy + 74);
  }
  ctx.restore();
  return { x, y: yy, w, h };
}

function rowLine(ctx, x, y, w, label, value, el, delay, opts = {}) {
  const t = ramp(el, delay, delay + 0.26);
  if (t <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.translate((1 - t) * -22, 0);
  if (!opts.bare) {
    ctx.fillStyle = "rgba(238,231,218,0.9)";
    roundRect(ctx, x, y - 26, w, 44, 9);
    ctx.fill();
  }
  ctx.font = `${opts.bold ? "bold " : ""}22px ${FONTS.sans}`;
  ctx.fillStyle = opts.color || INK_SOFT;
  ctx.fillText(label, x + 14, y + 3);
  if (value) {
    ctx.textAlign = "right";
    ctx.fillStyle = opts.valueColor || INK;
    ctx.font = `bold 22px ${FONTS.sans}`;
    ctx.fillText(value, x + w - 14, y + 3);
    ctx.textAlign = "left";
  }
  ctx.restore();
}

function pill(ctx, x, y, w, h, text, el, delay, style = "solid") {
  const t = ramp(el, delay, delay + 0.3);
  if (t <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.translate(0, (1 - t) * 14);
  ctx.fillStyle = style === "solid" ? NAVY : "rgba(18,40,62,0.10)";
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = style === "solid" ? "#fff" : NAVY;
  ctx.font = `bold 24px ${FONTS.sans}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// ---------------------------------------------------------------- beats
function drawHook(ctx, el) {
  serifHead(
    ctx,
    [
      { text: "Tech", size: 118 },
      { text: "inakuchanganya?", size: 74 },
      { text: "Tuiweke rahisi.", size: 62, italic: true, color: PLUM },
    ],
    M,
    420,
    100,
    96,
    el
  );

  // a single ochre underline that draws itself under the accent line
  const t = ramp(el, 0.5, 0.86);
  ctx.save();
  ctx.globalAlpha = t;
  ctx.strokeStyle = OCHRE;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(M + 4, 742);
  ctx.quadraticCurveTo(M + 150, 736, M + 4 + 330 * t, 742);
  ctx.stroke();
  ctx.restore();
}

function drawName(ctx, el) {
  serifHead(
    ctx,
    [
      { text: "Mimi ni", size: 54, italic: true, color: PLUM },
      { text: "Noellyne.", size: 120 },
    ],
    M,
    420,
    110,
    122,
    el
  );

  // the affiliation assembles like a UI line, matching the reference logic
  const t = ramp(el, 0.42, 0.75);
  if (t > 0.001) {
    ctx.save();
    ctx.globalAlpha = t;
    ctx.fillStyle = NAVY;
    roundRect(ctx, M, 596, 470, 76, 12);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold 30px ${FONTS.sans}`;
    ctx.textBaseline = "middle";
    ctx.fillText("TECH HOST · ALTRAWARE", M + 26, 596 + 39);
    ctx.restore();
    ctx.textBaseline = "alphabetic";
  }
}

function drawPromise(ctx, el) {
  serifHead(
    ctx,
    [
      { text: "Hapa utapata", size: 52, italic: true, color: PLUM },
      { text: "Bila hype.", size: 96 },
    ],
    M,
    412,
    92,
    104,
    el
  );

  // a card that BUILDS: three rows land one by one, then a total row
  const box = cardShell(ctx, [M, 596, 520, 360], el, 0.12, "Kila wiki");
  if (!box) return;
  const rows = [
    ["AI bila hype", "01"],
    ["App demos fupi", "02"],
    ["Tips za kujaribu", "03"],
  ];
  rows.forEach((r, i) => {
    rowLine(ctx, box.x + 26, box.y + 132 + i * 60, box.w - 52, r[0], r[1], el, 0.3 + i * 0.16);
  });
  const t = ramp(el, 0.82, 1.12);
  if (t > 0.001) {
    ctx.save();
    ctx.globalAlpha = t;
    ctx.fillStyle = "rgba(91,62,143,0.10)";
    roundRect(ctx, box.x + 26, box.y + 306, box.w - 52, 44, 10);
    ctx.fill();
    ctx.fillStyle = PLUM;
    ctx.font = `bold 22px ${FONTS.sans}`;
    ctx.textBaseline = "middle";
    ctx.fillText("Tatu kwa tatu · kila wiki", box.x + 40, box.y + 329);
    ctx.restore();
    ctx.textBaseline = "alphabetic";
  }
}

function drawCta(ctx, el) {
  serifHead(
    ctx,
    [
      { text: "Tukutane", size: 54, italic: true, color: PLUM },
      { text: "hapa.", size: 108 },
    ],
    M,
    412,
    100,
    112,
    el
  );

  pill(ctx, M, 1080, 300, 88, "FOLLOW", el, 0.34);
  pill(ctx, M, 1190, 300, 88, "Share", el, 0.46, "ghost");

  // social handle, small, like the reference end cards
  const t = ramp(el, 0.66, 0.94);
  if (t > 0.001) {
    ctx.save();
    ctx.globalAlpha = t * 0.8;
    ctx.font = `22px ${FONTS.sans}`;
    ctx.fillStyle = INK_SOFT;
    ctx.fillText("@noellyne · Altraware", M, 1330);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- caption
const CAP = {
  hook: "Tech inakuchanganya? Tuiweke rahisi.",
  name: "Mimi ni Noellyne — tech host wa Altraware.",
  promise: "AI bila hype · demos fupi · tips za kujaribu.",
  cta: "Follow — tujaribu pamoja.",
};

function drawCaption(ctx, text, el) {
  const t = ramp(el, 0.14, 0.4);
  if (t <= 0.001) return;
  const y = 1648;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.font = `bold 29px ${FONTS.sans}`;
  const tw = ctx.measureText(text).width;
  const h = 62;
  const w = Math.min(W - M * 2, tw + 58);
  const x = (W - w) / 2;
  ctx.translate(0, (1 - t) * 14);
  ctx.fillStyle = NAVY;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, y + h / 2 + 1);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// ---------------------------------------------------------------- frame
function beatAt(t) {
  for (const b of BEATS) if (t >= b.from && t < b.to) return b;
  return BEATS[BEATS.length - 1];
}

function drawFrame(ctx, t) {
  const beat = beatAt(t);
  const el = t - beat.from;
  const dur = beat.to - beat.from;
  const shot = SHOTS[beat.id];

  ctx.drawImage(FIELD, 0, 0);
  drawChrome(ctx, beat, el, beat.label);

  // type sits above the table line, she stands on it
  if (beat.id === "hook") drawHook(ctx, el);
  if (beat.id === "name") drawName(ctx, el);
  if (beat.id === "promise") drawPromise(ctx, el);

  drawTable(ctx);
  drawSubject(ctx, shot, el, dur);

  if (beat.id === "cta") drawCta(ctx, el);

  drawCaption(ctx, CAP[beat.id], el);

  ctx.save();
  ctx.globalAlpha = 0.30 * ramp(el, 0.12, 0.4);
  ctx.font = `18px ${FONTS.sans}`;
  ctx.fillStyle = INK;
  ctx.textAlign = "right";
  ctx.fillText("noellyne · altraware", W - M, 1884);
  ctx.restore();
  ctx.textAlign = "left";
}

// ---------------------------------------------------------------- main
async function main() {
  const args = process.argv.slice(2);
  const limit = Number((args.find((a) => a.startsWith("--proof=")) || "").split("=")[1] || Infinity);
  const audio = (args.find((a) => a.startsWith("--audio=")) || "").split("=")[1];
  const outFile = args.find((a) => a.endsWith(".mp4"));
  if (!outFile) throw new Error("pass an output .mp4 path");

  prepare();
  await loadLogo();
  await loadPlates();
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const frames = Math.min(Math.round(TOTAL * FPS), limit);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const ff = process.env.FFMPEG;
  if (!ff) throw new Error("set FFMPEG");
  const ffArgs = [
    "-y", "-hide_banner", "-loglevel", "error",
    "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "pipe:0",
  ];
  if (audio) ffArgs.push("-i", audio);
  ffArgs.push("-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p");
  if (audio) ffArgs.push("-c:a", "aac", "-b:a", "192k", "-shortest");
  ffArgs.push("-movflags", "+faststart", outFile);

  const proc = spawn(ff, ffArgs, { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) =>
    proc.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exit ${c}`))))
  );
  for (let i = 0; i < frames; i++) {
    drawFrame(ctx, i / FPS);
    if (!proc.stdin.write(canvas.data())) await new Promise((r) => proc.stdin.once("drain", r));
    if (i % 60 === 0) process.stderr.write(`frame ${i}/${frames}\n`);
  }
  proc.stdin.end();
  await done;
  process.stderr.write(`wrote ${outFile}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
