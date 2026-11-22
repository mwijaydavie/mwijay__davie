/**
 * Noellyne IG intro — V8.
 *
 * The break from V1–V7, stated plainly:
 *
 *   V1–V7 all took the approved reel, cut a rectangle out of it, and laid that
 *   rectangle on a cream page. Every version then argued about the edge of the
 *   rectangle — matte it, feather it, print it, card it. The owner rejected all
 *   of it, correctly: a rectangle of somebody's footage on a page IS a cutout,
 *   however it is dressed, and the page was never his.
 *
 *   V8 does not use a page. There is no cream, no card, no print, no mat,
 *   no ruling, no numbered sections, no pill. Every shot is FULL BLEED: her own
 *   frame, edge to edge, 1080x1920. The only things drawn on top are type and
 *   the real Altraware mark.
 *
 * Where the pictures come from: her own approved footage only
 * (Noellyne-Intro-SW.mp4, 24.8 s, 60 fps). No reference reel contributes a
 * pixel. The reference reels were studied for rhythm once and are not opened
 * by this file.
 *
 * Where the words come from: this build uses THE SOURCE AUDIO — her own voice,
 * her own Swahili — so on-screen words must match what she is saying. They do.
 *
 * Baked text handling. The source is itself a finished edit, so most shots have
 * text burned in. Rather than erase it (inpainting destroyed the artwork — see
 * the note in the README), V8 crops each shot to the largest region that
 * contains no baked text at all, then fills the frame from that region. Shots
 * with no clean region are not used. Logos and header rules are left in place
 * and covered by the real mark bar, which occupies exactly the same strip.
 */
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const FRAMES = path.join(ROOT, ".cache/frames");
const OUT = path.join(ROOT, "production/noellyne-ig/intro-v8/out");
const LOGO = path.join(ROOT, "production/noellyne-ig/intro-v6/assets/logo-tile-144.png");
const FFMPEG = process.env.FFMPEG;

const W = 1080, H = 1920, FPS = 30;

// sampled from her footage, not from any reference
const PAPER = "#F3EDE2";   // only used for type, never for a page
const INK = "#FFFFFF";
const PLUM = "#C4A8F0";
const OCHRE = "#F0C070";
const NAVY = "#1B1630";

const FONT_DIR = "/usr/share/fonts/truetype/dejavu";
for (const f of ["DejaVuSerif-Bold.ttf","DejaVuSerif-Italic.ttf","DejaVuSerif-BoldItalic.ttf","DejaVuSans-Bold.ttf","DejaVuSans.ttf","DejaVuSerif.ttf"]) {
  const p = path.join(FONT_DIR, f);
  if (fs.existsSync(p)) GlobalFonts.registerFromPath(p);
}
const SERIF = "DejaVu Serif", SANS = "DejaVu Sans";

/**
 * SHOTS. `crop` is the rect of the source frame that is free of baked text,
 * measured per shot. It is scaled to fill 1080x1920 with a slow Ken Burns push,
 * so the frame is always full bleed and never shows a letterbox.
 *
 * src: [startFrame, endFrame] in the 30 fps extraction (frame N = (N-1)/30 s).
 */
const SHOTS = [
  // hook — phone in hand, quote card sits at x>=460, so use the left column
  // the quote card starts at x=455; 430 keeps a margin at every frame of the shot
  { id: "hook",  src: [3, 126],  crop: [30, 400, 430, 1700],  pan: [0.00, 0.04], say: "Tech inakuchanganya?" },
  // name — the "Mimi ni / Noellyne" card is at x<560 and y<960; the right column is clean
  { id: "name",  src: [156, 258], crop: [600, 160, 1075, 1700], pan: [0.04, 0.10], say: "Mimi ni Noellyne." },
  // promise — list is at x<560 y<1000; use the right column, her face and hand
  { id: "promise", src: [436, 566], crop: [610, 380, 1076, 1700], pan: [0.03, 0.08], say: "Bila hype." },
  // cta — the clean close-up; nothing burned in below y=470
  // tight face crop: clear of the baked header (y<400), the baked headline
  // (y>1160) and the baked circle (x<320). This is the whole last shot.
  { id: "cta",   src: [662, 742], crop: [320, 470, 750, 1120], pan: [0.02, 0.06], say: "Nifuate." },
];

const BEATS = [
  { shot: "hook",    from: 0.0,  to: 4.4, kicker: null,            lines: [{ t: "Tech", s: 132 }, { t: "inakuchanganya?", s: 76 }], ital: { t: "Tuiweke rahisi.", s: 66 } },
  { shot: "name",    from: 4.4,  to: 8.8, kicker: "MIMI NI",       lines: [{ t: "Noellyne.", s: 128 }], ital: null, badge: "TECH HOST · ALTRAWARE" },
  { shot: "promise", from: 8.8,  to: 14.6, kicker: "HAPA UTAPATA", lines: [{ t: "Bila hype.", s: 104 }], ital: null, rows: ["Habari za AI", "Demo za apps", "Prompts za kujaribu"] },
  { shot: "cta",     from: 14.6, to: 19.8, kicker: "TUKUTANE",     lines: [{ t: "Nifuate", s: 116 }], ital: { t: "hapa.", s: 96 }, badge: "@noellyne · Altraware" },
];
const TOTAL = BEATS[BEATS.length - 1].to;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (t, a, b) => ease(clamp((t - a) / Math.max(1e-6, b - a)));

let LOGOIMG = null;

/**
 * Frames are decoded on demand and kept in a small bounded cache.
 *
 * A 1080x1920 PNG decodes to ~8 MB. Preloading the 439 frames this edit touches
 * needed >3.5 GB and the process was repeatedly OOM-killed ("Killed", exit 137),
 * which then looked like a broken encoder. 48 slots is enough to stride through
 * every shot without re-decoding the same frame twice.
 */
const CACHE_MAX = 48;
const cache = new Map();
async function frame(f) {
  const p = path.join(FRAMES, `f_${String(f).padStart(4, "0")}.png`);
  if (cache.has(p)) {
    const v = cache.get(p);
    cache.delete(p); cache.set(p, v); // touch
    return v;
  }
  if (!fs.existsSync(p)) return null;
  const img = await loadImage(p);
  cache.set(p, img);
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
  return img;
}
async function preload() {
  if (fs.existsSync(LOGO)) LOGOIMG = await loadImage(LOGO);
}
const pick = (s, t01) => {
  const f = Math.round(lerp(s.src[0], s.src[1], clamp(t01)));
  return cache.get(path.join(FRAMES, `f_${String(f).padStart(4, "0")}.png`)) || null;
};
async function prime(s, t01) {
  const f = Math.round(lerp(s.src[0], s.src[1], clamp(t01)));
  await frame(f);
}

// ---------------------------------------------------------------- chrome
function markBar(ctx, a) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = a;
  // plum veil so the baked header underneath is gone without erasing the wall
  const g = ctx.createLinearGradient(0, 0, 0, 190);
  g.addColorStop(0, "rgba(16,12,30,0.88)");
  g.addColorStop(0.72, "rgba(16,12,30,0.55)");
  g.addColorStop(1, "rgba(16,12,30,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 190);
  if (LOGOIMG) ctx.drawImage(LOGOIMG, 62, 62, 54, 54);
  ctx.font = `bold 26px ${SANS}`;
  ctx.fillStyle = "#fff";
  ctx.fillText("ALTRAWARE", 128, 100);
  ctx.restore();
}

function progress(ctx, p) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(0, H - 6, W, 6);
  ctx.fillStyle = OCHRE;
  ctx.fillRect(0, H - 6, W * clamp(p), 6);
  ctx.restore();
}

function scrim(ctx, side) {
  // readability band behind the type, tinted from her own set colour
  const g = side === "bottom"
    ? ctx.createLinearGradient(0, H - 820, 0, H)
    : ctx.createLinearGradient(0, 120, 0, 980);
  g.addColorStop(0, "rgba(18,13,34,0)");
  g.addColorStop(1, side === "bottom" ? "rgba(18,13,34,0.94)" : "rgba(18,13,34,0.90)");
  ctx.fillStyle = g;
  if (side === "bottom") ctx.fillRect(0, H - 820, W, 820);
  else ctx.fillRect(0, 120, W, 860);
}

// ---------------------------------------------------------------- beats
function drawHook(ctx, el, dur) {
  const t = ramp(el, 0.10, 0.50);
  if (t <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.translate(0, (1 - t) * 40);
  ctx.font = `bold 132px ${SERIF}`;
  ctx.fillStyle = INK;
  const y1 = 1180;
  ctx.fillText("Tech", 78, y1);
  ctx.font = `bold 76px ${SERIF}`;
  ctx.fillText("inakuchanganya?", 78, y1 + 96);
  ctx.font = `italic bold 66px ${SERIF}`;
  ctx.fillStyle = PLUM;
  ctx.fillText("Tuiweke rahisi.", 78, y1 + 190);
  // underline that draws itself
  const u = ramp(el, 0.8, 1.3);
  ctx.globalAlpha = t * u;
  ctx.strokeStyle = OCHRE;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(82, y1 + 232);
  ctx.quadraticCurveTo(82 + 150, y1 + 224, 82 + 360 * u, y1 + 232);
  ctx.stroke();
  ctx.restore();
}

function drawName(ctx, el, dur) {
  const t = ramp(el, 0.08, 0.46);
  if (t <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.translate(0, (1 - t) * 40);
  ctx.font = `bold 26px ${SANS}`;
  ctx.fillStyle = "rgba(255,255,255,0.66)";
  ctx.fillText("M I M I   N I", 78, 1152);
  ctx.font = `bold 128px ${SERIF}`;
  ctx.fillStyle = INK;
  ctx.fillText("Noellyne.", 74, 1282);
  const b = ramp(el, 0.5, 0.82);
  if (b > 0.001) {
    ctx.globalAlpha = t * b;
    ctx.font = `bold 30px ${SANS}`;
    const label = "TECH HOST · ALTRAWARE";
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = OCHRE;
    ctx.fillRect(78, 1322, tw + 44, 58);
    ctx.fillStyle = NAVY;
    ctx.fillText(label, 100, 1361);
  }
  ctx.restore();
}

function drawPromise(ctx, el, dur) {
  const t = ramp(el, 0.06, 0.40);
  if (t <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.font = `bold 26px ${SANS}`;
  ctx.fillStyle = "rgba(255,255,255,0.66)";
  ctx.fillText("H A P A   U T A P A T A", 78, 1080);
  ctx.font = `bold 104px ${SERIF}`;
  ctx.fillStyle = INK;
  ctx.fillText("Bila hype.", 74, 1196);
  const rows = ["Habari za AI", "Demo za apps", "Prompts za kujaribu"];
  rows.forEach((r, i) => {
    const rt = ramp(el, 0.55 + i * 0.42, 0.95 + i * 0.42);
    if (rt <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = t * rt;
    ctx.translate((1 - rt) * -36, 0);
    ctx.font = `bold 34px ${SANS}`;
    ctx.fillStyle = "rgba(255,255,255,0.30)";
    ctx.fillRect(78, 1240 + i * 74, 6, 44);
    ctx.fillStyle = OCHRE;
    ctx.fillText(String(i + 1).padStart(2, "0"), 100, 1272 + i * 74);
    ctx.fillStyle = INK;
    ctx.fillText(r, 158, 1272 + i * 74);
    ctx.restore();
  });
  ctx.restore();
}

function drawCta(ctx, el, dur) {
  const t = ramp(el, 0.08, 0.44);
  if (t <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.translate(0, (1 - t) * 36);
  ctx.font = `bold 26px ${SANS}`;
  ctx.fillStyle = "rgba(255,255,255,0.66)";
  ctx.fillText("T U K U T A N E", 78, 1150);
  ctx.font = `bold 116px ${SERIF}`;
  ctx.fillStyle = INK;
  ctx.fillText("Nifuate", 74, 1272);
  ctx.font = `italic bold 96px ${SERIF}`;
  ctx.fillStyle = PLUM;
  ctx.fillText("hapa.", 74, 1376);
  // one button, drawn as a filled bar so it never looks like a UI kit
  const b = ramp(el, 0.55, 0.9);
  if (b > 0.001) {
    ctx.globalAlpha = t * b;
    ctx.fillStyle = OCHRE;
    ctx.fillRect(78, 1436, 420 * b, 92);
    ctx.fillStyle = NAVY;
    ctx.font = `bold 38px ${SANS}`;
    ctx.fillText("FOLLOW", 112, 1496);
  }
  const h = ramp(el, 0.9, 1.2);
  if (h > 0.001) {
    ctx.globalAlpha = t * h * 0.8;
    ctx.font = `26px ${SANS}`;
    ctx.fillStyle = "#fff";
    ctx.fillText("@noellyne", 78, 1580);
  }
  ctx.restore();
}

async function drawFrame(ctx, t) {
  const beat = BEATS.find((b) => t >= b.from && t < b.to) || BEATS[BEATS.length - 1];
  const el = t - beat.from, dur = beat.to - beat.from;
  const shot = SHOTS.find((s) => s.id === beat.shot);

  // full bleed, edge to edge — no page, no panel, no mat
  const img = await frame(Math.round(lerp(shot.src[0], shot.src[1], clamp(el / dur))));
  if (img) {
    const [cx0, cy0, cx1, cy1] = shot.crop;
    const cw = cx1 - cx0, ch = cy1 - cy0;
    // fill 1080x1920 covering both axes, plus a slow push
    const push = 1 + 0.05 * clamp(el / dur);
    const sc = Math.max(W / cw, H / ch) * push;
    const sw = (W / sc), sh = (H / sc);
    const panX = lerp(shot.pan[0], shot.pan[1], clamp(el / dur)) * (cw - sw);
    const sx = clamp(cx0 + panX, cx0, cx1 - sw);
    const sy = clamp(cy0 + (ch - sh) * 0.35, cy0, cy1 - sh);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  } else {
    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, W, H);
  }

  markBar(ctx, ramp(el, 0.0, 0.25));

  // type needs a floor: her hoodie is the same value as white type in places
  const band = ctx.createLinearGradient(0, 980, 0, H);
  band.addColorStop(0, "rgba(14,10,26,0)");
  band.addColorStop(0.42, "rgba(14,10,26,0.78)");
  band.addColorStop(1, "rgba(14,10,26,0.95)");
  ctx.fillStyle = band;
  ctx.fillRect(0, 980, W, H - 980);

  if (beat.id === undefined) { /* noop */ }
  if (beat.shot === "hook") drawHook(ctx, el, dur);
  if (beat.shot === "name") drawName(ctx, el, dur);
  if (beat.shot === "promise") drawPromise(ctx, el, dur);
  if (beat.shot === "cta") drawCta(ctx, el, dur);

  // finish: a breath of film grain so flat walls do not band
  ctx.save();
  ctx.globalAlpha = 0.045;
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 220; i++) {
    const x = (i * 7919) % W, y = ((i * 104729) % H);
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();

  progress(ctx, t / TOTAL);
}

// ---------------------------------------------------------------- main
async function main() {
  const args = process.argv.slice(2);
  const limit = Number((args.find((a) => a.startsWith("--proof=")) || "").split("=")[1] || Infinity);
  const audio = (args.find((a) => a.startsWith("--audio=")) || "").split("=")[1];
  const outFile = args.find((a) => a.endsWith(".mp4"));
  if (!outFile) throw new Error("pass an output .mp4");

  await preload();
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const frames = Math.min(Math.round(TOTAL * FPS), limit);

  const ffArgs = ["-y", "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-"];
  if (audio) ffArgs.push("-ss", "0", "-t", String(TOTAL), "-i", audio);
  ffArgs.push("-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p");
  if (audio) ffArgs.push("-c:a", "aac", "-b:a", "192k", "-shortest");
  ffArgs.push("-movflags", "+faststart", outFile);

  if (!FFMPEG) throw new Error("FFMPEG env var is required");
  const ff = spawn(FFMPEG, ffArgs, { stdio: ["pipe", "inherit", "inherit"] });
  ff.stdin.on("error", (e) => process.stderr.write(`ffmpeg stdin: ${e.message}\n`));
  for (let i = 0; i < frames; i++) {
    await drawFrame(ctx, i / FPS);
    // Buffer.from(Uint8ClampedArray) copies through the *array* length and came
    // out short (5.7 MB of 8.3 MB), which silently produced a 0.98 s file. The
    // correct form wraps the same memory with the typed array's own offset.
    // This exact bug produced two false "the render is broken" detours; do not
    // simplify this line.
    const d = ctx.getImageData(0, 0, W, H).data;
    const buf = Buffer.from(d.buffer, d.byteOffset, d.byteLength);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 60 === 0) process.stderr.write(`frame ${i}/${frames}\n`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`)))));
  process.stderr.write(`wrote ${outFile}\n`);
}
main().catch((e) => { console.error(e); process.exit(1); });
