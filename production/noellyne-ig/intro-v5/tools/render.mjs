/**
 * V5 renderer — Noellyne IG profile intro.
 *
 * Why this exists instead of a V4 patch:
 *   Every V3/V4 attempt composited a *cutout* of Noellyne over a stage. On a
 *   light background the matte edge always showed (halo, violet rim), and the
 *   owner read it as "pasted / poorly done". V5 removes the failure mode: her
 *   real footage lives inside a designed screen card, the way the Altraware
 *   reference reels put screenshots inside panels. A designed edge is not a
 *   mistake, and the footage is pixel-identical to the approved source.
 *
 * The source reel has its own lower-thirds baked in, including the wrong brand
 * ("TECH PULSE TZ"). Every crop below is measured to exclude it: wide shots use
 * x >= 596, which starts right of the last baked glyph.
 *
 * Visual language, measured off "Shule Altra" and "Nyama TZ v2":
 *   cream #FDF7EB field, deep navy #14202B display type, royal-blue #1F5AA5
 *   for the accent word, one navy caption pill at the bottom, violet mark and
 *   a section label in a hairline header, progress ticks under it.
 */
import { createCanvas, loadImage, Image, GlobalFonts } from "@napi-rs/canvas";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const FRAMES = path.join(ROOT, ".cache/noellyne-v5/frames");
const OUT = path.join(ROOT, "out/noellyne-ig-intro-v5/timeline");

const W = 1080;
const H = 1920;
const FPS = 30;
const M = 96; // page margin, same on both sides

// ---------------------------------------------------------------- palette
const CREAM = "#FDF7EB";
const NAVY = "#14202B";
const ROYAL = "#1F5AA5";
const VIOLET = "#5B3E8F";
const LINE = "#E0D3BC";
const CARD = "#FFFFFF";

// ---------------------------------------------------------------- type
const FONT_DIR = path.join(ROOT, ".cache/rt/matplotlib/mpl-data/fonts/ttf");
for (const f of ["DejaVuSans-Bold.ttf", "DejaVuSans.ttf", "DejaVuSans-BoldOblique.ttf"])
  if (fs.existsSync(path.join(FONT_DIR, f))) GlobalFonts.registerFromPath(path.join(FONT_DIR, f));
const SANS = "DejaVu Sans";

// ---------------------------------------------------------------- timeline
// Beat lengths follow the V5 VO (audio-src) plus a beat of air. The VO is
// grouped so the name and the Altraware line land together, as one thought.
const BEATS = [
  { id: "hook", from: 0.0, to: 4.9 },
  { id: "name", from: 4.9, to: 11.0 },
  { id: "promise", from: 11.0, to: 16.6 },
  { id: "cta", from: 16.6, to: 19.6 },
];
const TOTAL = BEATS[BEATS.length - 1].to;

/**
 * win: source crop window. Chosen so no baked-in graphic from the source reel
 *      survives: hook/cta are the phone-pose shot (right of the "AI IKISEMA"
 *      box), name/promise are the desk shot (right of the TECH PULSE TZ block).
 * card: [x, y, w, h] media panel.
 * move: source in/out, so every panel has slow life instead of a freeze.
 */
const SHOTS = {
  hook: {
    win: [60, 556, 520, 1344],
    card: [598, 268, 386, 610],
    move: [1.28, 2.05],
  },
  name: {
    win: [596, 396, 1079, 1330],
    card: [96, 552, 720, 768],
    move: [7.75, 8.45],
  },
  promise: {
    win: [596, 446, 1079, 1330],
    card: [96, 552, 480, 768],
    move: [16.45, 17.30],
  },
  cta: {
    win: [598, 690, 1060, 1290],
    card: [156, 528, 700, 720],
    move: [17.10, 17.90],
  },
};

// ---------------------------------------------------------------- helpers
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (t, a, b) => ease(clamp((t - a) / Math.max(1e-6, b - a)));

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Headline with one accented (royal + oblique) word, wrapping by hand. */
function headline(ctx, words, x, y, size, lineH, maxW) {
  let cx = x;
  let cy = y;
  for (const word of words) {
    ctx.font = word.accent
      ? `italic bold ${size}px ${SANS}`
      : `bold ${size}px ${SANS}`;
    const w = ctx.measureText(word.text).width;
    if (cx + w > x + maxW && cx > x) {
      cx = x;
      cy += lineH;
    }
    ctx.fillStyle = word.accent ? ROYAL : NAVY;
    ctx.fillText(word.text, cx, cy);
    cx += w + ctx.measureText(" ").width;
  }
  return cy;
}

// ---------------------------------------------------------------- source frames
const frameCache = new Map();
function srcBytes(t) {
  const idx = clamp(Math.round(t * 30) + 1, 1, 744);
  if (!frameCache.has(idx)) {
    const p = path.join(FRAMES, `f_${String(idx).padStart(4, "0")}.png`);
    frameCache.set(idx, fs.existsSync(p) ? fs.readFileSync(p) : null);
  }
  return frameCache.get(idx);
}
function bufImage(buf) {
  const im = new Image();
  im.src = buf;
  return im;
}

// ---------------------------------------------------------------- assets
let HEAD = null;
let FIELD = null;
async function prepare() {
  const headPath = path.join(ROOT, "google_drive/noellyne-v5/assets/head.png");
  if (fs.existsSync(headPath)) HEAD = await loadImage(headPath);

  // cream field: flat paper with a warm corner and very light grain
  const g = createCanvas(W, H);
  const gc = g.getContext("2d");
  gc.fillStyle = CREAM;
  gc.fillRect(0, 0, W, H);
  const rg = gc.createRadialGradient(150, 40, 30, 150, 40, 1000);
  rg.addColorStop(0, "rgba(255,236,198,0.50)");
  rg.addColorStop(1, "rgba(255,236,198,0)");
  gc.fillStyle = rg;
  gc.fillRect(0, 0, W, 1200);
  const rg2 = gc.createRadialGradient(980, 1880, 40, 980, 1880, 700);
  rg2.addColorStop(0, "rgba(214,224,244,0.34)");
  rg2.addColorStop(1, "rgba(214,224,244,0)");
  gc.fillStyle = rg2;
  gc.fillRect(0, 1200, W, H - 1200);
  for (let i = 0; i < 4200; i++) {
    const a = 0.014 + Math.random() * 0.026;
    gc.fillStyle = Math.random() > 0.5 ? `rgba(120,96,64,${a})` : `rgba(255,255,255,${a * 1.5})`;
    gc.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  FIELD = g;
}

// ---------------------------------------------------------------- depth
/**
 * The reference reels never let the page end in flat cream: a soft desk plane
 * fills the bottom and carries the caption pill. Same trick here, drawn in the
 * page palette so it reads as paper and not as a photo.
 */
const SURFACE_Y = 1616;
function drawSurface(ctx) {
  const g = ctx.createLinearGradient(0, SURFACE_Y, 0, H);
  g.addColorStop(0, "rgba(226,205,175,0.26)");
  g.addColorStop(0.55, "rgba(214,190,158,0.42)");
  g.addColorStop(1, "rgba(199,174,142,0.56)");
  ctx.fillStyle = g;
  ctx.fillRect(0, SURFACE_Y, W, H - SURFACE_Y);
  ctx.strokeStyle = "rgba(150,124,92,0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, SURFACE_Y);
  ctx.lineTo(W, SURFACE_Y);
  ctx.stroke();
}

/** Soft violet bloom behind the media panel, so the panel has air around it. */
function drawGlow(ctx, card, el) {
  const [cx, cy, cw, ch] = card;
  const t = ramp(el, 0.0, 0.5);
  if (t <= 0.001) return;
  const mx = cx + cw / 2;
  const my = cy + ch / 2;
  const r = Math.max(cw, ch) * 0.92;
  const g = ctx.createRadialGradient(mx, my, r * 0.30, mx, my, r);
  g.addColorStop(0, `rgba(91,62,143,${0.14 * t})`);
  g.addColorStop(0.62, `rgba(91,62,143,${0.06 * t})`);
  g.addColorStop(1, "rgba(91,62,143,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(mx, my, r, r * 0.94, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------- chrome
function drawChrome(ctx, beat, el) {
  const pop = ramp(el, 0.0, 0.3);

  // logo mark: violet swoosh
  ctx.save();
  ctx.globalAlpha = pop;
  ctx.strokeStyle = VIOLET;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(88, 126);
  ctx.bezierCurveTo(94, 110, 112, 108, 112, 124);
  ctx.bezierCurveTo(112, 137, 94, 140, 92, 130);
  ctx.stroke();
  ctx.font = `bold 25px ${SANS}`;
  ctx.fillStyle = NAVY;
  ctx.fillText("ALTRAWARE", 128, 134);

  ctx.globalAlpha = pop * 0.7;
  ctx.font = `bold 21px ${SANS}`;
  ctx.textAlign = "right";
  ctx.fillText(beat.label, W - M, 134);
  ctx.textAlign = "left";
  ctx.restore();

  // rule with the little violet end-cap the references use
  ctx.save();
  ctx.globalAlpha = pop;
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(M, 168);
  ctx.lineTo(W - M, 168);
  ctx.stroke();
  ctx.fillStyle = VIOLET;
  ctx.fillRect(M, 162, 32, 12);

  const idx = BEATS.findIndex((b) => b.id === beat.id);
  for (let i = 0; i < BEATS.length; i++) {
    ctx.globalAlpha = i <= idx ? 0.85 : 0.2;
    ctx.fillStyle = i <= idx ? ROYAL : NAVY;
    ctx.fillRect(W - M - (BEATS.length - i) * 24, 182, 16, 4);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- media card
function drawCard(ctx, shot, el, dur, media) {
  const [cx, cy, cw, ch] = shot.card;
  const rise = ramp(el, 0.0, 0.42);
  const y = cy + (1 - rise) * 34;

  ctx.save();
  ctx.shadowColor = "rgba(58,42,22,0.17)";
  ctx.shadowBlur = 44;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = CARD;
  roundRect(ctx, cx, y, cw, ch, 26);
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, cx + 7, y + 7, cw - 14, ch - 14, 20);
  ctx.clip();
  ctx.fillStyle = "#2A1F3D";
  ctx.fillRect(cx, y, cw, ch);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (media) {
    // cover-fit the cropped window; a 4% push keeps the panel alive
    const ans = clamp(el / Math.max(0.001, dur));
    const push = 1 + 0.04 * ramp(ans, 0, 1);
    const iw = cw - 14;
    const ih = ch - 14;
    const scale = Math.max(iw / media.width, ih / media.height) * push;
    const dw = media.width * scale;
    const dh = media.height * scale;
    ctx.drawImage(media, cx + 7 + (iw - dw) / 2, y + 7 + (ih - dh) / 2, dw, dh);
  }

  // a 24px settle only; anything deeper bleaches her hoodie
  const fade = ctx.createLinearGradient(0, y + ch - 26, 0, y + ch - 7);
  fade.addColorStop(0, "rgba(253,247,235,0)");
  fade.addColorStop(1, "rgba(253,247,235,0.55)");
  ctx.fillStyle = fade;
  ctx.fillRect(cx, y + ch - 28, cw, 28);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(20,32,43,0.10)";
  ctx.lineWidth = 2;
  roundRect(ctx, cx + 1, y + 1, cw - 2, ch - 2, 26);
  ctx.stroke();
  ctx.restore();
  return y;
}

// ---------------------------------------------------------------- caption
// Anchored at a fixed y and allowed to overlap the bottom edge of the media
// panel. That overlap is what makes it read as one composed card instead of a
// stray pill, which is exactly how the reference reels use their lower thirds.
const CAP_Y = 1560;
function drawCaption(ctx, text, el) {
  const show = ramp(el, 0.12, 0.38);
  if (show <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = show;
  ctx.font = `bold 29px ${SANS}`;
  const tw = ctx.measureText(text).width;
  const bh = 60;
  const bw = Math.min(W - M * 2, tw + 56);
  const bx = (W - bw) / 2;
  const by = CAP_Y + (1 - show) * 12;
  ctx.fillStyle = NAVY;
  roundRect(ctx, bx, by, bw, bh, 9);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, by + bh / 2 + 1);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// ---------------------------------------------------------------- beats
function kicker(ctx, text, x, y, el, align = "left") {
  ctx.save();
  ctx.globalAlpha = ramp(el, 0.02, 0.28);
  ctx.font = `bold 31px ${SANS}`;
  ctx.fillStyle = ROYAL;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** hook — big line left, her phone clip as a tall side panel right. */
function drawHook(ctx, el) {
  kicker(ctx, "TECH, BILA KUCHANGANYA", M, 330, el);
  headline(ctx, [{ text: "Tech" }], M, 450, 96, 104, 470);
  headline(ctx, [{ text: "inakuchanganya?" }], M, 528, 46, 54, 470);
  ctx.save();
  ctx.globalAlpha = ramp(el, 0.24, 0.5);
  headline(ctx, [{ text: "Tuiweke", accent: true }], M, 640, 58, 66, 470);
  headline(ctx, [{ text: "rahisi." }], M, 704, 58, 66, 470);
  ctx.restore();
}

/** name — full width name, then the panel, then the affiliation under it. */
function drawName(ctx, el) {
  kicker(ctx, "MIMI NI", M, 330, el);
  ctx.save();
  ctx.globalAlpha = ramp(el, 0.05, 0.3);
  ctx.font = `bold 128px ${SANS}`;
  ctx.fillStyle = NAVY;
  ctx.fillText("Noellyne", M, 468);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(M + 6, 502);
  ctx.lineTo(M + 6 + 340, 502);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = ramp(el, 0.26, 0.52);
  ctx.font = `bold 48px ${SANS}`;
  ctx.fillStyle = NAVY;
  ctx.fillText("Tech host wa", M, 1390);
  ctx.font = `italic bold 58px ${SANS}`;
  ctx.fillStyle = ROYAL;
  ctx.fillText("Altraware.", M, 1456);
  ctx.restore();
}

/** promise — the three promises sit beside the panel, not under it. */
function drawPromise(ctx, el) {
  kicker(ctx, "HAPA UTAPATA", M, 330, el);
  ctx.save();
  ctx.globalAlpha = ramp(el, 0.06, 0.32);
  ctx.font = `bold 82px ${SANS}`;
  ctx.fillStyle = NAVY;
  ctx.fillText("Bila hype.", M, 448);
  ctx.restore();

  const items = ["AI bila hype", "App demos fupi", "Tips za kujaribu"];
  items.forEach((it, i) => {
    const t = ramp(el, 0.3 + i * 0.14, 0.58 + i * 0.14);
    if (t <= 0.001) return;
    const y = 596 + i * 180;
    const x = 612 + (1 - t) * 26;
    ctx.save();
    ctx.globalAlpha = t;
    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, x, y, 372, 148, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(20,32,43,0.10)";
    ctx.lineWidth = 2;
    roundRect(ctx, x + 1, y + 1, 370, 146, 18);
    ctx.stroke();
    ctx.fillStyle = ROYAL;
    ctx.beginPath();
    ctx.arc(x + 42, y + 42, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 34, y + 42);
    ctx.lineTo(x + 40, y + 49);
    ctx.lineTo(x + 51, y + 34);
    ctx.stroke();
    ctx.fillStyle = NAVY;
    ctx.font = `bold 32px ${SANS}`;
    const lines = wrap(ctx, it, 306);
    ctx.textBaseline = "middle";
    lines.slice(0, 2).forEach((ln, k) => {
      ctx.fillText(ln, x + 22, y + 92 + (k - (lines.length - 1) / 2) * 34);
    });
    ctx.restore();
  });
  ctx.textBaseline = "alphabetic";
}

/** cta — her point pose, with the button and the closing line beneath it. */
function drawCta(ctx, el) {
  kicker(ctx, "TUKUTANE HAPA", W / 2, 330, el, "center");

  const t = ramp(el, 0.44, 0.72);
  ctx.save();
  ctx.globalAlpha = t;
  ctx.translate(0, (1 - t) * 16);
  const bx = 300;
  const by = 1330;
  ctx.fillStyle = ROYAL;
  roundRect(ctx, bx, by, W - bx * 2, 96, 48);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `bold 38px ${SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("FOLLOW", W / 2, by + 50);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = ramp(el, 0.06, 0.32);
  ctx.font = `italic bold 48px ${SANS}`;
  ctx.fillStyle = NAVY;
  ctx.fillText("Tujaribu pamoja.", M, 474);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

const COPY = {
  hook: { label: "01 / UTANGULIZI" },
  name: { label: "02 / NANI" },
  promise: { label: "03 / UTAPATA" },
  cta: { label: "04 / TUKUTANE" },
};
const CAPTION = {
  hook: "Tuiweke rahisi — tuanzie hapa.",
  name: "Tech host wa Altraware.",
  promise: "Mambo matatu, kila wiki.",
  cta: "Follow — tujaribu pamoja.",
};

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
  drawSurface(ctx);
  drawChrome(ctx, { ...beat, label: COPY[beat.id].label }, el);
  drawGlow(ctx, shot.card, el);

  // media panel: crop the source window FIRST, so nothing outside `win`
  // (baked header, the TECH PULSE TZ line, the source's own cards) can appear.
  let media = null;
  const [x0, y0, x1, y1] = shot.win;
  const bytes = srcBytes(lerp(shot.move[0], shot.move[1], clamp(el / dur)));
  if (bytes) {
    const img = bufImage(bytes);
    const crop = createCanvas(x1 - x0, y1 - y0);
    crop.getContext("2d").drawImage(img, -x0, -y0);
    media = crop;
  }

  // the panel always sits on the page; the type sets around it
  if (beat.id === "hook") drawHook(ctx, el);
  if (beat.id === "name") drawName(ctx, el);
  if (beat.id === "promise") drawPromise(ctx, el);
  drawCard(ctx, shot, el, dur, media);
  if (beat.id === "cta") drawCta(ctx, el);

  drawCaption(ctx, CAPTION[beat.id], el);

  ctx.save();
  ctx.globalAlpha = 0.32 * ramp(el, 0.1, 0.4);
  ctx.font = `bold 19px ${SANS}`;
  ctx.fillStyle = NAVY;
  ctx.textAlign = "right";
  ctx.fillText("noellyne · altraware", W - M, 1878);
  ctx.restore();
}

// ---------------------------------------------------------------- main
async function main() {
  const args = process.argv.slice(2);
  const limit = Number((args.find((a) => a.startsWith("--proof=")) || "").split("=")[1] || Infinity);
  const audio = (args.find((a) => a.startsWith("--audio=")) || "").split("=")[1];
  const outFile = args.find((a) => a.endsWith(".mp4"));
  if (!outFile) throw new Error("pass an output .mp4 path");

  await prepare();
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
    if (!proc.stdin.write(canvas.data()))
      await new Promise((r) => proc.stdin.once("drain", r));
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
