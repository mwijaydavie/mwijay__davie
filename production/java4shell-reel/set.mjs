/**
 * Layer 2 of the Java4Shell set: the desk she stands behind, and the paper
 * layer that lives in front of it.
 *
 * The problem this solves: her rig is half-body, so the PNG simply stops across
 * the hoodie. On the CTA it was obvious — "hana legs". A gradient that fades her
 * into the floor hides the cut but leaves her floating, which is the same defect
 * wearing a hat. A real desk in front does the job properly: it crops her at the
 * waist the way a news desk crops a presenter, and then it can be dressed.
 *
 * Everything here is derived from `frame` only. No random, no clock.
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const smooth = (a, b, f) => { const q = clamp((f - a) / (b - a)); return q * q * (3 - 2 * q); };

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function rect(c, x, y, w, h, r, col) { rr(c, x, y, w, h, r); c.fillStyle = col; c.fill(); }
function edge(c, x, y, w, h, r, col, n = 2) {
  rr(c, x, y, w, h, r); c.strokeStyle = col; c.lineWidth = n; c.stroke();
}
function line(c, pts, col, px = 2) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
  c.strokeStyle = col; c.lineWidth = px; c.lineCap = "round"; c.stroke();
}
function dot(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); }

/* Deterministic hash — a paper sheet must be identical on a seek. */
function hash(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/* --------------------------------------------------------------- the desk */

/**
 * The console, in two passes.
 *
 * Pass one (`drawDeskBack`) puts the whole plate down before her, so the
 * monitors and the back of the surface are behind her head.
 *
 * Pass two (`drawDeskFront`) redraws only the surface from the lip downward,
 * AFTER her. That is what crops her at the waist. Drawing the desk once, in
 * front, would bury her; drawing it once behind would leave her standing in
 * mid-air with no legs — the exact note this fixes.
 *
 * Geometry is defined in plate terms so the surface always lands where it is
 * asked to: the console surface occupies plate rows 0.52 → 0.735, and its dark
 * apron runs from 0.735 to the bottom of the plate.
 */
const SURF_IN = 0.520;   // top edge of the desk surface, as a fraction of the plate
const SURF_OUT = 0.735;  // the amber lip

function plateGeom(img, W, surfaceY, driftPx) {
  const dw = W * 1.26;
  const dh = dw * (img.height / img.width);
  const y = surfaceY - dh * SURF_IN;
  return { x: (W - dw) / 2 + driftPx, y, w: dw, h: dh };
}

export function drawDeskBack(ctx, img, W, H, f, start, end, opts = {}) {
  const { surfaceY = 1420, drift = 10, key = 0 } = opts;
  const p = clamp((f - start) / Math.max(1, end - start));
  const e = p * p * (3 - 2 * p);
  const dx = lerp(-drift, drift, e) + key;
  const g = plateGeom(img, W, surfaceY, dx);
  ctx.save();
  ctx.globalAlpha = 0.97;
  ctx.drawImage(img, g.x, g.y, g.w, g.h);
  ctx.restore();
  return g;
}

export function drawDeskFront(ctx, img, W, H, f, start, end, opts = {}) {
  const { surfaceY = 1420, drift = 10, key = 0, glow = 0.5 } = opts;
  const p = clamp((f - start) / Math.max(1, end - start));
  const e = p * p * (3 - 2 * p);
  const dx = lerp(-drift, drift, e) + key;
  const g = plateGeom(img, W, surfaceY, dx);

  const lip = surfaceY + g.h * (SURF_OUT - SURF_IN);
  const sx = 0, sw = img.width;
  const sy = img.height * SURF_OUT;
  const sh = img.height * (1 - SURF_OUT);

  // the apron: the front face of the desk, drawn over her
  ctx.save();
  ctx.drawImage(img, sx, sy, sw, sh, g.x, lip, g.w, g.h * (1 - SURF_OUT));
  ctx.restore();

  // a hard shadow where her body meets the desk, so she is behind it
  const sg = ctx.createLinearGradient(0, lip - 26, 0, lip + 10);
  sg.addColorStop(0, "rgba(4,9,14,0)");
  sg.addColorStop(1, "rgba(4,9,14,0.85)");
  ctx.fillStyle = sg;
  ctx.fillRect(0, lip - 26, W, 36);

  // the amber lip, brighter than the plate's own, driven by `glow`
  const lg = ctx.createLinearGradient(0, lip - 14, 0, lip + 16);
  lg.addColorStop(0, "rgba(255,181,69,0)");
  lg.addColorStop(0.5, `rgba(255,181,69,${0.34 * glow})`);
  lg.addColorStop(1, "rgba(255,181,69,0)");
  ctx.fillStyle = lg;
  ctx.fillRect(0, lip - 14, W, 30);

  return { lip, g };
}

/* -------------------------------------------------------------- the paper */

/**
 * Paper cutouts: torn-ish sheets with a hairline and a drop shadow, pinned at
 * slight angles around the card. They are what makes the frame feel built
 * rather than laid out, and they give the desk something to be sitting on.
 *
 * Each sheet carries `delay` so they can land one after another instead of
 * appearing as a group — staggered arrivals are most of what "motion graphics"
 * means at this scale.
 */
export function drawPaper(ctx, sheets, f, start) {
  for (const s of sheets) {
    const t = smooth(start + s.delay, start + s.delay + 22, f);
    if (t <= 0.001) continue;
    ctx.save();
    ctx.globalAlpha = (s.alpha ?? 0.9) * t;
    ctx.translate(s.x + s.w / 2, s.y + s.h / 2 + (1 - t) * 26);
    ctx.rotate(((s.rot ?? 0) * Math.PI) / 180);
    // shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 10;
    rect(ctx, -s.w / 2, -s.h / 2, s.w, s.h, s.r ?? 6, s.fill ?? "rgba(238,244,251,0.94)");
    ctx.restore();
    // a torn edge along the bottom: a shallow deterministic zigzag
    if (s.torn) {
      ctx.beginPath();
      const y0 = s.h / 2 - 10;
      ctx.moveTo(-s.w / 2, y0);
      const n = 14;
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        ctx.lineTo(-s.w / 2 + u * s.w, y0 + (hash(i + (s.seed ?? 0)) - 0.5) * 9);
      }
      ctx.lineTo(s.w / 2, s.h / 2);
      ctx.lineTo(-s.w / 2, s.h / 2);
      ctx.closePath();
      ctx.fillStyle = s.fill ?? "rgba(238,244,251,0.94)";
      ctx.fill();
    }
    // a rule or two of fake handwriting, so it reads as a note and not a card
    if (s.rules) {
      for (let i = 0; i < s.rules; i++) {
        const rw = s.w * (0.34 + hash(i * 7 + (s.seed ?? 0)) * 0.4);
        rect(ctx, -s.w / 2 + 20, -s.h / 2 + 26 + i * 20, rw, 4, 2,
             s.ink ?? "rgba(19,34,52,0.30)");
      }
    }
    if (s.grid) {
      ctx.save();
      ctx.strokeStyle = s.ink ?? "rgba(19,34,52,0.14)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(-s.w / 2 + (s.w / 6) * i, -s.h / 2 + 10);
        ctx.lineTo(-s.w / 2 + (s.w / 6) * i, s.h / 2 - 10);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }
}

/**
 * A tab / label stuck on the desk, like a sticker. Slightly rotated, with the
 * accent colour the beat is speaking in.
 */
export function drawSticker(ctx, f, start, o) {
  const t = smooth(start + o.delay, start + o.delay + 18, f);
  if (t <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = t;
  ctx.translate(o.x, o.y + (1 - t) * 14);
  ctx.rotate(((o.rot ?? 0) * Math.PI) / 180);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 7;
  rect(ctx, -o.w / 2, -o.h / 2, o.w, o.h, o.h / 2, o.col);
  ctx.restore();
  rect(ctx, -o.w / 2 + 2, -o.h / 2 + 2, o.w - 4, o.h - 4, o.h / 2 - 2, "rgba(0,0,0,0.06)");
  ctx.restore();
}

/* ------------------------------------------------------- motion graphics */

/**
 * A single data pulse travelling along the desk lip. This is the "smarter
 * motion" layer: something in the frame is always moving in a way that means
 * something, rather than everything drifting equally. `speed` is cycles per
 * beat, so it never accelerates between beats.
 */
export function drawPulse(ctx, W, y, f, start, end, opts = {}) {
  const { col = "rgba(61,220,151,0.9)", speed = 1.6, w = 220, h = 3 } = opts;
  const p = clamp((f - start) / Math.max(1, end - start));
  const x = lerp(-w, W + w, (p * speed) % 1);
  const g = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.5, col);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.restore();
}

/**
 * A thin technical frame around the artifact band: corner brackets, a scale
 * tick row, and a slowly counting label. Reads as engineering, not decoration.
 */
export function drawTechnicalFrame(ctx, f, start, o) {
  const { x, y, w, h, col = "rgba(143,163,184,0.34)", ticks = 12, label } = o;
  const t = smooth(start, start + 22, f);
  if (t <= 0.001) return;
  const arm = 26 * t;
  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  const corners = [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]];
  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + arm * sy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + arm * sx, cy);
    ctx.stroke();
  }
  // scale ticks along the top edge
  for (let i = 0; i < ticks; i++) {
    const tx = x + 40 + ((w - 80) / (ticks - 1)) * i;
    const tall = i % 3 === 0;
    ctx.beginPath();
    ctx.moveTo(tx, y - (tall ? 12 : 7) * t);
    ctx.lineTo(tx, y - 2);
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (label) {
    ctx.font = "500 17px 'LimsMono', monospace";
    ctx.fillStyle = "rgba(143,163,184,0.75)";
    ctx.textAlign = "left";
    ctx.fillText(label, x + 4, y - 22);
  }
  ctx.restore();
}

/**
 * A soft spotlight behind her head, so she separates from a dark plate. Without
 * it a dark hoodie on a dark room is one shape.
 */
export function drawKeyLight(ctx, cx, cy, r, strength = 0.5) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(120,170,220,${0.16 * strength})`);
  g.addColorStop(0.55, `rgba(90,140,190,${0.07 * strength})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}
