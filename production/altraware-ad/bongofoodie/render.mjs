/**
 * Tech Bila Hype — TANGAZO: Altraware × BongoFoodie.
 *
 * A sponsored tangazo for Altraware's software service — apps and websites
 * for Tanzanian businesses — with BongoFoodie as the live proof. Not a
 * BongoFoodie-only ad, not a "tech" lecture: every claim shown maps to the
 * owner's own product screenshots (bongofoodie.vercel.app, DEMO admin view).
 *
 * Same rig and grammar as EP.1/EP.2: voice-led cut (out/timeline.json from
 * mix.py), mouth from out/mouth.json, kit visemes, safe-box poses, flash
 * cuts. Palette is the BongoFoodie brand — black + orange on cream — which
 * is deliberately different from EP.2's violet: this one is the tangazo,
 * not an episode.
 *
 * Deterministic: frame-driven, no Date.now(). Output: out/frames/%04d.png
 * at 60 fps, 1080x1920. Audio: out/mix.wav (mix.py).
 */
import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, FONTS } from "../../noellyne-host/host.mjs";
import { renderCounter } from "../../noellyne-host/counter.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..", "..");
const HERE = path.join(ROOT, "production/altraware-ad/bongofoodie");
const OUT = path.join(HERE, "out");
const FRAMES = path.join(OUT, "frames");
const A = path.join(HERE, "assets");
const W = 1080, H = 1920, FPS = 60;

const tl = JSON.parse(fs.readFileSync(path.join(OUT, "timeline.json"), "utf8"));
const MOUTH = JSON.parse(fs.readFileSync(path.join(OUT, "mouth.json"), "utf8"));
const COPY = JSON.parse(fs.readFileSync(path.join(HERE, "copy.json"), "utf8"));
const takeOf = (id) => COPY.takes.find((t) => t.id === id);
const T = tl.frames;

const CREAM = "#FBF7EF", SAND = "#F4E3C4",
      ORANGE = "#F0641E", ORANGE_DEEP = "#C24E12", ORANGE_SOFT = "#FDE3D3",
      HOT = "#221410", HOT2 = "#2C1E15", HOT3 = "#3A2A1E", TAN = "#C9B6A3",
      INK = "#1D2A33", ASH = "#49647F", GOLD = "#F2C66D", RED = "#D64545",
      PAPER = "#FFFDF6";

// ---------------------------------------------------------------- helpers
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = (a, b, f) => 1 - Math.pow(1 - clamp((f - a) / (b - a)), 3);
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
function wordSlam(c, s, x, y, size, { family = "LimsSerif", color = INK, weight = 560, italic = false, f, start, rise = 46, alphaFrom = 0 }) {
  const p = clamp((f - start) / 9);
  const op = clamp((f - start) / 6);
  const dy = (1 - easeOutBack(start, start + 10, f)) * rise;
  text(c, s, x, y + dy, size, { family, color, weight, italic, alpha: lerp(alphaFrom, 1, op) });
}
function pill(c, x, y, s, { bg = ORANGE, fg = CREAM, f, start, size = 24 }) {
  const p = pop(start, start + 18, f);
  const sc = lerp(0.55, 1, p);
  const w = 26 + measure(null, s, size, "LimsMono", false, 620, 3) + 26;
  c.save(); c.translate(x + w / 2, y + 27); c.scale(sc, sc); c.globalAlpha = clamp(p);
  rect(c, -w / 2, -27, w, 54, 27, bg);
  mono(c, s, 0, 10, size, fg, 1, 3, "center");
  c.restore(); c.globalAlpha = 1;
}
function monobadge(c, s, x, y, f, start, color = ORANGE) {
  const on = Math.floor((f - start) / 14) % 2 === 0 || f - start < 6;
  mono(c, s + (on ? " ▌" : "  "), x, y, 30, color, easeOut(start, start + 10, f), 6);
}
const cursorOn = (f) => Math.floor(f / 16) % 2 === 0;

function menuChip(c, x, y, w, h, label, f, start) {
  const p = pop(start, start + 20, f);
  if (p <= 0) return;
  c.save(); c.translate(x + w / 2, y + h / 2); c.scale(lerp(0.7, 1, p), lerp(0.7, 1, p)); c.globalAlpha = clamp(p);
  rect(c, -w / 2, -h / 2, w, h, h / 2, PAPER);
  strokeRR(c, -w / 2, -h / 2, w, h, h / 2, ORANGE, 3);
  text(c, label, 0, 9, 23, { family: "LimsSans", color: INK, weight: 747, align: "center" });
  c.restore(); c.globalAlpha = 1;
}

/** small uppercase card label + big value, used by the DEMO dashboard cards */
function statCard(c, x, y, w, h, { label, value, icon, tint, iconInk }, f, start) {
  const p = pop(start, start + 18, f);
  if (p <= 0.01) return;
  const sc = lerp(0.82, 1, p);
  c.save(); c.translate(x + w / 2, y + h / 2); c.scale(sc, sc); c.globalAlpha = clamp(p);
  rect(c, -w / 2, -h / 2, w, h, 26, PAPER);
  dot(c, -w / 2 + 62, 0, 34, tint, 1);
  text(c, icon, -w / 2 + 62, 15, 40, { family: "LimsSans", color: iconInk, weight: 747, align: "center" });
  mono(c, label, -w / 2 + 116, -16, 17, "#8A7A6B", 1, 2);
  text(c, value, -w / 2 + 116, 32, 44, { family: "LimsSans", color: INK, weight: 747 });
  c.restore(); c.globalAlpha = 1;
}

function phoneFrame(c, IMAGES, f, span, sx, sy) {
  const bob = Math.sin((f - span.start) / 41) * 9;
  const x = sx, y = sy + bob;
  // soft shadow
  c.globalAlpha = 0.28; c.fillStyle = "#000";
  c.beginPath(); c.ellipse(x + 214, y + 910, 250, 26, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  // body
  rect(c, x, y, 428, 892, 58, "#16110D");
  strokeRR(c, x, y, 428, 892, 58, "#3A2E24", 4);
  // screen
  c.save();
  rr(c, x + 26, y + 26, 376, 840, 42); c.clip();
  c.fillStyle = CREAM; c.fillRect(x + 26, y + 26, 376, 840);
  const img = IMAGES.menuScreen;
  const k = Math.max(376 / img.width, 840 / img.height) * 1.02;
  const iw = img.width * k, ih = img.height * k;
  c.drawImage(img, x + 26 + (376 - iw) / 2, y + 26 + 6, iw, ih);
  // glare
  c.globalAlpha = 0.07; c.fillStyle = "#fff";
  c.beginPath(); c.moveTo(x + 40, y + 866); c.lineTo(x + 240, y + 26); c.lineTo(x + 330, y + 26); c.lineTo(x + 130, y + 866); c.closePath(); c.fill();
  c.globalAlpha = 1; c.restore();
  // punch-hole camera (keeps the app's header and logo visible)
  dot(c, x + 428 / 2, y + 40, 7, "#16110D");
  rect(c, x + 428 / 2 - 56, y + 838, 112, 6, 3, "#16110D");
}

function her(c, HOST, draw, f, span, pose, { cx, w, bottomY = H - 8, enter = "rise" }) {
  const h = w * (1136 / 939);
  const rise = (1 - easeOut(span.start, span.start + 30, f)) * 380;
  const fade = enter === "fade" ? easeOut(span.start, span.start + 18, f) : 1;
  const take = takeOf(span.id);
  const cues = (take.gesture || []).map((g) => ({
    kind: g.kind, start: span.start + Math.round(g.at * FPS), len: g.len,
  }));
  const blinks = [span.start + 44, span.start + 44 + 116, span.start + 44 + 232]
    .filter((x) => x > span.start + 8 && x < span.end + 24);
  c.save();
  c.globalAlpha = 0.16 * fade;
  c.beginPath(); c.ellipse(cx, bottomY - 2, w * 0.40, 22, 0, 0, Math.PI * 2); c.fillStyle = "#000"; c.fill();
  c.restore();
  c.save();
  c.globalAlpha = fade;
  c.translate(0, rise);
  draw(f, "review", {
    pose, x: cx - w / 2, y: bottomY - h, w,
    cues, blinks, nods: [span.start + 16], mouth: MOUTH,
  });
  c.restore();
}

// ---------------------------------------------------------------- beats

function hook(c, f, span, HOST, draw) {
  c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
  halftone(c, 756, 84, 12, 7, 34, 4.6, ORANGE, 0.22);
  if (f < span.start + 6) { c.fillStyle = `rgba(0,0,0,${1 - (f - span.start) / 6})`; c.fillRect(0, 0, W, H); }
  const s = span.start;
  pill(c, 64, 126, "TANGAZO — ALTRAWARE × BONGOFOODIE", { f, start: s + 6, size: 21 });
  wordSlam(c, "APP NA", 64, 436, fitSize("APP NA", 170, 920, "LimsSerif", false, 747), { family: "LimsSerif", color: INK, weight: 747, f, start: s + 26, rise: 52 });
  wordSlam(c, "WEBSITE", 64, 700, fitSize("WEBSITE", 196, 940, "LimsSerif", false, 747), { family: "LimsSerif", color: ORANGE, weight: 747, f, start: s + 44, rise: 52 });
  if (f >= s + 96) mono(c, "kwa biashara yako — Tanzania.", 64, 796, 24, ASH, easeOut(s + 96, s + 114, f), 3);
  her(c, HOST, draw, f, span, "cheer", { cx: 540, w: 640, enter: "rise" });
}

function problem(c, f, span, HOST, draw) {
  c.fillStyle = HOT; c.fillRect(0, 0, W, H);
  halftone(c, 96, 116, 8, 5, 30, 3.4, HOT3, 0.9);
  const s = span.start;
  const g = "BIASHARA YAKO INAKAAJE?";
  const typed = Math.floor(clamp((f - (s + 2)) / 2.1) * g.length);
  mono(c, g.slice(0, typed), 64, 252, 34, CREAM, 1, 6);
  if (typed < g.length && f > s + 2 && f % 12 < 6) {
    mono(c, "▌", 64 + measure(null, g.slice(0, typed), 34, "LimsMono", false, 620, 6) + 8, 252, 34, ORANGE, 1, 0);
  }
  // the wall of lost orders — five unread cards sliding in
  const rows = [
    "19:02 · Call — simu imekatwa",
    "19:10 · 'Mpo wapi? Order yangu?'",
    "19:17 · 'Mna chips mayai?' ×47",
    "19:26 · Mteja amekata tamaa",
    "19:31 · Order imepotea tena.",
  ];
  const cardW = 600, cardH = 88, gap = 26, wallY = 330;
  for (let i = 0; i < rows.length; i++) {
    const start = s + 16 + i * 11;
    const p = easeOut(start, start + 24, f);
    if (p <= 0) continue;
    const y = wallY + i * (cardH + gap);
    c.save();
    c.globalAlpha = p;
    c.translate((1 - p) * -80, 0);
    rect(c, 64, y, cardW, cardH, 20, HOT2);
    rect(c, 64, y, 10, cardH, 5, ORANGE);
    text(c, rows[i], 96, y + 53, 21, { family: "LimsMono", color: "#F3E7D3", weight: 620 });
    c.restore();
  }
  // the leak stamp
  if (f >= s + 130) {
    const p = clamp((f - (s + 130)) / 7);
    const jit = Math.sin((f - (s + 130)) * 2.1) * (1 - clamp((f - (s + 130)) / 30)) * 7;
    c.save(); c.translate(338 + jit, 1120); c.rotate(-0.05); c.globalAlpha = 0.95;
    rect(c, -290 * p, -54, 580 * p, 108, 24, RED);
    if (p > 0.6) text(c, "ORDER + PESA = ZINAPOTEA", 0, 10, 24, { family: "LimsMono", color: CREAM, weight: 620, align: "center", tracking: 1, alpha: clamp((p - 0.6) / 0.4) });
    c.restore(); c.globalAlpha = 1;
  }
  if (f >= s + 150) mono(c, "biashara nzuri — lakini order zinapotea.", 64, 1236, 22, TAN, easeOut(s + 150, s + 166, f), 1);
  halftone(c, 96, 1420, 10, 5, 30, 4, HOT3, 0.9);
  her(c, HOST, draw, f, span, "phone", { cx: 800, w: 470, bottomY: H - 10, enter: "fade" });
  return true;
}

function menu(c, f, span, HOST, draw, IMAGES) {
  c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
  halftone(c, 92, 1430, 11, 6, 30, 4, ORANGE, 0.20);
  const s = span.start;
  monobadge(c, "1 · MENU MTANDAONI", 64, 152, f, s + 4);
  wordSlam(c, "MENU YAKO", 64, 372, fitSize("MENU YAKO", 148, 470, "LimsSerif", false, 747), { family: "LimsSerif", color: INK, weight: 747, f, start: s + 16, rise: 44 });
  wordSlam(c, "ONLINE.", 64, 596, fitSize("ONLINE.", 176, 470, "LimsSerif", true, 560), { family: "LimsSerif", color: ORANGE, weight: 560, italic: true, f, start: s + 32, rise: 44 });
  menuChip(c, 64, 700, 400, 62, "Nyama Choma · TSh 13,500", f, s + 52);
  menuChip(c, 64, 786, 400, 62, "Chipsi Mayai · TSh 5,500", f, s + 68);
  if (f >= s + 92) mono(c, "★ 4.9 · (126)", 64, 916, 22, ASH, easeOut(s + 92, s + 108, f), 2);
  phoneFrame(c, IMAGES, f, span, 566, 462);
  if (f >= s + 70) mono(c, "bongofoodie.vercel.app", 566, 1456, 22, ASH, easeOut(s + 70, s + 86, f), 2);
  her(c, HOST, draw, f, span, "point", { cx: 268, w: 400, bottomY: H - 8, enter: "fade" });
}

function brains(c, f, span, HOST, draw) {
  c.fillStyle = HOT; c.fillRect(0, 0, W, H);
  halftone(c, 724, 116, 9, 6, 34, 3.8, ORANGE, 0.32);
  const s = span.start;
  monobadge(c, "2 · NYUMA YA PAZIA", 64, 152, f, s + 4);
  wordSlam(c, "NYUMA YA", 64, 320, 110, { family: "LimsSerif", color: CREAM, weight: 560, italic: true, f, start: s + 14, rise: 40 });
  wordSlam(c, "PAZIA.", 64, 478, fitSize("PAZIA.", 150, 540, "LimsSerif", false, 747), { family: "LimsSerif", color: ORANGE, weight: 747, f, start: s + 28, rise: 40 });
  mono(c, "bongofoodie.vercel.app — DEMO: ADMIN", 64, 566, 17, TAN, easeOut(s + 18, s + 34, f), 1);
  // --- DEMO dashboard cards, redrawn from the screenshot (values exact) ---
  statCard(c, 64, 592, 452, 128, { label: "TODAY'S REVENUE", value: "TSh 92,500", icon: "$", tint: ORANGE_SOFT, iconInk: ORANGE_DEEP }, f, s + 40);
  statCard(c, 64, 744, 214, 132, { label: "ORDERS", value: "3", icon: "✓", tint: "#DCF5E3", iconInk: "#1E7B44" }, f, s + 52);
  statCard(c, 302, 744, 214, 132, { label: "PENDING", value: "1", icon: "!", tint: "#FDE9C8", iconInk: "#A66A00" }, f, s + 64);
  statCard(c, 64, 900, 452, 128, { label: "AVERAGE TICKET", value: "TSh 30,833", icon: "↗", tint: "#E2ECFB", iconInk: "#2C5BA6" }, f, s + 76);
  // --- Chef AI Atelier chat, redrawn from the screenshot ---
  const py = 1056, px = 64, pw = 512, ph = 470;
  const pp = pop(s + 92, s + 108, f);
  if (pp > 0) {
    c.save(); c.translate(px + pw / 2, py + ph / 2); c.scale(lerp(0.9, 1, pp), lerp(0.9, 1, pp)); c.globalAlpha = clamp(pp);
    rect(c, -pw / 2, -ph / 2, pw, ph, 26, PAPER);
    text(c, "✦", -pw / 2 + 40, -ph / 2 + 56, 30, { family: "LimsSans", color: ORANGE, weight: 747, align: "center" });
    text(c, "CHEF AI ATELIER", -pw / 2 + 66, -ph / 2 + 55, 24, { family: "LimsSans", color: INK, weight: 747 });
    mono(c, "EN · SW · AUTO", -pw / 2 + 40, -ph / 2 + 96, 15, "#B0987F", 1, 2);
    c.strokeStyle = "#EADFCF"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-pw / 2 + 26, -ph / 2 + 118); c.lineTo(pw / 2 - 26, -ph / 2 + 118); c.stroke();
    // user bubble (their question, verbatim from the demo)
    const bw = 330, bh = 78;
    rect(c, pw / 2 - 26 - bw, -ph / 2 + 138, bw, bh, 20, ORANGE);
    text(c, "Recommend a drink", pw / 2 - 26 - bw / 2, -ph / 2 + 171, 20, { family: "LimsSans", color: CREAM, weight: 620, align: "center" });
    text(c, "for Nyama Choma", pw / 2 - 26 - bw / 2, -ph / 2 + 199, 20, { family: "LimsSans", color: CREAM, weight: 620, align: "center" });
    // reply bubble (its answer, verbatim from the demo)
    rect(c, -pw / 2 + 26, -ph / 2 + 244, 300, 118, 20, "#FBF3E6");
    strokeRR(c, -pw / 2 + 26, -ph / 2 + 244, 300, 118, 20, "#EADFCF", 2);
    mono(c, "CHEF AI", -pw / 2 + 52, -ph / 2 + 292, 15, ORANGE_DEEP, 1, 2);
    text(c, "Mmmh, Nyama Choma", -pw / 2 + 52, -ph / 2 + 334, 23, { family: "LimsSans", color: INK, weight: 747 });
    c.restore(); c.globalAlpha = 1;
  }
  if (f >= s + 160) mono(c, "order moja inasubiri jikoni.", 64, 1588, 20, TAN, easeOut(s + 160, s + 176, f), 1);
  her(c, HOST, draw, f, span, "one", { cx: 806, w: 390, bottomY: H - 14, enter: "fade" });
}

function pitch(c, f, span, HOST, draw) {
  c.fillStyle = ORANGE; c.fillRect(0, 0, W, H);
  starburst(c, "br", "#FFFFFF", 7, 330, 0.9);
  halftone(c, 96, 1380, 11, 6, 30, 4, CREAM, 0.30);
  const s = span.start;
  monobadge(c, "ALTRAWARE — TUNAJENGA", 64, 152, f, s + 4, CREAM);
  wordSlam(c, "APP YAKO.", 64, 452, fitSize("APP YAKO.", 152, 880, "LimsSerif", false, 747), { family: "LimsSerif", color: CREAM, weight: 747, f, start: s + 14, rise: 44 });
  wordSlam(c, "WEBSITE YAKO.", 64, 668, fitSize("WEBSITE YAKO.", 128, 920, "LimsSerif", false, 747), { family: "LimsSerif", color: CREAM, weight: 747, f, start: s + 32, rise: 44 });
  // gold stamp — "TUNAWEZA."
  if (f >= s + 64) {
    const p = pop(s + 64, s + 82, f);
    c.save(); c.translate(296, 1080); c.rotate(-0.06); c.scale(lerp(1.5, 1, p), lerp(1.5, 1, p)); c.globalAlpha = clamp(p * 1.4);
    rect(c, -238, -96, 476, 192, 26, GOLD);
    strokeRR(c, -238, -96, 476, 192, 26, "#a67c1f", 4);
    text(c, "TUNAWEZA.", 0, 32, 78, { family: "LimsSerif", color: INK, weight: 747, align: "center" });
    c.restore(); c.globalAlpha = 1;
  }
  // three capability chips — proof of scope, in one row
  const chips = [["APP ✓", 64], ["WEBSITE ✓", 262], ["CHEF AI ✓", 496]];
  for (let i = 0; i < chips.length; i++) {
    const [label, x] = chips[i];
    const p = pop(s + 88 + i * 18, s + 102 + i * 18, f);
    if (p <= 0) continue;
    c.save(); c.translate(x + 92, 1278 + 44); c.scale(lerp(0.7, 1, p), lerp(0.7, 1, p)); c.globalAlpha = clamp(p);
    rect(c, -92, -44, 184, 88, 44, ORANGE_DEEP);
    mono(c, label, 0, 10, 24, CREAM, 1, 2, "center");
    c.restore(); c.globalAlpha = 1;
  }
  if (f >= s + 128) mono(c, "biashara yoyote Tanzania.", 64, 1470, 24, CREAM, easeOut(s + 128, s + 144, f), 2);
  her(c, HOST, draw, f, span, "present", { cx: 820, w: 440, bottomY: H - 16, enter: "fade" });
}

function cta(c, f, span, HOST, draw, IMAGES) {
  c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
  halftone(c, 700, 84, 9, 5, 30, 3.6, ORANGE, 0.22);
  const s = span.start;
  // the two marks — Altraware × BongoFoodie, both real, both ours
  const p = clamp((f - (s + 2)) / 26);
  c.save();
  c.beginPath(); c.rect(70, 148, 210 * p, 210); c.clip();
  c.globalAlpha = clamp(p * 1.2);
  if (HOST.mark) c.drawImage(HOST.mark, 70, 148, 186, 186);
  c.restore(); c.globalAlpha = 1;
  if (f >= s + 14) mono(c, "×", 268, 268, 56, INK, easeOut(s + 14, s + 26, f), 0);
  const p2 = clamp((f - (s + 18)) / 26);
  if (p2 > 0 && IMAGES.lockup) {
    const lw = 470, lh = lw * (IMAGES.lockup.height / IMAGES.lockup.width);
    c.save();
    c.beginPath(); c.rect(320, 148, (lw + 20) * p2, 210); c.clip();
    c.globalAlpha = clamp(p2 * 1.2);
    c.drawImage(IMAGES.lockup, 320, 196, lw, lh);
    c.restore(); c.globalAlpha = 1;
  }
  if (f >= s + 60) mono(c, "TECH BILA HYPE — TANGAZO", 70, 428, 22, ASH, easeOut(s + 60, s + 76, f), 3);
  wordSlam(c, "ANZA LEO.", 70, 630, fitSize("ANZA LEO.", 168, 940, "LimsSerif", false, 747), { family: "LimsSerif", color: INK, weight: 747, f, start: s + 76, rise: 44 });
  const u = easeOut(s + 88, s + 126, f);
  c.fillStyle = GOLD; c.fillRect(70, 656, 300 * u, 11);
  const dstart = s + 110, dtext = "altra.tanzaniareach.com";
  const dchars = Math.floor(clamp((f - dstart) / 2.4) * dtext.length);
  mono(c, dtext.slice(0, dchars) + (cursorOn(f) && dchars < dtext.length ? "▌" : ""), 70, 780, 32, ORANGE_DEEP, 1, 2);
  if (f >= s + 128) mono(c, "comment APP — nitakutumia ujumbe.", 70, 852, 24, INK, easeOut(s + 128, s + 144, f), 2);
  if (f >= s + 136) mono(c, "bongofoodie.vercel.app — mfano halisi.", 70, 906, 21, ASH, easeOut(s + 136, s + 152, f), 1);
  her(c, HOST, draw, f, span, "wave", { cx: 540, w: 700, enter: "rise", bottomY: H - 6 });
  // final fade now lives in drawFrame (after the counter), so the whole set dims together
}

const SCENES = { hook, problem, menu, brains, pitch, cta };

function drawFrame(ctx, HOST, draw, IMAGES, f) {
  const span = [...tl.spans].reverse().find((s) => f >= s.start - 4) || tl.spans[0];
  const scene = SCENES[span.id];
  scene(ctx, f, span, HOST, draw, IMAGES);
  // the set's furniture — drawn over her, hiding the cutout edge
  if (IMAGES.counters[span.id]) ctx.drawImage(IMAGES.counters[span.id], 0, 0);
  // flash on every cut: 6-frame cream wash
  const cut = tl.spans.find((s) => f >= s.start && f < s.start + 6);
  if (cut && cut.start > 100) {
    ctx.fillStyle = `rgba(251,247,239,${0.85 * (1 - (f - cut.start) / 6)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (f >= T - 12) { ctx.fillStyle = `rgba(0,0,0,${clamp((f - (T - 12)) / 12)})`; ctx.fillRect(0, 0, W, H); }
}

(async () => {
  fs.mkdirSync(FRAMES, { recursive: true });
  const HOST = await loadHost();
  await loadFonts();
  const IMAGES = {
    menuScreen: await loadImage(path.join(A, "menu-screen.png")),
    lockup: await loadImage(path.join(A, "lockup-keyed.png")),
    // one original counter per beat — same furniture system, different props
    counters: {
      hook: renderCounter("walnut", [{ kind: "plant" }, { kind: "chalk", lines: ["TANGAZO", "BONGOFOODIE"] }]),
      problem: renderCounter("espresso", [{ kind: "receipts" }]),
      menu: renderCounter("walnut", [{ kind: "chalk", lines: ["LEO:", "NYAMA CHOMA"], x: 560 }]),
      brains: renderCounter("espresso", [{ kind: "cups", x: -400 }]),
      pitch: renderCounter("walnut", [{ kind: "swatches" }]),
      cta: renderCounter("walnut", [{ kind: "chalk", lines: ["ASANTE!", "KARIBU!"], x: -44 }]),
    },
  };
  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");
  const start = Number(process.env.START_FRAME || 0);
  const stop = Number(process.env.END_FRAME || T);
  console.log("rendering", T, "frames, from", start, "to", stop);
  for (let f = start; f < stop; f++) {
    ctx.clearRect(0, 0, W, H);
    ctx.resetTransform();
    const localDraw = performerDraw(ctx, HOST, FPS);
    drawFrame(ctx, HOST, localDraw, IMAGES, f);
    fs.writeFileSync(path.join(FRAMES, String(f).padStart(4, "0") + ".png"), cv.toBuffer("image/png"));
    if (f % 120 === 0) console.log("  frame", f);
  }
  console.log("frames done ->", FRAMES);
})().catch((e) => { console.error(e); process.exit(1); });
