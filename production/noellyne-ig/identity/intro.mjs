/**
 * Noellyne IG / YT intro — 12 s identity sting.
 *
 * Built on the lessons in `production/noellyne-ig/CREATIVE-GUIDE.md`:
 *   · NO page, NO card, NO cream mat. Every frame is full bleed 1080×1920.
 *   · she is the source of the frame, not a rectangle laid on one.
 *   · head movement horizontal only; never rescale her mid-shot.
 *   · one voice, restrained bed, one cue per cut — "audios nyingi ka uchafu".
 *   · every scene is a different place, with depth (floor grid, orbit, arch,
 *     stars) and its own accent.
 *
 * The motion is the point of this cut. Three moves, all frame-derived:
 *   · a camera push on every shot (1.00 → 1.06), never a static hold
 *   · her own idle: the rig already breathes, blinks and sways
 *   · one travelling light per shot — a sweep on the floor, a pulse on the ring
 *
 * Run:
 *   export FFMPEG=…
 *   node production/noellyne-ig/identity/intro.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, FONTS } from "../../noellyne-host/host.mjs";

const ROOT = process.cwd();
const HERE = path.join(ROOT, "production/noellyne-ig/identity");
const OUT = path.join(HERE, "out");
const FF = process.env.FFMPEG;
/**
 * `--landscape` renders the same timeline at 1920×1080 for YouTube. The
 * composition has to change with the aspect: a centred portrait in 16:9 leaves
 * two dead columns, and the name lands on her head. So wide frames put the type
 * in a left column and her on the right, cropped by the right edge.
 */
const WIDE = process.argv.includes("--landscape");
const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920, FPS = 30;

const CREAM = "#f7f1e6";
const LAV = "#b8a6ff";
const GOLD = "#f2c66d";
const MINT = "#3ddc97";
const RED = "#ff6b6b";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, f) => { const q = clamp((f - a) / (b - a)); return q * q * (3 - 2 * q); };

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function rect(c, x, y, w, h, r, col) { rr(c, x, y, w, h, r); c.fillStyle = col; c.fill(); }
function line(c, pts, col, px = 2) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
  c.strokeStyle = col; c.lineWidth = px; c.lineCap = "round"; c.stroke();
}
function dot(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); }
function type(c, s, x, y, size, o = {}) {
  const { family = FONTS.sans, color = CREAM, width = 2000, weight = 700,
          align = "left", track = 0 } = o;
  c.save();
  c.font = `${weight} ${size}px '${family}'`;
  c.fillStyle = color; c.textAlign = align; c.textBaseline = "alphabetic";
  if (track) {
    const chars = [...s];
    const ws = chars.map((ch) => c.measureText(ch).width + track);
    const total = ws.reduce((a, b) => a + b, 0) - track;
    let cx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    chars.forEach((ch, i) => { c.fillText(ch, cx, y); cx += ws[i]; });
  } else c.fillText(s, x, y, width);
  c.restore();
}
function mono(c, s, x, y, size, o = {}) { type(c, s, x, y, size, { family: FONTS.mono, weight: 500, ...o }); }

function glow(c, cx, cy, r, rgb, strength = 1) {
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(${rgb},${0.34 * strength})`);
  g.addColorStop(0.5, `rgba(${rgb},${0.13 * strength})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.save();
  c.globalCompositeOperation = "lighter";
  c.fillStyle = g;
  c.fillRect(cx - r, cy - r, r * 2, r * 2);
  c.restore();
}
function orbit(c, cx, cy, r, col, phase = 0, dash = 26, lw = 2) {
  c.save();
  c.strokeStyle = col; c.lineWidth = lw; c.setLineDash([dash, dash * 0.9]);
  c.lineDashOffset = phase;
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  c.restore();
}
function hash(n) { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }

/* ------------------------------------------------------------------ sets */

function setPlum(c, f, s, e) {
  const g = c.createLinearGradient(0, 0, W * 0.6, H);
  g.addColorStop(0, "#170d26"); g.addColorStop(0.55, "#241239"); g.addColorStop(1, "#0c0715");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  glow(c, W * 0.78, H * 0.20, W * 0.72, "168,140,255", 0.9);

  // floor with a travelling light bar
  const u = clamp((f - s) / (e - s));
  for (let i = 0; i < 18; i++) {
    const y = H * 0.64 + Math.pow(i / 18, 1.75) * H * 0.36;
    line(c, [[0, y], [W, y]], `rgba(184,166,255,${0.04 + i * 0.004})`, 1.5);
  }
  const bx = (u * 1.6 % 1) * (W + 500) - 250;
  const bg = c.createLinearGradient(bx - 300, 0, bx + 300, 0);
  bg.addColorStop(0, "rgba(184,166,255,0)");
  bg.addColorStop(0.5, "rgba(184,166,255,0.13)");
  bg.addColorStop(1, "rgba(184,166,255,0)");
  c.fillStyle = bg;
  c.fillRect(bx - 300, H * 0.64, 600, H * 0.36);

  orbit(c, W * 0.5, H * 0.40, W * 0.42, "rgba(184,166,255,0.22)", f * 1.4, 30);
  orbit(c, W * 0.5, H * 0.40, W * 0.55, "rgba(184,166,255,0.11)", -f * 0.9, 46);
}

function setDesk(c, f, s, e, plate) {
  // The classroom plate is texture here, not content: blurred and pushed two
  // stops under, so it reads as a room instead of window frames behind her.
  const k = Math.max(W / plate.width, H / plate.height) * 1.2;
  c.save();
  c.globalAlpha = 0.80;
  c.filter = "blur(22px) saturate(0.55)";
  c.drawImage(plate, (W - plate.width * k) / 2, (H - plate.height * k) / 2,
              plate.width * k, plate.height * k);
  c.restore();
  const g = c.createLinearGradient(0, 0, W * 0.4, H);
  g.addColorStop(0, "rgba(6,20,26,0.80)");
  g.addColorStop(0.5, "rgba(8,34,40,0.50)");
  g.addColorStop(1, "rgba(3,12,16,0.94)");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const u = clamp((f - s) / (e - s));
  glow(c, W * (0.20 + u * 0.12), H * 0.22, W * 0.62, "61,220,151", 0.55);
  // a data line running the floor
  const y = H * 0.80;
  const lx = (u * 1.4 % 1) * W;
  line(c, [[0, y], [W, y]], "rgba(61,220,151,0.16)", 2);
  const lg = c.createLinearGradient(lx - 200, y, lx + 200, y);
  lg.addColorStop(0, "rgba(61,220,151,0)");
  lg.addColorStop(0.5, "rgba(61,220,151,0.85)");
  lg.addColorStop(1, "rgba(61,220,151,0)");
  c.fillStyle = lg; c.fillRect(lx - 200, y - 2, 400, 4);
}

function setRoom(c, f, s, e) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1a1108"); g.addColorStop(0.5, "#2e1e0c"); g.addColorStop(1, "#120b05");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const u = clamp((f - s) / (e - s));
  const cx = W * 0.5, r = W * 0.30, top = H * 0.13;
  const wg = c.createLinearGradient(0, top, 0, top + r * 2.1);
  wg.addColorStop(0, `rgba(242,198,109,${0.34 + 0.10 * Math.sin(u * Math.PI)})`);
  wg.addColorStop(1, "rgba(242,198,109,0.05)");
  c.fillStyle = wg;
  c.beginPath();
  c.moveTo(cx - r, top + r);
  c.arc(cx, top + r, r, Math.PI, 0);
  c.lineTo(cx + r, top + r * 2.3);
  c.lineTo(cx - r, top + r * 2.3);
  c.closePath(); c.fill();
  glow(c, cx, top + r, r * 1.9, "242,198,109", 0.7);
  line(c, [[cx, top], [cx, top + r * 2.3]], "rgba(26,17,8,0.55)", 7);
  line(c, [[cx - r, top + r * 1.15], [cx + r, top + r * 1.15]], "rgba(26,17,8,0.55)", 7);
  // motes in the light
  for (let i = 0; i < 28; i++) {
    const h1 = hash(i + 1), h2 = hash(i + 91);
    const x = cx - r + h1 * r * 2;
    const yy = top + r + ((h2 + u * 0.6) % 1) * r * 1.9;
    dot(c, x, yy, 1.2 + h1 * 2, `rgba(255,226,170,${0.10 + h1 * 0.22})`);
  }
  const fg = c.createLinearGradient(0, H * 0.62, 0, H);
  fg.addColorStop(0, "rgba(18,11,5,0)"); fg.addColorStop(1, "rgba(12,7,3,0.92)");
  c.fillStyle = fg; c.fillRect(0, H * 0.62, W, H * 0.38);
}

function setSky(c, f, s, e) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#08071c"); g.addColorStop(0.45, "#151034");
  g.addColorStop(0.72, "#241a4d"); g.addColorStop(1, "#0a0718");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const u = clamp((f - s) / (e - s));
  for (let i = 0; i < 130; i++) {
    const x = hash(i + 1) * W;
    const y = hash(i + 91) * H * 0.66;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin((f * 0.08) + i));
    dot(c, x, y, 0.8 + hash(i + 7) * 1.7, `rgba(220,214,255,${0.18 + tw * 0.45})`);
  }
  glow(c, W * 0.5, H * 0.30, W * 0.72, "139,120,255", 1.0);
  orbit(c, W * 0.5, H * 0.34, W * 0.44, "rgba(184,166,255,0.28)", f * 1.2, 34);
  orbit(c, W * 0.5, H * 0.34, W * 0.58, "rgba(184,166,255,0.13)", -f * 0.8, 52);
  line(c, [[0, H * 0.685], [W, H * 0.685]], "rgba(184,166,255,0.22)", 2);
  // a comet: one line that crosses the frame once
  const cu = ((u * 1.15) % 1);
  const cx = -200 + cu * (W + 400), cy = H * 0.12 + cu * H * 0.16;
  const cg = c.createLinearGradient(cx - 260, cy - 40, cx, cy);
  cg.addColorStop(0, "rgba(220,214,255,0)"); cg.addColorStop(1, "rgba(220,214,255,0.85)");
  c.strokeStyle = cg; c.lineWidth = 3; c.lineCap = "round";
  c.beginPath(); c.moveTo(cx - 260, cy - 40); c.lineTo(cx, cy); c.stroke();
}

/* ------------------------------------------------------------------ shots */
/**
 * Four shots in 12 s. Every one of them pushes, every one of them has a
 * different set, and the copy is a single line that is actually spoken.
 */
/**
 * Shots come from the measured mix, not from a stopwatch. `timeline.json` is
 * written by `mix.py` from the actual MP3 lengths, so a re-record moves the cut
 * with the voice instead of leaving the visuals behind.
 */
const TL = JSON.parse(fs.readFileSync(path.join(OUT, "timeline.json"), "utf8"));
const COPY = {
  hook:    { set: "sky",  pose: "wave",  accent: LAV,
             head: ["Tech", "inakuchanganya?"], sub: "TUIWEKE RAHISI" },
  name:    { set: "plum", pose: "desk",  accent: LAV,
             head: ["MIMI NI", "Noellyne."], sub: "TECH HOST · ALTRAWARE" },
  promise: { set: "room", pose: "point", accent: GOLD,
             head: ["APPS · AI · TOOLS", "bila hype."], sub: "KILA SIKU, KITU KIMOJA" },
  cta:     { set: "desk", pose: "peace", accent: MINT,
             head: ["FOLLOW", "tukutane hapa."], sub: "IG · YOUTUBE · @noellyne" },
};
const SHOT = TL.spans.map((sp) => ({ ...COPY[sp.id], id: sp.id, at: sp.start, len: sp.end - sp.start }));
const TOTAL = TL.frames;

await loadFonts();
const HOST = await loadHost();
const PLATE = await loadImage(path.join(ROOT, "production/noellyne-host/poses-src/plate-classroom.jpg"));

function drawFrame(c, f) {
  const sh = SHOT.find((s) => f >= s.at && f < s.at + s.len) || SHOT[SHOT.length - 1];
  const s = sh.at, e = sh.at + sh.len;
  const u = clamp((f - s) / (e - s));

  // full bleed set, inside a slow push
  c.save();
  const cam = 1 + 0.055 * u;
  c.translate(W / 2, H / 2); c.scale(cam, cam); c.translate(-W / 2, -H / 2);
  if (sh.set === "sky") setSky(c, f, s, e);
  else if (sh.set === "plum") setPlum(c, f, s, e);
  else if (sh.set === "room") setRoom(c, f, s, e);
  else setDesk(c, f, s, e, PLATE);
  c.restore();

  // her: big, cropped by the frame, never rescaled mid-shot
  // wide = right column; tall = centred. Both are measured off the same rig.
  const w = WIDE ? (sh.pose === "peace" ? 880 : 850) : (sh.pose === "peace" ? 900 : 880);
  const x = WIDE
    ? W - w * 0.80 + (sh.pose === "point" ? -60 : 0)
    : (W - w) / 2 + (sh.pose === "point" ? -26 : 0);
  const y = WIDE
    ? (sh.pose === "point" ? H * 0.105 : H * 0.125)
    : (sh.pose === "point" ? H * 0.112 : H * 0.132);
  glow(c, x + w * 0.5, y + w * 0.30, w * 0.85, sh.set === "room" ? "242,198,109" : "168,140,255", 0.9);
  const draw = performerDraw(c, HOST, FPS);
  const blinks = [s + 34, s + 34 + 96, s + 34 + 192].filter((b) => b < e + 6);
  draw(f, "review", {
    pose: sh.pose, mouth: null, x, y, w,
    cues: [{ kind: sh.pose === "point" ? "point" : "wave", start: s + 8, len: Math.min(70, sh.len - 16) }],
    blinks,
    nods: [s + 16],
  });

  // the type. Tall: from her measured hem down, on a floor scrim.
  // Wide: a left column, so it can never reach her at all.
  const hem = y + w * 0.985;
  const M = WIDE ? 120 : 62;
  const by = WIDE ? H * 0.500 : Math.max(hem + 92, H * 0.805);
  if (WIDE) {
    const sg = c.createLinearGradient(0, 0, W * 0.78, 0);
    sg.addColorStop(0, "rgba(5,4,10,0.88)");
    sg.addColorStop(0.40, "rgba(5,4,10,0.66)");
    sg.addColorStop(0.72, "rgba(5,4,10,0.22)");
    sg.addColorStop(1, "rgba(5,4,10,0)");
    c.fillStyle = sg;
    c.fillRect(0, 0, W * 0.78, H);
  } else {
    const sg = c.createLinearGradient(0, by - 110, 0, H);
    sg.addColorStop(0, "rgba(5,4,10,0)");
    sg.addColorStop(0.42, "rgba(5,4,10,0.66)");
    sg.addColorStop(0.72, "rgba(5,4,10,0.90)");
    sg.addColorStop(1, "rgba(3,2,7,0.97)");
    c.fillStyle = sg;
    c.fillRect(0, by - 110, W, H - (by - 110));
  }

  const tIn = smooth(s + 4, s + 22, f);
  c.save();
  c.globalAlpha = tIn;
  c.translate(0, (1 - tIn) * 26);
  rect(c, M, by - 46, 5, 168, 2.5, sh.accent);
  type(c, sh.head[0], M + 26, by - 8, WIDE ? 34 : 38,
       { weight: 620, color: "rgba(247,241,230,0.86)", track: 7 });
  type(c, sh.head[1], M + 22, by + 76, WIDE ? 78 : 84, { weight: 830 });
  mono(c, sh.sub, M + 26, by + 122, WIDE ? 22 : 23, { color: sh.accent, track: 4 });
  c.restore();

  // chrome
  c.save();
  c.globalAlpha = 0.94;
  c.drawImage(HOST.mark, M, 58, 46, 46);
  type(c, "ALTRAWARE", M + 58, 92, 24, { weight: 750, track: 1.5 });
  mono(c, `${String(SHOT.indexOf(sh) + 1).padStart(2, "0")} / 04`, W - M, 92, 20,
       { align: "right", color: "rgba(247,241,230,0.55)", track: 3 });
  line(c, [[M, 118], [W - M, 118]], "rgba(184,166,255,0.26)", 2);
  c.restore();

  // the cut: a short dip at each boundary, so scenes do not hard-swap
  const dipIn = 1 - smooth(s, s + 4, f);
  const dipOut = smooth(e - 6, e, f);
  const dark = Math.max(dipIn, dipOut * 0.55);
  if (dark > 0.001) {
    c.fillStyle = `rgba(3,2,7,${dark * 0.9})`;
    c.fillRect(0, 0, W, H);
  }

  // progress hairline, so a looping story reads as a loop
  rect(c, 0, H - 6, W, 6, 0, "rgba(184,166,255,0.14)");
  rect(c, 0, H - 6, W * clamp(f / TOTAL), 6, 0, LAV);
}

/* ------------------------------------------------------------------ encode */
const audio = path.join(OUT, "intro.wav");
const outFile = (process.argv[2] && !process.argv[2].startsWith("--"))
  ? process.argv[2]
  : path.join(OUT, WIDE ? "intro-yt.mp4" : "intro.mp4");
const stills = process.argv.find((a) => a.startsWith("--stills="));
const stillDir = path.join(ROOT, ".cache/stills-" + (WIDE ? "wide" : "tall"));

const cv = createCanvas(W, H);
const ctx = cv.getContext("2d");

if (stills) {
  const dir = stillDir;
  fs.mkdirSync(dir, { recursive: true });
  for (const pair of stills.split("=")[1].split(",")) {
    const [id, fr] = pair.split(":");
    drawFrame(ctx, Number(fr));
    fs.writeFileSync(path.join(dir, `intro-${id}.png`), cv.toBuffer("image/png"));
  }
  process.stderr.write(`stills -> ${dir}\n`);
  process.exit(0);
}

if (!FF) throw new Error("FFMPEG env var required");
const args = ["-y", "-hide_banner", "-loglevel", "error",
  "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-"];
if (fs.existsSync(audio)) args.push("-i", audio);
args.push("-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p");
if (fs.existsSync(audio)) args.push("-c:a", "aac", "-b:a", "192k", "-shortest");
args.push("-movflags", "+faststart", outFile);

const ff = spawn(FF, args, { stdio: ["pipe", "inherit", "inherit"] });
ff.stdin.on("error", (err) => process.stderr.write(`stdin: ${err.message}\n`));
for (let f = 0; f < TOTAL; f++) {
  drawFrame(ctx, f);
  const d = ctx.getImageData(0, 0, W, H).data;
  const buf = Buffer.from(d.buffer, d.byteOffset, d.byteLength);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 60 === 0) process.stderr.write(`frame ${f}/${TOTAL}\n`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`)))));
process.stderr.write(`wrote ${outFile}\n`);
