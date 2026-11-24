/**
 * Noellyne — Tech Bila Hype · EP.1 "MAANDISHI HAYASOMEKI"
 * Motion technique cloned (motion-faithful) from the approved reference;
 * every character, word, asset and claim on screen is ours. See SPEC.md.
 *
 * Deterministic: frame-driven, no Date.now(), seeded-noise-free (constants only).
 * Output: out/frames/%04d.png at 60 fps, 1080x1920. SFX: out/mix.wav (mix.py).
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const HERE = path.join(ROOT, "production/noellyne-tech-reel-01");
const HOST = path.join(ROOT, "production/noellyne-host/assets");
const OUT = path.join(HERE, "out");
const FRAMES = path.join(OUT, "frames");
const W = 1080, H = 1920, FPS = 60, T = 1320; // 22.0 s

const CREAM = "#FBF7EF", SAND = "#F4E3C4", VIOLET = "#5B3FB5", DEEP = "#43287F",
      INK = "#1D2A33", ASH = "#49647F", GOLD = "#F2C66D", RED = "#D64545",
      PAPER = "#FFFDF6";

for (const [file, family] of [
  ["inter-latin-wght-normal.ttf", "LimsSans"],
  ["jetbrains-mono-latin-wght-normal.ttf", "LimsMono"],
  ["fraunces-latin-opsz-italic.ttf", "LimsSerif"],
  ["fraunces-latin-opsz-normal.ttf", "LimsSerif"],
]) {
  if (fs.existsSync(path.join(HOST, file))) GlobalFonts.registerFromPath(path.join(HOST, file), family);
}

// ---------------------------------------------------------------- helpers
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = (a, b, f) => 1 - Math.pow(1 - clamp((f - a) / (b - a)), 3);
const easeInOut = (a, b, f) => { const t = clamp((f - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOutBack = (a, b, f, overshoot = 1.70158) => {
  const t = clamp((f - a) / (b - a));
  const c3 = overshoot + 1;
  const p = 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
  return t <= 0 ? 0 : (t >= 1 ? 1 : p);
};
const pop = easeOutBack;

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function rect(c, x, y, w, h, r, color) { rr(c, x, y, w, h, r); c.fillStyle = color; c.fill(); }
function strokeRR(c, x, y, w, h, r, color, n = 2) { rr(c, x, y, w, h, r); c.strokeStyle = color; c.lineWidth = n; c.stroke(); }
function dot(c, x, y, r, color, alpha = 1) { c.globalAlpha = alpha; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = color; c.fill(); c.globalAlpha = 1; }
function line2(c, pts, color, px = 3, alpha = 1) {
  c.globalAlpha = alpha; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.lineWidth = px; c.strokeStyle = color; c.lineJoin = "round"; c.lineCap = "round"; c.stroke(); c.globalAlpha = 1;
}
function text(c, s, x, y, size, { family = "LimsSans", color = INK, weight = 747, italic = false, align = "left", alpha = 1, tracking = 0 } = {}) {
  c.globalAlpha = alpha;
  c.font = `${italic ? "italic " : ""}${weight} ${size}px '${family}'`;
  c.fillStyle = color; c.textAlign = align; c.textBaseline = "alphabetic";
  if (tracking > 0) {
    // manual letter-spacing for mono kickers
    let cx = x;
    if (align === "center") cx = x - (measure(c, s, size, family, italic, weight, tracking) / 2);
    for (const ch of s) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + tracking; }
  } else {
    c.fillText(s, x, y);
  }
  c.globalAlpha = 1;
}
const M = createCanvas(8, 8).getContext("2d");
function fitSize(s, base, maxW, family, italic, weight, tracking = 0) {
  let size = base;
  while (measure(null, s, size, family, italic, weight, tracking) > maxW && size > 40) size -= 4;
  return size;
}
function measure(c, s, size, family = "LimsSans", italic = false, weight = 747, tracking = 0) {
  const ctx = c || M;
  ctx.font = `${italic ? "italic " : ""}${weight} ${size}px '${family}'`;
  if (tracking > 0) { let w = 0; for (const ch of s) w += ctx.measureText(ch).width + tracking; return w - tracking; }
  return ctx.measureText(s).width;
}
function mono(c, s, x, y, size, color, alpha = 1, tracking = 3, align = "left") {
  text(c, s, x, y, size, { family: "LimsMono", color, weight: 620, alpha, tracking, align });
}
function halftone(c, x, y, cols, rows, gap, r, color, alpha) {
  c.globalAlpha = alpha; c.fillStyle = color;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    c.beginPath(); c.arc(x + i * gap, y + j * gap, r, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
}
function starburst(c, corner, color, spikes, len, alpha) {
  c.globalAlpha = alpha; c.fillStyle = color;
  const [cx, cy] = corner === "tl" ? [0, 0] : [W, H];
  for (let i = 0; i < spikes; i++) {
    const a = (i / (spikes - 1)) * Math.PI * 0.5 + (corner === "tl" ? 0.25 : Math.PI + 0.25);
    const half = 0.035 + (i % 2) * 0.02;
    c.beginPath(); c.moveTo(cx, cy);
    c.lineTo(cx + Math.cos(a - half) * len, cy + Math.sin(a - half) * len);
    c.lineTo(cx + Math.cos(a + half) * len, cy + Math.sin(a + half) * len);
    c.closePath(); c.fill();
  }
  c.globalAlpha = 1;
}
/** Noellyne pose with breathing and a scheduled blink (blink plate exists for every pose). */
function drawPose(c, img, blinkImg, { x, bottomY, w, f, blinkAt = [], alpha = 1, enterFrom = null }) {
  const s = w / img.width;
  const h = img.height * s;
  let dy = Math.sin((f / FPS) * Math.PI * 2 * 0.32) * 5;
  let sx = 1, sy = 1, dx = 0;
  if (enterFrom === "bottom") {
    const p = pop(8, 46, f);
    dy += (1 - p) * 460; sy = lerp(0.86, 1, p); sx = lerp(0.9, 1, p);
  } else if (enterFrom === "right") {
    const p = easeOut(700, 746, f);
    dx += (1 - p) * 540;
  } else if (enterFrom === "pop") {
    const p = pop(866, 912, f);
    dy += (1 - p) * 380; sy = lerp(0.8, 1, p);
  } else if (enterFrom === "outro") {
    const p = easeOut(1012, 1052, f);
    dx += (1 - p) * 180; alpha *= p;
  }
  const blinking = blinkAt.some((b) => f >= b && f < b + 9);
  const imgUse = blinking ? blinkImg : img;
  c.globalAlpha = alpha;
  c.save();
  c.translate(x + dx + (w / 2), bottomY + dy);
  c.scale(sx, sy);
  // soft ground shadow
  c.globalAlpha = alpha * 0.16;
  c.beginPath(); c.ellipse(0, -2, w * 0.42, 26, 0, 0, Math.PI * 2); c.fillStyle = "#000"; c.fill();
  c.globalAlpha = alpha;
  c.drawImage(imgUse, -w / 2, -h, w, h);
  c.restore(); c.globalAlpha = 1;
}
function wordSlam(c, s, x, y, size, { family = "LimsSerif", color = INK, weight = 560, italic = false, f, start, rise = 46, alphaFrom = 0 }) {
  const p = clamp((f - start) / 9);
  const op = clamp((f - start) / 6);
  const dy = (1 - easeOutBack(start, start + 10, f)) * rise;
  text(c, s, x, y + dy, size, { family, color, weight, italic, alpha: lerp(alphaFrom, 1, op) });
}
function pill(c, x, y, s, { bg = VIOLET, fg = CREAM, f, start, size = 26 }) {
  const p = pop(start, start + 18, f);
  const sc = lerp(0.55, 1, p);
  const w = 26 + measure(null, s, size, "LimsMono", false, 620, 4) + 26;
  c.save(); c.translate(x + w / 2, y + 27); c.scale(sc, sc); c.globalAlpha = clamp(p);
  rect(c, -w / 2, -27, w, 54, 27, bg);
  mono(c, s, 0, 10, size, fg, 1, 4, "center");
  c.restore(); c.globalAlpha = 1;
}
const cursorOn = (f) => Math.floor(f / 16) % 2 === 0;

// ---------------------------------------------------------------- beats
function b1(c, f, A) {
  c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
  halftone(c, 760, 90, 12, 7, 34, 4.6, INK, 0.085);
  if (f < 6) { c.fillStyle = `rgba(0,0,0,${1 - f / 6})`; c.fillRect(0, 0, W, H); }
  pill(c, 80, 132, "TECH BILA HYPE — EP.1", { f, start: 14, size: 25 });
  const s1 = fitSize("MAANDISHI", 158, 880, "LimsSerif", false, 747);
  const s2 = fitSize("HAYASOMEKI.", 158, 880, "LimsSerif", false, 747);
  wordSlam(c, "MAANDISHI", 80, 372, s1, { family: "LimsSerif", color: INK, weight: 747, f, start: 40, rise: 54 });
  wordSlam(c, "HAYASOMEKI.", 80, 540, s2, { family: "LimsSerif", color: VIOLET, weight: 747, f, start: 52, rise: 54 });
  if (f >= 96) mono(c, "HOYO MWENYEWE.", 80, 624, 25, ASH, easeOut(96, 112, f), 4);
  drawPose(c, A.present, A.presentBlink, { x: 540, bottomY: 1875, w: 700, f, blinkAt: [188, 474], enterFrom: "bottom" });
}
function b2(c, f) {
  c.fillStyle = INK; c.fillRect(0, 0, W, H);
  dots: {
    // faint grid of dots, top-left
    halftone(c, 96, 120, 8, 5, 30, 3.4, "#2b3b49", 0.8);
  }
  if (f < 146) {
    const g = "KWA NINI?";
    const n = Math.floor(clamp((f - 132) / 2.2) * g.length);
    mono(c, g.slice(0, n), 80, 300, 46, CREAM, 1, 8);
    if (f > 132 && (f % 12 < 6) && n < g.length) mono(c, "▌", 80 + measure(null, g.slice(0, n), 46, "LimsMono", false, 620, 8) + 10, 300, 46, CREAM, 1, 0);
  } else {
    mono(c, "KWA NINI?", 80, 300, 46, CREAM, 1, 8);
  }
  // wall of unreadable lines
  const rows = [
    [170, 0.42], [820, 0.6], [640, 0.74], [880, 0.5], [520, 0.82], [780, 0.66], [360, 0.6], [705, 0.44], [560, 0.7],
  ];
  const wallY = 470, step = 92, barH = 30;
  for (let i = 0; i < rows.length; i++) {
    const [wpx] = rows[i];
    const start = 172 + i * 11;
    const p = easeOut(start, start + 22, f);
    const y = wallY + i * step;
    c.globalAlpha = 0.28 + p * 0.35;
    rect(c, 110, y + (1 - p) * 34, Math.min(wpx, 860), barH, 15, "#33506b");
    c.globalAlpha = 1;
  }
  // red slashes
  if (f >= 262) {
    const p = clamp((f - 262) / 7);
    const jit = Math.sin((f - 262) * 2.1) * (1 - clamp((f - 262) / 30)) * 7;
    c.save(); c.translate(540 + jit, 1010); c.rotate(-0.055); c.globalAlpha = 0.92;
    rect(c, -470 * p, -170, 940 * p, 74, 37, RED);
    c.restore();
    if (f >= 268) { const p2 = clamp((f - 268) / 7); c.save(); c.translate(540 + jit, 1140); c.rotate(0.06); c.globalAlpha = 0.92; rect(c, -430 * p2, -150, 860 * p2, 66, 33, RED); c.restore(); }
    c.globalAlpha = 1;
  }
  if (f >= 276) mono(c, "watu hawasomi mistari ndogo ndogo.", 80, 1652, 30, "#c6d3e0", easeOut(276, 292, f), 2);
  // whip flash out
  if (f >= 334) { c.fillStyle = `rgba(251,247,239,${clamp((f - 334) / 8)})`; c.fillRect(0, 0, W, H); }
}
function b3(c, f) {
  c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
  halftone(c, 830, 1500, 10, 5, 30, 4, INK, 0.07);
  monobadge(c, "KANUNI 01", 80, 152, f, 344);
  wordSlam(c, "NENO MOJA.", 80, 560, fitSize("NENO MOJA.", 176, 900, "LimsSerif", true, 560), { family: "LimsSerif", color: VIOLET, weight: 560, italic: true, f, start: 372, rise: 46 });
  wordSlam(c, "KUBWA.", 80, 826, 236, { family: "LimsSerif", color: INK, weight: 747, f, start: 410, rise: 46 });
  const u = measure(null, "KUBWA.", 236, "LimsSerif", false, 747);
  const up = easeOut(432, 492, f);
  c.fillStyle = VIOLET; c.fillRect(80, 868, u * up, 12);
  // gold stamp
  if (f >= 444) {
    const p = pop(444, 462, f);
    c.save(); c.translate(700, 1150); c.rotate(-0.105); c.scale(lerp(1.6, 1, p), lerp(1.6, 1, p)); c.globalAlpha = clamp(p * 1.4);
    rect(c, -235, -92, 470, 184, 26, GOLD);
    strokeRR(c, -235, -92, 470, 184, 26, "#a67c1f", 4);
    text(c, "WEBSITE", 0, 34, 96, { family: "LimsSerif", color: INK, weight: 747, align: "center" });
    c.restore(); c.globalAlpha = 1;
  }
  mono(c, "fupi · moja · kubwa", 80, 1704, 27, ASH, easeOut(508, 524, f), 4);
}
function monobadge(c, s, x, y, f, start) {
  const on = Math.floor((f - start) / 14) % 2 === 0 || f - start < 6;
  mono(c, s + (on ? " ▌" : "  "), x, y, 30, VIOLET, easeOut(start, start + 10, f), 6);
}
function b4(c, f, A) {
  c.fillStyle = SAND; c.fillRect(0, 0, W, H);
  halftone(c, 96, 1380, 11, 6, 30, 4, INK, 0.08);
  monobadge(c, "KANUNI 02", 80, 152, f, 566);
  wordSlam(c, "RANGI", 80, 470, 178, { family: "LimsSerif", color: INK, weight: 747, f, start: 576, rise: 40 });
  wordSlam(c, "MBILI", 80, 712, 178, { family: "LimsSerif", color: VIOLET, weight: 747, f, start: 600, rise: 40 });
  wordSlam(c, "TU.", 80, 954, 178, { family: "LimsSerif", color: INK, weight: 747, f, start: 624, rise: 40 });
  // dichromatic swatch dots
  swatch(c, 300, 1280, 88, VIOLET, "VIOLET", f, 652, true);
  swatch(c, 655, 1280, 88, PAPER, "CREAM", f, 700, false);
  mono(c, "violet kwa hatua · cream kwa kupumzika", 80, 1560, 27, "#6d5426", easeOut(736, 752, f), 2);
  drawPose(c, A.point, A.pointBlink, { x: 882, bottomY: 1875, w: 468, f, blinkAt: [756], enterFrom: "right" });
}
function swatch(c, x, y, r, fill, label, f, start, onSand) {
  const p = pop(start, start + 22, f);
  const rr_ = lerp(40, r, p);
  if (fill === PAPER) {
    dot(c, x, y, rr_, PAPER, 1); strokeCircle(c, x, y, rr_, INK, 3);
  } else {
    dot(c, x, y, rr_, fill, 1);
  }
  if (f >= start + 10) mono(c, label, x, y + r + 44, 22, onSand ? "#6d5426" : "#6d5426", easeOut(start + 10, start + 22, f), 5, "center");
}
function strokeCircle(c, x, y, r, color, n) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.strokeStyle = color; c.lineWidth = n; c.stroke(); }
function b5(c, f, A) {
  c.fillStyle = VIOLET; c.fillRect(0, 0, W, H);
  starburst(c, "tl", "#ffffff", 7, 240, 0.95);
  starburst(c, "br", "#ffffff", 7, 300, 0.95);
  halftone(c, 720, 240, 8, 6, 34, 3.6, "#ffffff", 0.16);
  monobadge(c, "KANUNI 03", 80, 152, f, 788);
  wordSlam(c, "ANZA NA", 80, 512, 148, { family: "LimsSerif", color: CREAM, weight: 560, italic: true, f, start: 798, rise: 44 });
  wordSlam(c, "SWALI.", 80, 742, fitSize("SWALI.", 232, 880, "LimsSerif", false, 747), { family: "LimsSerif", color: CREAM, weight: 747, f, start: 830, rise: 44 });
  // slam card with the question
  if (f >= 862) {
    const p = pop(862, 878, f);
    const sc = lerp(0.62, 1, p);
    c.save(); c.translate(500, 1170); c.scale(sc, sc); c.globalAlpha = clamp(p);
    rect(c, -410, -112, 820, 224, 34, CREAM);
    const t = "UNATAKA WEBSITE";
    const tw = measure(null, t, 76, "LimsSerif", false, 747);
    text(c, t, 0, 28, 76, { family: "LimsSerif", color: INK, weight: 747, align: "center" });
    if (Math.floor(f / 18) % 2 === 0) text(c, "?", -tw / 2 + tw + 58, 30, 116, { family: "LimsSerif", color: GOLD, weight: 747, align: "center" });
    c.restore(); c.globalAlpha = 1;
  }
  mono(c, "swali huwasimamisha — watu wanabaki hadi mwisho", 80, 1560, 25, "#e7defc", easeOut(906, 924, f), 2);
  drawPose(c, A.thumbsup, A.thumbsupBlink, { x: 868, bottomY: 1865, w: 400, f, blinkAt: [1002], enterFrom: "pop" });
}
function b6(c, f, A) {
  c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
  halftone(c, 700, 90, 9, 5, 30, 3.6, INK, 0.07);
  drawPose(c, A.wave, A.waveBlink, { x: 815, bottomY: 1900, w: 560, f, blinkAt: [1152], enterFrom: "outro" });
  // logo: wipe-in + underline draw
  const p = clamp((f - 1010) / 26);
  const lp = easeOutBack(1010, 1038, f);
  c.save();
  c.beginPath(); c.rect(80, 170, 300 * p, 300); c.clip();
  c.globalAlpha = clamp(p * 1.2);
  c.drawImage(A.logo, 80, 170, 260, 260);
  c.restore(); c.globalAlpha = 1;
  if (f >= 1090) mono(c, "TECH BILA HYPE · EP.1", 84, 520, 30, ASH, easeOut(1090, 1104, f), 5);
  wordSlam(c, "HIYO NDIYO.", 84, 670, fitSize("HIYO NDIYO.", 128, 660, "LimsSerif", false, 747), { family: "LimsSerif", color: INK, weight: 747, f, start: 1102, rise: 40 });
  wordSlam(c, "UFUATE.", 84, 828, 128, { family: "LimsSerif", color: VIOLET, weight: 560, italic: true, f, start: 1118, rise: 40 });
  const u = easeOut(1136, 1176, f);
  c.fillStyle = GOLD; c.fillRect(84, 862, 330 * u, 10);
  mono(c, "Tips fupi. Bila hype.", 84, 918, 28, INK, easeOut(1148, 1164, f), 2);
  // domain typeout with block cursor
  const dstart = 1176, dchars = Math.floor(clamp((f - dstart) / 2.4) * "altra.tanzaniareach.com".length);
  const d = "altra.tanzaniareach.com".slice(0, dchars);
  mono(c, d + (cursorOn(f) ? "▌" : ""), 84, 1150, 30, VIOLET, 1, 2);
  if (f >= 1310) { c.fillStyle = `rgba(0,0,0,${clamp((f - 1310) / 10)})`; c.fillRect(0, 0, W, H); }
}

// ---------------------------------------------------------------- render
(async () => {
  fs.mkdirSync(FRAMES, { recursive: true });
  const A = {
    logo: await loadImage(path.join(HOST, "altraware.png")),
    present: await loadImage(path.join(HOST, "present-base.png")),
    presentBlink: await loadImage(path.join(HOST, "present-blink.png")),
    point: await loadImage(path.join(HOST, "point-base.png")),
    pointBlink: await loadImage(path.join(HOST, "point-blink.png")),
    thumbsup: await loadImage(path.join(HOST, "thumbsup-base.png")),
    thumbsupBlink: await loadImage(path.join(HOST, "thumbsup-blink.png")),
    wave: await loadImage(path.join(HOST, "wave-base.png")),
    waveBlink: await loadImage(path.join(HOST, "wave-blink.png")),
  };
  const start = Number(process.env.START_FRAME || 0);
  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");
  console.log("rendering", T, "frames, from", start);
  for (let f = start; f < T; f++) {
    ctx.clearRect(0, 0, W, H);
    ctx.resetTransform();
    if (f < 132) b1(ctx, f, A);
    else if (f < 342) b2(ctx, f);
    else if (f < 564) b3(ctx, f);
    else if (f < 786) b4(ctx, f, A);
    else if (f < 1008) b5(ctx, f, A);
    else b6(ctx, f, A);
    fs.writeFileSync(path.join(FRAMES, String(f).padStart(4, "0") + ".png"), cv.toBuffer("image/png"));
    if (f % 120 === 0) console.log("  frame", f);
  }
  console.log("frames done ->", FRAMES);
})().catch((e) => { console.error(e); process.exit(1); });
