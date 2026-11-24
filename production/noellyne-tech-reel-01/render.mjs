/**
 * Noellyne — Tech Bila Hype · EP.1 v2 "MAANDISHI HAYASOMEKI"
 * Motion technique cloned (motion-faithful) from the approved reference;
 * every character, word, asset and claim on screen is ours. See SPEC.md.
 *
 * v2 (2026-11-24): voice-led cut. The six Kiswahili takes (mix.py) set the
 * timeline (out/timeline.json); the mouth follows out/mouth.json (lipsync.py);
 * she is drawn with the real rig (host.mjs performerDraw) so hand layers,
 * lids and AI/kit visemes are all live. Poses are placed fully inside the
 * safe box — v1 clipped `wave` and `point` at the frame edge, which is why
 * the owner said "hamna hands".
 *
 * Deterministic: frame-driven, no Date.now(). Output: out/frames/%04d.png
 * at 60 fps, 1080x1920. Audio: out/mix.wav (mix.py).
 */
import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, FONTS } from "../noellyne-host/host.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const HERE = path.join(ROOT, "production/noellyne-tech-reel-01");
const OUT = path.join(HERE, "out");
const FRAMES = path.join(OUT, "frames");
const W = 1080, H = 1920, FPS = 60;

const tl = JSON.parse(fs.readFileSync(path.join(OUT, "timeline.json"), "utf8"));
const MOUTH = JSON.parse(fs.readFileSync(path.join(OUT, "mouth.json"), "utf8"));
const COPY = JSON.parse(fs.readFileSync(path.join(HERE, "copy.json"), "utf8"));
const takeOf = (id) => COPY.takes.find((t) => t.id === id);
const T = tl.frames;

const CREAM = "#FBF7EF", SAND = "#F4E3C4", VIOLET = "#5B3FB5", DEEP = "#43287F",
      INK = "#1D2A33", ASH = "#49647F", GOLD = "#F2C66D", RED = "#D64545",
      PAPER = "#FFFDF6";

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
function pill(c, x, y, s, { bg = VIOLET, fg = CREAM, f, start, size = 26 }) {
  const p = pop(start, start + 18, f);
  const sc = lerp(0.55, 1, p);
  const w = 26 + measure(null, s, size, "LimsMono", false, 620, 4) + 26;
  c.save(); c.translate(x + w / 2, y + 27); c.scale(sc, sc); c.globalAlpha = clamp(p);
  rect(c, -w / 2, -27, w, 54, 27, bg);
  mono(c, s, 0, 10, size, fg, 1, 4, "center");
  c.restore(); c.globalAlpha = 1;
}
function monobadge(c, s, x, y, f, start, color = VIOLET) {
  const on = Math.floor((f - start) / 14) % 2 === 0 || f - start < 6;
  mono(c, s + (on ? " ▌" : "  "), x, y, 30, color, easeOut(start, start + 10, f), 6);
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
const cursorOn = (f) => Math.floor(f / 16) % 2 === 0;

/**
 * Draw her through the real rig. `x` is the CENTRE of the pose box; the pose is
 * scaled to width w and bottom-aligned to `bottomY`. Every caller keeps
 * x - w/2 >= 24 and x + w/2 <= W - 24 — the safe box v1 violated.
 */
function her(c, HOST, draw, f, span, pose, { cx, w, bottomY = H - 8, enter = "rise" }) {
  const h = w * (1136 / 939);
  const p = clamp((f - span.start) / 26);
  const rise = (1 - easeOut(span.start, span.start + 30, f)) * 380;
  const fade = enter === "fade" ? easeOut(span.start, span.start + 18, f) : 1;
  const take = takeOf(span.id);
  const cues = (take.gesture || []).map((g) => ({
    kind: g.kind, start: span.start + Math.round(g.at * FPS), len: g.len,
  }));
  const blinks = [span.start + 44, span.start + 44 + 116, span.start + 44 + 232]
    .filter((x) => x > span.start + 8 && x < span.end + 24);
  // soft ground shadow, drawn before the pose transform
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
// All beats are span-driven: (c, f, span). Entrance offsets are relative to
// span.start so the cut follows the measured voice, never vice versa.

function hook(c, f, span, HOST, draw) {
  c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
  halftone(c, 760, 90, 12, 7, 34, 4.6, INK, 0.085);
  if (f < span.start + 6) { c.fillStyle = `rgba(0,0,0,${1 - (f - span.start) / 6})`; c.fillRect(0, 0, W, H); }
  const s = span.start;
  pill(c, 80, 132, "TECH BILA HYPE — EP.1", { f, start: s + 6, size: 25 });
  const s1 = fitSize("MAANDISHI", 158, 880, "LimsSerif", false, 747);
  const s2 = fitSize("HAYASOMEKI.", 158, 880, "LimsSerif", false, 747);
  wordSlam(c, "MAANDISHI", 80, 372, s1, { family: "LimsSerif", color: INK, weight: 747, f, start: s + 30, rise: 54 });
  wordSlam(c, "HAYASOMEKI.", 80, 540, s2, { family: "LimsSerif", color: VIOLET, weight: 747, f, start: s + 42, rise: 54 });
  if (f >= s + 96) mono(c, "UNALISOMA?", 80, 640, 28, ASH, easeOut(s + 96, s + 114, f), 5);
  her(c, HOST, draw, f, span, "wave", { cx: 540, w: 660, enter: "rise" });
}

function problem(c, f, span) {
  c.fillStyle = INK; c.fillRect(0, 0, W, H);
  halftone(c, 96, 120, 8, 5, 30, 3.4, "#2b3b49", 0.8);
  const s = span.start;
  const g = "KWA NINI?";
  const typed = Math.floor(clamp((f - (s + 2)) / 2.2) * g.length);
  mono(c, g.slice(0, typed), 80, 300, 46, CREAM, 1, 8);
  if (typed < g.length && f > s + 2 && f % 12 < 6) {
    mono(c, "▌", 80 + measure(null, g.slice(0, typed), 46, "LimsMono", false, 620, 8) + 10, 300, 46, CREAM, 1, 0);
  }
  // wall of unreadable lines
  const rows = [170, 820, 640, 880, 520, 780, 360, 705, 560];
  const wallY = 452, step = 86, barH = 30;
  for (let i = 0; i < rows.length; i++) {
    const wpx = rows[i];
    const start = s + 40 + i * 10;
    const p = easeOut(start, start + 22, f);
    const y = wallY + i * step;
    c.globalAlpha = 0.28 + p * 0.35;
    rect(c, 96, y + (1 - p) * 30, Math.min(wpx, 620), barH, 15, "#33506b");
    c.globalAlpha = 1;
  }
  // red slashes
  if (f >= s + 128) {
    const p = clamp((f - (s + 128)) / 7);
    const jit = Math.sin((f - (s + 128)) * 2.1) * (1 - clamp((f - (s + 128)) / 30)) * 7;
    c.save(); c.translate(400 + jit, 1152); c.rotate(-0.055); c.globalAlpha = 0.92;
    rect(c, -300 * p, -140, 600 * p, 62, 31, RED);
    c.restore();
    if (f >= s + 136) { const p2 = clamp((f - (s + 136)) / 7); c.save(); c.translate(390 + jit, 1268); c.rotate(0.06); c.globalAlpha = 0.92; rect(c, -280 * p2, -132, 560 * p2, 56, 28, RED); c.restore(); }
    c.globalAlpha = 1;
  }
  if (f >= s + 152) mono(c, "mistari midogo, hakuna anayesoma.", 80, 1400, 23, "#c6d3e0", easeOut(s + 152, s + 168, f), 2);
  return true; // keepPose: drawn by caller via her()
}

function rule1(c, f, span) {
  c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
  halftone(c, 830, 1500, 10, 5, 30, 4, INK, 0.07);
  const s = span.start;
  monobadge(c, "KANUNI 01", 80, 152, f, s + 4);
  wordSlam(c, "NENO MOJA.", 80, 520, fitSize("NENO MOJA.", 168, 900, "LimsSerif", true, 560), { family: "LimsSerif", color: VIOLET, weight: 560, italic: true, f, start: s + 22, rise: 46 });
  wordSlam(c, "KUBWA.", 80, 782, 224, { family: "LimsSerif", color: INK, weight: 747, f, start: s + 46, rise: 46 });
  const u = measure(null, "KUBWA.", 224, "LimsSerif", false, 747);
  const up = easeOut(s + 52, s + 100, f);
  c.fillStyle = VIOLET; c.fillRect(80, 824, u * up, 12);
  // gold stamp, left column
  if (f >= s + 92) {
    const p = pop(s + 92, s + 110, f);
    c.save(); c.translate(330, 1160); c.rotate(-0.105); c.scale(lerp(1.6, 1, p), lerp(1.6, 1, p)); c.globalAlpha = clamp(p * 1.4);
    rect(c, -235, -92, 470, 184, 26, GOLD);
    strokeRR(c, -235, -92, 470, 184, 26, "#a67c1f", 4);
    text(c, "WEBSITE", 0, 34, 96, { family: "LimsSerif", color: INK, weight: 747, align: "center" });
    c.restore(); c.globalAlpha = 1;
  }
  mono(c, "fupi · moja · kubwa", 80, 1438, 27, ASH, easeOut(s + 120, s + 136, f), 4);
}

function rule2(c, f, span) {
  c.fillStyle = SAND; c.fillRect(0, 0, W, H);
  halftone(c, 96, 1380, 11, 6, 30, 4, INK, 0.08);
  const s = span.start;
  monobadge(c, "KANUNI 02", 80, 152, f, s + 4);
  wordSlam(c, "RANGI", 80, 470, 164, { family: "LimsSerif", color: INK, weight: 747, f, start: s + 14, rise: 40 });
  wordSlam(c, "MBILI", 80, 706, 164, { family: "LimsSerif", color: VIOLET, weight: 747, f, start: s + 32, rise: 40 });
  wordSlam(c, "TU.", 80, 942, 164, { family: "LimsSerif", color: INK, weight: 747, f, start: s + 50, rise: 40 });
  // dichromatic swatch dots — left column
  swatch(c, 205, 1220, 88, VIOLET, "VIOLET", f, s + 76, true);
  swatch(c, 465, 1220, 88, PAPER, "CREAM", f, s + 108, false);
  mono(c, "violet kwa hatua · cream kupumzika", 80, 1520, 22, "#6d5426", easeOut(s + 128, s + 144, f), 2);
}

function rule3(c, f, span) {
  c.fillStyle = VIOLET; c.fillRect(0, 0, W, H);
  starburst(c, "tl", "#ffffff", 7, 240, 0.95);
  starburst(c, "br", "#ffffff", 7, 300, 0.95);
  halftone(c, 720, 240, 8, 6, 34, 3.6, "#ffffff", 0.16);
  const s = span.start;
  monobadge(c, "KANUNI 03", 330, 152, f, s + 4, CREAM);
  wordSlam(c, "ANZA NA", 80, 480, 148, { family: "LimsSerif", color: CREAM, weight: 560, italic: true, f, start: s + 14, rise: 44 });
  wordSlam(c, "SWALI.", 80, 712, fitSize("SWALI.", 224, 880, "LimsSerif", false, 747), { family: "LimsSerif", color: CREAM, weight: 747, f, start: s + 34, rise: 44 });
  // slam card with the question
  if (f >= s + 76) {
    const p = pop(s + 76, s + 92, f);
    const sc = lerp(0.62, 1, p);
    c.save(); c.translate(410, 1135); c.scale(sc, sc); c.globalAlpha = clamp(p);
    rect(c, -310, -96, 620, 192, 30, CREAM);
    const t = "UNATAKA WEBSITE";
    const tw = measure(null, t, 62, "LimsSerif", false, 747);
    text(c, t, 0, 22, 62, { family: "LimsSerif", color: INK, weight: 747, align: "center" });
    if (Math.floor(f / 18) % 2 === 0) text(c, "?", -tw / 2 + tw + 46, 24, 96, { family: "LimsSerif", color: GOLD, weight: 747, align: "center" });
    c.restore(); c.globalAlpha = 1;
  }
  mono(c, "swali jema huwasimamisha.", 80, 1418, 26, "#e7defc", easeOut(s + 96, s + 112, f), 2);
}

function cta(c, f, span, HOST, draw) {
  c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
  halftone(c, 700, 90, 9, 5, 30, 3.6, INK, 0.07);
  const s = span.start;
  const p = clamp((f - (s + 2)) / 26);
  // logo wipe-in
  c.save();
  c.beginPath(); c.rect(80, 160, 300 * p, 300); c.clip();
  c.globalAlpha = clamp(p * 1.2);
  c.drawImage(HOST.mark, 80, 160, 256, 256);
  c.restore(); c.globalAlpha = 1;
  if (f >= s + 70) mono(c, "TECH BILA HYPE · EP.1", 84, 512, 29, ASH, easeOut(s + 70, s + 86, f), 5);
  wordSlam(c, "HIYO NDIYO.", 84, 646, fitSize("HIYO NDIYO.", 122, 912, "LimsSerif", false, 747), { family: "LimsSerif", color: INK, weight: 747, f, start: s + 86, rise: 40 });
  wordSlam(c, "FUATA HIYO.", 84, 796, fitSize("FUATA HIYO.", 122, 912, "LimsSerif", true, 560), { family: "LimsSerif", color: VIOLET, weight: 560, italic: true, f, start: s + 100, rise: 40 });
  const u = easeOut(s + 112, s + 150, f);
  c.fillStyle = GOLD; c.fillRect(84, 830, 330 * u, 10);
  mono(c, "Tips fupi. Bila hype.", 84, 884, 27, INK, easeOut(s + 122, s + 138, f), 2);
  const dstart = s + 148, dchars = Math.floor(clamp((f - dstart) / 2.4) * "altra.tanzaniareach.com".length);
  mono(c, "altra.tanzaniareach.com".slice(0, dchars) + (cursorOn(f) ? "▌" : ""), 84, 950, 28, VIOLET, 1, 2);
  her(c, HOST, draw, f, span, "thumbsup", { cx: 560, w: 660, enter: "rise", bottomY: H - 6 });
  if (f >= T - 12) { c.fillStyle = `rgba(0,0,0,${clamp((f - (T - 12)) / 12)})`; c.fillRect(0, 0, W, H); }
}

// ---------------------------------------------------------------- scenes
const SCENES = { hook, problem, rule1, rule2, rule3, cta };
// pose + placement per beat — all fully inside the safe box (x - w/2 >= 24, x + w/2 <= W - 24)
const HER = {
  hook:    { pose: "wave",     cx: 540, w: 660 },
  problem: { pose: "present",  cx: 810, w: 460, bottomY: H - 16 },
  rule1:   { pose: "one",      cx: 795, w: 510, bottomY: H - 16 },
  rule2:   { pose: "ok",       cx: 810, w: 490, bottomY: H - 16 },
  rule3:   { pose: "point",    cx: 820, w: 470, bottomY: H - 16 },
  cta:     { pose: "thumbsup", cx: 560, w: 660 },
};

function drawFrame(ctx, HOST, draw, f) {
  const span = [...tl.spans].reverse().find((s) => f >= s.start - 4) || tl.spans[0];
  const scene = SCENES[span.id];
  scene(ctx, f, span, HOST, draw);
  if (span.id !== "hook" && span.id !== "cta") {
    const p = HER[span.id];
    her(ctx, HOST, draw, f, span, p.pose, { cx: p.cx, w: p.w, bottomY: p.bottomY ?? H - 8, enter: "fade" });
  }
  // flash on every cut: 6-frame cream wash
  const cut = tl.spans.find((s) => f >= s.start && f < s.start + 6);
  if (cut && cut.start > 100) {
    ctx.fillStyle = `rgba(251,247,239,${0.85 * (1 - (f - cut.start) / 6)})`;
    ctx.fillRect(0, 0, W, H);
  }
}

(async () => {
  fs.mkdirSync(FRAMES, { recursive: true });
  const HOST = await loadHost();
  // The AI mouth plates are NOT calibrated to this rig build: on wave they
  // replaced the mouth correctly but their dark backdrop bled past her
  // silhouette and ended in a hard rectangle on her chest. The kit patches
  // are aligned on wave/point/one/present/thumbsup/ok (visually verified),
  // so drop the ai path and let performerDraw use the kit visemes.
  for (const p of Object.values(HOST.rig.poses)) delete p.ai;
  await loadFonts();
  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");
  const start = Number(process.env.START_FRAME || 0);
  const stop = Number(process.env.END_FRAME || T);
  console.log("rendering", T, "frames, from", start, "to", stop);
  for (let f = start; f < stop; f++) {
    ctx.clearRect(0, 0, W, H);
    ctx.resetTransform();
    const localDraw = performerDraw(ctx, HOST, FPS);
    drawFrame(ctx, HOST, localDraw, f);
    fs.writeFileSync(path.join(FRAMES, String(f).padStart(4, "0") + ".png"), cv.toBuffer("image/png"));
    if (f % 120 === 0) console.log("  frame", f);
  }
  console.log("frames done ->", FRAMES);
})().catch((e) => { console.error(e); process.exit(1); });
