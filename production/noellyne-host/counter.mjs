/**
 * Foreground counter — the "no legs / sharp ends" fix (owner, 2026-11-24).
 *
 * Her full-figure poses are half-body cutouts that end at the waist with a
 * hard horizontal line. Lowering her or fading the edge looked wrong, so the
 * set gets a piece of furniture in front of her: an original drawn café
 * counter — walnut slab, brand inlay, brass foot rail, and scene-appropriate
 * props on the surface (chalkboard special, espresso cups, order slips…).
 * It hides the cut, grounds her in the set, and it is OURS: drawn with the
 * canvas, no tracing, no borrowed renders.
 *
 * Pre-rendered once per (theme, props) combo and cached. Draw AFTER she is
 * drawn, before the cut flash. Deterministic — no randomness, no clock.
 */
import { createCanvas } from "@napi-rs/canvas";

const W = 1080, H = 1920;
export const COUNTER_TOP_Y = 1700;
const SLAB_H = 34;
const FRONT_Y = COUNTER_TOP_Y + SLAB_H; // 1734

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function vgrad(c, x, y, w, h, stops) {
  const g = c.createLinearGradient(x, y, x, y + h);
  for (const [p, col] of stops) g.addColorStop(p, col);
  return g;
}
function hgrad(c, x, y, w, h, stops) {
  const g = c.createLinearGradient(x, y, x + w, y);
  for (const [p, col] of stops) g.addColorStop(p, col);
  return g;
}

const THEMES = {
  walnut: {
    slabHi: "#553A2A", slabLo: "#3A2416", lip: "#241610",
    faceHi: "#302116", faceLo: "#1E130C",
    bead: "rgba(255,226,180,0.055)", inlay: "#F0641E", inlayHi: "#FF8A3D", inlayLo: "#B34A10",
    glow: [240, 100, 30], rail: "#D9B36A", railLo: "#8A6A2F",
  },
  espresso: {
    slabHi: "#2E2A26", slabLo: "#1F1B18", lip: "#14110E",
    faceHi: "#241F1B", faceLo: "#15110E",
    bead: "rgba(242,198,109,0.05)", inlay: "#F2C66D", inlayHi: "#FFE29A", inlayLo: "#A67C1F",
    glow: [242, 198, 109], rail: "#C9A24E", railLo: "#6E5424",
  },
};

const cache = new Map();

export function renderCounter(theme = "walnut", props = []) {
  const key = theme + "|" + props.map((p) => p.kind + (p.lines ? p.lines.join("/") : "") + (p.x || 0)).join(",");
  if (cache.has(key)) return cache.get(key);
  const T = THEMES[theme] || THEMES.walnut;
  const cv = createCanvas(W, H);
  const c = cv.getContext("2d");

  // ---------- ambient glow under the slab (the "LED" line) ----------
  const glow = c.createRadialGradient(540, FRONT_Y + 4, 40, 540, FRONT_Y + 4, 720);
  glow.addColorStop(0, `rgba(${T.glow[0]},${T.glow[1]},${T.glow[2]},0.30)`);
  glow.addColorStop(1, `rgba(${T.glow[0]},${T.glow[1]},${T.glow[2]},0)`);
  c.fillStyle = glow;
  c.fillRect(0, FRONT_Y - 10, W, 170);

  // ---------- slab: top face + front lip ----------
  c.fillStyle = vgrad(c, 0, COUNTER_TOP_Y, 0, 18, [[0, T.slabHi], [1, T.slabLo]]);
  c.fillRect(-40, COUNTER_TOP_Y, W + 80, 18);
  c.fillStyle = "rgba(255,228,190,0.30)";
  c.fillRect(-40, COUNTER_TOP_Y, W + 80, 2); // highlight on the working edge
  c.fillStyle = T.lip;
  c.fillRect(-40, COUNTER_TOP_Y + 18, W + 80, SLAB_H - 18);
  c.fillStyle = "rgba(0,0,0,0.35)";
  c.fillRect(-40, COUNTER_TOP_Y + SLAB_H - 1, W + 80, 1);

  // ---------- front face: plank + beadboard grooves ----------
  c.fillStyle = vgrad(c, 0, FRONT_Y, 0, H - FRONT_Y, [[0, T.faceHi], [1, T.faceLo]]);
  c.fillRect(-40, FRONT_Y, W + 80, H - FRONT_Y);
  for (let x = 26; x < W + 40; x += 52) {
    c.fillStyle = "rgba(0,0,0,0.34)";
    c.fillRect(x, FRONT_Y, 3, H - FRONT_Y);
    c.fillStyle = T.bead;
    c.fillRect(x + 4, FRONT_Y, 2, H - FRONT_Y);
  }

  // ---------- brand inlay stripe with soft bloom ----------
  c.fillStyle = hgrad(c, 0, 0, W, 0, [[0, T.inlayLo], [0.5, T.inlayHi], [1, T.inlayLo]]);
  c.globalAlpha = 0.32; c.fillRect(-40, FRONT_Y + 58, W + 80, 26); c.globalAlpha = 1;
  c.fillStyle = hgrad(c, 0, 0, W, 0, [[0, T.inlay], [0.5, T.inlayHi], [1, T.inlay]]);
  c.fillRect(-40, FRONT_Y + 62, W + 80, 12);

  // ---------- brass foot rail + kick plate ----------
  const railG = vgrad(c, 0, FRONT_Y + 126, 0, 7, [[0, T.rail], [0.5, "#F4E0A8"], [1, T.railLo]]);
  c.fillStyle = railG;
  rr(c, -30, FRONT_Y + 126, W + 60, 7, 3.5); c.fill();
  for (const x of [96, 372, 648, 924]) {
    c.fillStyle = vgrad(c, x, FRONT_Y + 126, 9, 34, [[0, T.rail], [1, T.railLo]]);
    c.fillRect(x, FRONT_Y + 126, 9, 34);
  }
  c.fillStyle = "#120B07";
  c.fillRect(-40, H - 14, W + 80, 14);

  // ---------- props on the slab (drawn last, they sit ON it) ----------
  for (const p of props) {
    const dx = p.x || 0;
    if (p.kind === "chalk") drawChalkboard(c, 118 + dx, COUNTER_TOP_Y, p.lines || ["LEO:", "NYAMA CHOMA"]);
    else if (p.kind === "plant") drawPlant(c, 862 + dx, COUNTER_TOP_Y);
    else if (p.kind === "cups") drawCups(c, 660 + dx, COUNTER_TOP_Y);
    else if (p.kind === "receipts") drawReceipts(c, 664 + dx, COUNTER_TOP_Y);
    else if (p.kind === "swatches") drawSwatches(c, 150 + dx, COUNTER_TOP_Y);
  }

  cache.set(key, cv);
  return cv;
}

// ----------------------------------------------------------- props
function shadow(c, x, y, rx, ry, a = 0.32) {
  c.save(); c.globalAlpha = a; c.fillStyle = "#000";
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); c.restore();
}

function drawChalkboard(c, x, baseY, lines) {
  const w = 172, h = 156, y = baseY - h - 4;
  shadow(c, x + w / 2, baseY + 3, w * 0.62, 8, 0.3);
  c.save();
  c.translate(x + w / 2, y + h / 2);
  c.rotate(-0.028);
  rr(c, -w / 2, -h / 2, w, h, 12); c.fillStyle = "#5A3A22"; c.fill();
  rr(c, -w / 2 + 14, -h / 2 + 13, w - 28, h - 26, 7); c.fillStyle = "#232B26"; c.fill();
  c.strokeStyle = "rgba(255,255,255,0.06)"; c.lineWidth = 2;
  rr(c, -w / 2 + 18, -h / 2 + 17, w - 36, h - 34, 5); c.stroke();
  c.fillStyle = "rgba(237,231,211,0.94)";
  c.textAlign = "center"; c.textBaseline = "middle";
  const maxLen = Math.max(...lines.map((l) => l.length));
  const size = Math.min(25, Math.floor((w - 40) / (maxLen * 0.605)));
  c.font = `620 ${size}px 'LimsMono'`;
  const startY = -((lines.length - 1) * (size + 8)) / 2;
  lines.forEach((ln, i) => c.fillText(ln, 0, startY + i * (size + 8)));
  c.restore();
}

function drawPlant(c, x, baseY) {
  shadow(c, x + 46, baseY + 2, 62, 8, 0.3);
  // leaves first (behind rim)
  const cxp = x + 46, cyp = baseY - 56;
  const blades = [
    { tip: [x - 16, baseY - 158], ctrl: [x + 2, baseY - 112], w: 17, col: "#46633C" },
    { tip: [x + 26, baseY - 178], ctrl: [x + 24, baseY - 118], w: 18, col: "#55714A" },
    { tip: [x + 58, baseY - 186], ctrl: [x + 52, baseY - 122], w: 19, col: "#46633C" },
    { tip: [x + 92, baseY - 166], ctrl: [x + 86, baseY - 116], w: 17, col: "#6E8B54" },
    { tip: [x + 122, baseY - 132], ctrl: [x + 110, baseY - 104], w: 15, col: "#55714A" },
    { tip: [x + 6, baseY - 128], ctrl: [x + 16, baseY - 100], w: 14, col: "#6E8B54" },
  ];
  for (const b of blades) {
    c.beginPath();
    c.moveTo(cxp - b.w / 2, cyp + 12);
    c.quadraticCurveTo(b.ctrl[0] - b.w * 0.35, b.ctrl[1], b.tip[0], b.tip[1]);
    c.quadraticCurveTo(b.ctrl[0] + b.w * 0.55, b.ctrl[1], cxp + b.w / 2, cyp + 12);
    c.closePath(); c.fillStyle = b.col; c.fill();
    c.strokeStyle = "rgba(230,240,210,0.18)"; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(cxp, cyp + 8); c.quadraticCurveTo(b.ctrl[0], b.ctrl[1], b.tip[0], b.tip[1]); c.stroke();
  }
  // pot
  c.beginPath();
  c.moveTo(x, baseY - 64); c.lineTo(x + 92, baseY - 64); c.lineTo(x + 74, baseY - 2); c.lineTo(x + 18, baseY - 2); c.closePath();
  c.fillStyle = vgrad(c, x, baseY - 64, 0, 62, [[0, "#B5653A"], [1, "#6E3A20"]]); c.fill();
  c.fillStyle = "#CD7E4E"; c.fillRect(x - 4, baseY - 72, 100, 12);
  c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(x - 4, baseY - 62, 100, 3);
}

function drawCups(c, x, baseY) {
  shadow(c, x + 60, baseY + 2, 118, 7, 0.3);
  // back cup
  c.fillStyle = "#E4DAC6"; rr(c, x + 62, baseY - 32, 46, 22, 6); c.fill();
  c.beginPath(); c.ellipse(x + 85, baseY - 33, 23, 5, 0, 0, Math.PI * 2); c.fillStyle = "#B9AE98"; c.fill();
  // saucer front
  c.beginPath(); c.ellipse(x + 34, baseY - 4, 58, 7, 0, 0, Math.PI * 2); c.fillStyle = "#CFC4AF"; c.fill();
  c.beginPath(); c.ellipse(x + 34, baseY - 6, 38, 4.6, 0, 0, Math.PI * 2); c.fillStyle = "#8F8471"; c.fill();
  // front cup
  c.fillStyle = "#F3EDE0"; rr(c, x + 4, baseY - 44, 60, 38, 9); c.fill();
  c.beginPath(); c.arc(x + 66, baseY - 26, 11, -Math.PI / 2, Math.PI / 2); c.strokeStyle = "#F3EDE0"; c.lineWidth = 6; c.stroke();
  c.beginPath(); c.ellipse(x + 34, baseY - 45, 29, 5, 0, 0, Math.PI * 2); c.fillStyle = "#3A2416"; c.fill();
  // steam — two soft S-curves
  c.strokeStyle = "rgba(255,255,255,0.38)"; c.lineWidth = 3.6; c.lineCap = "round";
  c.beginPath(); c.moveTo(x + 26, baseY - 58); c.bezierCurveTo(x + 14, baseY - 74, x + 38, baseY - 84, x + 26, baseY - 102); c.stroke();
  c.beginPath(); c.moveTo(x + 44, baseY - 58); c.bezierCurveTo(x + 56, baseY - 72, x + 34, baseY - 88, x + 46, baseY - 108); c.stroke();
}

function drawReceipts(c, x, baseY) {
  shadow(c, x + 58, baseY + 2, 84, 6, 0.3);
  const slips = [
    { dx: 0, dy: 26, rot: -0.10, w: 96 },
    { dx: 14, dy: 12, rot: 0.055, w: 96 },
    { dx: 5, dy: 0, rot: -0.025, w: 100 },
  ];
  for (const s of slips) {
    c.save(); c.translate(x + s.dx, baseY - s.dy); c.rotate(s.rot);
    rr(c, -s.w / 2, -13, s.w, 26, 4); c.fillStyle = "#F2EDE0"; c.fill();
    c.strokeStyle = "rgba(0,0,0,0.10)"; c.lineWidth = 1; rr(c, -s.w / 2, -13, s.w, 26, 4); c.stroke();
    c.strokeStyle = "rgba(20,16,12,0.32)"; c.lineWidth = 1.6;
    for (let i = -1; i <= 1; i++) {
      c.beginPath(); c.moveTo(-s.w / 2 + 10, i * 7); c.lineTo(-s.w / 2 + 10 + (28 + ((i + 1) * 13)), i * 7); c.stroke();
    }
    c.restore();
  }
}

function drawSwatches(c, x, baseY) {
  shadow(c, x + 90, baseY + 2, 108, 6, 0.3);
  const cards = [
    { col: "#F0641E", rot: -0.27, dx: -64 },
    { col: "#FBF7EF", rot: 0.02, dx: 0 },
    { col: "#221410", rot: 0.28, dx: 64 },
  ];
  // paint-swatch fan — the brand lives here too
  for (const s of cards) {
    c.save(); c.translate(x + 64 + s.dx, baseY - 4); c.rotate(s.rot);
    rr(c, -29, -84, 58, 84, 7); c.fillStyle = s.col; c.fill();
    if (s.col === "#FBF7EF") { c.strokeStyle = "rgba(0,0,0,0.16)"; c.lineWidth = 1.4; rr(c, -29, -84, 58, 84, 7); c.stroke(); }
    c.fillStyle = s.col === "#221410" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.28)";
    c.fillRect(-17, -16, 34, 3);
    c.restore();
  }
}
