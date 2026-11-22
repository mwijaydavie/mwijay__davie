// T4 — story track. Long-form narrative told in 15-20 second beats, in Kiswahili,
// performed by a recurring character whose face is a fixed photo cut-out.
//
// Why it looks different from tracks 1-3 on purpose:
//   · the background is a warm paper wash with a moving lamp, not a grid — stories sit in rooms
//   · type is big, centred and few words per beat; the subtitle carries the line, the
//     headline carries the *turn* (one idea, 2-4 words)
//   · shots cut. Nothing scales under the camera, because a moving photo looks cheap.
//   · the document prop is the antagonist/protagonist: CV, envelope, ledger.
//
// A scene speaks this track only if it sets `cast` or `caption`. Anything else is a plain
// "type card" beat, which is the palate cleanser between two heavy shots.
import {
  W, H, SAFE, clamp, lerp, unlerp, easeOut, easeInOut, spring, reveal, hash01,
  rect, circle, line, text, block, pill, arrow, round, measure, fit, glyphSafe,
} from './core.mjs';
import {cutout, castAt, prop, FRAMING, POSE_ASPECT, POSES} from './story.mjs';

const INK = '#F7F3E8';
const MUTED = '#C9BFAE';
const RUST = '#FF6A3D';
const GOLD = '#E9C46A';
const LAMP = '#FFD9A0';

/** Warm paper world with a lamp that drifts; `tone` lets a flashback cool down. */
function world(t, {tone = 'warm'} = {}) {
  const base = tone === 'cold' ? '#12131C' : '#1C130E';
  const glow = tone === 'cold' ? '#7FA6D8' : LAMP;
  const drift = easeInOut(unlerp(t, 0, 330));
  let grain = '';
  for (let i = 0; i < 80; i++) {
    grain += circle(round(hash01(`s${i}`) * W), round(hash01(`r${i}`) * H), 1.5, {fill: '#FFFFFF', o: 0.045});
  }
  return rect(0, 0, W, H, {fill: base}) +
    `<defs>
       <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
         <stop offset="0" stop-color="${glow}" stop-opacity="${tone === 'cold' ? 0.2 : 0.26}"/>
         <stop offset="1" stop-color="${base}" stop-opacity="0"/>
       </radialGradient>
       <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="#000000" stop-opacity="0"/>
         <stop offset="1" stop-color="#000000" stop-opacity="0.62"/>
       </linearGradient>
     </defs>` +
    `<ellipse cx="${round(lerp(330, 760, drift))}" cy="${round(lerp(520, 640, drift))}" rx="760" ry="680" fill="url(#lamp)"/>` +
    grain;
}

/**
 * Big centred headline. Anchored by its TOP (`y`), not its baseline, because a 60px line and
 * a 108px line must clear the kicker above and the caption below from the same coordinate.
 * `underline:'draw'` gives the hand-drawn mark; `strike:true` crosses the words out.
 */
function headline(scene, t, {y = 560, size = 100, maxWidth = 900, color = INK, start = 0, underline = false, strike = false} = {}) {
  const str = scene.headline || '';
  if (!str) return {svg: '', height: 0, size: 0};
  const p = easeOut(unlerp(t, start, start + 16));
  // explicit \n wins over the greedy wrapper: a headline is authored, not reflowed
  const hard = String(str).split('\n');
  const f = hard.length > 1
    ? (() => {
        let sz = size;
        const widest = (v) => Math.max(...hard.map((l) => measure(l, {role: 'serif', weight: 800, size: v, tracking: -2})));
        while (sz > 46 && widest(sz) > maxWidth) sz -= 2;
        return {size: sz, lines: hard, overflow: sz !== size};
      })()
    : fit(str, {role: 'serif', weight: 800, size, maxWidth, maxLines: 3, lineHeight: 1.08, tracking: -2, minSize: 46});
  const lh = f.size * 1.08;
  const capTop = y + f.size * 0.24;          // cap height sits a little under the top anchor
  const lines = f.lines.map((l, i) => {
    const o = easeOut(unlerp(t, start + i * 4, start + 16 + i * 4));
    return `<g transform="translate(0 ${round((1 - o) * 26)})">${text(l, W / 2, capTop + i * lh, {
      role: 'serif', weight: 800, size: f.size, fill: color, anchor: 'middle', tracking: -2, o,
    })}</g>`;
  }).join('');
  const lastBase = capTop + (f.lines.length - 1) * lh;
  const q = easeOut(unlerp(t, start + 16, start + 40));
  const widest = Math.min(maxWidth, Math.max(...f.lines.map((l) => measure(l, {role: 'serif', weight: 800, size: f.size, tracking: -2}))));
  const half = Math.min(widest / 2 + 24, 330);
  const underY = lastBase + f.size * 0.30;   // below the baseline, clear of descenders
  const under = underline && q > 0
    ? `<path d="M${round(W / 2 - half * q)} ${round(underY)} Q${W / 2} ${round(underY + f.size * 0.10)} ${round(W / 2 + half * q)} ${round(underY)}"
        fill="none" stroke="${RUST}" stroke-width="7" stroke-linecap="round" opacity="0.9"/>`
    : '';
  const cross = strike && q > 0
    ? `<line x1="${round(W / 2 - half * q)}" y1="${round(capTop + f.size * 0.42)}" x2="${round(W / 2 + half * q)}" y2="${round(capTop + f.size * 0.42)}" stroke="${RUST}" stroke-width="10" opacity="0.95"/>`
    : '';
  return {svg: lines + under + cross, height: lastBase + f.size * 0.5 - y, size: f.size};
}

/** Small kicker above the headline: place · time, or a source line. */
function kicker(scene, t, {y = 316, color = GOLD}) {
  if (!scene.kicker) return '';
  const p = easeOut(unlerp(t, 4, 22));
  const label = glyphSafe(scene.kicker).toUpperCase();
  const w = measure(label, {role: 'mono', weight: 700, size: 24, tracking: 3}) + 44;
  return `<g opacity="${round(p)}">
    ${rect(W / 2 - w / 2, y - 30, w, 52, {fill: 'none', stroke: color, sw: 2, rx: 4, o: 0.55})}
    ${text(label, W / 2, y + 6, {role: 'mono', weight: 700, size: 24, fill: color, anchor: 'middle', tracking: 3})}
  </g>`;
}

/** The story's own stat device: a number that counts into place. */
function tally(scene, t, {y = 980}) {
  const c = scene.tally;
  if (!c) return '';
  const p = easeOut(unlerp(t, 20, 70));
  const value = Math.round(lerp(0, c.n, p));
  const label = c.label || '';
  return `<g>
    ${text(String(value), W / 2, y, {role: 'head', weight: 800, size: 210, fill: c.color || GOLD, anchor: 'middle', tracking: -6})}
    ${text(label.toUpperCase(), W / 2, y + 62, {role: 'mono', weight: 700, size: 27, fill: MUTED, anchor: 'middle', tracking: 3, o: p})}
  </g>`;
}

/**
 * The drawer: 287 CVs, stacked as a drift of paper rather than a grid of bars.
 * Each sheet is a real page (masthead rule, name line, ruled body, two-column evidence),
 * tilted and overlapped at hash-chosen angles, so the eye reads "a lot of paper" and the
 * number underneath does the counting.
 */
function cvStack(t, {y = 1000} = {}) {
  const n = 18;
  let out = '';
  for (let i = 0; i < n; i++) {
    const q = easeOut(unlerp(t, 12 + i * 2.4, 30 + i * 2.4));
    if (q <= 0) continue;
    const col = i % 6;
    const row = Math.floor(i / 6);
    const w = 150;
    const h = 196;
    const x = 96 + col * 150 + (hash01(`sx${i}`) - 0.5) * 26;
    const yy = y - row * 122 + (hash01(`sy${i}`) - 0.5) * 22 + (1 - q) * 80;
    const rot = (hash01(`sr${i}`) - 0.5) * 13;
    const aged = 0.88 + hash01(`sa${i}`) * 0.1;
    out += `<g opacity="${round(q * 0.97)}" transform="rotate(${round(rot)} ${round(x + w / 2)} ${round(yy + h / 2)})">
      <rect x="${round(x + 5)}" y="${round(yy + 7)}" width="${w}" height="${h}" fill="#000" opacity="0.35" rx="2"/>
      <rect x="${round(x)}" y="${round(yy)}" width="${w}" height="${h}" fill="#F3ECDC" opacity="${round(aged)}" rx="2"/>
      <rect x="${round(x + 14)}" y="${round(yy + 16)}" width="${round(w - 28)}" height="7" fill="#1C130E" opacity="0.72" rx="1"/>
      <rect x="${round(x + 14)}" y="${round(yy + 30)}" width="${round((w - 28) * 0.72)}" height="4" fill="#1C130E" opacity="0.34" rx="1"/>
      <line x1="${round(x + 14)}" y1="${round(yy + 44)}" x2="${round(x + w - 14)}" y2="${round(yy + 44)}" stroke="#1C130E" stroke-width="1.6" opacity="0.3"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((k) =>
        `<rect x="${round(x + 14)}" y="${round(yy + 56 + k * 16)}" width="${round((w - 28) * (0.94 - (k % 3) * 0.12))}" height="3.4" fill="#1C130E" opacity="0.17" rx="1"/>`).join('')}
      <rect x="${round(x + 14)}" y="${round(yy + h - 34)}" width="44" height="3.4" fill="#1C130E" opacity="0.3"/>
      <rect x="${round(x + w - 58)}" y="${round(yy + h - 34)}" width="44" height="3.4" fill="#1C130E" opacity="0.3"/>
    </g>`;
  }
  return out;
}

/** A line of dialogue on a strip, as if torn from the ledger. */
function quote(scene, t, {y = 700}) {
  if (!scene.quote) return '';
  const p = easeOut(unlerp(t, 8, 30));
  const f = fit(`"${scene.quote}"`, {role: 'serif', weight: 500, size: 66, maxWidth: 840, maxLines: 5, lineHeight: 1.16, tracking: -1, minSize: 44});
  const lh = f.size * 1.16;
  return `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 20)})">
    ${rect(54, y - 96, 9, f.lines.length * lh + 60, {fill: GOLD, rx: 4, o: 0.9})}
    ${f.lines.map((l, i) => text(l, 96, y + i * lh, {role: 'serif', weight: 500, size: f.size, fill: INK, tracking: -1})).join('')}
  </g>`;
}

/**
 * One frame of a story beat. `scene.mode` chooses the device:
 *   face  — her, waist-up, one prop (default when cast is set)
 *   card  — type only: a headline or a quote
 *   stack — the drawer full of CVs
 *   tally — one number
 */
function storyScene(spec, scene, t, images, track) {
  const th = track.theme;
  const tone = scene.tone || 'warm';
  const mode = scene.mode || (scene.cast ? 'face' : 'card');
  // Kicker box occupies y 286..338. A headline's cap-tops sit 0.48*size above its anchor,
  // so the anchor has to clear the box or the two blocks print on top of each other.
  const size = scene.headSize ?? 92;
  const minTop = scene.kicker ? 338 + size * 0.48 + 14 : 300;
  const headTop = Math.max(scene.headY ?? minTop, minTop);

  // A slow whole-frame push (background + cast + prop together, never her alone): the shot
  // breathes without the plate distorting. Type and captions stay outside it, so they stay sharp.
  const pushMax = scene.push ?? 0.022;
  const push = 1 + pushMax * easeInOut(unlerp(t, 0, 400));
  const opened = `<g transform="translate(540 1100) scale(${round(push)}) translate(-540 -1100)">`;
  let out = opened + world(t, {tone});

  if (mode === 'face') {
    const a = castAt(scene, t);
    const side = scene.cast.side || 'right';
    const x = a?.x ?? (side === 'right' ? 716 : 364);
    // lamp pool behind her, so the cut edge sits in light instead of floating on flat colour
    out += `<ellipse cx="${round(x)}" cy="${round((a?.y ?? 1430) - (a?.h ?? 940) * 0.62)}" rx="320" ry="320"
      fill="${tone === 'cold' ? '#7FA6D8' : LAMP}" opacity="0.12"/>`;
    if (scene.prop) {
      // the prop is drawn before her, so it reads as paper in her hand rather than a sticker
      const tall = (FRAMING[scene.cast.framing]?.h ?? 1060);
      const pw = scene.prop === 'ledger' ? 300 : 330;
      // keep the paper's inner edge ~30px clear of her shoulder line at that framing
      const edge = 0.30 * tall;
      const centre = side === 'right' ? Math.max(168, x - edge - pw / 2 - 30) : Math.min(1000 - pw / 2, x + edge + pw / 2 + 30);
      out += prop(scene.prop, t, {
        x: centre, y: scene.prop === 'ledger' ? 860 : 940, w: pw, theme: th,
        reveal: scene.prop === 'ledger' ? 1 : unlerp(t, 10, 40),
      });
    }
    if (a) out += cutout(a.pose, {x, y: a.y, h: a.h, flip: side === 'right', o: a.o, shadow: 1});
    // The cast sits in the lower half (see FRAMING), so type lives in the top third and the
    // two never fight. With a prop the headline narrows to the opposite side.
    const wide = scene.headWidth ?? (scene.prop ? 640 : 920);
    const h = headline(scene, t, {y: headTop, size: scene.headSize ?? 92, maxWidth: wide,
      color: INK, underline: !!scene.underline, strike: !!scene.strike});
    out += h.svg;
    out += beatRule(t, headTop + h.height + 22, side);
  } else if (mode === 'stack') {
    out += headline(scene, t, {y: headTop, size: scene.headSize ?? 96, maxWidth: 900, underline: true}).svg;
    out += cvStack(t, {y: 940});
  } else if (mode === 'tally') {
    out += headline(scene, t, {y: headTop, size: scene.headSize ?? 88, maxWidth: 900}).svg;
    out += tally(scene, t, {y: 900});
  } else {
    const h = headline(scene, t, {y: headTop, size: scene.headSize ?? 112, maxWidth: 920,
      underline: !!scene.underline, strike: !!scene.strike});
    out += h.svg;
    out += quote(scene, t, {y: headTop + h.height + 130});
  }
  out += '</g>';
  out += kicker(scene, t, {y: 300});
  return out;
}

/** Thin rule that grows from the side she is not on: a quiet "next beat" cue. */
function beatRule(t, y, side) {
  const p = easeOut(unlerp(t, 20, 46));
  if (p <= 0 || y > 1400) return '';
  const x0 = side === 'right' ? 84 : 996;
  const dir = side === 'right' ? 1 : -1;
  return line(x0, y, x0 + dir * 120 * p, y, {stroke: GOLD, sw: 4, o: 0.5});
}

export const story = storyScene;
