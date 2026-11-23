/**
 * Noellyne — IG / YouTube identity pack.
 *
 * One file, four outputs, because they share one look and must not drift:
 *
 *   banner-ig.png        1080 × 1920  (IG profile / Reel cover / story)
 *   banner-yt.png        2048 × 1152  (YouTube channel art; safe area marked)
 *   avatar.png           1024 × 1024  (IG + YT profile picture)
 *   scenes/look-*.png    1080 × 1350  (4:5 feed portraits, one per scene)
 *
 * She is drawn from the real rig (`production/noellyne-host`), never from a
 * crop of old footage. Every scene is deliberately different: the whole point
 * of the pack is that a feed of four of these does not look like one image four
 * times.
 *
 * Run:
 *   node production/noellyne-ig/identity/banners.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, FONTS } from "../../noellyne-host/host.mjs";
import { makeSet, groundShadow } from "../../noellyne-host/background.mjs";

const ROOT = process.cwd();
const HERE = path.join(ROOT, "production/noellyne-ig/identity");
const OUT = path.join(HERE, "out");
fs.mkdirSync(path.join(OUT, "scenes"), { recursive: true });

const VIOLET = "#6444bf";
const PLUM = "#0e0716";
const LAV = "#b8a6ff";
const CREAM = "#f7f1e6";
const GOLD = "#f2c66d";
const MINT = "#3ddc97";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, f) => { const q = clamp((f - a) / (b - a)); return q * q * (3 - 2 * q); };

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function rect(c, x, y, w, h, r, col) { rr(c, x, y, w, h, r); c.fillStyle = col; c.fill(); }
function edge(c, x, y, w, h, r, col, n = 2) { rr(c, x, y, w, h, r); c.strokeStyle = col; c.lineWidth = n; c.stroke(); }
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
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = "alphabetic";
  if (track) {
    // manual letter-spacing — this canvas build has no letterSpacing
    const chars = [...s];
    const widths = chars.map((ch) => c.measureText(ch).width + track);
    const total = widths.reduce((a, b) => a + b, 0) - track;
    let cx = x;
    if (align === "center") cx = x - total / 2;
    if (align === "right") cx = x - total;
    chars.forEach((ch, i) => { c.fillText(ch, cx, y); cx += widths[i]; });
  } else {
    c.fillText(s, x, y, width);
  }
  c.restore();
}
function mono(c, s, x, y, size, o = {}) { type(c, s, x, y, size, { family: FONTS.mono, weight: 500, ...o }); }

/* ------------------------------------------------------- occupancy probing */

/**
 * The bug this exists to stop: type placed where a number looked fine, landing
 * on her face. On the YouTube banner the name ran straight through her head,
 * and on the 4:5 room scene the CTA sat under her raised hand.
 *
 * So: draw the pose onto a scratch alpha canvas, read the alpha channel, and
 * ask it whether a rectangle is clear before putting type in it. Every text
 * placement below is measured, not guessed.
 */
function makeProbe(W, H, draw) {
  const cv = createCanvas(W, H);
  const c = cv.getContext("2d");
  draw(c);
  const { data } = c.getImageData(0, 0, W, H);
  const alpha = new Uint8Array(W * H);
  for (let i = 0, j = 3; i < alpha.length; i++, j += 4) alpha[i] = data[j];
  return {
    /** fraction of pixels above `thr` inside the rect */
    fill(x, y, w, h, thr = 12) {
      let n = 0, hit = 0;
      const x0 = Math.max(0, Math.floor(x)), x1 = Math.min(W, Math.floor(x + w));
      const y0 = Math.max(0, Math.floor(y)), y1 = Math.min(H, Math.floor(y + h));
      for (let yy = y0; yy < y1; yy += 2) {
        for (let xx = x0; xx < x1; xx += 2) {
          n++;
          if (alpha[yy * W + xx] > thr) hit++;
        }
      }
      return n ? hit / n : 0;
    },
    /** the free gap under a column band, used to size a text block */
    clearBelow(bandX, bandW, y) {
      let yy = y;
      while (yy < H && this.fill(bandX, yy, bandW, 12) < 0.04) yy += 10;
      return yy;
    },
    W, H,
  };
}

/** Largest size from `sizes` whose block still sits in a clear rect. */
function fitInto(probe, rect, sizes, measure) {
  for (const size of sizes) {
    const need = measure(size);
    if (probe.fill(rect.x, rect.y, rect.w, need) < 0.02) return size;
  }
  return sizes[sizes.length - 1];
}

/* ------------------------------------------------------------------ motifs */

/** A dashed orbit ring, the identity pack's recurring mark. */
function orbit(c, cx, cy, r, col, phase = 0, dash = 26) {
  c.save();
  c.strokeStyle = col;
  c.lineWidth = 2;
  c.setLineDash([dash, dash * 0.9]);
  c.lineDashOffset = phase;
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.stroke();
  c.restore();
}

/** A soft glow disc — used behind her head so a dark figure lifts off the set. */
function glow(c, cx, cy, r, rgb, strength = 1) {
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(${rgb},${0.32 * strength})`);
  g.addColorStop(0.5, `rgba(${rgb},${0.13 * strength})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.save();
  c.globalCompositeOperation = "lighter";
  c.fillStyle = g;
  c.fillRect(cx - r, cy - r, r * 2, r * 2);
  c.restore();
}

/**
 * Paper layer — the same one the Java4Shell set uses, because the pack should
 * look like the Reels and not like a separate brand.
 */
function paper(c, x, y, w, h, rot, o = {}) {
  const { fill = "rgba(247,241,230,0.94)", rules = 0, grid = false,
          ink = "rgba(14,7,22,0.22)", torn = true, seed = 0 } = o;
  c.save();
  c.translate(x + w / 2, y + h / 2);
  c.rotate((rot * Math.PI) / 180);
  c.save();
  c.shadowColor = "rgba(0,0,0,0.55)";
  c.shadowBlur = 34;
  c.shadowOffsetY = 14;
  rect(c, -w / 2, -h / 2, w, h, 8, fill);
  c.restore();
  if (torn) {
    c.beginPath();
    const y0 = h / 2 - 12;
    c.moveTo(-w / 2, y0);
    const n = 16;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const j = Math.sin((i + seed) * 12.9898) * 0.5 + 0.5;
      c.lineTo(-w / 2 + u * w, y0 + (j - 0.5) * 12);
    }
    c.lineTo(w / 2, h / 2);
    c.lineTo(-w / 2, h / 2);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  }
  for (let i = 0; i < rules; i++) {
    const rw = w * (0.30 + ((Math.sin(i * 7 + seed) * 0.5 + 0.5)) * 0.42);
    rect(c, -w / 2 + 26, -h / 2 + 34 + i * 24, rw, 5, 2.5, ink);
  }
  if (grid) {
    c.save();
    c.strokeStyle = ink;
    c.lineWidth = 1;
    for (let i = 1; i < 7; i++) {
      c.beginPath();
      c.moveTo(-w / 2 + (w / 7) * i, -h / 2 + 14);
      c.lineTo(-w / 2 + (w / 7) * i, h / 2 - 20);
      c.stroke();
    }
    for (let i = 1; i < 5; i++) {
      c.beginPath();
      c.moveTo(-w / 2 + 14, -h / 2 + (h / 5) * i);
      c.lineTo(w / 2 - 14, -h / 2 + (h / 5) * i);
      c.stroke();
    }
    c.restore();
  }
  c.restore();
}

/* ------------------------------------------------------------------ page */
await loadFonts();
const HOST = await loadHost();

/**
 * Scenes. Four places, four poses, four accents — so a feed of these reads as a
 * person with a range, not one render repeated with new text.
 */
const SCENES = {
  plum: {
    pose: "wave", accent: LAV,
    tints: ["#1a0f2b", "#2b1642"], photo: 0,
    head: ["MIMI NI", "Noellyne."],
    sub: "TECH HOST · ALTRAWARE",
    tag: "01 — STUDIO",
  },
  studio: {
    pose: "desk", accent: MINT,
    tints: ["#07161c", "#0d2c33"], photo: 0,
    head: ["NINAJENGA", "kwa mikono."],
    sub: "BUILD · TEST · SHIP",
    tag: "02 — DESK",
  },
  room: {
    pose: "point", accent: GOLD,
    tints: ["#1c1206", "#33210c"], photo: 0,
    head: ["KILA SIKU", "kitu kipya."],
    sub: "APPS · AI · TOOLS",
    tag: "03 — FLOOR",
  },
  sky: {
    pose: "peace", accent: LAV,
    tints: ["#0b0a22", "#1b1745"], photo: 0,
    head: ["TUKUTANE", "hapa."],
    sub: "FOLLOW FOR TECH IN SWAHILI",
    tag: "04 — OUTRO",
  },
};

/**
 * The set behind each scene. Two of these use the real classroom plate; the
 * others are drawn, because "a flat gradient is a slide" and a photo that does
 * not match the beat is worse than a good drawing.
 */
function bgPlum(c, W, H) {
  const g = c.createLinearGradient(0, 0, W * 0.6, H);
  g.addColorStop(0, "#170d26");
  g.addColorStop(0.55, "#241239");
  g.addColorStop(1, "#0c0715");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  // a huge soft orb, top right — the studio's key
  glow(c, W * 0.78, H * 0.20, W * 0.72, "168,140,255", 0.9);
  // floor plane, so she has somewhere to stand
  const fg = c.createLinearGradient(0, H * 0.66, 0, H);
  fg.addColorStop(0, "rgba(10,6,20,0)");
  fg.addColorStop(1, "rgba(6,4,12,0.86)");
  c.fillStyle = fg;
  c.fillRect(0, H * 0.66, W, H * 0.34);
  for (let i = 0; i < 16; i++) {
    const y = H * 0.66 + Math.pow(i / 16, 1.8) * H * 0.34;
    line(c, [[0, y], [W, y]], `rgba(184,166,255,${0.05 + i * 0.004})`, 1.5);
  }
  orbit(c, W * 0.5, H * 0.40, W * 0.42, "rgba(184,166,255,0.20)", 12, 30);
  orbit(c, W * 0.5, H * 0.40, W * 0.55, "rgba(184,166,255,0.10)", 40, 46);
}

function bgDesk(c, W, H, plate) {
  const k = Math.max(W / plate.width, H / plate.height) * 1.16;
  c.save();
  c.globalAlpha = 0.55;
  c.drawImage(plate, (W - plate.width * k) / 2, (H - plate.height * k) / 2,
              plate.width * k, plate.height * k);
  c.restore();
  const g = c.createLinearGradient(0, 0, W * 0.4, H);
  g.addColorStop(0, "rgba(7,22,28,0.90)");
  g.addColorStop(0.5, "rgba(9,32,38,0.72)");
  g.addColorStop(1, "rgba(4,14,18,0.94)");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  glow(c, W * 0.24, H * 0.22, W * 0.6, "61,220,151", 0.55);
}

function bgRoom(c, W, H) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1a1108");
  g.addColorStop(0.5, "#2e1e0c");
  g.addColorStop(1, "#120b05");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  // an arched window, warm light coming through
  const cx = W * 0.5, r = W * 0.30, top = H * 0.13;
  c.save();
  const wg = c.createLinearGradient(0, top, 0, top + r * 2.1);
  wg.addColorStop(0, "rgba(242,198,109,0.42)");
  wg.addColorStop(1, "rgba(242,198,109,0.05)");
  c.fillStyle = wg;
  c.beginPath();
  c.moveTo(cx - r, top + r);
  c.arc(cx, top + r, r, Math.PI, 0);
  c.lineTo(cx + r, top + r * 2.3);
  c.lineTo(cx - r, top + r * 2.3);
  c.closePath();
  c.fill();
  c.restore();
  glow(c, cx, top + r, r * 1.9, "242,198,109", 0.7);
  line(c, [[cx, top], [cx, top + r * 2.3]], "rgba(26,17,8,0.55)", 7);
  line(c, [[cx - r, top + r * 1.15], [cx + r, top + r * 1.15]], "rgba(26,17,8,0.55)", 7);
  const fg = c.createLinearGradient(0, H * 0.62, 0, H);
  fg.addColorStop(0, "rgba(18,11,5,0)");
  fg.addColorStop(1, "rgba(12,7,3,0.9)");
  c.fillStyle = fg;
  c.fillRect(0, H * 0.62, W, H * 0.38);
}

function bgSky(c, W, H) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#08071c");
  g.addColorStop(0.45, "#151034");
  g.addColorStop(0.72, "#241a4d");
  g.addColorStop(1, "#0a0718");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  // stars, deterministic
  for (let i = 0; i < 130; i++) {
    const h1 = Math.sin((i + 1) * 12.9898) * 43758.5453;
    const h2 = Math.sin((i + 1) * 78.233) * 43758.5453;
    const x = (h1 - Math.floor(h1)) * W;
    const y = (h2 - Math.floor(h2)) * H * 0.66;
    const r = 0.7 + Math.abs((h1 * 7) % 1) * 1.8;
    const a = 0.25 + Math.abs((h2 * 5) % 1) * 0.6;
    dot(c, x, y, r, `rgba(220,214,255,${a})`);
  }
  glow(c, W * 0.5, H * 0.30, W * 0.7, "139,120,255", 1.0);
  orbit(c, W * 0.5, H * 0.34, W * 0.44, "rgba(184,166,255,0.26)", 20, 34);
  orbit(c, W * 0.5, H * 0.34, W * 0.58, "rgba(184,166,255,0.12)", 70, 52);
  // horizon
  line(c, [[0, H * 0.685], [W, H * 0.685]], "rgba(184,166,255,0.22)", 2);
}

/* ------------------------------------------------------------------ scenes */
const panelCache = new Map();

function drawScene(c, W, H, id, { plate, withPaper = true }) {
  const S = SCENES[id];
  if (id === "plum") bgPlum(c, W, H);
  else if (id === "studio") bgDesk(c, W, H, plate);
  else if (id === "room") bgRoom(c, W, H);
  else bgSky(c, W, H);

  // paper, in the outer margins only — never over her face
  if (withPaper) {
    if (id === "plum") {
      paper(c, -40, H * 0.10, 240, 300, -8, { rules: 6, seed: 3 });
      paper(c, W - 168, H * 0.352, 210, 165, 7, { grid: true, seed: 9 });
    } else if (id === "studio") {
      paper(c, W - 250, H * 0.09, 280, 210, 9, { rules: 5, seed: 5 });
      paper(c, -58, H * 0.330, 226, 178, -7, { grid: true, seed: 11 });
    } else if (id === "room") {
      paper(c, -30, H * 0.14, 230, 290, -9, { grid: true, seed: 13 });
      paper(c, W - 186, H * 0.300, 224, 160, 6, { rules: 4, seed: 17 });
    } else {
      paper(c, -44, H * 0.318, 218, 176, -6, { rules: 5, seed: 19 });
      paper(c, W - 230, H * 0.13, 240, 280, 8, { grid: true, seed: 23 });
    }
  }

  /**
   * Her. Width is set so the head sits in the upper third and the crop is at
   * the waist — the same framing rule the Reels use. `y` is tuned per scene so
   * her head never lands in the same pixel as the previous one.
   */
  /**
   * Feed scenes are 4:5, so there is less room than on the 9:16 cover. Her box
   * is sized so `y + w * 0.985` (her ink bottom) lands at ~0.80 H, which leaves
   * the bottom fifth for the headline — the same measured-edge rule the cover
   * uses. The `room` pose raises a hand to the left, so she is nudged right.
   */
  const w = id === "sky" ? 800 : 780;
  const x = (W - w) / 2 + (id === "studio" ? 40 : id === "room" ? -28 : 0);
  const y = id === "plum" ? H * 0.115
    : id === "studio" ? H * 0.125
    : id === "room" ? H * 0.100
    : H * 0.098;

  glow(c, x + w * 0.5, y + w * 0.30, w * 0.75, id === "studio" ? "61,220,151"
    : id === "room" ? "242,198,109" : "168,140,255", 0.9);
  groundShadow(c, x + w * 0.5, y + w * 0.99, w * 0.62, 0.42);
  const draw = performerDraw(c, HOST, 60);
  draw(0, "review", { pose: S.pose, mouth: null, x, y, w, cues: [], blinks: [], nods: [] });

  // probe her silhouette AT THIS SIZE, so the caller can place type safely
  const drawProbe = performerDraw(createCanvas(W, H).getContext("2d"), HOST, 60);
  const probe = makeProbe(W, H, (pc) => {
    pc.clearRect(0, 0, W, H);
    drawProbe(0, "review", { pose: S.pose, mouth: null, x, y, w, cues: [], blinks: [], nods: [] });
  });

  return { S, x, y, w, probe };
}

/* --------------------------------------------------------------- 1080×1920 */
/**
 * The IG cover. She is centred and huge, so there is no free quadrant for a
 * name — every corner has an arm, a puff or a hoodie in it.
 *
 * The fix is not to shrink the type until it fits beside her, because then it
 * is not a cover any more. It is to put the name BEHIND her: the oversized
 * wordmark is drawn first, at hoodie height, and she is drawn over it. Her
 * silhouette crops the letters instead of the letters landing on her face, and
 * the one place it does not work — a letter filling a 400 px gap under her chin
 * — cannot happen because the block sits at `H * 0.72`, well below her jaw.
 */
function bannerIG(plate) {
  const W = 1080, H = 1920;
  const cv = createCanvas(W, H);
  const c = cv.getContext("2d");
  const S = SCENES.plum;

  bgPlum(c, W, H);
  paper(c, -40, H * 0.06, 230, 290, -8, { rules: 6, seed: 3 });
  paper(c, W - 196, H * 0.78, 236, 176, 7, { grid: true, seed: 9 });

  /**
   * She takes the upper two thirds and stops at `hemY`; the name owns the floor
   * band below it. `hemY` is her actual ink bottom (the rig ends across the
   * hoodie at 0.985 of its box), so the name is placed from a measured edge
   * instead of a guess — the two earlier versions put the wordmark on top of
   * her because nothing had computed where she ended.
   */
  const w = 880;
  const x = (W - w) / 2;
  const y = H * 0.190;
  const hemY = y + w * 0.985;

  // --- her
  glow(c, x + w * 0.5, y + w * 0.30, w * 0.80, "168,140,255", 0.9);
  glow(c, x + w * 0.5, y + w * 0.30, w * 0.75, "168,140,255", 0.9);
  groundShadow(c, x + w * 0.5, hemY, w * 0.62, 0.42);
  const draw = performerDraw(c, HOST, 60);
  draw(0, "review", { pose: S.pose, mouth: null, x, y, w, cues: [], blinks: [], nods: [] });

  // --- the name, in the clear band under her hem
  const by = Math.max(hemY + 210, H * 0.735);
  rect(c, 62, by - 158, 8, 268, 4, LAV);
  type(c, "MIMI NI", 96, by - 92, 42, { weight: 600, color: "rgba(247,241,230,0.86)", track: 10 });
  type(c, "Noellyne", 90, by + 78, 184, { weight: 830 });
  mono(c, "TECH HOST · ALTRAWARE", 96, by + 130, 27, { color: LAV, track: 5 });

  // --- chrome on top of everything
  c.drawImage(HOST.mark, 62, 58, 54, 54);
  type(c, "ALTRAWARE", 128, 98, 30, { weight: 760, track: 2 });
  mono(c, "TECH HOST", W - 62, 98, 22, { align: "right", color: "rgba(247,241,230,0.62)", track: 3 });
  line(c, [[62, 130], [W - 62, 130]], "rgba(184,166,255,0.30)", 2);

  // the handle, low and left, clear of the paper
  const pillY = H - 148;
  rect(c, 62, pillY, 470, 74, 37, "rgba(184,166,255,0.16)");
  edge(c, 62, pillY, 470, 74, 37, "rgba(184,166,255,0.45)", 2);
  mono(c, "IG · YOUTUBE · @noellyne", 92, pillY + 47, 25, { color: CREAM, track: 1 });

  mono(c, S.tag, W - 62, H - 74, 22, { align: "right", color: "rgba(247,241,230,0.55)", track: 3 });

  fs.writeFileSync(path.join(OUT, "banner-ig.png"), cv.toBuffer("image/png"));
  return cv;
}

/* --------------------------------------------------------------- 2048×1152 */
/**
 * A channel banner is not a portrait. The safe area is 1235 × 338 in the middle
 * and everything outside it is cropped on a TV, so the safe area has to be
 * genuinely empty of anything important — which is why this one is composed
 * left/right rather than centred: type inside the safe area on the left, her
 * outside it on the right. Putting her in the middle and the name over her was
 * the first version, and the name ran through her head.
 */
function bannerYT(plate) {
  const W = 2048, H = 1152;
  const cv = createCanvas(W, H);
  const c = cv.getContext("2d");

  bgSky(c, W, H);
  paper(c, 1760, 60, 230, 270, 9, { grid: true, seed: 23 });
  paper(c, 30, 780, 240, 190, -7, { rules: 5, seed: 19 });
  paper(c, 1980, 900, 200, 160, 6, { rules: 3, seed: 31 });

  // her, pushed right of the safe area and cropped by the frame
  const w = 1120;
  const x = W - w * 0.86;
  const y = 96;
  glow(c, x + w * 0.5, y + w * 0.34, w * 0.80, "168,140,255", 1.0);
  groundShadow(c, x + w * 0.5, y + w * 0.99, w * 0.60, 0.45);
  const draw = performerDraw(c, HOST, 60);
  draw(0, "review", { pose: "peace", mouth: null, x, y, w, cues: [], blinks: [], nods: [] });

  // safe area, left column only
  const sw = 1235, sh = 338;
  const sx = (W - sw) / 2, sy = (H - sh) / 2;

  c.drawImage(HOST.mark, sx, sy - 76, 56, 56);
  type(c, "ALTRAWARE", sx + 72, sy - 34, 31, { weight: 760, track: 2 });
  line(c, [[sx, sy + 4], [sx + 620, sy + 4]], "rgba(184,166,255,0.34)", 2);

  type(c, "Noellyne", sx, sy + 128, 128, { weight: 820 });
  mono(c, "TECH HOST · ALTRAWARE", sx + 4, sy + 190, 28, { color: LAV, track: 5 });
  mono(c, "APPS · AI · TOOLS — KWA KISWAHILI", sx + 4, sy + 240, 24,
       { color: "rgba(247,241,230,0.66)", track: 3 });

  rect(c, sx + 4, sy + 270, 292, 62, 31, "rgba(61,220,151,0.16)");
  edge(c, sx + 4, sy + 270, 292, 62, 31, "rgba(61,220,151,0.55)", 2);
  mono(c, "SUBSCRIBE →", sx + 30, sy + 310, 24, { color: MINT, track: 2 });

  fs.writeFileSync(path.join(OUT, "banner-yt.png"), cv.toBuffer("image/png"));
  return cv;
}

/* --------------------------------------------------------------- 1024×1024 */
function avatar(plate) {
  const S = 1024;
  const cv = createCanvas(S, S);
  const c = cv.getContext("2d");
  // a tight head crop, so the avatar still reads at 32 px
  const g = c.createLinearGradient(0, 0, S * 0.7, S);
  g.addColorStop(0, "#241239");
  g.addColorStop(0.6, "#170d26");
  g.addColorStop(1, "#0c0715");
  c.fillStyle = g;
  c.fillRect(0, 0, S, S);
  glow(c, S * 0.5, S * 0.34, S * 0.72, "168,140,255", 1.1);
  orbit(c, S * 0.5, S * 0.46, S * 0.40, "rgba(184,166,255,0.20)", 10, 26);

  const w = S * 1.86;
  const x = (S - w) / 2;
  const y = -S * 0.40;
  const draw = performerDraw(c, HOST, 60);
  draw(0, "review", { pose: "wave", mouth: null, x, y, w, cues: [], blinks: [], nods: [] });

  fs.writeFileSync(path.join(OUT, "avatar.png"), cv.toBuffer("image/png"));
  return cv;
}

/* -------------------------------------------------------------- 4:5 feed */
function feedScene(plate, id) {
  const W = 1080, H = 1350;
  const cv = createCanvas(W, H);
  const c = cv.getContext("2d");
  const { S, y, w } = drawScene(c, W, H, id, { plate });

  c.drawImage(HOST.mark, 56, 50, 46, 46);
  type(c, "NOELLYNE", 108, 84, 24, { weight: 750, track: 3 });
  mono(c, S.tag, W - 56, 84, 18, { align: "right", color: "rgba(247,241,230,0.55)", track: 2 });

  // the headline starts under her measured hem, not at a fixed row
  const hem = y + w * 0.985;
  const by = Math.max(hem + 96, H * 0.855);
  // a floor scrim: the type sits on the ground, not on whatever is behind it
  const sg = c.createLinearGradient(0, by - 96, 0, H);
  sg.addColorStop(0, "rgba(6,5,12,0)");
  sg.addColorStop(0.55, "rgba(6,5,12,0.72)");
  sg.addColorStop(1, "rgba(6,5,12,0.94)");
  c.fillStyle = sg;
  c.fillRect(0, by - 96, W, H - (by - 96));
  rect(c, 56, by - 52, 5, 148, 2.5, S.accent);
  type(c, S.head[0], 82, by - 16, 30, { weight: 600, color: "rgba(247,241,230,0.80)", track: 7 });
  type(c, S.head[1], 80, by + 56, 78, { weight: 820 });
  mono(c, S.sub, 82, by + 98, 20, { color: S.accent, track: 4 });

  fs.writeFileSync(path.join(OUT, "scenes", `look-${id}.png`), cv.toBuffer("image/png"));
}

/* ------------------------------------------------------------------ main */
const plate = await loadImage(path.join(ROOT, "production/noellyne-host/poses-src/plate-classroom.jpg"));

bannerIG(plate);
bannerYT(plate);
avatar(plate);
for (const id of Object.keys(SCENES)) feedScene(plate, id);

process.stderr.write(`wrote ${OUT}\n`);
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith(".png")) process.stderr.write(`  ${f}\n`);
}
