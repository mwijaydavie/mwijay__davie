/**
 * Noellyne — YouTube channel banner (production v1).
 *
 * 2560x1440 (YouTube's recommended size). YouTube crops the SAME file four ways:
 *   TV       2560x1440 (everything)
 *   Desktop  2560x423  (center band only)
 *   Tablet   1855x423  (center band, x in [352, 2208])
 *   Mobile   1546x423  (center band, x in [507, 2053])
 * The universal safe band is therefore the center 1546x423 (y in [508, 931]) —
 * EVERY piece of type and her face live inside it, so the banner reads fresh on
 * all four. Decorative layers (papers, desk, floor) bleed and get cropped, which
 * is intentional.
 *
 * Composition derives from production/noellyne-ig/identity/banners.mjs (same kit,
 * same sets) — this is a re-layout for the safe band, not a restyle.
 *
 * Run:  node production/noellyne-social/make-yt-banner.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, FONTS } from "../noellyne-host/host.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const PROPS = path.join(ROOT, "production/noellyne-ig/identity/props");
const OUT = path.join(ROOT, "production/noellyne-social");

const W = 2560, H = 1440;
const SAFE = { w: 1546, h: 423 };          // YouTube universal safe area
const SX = (W - SAFE.w) / 2, SY = (H - SAFE.h) / 2;   // 507, 508

const PAPER = "#fbf7ef", CREAM = "#f7f1e6", INK = "#1d2a33", SLATE = "#5b6b76",
      VIOLET = "#5b3fb5";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const hash = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function rect(c, x, y, w, h, r, col) { rr(c, x, y, w, h, r); c.fillStyle = col; c.fill(); }
function line(c, pts, col, px = 2) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
  c.strokeStyle = col; c.lineWidth = px; c.lineCap = "round"; c.stroke();
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
function pool(c, cx, cy, r, rgb, strength = 0.5) {
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(${rgb},${strength})`);
  g.addColorStop(0.55, `rgba(${rgb},${strength * 0.42})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.fillRect(cx - r, cy - r, r * 2, r * 2);
}
function orbit(c, cx, cy, r, col, dash = 22, lw = 2) {
  c.save(); c.strokeStyle = col; c.lineWidth = lw; c.setLineDash([dash, dash * 0.85]);
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); c.restore();
}
function skyWash(c, top, mid, low) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(0.52, mid); g.addColorStop(1, low);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function setLilac(c) {
  skyWash(c, "#faf6ff", "#f0e8ff", "#e2d3fa");
  pool(c, W * 0.42, H * 0.30, W * 0.52, "255,255,255", 0.85);
  pool(c, W * 0.83, H * 0.20, W * 0.22, "206,236,255", 0.40);
  c.save(); c.globalAlpha = 0.5; c.fillStyle = "#ffd9c6";
  c.beginPath(); c.arc(W * 0.80, H * 0.155, W * 0.148, 0, Math.PI * 2); c.fill(); c.restore();
  orbit(c, W * 0.46, H * 0.31, W * 0.295, "rgba(91,63,181,0.15)", 30, 2.5);
}
function paper(c, x, y, w, h, deg, { seed = 1, rules = 0, grid = false } = {}) {
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate((deg * Math.PI) / 180);
  c.shadowColor = "rgba(31,44,54,0.20)"; c.shadowBlur = 26; c.shadowOffsetY = 12;
  c.fillStyle = "#fffdf8"; c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 4); c.fill();
  c.shadowColor = "transparent"; c.shadowBlur = 0;
  c.strokeStyle = "rgba(29,42,51,0.10)"; c.lineWidth = 1.4;
  c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 4); c.stroke();
  const pad = Math.min(w, h) * 0.14;
  if (grid) {
    c.strokeStyle = "rgba(91,107,118,0.22)"; c.lineWidth = 1;
    for (let i = 1; i < 9; i++) { const sx = -w / 2 + (i * w) / 9;
      c.beginPath(); c.moveTo(sx, -h / 2 + pad); c.lineTo(sx, h / 2 - pad); c.stroke(); }
    for (let j = 1; j < 8; j++) { const sy = -h / 2 + j * (h / 8);
      c.beginPath(); c.moveTo(-w / 2 + pad, sy); c.lineTo(w / 2 - pad, sy); c.stroke(); }
  } else if (rules) {
    for (let i = 0; i < rules; i++) {
      const y2 = -h / 2 + pad + (i + 1) * ((h - pad * 2) / (rules + 1.4));
      const wid = (w - pad * 2) * (0.55 + hash(seed + i) * 0.42);
      rect(c, -w / 2 + pad, y2, wid, Math.max(5, h * 0.022), 3,
           i === 0 ? "rgba(91,63,181,0.62)" : "rgba(29,42,51,0.17)");
    }
  }
  c.restore();
}
function desk(c, { y, w, bottom, color = "#f3e6d2", apron = "#e8d8bd" }) {
  const inset = w * 0.072, depth = Math.min(w * 0.075, 150);
  const sg = c.createLinearGradient(0, y - 8, 0, y + depth * 0.9);
  sg.addColorStop(0, "rgba(31,44,54,0.24)"); sg.addColorStop(1, "rgba(31,44,54,0)");
  c.fillStyle = sg; c.fillRect(0, y - 8, w, depth);
  c.beginPath();
  c.moveTo(inset, y); c.lineTo(w - inset, y); c.lineTo(w, y + depth); c.lineTo(0, y + depth);
  c.closePath();
  const tg = c.createLinearGradient(0, y, 0, y + depth);
  tg.addColorStop(0, color); tg.addColorStop(1, "#f7efe3"); c.fillStyle = tg; c.fill();
  line(c, [[0, y + depth], [w, y + depth]], "rgba(255,255,255,0.85)", 3);
  const ag = c.createLinearGradient(0, y + depth, 0, bottom);
  ag.addColorStop(0, apron); ag.addColorStop(0.55, "#ecdfca"); ag.addColorStop(1, "#f2ead9");
  c.fillStyle = ag; c.fillRect(0, y + depth, w, bottom - (y + depth));
  line(c, [[0, y + depth + 1.5], [w, y + depth + 1.5]], "rgba(31,44,54,0.14)", 3);
}
function floorPlane(c, top, tone = "238,222,250") {
  const g = c.createLinearGradient(0, top - 40, 0, H);
  g.addColorStop(0, `rgba(${tone},0)`); g.addColorStop(0.30, `rgba(${tone},0.34)`);
  g.addColorStop(1, `rgba(${tone},0.88)`); c.fillStyle = g; c.fillRect(0, top - 40, W, H - (top - 40));
  const sg = c.createLinearGradient(0, top, 0, top + H * 0.055);
  sg.addColorStop(0, "rgba(31,44,54,0.16)"); sg.addColorStop(1, "rgba(31,44,54,0)");
  c.fillStyle = sg; c.fillRect(0, top, W, H * 0.055);
}

/* ------------------------------------------------------------------ host */
await loadFonts();
const HOST = await loadHost();
const PROPS_IMG = {};
for (const n of ["mug", "plant"]) PROPS_IMG[n] = await loadImage(path.join(PROPS, n + ".png"));
function photoProp(c, name, x, baseY, w, { center = false } = {}) {
  const img = PROPS_IMG[name];
  const h = (w * img.height) / img.width;
  const cx = center ? x : x + w / 2;
  const g = c.createRadialGradient(cx, baseY, 0, cx, baseY, w * 0.55);
  g.addColorStop(0, "rgba(31,44,54,0.28)"); g.addColorStop(0.55, "rgba(31,44,54,0.12)");
  g.addColorStop(1, "rgba(31,44,54,0)");
  c.save(); c.translate(cx, baseY); c.scale(1, 0.22); c.translate(-cx, -baseY);
  c.fillStyle = g; c.beginPath(); c.arc(cx, baseY, w * 0.55, 0, Math.PI * 2); c.fill(); c.restore();
  c.drawImage(img, center ? x - w / 2 : x, baseY - h, w, h);
}
const INK_H = 0.985;
const PLATES = new Map();
function plate(pose, v) {
  const key = pose + "|" + v.file;
  if (PLATES.has(key)) return PLATES.get(key);
  const src = HOST.layers[v.file];
  const cv = createCanvas(src.width, src.height);
  const c = cv.getContext("2d");
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = "destination-in";
  const g = c.createRadialGradient(cv.width / 2, cv.height / 2, 0, cv.width / 2, cv.height / 2, cv.width * 0.46);
  g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(0.62, "rgba(0,0,0,1)");
  g.addColorStop(0.86, "rgba(0,0,0,0.65)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
  c.globalCompositeOperation = "destination-in";
  c.drawImage(HOST.layers[HOST.rig.poses[pose].base.file], -(v.cx - v.w / 2), -(v.cy - v.h / 2));
  PLATES.set(key, cv);
  return cv;
}
function her(c, pose, x, y, w, { mouth = "mid" } = {}) {
  const draw = performerDraw(c, HOST, 30);
  const p = HOST.rig.poses[pose];
  const v = p?.ai?.[mouth];
  const inner = v ? (g) => g.drawImage(plate(pose, v), v.cx - v.w / 2, v.cy - v.h / 2) : undefined;
  draw(0, "review", { pose, mouth: false, x, y, w, cues: [], nods: [], inner });
  return { hemY: y + w * INK_H, cx: x + w / 2 };
}
function herShadow(c, cx, atY, w) {
  const g = c.createRadialGradient(cx, atY, 0, cx, atY, w * 0.46);
  g.addColorStop(0, "rgba(31,44,54,0.26)"); g.addColorStop(0.5, "rgba(31,44,54,0.10)"); g.addColorStop(1, "rgba(31,44,54,0)");
  c.save(); c.translate(cx, atY); c.scale(1, 0.20); c.translate(-cx, -atY);
  c.fillStyle = g; c.beginPath(); c.arc(cx, atY, w * 0.46, 0, Math.PI * 2); c.fill(); c.restore();
}

/* --------------------------------------------------------------- banner */
const cv = createCanvas(W, H);
const c = cv.getContext("2d");
setLilac(c);

// decorative papers — outside the safe band (TV-only zones), never behind type
paper(c, -84, 118, 255, 192, -8, { grid: true, seed: 31 });
paper(c, 1120, 88, 235, 172, 7, { rules: 4, seed: 37 });
paper(c, 2350, 940, 200, 150, 9, { rules: 3, seed: 41 });

// ── her: face inside the universal band, right side, peace-sign
const w = 950;
const x = 1272, y = 320;
pool(c, x + w * 0.5, y + w * 0.30, w * 0.86, "255,255,255", 0.55);
const h = her(c, "peace", x, y, w, { mouth: "mid" });
herShadow(c, h.cx, h.hemY + 20, w);
desk(c, { y: 1132, w: W, bottom: 1408, color: "#f3e6d2", apron: "#e8d8bd" });
floorPlane(c, 1408, "238,222,250");
photoProp(c, "plant", 2385, 1138, 165, { center: true });
photoProp(c, "mug", 1560, 1132, 72);

// ── type: inside the universal safe band (x 507..2053, y 508..931)
const barX = SX + 26, tx = SX + 62;
rect(c, barX, SY + 36, 6, 330, 3, VIOLET);

// line 1: ALTRAWARE mark + wordmark
c.drawImage(HOST.mark, tx, SY + 22, 42, 42);
type(c, "ALTRAWARE", tx + 56, SY + 52, 25, { weight: 750, track: 2.2, color: INK });

// line 2: eyebrow
type(c, "M I M I   N I", tx + 2, SY + 128, 32, { weight: 620, color: SLATE, track: 6 });

// line 3: the name — cap height lands well inside the band
type(c, "Noellyne.", tx - 4, SY + 246, 150, { family: FONTS.serif, weight: 830, color: INK });

// line 4: descriptor
mono(c, "TECH HOST · TECH BILA HYPE", tx, SY + 300, 27, { color: VIOLET, track: 4 });

// line 5: subscribe pill
const pw = 352, ph = 64, py = SY + 330;
rect(c, tx, py, pw, ph, ph / 2, VIOLET);
mono(c, "SUBSCRIBE", tx + 46, py + 42, 25, { color: "#ffffff", track: 4 });

fs.writeFileSync(path.join(OUT, "banner-yt.png"), cv.toBuffer("image/png"));
process.stdout.write(`banner-yt.png  ${W}x${H}\nsafe band: x [${SX}, ${SX + SAFE.w}], y [${SY}, ${SY + SAFE.h}]\n`);
