/**
 * Ship vs Shipped — a tech Reel that is not the school Reel with new words.
 *
 * Deliberate differences from production/shule-altra-reel:
 *   · landscape-ish object framing instead of a portrait set: the beat's subject
 *     is a code pane, an access matrix, an empty list, a latency trace.
 *   · a dark editorial palette (slate + mint), not the eggshell school page.
 *   · she appears SMALL and to one side for most beats, and the artifact takes
 *     the centre — the opposite of the presenter-led school Reel.
 *   · every number on screen comes from facts.json, measured in this repo.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, FONTS } from "../noellyne-host/host.mjs";
import { makeSet, groundShadow } from "../noellyne-host/background.mjs";

const HERE = path.join(process.cwd(), "production/ship-vs-shipped");
const OUT = path.join(HERE, "out");
const FF = process.env.FFMPEG;
const W = 1080, H = 1920, FPS = 60;

const INK = "#0d1b2a", SLATE = "#16273d", MINT = "#5eead4", AMBER = "#fbbf24",
      PAPER = "#f8fafc", DIM = "#94a3b8", RED = "#f87171", GREEN = "#34d399";

const tl = JSON.parse(fs.readFileSync(path.join(OUT, "timeline.json"), "utf8"));
const MOUTH = JSON.parse(fs.readFileSync(path.join(OUT, "mouth.json"), "utf8"));
const COPY = JSON.parse(fs.readFileSync(path.join(HERE, "copy.json"), "utf8"));
const FACTS = JSON.parse(fs.readFileSync(path.join(HERE, "facts.json"), "utf8")).measured;
const takeOf = (id) => COPY.takes.find((t) => t.id === id);

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, f) => { const q = clamp((f - a) / (b - a)); return q * q * (3 - 2 * q); };
const easeOut = (a, b, f) => 1 - Math.pow(1 - clamp((f - a) / (b - a)), 3);

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function rect(c, x, y, w, h, r, col) { rr(c, x, y, w, h, r); c.fillStyle = col; c.fill(); }
function edge(c, x, y, w, h, r, col, n = 2) { rr(c, x, y, w, h, r); c.strokeStyle = col; c.lineWidth = n; c.stroke(); }
function type(c, s, x, y, size, o = {}) {
  const { family = FONTS.sans, color = INK, width = 860, weight = 700, align = "left" } = o;
  const set = (px) => { c.font = `${weight} ${px}px '${family}'`; };
  set(size);
  let w = c.measureText(s).width;
  if (w > width) { set(Math.floor(size * width / w)); w = c.measureText(s).width; }
  c.textAlign = align; c.textBaseline = "alphabetic"; c.fillStyle = color;
  c.fillText(s, x, y);
  return w;
}
function mono(c, s, x, y, size, o = {}) { return type(c, s, x, y, size, { family: FONTS.mono, ...o }); }

/** A dark code/Object pane. The centre of this Reel is code, not scenery. */
function pane(c, x, y, w, h, title, accent = MINT) {
  rect(c, x - 4, y + 12, w + 8, h + 6, 26, "rgba(0,0,0,0.45)");
  rect(c, x, y, w, h, 22, SLATE);
  edge(c, x, y, w, h, 22, "rgba(94,234,212,0.22)", 2);
  rect(c, x, y, w, 62, 22, "rgba(255,255,255,0.04)");
  rect(c, x, y + 40, w, 22, 0, SLATE);
  [RED, AMBER, GREEN].forEach((col, i) => {
    c.beginPath(); c.arc(x + 30 + i * 26, y + 31, 7, 0, Math.PI * 2);
    c.fillStyle = col; c.globalAlpha = 0.75; c.fill(); c.globalAlpha = 1;
  });
  mono(c, title, x + 110, y + 40, 22, { color: DIM, weight: 500 });
  return { x, y, w, h };
}

// one line of "code": token-coloured words, so it reads as code at phone size
function codeLine(c, x, y, parts, size = 27) {
  let cx = x;
  for (const [text, col] of parts) {
    c.font = `500 ${size}px '${FONTS.mono}'`;
    c.fillStyle = col; c.textBaseline = "alphabetic";
    c.fillText(text, cx, y);
    cx += c.measureText(text).width;
  }
  return cx;
}

const C = {
  kw: MINT, fn: "#c4b5fd", str: "#fcd34d", txt: "#e2e8f0", cm: "#64748b", num: "#fb923c",
};

const SCENES = {
  hook(c, f, a) {
    const t = smooth(a[0] + 6, a[0] + 34, f);
    if (t < 0.01) return;
    c.save(); c.globalAlpha = t; c.translate(0, (1 - t) * 20);
    const p = pane(c, 84, 620, 600, 250, "school.ts — works locally");
    codeLine(c, p.x + 30, p.y + 116, [["const ", C.kw], ["t", C.txt], [" = ", C.txt], ["build", C.fn], ["(", C.txt], ["F2", C.num], [")", C.txt]], 24);
    codeLine(c, p.x + 30, p.y + 158, [["test", C.fn], ["(", C.txt], ["'my machine'", C.str], [")", C.txt]], 24);
    codeLine(c, p.x + 30, p.y + 200, [["// Monday 8am?", C.cm]], 24);
    c.restore();
  },

  gap(c, f, a) {
    // two columns: it runs / it is used. the width between them is the point
    const t = smooth(a[0] + 8, a[0] + 46, f);
    if (t < 0.01) return;
    c.save(); c.globalAlpha = t;
    rect(c, 90, 620, 400, 290, 22, SLATE);
    edge(c, 90, 620, 400, 290, 22, "rgba(148,163,184,0.25)", 2);
    mono(c, "IT RUNS", 118, 700, 26, { color: GREEN, weight: 700 });
    codeLine(c, 118, 760, [["npm test", C.txt]], 26);
    mono(c, "12 passed", 118, 810, 26, { color: GREEN });
    mono(c, "0 users yet", 118, 866, 24, { color: C.cm });

    rect(c, 540, 620, 400, 290, 22, SLATE);
    edge(c, 540, 620, 400, 290, 22, "rgba(251,191,36,0.30)", 2);
    mono(c, "IT IS USED", 568, 670, 26, { color: AMBER, weight: 700 });
    [["Monday 08:00", "Biology", "Form 2A"], ["Attendance", "276 records", "one click"]]
      .forEach((row, i) => {
        mono(c, row[0], 568, 730 + i * 78, 22, { color: DIM });
        mono(c, row[1], 568, 758 + i * 78, 25, { color: PAPER, weight: 600 });
      });
    // the gap, drawn
    const g = easeOut(a[0] + 40, a[0] + 90, f);
    c.save();
    c.strokeStyle = MINT; c.lineWidth = 4; c.setLineDash([10, 12]);
    c.beginPath(); c.moveTo(505, 640); c.lineTo(505, 890); c.stroke();
    c.restore();
    mono(c, "the gap", 507, 920, 20, { color: MINT, align: "center" });
    c.restore();
  },

  auth(c, f, a) {
    // an access matrix: who can see what. the answer has to be visible, not told.
    const t = smooth(a[0] + 6, a[0] + 40, f);
    if (t < 0.01) return;
    const roles = ["Teacher", "Bursar", "Parent", "Owner"];
    const rows = ["Marks", "Fees", "Contacts"];
    const allowed = [[1, 0, 1, 1], [0, 1, 0, 1], [1, 0, 0, 1]];
    const x0 = 110, y0 = 780, cw = 200, ch = 96;
    c.save(); c.globalAlpha = t;
    roles.forEach((r, i) => mono(c, r, x0 + 30 + i * cw, y0 - 18, 20, { color: DIM }));
    rows.forEach((row, ri) => {
      mono(c, row, x0, y0 + 34 + ri * ch, 22, { color: PAPER, weight: 600 });
      roles.forEach((_, ci) => {
        const k = smooth(a[0] + 20 + (ri * 4 + ci) * 4, a[0] + 20 + (ri * 4 + ci) * 4 + 18, f);
        if (k < 0.01) return;
        const ok = allowed[ri][ci];
        const bx = x0 + 30 + ci * cw, by = y0 + 8 + ri * ch;
        c.save(); c.globalAlpha = t * k;
        rect(c, bx, by, 150, 62, 12, ok ? "rgba(52,211,153,0.16)" : "rgba(248,113,113,0.13)");
        edge(c, bx, by, 150, 62, 12, ok ? "rgba(52,211,153,0.55)" : "rgba(248,113,113,0.42)", 2);
        mono(c, ok ? "allow" : "deny", bx + 20, by + 40, 22, { color: ok ? GREEN : RED, weight: 600 });
        c.restore();
      });
    });
    c.restore();
  },

  empty(c, f, a) {
    // the empty state, then the empty state with an example in it
    const t = smooth(a[0] + 6, a[0] + 36, f);
    if (t < 0.01) return;
    const p = pane(c, 90, 780, 900, 300, "timetable — Form 2A, Term 1", AMBER);
    c.save(); c.globalAlpha = t;
    const rowsFilled = Math.floor(clamp((f - a[0] - 70) / 26, 0, 5));
    for (let i = 0; i < 5; i++) {
      const y = p.y + 100 + i * 40;
      const filled = i < rowsFilled;
      rect(c, p.x + 30, y, filled ? 760 : 300 + i * 60, 22, 6,
           filled ? "rgba(94,234,212,0.20)" : "rgba(148,163,184,0.13)");
      if (filled) mono(c, ["Mon 08:00 Biology", "Mon 09:20 Maths", "Tue 08:00 Kiswahili",
                           "Wed 10:40 Physics", "Thu 08:00 History"][i],
                      p.x + 44, y + 17, 16, { color: MINT, weight: 500 });
    }
    if (rowsFilled === 0) {
      mono(c, "no rows", p.x + 30, p.y + 200, 24, { color: C.cm });
      mono(c, "→ add a sample term", p.x + 30, p.y + 244, 24, { color: AMBER });
    }
    c.restore();
  },

  offline(c, f, a) {
    // a latency trace that drops to nothing, and the app still answering
    const t = smooth(a[0] + 6, a[0] + 34, f);
    if (t < 0.01) return;
    const p = pane(c, 90, 740, 900, 340, "request log — last 30 s", MINT);
    c.save(); c.globalAlpha = t;
    let px = p.x + 40, py = p.y + 190;
    c.beginPath(); c.moveTo(px, py);
    const n = 46;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const alive = u < 0.42;
      const yy = py + (alive ? Math.sin(u * 26) * 16 : 0);
      px = p.x + 40 + u * 800;
      c.lineTo(px, yy);
    }
    c.strokeStyle = MINT; c.lineWidth = 3; c.stroke();
    // the cut
    rect(c, p.x + 40 + 0.42 * 800, p.y + 110, 3, 170, 1, RED);
    mono(c, "offline", p.x + 40 + 0.42 * 800 + 10, p.y + 128, 18, { color: RED });
    mono(c, "queued 4 writes, still answering", p.x + 40, p.y + 250, 22, { color: PAPER });
    mono(c, "no spinner, no data loss", p.x + 40, p.y + 290, 22, { color: MINT });
    c.restore();
  },

  receipt(c, f, a) {
    // the measured numbers, in a table, counted up
    const t = smooth(a[0] + 4, a[0] + 30, f);
    if (t < 0.01) return;
    const rows = [
      ["renderers", FACTS.js_files, "files"],
      ["render code", FACTS.js_lines, "lines"],
      ["automated checks", FACTS.checks, "checks"],
      ["host poses", FACTS.poses, "poses"],
      ["mouth shapes", FACTS.mouth_shapes, "shapes"],
    ];
    c.save(); c.globalAlpha = t;
    rows.forEach(([label, value, unit], i) => {
      const k = smooth(a[0] + 10 + i * 12, a[0] + 10 + i * 12 + 22, f);
      if (k < 0.01) return;
      const y = 760 + i * 96;
      c.save(); c.globalAlpha = t * k;
      const shown = Math.round(value * easeOut(a[0] + 10 + i * 12, a[0] + 44 + i * 12, f));
      mono(c, String(shown), 100, y + 44, 54, { color: MINT, weight: 700, width: 260 });
      type(c, label, 380, y + 30, 30, { color: PAPER, weight: 700, width: 460 });
      mono(c, unit, 380, y + 58, 20, { color: DIM });
      rect(c, 100, y + 66, 880, 2, 1, "rgba(148,163,184,0.18)");
      c.restore();
    });
    mono(c, "measured in this repo, not estimated", 100, 1300, 20, { color: DIM });
    c.restore();
  },

  cta(c, f, a) {
    const t = smooth(a[0], a[0] + 32, f);
    if (t < 0.01) return;
    c.save(); c.globalAlpha = t;
    rect(c, 84, 420, Math.max(10, 700 * t), 130, 65, MINT);
    type(c, "Comment SHIP", 120, 500, 50, { color: "#062c26", weight: 800, width: 700 });
    mono(c, "one checklist, no signup", 120, 600, 22, { color: DIM });
    c.restore();
  },
};

// ---------------------------------------------------------------- page
await loadFonts();
const HOST = await loadHost();
const PLATE = await loadImage(".cache/kit/Inputs/empty-classroom.jpg");

/**
 * Lift the palette. The first cut used near-black tints and the plate vanished,
 * so the background read as a void with dust in it — the same "flat" complaint,
 * just dark. These keep the night-editorial feel while leaving the classroom
 * readable through it.
 */
const PALETTE = {
  hook:    { tint: "#152536", tint2: "#1d3854", photo: 0.26, sweep: 0.55, dust: 30 },
  gap:     { tint: "#16283c", tint2: "#1f4059", photo: 0.24, sweep: 0.48, dust: 24 },
  auth:    { tint: "#142437", tint2: "#1c3a52", photo: 0.22, sweep: 0.44, dust: 22 },
  empty:   { tint: "#16283b", tint2: "#1e3c53", photo: 0.25, sweep: 0.50, dust: 26 },
  offline: { tint: "#142537", tint2: "#1d3b52", photo: 0.23, sweep: 0.46, dust: 24 },
  receipt: { tint: "#132232", tint2: "#1b3549", photo: 0.20, sweep: 0.42, dust: 18 },
  cta:     { tint: "#14283a", tint2: "#1d4356", photo: 0.26, sweep: 0.58, dust: 30 },
};

const sets = new Map();
for (const [id, p] of Object.entries(PALETTE)) {
  sets.set(id, makeSet(W, H, PLATE, { ...p, parallax: 24, vig: 0.30 }));
}

/**
 * Her column and the artifact column are exclusive.
 *
 * First pass put her on top of the code pane (`x 470` with a 900 px pane) and the
 * syntax ran straight through her hoodie. The rule from the school Reel applies
 * here too, only harder: the artifact owns the centre, she stands in the margin.
 */
const POS = {
  hook:    { x: 640, y: 900, w: 400 },
  gap:     { x: 660, y: 960, w: 360 },
  auth:    { x: 40,  y: 780, w: 400 },
  empty:   { x: 650, y: 700, w: 390 },
  offline: { x: 40,  y: 720, w: 410 },
  receipt: { x: 640, y: 760, w: 400 },
  cta:     { x: 90,  y: 900, w: 560 },
};

function drawFrame(ctx, f) {
  const span = tl.spans.find((s) => f >= s.start - 3 && f < s.end + 40) || tl.spans[tl.spans.length - 1];
  const take = takeOf(span.id);
  const a = [f - span.start, f - span.end];

  sets.get(span.id)(ctx, f, span.start, span.end);

  // chrome
  ctx.save();
  mono(ctx, "ALTRAWARE", 84, 118, 26, { color: MINT, weight: 700 });
  mono(ctx, `${String(tl.spans.indexOf(span) + 1).padStart(2, "0")} / ${span.id.toUpperCase()}`,
       996, 118, 22, { color: DIM, align: "right" });
  rect(ctx, 84, 140, 912, 2, 1, "rgba(94,234,212,0.22)");
  ctx.restore();

  // headline in the safe box
  const head = { hook: 88, gap: 74, auth: 72, empty: 70, offline: 68, receipt: 78, cta: 86 }[span.id];
  const tIn = smooth(span.start + 2, span.start + 24, f);
  if (tIn > 0.01) {
    ctx.save(); ctx.globalAlpha = tIn; ctx.translate(0, (1 - tIn) * 20);
    take.sw.forEach((line, i) => {
      type(ctx, line, 84, 300 + i * (head + 12), head, { color: PAPER, weight: 800, width: 900 });
    });
    ctx.restore();
  }

  // the artifact of this beat
  SCENES[span.id](ctx, f, a);

  // her: smaller than on the school Reel, standing in the scene
  const p = POS[span.id];
  groundShadow(ctx, p.x + p.w * 0.5, p.y + p.w * 0.99, p.w * 0.66, 0.30);
  const draw = performerDraw(ctx, HOST, FPS);
  draw(f, "review", {
    pose: take.pose, mouth: MOUTH, ...p,
    cues: (take.gesture || []).map((g) => ({ kind: g.kind, start: span.start + Math.round(g.at * FPS), len: g.len })),
    blinks: [span.start + 40, span.start + 150, span.start + 260].filter((x) => x > span.start + 6),
    nods: [],
  });

  // caption + progress
  const capT = smooth(span.start + 6, span.start + 22, f) * (1 - smooth(span.end + 6, span.end + 24, f));
  if (capT > 0.01) {
    ctx.save(); ctx.globalAlpha = capT;
    const text = take.sw.join(" ");
    ctx.font = `600 33px '${FONTS.sans}'`;
    const tw = ctx.measureText(text).width;
    const bw = Math.min(920, tw + 76);
    rect(ctx, (W - bw) / 2, 1616, bw, 82, 20, "rgba(2,8,20,0.88)");
    edge(ctx, (W - bw) / 2, 1616, bw, 82, 20, "rgba(94,234,212,0.28)", 2);
    type(ctx, text, W / 2, 1670, 33, { color: PAPER, align: "center", width: 850, weight: 600 });
    ctx.restore();
  }
  rect(ctx, 0, H - 6, W, 6, 0, "rgba(94,234,212,0.14)");
  rect(ctx, 0, H - 6, W * clamp(f / tl.frames), 6, 0, MINT);
}

// ---------------------------------------------------------------- main
const outFile = process.argv[2] || path.join(OUT, "ship-vs-shipped.mp4");
const audio = process.argv[3] || path.join(OUT, "mix.wav");
const proof = Number((process.argv.find((x) => x.startsWith("--proof=")) || "").split("=")[1] || tl.frames);
if (!FF) throw new Error("FFMPEG required");

const cv = createCanvas(W, H);
const ctx = cv.getContext("2d");
const n = Math.min(tl.frames, proof);

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
  const d = ctx.getImageData(0, 0, W, H).data;
  const buf = Buffer.from(d.buffer, d.byteOffset, d.byteLength);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 240 === 0) process.stderr.write(`frame ${f}/${n}\n`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`)))));
process.stderr.write(`wrote ${outFile}\n`);
