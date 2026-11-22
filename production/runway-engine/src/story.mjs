// Story cast — the real people in the story, as photo cut-outs rather than drawings.
//
// A scene that sets `cast:{who, x, y, h, pose}` is drawn here instead of by the track
// template. Her face is a fixed asset (same generative seed, same sheet), so the channel
// keeps one recognisable face; only pose, framing and accent change per beat.
//
// Directing rules that keep a cut-out from looking like a pasted photo:
//  · never scale her inside one shot — move the camera/plate, or cut. Scaling reads as a jelly wobble.
//  · every pose change lands on a beat, not on a frame count that "feels right".
//  · one shot at a time: the eye accepts a cut far more than it accepts a morph.
//  · the lower third is the subtitle band; her chin stays above y≈1430 or the caption eats her.
//
// Pure function of frame: same spec, same pixels, no clock, no RNG.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {W, H, clamp, lerp, unlerp, easeOut, easeInOut, round, readImage, rect, hash01, circle, text, line} from './core.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Every expression we have a sheet for. Keep this list in sync with assets/character/. */
export const POSES = {
  calm:  {file: 'nia-office-cut.png', label: 'calm'},
  shock: {file: 'nia-shock-cut.png',  label: 'shock'},
  laugh: {file: 'nia-warm-cut.png',   label: 'laugh'},
};

// Retired on purpose: the brown tee sheet. Its chest print belongs to a third party and,
// because a right-side shot mirrors the plate, it would publish as reversed text.
// (File kept in assets/character/ only as the reference for regenerating her face.)

const ASSET_DIR = path.resolve(HERE, '../assets/character');
const cache = new Map();

/** Load once per process; the base64 is worth ~2 MB, so never re-read per frame. */
function sheet(name) {
  if (cache.has(name)) return cache.get(name);
  const pose = POSES[name];
  if (!pose) throw new Error(`cast: unknown pose "${name}" (have ${Object.keys(POSES).join(', ')})`);
  const data = readImage(path.join(ASSET_DIR, pose.file));
  if (!data) throw new Error(`cast: missing sheet ${ASSET_DIR}/${pose.file}`);
  cache.set(name, data);
  return data;
}

/**
 * Where should she be, and how big, `t` frames into the scene.
 * `hold` freezes the camera so a two-shot can share one frame with a document.
 */
export function castAt(scene, t) {
  const c = scene.cast || {};
  if (!c.pose) return null;
  const fr = FRAMING[c.framing] || null;            // a preset owns height + anchor
  const enter = easeOut(unlerp(t, 0, 16));         // 16f = 0.27s, just under a blink
  const settle = easeInOut(unlerp(t, 0, 30));
  // a slow push-in of ~2% over the whole beat: enough to feel alive, too little to wobble.
  // (the whole-frame push in the template is separate; this one is sub-pixel insurance)
  const push = lerp(1, scene.cast.push ?? 1.012, unlerp(t, 0, 400));
  // breathing is camera-side, so the face never distorts
  const breath = Math.sin((t / 150) * Math.PI * 2) * 3;
  return {
    pose: c.pose,
    x: c.x ?? (c.side === 'left' ? 364 : 716),
    y: (fr ? fr.y : c.y ?? 1180) + (1 - settle) * 34 + breath,
    h: (fr ? fr.h : c.h ?? 900) * push,
    flip: !!c.flip,
    side: c.side || 'right',
    framing: c.framing || null,
    o: enter,
  };
}

/** `<image>` for one cut-out, drawn bottom-anchored so `h` means "tall as her". */
export function cutout(pose, {x, y, h, flip = false, o = 1, shadow = 0, blur = 0} = {}) {
  const data = sheet(pose);
  const aspect = POSE_ASPECT[pose] || 0.626;   // width / height of the trimmed sheet
  const w = h * aspect;
  const sx = flip ? -1 : 1;
  const body = `<image href="${data}" x="${round(-w / 2)}" y="${round(-h)}" width="${round(w)}" height="${round(h)}"
      preserveAspectRatio="xMidYMax meet"/>`;
  return `<g transform="translate(${round(x)} ${round(y)}) scale(${sx} 1)" opacity="${round(o)}"${blur ? ` filter="url(#castBlur)"` : ''}>
    ${shadow ? `<ellipse cx="0" cy="6" rx="${round(w * 0.42)}" ry="${round(h * 0.022)}" fill="#000" opacity="${round(0.28 * shadow)}" filter="url(#castBlur)"/>` : ''}
    ${body}
  </g>`;
}

/**
 * Framing presets. `hero` is a chest-up two-shot that leaves the top third for type;
 * `close` is an emotional close-up where the subtitle does all the talking.
 * Heights are in frame pixels at 1080 wide, feet/bust anchored to the bottom.
 */
export const FRAMING = {
  hero:  {h: 1060, y: 1740},  // head top ≈ 680: a headline and a kicker fit above her
  mid:   {h: 1210, y: 1750},  // head top ≈ 540
  close: {h: 1380, y: 1780},  // head top ≈ 400: face fills the frame, type steps aside
};

/** Trimmed width/height of each sheet, used to keep her feet and shoulders aligned. */
export const POSE_ASPECT = {
  calm: 760 / 1214,
  shock: 760 / 1214,
  laugh: 760 / 1214,
};

/** A two-shot: her on one side, a prop (CV, envelope, ledger) on the other. */
export function twoShot(spec, scene, t, {theme, prop}) {
  const a = castAt(scene, t);
  if (!a) return {svg: '', overlap: 0};
  const side = scene.cast.side || 'right';
  const x = side === 'right' ? 726 : 354;
  const svg = cutout(a.pose, {x, y: a.y, h: a.h, flip: side === 'right', o: a.o, shadow: 1}) + (prop || '');
  const propRight = side === 'right' ? 690 : 1000;
  return {svg, overlap: propRight};
}

/**
 * The document the story turns on. Drawn, not photographed: a CV that is 287 copies old,
 * an envelope sealed with red ink, a ledger with four errors circled in red.
 * `kind` picks the prop; `reveal` (0..1) drives the paper out of the envelope.
 */
export function prop(kind, t, {x = 300, y = 940, w = 420, theme, reveal = 1} = {}) {
  const ink = '#161827';
  const paper = '#F7F3E8';
  const accent = theme?.accent || '#DFFC77';
  const rust = theme?.accent2 || '#E4572E';
  if (kind === 'cv') {
    const r = easeOut(clamp(reveal));
    return `<g transform="translate(${round(x)} ${round(y)}) rotate(-4)" opacity="${round(r)}">
      ${rect(-w / 2, -w * 0.72, w, w * 1.44, {fill: paper, rx: 6, stroke: '#16182722', sw: 2})}
      ${rect(-w / 2, -w * 0.72, w, 54, {fill: ink, rx: 6})}
      ${text2('CURRICULUM VITAE', 0, -w * 0.72 + 36, {size: 20, fill: paper, weight: 700, tracking: 3, anchor: 'middle'})}
      ${['MZEE CHUKS · MHASIBU', 'Miaka 35 · TSh 150,000', '', 'Uzoefu', '1989 — leo', 'Mbarak Rice Ltd.'].map((l, i) =>
        l ? text2(l, -w / 2 + 26, -w * 0.72 + 108 + i * 44, {size: i === 0 ? 26 : 22, fill: ink, weight: i === 0 ? 700 : 500, o: i === 0 ? 1 : 0.72}) : '').join('')}
      ${[0.9, 0.74, 0.86, 0.6].map((q, i) => rect(-w / 2 + 26, -w * 0.72 + 340 + i * 30, (w - 52) * q, 7, {fill: ink, rx: 3, o: 0.13})).join('')}
      ${text2(`NAKALA 288`, w / 2 - 26, w * 0.62, {size: 20, fill: rust, weight: 800, anchor: 'end', tracking: 1.4})}
    </g>`;
  }
  if (kind === 'envelope') {
    const r = easeOut(clamp(reveal));
    return `<g transform="translate(${round(x)} ${round(y)}) rotate(3)">
      ${rect(-w / 2, -w * 0.34, w, w * 0.68, {fill: '#D9C39B', rx: 4, stroke: '#8A6E3F55', sw: 2})}
      <path d="M${round(-w / 2)} ${round(-w * 0.34)} L0 ${round(w * 0.06)} L${round(w / 2)} ${round(-w * 0.34)}" fill="none" stroke="#8A6E3F" stroke-width="3" opacity="0.55"/>
      ${rect(-40, -8, 80, 26, {fill: rust, rx: 3, o: 0.85})}
      ${text2('SI CV', 0, 12, {size: 18, fill: '#FFFFFF', weight: 800, anchor: 'middle', tracking: 1.5})}
      ${text2('KWA BW. MBARAK', -w / 2 + 20, w * 0.26, {size: 17, fill: '#6B5327', weight: 600, tracking: 1.2})}
    </g>`;
  }
  // ledger: the January accounts, four errors, each ringed in red as the voice names it
  const rings = [[0.62, 0.24], [0.44, 0.42], [0.7, 0.58], [0.5, 0.74]];
  return `<g transform="translate(${round(x)} ${round(y)}) rotate(2)">
    ${rect(-w / 2, -w * 0.78, w, w * 1.56, {fill: paper, rx: 5, stroke: '#16182726', sw: 2})}
    ${text2('HESABU · JANUARI', -w / 2 + 24, -w * 0.78 + 44, {size: 22, fill: ink, weight: 800, tracking: 2})}
    ${line2(-w / 2 + 24, -w * 0.78 + 60, w / 2 - 24, -w * 0.78 + 60, ink, 2, 0.2)}
    ${Array.from({length: 11}, (_, i) =>
      text2(['Mchele 50kg', 'Debe 20L', 'Usafiri', 'Umeme', 'Mshahara', 'Kodi', 'Jumla'][i % 7], -w / 2 + 26, -w * 0.78 + 104 + i * 52, {size: 19, fill: ink, o: 0.66}) +
      text2(`${(12 + i * 37) % 900}.${i % 9}00`, w / 2 - 26, -w * 0.78 + 104 + i * 52, {size: 19, fill: ink, o: 0.8, anchor: 'end', weight: 600})).join('')}
    ${rings.map(([rx, ry], i) => {
      const p = easeOut(unlerp(t, 40 + i * 26, 70 + i * 26));
      if (p <= 0) return '';
      const cx = -w / 2 + 26 + (w - 52) * rx - 10;
      const cy = -w * 0.78 + 88 + (w * 1.56 - 100) * ry;
      return `<g opacity="${round(p * 0.9)}"><ellipse cx="${round(cx)}" cy="${round(cy)}" rx="${round(34 * p)}" ry="${round(20 * p)}" fill="none" stroke="${rust}" stroke-width="4"/></g>`;
    }).join('')}
    ${text2('MAKOSA 4', w / 2 - 26, w * 0.66, {size: 21, fill: rust, weight: 800, anchor: 'end', tracking: 1.4})}
  </g>`;
}

/* Text here goes through core's vector-path renderer: the rasteriser loads no system
   fonts, so a raw <text> element would silently disappear. */
const text2 = (str, x, y, {size = 22, fill = '#161827', weight = 500, anchor = 'start', tracking = 0, o} = {}) =>
  text(str, x, y, {role: 'body', weight, size, fill, anchor, tracking, o});

const line2 = (x1, y1, x2, y2, stroke, sw, o) => line(x1, y1, x2, y2, {stroke, sw, o});

/**
 * Scene-level wrapper: a paper-cut vignette (background wash + grain) behind her,
 * so the story beats share one world instead of floating on flat colour.
 */
export function vignette(theme, t, {tone = 'warm'} = {}) {
  const wash = tone === 'warm' ? '#3B2A1E' : tone === 'office' ? '#141A2E' : '#1A1420';
  const glowX = lerp(300, 820, easeInOut(unlerp(t, 0, 330)));
  let dots = '';
  for (let i = 0; i < 70; i++) dots += circle(round(hash01(`v${i}`) * W), round(hash01(`w${i}`) * H), 1.6, {fill: '#FFFFFF', o: 0.05});
  return rect(0, 0, W, H, {fill: wash}) +
    `<defs><radialGradient id="vglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${theme.accent}" stop-opacity="0.16"/><stop offset="1" stop-color="${wash}" stop-opacity="0"/></radialGradient></defs>` +
    `<ellipse cx="${round(glowX)}" cy="${round(lerp(560, 700, easeInOut(unlerp(t, 0, 330))))}" rx="720" ry="640" fill="url(#vglow)"/>` + dots;
}
