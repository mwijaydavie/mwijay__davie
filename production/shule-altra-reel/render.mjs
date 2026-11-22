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

const SCENES = {
  hook: {
    bg: ["#fff9ed", "#f1e5d1"], photo: 0.62,
    draw(c, f, a) {
      c.save(); c.globalAlpha = 0.055; c.fillStyle = BLUE;
      c.font = `700 760px '${FONTS.serif}'`; c.fillText("?", 700, 1180); c.restore();
    },
  },
  intro: {
    bg: ["#fffdf6", "#e6ecf6"], photo: 0.30,
    draw(c, f, a) {
      const t = smooth(a[0] + 8, a[0] + 46, f);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      // the real app title, on the real page, with the maker mark
      // brand block, high enough to clear the caption band at y=1616
      rect(c, 96, 1120, 6, 210, 3, BLUE);
      c.drawImage(IMG.brand, 128, 1122, 92, 92);
      type(c, "Shule Altra", 240, 1184, 44, { weight: 760, color: INK });
      type(c, "timetable · attendance", 240, 1224, 24,
           { family: FONTS.mono, weight: 500, color: GRAY, width: 400 });
      type(c, "academics · finance", 240, 1256, 24,
           { family: FONTS.mono, weight: 500, color: GRAY, width: 400 });
      shot(c, IMG.selectors, 96, 1310, 440);
      c.restore();
    },
  },
  timetable: {
    bg: ["#f8fbff", "#dbe9f7"], photo: 0.18,
    draw(c, f, a) {
      // the actual Form / Stream selectors, settling in
      const t = smooth(a[0] + 10, a[0] + 38, f);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      c.translate(0, (1 - t) * 16);
      shot(c, IMG.selectors, 96, 1130, 470);
      type(c, "Form 2 · Stream A", 96, 1352, 36, { weight: 700, color: BLUE });
      c.restore();
    },
  },
  lesson: {
    bg: ["#fffbf1", "#e9e4f8"], photo: 0.24,
    draw(c, f, a) {
      // the real Monday 08:00 row, then the subject cells
      const t = smooth(a[0] + 8, a[0] + 30, f);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      shot(c, IMG.monday, 90, 1110, 460);
      const t2 = smooth(a[0] + 40, a[0] + 56, f);
      if (t2 > 0.001) {
        c.globalAlpha = t * t2;
        shot(c, IMG.time, 90, 1240, 200, 10);
        shot(c, IMG.subject, 310, 1240, 240, 10);
      }
      c.restore();
    },
  },
  modules: {
    bg: ["#f8fbff", "#dbedf7"], photo: 0.16,
    draw(c, f, a) {
      // three real module rows, staggered
      const items = [[IMG.attendance, "Attendance"], [IMG.academics, "Academics"], [IMG.finance, "Finance"]];
      items.forEach(([img, label], i) => {
        const t = smooth(a[0] + i * 24, a[0] + i * 24 + 30, f);
        if (t <= 0.001) return;
        c.save(); c.globalAlpha = t;
        c.translate(0, (1 - t) * 26);
        shot(c, img, 90, 1120 + i * 176, 380);
        type(c, label, 496, 1172 + i * 176, 34, { weight: 700, color: INK });
        line(c, [[496, 1190 + i * 176], [496 + 80 * t, 1190 + i * 176]],
             ["#1f5ba6", "#6444bf", "#2f7a5a"][i], 4);
        c.restore();
      });
    },
  },
  pdf: {
    bg: ["#fffdf6", "#eae5f6"], photo: 0.14,
    draw(c, f, a) {
      // the real printed page rising into frame
      const t = smooth(a[0] + 12, a[0] + 52, f);
      if (t <= 0.001) return;
      const w = 520, h = (IMG.pdfWeek.height / IMG.pdfWeek.width) * w;
      const x = 90, y = 1120 + (1 - t) * 80;
      c.save(); c.globalAlpha = t;
      rect(c, x - 8, y + 16, w + 16, h + 8, 14, "rgba(19,38,64,0.18)");
      rect(c, x, y, w, h, 8, "#fff");
      c.save(); rr(c, x + 2, y + 2, w - 4, h - 4, 7); c.clip();
      c.drawImage(IMG.pdfWeek, x + 2, y + 2, w - 4, h - 4); c.restore();
      edge(c, x, y, w, h, 8, "rgba(19,38,64,0.20)", 2);
      c.restore();
    },
  },
  offer: {
    bg: ["#fff9ee", "#e6e9f8"], photo: 0.40,
    draw(c, f, a) {
      const t = smooth(a[0] + 10, a[0] + 34, f);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      shot(c, IMG.download, 96, 1150, 440);
      [["Design", BLUE], ["Build", VIOLET], ["Security", "#2f7a5a"]].forEach(([label, col], i) => {
        const t2 = smooth(a[0] + 30 + i * 14, a[0] + 30 + i * 14 + 24, f);
        if (t2 <= 0.001) return;
        const x = 96 + i * 172, y = 1330 + (1 - t2) * 16;
        c.save(); c.globalAlpha = t * t2;
        rect(c, x, y, 158, 78, 39, col + "18");
        edge(c, x, y, 158, 78, 39, col + "55", 2);
        type(c, label, x + 22, y + 50, 26, { weight: 700, color: col });
        c.restore();
      });
      c.restore();
    },
  },
  cta: {
    bg: ["#f9faff", "#d4e3fd"], photo: 0.34,
    draw(c, f, a) {
      const t = smooth(a[0], a[0] + 34, f);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      const x = 96, y = 1180, w = 600, h = 112;
      rect(c, x, y, Math.max(8, w * t), h, 56, GOLD);
      type(c, "Comment SHULE", x + 42, y + 72, 44, { weight: 750, color: "#3a2c07", width: 520 });
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
const PROOF = ".cache/kit/Inputs/proof";
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
const PLATE = await loadImage(".cache/kit/Inputs/empty-classroom.jpg");
const HOST = await loadHost();
const plateCache = new Map();
for (const [id, s] of Object.entries(SCENES)) {
  plateCache.set(id, makeScene(W, H, PLATE, { photoAlpha: s.photo, tint: s.bg[0], tint2: s.bg[1] }));
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
  ctx.drawImage(plateCache.get(span.id), 0, 0);
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
    hook:      { x: 54,  y: 560, w: 900 },
    intro:     { x: 560, y: 860, w: 640 },
    timetable: { x: 580, y: 780, w: 600 },
    lesson:    { x: 560, y: 800, w: 620 },
    modules:   { x: 590, y: 900, w: 620 },
    pdf:       { x: 585, y: 800, w: 600 },
    offer:     { x: 54,  y: 600, w: 900 },
    cta:       { x: 560, y: 900, w: 620 },
  }[span.id];
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
    hook: { lines: take.sw, size: 92, y: 300, accent: null },
    intro: { lines: take.sw, size: 72, y: 300, accent: BLUE },
    timetable: { lines: take.sw, size: 70, y: 300, accent: BLUE },
    lesson: { lines: take.sw, size: 66, y: 300, accent: VIOLET },
    modules: { lines: take.sw, size: 70, y: 300, accent: BLUE },
    pdf: { lines: take.sw, size: 68, y: 300, accent: VIOLET },
    offer: { lines: take.sw, size: 72, y: 300, accent: VIOLET },
    cta: { lines: take.sw, size: 86, y: 300, accent: BLUE },
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
