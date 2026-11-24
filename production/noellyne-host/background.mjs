/**
 * Sets with depth and life.
 *
 * The note was "background tuu zimetulia sana" — the sets were static wash cards.
 * A flat gradient with a photo at 20% is not a set, it is a slide. This module
 * builds a scene that moves: a plate that parallaxes, a light sweep, drifting
 * dust in the air, and a ground shadow under her feet. All derived from `frame`,
 * so a random seek equals a sequential render.
 */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;

/** Deterministic pseudo-random in [0,1) from an integer. No Math.random anywhere. */
function hash(n) {
  let x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function makeSet(W, H, plate, opts = {}) {
  const {
    photoAlpha = 0.34,
    tint = "#fffdf7",
    tint2 = "#e8eef6",
    parallax = 26,       // px of plate drift across the beat
    sweep = 0.55,        // strength of the light sweep
    dust = 34,           // motes
    vig = 0.24,          // corner darkening
  } = opts;

  // The plate is pre-scaled once; the drift is a translation per frame.
  const k = Math.max(W / plate.width, H / plate.height) * 1.12;
  return function drawSet(ctx, frame, start, end) {
    const p = clamp((frame - start) / Math.max(1, end - start));
    const e = p * p * (3 - 2 * p);

    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, W, H);

    // plate: slow parallax drift and a matching scale, so the set breathes
    ctx.save();
    ctx.globalAlpha = photoAlpha;
    const s = 1.03 + 0.02 * e;
    const dx = lerp(-parallax, parallax, e);
    const dy = lerp(parallax * 0.45, -parallax * 0.45, e);
    ctx.translate(W / 2 + dx, H / 2 + dy);
    ctx.scale(s, s);
    ctx.drawImage(plate, -plate.width * k / 2, -plate.height * k / 2, plate.width * k, plate.height * k);
    ctx.restore();

    // colour wash, heavier at the bottom so type always has ground
    const g = ctx.createLinearGradient(0, 0, W * 0.7, H);
    g.addColorStop(0, tint + "e6");
    g.addColorStop(0.45, tint + "9e");
    g.addColorStop(1, tint2 + "c9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // light sweep: a soft diagonal band that travels once per beat
    if (sweep > 0) {
      const t = ((frame - start) / Math.max(1, end - start)) * 1.35 - 0.15;
      const cxp = lerp(-W * 0.4, W * 1.4, clamp(t));
      const lg = ctx.createLinearGradient(cxp - W * 0.32, 0, cxp + W * 0.32, H * 0.7);
      lg.addColorStop(0, "rgba(255,255,255,0)");
      lg.addColorStop(0.5, `rgba(255,255,255,${0.30 * sweep})`);
      lg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, W, H);
    }

    // dust: a few motes drifting up, each on its own slow cycle
    for (let i = 0; i < dust; i++) {
      const seed = i * 91.7 + 13;
      const x0 = hash(seed) * W;
      const y0 = hash(seed + 1) * H;
      const speed = 0.10 + hash(seed + 2) * 0.22;
      const r = 1.2 + hash(seed + 3) * 2.6;
      const y = ((y0 - (frame - start) * speed) % H + H) % H;
      const x = x0 + Math.sin((frame * 0.01) + hash(seed + 4) * 6.28) * 9;
      ctx.globalAlpha = 0.10 + hash(seed + 5) * 0.16;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // vignette, so the frame has corners instead of edges
    if (vig > 0) {
      const vg = ctx.createRadialGradient(W / 2, H * 0.42, W * 0.22, W / 2, H * 0.42, W * 0.95);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, `rgba(12,24,44,${vig})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }
  };
}

/**
 * Drop shadow that sits under her, so she stands in the set instead of floating
 * on it. `baseY` is where her body meets the ground.
 */
export function groundShadow(ctx, cx, baseY, width, strength = 0.22) {
  const g = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, width * 0.55);
  g.addColorStop(0, `rgba(18,34,58,${strength})`);
  g.addColorStop(0.55, `rgba(18,34,58,${strength * 0.45})`);
  g.addColorStop(1, "rgba(18,34,58,0)");
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.scale(1, 0.22);
  ctx.translate(-cx, -baseY);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, baseY, width * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
