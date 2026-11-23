/**
 * Noellyne host rig — load the real character assets and draw her with gestures.
 *
 * The rig was built for the Altraware Reels and is checked into Git on purpose.
 * An earlier session kept it only on the sandbox disk and it was lost on reset,
 * which is why later versions fell back to cutting up the old intro footage.
 *
 * Nine poses ship with it. `wave` and `point` have a separate hand layer, so the
 * arm is a real gesture and not a crossfade. `desk` (hands clasped at the waist)
 * and `phone` (phone up beside her face) are full figures with the arms baked in
 * — they carry the beats where she should be listening or holding something
 * rather than pointing. Every pose has 8 visemes, a blink and its own offsets.
 * Nothing here invents a new character or a new hand.
 */
import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

export const ROOT = process.cwd();
export const ASSETS = path.join(ROOT, "production/noellyne-host/assets");
export const FONTS = { sans: "LimsSans", mono: "LimsMono", serif: "LimsSerif" };

export async function loadFonts() {
  for (const [file, family] of [
    ["inter-latin-wght-normal.ttf", FONTS.sans],
    ["jetbrains-mono-latin-wght-normal.ttf", FONTS.mono],
    ["fraunces-latin-opsz-italic.ttf", FONTS.serif],
    ["fraunces-latin-opsz-normal.ttf", FONTS.serif],
  ]) {
    const p = path.join(ASSETS, file);
    if (fs.existsSync(p)) GlobalFonts.registerFromPath(p, family);
  }
}

export async function loadHost() {
  const rig = JSON.parse(fs.readFileSync(path.join(ASSETS, "host-rig.json"), "utf8"));
  const layers = {};
  await Promise.all(rig.files.map(async ({ file }) => { layers[file] = await loadImage(path.join(ASSETS, file)); }));
  const mark = await loadImage(path.join(ASSETS, "altraware.png"));
  return { rig, layers, mark };
}

export const DEG = Math.PI / 180;
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (a, b, f) => { const q = clamp((f - a) / (b - a)); return q * q * (3 - 2 * q); };
export const bump = (f, c, w) => 1 - smooth(0, w, Math.abs(f - c));
export const lerp = (a, b, p) => a + (b - a) * p;

// Gesture profiles, kept identical in feel to the approved Altraware performer.
const STYLES = {
  wave:    { len: 62, move: (u) => [14 * Math.sin(u * 5.1 * Math.PI), -13 * Math.sin(u * Math.PI), -2.4 * Math.sin(u * 3.1)] },
  present: { len: 88, move: (u) => [-23 * Math.sin(u * Math.PI), -11 * Math.sin(u * Math.PI), 2.3 * Math.sin(u * 2.7)] },
  point:   { len: 96, move: (u) => [29 * Math.sin(u * Math.PI), -11 * Math.sin(u * Math.PI), -3.4 * Math.sin(u * Math.PI)] },
  aim:     { len: 68, move: (u) => [19 * Math.sin(u * 2.3) + 7 * Math.sin(u * 8), -8 * Math.sin(u * Math.PI), -2.4 * Math.sin(u * 3.4)] },
  accent:  { len: 42, move: (u) => [-15 * Math.sin(u * Math.PI) + 5 * Math.sin(u * 6.7), -7 * Math.sin(u * Math.PI), 1.8 * Math.sin(u * Math.PI)] },
};

export function performerDraw(c, host, fps) {
  const { rig, layers, mark } = host;
  return function draw(f, mode, { pose = "wave", x = 0, y = 0, w, cues = [], blinks = [], nods = [], mouth = null }) {
    const p = rig.poses[pose];
    if (!p) throw new Error(`unknown pose "${pose}" — have ${Object.keys(rig.poses).join(", ")}`);
    const k = w / rig.width;
    const t = f / fps;
    let angle = pose === "wave" ? -4 : 8, lift = 0, body = 0;
    for (const { kind, start, len, amount = 1 } of cues) {
      const s = STYLES[kind] || STYLES.accent, d = len ?? s.len, u = (f - start) / d;
      if (u <= 0 || u >= 1) continue;
      const e = smooth(0, 0.17, u) * (1 - smooth(0.77, 1, u)) * amount;
      const [a, b, h] = s.move(u);
      angle += a * e; lift += b * e; body += h * e;
    }
    const head = nods.reduce((s, n) => s + bump(f, n, 29), 0);
    const roll = (body + 1.15 * Math.sin(t * 2.4) + head * 2.6) * DEG;
    y += lift + 3.8 * Math.sin(t * 2.88) + 6.8 * head;
    x += 2.4 * Math.cos(t * 2.67);
    const hand = (Math.max(-31, Math.min(47, angle)) + Math.sin(t * 3.6) * 1.8) * DEG;
    const ox = rig.width * 0.53, oy = rig.height * 0.64;
    c.save();
    c.translate(x + ox * k, y + oy * k);
    c.rotate(roll);
    c.scale(k, k);
    c.translate(-ox, -oy);
    c.drawImage(layers[p.base.file], 0, 0);
    if (p.hand) {
      const [ax, ay] = p.hand.pivot;
      const wrist = [p.hand.x + ax, p.hand.y + ay];
      c.save();
      c.translate(wrist[0], wrist[1]);
      c.rotate(hand);
      c.drawImage(layers[p.hand.file], -ax, -ay);
      c.restore();
    }
    /**
     * The mouth. `mouth` is the per-frame viseme track from lipsync.py:
     * [openness, letter] for every frame of the mix. The kit patches are real
     * visemes — open, round, wide — and this cross-fades between the neighbouring
     * letters by openness so the jaw does not step.
     *
     * This is the piece that was simply missing. She used to talk with a closed
     * mouth, which is exactly what "mdomo umekuwa shut" describes.
     */
    /**
     * The mouth.
     *
     * Two sources, in order of preference:
     *
     *   1. `p.ai` — AI renders of THIS pose with only the mouth changed. They are
     *      her real mouth, her real lighting, her real teeth, at three openness
     *      levels. This is what replaced the kit patches after the kit patch
     *      painted a grin on her chin: the kit's eight "visemes" are all one
     *      painted smile with no teeth, so pasting one onto a pose reads as a
     *      sticker. A model render at three levels does not.
     *
     *   2. `p.mouth` — the original kit patches, kept for the poses that do not
     *      have AI levels yet.
     *
     * The level is chosen by openness, not blended: these are complete
     * replacements for the lip area, so partial alpha would leave the closed
     * mouth showing through.
     */
    /**
     * `mouth: false` means "draw no mouth plate at all" — the caller is going to
     * stamp its own feathered plate. It is NOT the same as `mouth: null`, which
     * still means "she is silent" and draws the closed plate. Conflating the two
     * painted a square of the plate's background onto her jaw.
     */
    const bare = mouth === false;
    const track = !bare && mouth && (Array.isArray(mouth) ? mouth : mouth.frames);
    const cur = track ? (track[Math.min(f, track.length - 1)] || [0, "X"]) : [0, "X"];
    const [openness, letter] = cur;
    const voicing = letter !== "X" && openness > 0.06;

    if (bare) {
      // caller stamps the plate
    } else if (p.ai) {
      const lv = !voicing ? "closed" : openness < 0.42 ? "mid" : "open";
      const v = p.ai[lv];
      if (v) {
        c.save();
        c.drawImage(layers[v.file], v.cx - v.w / 2, v.cy - v.h / 2);
        c.restore();
      }
    } else if (voicing && p.mouth) {
      const LADDER = ["A", "G", "C", "H", "D", "E", "B", "F"];
      const idx = Math.min(LADDER.length - 1,
        Math.max(0, Math.round(openness * (LADDER.length - 1))));
      const patch = p.mouth[LADDER[idx]];
      if (patch) {
        c.save();
        c.drawImage(layers[patch.file], patch.x, patch.y);
        c.restore();
      }
    }

    const b = Math.max(0, ...blinks.map((at) => smooth(at - 5, at, f) * (1 - smooth(at + 1, at + 6, f))));
    if (b > 0.001) { c.save(); c.globalAlpha *= b; c.drawImage(layers[p.lids.file], p.lids.x, p.lids.y); c.restore(); }
    // `mark` is null once build-logo.py has baked the badge into the base.
    if (p.mark) c.drawImage(mark, ...p.mark);
    c.restore();
  };
}

/** Eggshell page with a plate photo behind it, so each beat has its own set. */
export function makeScene(W, H, plate, { photoAlpha = 0.5, tint = "#fffdf7", tint2 = "#e8eef6", yShift = 0.46 } = {}) {
  const cv = createCanvas(W, H), c = cv.getContext("2d");
  c.fillStyle = tint; c.fillRect(0, 0, W, H);
  if (plate) {
    const k = Math.max(W / plate.width, H / plate.height) * 1.06;
    c.globalAlpha = photoAlpha;
    c.drawImage(plate, (W - plate.width * k) * 0.52, (H - plate.height * k) * yShift, plate.width * k, plate.height * k);
    c.globalAlpha = 1;
  }
  const g = c.createLinearGradient(0, 120, W * 0.9, H);
  g.addColorStop(0, tint + "ff");
  g.addColorStop(0.52, tint + "d8");
  g.addColorStop(1, tint2 + "9c");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  return cv;
}
