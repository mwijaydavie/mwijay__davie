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
const SCENES = {
  hook: {
    bg: ["#fff9ed", "#f1e5d1"], photo: 0.62,
    draw(c, f, a) {
      // a big soft question mark as a watermark, not an icon strip
      c.save(); c.globalAlpha = 0.06; c.fillStyle = BLUE;
      c.font = `700 760px '${FONTS.serif}'`; c.fillText("?", 700, 1180); c.restore();
    },
  },
  intro: {
    bg: ["#fffdf6", "#e6ecf6"], photo: 0.30,
    draw(c, f, a) {
      // window frame composition: three tall panes, a quiet architectural cue
      for (let i = 0; i < 3; i++) {
        const x = 96 + i * 300;
        rect(c, x, 300, 250, 900, 6, "rgba(255,255,255,0.42)");
        edge(c, x, 300, 250, 900, 6, "rgba(31,91,166,0.16)", 2);
      }
    },
  },
  timetable: {
    bg: ["#f8fbff", "#dbe9f7"], photo: 0.18,
    draw(c, f, a) {
      // a real timetable grid, built in the scene, columns filling in
      const gx = 96, gy = 980, cw = 218, ch = 78;
      const fill = (r, col) => smooth(a[0] + r * 0.30, a[0] + r * 0.30 + 26, f);
      for (let r = 0; r < 4; r++) {
        for (let col = 0; col < 4; col++) {
          const t = fill(r, col);
          if (t <= 0.001) continue;
          rect(c, gx + col * cw, gy + r * ch, cw - 10, ch - 10, 6, `rgba(31,91,166,${0.06 + 0.5 * t})`);
        }
      }
      for (let i = 0; i <= 4; i++) {
        line(c, [[gx + i * cw, gy - 6], [gx + i * cw, gy + 4 * ch - 4]], "rgba(31,91,166,0.20)", 1.6);
        line(c, [[gx - 6, gy + i * ch], [gx + 4 * cw - 4, gy + i * ch]], "rgba(31,91,166,0.20)", 1.6);
      }
    },
  },
  lesson: {
    bg: ["#fffbf1", "#e9e4f8"], photo: 0.24,
    draw(c, f, a) {
      // a chalk-line path from Monday to Biology, drawn by the point gesture
      const p = [[120, 900], [420, 830], [700, 900], [900, 1010]];
      const q = easeOut(a[0] + 30, a[0] + 130, f);
      if (q > 0.002) {
        const pts = [];
        for (let i = 0; i <= 40; i++) {
          const u = (i / 40) * q;
          const seg = Math.min(2, Math.floor(u * 3));
          const lu = u * 3 - seg;
          pts.push([lerp(p[seg][0], p[seg + 1][0], lu), lerp(p[seg][1], p[seg + 1][1], lu)]);
        }
        line(c, pts, GOLD, 16);
        line(c, pts, "#8a6b23", 5);
      }
    },
  },
  modules: {
    bg: ["#f8fbff", "#dbedf7"], photo: 0.16,
    draw(c, f, a) {
      // three module cards, staggered in, each with its own micro-diagram
      const items = [
        ["Attendance", "276", BLUE],
        ["Academics", "A–C", VIOLET],
        ["Finance", "TSh", "#2f7a5a"],
      ];
      items.forEach(([label, value, col], i) => {
        const t = smooth(a[0] + i * 22, a[0] + i * 22 + 30, f);
        if (t <= 0.001) return;
        const y = 960 + i * 190 + (1 - t) * 34;
        c.save(); c.globalAlpha = t;
        paper(c, 90, y, 900, 160, 22);
        rect(c, 122, y + 44, 8, 72, 4, col);
        type(c, label, 152, y + 82, 44, { weight: 720, color: INK });
        type(c, value, 152, y + 132, 34, { family: FONTS.mono, weight: 500, color: GRAY });
        dot(c, 930, y + 80, 26, col + "22");
        dot(c, 930, y + 80, 12, col);
        c.restore();
      });
    },
  },
  pdf: {
    bg: ["#fffdf6", "#eae5f6"], photo: 0.14,
    draw(c, f, a) {
      // a page that turns up and gets a print control
      const t = smooth(a[0] + 18, a[0] + 78, f);
      if (t <= 0.001) return;
      const w = 700, h = 960;
      const x = 190, y = 760 + (1 - t) * 90;
      c.save(); c.globalAlpha = t;
      paper(c, x, y, w, h, 10);
      rect(c, x + 60, y + 70, 300, 26, 6, "rgba(19,38,64,0.75)");
      for (let i = 0; i < 7; i++) line(c, [[x + 60, y + 150 + i * 92], [x + w - 60, y + 150 + i * 92]], "rgba(19,38,64,0.14)", 2);
      rect(c, x + w - 190, y + h - 90, 130, 54, 12, VIOLET);
      type(c, "PRINT", x + w - 178, y + h - 52, 26, { family: FONTS.mono, weight: 700, color: "#fff" });
      c.restore();
    },
  },
  offer: {
    bg: ["#fff9ee", "#e6e9f8"], photo: 0.40,
    draw(c, f, a) {
      // two soft price/scope pills, so the offer reads on screen
      const pills = [["Design", BLUE], ["Build", VIOLET], ["Security", "#2f7a5a"]];
      pills.forEach(([label, col], i) => {
        const t = smooth(a[0] + i * 16, a[0] + i * 16 + 28, f);
        if (t <= 0.001) return;
        const x = 96 + i * 300, y = 1010 + (1 - t) * 20;
        c.save(); c.globalAlpha = t;
        rect(c, x, y, 270, 92, 46, col + "18");
        edge(c, x, y, 270, 92, 46, col + "55", 2);
        type(c, label, x + 34, y + 60, 34, { weight: 700, color: col });
        c.restore();
      });
    },
  },
  cta: {
    bg: ["#f9faff", "#d4e3fd"], photo: 0.34,
    draw(c, f, a) {
      const t = smooth(a[0], a[0] + 40, f);
      if (t <= 0.001) return;
      c.save(); c.globalAlpha = t;
      const x = 96, y = 1024, w = 560, h = 108;
      rect(c, x, y, w * t, h, 54, GOLD);
      type(c, "SHULE", x + 40, y + 70, 46, { family: FONTS.mono, weight: 700, color: "#3a2c07" });
      c.restore();
    },
  },
};

// ---------------------------------------------------------------- the page
const PLATE = await (async () => {
  await loadFonts();
  return loadImage(".cache/kit/Inputs/empty-classroom.jpg");
})();
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
  const HOST_POS = {
    hook:      { x: 54,  y: 560, w: 900 },
    intro:     { x: 54,  y: 560, w: 900 },
    timetable: { x: 330, y: 700, w: 780 },
    lesson:    { x: 300, y: 660, w: 800 },
    modules:   { x: 380, y: 730, w: 760 },
    pdf:       { x: 300, y: 700, w: 800 },
    offer:     { x: 54,  y: 600, w: 900 },
    cta:       { x: 330, y: 700, w: 780 },
  }[span.id];
  draw(f, "review", {
    pose: take.pose,
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
