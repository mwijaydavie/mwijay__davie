/**
 * Noellyne — "comment PDF" campaign creatives.
 *
 * The promise in the pack is "Apps · AI · Tools — bila hype", so this post is
 * the delivery: ask for a comment, give away the 12-tool guide. Two outputs:
 *
 *   out/post-comment-pdf.png   1080×1350 (IG feed 4:5)
 *   out/story-comment-pdf.png  1080×1920 (IG / YouTube Shorts 9:16)
 *
 * The same daylight sets as the identity pack — cream paper, lilac pool,
 * another desk so "hana legs" stays hidden — and the `present` pose new for
 * this campaign, holding the guide towards the viewer.
 *
 * Run:  node production/noellyne-ig/identity/campaign.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, FONTS } from "../../noellyne-host/host.mjs";

const ROOT = process.cwd();
const HERE = path.join(ROOT, "production/noellyne-ig/identity");
const OUT = path.join(HERE, "out");
fs.mkdirSync(OUT, { recursive: true });

const PAPER = "#fbf7ef";
const CREAM = "#f7f1e6";
const INK = "#1d2a33";
const SLATE = "#5b6b76";
const VIOLET = "#5b3fb5";
const LILAC = "#b9a6f2";
const MINT = "#2fa87a";
const CORAL = "#e8735a";
const GOLD = "#e0a63c";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const hash = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

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
function serif(c, s, x, y, size, o = {}) {
  type(c, s, x, y, size, { family: FONTS.serif, weight: 560, ...o });
}
function mono(c, s, x, y, size, o = {}) {
  type(c, s, x, y, size, { family: FONTS.mono, weight: 500, ...o });
}
function line(c, pts, col, px = 2) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
  c.strokeStyle = col; c.lineWidth = px; c.stroke();
}

/** Daylight set shared by both canvases. */
function setDay(c, W, H) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#fdfaf2");
  g.addColorStop(0.55, PAPER);
  g.addColorStop(1, CREAM);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // sun pool upper-right, like the rooms
  const pool = c.createRadialGradient(W * 0.78, H * 0.10, 0, W * 0.78, H * 0.10, H * 0.55);
  pool.addColorStop(0, "rgba(255,252,238,0.95)");
  pool.addColorStop(1, "rgba(255,252,238,0)");
  c.fillStyle = pool; c.fillRect(0, 0, W, H);
  // orbit arc, thin
  c.save();
  c.globalAlpha = 0.5;
  c.strokeStyle = "rgba(91,63,181,0.17)"; c.lineWidth = 2.5; c.setLineDash([26, 18]);
  c.beginPath(); c.arc(W * 0.42, H * 0.30, W * 0.47, 0, Math.PI * 2); c.stroke();
  c.setLineDash([]); c.restore();
}

/** Deco paper sheets with fake handwriting. */
function paper(c, x, y, w, h, ang, { seed = 5, rules = 3 } = {}) {
  c.save();
  c.translate(x + w / 2, y + h / 2); c.rotate((ang * Math.PI) / 180); c.translate(-w / 2, -h / 2);
  c.shadowColor = "rgba(31,44,54,0.20)"; c.shadowBlur = 18; c.shadowOffsetY = 7;
  c.fillStyle = "#fffdf8"; c.fillRect(0, 0, w, h);
  c.shadowColor = "transparent";
  c.strokeStyle = "rgba(29,42,51,0.12)"; c.lineWidth = 2; c.strokeRect(0, 0, w, h);
  for (let i = 0; i < rules; i++) {
    const ly = h * 0.30 + i * (h * 0.20);
    const lw = w * (0.30 + hash(seed + i) * 0.48);
    line(c, [[w * 0.14, ly], [w * 0.14 + lw, ly]], "rgba(91,63,181,0.42)", 5);
  }
  c.restore();
}

/** A desk along the bottom — same trick as the identity pack. */
function desk(c, W, y, bottom) {
  const depth = W * 0.075;
  const inset = W * 0.072;
  const sg = c.createLinearGradient(0, y - 8, 0, y + depth);
  sg.addColorStop(0, "rgba(31,44,54,0.22)");
  sg.addColorStop(1, "rgba(31,44,54,0)");
  c.fillStyle = sg; c.fillRect(0, y - 8, W, depth);
  c.beginPath();
  c.moveTo(inset, y); c.lineTo(W - inset, y); c.lineTo(W, y + depth); c.lineTo(0, y + depth); c.closePath();
  const tg = c.createLinearGradient(0, y, 0, y + depth);
  tg.addColorStop(0, "#eee2cd"); tg.addColorStop(1, "#f4ead9");
  c.fillStyle = tg; c.fill();
  line(c, [[0, y + depth], [W, y + depth]], "rgba(255,255,255,0.85)", 3);
  const ag = c.createLinearGradient(0, y + depth, 0, bottom);
  ag.addColorStop(0, "#e3d4ba"); ag.addColorStop(0.55, "#e8dabd"); ag.addColorStop(1, "#f1e6d2");
  c.fillStyle = ag; c.fillRect(0, y + depth, W, bottom - (y + depth));
  line(c, [[0, y + depth + 1.5], [W, y + depth + 1.5]], "rgba(31,44,54,0.13)", 3);
}

await loadFonts();
const HOST = await loadHost();
const PROPS = {};
for (const n of ["laptop", "mug", "plant"]) {
  PROPS[n] = await loadImage(path.join(HERE, "props", n + ".png"));
}
function photoProp(c, name, x, baseY, w, { center = false } = {}) {
  const img = PROPS[name];
  const h = (w * img.height) / img.width;
  const cx = center ? x : x + w / 2;
  const g = c.createRadialGradient(cx, baseY, 0, cx, baseY, w * 0.55);
  g.addColorStop(0, "rgba(31,44,54,0.26)");
  g.addColorStop(0.55, "rgba(31,44,54,0.11)");
  g.addColorStop(1, "rgba(31,44,54,0)");
  c.save();
  c.translate(cx, baseY); c.scale(1, 0.22); c.translate(-cx, -baseY);
  c.fillStyle = g;
  c.beginPath(); c.arc(cx, baseY, w * 0.55, 0, Math.PI * 2); c.fill();
  c.restore();
  c.drawImage(img, center ? x - w / 2 : x, baseY - h, w, h);
}

/** Her own AI plate for a still — closed smile reads "mid-word" elsewhere,
 *  but this pose has no AI plates yet, so the base is used as-is. */
function her(c, pose, x, y, w) {
  const draw = performerDraw(c, HOST, 30);
  draw(0, "review", { pose, mouth: false, x, y, w, cues: [], nods: [] });
  return { x, y, w, hemY: y + w * 0.985, cx: x + w / 2 };
}

/** The PDF itself, drawn as a little book — she presents the real product. */
function pdfCard(c, cx, cy, w, ang) {
  const h = w * 1.42;
  c.save();
  c.translate(cx, cy); c.rotate((ang * Math.PI) / 180);
  c.shadowColor = "rgba(31,44,54,0.35)"; c.shadowBlur = 34; c.shadowOffsetY = 16;
  rect(c, -w / 2, -h / 2, w, h, 10, "#fffdf8");
  c.shadowColor = "transparent";
  c.strokeStyle = "rgba(29,42,51,0.14)"; c.lineWidth = 2; rr(c, -w / 2, -h / 2, w, h, 10); c.stroke();
  // cover bands
  c.fillStyle = "#f3ece0"; c.fillRect(-w / 2, -h / 2, w, h * 0.145);
  mono(c, "PDF", -w / 2 + 16, -h / 2 + h * 0.096, 17, { color: CORAL, track: 3 });
  // spine accent + headline, all inside the card
  rect(c, -w / 2 + 15, -h * 0.16, 4, h * 0.56, 2, VIOLET);
  type(c, "TECH", -w / 2 + 32, -h * 0.155, w * 0.19, { weight: 830, color: INK });
  type(c, "BILA", -w / 2 + 32, h * 0.005, w * 0.19, { weight: 830, color: INK });
  type(c, "HYPE.", -w / 2 + 32, h * 0.165, w * 0.19, { weight: 830, color: INK });
  c.fillStyle = "#f3ece0"; c.fillRect(-w / 2, h * 0.335, w, h * 0.055);
  mono(c, "@noellyne", 0, h * 0.375, 12.5, { align: "center", color: SLATE, track: 1 });
  c.restore();
}

function header(c, W, tag) {
  c.drawImage(HOST.mark, 56, 46, 42, 42);
  type(c, "ALTRAWARE", 112, 76, 23, { weight: 750, track: 1.6, color: INK });
  mono(c, tag, W - 56, 76, 17, { align: "right", color: "rgba(29,42,51,0.52)", track: 3 });
  line(c, [[56, 112], [W - 56, 112]], "rgba(29,42,51,0.14)", 2);
}

function pill(c, x, y, w, h, fill, text, textCol, size, track) {
  rect(c, x, y, w, h, h / 2, fill);
  mono(c, text, x + w / 2, y + h / 2 + size * 0.36, size, { align: "center", color: textCol, track });
}

/* ---------------------------------------------------------------- feed post */
function post() {
  const W = 1080, H = 1350;
  const cv = createCanvas(W, H);
  const c = cv.getContext("2d");
  setDay(c, W, H);
  header(c, W, "TECH BILA HYPE — PDF");

  // type, left column — hard right edge at ~430 so it never touches her
  rect(c, 56, H * 0.180, 5, H * 0.335, 2.5, CORAL);
  const tx = 84;
  mono(c, "BURE — GUIDE YA BURE", tx, H * 0.215, 19, { color: CORAL, track: 5 });
  type(c, "COMMENT", tx, H * 0.335, 94, { weight: 830, color: INK });
  serif(c, "'PDF'.", tx, H * 0.470, 144, { color: VIOLET });
  const sub = ["niandikie 'PDF' kwenye", "comments — nakutumia guide", "ya Tech Bila Hype. Bure."];
  sub.forEach((l, i) => type(c, l, tx, H * 0.528 + i * 33, 23, { weight: 550, color: SLATE }));
  pill(c, tx, H * 0.700, 330, 52, VIOLET, "PDF — BURE · @noellyne", "#ffffff", 18, 3);

  // her on the right, presenting — palm lands at frame centre-right
  const w = 560;
  const x = W - w + 4;
  const y = H * 0.205;
  const hem = y + w * 0.985;

  const h = her(c, "present", x, y, w);
  desk(c, W, hem - 16, H);
  pdfCard(c, 560, 578, 150, -7);
  photoProp(c, "mug", W - 66, hem - 8, 64, { center: true });

  // flow strip on the apron — three steps, then the micro line
  const steps = [["HATUA 1", "COMMENT 'PDF'"], ["HATUA 2", "NITAKUTUMIA PDF"], ["HATUA 3", "ANZA LEO"]];
  const cw = 276, ch = 96, gap = 46;
  const span = steps.length * cw + (steps.length - 1) * gap;
  let fx = (W - span) / 2;
  const fy = H - 348;
  for (let i = 0; i < steps.length; i++) {
    rect(c, fx, fy, cw, ch, 14, "#fffdf8");
    c.save();
    c.strokeStyle = "rgba(29,42,51,0.14)"; c.lineWidth = 2; rr(c, fx, fy, cw, ch, 14); c.stroke();
    c.restore();
    mono(c, steps[i][0], fx + 20, fy + 30, 15, { color: VIOLET, track: 3 });
    type(c, steps[i][1], fx + 20, fy + 70, 21.5, { weight: 760, color: INK });
    if (i < steps.length - 1) {
      const ax = fx + cw + gap / 2;
      type(c, "→", ax, fy + ch / 2 + 10, 30, { align: "center", weight: 400, color: VIOLET });
    }
    fx += cw + gap;
  }
  mono(c, "TECH BILA HYPE — NOELLYNE · ALTRAWARE · @noellyne", W / 2, H - 128, 15.5,
       { align: "center", color: "rgba(29,42,51,0.55)", track: 3 });
  mono(c, "comment 'PDF' na guide itakufikia — bure kabisa", W / 2, H - 88, 17.5,
       { align: "center", color: SLATE, track: 1 });
  return cv;
}

/* ------------------------------------------------------------------- story */
function story() {
  const W = 1080, H = 1920;
  const cv = createCanvas(W, H);
  const c = cv.getContext("2d");
  setDay(c, W, H);
  header(c, W, "TECH BILA HYPE — PDF");

  // big type, centred
  mono(c, "TECH BILA HYPE — GUIDE YA BURE", W / 2, H * 0.185, 19, { align: "center", color: CORAL, track: 6 });
  type(c, "COMMENT", W / 2, H * 0.300, 132, { align: "center", weight: 830, color: INK });
  serif(c, "'PDF'.", W / 2, H * 0.415, 200, { align: "center", color: VIOLET });
  type(c, "nakutumia guide ya Apps · AI · Tools — bure", W / 2, H * 0.475, 26,
       { align: "center", weight: 550, color: SLATE });

  // her, big, behind the desk
  const w = 830;
  const x = (W - w) / 2;
  const y = H * 0.475;
  const hem = y + w * 0.985;

  const h = her(c, "hold", x, y, w);
  desk(c, W, hem - 20, H);
  pdfCard(c, W * 0.845, H * 0.665, 150, 7);
  photoProp(c, "laptop", W * 0.055, hem + 4, 205);
  photoProp(c, "mug", W * 0.845, hem + 2, 66);

  // CTA pill, above the platform bar
  pill(c, (W - 560) / 2, H - 236, 560, 78, VIOLET, "↓ NIANDIKE 'PDF' CHINI ↓", "#ffffff", 21, 3);
  mono(c, "IG · YOUTUBE · @noellyne", W / 2, H - 110, 17, { align: "center", color: "rgba(29,42,51,0.55)", track: 4 });
  return cv;
}

for (const [name, cv] of [["post-comment-pdf.png", post()], ["story-comment-pdf.png", story()]]) {
  fs.writeFileSync(path.join(OUT, name), cv.toBuffer("image/png"));
  process.stdout.write(`  ${name}  ${cv.width}×${cv.height}\n`);
}
