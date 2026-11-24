/**
 * Shule Altra Reel — Noellyne as the host, drawn with the real rig.
 *
 * What this is not: it is not a rectangle of old footage on a page. V1-V8 of
 * the IG intro did that and the owner rejected it eight times, correctly.
 *
 * What it is: the approved Noellyne rig animated frame by frame. Her arm is a
 * separate layer rotating about the aligned cuff, so the wave and the point are
 * real gestures and not a fade between stills. Mouth shapes follow the actual
 * voice, the lids blink, and the camera moves. Each beat has its own set.
 *
 * Audio comes first: production/shule-altra-reel/out/timeline.json is produced
 * by mix.py from the eight real takes, and the picture is built against it.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, makeScene, FONTS } from "../noellyne-host/host.mjs";
import { makeSet, groundShadow } from "../noellyne-host/background.mjs";

const ROOT = process.cwd();
const HERE = path.join(ROOT, "production/shule-altra-reel");
const OUT = path.join(HERE, "out");
const FF = process.env.FFMPEG;
const W = 1080, H = 1920, FPS = 60;

const INK = "#132640", PALE = "#edf5fe", PAPER = "#fffdf7", BLUE = "#1f5ba6";
const VIOLET = "#6444bf", DEEP = "#143d76", GRAY = "#49647f", GOLD = "#f2c66d";

const tl = JSON.parse(fs.readFileSync(path.join(OUT, "timeline.json"), "utf8"));
/** Per-frame viseme track analysed from the dry mix by lipsync.py. */
const MOUTH = JSON.parse(fs.readFileSync(path.join(OUT, "mouth.json"), "utf8"));
const COPY = JSON.parse(fs.readFileSync(path.join(HERE, "copy.json"), "utf8"));
const spanOf = (id) => tl.spans.find((s) => s.id === id);
const takeOf = (id) => COPY.takes.find((t) => t.id === id);

// ---------------------------------------------------------------- helpers
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, f) => { const q = clamp((f - a) / (b - a)); return q * q * (3 - 2 * q); };
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = (a, b, f) => 1 - Math.pow(1 - clamp((f - a) / (b - a)), 3);

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function rect(c, x, y, w, h, r, color) { rr(c, x, y, w, h, r); c.fillStyle = color; c.fill(); }
function edge(c, x, y, w, h, r, color, n = 2) { rr(c, x, y, w, h, r); c.strokeStyle = color; c.lineWidth = n; c.stroke(); }
function line(c, pts, color, px = 3) {
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.lineWidth = px; c.strokeStyle = color; c.lineJoin = "round"; c.lineCap = "round"; c.stroke();
}
function dot(c, x, y, r, color) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = color; c.fill(); }
function paper(c, x, y, w, h, r = 24, color = PAPER) {
  rect(c, x - 6, y + 14, w + 12, h, r + 5, "#1f477620");
  rect(c, x, y, w, h, r, color);
  edge(c, x, y, w, h, r, "#c3d2e2", 2);
}
/** Type that is checked against the phone-safe box, like the original gfx.type. */
function type(c, s, x, y, size, { family = FONTS.sans, color = INK, width = 860, weight = 747, align = "left", italic = false } = {}) {
  const font = (px) => { c.font = `${italic ? "italic " : ""}${weight} ${px}px '${family}'`; };
  font(size);
  let w = c.measureText(s).width;
  if (w > width) { font(Math.floor((size * width) / w)); w = c.measureText(s).width; }
  c.textAlign = align; c.textBaseline = "alphabetic";
  c.fillStyle = color;
  c.fillText(s, x, y);
  return w;
}
function wrapType(c, lines, x, y, size, lh, opts = {}) {
  lines.forEach((ln, i) => type(c, ln, x, y + i * lh, size, opts));
}

/**
 * SCENES: every beat gets a different set, so this never reads as one card
 * repeated. `art` is drawn behind her; `fg` in front.
 */
/**
 * SCENES: every beat gets a different set, built on the REAL app screenshots.
 *
 * `shot(img, x, y, w)` draws a proof crop at a given width, keeping its aspect.
 * A soft paper card behind it keeps the crop from floating; the shadow is one
 * layer, not a blur stack.
 */
function shot(c, img, x, y, w, r = 14) {
  const h = (img.height / img.width) * w;
  rect(c, x - 4, y + 10, w + 8, h + 4, r + 4, "rgba(31,71,118,0.12)");
  rect(c, x, y, w, h, r, "#ffffff");
  c.save();
  rr(c, x + 2, y + 2, w - 4, h - 4, r - 2);
  c.clip();
  c.drawImage(img, x + 2, y + 2, w - 4, h - 4);
  c.restore();
  edge(c, x, y, w, h, r, "rgba(19,38,64,0.16)", 2);
  return h;
}

/**
 * The band. Every artifact — every screenshot, every chip — lives between
 * y = 470 and y = 900. She starts at 960. That is the whole layout rule, and
 * it is the one the owner asked for on Ship: no dead area between the artifact
 * and the character, and nothing ever runs behind her body.
 */
const BAND = { x: 84, w: 912, top: 470, bot: 900 };

/**
 * A daylight product card: one white sheet, one soft shadow, one hairline and
 * a small mono label. Same card language as the tech Reel, only lit for a
 * classroom.
 */
function pane(c, x, y, w, h, label, accent = BLUE) {
  rect(c, x + 4, y + 14, w - 8, h, 26, "rgba(31,71,118,0.10)");
  rect(c, x, y, w, h, 24, "rgba(255,255,255,0.94)");
  edge(c, x, y, w, h, 24, "rgba(31,91,166,0.16)", 2);
  if (label) {
    rect(c, x + 26, y + 20, 6, 28, 3, accent);
    type(c, label, x + 44, y + 44, 22, { family: FONTS.mono, weight: 600, color: GRAY, width: w - 88 });
  }
  return { x, y, w, h, top: y + (label ? 64 : 26) };
}

function chip(c, x, y, w, h, label, col, k = 1) {
  rect(c, x, y, w * k, h, h / 2, col + "18");
  edge(c, x, y, w * k, h, h / 2, col + "55", 2);
  if (k > 0.85) type(c, label, x + 24, y + h / 2 + 10, 25, { weight: 700, color: col, width: w - 30 });
}

/**
 * Crop-then-place. `shot()` draws a whole proof image; the week grid is 1915 px
 * wide, and at card width it would be a 410 px slab. This pastes only the slice
 * that answers the beat — header plus the first periods — at its true aspect.
 */
function slice(c, img, sx, sy, sw, sh, x, y, w, r = 12) {
  const h = (sh / sw) * w;
  rect(c, x - 4, y + 8, w + 8, h + 4, r + 4, "rgba(31,71,118,0.12)");
  rect(c, x, y, w, h, r, "#ffffff");
  c.save();
  rr(c, x + 2, y + 2, w - 4, h - 4, r - 2);
  c.clip();
  c.drawImage(img, sx, sy, sw, sh, x + 2, y + 2, w - 4, h - 4);
  c.restore();
  edge(c, x, y, w, h, r, "rgba(19,38,64,0.16)", 2);
  return h;
}

/** A small stack of mono lines, the "why this matters" note beside a screenshot. */
function monoBlock(c, lines, x, y, { size = 26, lh = 40, color = GRAY } = {}) {
  lines.forEach((ln, i) => type(c, ln, x, y + i * lh, size, { family: FONTS.mono, weight: 500, color }));
}
function monoLine(c, s, x, y, size = 24, color = GRAY) {
  type(c, s, x, y, size, { family: FONTS.mono, weight: 500, color });
}

/**
 * Every beat fills the same card: one white sheet at y 470 → 894, she starts at
 * 960. Nothing floats in the margin, nothing runs behind her. Inside the card
 * the rule is the same on every beat — a real screenshot on the left, the
 * sentence that names it on the right — so the eye always lands in the same
 * place and the beat reads before it is spoken.
 */
const SCENES = {
  hook: {
    bg: ["#fff9ed", "#f1e5d1"], photo: 0.62,
    draw(c, f, a) {
      const t = smooth(6, 34, a[0]);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t; c.translate(0, (1 - t) * 22);
      const p = pane(c, BAND.x, 452, BAND.w, 448, "shule altra — one app for the school day");
      c.drawImage(IMG.brand, p.x + 40, p.top + 14, 92, 92);
      type(c, "Shule Altra", p.x + 156, p.top + 74, 56, { weight: 780, color: INK });
      monoLine(c, "timetable · attendance · academics · finance", p.x + 158, p.top + 112, 22);
      line(c, [[p.x + 40, p.top + 136], [p.x + p.w - 40, p.top + 136]], "rgba(31,91,166,0.18)", 2);
      [["Period 1", "08:00", BLUE], ["Form 2", "Stream A", VIOLET], ["Term 1", "week 32", "#2f7a5a"]]
        .forEach(([big, small, col], i) => {
          const k = smooth(16 + i * 10, 34 + i * 10, a[0]);
          const x = p.x + 40 + i * 272, y = p.top + 160;
          rect(c, x, y, 254, 88, 18, col + "12");
          edge(c, x, y, 254, 88, 18, col + "44", 2);
          c.save(); c.globalAlpha = t * k;
          type(c, big, x + 22, y + 40, 29, { weight: 740, color: col, width: 216 });
          monoLine(c, small, x + 22, y + 72, 21);
          c.restore();
        });
      shot(c, IMG.selectors, p.x + 40, p.top + 268, 330);
      monoBlock(c, ["monday 08:00 — biology", "form 2A · room 4 · period 1"], p.x + 456, p.top + 284,
                { size: 23, lh: 38 });
      c.restore();
    },
  },

  intro: {
    bg: ["#fffdf6", "#e6ecf6"], photo: 0.30,
    draw(c, f, a) {
      const t = smooth(8, 40, a[0]);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      const p = pane(c, BAND.x, 452, BAND.w, 448, "the real app — first screen");
      shot(c, IMG.selectors, p.x + 40, p.top + 10, 540);
      type(c, "Form 2 · Stream A", p.x + 44, p.top + 208, 36, { weight: 720, color: BLUE });
      [["timetable", BLUE], ["attendance", VIOLET], ["academics", "#2f7a5a"], ["finance", "#b4622a"]]
        .forEach(([lab, col], i) => {
          chip(c, p.x + 40 + i * 196, p.top + 268, 180, 56, lab, col, smooth(24 + i * 8, 42 + i * 8, a[0]));
        });
      monoBlock(c, ["one timetable", "every stream", "no whiteboard copy"], p.x + 636, p.top + 18,
                { size: 23, lh: 38 });
      line(c, [[p.x + 636, p.top + 140], [p.x + p.w - 40, p.top + 140]], "rgba(31,91,166,0.18)", 2);
      monoBlock(c, ["same data in", "the printed PDF"], p.x + 636, p.top + 182, { size: 23, lh: 38 });
      c.restore();
    },
  },

  timetable: {
    bg: ["#f8fbff", "#dbe9f7"], photo: 0.18,
    draw(c, f, a) {
      const t = smooth(6, 30, a[0]);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t; c.translate(0, (1 - t) * 18);
      const p = pane(c, BAND.x, 452, BAND.w, 448, "timetable — chagua form na stream");
      // the control: the real Class / Stream selectors, at a size you can read
      shot(c, IMG.selectors, p.x + 40, p.top + 4, 520);
      type(c, "Form 2 · Stream A", p.x + 604, p.top + 52, 34, { weight: 730, color: BLUE, width: 300 });
      monoLine(c, "then the week fills in", p.x + 604, p.top + 92, 22);
      // the result: the real printed grid, sliced at the header and the first periods
      slice(c, IMG.pdfWeek, 0, 0, 1915, 400, p.x + 40, p.top + 150, 832);
      c.restore();
    },
  },

  lesson: {
    bg: ["#fffbf1", "#e9e4f8"], photo: 0.24,
    draw(c, f, a) {
      const t = smooth(6, 28, a[0]);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      const p = pane(c, BAND.x, 452, BAND.w, 448, "monday, 08:00 — the real row");
      shot(c, IMG.monday, p.x + 40, p.top + 10, 832);
      shot(c, IMG.time, p.x + 40, p.top + 156, 236);
      shot(c, IMG.subject, p.x + 300, p.top + 156, 420);
      monoBlock(c, ["Biology · Form 2A · Room 4", "period 1 of 9 — the same row prints in the PDF"],
                p.x + 40, p.top + 286, { size: 23, lh: 38, color: GRAY });
      c.restore();
    },
  },

  modules: {
    bg: ["#f8fbff", "#dbedf7"], photo: 0.16,
    draw(c, f, a) {
      const p = pane(c, BAND.x, 452, BAND.w, 448, "three rows, one system");
      [[IMG.attendance, "Attendance", BLUE], [IMG.academics, "Academics", VIOLET], [IMG.finance, "Finance", "#2f7a5a"]]
        .forEach(([img, label, col], i) => {
          const t = smooth(i * 22, i * 22 + 28, a[0]);
          if (t <= 0.001) return;
          c.save(); c.globalAlpha = t; c.translate(0, (1 - t) * 20);
          const y = p.top + 6 + i * 112;
          shot(c, img, p.x + 40, y, 540);
          type(c, label, p.x + 618, y + 46, 34, { weight: 720, color: INK });
          line(c, [[p.x + 618, y + 66], [p.x + 618 + 76 * t, y + 66]], col, 4);
          c.restore();
        });
    },
  },

  pdf: {
    bg: ["#fffdf6", "#eae5f6"], photo: 0.14,
    draw(c, f, a) {
      const t = smooth(8, 44, a[0]);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      const p = pane(c, BAND.x, 452, BAND.w, 448, "the printed page, before you print");
      const w = 430, h = (IMG.pdfWeek.height / IMG.pdfWeek.width) * w;
      const x = p.x + 40, y = p.top + 12 + (1 - t) * 40;
      rect(c, x - 8, y + 14, w + 16, h + 6, 14, "rgba(19,38,64,0.16)");
      rect(c, x, y, w, h, 8, "#fff");
      c.save(); rr(c, x + 2, y + 2, w - 4, h - 4, 7); c.clip();
      c.drawImage(IMG.pdfWeek, x + 2, y + 2, w - 4, h - 4); c.restore();
      edge(c, x, y, w, h, 8, "rgba(19,38,64,0.20)", 2);
      monoBlock(c, ["A4 · landscape", "one week per page", "week 32 · term 1"], p.x + 520, p.top + 40);
      chip(c, p.x + 520, p.top + 190, 300, 64, "sawa kabla ya kuprint", "#2f7a5a", smooth(40, 62, a[0]));
      c.restore();
    },
  },

  offer: {
    bg: ["#fff9ee", "#e6e9f8"], photo: 0.40,
    draw(c, f, a) {
      const t = smooth(8, 32, a[0]);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      const p = pane(c, BAND.x, 452, BAND.w, 448, "altraware — your school, your build");
      shot(c, IMG.download, p.x + 40, p.top + 10, 700);
      [["Design", BLUE], ["Build", VIOLET], ["Security", "#2f7a5a"]].forEach(([label, col], i) => {
        chip(c, p.x + 40 + i * 232, p.top + 156, 212, 66, label, col, smooth(26 + i * 12, 44 + i * 12, a[0]));
      });
      line(c, [[p.x + 40, p.top + 252], [p.x + p.w - 40, p.top + 252]], "rgba(31,91,166,0.18)", 2);
      monoBlock(c, ["tunajenga kwa shule yako —", "kutoka timetable hadi PDF."],
                p.x + 40, p.top + 288, { size: 25, lh: 42 });
      c.restore();
    },
  },

  cta: {
    bg: ["#f9faff", "#d4e3fd"], photo: 0.34,
    draw(c, f, a) {
      const t = smooth(0, 32, a[0]);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      rect(c, BAND.x, 470, Math.max(12, 760 * t), 140, 70, GOLD);
      type(c, "Comment SHULE", BAND.x + 48, 470 + 92, 54, { weight: 780, color: "#3a2c07", width: 640 });
      const p = pane(c, BAND.x, 640, BAND.w, 260, "then this comes to your DM");
      c.drawImage(IMG.brand, p.x + 40, p.top + 4, 72, 72);
      type(c, "Shule Altra — demo link", p.x + 132, p.top + 34, 32, { weight: 700, color: INK });
      monoLine(c, "no form · no email · no signup", p.x + 132, p.top + 74, 23);
      chip(c, p.x + 40, p.top + 104, 250, 58, "tuma SHULE", BLUE, smooth(22, 44, a[0]));
      c.restore();
    },
  },
};

// ---------------------------------------------------------------- the page
await loadFonts();

/**
 * The real product screenshots, from the kit's pinned capture (commit 27fef99).
 * These are the actual app: Form 2 / Stream A selectors, the week grid, the
 * Monday 08:00 Biology row, the Attendance/Academics/Finance rows and the printed
 * PDF. Drawing a cute grid instead of showing the product was the earlier
 * mistake — it proved nothing.
 */
const PROOF = path.join(ROOT, "production/shule-altra-reel/proof");
const IMG = {};
for (const [k, file] of Object.entries({
  selectors: "selectors.png", week: "week.png", monday: "monday.png",
  time: "time.png", subject: "subject.png", attendance: "attendance.png",
  academics: "academics.png", finance: "finance.png", download: "download.png",
  appTitle: "appTitle.png", pdfTitle: "pdfTitle.png", pdfWeek: "pdfWeek.png",
  pdfMonday: "pdfMonday.png", brand: "brand.png",
})) {
  IMG[k] = await loadImage(path.join(PROOF, file));
}
const PLATE = await loadImage(path.join(ROOT, "production/noellyne-host/poses-src/plate-classroom.jpg"));
const HOST = await loadHost();
/**
 * Each beat gets a living set instead of a static wash: the plate drifts, a light
 * band sweeps, dust rises. `photo` per scene controls how much of the classroom
 * shows through, so the eight beats read as eight places.
 */
const plateCache = new Map();
for (const [id, s] of Object.entries(SCENES)) {
  plateCache.set(id, makeSet(W, H, PLATE, {
    photoAlpha: s.photo,
    tint: s.bg[0],
    tint2: s.bg[1],
    parallax: s.parallax ?? 26,
    sweep: s.sweep ?? 0.55,
    dust: s.dust ?? 34,
    vig: s.vig ?? 0.22,
  }));
}

function drawFrame(ctx, f) {
  const span = tl.spans.find((s) => f >= s.start - 3 && f < s.end + 40) || tl.spans[tl.spans.length - 1];
  const take = takeOf(span.id);
  const scene = SCENES[span.id];
  const a = [f - span.start, f - span.end];

  // camera: a slow push on every scene, never a static frame
  const cam = 1 + 0.018 * clamp((f - span.start) / Math.max(1, span.end - span.start));
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam, cam);
  ctx.translate(-W / 2, -H / 2);
  plateCache.get(span.id)(ctx, f, span.start, span.end);
  scene.draw(ctx, f, a);
  ctx.restore();

  // The host. She is the constant across every scene, like the reference Reels.
  const draw = performerDraw(ctx, HOST, FPS);
  const cues = (take.gesture || []).map((g) => ({ kind: g.kind, start: span.start + Math.round(g.at * FPS), len: g.len }));
  const blinks = [
    span.start + 46, span.start + 46 + 110, span.start + 46 + 220,
  ].filter((x) => x > span.start + 8 && x < span.end + 20);
  /**
   * Her position is scene-dependent. Where the beat has to show UI (timetable,
   * modules, PDF, CTA) she moves right and down so the left column stays
   * readable; on the hook and the offer she is centred. This is the whole point
   * of the reference Reels: the host and the artifact take turns, they never
   * cover each other.
   */
  /**
   * She never shares a column with the artifact. Where a beat has real UI, she
   * stands in the right third at a smaller scale; the left two-thirds is the
   * screenshot. Overlapping them was the last visible defect.
   */
  const HOST_POS = {
    hook:      { x: 500, y: 862,  w: 600 },
    intro:     { x: 520, y: 900,  w: 585 },
    timetable: { x: 520, y: 906,  w: 590 },
    lesson:    { x: 512, y: 906,  w: 590 },
    modules:   { x: 540, y: 918,  w: 575 },
    pdf:       { x: 520, y: 906,  w: 590 },
    offer:     { x: 512, y: 902,  w: 592 },
    cta:       { x: 322, y: 900,  w: 625 },
  }[span.id];
  groundShadow(ctx, HOST_POS.x + HOST_POS.w * 0.5, HOST_POS.y + HOST_POS.w * 0.99,
               HOST_POS.w * 0.72, 0.20);
  draw(f, "review", {
    pose: take.pose,
    mouth: MOUTH,
    ...HOST_POS,
    cues,
    blinks,
    nods: [span.start + 20],
  });

  /**
   * The rig is a half-body: the PNG ends across the hoodie. Left raw that is a
   * hard horizontal cut through her, which is the same "pasted on" read the
   * owner rejected on the intro. A short gradient the exact colour of the page
   * dissolves her into the caption band instead, so she sits IN the set.
   */
  const fadeY = HOST_POS.y + HOST_POS.w * 0.98;
  const g = ctx.createLinearGradient(0, fadeY, 0, 1700);
  g.addColorStop(0, "rgba(255,253,247,0)");
  g.addColorStop(0.55, "rgba(255,253,247,0.72)");
  g.addColorStop(1, "rgba(255,253,247,0.97)");
  ctx.fillStyle = g;
  ctx.fillRect(0, fadeY, W, H - fadeY);

  // chrome: the real maker mark top left, the beat label top right
  ctx.save();
  ctx.drawImage(HOST.mark, 62, 62, 54, 54);
  type(ctx, "ALTRAWARE", 128, 100, 27, { weight: 750, color: INK });
  const label = `${String(tl.spans.indexOf(span) + 1).padStart(2, "0")} / ${span.id.toUpperCase()}`;
  type(ctx, label, 1002, 100, 24, { family: FONTS.mono, weight: 600, color: GRAY, align: "right" });
  line(ctx, [[96, 128], [984, 128]], "rgba(19,38,64,0.18)", 2);
  ctx.restore();

  // headline block, per scene, in the phone-safe box
  const head = {
    hook: { lines: take.sw, size: 84, y: 246, accent: null },
    intro: { lines: take.sw, size: 68, y: 262, accent: BLUE },
    timetable: { lines: take.sw, size: 66, y: 262, accent: BLUE },
    lesson: { lines: take.sw, size: 62, y: 274, accent: VIOLET },
    modules: { lines: take.sw, size: 64, y: 268, accent: BLUE },
    pdf: { lines: take.sw, size: 64, y: 268, accent: VIOLET },
    offer: { lines: take.sw, size: 66, y: 262, accent: VIOLET },
    cta: { lines: take.sw, size: 78, y: 250, accent: BLUE },
  }[span.id];
  const inT = smooth(span.start + 2, span.start + 26, f);
  if (inT > 0.001) {
    ctx.save();
    ctx.globalAlpha = inT;
    ctx.translate(0, (1 - inT) * 22);
    if (head.accent) rect(ctx, 96, head.y - 6, 6, head.lines.length * (head.size + 12) - 8, 3, head.accent);
    wrapType(ctx, head.lines, 126, head.y + head.size * 0.72, head.size, head.size + 12, { weight: 760, color: INK });
    ctx.restore();
  }

  // caption: one line, bottom, inside the safe box
  const capT = smooth(span.start + 6, span.start + 22, f) * (1 - smooth(span.end + 6, span.end + 26, f));
  if (capT > 0.001) {
    ctx.save();
    ctx.globalAlpha = capT;
    const text = take.sw.join(" ");
    ctx.font = `600 34px '${FONTS.sans}'`;
    const tw = ctx.measureText(text).width;
    const pad = 38, bw = Math.min(920, tw + pad * 2);
    rect(ctx, (W - bw) / 2, 1616, bw, 84, 20, "rgba(19,38,64,0.90)");
    type(ctx, text, W / 2, 1671, 34, { weight: 620, color: "#fff", align: "center", width: 860 });
    ctx.restore();
  }

  // progress hairline
  rect(ctx, 0, H - 7, W, 7, 0, "rgba(19,38,64,0.12)");
  rect(ctx, 0, H - 7, W * clamp(f / tl.frames), 7, 0, GOLD);
}

// ---------------------------------------------------------------- main
const frames = tl.frames;
const outFile = process.argv[2] || path.join(OUT, "shule-altra.mp4");
const audio = process.argv[3] || path.join(OUT, "mix.wav");
const proof = Number((process.argv.find((a) => a.startsWith("--proof=")) || "").split("=")[1] || frames);

if (!FF) throw new Error("FFMPEG env var required");
const cv = createCanvas(W, H);
const ctx = cv.getContext("2d");
const n = Math.min(frames, proof);

/**
 * Still QA: `--stills=hook:89,intro:332` writes full-resolution PNGs of those
 * frames and exits without touching the encoder. Downscaled contact sheets have
 * hidden three separate layout collisions on this project; every layout check
 * runs here first, then read at 100 %.
 */
const stillsArg = process.argv.find((a) => a.startsWith("--stills="));
if (stillsArg) {
  const dir = path.join(ROOT, ".cache/stills");
  fs.mkdirSync(dir, { recursive: true });
  for (const pair of stillsArg.split("=")[1].split(",")) {
    const [id, fr] = pair.split(":");
    drawFrame(ctx, Number(fr));
    fs.writeFileSync(path.join(dir, `${id}.png`), cv.toBuffer("image/png"));
  }
  process.stderr.write(`stills -> ${dir}\n`);
  process.exit(0);
}

const args = ["-y", "-hide_banner", "-loglevel", "error",
  "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-"];
if (fs.existsSync(audio)) args.push("-i", audio);
args.push("-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p");
if (fs.existsSync(audio)) args.push("-c:a", "aac", "-b:a", "192k", "-shortest");
args.push("-movflags", "+faststart", outFile);

const ff = spawn(FF, args, { stdio: ["pipe", "inherit", "inherit"] });
ff.stdin.on("error", (e) => process.stderr.write(`stdin: ${e.message}\n`));
for (let f = 0; f < n; f++) {
  drawFrame(ctx, f);
  // Buffer.from(typedarray) truncates silently in this build; wrap the memory.
  const d = ctx.getImageData(0, 0, W, H).data;
  const buf = Buffer.from(d.buffer, d.byteOffset, d.byteLength);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 120 === 0) process.stderr.write(`frame ${f}/${n}\n`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`)))));
process.stderr.write(`wrote ${outFile}\n`);
