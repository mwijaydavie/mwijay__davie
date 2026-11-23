// The three visual systems. Each template is a pure function of (spec, frame).
// Background family, type treatment and entry motion differ per track so three
// accounts never look like the same feed.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  W, H, SAFE, clamp, lerp, unlerp, easeOut, easeInOut, spring, between, reveal, hash01, pick,
  rect, circle, line, text, block, pill, arrow, roundedPath, attrs, round, measure, fit,
  gridLines, ticks, gridLines as grid, readImage, isImage, sticker,
} from './core.mjs';
import * as A from './art.mjs';
import {nia, poseAt} from './nia.mjs';
import {transition, moveFor, MOVE_FRAMES} from './motion.mjs';
import {story} from './storyTrack.mjs';
import {altraware, ALT} from './altraware.mjs';

// Lip-sync tables baked from each reel's mix (tools/lipsync.py). Keyed by slug.
const MOUTH_TRACKS = {};
{
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../content/runway/character');
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith('mouth-') && f.endsWith('.json')) {
        const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        MOUTH_TRACKS[j.slug] = j;
      }
    }
  }
}
import {light, LT} from './light.mjs';

/** Nominal length of one scene. A spec may set `sceneSeconds` (the audio builder does when
 *  the voice needs more room), and every template reads the length from there. */
export const SCENE_FRAMES = 330;

/** Frame offset at which scene `i` (0-based) starts. Flat reels share one length; a story
 *  reel sets `sceneHooks` so each beat keeps its own hook and cut on its own word. */
export function sceneStarts(spec) {
  const hooks = spec.sceneHooks;
  if (!Array.isArray(hooks)) {
    const spf = framesPerScene(spec);
    return spec.scenes.map((_, i) => i * spf);
  }
  const out = [];
  let at = 0;
  for (const h of hooks) { out.push(at); at += Math.round(h * 60); }
  return out;
}

export const sceneFrames = (spec, i) => {
  const hooks = spec.sceneHooks;
  if (!Array.isArray(hooks)) return framesPerScene(spec);
  return Math.round((hooks[i] ?? hooks.at(-1) ?? 5.5) * 60);
};

export const framesPerScene = (spec) => Math.round((spec.sceneSeconds || SCENE_FRAMES / 60) * 60);

export const TRACKS = {
  // Track 6 — the pale product reel (MwijayNote / LIMS / Model Mpya). The one the
  // channel is actually recognised by: light page, navy type, blue italic turn.
  6: {
    id: 6,
    name: 'Light product reel',
    layout: 'paper',
    theme: {
      bg: LT.paper, ink: LT.ink, muted: LT.inkSoft, accent: LT.accent, accent2: '#0E9F6E',
      card: '#FFFFFF', cardEdge: '#0B1B3314', gridColor: LT.ink, gridOpacity: 0.03,
      captionBg: LT.capBg, captionInk: '#FFFFFF',
      chromeInk: LT.ink, chromeMuted: '#0B1B3399', chromeAccent: LT.accent,
      footerBg: '#FBFDFF', route: LT.accent, badge: LT.accent,
    },
    fonts: {head: 'head', stat: 'head'},
  },
  // Track 5 — the Altraware house reel. Same room on every post, so the feed is
  // recognisable before the copy is read. See src/altraware.mjs for the method.
  5: {
    id: 5,
    name: 'Altraware · house reel',
    layout: 'night',
    theme: {
      bg: ALT.night, ink: ALT.ink, muted: ALT.inkDim, accent: ALT.gold, accent2: '#C9A6FF',
      card: '#FFFFFF0D', cardEdge: '#FFFFFF24', gridColor: '#FFFFFF', gridOpacity: 0.035,
      captionBg: '#0A1026F2', captionInk: '#FFFFFF',
      chromeInk: ALT.ink, chromeMuted: '#F5F5F099', chromeAccent: ALT.gold,
      footerBg: 'none', route: ALT.gold, badge: ALT.gold,
    },
    fonts: {head: 'head', stat: 'body'},
  },
  4: {
    id: 4,
    name: 'Story · Kiswahili',
    layout: 'story',
    theme: {
      bg: '#1C130E', ink: '#F7F3E8', muted: '#C9BFAE', accent: '#E9C46A', accent2: '#FF6A3D',
      card: '#FFFFFF0D', cardEdge: '#FFFFFF24', gridColor: '#FFFFFF', gridOpacity: 0.04,
      captionBg: '#0A0704E8', captionInk: '#FFFFFF',
      chromeInk: '#F7F3E8', chromeMuted: '#F7F3E899', chromeAccent: '#E9C46A',
      footerBg: 'none', route: '#E9C46A', badge: '#E9C46A',
    },
    fonts: {head: 'serif', stat: 'serif'},
  },
  1: {
    id: 1,
    name: 'AI systems',
    layout: 'light',
    theme: {
      bg: '#FAFBF3', ink: '#161827', muted: '#5B6178', accent: '#3343C5', accent2: '#DFFC77',
      card: '#FFFFFF', cardEdge: '#1618271F', gridColor: '#161827', gridOpacity: 0.055,
      captionBg: '#161827E8', captionInk: '#FFFFFF',
      chromeInk: '#161827', chromeMuted: '#16182799', chromeAccent: '#3343C5',
      footerBg: '#FAFBF3', route: '#3343C5', badge: '#DFFC77',
    },
    fonts: {head: 'head', stat: 'head'},
  },
  2: {
    id: 2,
    name: 'Business stories',
    layout: 'dark',
    theme: {
      bg: '#0B0D18', ink: '#F8FAFC', muted: '#A8B0C8', accent: '#DFFC77', accent2: '#E4572E',
      card: '#FFFFFF0D', cardEdge: '#FFFFFF24', gridColor: '#FFFFFF', gridOpacity: 0.05,
      captionBg: '#05060CDD', captionInk: '#FFFFFF',
      chromeInk: '#F8FAFC', chromeMuted: '#F8FAFC99', chromeAccent: '#DFFC77',
      footerBg: 'none', route: '#DFFC77', badge: '#DFFC77',
    },
    fonts: {head: 'head', stat: 'serif'},
  },
  3: {
    id: 3,
    name: 'Tool showdowns',
    layout: 'idea',
    theme: {
      bg: '#F2F4ED', ink: '#20242E', muted: '#565E70', accent: '#E4572E', accent2: '#20242E',
      card: '#FFFFFF', cardEdge: '#20242E1A', gridColor: '#20242E', gridOpacity: 0.05,
      captionBg: '#20242EE8', captionInk: '#FFFFFF',
      chromeInk: '#20242E', chromeMuted: '#20242E99', chromeAccent: '#E4572E',
      footerBg: '#F2F4ED', route: '#E4572E', badge: '#E4572E',
    },
    fonts: {head: 'head', stat: 'serif'},
  },
};

/* ---------------------------- shared pieces ---------------------------- */

function background(track, spec, t, imgs) {
  const th = track.theme;
  if (track.layout === 'night' || track.layout === 'paper') return '';   // the template draws its own room
  let out = rect(0, 0, W, H, {fill: th.bg});
  if (track.layout === 'light') {
    out += `<g opacity="${round(th.gridOpacity * 2)}">${gridLines({step: 72, color: th.gridColor, o: 0.5})}</g>`;
    // a slow cobalt wash that slides with the scene; no flicker
    const wash = easeInOut(unlerp(t, 0, 330));
    out += `<ellipse cx="${round(lerp(1180, 700, wash))}" cy="${round(lerp(-120, 260, wash))}" rx="620" ry="520" fill="${th.accent}" opacity="0.05"/>`;
  } else if (track.layout === 'dark') {
    const g = easeInOut(unlerp(t, 0, 330));
    out += `<defs><radialGradient id="dglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#2B3566" stop-opacity="0.55"/><stop offset="1" stop-color="#0B0D18" stop-opacity="0"/></radialGradient></defs>`;
    out += `<ellipse cx="${round(lerp(760, 420, g))}" cy="${round(lerp(520, 640, g))}" rx="700" ry="620" fill="url(#dglow)"/>`;
    out += gridLines({step: 90, color: '#FFFFFF', o: 0.028});
    // film grain via deterministic hash dots
    let dots = '';
    for (let i = 0; i < 90; i++) {
      const hx = hash01(`gx${i}`);
      const hy = hash01(`gy${i}`);
      dots += circle(Math.round(hx * W), Math.round(hy * H), 1.4, {fill: '#FFFFFF', o: 0.05});
    }
    out += dots;
  } else {
    out += gridLines({step: 66, color: '#20242E', o: 0.035});
    const g = easeInOut(unlerp(t, 0, 330));
    out += `<rect x="0" y="${round(lerp(620, 560, g))}" width="${W}" height="6" fill="${th.ink}" opacity="0.9"/>`;
    out += `<rect x="0" y="${round(lerp(640, 580, g))}" width="${round(lerp(320, 540, g))}" height="6" fill="${th.accent}"/>`;
  }
  return out;
}

function clipImage(spec, key) {
  const v = spec.clips?.[key]?.image;
  return v ? readImage(v) : null;
}

/**
 * Cover art. With a cleared still we crop it behind a gradient; without one we build
 * an editorial "print stack" from the track palette, never a stock gradient blob.
 */
function coverFrame({track, images, spec, kicker}) {
  const th = track.theme;
  const im = images.cover;
  if (im) {
    return `<g transform="translate(${W / 2} 1180) scale(1.04) translate(${-W / 2} ${-1180})">
        <image href="${im}" x="-40" y="300" width="${W + 80}" height="1000" preserveAspectRatio="xMidYMid slice"/></g>
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#coverFade)"/>
      <defs><linearGradient id="coverFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.16" stop-color="${th.bg}" stop-opacity="0.55"/>
        <stop offset="0.46" stop-color="${th.bg}" stop-opacity="0.72"/>
        <stop offset="0.62" stop-color="${th.bg}" stop-opacity="0.96"/>
        <stop offset="1" stop-color="${th.bg}" stop-opacity="1"/>
      </linearGradient></defs>`;
  }
  // No cleared still yet: an editorial "document stack" built from the track palette.
  // Each card carries a real label (tag, date range, document type) so the art says
  // something instead of being decoration.
  const dark = track.layout === 'dark';
  const tag = coverTag(spec);
  const cards = [
    {
      x: 84, y: 316, w: 572, h: 272, rot: -2.4,
      fill: dark ? '#161C36' : '#FFFFFF', edge: dark ? '#FFFFFF1A' : '#16182716',
      draw: (w, h) => text(tag, 28, 46, {role: 'mono', weight: 700, size: 19, fill: th.accent, tracking: 3}) +
        text(spec.episodeNo ? `EP ${spec.episodeNo}` : (spec.series || ''), w - 28, 46, {role: 'mono', weight: 600, size: 18, fill: th.muted, tracking: 1.6, anchor: 'end'}) +
        line(28, 74, w - 28, 74, {stroke: th.ink, sw: 1.2, o: 0.14}) +
        [0.94, 0.78, 0.88, 0.62].map((q, i) => rect(28, 108 + i * 32, (w - 56) * q * 0.62, 9, {fill: th.ink, rx: 4, o: 0.13})).join(''),
    },
    {
      x: 404, y: 372, w: 588, h: 288, rot: 1.6, fill: th.accent,
      draw: (w, h) => {
        const pts = [0.74, 0.68, 0.62, 0.66, 0.52, 0.44, 0.36, 0.2];
        let path = '';
        pts.forEach((v, i) => {
          const px = 28 + (i / (pts.length - 1)) * (w - 56);
          const py = 52 + v * (h - 128);
          path += `${i ? 'L' : 'M'}${round(px)} ${round(py)} `;
        });
        return text(spec.chartLabel || (spec.track === 2 ? 'THE TREND, SMOOTHED' : 'ILLUSTRATIVE'), 28, 40, {role: 'mono', weight: 700, size: 17, fill: '#101322', tracking: 2, o: 0.85}) +
          `<path d="${path}" fill="none" stroke="#101322" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>` +
          circle(28 + (w - 56), 52 + 0.2 * (h - 128), 7, {fill: '#101322'}) +
          text(spec.chartNote || 'Illustrative trend', 28, h - 22, {role: 'mono', weight: 600, size: 16, fill: '#101322', o: 0.6, tracking: 1});
      },
    },
    {
      x: 132, y: 452, w: 620, h: 218, rot: -0.9, fill: th.accent2,
      draw: (w, h) => text(String(spec.docType || (spec.track === 1 ? 'WORKFLOW' : spec.track === 3 ? 'SPEC SHEET' : 'MEMO')).toUpperCase(), 26, 42, {role: 'mono', weight: 700, size: 18, fill: dark ? '#101322' : '#FFFFFF', tracking: 2.4, o: 0.92}) +
        [0.9, 0.72, 0.84, 0.54].map((q, i) => rect(26, 66 + i * 28, (w - 52) * q, 8, {fill: dark ? '#101322' : '#FFFFFF', rx: 4, o: 0.4})).join('') +
        text(spec.docRef || 'REF. 04/2026', w - 26, h - 22, {role: 'mono', weight: 600, size: 16, fill: dark ? '#101322' : '#FFFFFF', o: 0.62, anchor: 'end', tracking: 1}),
    },
  ];
  let out = '';
  cards.forEach((c) => {
    out += `<g transform="translate(${c.x + c.w / 2} ${c.y + c.h / 2}) rotate(${c.rot}) translate(${-c.w / 2} ${-c.h / 2})">`;
    out += `<g filter="url(#soft)">${rect(0, 0, c.w, c.h, {fill: c.fill, rx: 14, stroke: c.edge, sw: 1.5})}</g>`;
    out += c.draw(c.w, c.h);
    out += '</g>';
  });
  return out;
}

function coverTag(spec) {
  return String(spec.tag || (spec.track === 1 ? 'AI SYSTEMS' : spec.track === 2 ? 'BUSINESS STORY' : 'TOOL SHOWDOWN')).toUpperCase();
}

/**
 * Stack blocks upward from a bottom edge, with fixed gaps. Each item declares its
 * height; draw(yTop) is only called once the layout is final. Keeps every template
 * out of the caption band instead of hand-tuning baselines.
 */
function stackFromBottom(items, bottom, gap) {
  let y = bottom;
  const placed = [];
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    y -= it.h;
    placed[i] = {...it, y};
    y -= gap;
  }
  return placed.map((it) => it.draw(it.y)).join('');
}

/**
 * Cover text: headline + optional kicker/eyebrow/sub/footer stacked from a bottom
 * edge upward. The headline is measured first and shrunk until the whole stack fits
 * above the caption band, so no spec can push type under the platform UI.
 */
function coverText(s, {
  th, bottom = 1330, gap = 20, headlineSize = 100, maxLines = 4, tracking = -3.6,
  role = 'head', weight = 780, headlineFill, eyebrowRole = 'mono', keyword, maxWidth = 900,
} = {}) {
  const x = 84;
  const boxes = [];
  const extras = [];
  if (s.eyebrow) extras.push({h: 26, draw: (y) => labelText(s.eyebrow, x, y + 22, {fill: th.accent, size: 23})});
  if (s.kicker) extras.push({h: 44, draw: (y) => pill(String(s.kicker).toUpperCase(), x, y, {size: 23, padX: 15, padY: 8, fill: th.accent, ink: trackInk(th), tracking: 2.2}).svg});
  if (s.sub) extras.push({h: 78, draw: (y) => bodyBlock(s.sub, x, y, {role: 'body', size: 32, maxLines: 2, fill: th.muted, maxWidth: maxWidth - 20}).svg});
  if (s.price) extras.push({h: 48, draw: (y) => text(s.price, x, y + 36, {role: 'head', weight: 740, size: 40, fill: th.accent, tracking: -1.2})});
  if (keyword) extras.push({h: 30, draw: (y) => text(`COMMENT ${keyword}`, x, y + 24, {role: 'mono', weight: 700, size: 24, fill: th.accent, tracking: 1.6})});

  const extraH = extras.reduce((a, e) => a + e.h + gap, 0);
  let size = headlineSize;
  let head = headlineBlock(s.headline, x, 0, {role, weight, size, maxWidth, maxLines, fill: headlineFill || th.ink, tracking, lineHeight: 0.97, max: 1e9});
  const availH = bottom - 640; // keep the art readable above the copy
  while (extraH + head.h > availH && size > 54) {
    size -= 4;
    head = headlineBlock(s.headline, x, 0, {role, weight, size, maxWidth, maxLines, fill: headlineFill || th.ink, tracking, lineHeight: 0.97, max: 1e9});
  }
  const totalH = head.h + (extras.length ? gap * 2 + extraH - gap : 0);
  let y = bottom - totalH;
  boxes.push(headlineBlock(s.headline, x, y, {role, weight, size, maxWidth, maxLines, fill: headlineFill || th.ink, tracking, lineHeight: 0.97, max: 1e9}).svg);
  y += head.h;
  for (const e of extras) {
    y += gap;
    boxes.push(e.draw(y));
    y += e.h;
  }
  return boxes.join('');
}

function trackInk(th) {
  return th.bg === '#0B0D18' ? '#101322' : '#FFFFFF';
}

/* ---------------------------- shared text stacks ---------------------------- */

const T_BOTTOM = 1440; // nothing critical below this line
const T_TOP = 320;
/** Width reserved on the right when a scene places Nia in a column (her box + 24px gutter). */
const NIA_COL = 240;
const textWidth = (s, base = 912) => (s?.nia && (s.nia.x ?? 858) > 700 ? base - NIA_COL : base);

function labelText(str, x, y, {size = 23, fill, o = 1} = {}) {
  return text(String(str).toUpperCase(), x, y, {role: 'mono', weight: 700, size, fill, tracking: 3, o});
}

/** Headline as a measured block: returns {svg,h} once size is fitted. */
function headlineBlock(str, x, y, {role = 'head', weight = 760, size = 92, maxWidth = 912, maxLines = 4, lineHeight = 0.98, fill, tracking = -3.6, max = T_BOTTOM}) {
  let s = size;
  let f = fit(str, {role, weight, size: s, maxWidth, maxLines, tracking, lineHeight});
  while (f.lines.length * f.size * lineHeight > max - y && s > 40) {
    s -= 4;
    f = fit(str, {role, weight, size: s, maxWidth, maxLines, tracking, lineHeight});
  }
  const lh = f.size * lineHeight;
  const svg = f.lines.map((l, i) => text(l, x, y + f.size * 0.82 + i * lh, {role, weight, size: f.size, fill, tracking})).join('');
  return {svg, h: f.lines.length * lh, size: f.size, lines: f.lines, overflow: f.overflow};
}

function bodyBlock(str, x, y, {role = 'body', weight = 460, size = 32, maxWidth = 900, maxLines = 4, lineHeight = 1.32, fill, tracking = 0} = {}) {
  const f = fit(str, {role, weight, size, maxWidth, maxLines, tracking, lineHeight});
  const lh = f.size * lineHeight;
  const svg = f.lines.map((l, i) => text(l, x, y + f.size * 0.86 + i * lh, {role, weight, size: f.size, fill, tracking})).join('');
  return {svg, h: f.lines.length * lh, size: f.size, lines: f.lines};
}

/* ---------------------------- TRACK 1 ---------------------------- */

function track1Frame(spec, s, t, images, track) {
  const th = track.theme;
  const render = () => {
    switch (s.type) {
      case 'cover': {
        const art = coverFrame({track, images, spec, kicker: s.kicker});
        const copy = coverText(s, {th, bottom: 1424, gap: 22, headlineSize: s.nia ? 88 : 102, maxLines: 4, tracking: -3.8, maxWidth: textWidth(s), keyword: s.keywordLine === false ? null : spec.keyword});
        return art + `<g opacity="${round(clamp(spring(unlerp(t, 6, 30)) * 1.6))}" transform="translate(0 ${round((1 - spring(unlerp(t, 6, 34))) * 40)})">` + copy + '</g>';
      }
      case 'clip': {
        const items = [];
        if (s.footer) items.push({h: 40, draw: (y) => text(s.footer, 84, y + 26, {role: 'body', weight: 480, size: 25, fill: th.muted})});
        items.push({h: 470, draw: (y) => A.clipPanel(clipImage(spec, s.clip), t, {x: 84, y, w: 912, h: 470, label: spec.clips?.[s.clip]?.label, sublabel: spec.clips?.[s.clip]?.credit, palette: th, angle: -1.2, dur: 330})});
        const bottom = stackFromBottom(items, T_BOTTOM, 22);
        const yClip = T_BOTTOM - (bottom[1] ? 470 + 22 + 40 : 470);
        const headH = 300;
        return (s.kicker ? pill(s.kicker, 84, T_TOP, {size: 24, padX: 16, padY: 9, fill: th.accent, ink: '#FFFFFF', tracking: 2.4}).svg : '') +
          headlineBlock(s.headline, 84, T_TOP + 74, {size: 76, maxWidth: 900, maxLines: 3, fill: th.ink, max: yClip - 40}).svg +
          bottom;
      }
      case 'workflow': {
        const head = headlineBlock(s.headline, 84, T_TOP + 74, {size: 74, maxWidth: 900, maxLines: 3, fill: th.ink, max: 640}).svg;
        const gap = 118;
        const blockH = (s.nodes.length - 1) * gap + 104;
        const top = Math.round(700 + (560 - blockH) / 2);
        return (s.kicker ? pill(s.kicker, 84, T_TOP, {size: 24, padX: 16, padY: 9, fill: th.accent, ink: '#FFFFFF', tracking: 2.4}).svg : '') + head +
          A.workflow(t, {nodes: s.nodes, x: 84, y: top, w: textWidth(s, 912), gap, palette: th, start: 40, step: 34}) +
          (s.caption ? bodyBlock(s.caption, 84, top + blockH + 34, {size: 25, maxWidth: 880, maxLines: 2, fill: th.muted}).svg : '');
      }
      case 'table': {
        return (s.kicker ? pill(s.kicker, 84, T_TOP, {size: 24, padX: 16, padY: 9, fill: th.accent, ink: '#FFFFFF', tracking: 2.4}).svg : '') +
          headlineBlock(s.headline, 84, T_TOP + 74, {size: 68, maxWidth: 900, maxLines: 2, fill: th.ink, max: 560}).svg +
          A.compareTable(t, {columns: s.columns, rows: s.rows, x: 84, y: 620, w: 912, rowH: s.rowH || 148, palette: {...th, accent: th.accent2, head: th.ink}, start: 34, step: 18, verdict: s.verdict});
      }
      case 'stat': {
        let out = rect(84, 340, 912, 1000, {fill: th.card, rx: 28, stroke: th.cardEdge, sw: 2});
        if (s.kicker) out += labelText(s.kicker, 128, 410, {fill: th.accent, size: 24});
        const n = Math.round(lerp(0, s.value, easeOut(unlerp(t, 26, 92))));
        const numStr = `${s.prefix || ''}${n.toLocaleString('en-US')}${s.suffix || ''}`;
        const nf = fit(numStr, {role: 'head', weight: 780, size: 200, maxWidth: 820, maxLines: 1, tracking: -10, minSize: 96});
        out += `<g opacity="${round(easeOut(unlerp(t, 16, 34)))}" transform="translate(0 ${round((1 - spring(unlerp(t, 16, 42))) * 30)})">`;
        out += text(numStr, 128, 640, {role: 'head', weight: 780, size: nf.size, fill: th.ink, tracking: -10});
        out += headlineBlock(s.line, 128, 676, {size: 50, maxWidth: 800, maxLines: 3, fill: th.ink, tracking: -1.6, max: 1000}).svg;
        if (s.note) out += bodyBlock(s.note, 128, 1000, {size: 29, maxWidth: 780, maxLines: 3, fill: th.muted}).svg;
        out += '</g>';
        if (s.source) out += text(s.source, 128, 1294, {role: 'mono', weight: 600, size: 19, fill: th.muted});
        return out;
      }
      case 'checklist': {
        let out = (s.kicker ? pill(s.kicker, 84, T_TOP, {size: 24, padX: 16, padY: 9, fill: th.accent, ink: '#FFFFFF', tracking: 2.4}).svg : '') +
          headlineBlock(s.headline, 84, T_TOP + 74, {size: 68, maxWidth: 900, maxLines: 2, fill: th.ink, max: 610}).svg;
        const bandTop = 700;
        const bandBottom = T_BOTTOM;
        const cw = textWidth(s, 912);
        const cardH = cw < 900 ? 132 : 142, rowH = cw < 900 ? 156 : 168;
        const blockH = (s.items.length - 1) * rowH + cardH;
        const y0 = Math.round(bandTop + Math.max(0, (bandBottom - bandTop - blockH) / 2));
        // each row lands on its own line of dialogue, not on a fixed frame offset
        const beats = s.cues?.length === s.items.length ? s.cues.map((c) => c.in) : null;
        s.items.forEach((item, i) => {
          const rv = reveal(t, beats ? beats[i] : 46 + i * 22, 20);
          const yy = y0 + i * rowH;
          out += `<g opacity="${round(rv.o)}" transform="translate(${round((1 - rv.p) * -36)} 0)">
            ${rect(84, yy, cw, cardH, {fill: th.card, rx: 18, stroke: th.cardEdge, sw: 2})}
            ${circle(136, yy + cardH / 2, 28, {fill: i === 0 ? th.accent2 : 'none', stroke: i === 0 ? th.accent2 : th.cardEdge, sw: 2})}
            ${text(String(i + 1), 136, yy + cardH / 2 + 10, {role: 'mono', weight: 700, size: 26, fill: th.ink, anchor: 'middle'})}
            ${text(item.title, 186, yy + 58, {role: 'head', weight: 720, size: cw < 900 ? 32 : 36, fill: th.ink, tracking: -1})}
            ${text(item.detail, 186, yy + 98, {role: 'body', weight: 450, size: cw < 900 ? 22 : 25, fill: th.muted})}
          </g>`;
        });
        return out;
      }
      case 'cta': {
        let out = `<defs><linearGradient id="ctaG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${th.accent}"/><stop offset="1" stop-color="#4C5CE0"/></linearGradient></defs>`;
        out += rect(84, 380, 912, 1000, {fill: 'url(#ctaG)', rx: 30});
        out += `<g opacity="${round(easeOut(unlerp(t, 8, 28)))}" transform="translate(0 ${round((1 - spring(unlerp(t, 8, 34))) * 34)})">`;
        out += text(s.kicker || 'BURE', 132, 470, {role: 'mono', weight: 700, size: 26, fill: '#DFFC77', tracking: 4});
        out += headlineBlock(s.headline, 132, 510, {size: 82, maxWidth: 820, maxLines: 3, fill: '#FFFFFF', max: 900}).svg;
        if (s.line) out += bodyBlock(s.line, 132, 900, {size: 31, maxWidth: 780, maxLines: 3, fill: '#FFFFFFCC'}).svg;
        out += text('Comment', 132, 1120, {role: 'body', weight: 500, size: 29, fill: '#FFFFFFB0'});
        out += text(s.keyword || spec.keyword, 132, 1250, {role: 'head', weight: 780, size: 96, fill: '#DFFC77', tracking: -2});
        out += '</g>';
        return out;
      }
    }
    return '';
  };
  return render();
}

/* ---------------------------- TRACK 2 ---------------------------- */

function track2Frame(spec, s, t, images, track) {
  const th = track.theme;
  const hair = (y) => line(84, y, 996, y, {stroke: th.ink, sw: 2, o: 0.18});
  switch (s.type) {
    case 'cover': {
      const art = coverFrame({track, images, spec, kicker: s.kicker});
      const copy = coverText({...s, eyebrow: s.eyebrow || s.episode || 'BUSINESS STORY'}, {
        th, bottom: 1424, gap: 22, headlineSize: 96, maxLines: 4, tracking: -3.2, role: 'serif', weight: 800,
      });
      return art + `<g opacity="${round(clamp(spring(unlerp(t, 6, 32)) * 1.5))}" transform="translate(0 ${round((1 - spring(unlerp(t, 6, 36))) * 44)})">` + copy + '</g>' + hair(T_BOTTOM - 8);
    }
    case 'clip': {
      return A.clipPanel(clipImage(spec, s.clip), t, {
        x: 84, y: 336, w: 912, h: 500, label: spec.clips?.[s.clip]?.label, sublabel: spec.clips?.[s.clip]?.credit, palette: th, angle: 0, dur: 330, dark: true,
      }) +
        headlineBlock(s.headline, 84, 900, {size: 66, maxWidth: 900, maxLines: 3, fill: th.ink, tracking: -2.4, max: 1290}).svg +
        (s.kicker ? labelText(s.kicker, 84, 1370, {fill: th.muted, size: 21, o: 0.8}) : '');
    }
    case 'article': {
      return (s.kicker ? labelText(s.kicker, 84, T_TOP, {fill: th.accent, size: 23}) : '') +
        A.articleClip(t, {
          masthead: s.masthead, date: s.date, headline: s.headline, dek: s.dek, source: s.source,
          x: 84, y: T_TOP + 30, w: 912, h: 500, angle: s.angle ?? -1.4, highlight: s.mark, highlightAt: s.markAt ?? 92,
          palette: {paper: '#F3EEE2', ink: '#211E19', rule: '#161827', mark: th.accent},
        }) +
        headlineBlock(s.line, 84, 950, {size: 60, maxWidth: 900, maxLines: 3, fill: th.ink, tracking: -2, max: 1230}).svg +
        (s.note ? bodyBlock(s.note, 84, 1250, {size: 28, maxWidth: 860, maxLines: 3, fill: th.muted}).svg : '');
    }
    case 'timeline': {
      return (s.kicker ? labelText(s.kicker, 84, T_TOP, {fill: th.accent, size: 23}) : '') +
        headlineBlock(s.headline, 84, T_TOP + 34, {size: 62, maxWidth: 900, maxLines: 2, fill: th.ink, tracking: -2, max: 580}).svg +
        A.timeline(t, {
          events: s.events, x: 120, y: 640, palette: th, start: 40, step: 30, w: 780,
          // A 3-event timeline used to overflow the frame: 3 x 196 ends at y=1128, and the
          // third title then runs under the caption band. Fit the rail to the space that is
          // actually left, so the number of beats never decides whether the last one is legible.
          gap: s.gap || Math.min(196, Math.floor((1400 - 700) / Math.max(1, s.events.length - 1))),
        });
    }
    case 'chart': {
      return (s.kicker ? labelText(s.kicker, 84, T_TOP, {fill: th.accent, size: 23}) : '') +
        headlineBlock(s.headline, 84, T_TOP + 34, {size: 60, maxWidth: 900, maxLines: 2, fill: th.ink, tracking: -2, max: 560}).svg +
        A.lineChart(t, {series: s.series, x: 96, y: 620, w: 880, h: 480, palette: {...th, line: s.color || th.accent}, start: 40, dur: 130, yLabel: s.yLabel, xLabels: s.xLabels, annotate: s.annotate}) +
        (s.note ? bodyBlock(s.note, 96, 1180, {size: 27, maxWidth: 860, maxLines: 3, fill: th.muted}).svg : '') +
        (s.source ? text(s.source, 96, 1370, {role: 'mono', weight: 550, size: 19, fill: th.muted, o: 0.8}) : '');
    }
    case 'quote': {
      return `<g opacity="${round(clamp(spring(unlerp(t, 10, 34)) * 1.3))}" transform="translate(0 ${round((1 - spring(unlerp(t, 10, 36))) * 26)})">` +
        (s.kicker ? labelText(s.kicker, 84, T_TOP, {fill: th.accent, size: 23}) : '') +
        text('“', 78, 620, {role: 'serif', weight: 800, size: 220, fill: th.accent, o: 0.92}) +
        headlineBlock(s.text, 84, 640, {role: 'serif', weight: 700, size: 72, maxWidth: 880, maxLines: 6, fill: th.ink, tracking: -1.6, lineHeight: 1.1, max: 1180}).svg +
        (s.attrib ? text('— ' + s.attrib, 84, 1250, {role: 'body', weight: 550, size: 31, fill: th.muted}) : '') +
        (s.source ? text(s.source, 84, 1300, {role: 'mono', weight: 550, size: 19, fill: th.muted, o: 0.75}) : '') + '</g>';
    }
    case 'stat': {
      const n = Math.round(lerp(0, s.value, easeOut(unlerp(t, 24, 96))));
      const numStr = `${s.prefix || ''}${n.toLocaleString('en-US')}${s.suffix || ''}`;
      const nf = fit(numStr, {role: 'serif', weight: 800, size: 210, maxWidth: 880, maxLines: 1, tracking: -8, minSize: 92});
      let out = `<g opacity="${round(easeOut(unlerp(t, 14, 32)))}" transform="translate(0 ${round((1 - spring(unlerp(t, 14, 40))) * 26)})">`;
      if (s.kicker) out += labelText(s.kicker, 84, T_TOP, {fill: th.accent, size: 23});
      out += text(numStr, 84, 600, {role: 'serif', weight: 800, size: nf.size, fill: th.ink, tracking: -8});
      out += headlineBlock(s.line, 84, 640, {size: 52, maxWidth: 870, maxLines: 3, fill: th.ink, tracking: -1.8, max: 980}).svg;
      if (s.note) out += bodyBlock(s.note, 84, 990, {size: 29, maxWidth: 850, maxLines: 4, fill: th.muted}).svg;
      if (s.source) out += text(s.source, 84, 1300, {role: 'mono', weight: 550, size: 19, fill: th.muted, o: 0.8});
      return out + '</g>';
    }
    case 'cta': {
      let out = `<g opacity="${round(easeOut(unlerp(t, 8, 26)))}" transform="translate(0 ${round((1 - spring(unlerp(t, 8, 34))) * 30)})">`;
      out += rect(84, 380, 912, 1000, {fill: th.card, rx: 26, stroke: th.cardEdge, sw: 2});
      out += text(s.kicker || 'NEXT EPISODE', 132, 480, {role: 'mono', weight: 700, size: 24, fill: th.accent, tracking: 4});
      out += headlineBlock(s.headline, 132, 520, {size: 78, maxWidth: 820, maxLines: 3, fill: th.ink, tracking: -2.6, max: 860}).svg;
      if (s.line) out += bodyBlock(s.line, 132, 880, {size: 30, maxWidth: 780, maxLines: 3, fill: th.muted}).svg;
      if (s.note) out += text(s.note, 132, 1120, {role: 'body', weight: 520, size: 30, fill: th.muted});
      if (s.next) out += text(s.next, 132, 1190, {role: 'mono', weight: 700, size: 24, fill: th.accent, tracking: 2.4});
      out += '</g>';
      return out;
    }
  }
  return '';
}

/* ---------------------------- TRACK 3 ---------------------------- */

function track3Frame(spec, s, t, images, track) {
  const th = track.theme;
  switch (s.type) {
    case 'cover': {
      const art = coverFrame({track, images, spec, kicker: s.kicker});
      const copy = coverText(s, {th, bottom: 1424, gap: 20, headlineSize: 100, maxLines: 4, tracking: -4});
      return art + `<g opacity="${round(clamp(spring(unlerp(t, 6, 30)) * 1.6))}" transform="translate(0 ${round((1 - spring(unlerp(t, 6, 34))) * 40)})">` + copy + '</g>';
    }
    case 'compare': {
      return (s.kicker ? labelText(s.kicker, 84, T_TOP, {fill: th.accent, size: 22, o: 0.95}) : '') +
        headlineBlock(s.headline, 84, T_TOP + 34, {size: 66, maxWidth: 900, maxLines: 2, fill: th.ink, tracking: -2.6, max: 570}).svg +
        A.compareTable(t, {columns: s.columns, rows: s.rows, x: 84, y: 600, w: 912, rowH: s.rowH || 138, palette: th, start: 36, step: 16, verdict: s.verdict});
    }
    case 'bars': {
      return (s.kicker ? labelText(s.kicker, 84, T_TOP, {fill: th.accent, size: 22}) : '') +
        headlineBlock(s.headline, 84, T_TOP + 34, {size: 66, maxWidth: 900, maxLines: 2, fill: th.ink, tracking: -2.6, max: 570}).svg +
        A.specBars(t, {items: s.items, x: 100, y: 660, w: 880, gap: 116, palette: th, start: 40, step: 22, unit: s.unit || '', max: s.max}) +
        (s.note ? bodyBlock(s.note, 84, 1260, {size: 26, maxWidth: 860, maxLines: 3, fill: th.muted}).svg : '');
    }
    case 'demo': {
      return (s.kicker ? pill(String(s.kicker).toUpperCase(), 84, T_TOP, {size: 23, padX: 16, padY: 9, fill: th.ink, ink: '#FFFFFF', tracking: 2.2}).svg : '') +
        headlineBlock(s.headline, 84, T_TOP + 74, {size: 68, maxWidth: 900, maxLines: 2, fill: th.ink, tracking: -2.6, max: 650}).svg +
        A.clipPanel(clipImage(spec, s.clip), t, {x: 84, y: 680, w: 912, h: 560, label: spec.clips?.[s.clip]?.label, sublabel: spec.clips?.[s.clip]?.credit, palette: th, angle: 0.8, dur: 330}) +
        (s.line ? bodyBlock(s.line, 84, 1280, {size: 26, maxWidth: 880, maxLines: 2, fill: th.muted}).svg : '');
    }
    case 'roi': {
      return (s.kicker ? labelText(s.kicker, 84, T_TOP, {fill: th.accent, size: 22}) : '') +
        A.counterCard(t, {label: s.labelA, to: s.toA, from: s.fromA || 0, prefix: s.prefixA, suffix: s.suffixA, x: 84, y: 400, w: 430, h: 230, palette: th, start: 22, dur: 76}) +
        A.counterCard(t, {label: s.labelB, to: s.toB, from: s.fromB || 0, prefix: s.prefixB, suffix: s.suffixB, x: 566, y: 400, w: 430, h: 230, palette: th, start: 34, dur: 76}) +
        rect(84, 680, 912, 400, {fill: th.card, rx: 22, stroke: th.cardEdge, sw: 2}) +
        headlineBlock(s.headline, 128, 730, {size: 56, maxWidth: 820, maxLines: 3, fill: th.ink, tracking: -2, max: 960}).svg +
        (s.line ? bodyBlock(s.line, 128, 990, {size: 27, maxWidth: 800, maxLines: 2, fill: th.muted}).svg : '');
    }
    case 'checklist': {
      let out = (s.kicker ? labelText(s.kicker, 84, T_TOP, {fill: th.accent, size: 22}) : '') +
        headlineBlock(s.headline, 84, T_TOP + 34, {size: 66, maxWidth: 900, maxLines: 2, fill: th.ink, tracking: -2.6, max: 600}).svg;
      const cw = textWidth(s, 912);
      const rowH = cw < 900 ? 150 : 160, cardH = cw < 900 ? 128 : 136;
      const blockH3 = (s.items.length - 1) * rowH + cardH;
      const y03 = Math.round(620 + Math.max(0, (T_BOTTOM - 620 - blockH3) / 2));
      // reveal each row with its line: if the scene has cues, item i lands on cue i
      const beats = s.cues?.length === s.items.length ? s.cues.map((c) => c.in) : null;
      s.items.forEach((item, i) => {
        const rv = reveal(t, beats ? beats[i] : 40 + i * 22, 20);
        const yy = y03 + i * rowH;
        out += `<g opacity="${round(rv.o)}" transform="translate(${round((1 - rv.p) * 30)} 0)">
          ${rect(84, yy, cw, cardH, {fill: th.card, rx: 16, stroke: th.cardEdge, sw: 2})}
          ${rect(84, yy, 10, cardH, {fill: i % 2 ? th.ink : th.accent, rx: 4})}
          ${text(item.title, 130, yy + 52, {role: 'head', weight: 720, size: cw < 900 ? 34 : 38, fill: th.ink, tracking: -1.2})}
          ${text(item.detail, 130, yy + 94, {role: 'body', weight: 450, size: cw < 900 ? 23 : 26, fill: th.muted})}
        </g>`;
      });
      return out;
    }
    case 'cta': {
      let out = `<g opacity="${round(easeOut(unlerp(t, 8, 26)))}" transform="translate(0 ${round((1 - spring(unlerp(t, 8, 34))) * 30)})">`;
      out += rect(84, 380, 912, 1000, {fill: th.ink, rx: 26});
      out += text(s.kicker || 'FREE', 132, 480, {role: 'mono', weight: 700, size: 24, fill: th.accent, tracking: 4});
      out += headlineBlock(s.headline, 132, 520, {size: 76, maxWidth: 820, maxLines: 3, fill: '#FFFFFF', tracking: -2.8, max: 860}).svg;
      if (s.line) out += bodyBlock(s.line, 132, 880, {size: 30, maxWidth: 780, maxLines: 3, fill: '#FFFFFFB8'}).svg;
      out += text('Comment', 132, 1100, {role: 'body', weight: 500, size: 28, fill: '#FFFFFFA8'});
      out += text(s.keyword || spec.keyword, 132, 1230, {role: 'head', weight: 780, size: 92, fill: th.accent, tracking: -2});
      out += '</g>';
      return out;
    }
  }
  return '';
}

/* ---------------------------- exported render ---------------------------- */

/** Story track chrome: a faint masthead so the feed still reads as one channel,
 *  but no grid, no card, no footer — a story should feel filmed, not templated. */
function storyChrome(spec, scene, th, t) {
  const o = easeOut(unlerp(t, 0, 20));
  const closing = scene?.type === 'cta';
  // The closing card is the only place a keyword appears: a story earns the follow, it does
  // not interrupt itself with a CTA in the middle.
  const cta = closing ? (() => {
    const p = easeOut(unlerp(t, 54, 84));
    if (p <= 0) return '';
    const w = measure(spec.keyword || 'CV', {role: 'mono', weight: 800, size: 30, tracking: 3}) + 52;
    return `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 24)})">
      ${rect(84, 1660, w, 62, {fill: th.accent, rx: 8})}
      ${text(spec.keyword || 'CV', 84 + w / 2, 1702, {role: 'mono', weight: 800, size: 30, fill: '#1C130E', anchor: 'middle', tracking: 3})}
      ${text(spec.ctaLine || 'Andika CV kwenye DM', 84 + w + 26, 1702, {role: 'head', weight: 700, size: 40, fill: th.chromeInk, tracking: -1})}
    </g>`;
  })() : '';
  // NB: both opening tags above need their own close. A bare `</g>${cta}` here leaves the
  // masthead group open, which silently swallowed everything after it in the frame.
  return `<g opacity="${round(o * 0.85)}">
    ${text((spec.series || 'MJOMBA DAUDI').toUpperCase(), 84, 148, {role: 'mono', weight: 700, size: 22, fill: th.chromeMuted, tracking: 4})}
    ${text((spec.brand?.handle || '@mwijay__davie'), 996, 148, {role: 'mono', weight: 600, size: 22, fill: th.chromeMuted, anchor: 'end', tracking: 1})}
    ${spec.episodeNo ? text(`SURA ${spec.episodeNo}`, 996, 186, {role: 'mono', weight: 700, size: 20, fill: th.chromeAccent, anchor: 'end', tracking: 3}) : ''}
  </g>`;
}

/** Closing call-to-action. Painted AFTER the story body: the body's warm wash covers the
 *  whole frame, so anything drawn before it is invisible. */
function storyCta(spec, scene, th, t) {
  if (scene?.type !== 'cta') return '';
  const p = easeOut(unlerp(t, 54, 84));
  if (p <= 0) return '';
  const w = measure(spec.keyword || 'CV', {role: 'mono', weight: 800, size: 30, tracking: 3}) + 52;
  return `<g opacity="${round(p)}" transform="translate(0 ${round((1 - p) * 24)})">
    ${rect(84, 1660, w, 62, {fill: th.accent, rx: 8})}
    ${text(spec.keyword || 'CV', 84 + w / 2, 1702, {role: 'mono', weight: 800, size: 30, fill: '#1C130E', anchor: 'middle', tracking: 3})}
    ${text(spec.ctaLine || 'Andika CV kwenye DM', 84 + w + 26, 1702, {role: 'head', weight: 700, size: 40, fill: th.chromeInk, tracking: -1})}
  </g>`;
}

const RENDERERS = {1: track1Frame, 2: track2Frame, 3: track3Frame, 4: story, 5: altraware, 6: light};

/** Throws if a rendered frame has unbalanced <g> tags — an unclosed group is silent in SVG. */
export function assertBalanced(svg) {
  const open = (svg.match(/<g[\s>]/g) || []).length;
  const close = (svg.match(/<\/g>/g) || []).length;
  if (open !== close) throw new Error(`unbalanced <g>: ${open} open / ${close} close`);
  return true;
}

/**
 * Render one composition frame to an SVG string.
 * spec: {track, keyword, brand:{handle}, clips:{}, scenes:[...]}
 */
export function renderFrame(spec, frame, {mark, images = {}} = {}) {
  const track = TRACKS[spec.track];
  if (!track) throw new Error(`unknown track ${spec.track}`);
  const total = spec.scenes.length;
  const spf = framesPerScene(spec);
  const starts = sceneStarts(spec);
  const totalFrames = starts[total - 1] + sceneFrames(spec, total - 1);
  let idx = 0;
  for (let i = 0; i < total; i++) if (frame >= starts[i]) idx = i;
  const scene = spec.scenes[idx];
  const t = frame - starts[idx];
  const th = track.theme;
  const render = RENDERERS[spec.track];
  const body = render(spec, scene, t, images, track);

  // Nia, the account character. A scene opts in with `nia:{...}`; the first and last
  // scenes default to her so every Reel opens and closes on the same face.
  let cast = '';
  if (spec.character !== false && spec.track !== 4 && spec.track !== 5 && spec.track !== 6) {
    // The track-2 CTA fills the safe width with a card, so the default corner drops her on
    // the headline. Beside the card's lower edge reads as a signing-off pose.
    const ctaDefault = spec.track === 2 ? {x: 942, y: 1436, scale: 0.52, pose: 'nod'} : {pose: 'present'};
    const cfg = scene.nia ?? ((idx === 0 || idx === total - 1) ? (idx === 0 ? {pose: 'perk'} : ctaDefault) : null);
    if (cfg) {
      const {pose, since} = poseAt(scene, t);
      const talking = activeCue(scene.cues, t) ? 1 : 0;
      // if the spec carries a lip-sync track, Nia's mouth follows the mix frame by frame
      const mt = spec.mouthTrack && MOUTH_TRACKS[spec.mouthTrack];
      const mouth = mt ? (mt.mouth[Math.min(mt.frames - 1, Math.max(0, Math.round(frame)))] ?? 0) : null;
      cast = nia(since, {
        x: cfg.x ?? 858, y: cfg.y ?? 700, scale: cfg.scale ?? 0.92,
        pose: cfg.pose || pose, accent: cfg.accent || th.accent, tab: cfg.tab || th.accent2,
        ink: track.layout === 'dark' ? '#0B0D18' : th.ink, talk: talking, mouth,
        label: cfg.label ?? 'NIA',
      });
    }
  }

  // master fade in and out
  const fade = Math.min(easeOut(unlerp(frame, 0, 8)), 1 - easeInOut(unlerp(frame, totalFrames - 10, totalFrames - 1)));
  const cue = scene.cues && !spec.noCaptions && spec.track !== 5 && spec.track !== 6 ? activeCue(scene.cues, t) : null;
  const move = transition(moveFor(spec, idx), frame, sceneFrames(spec, idx), th.accent);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000000" flood-opacity="0.22"/>
    </filter>
    <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <g opacity="${round(fade)}">
    ${move.outer}
      ${spec.track === 4 ? '' : background(track, spec, t, images)}
      ${spec.track === 4 ? storyChrome(spec, scene, th, t) : spec.track === 5 || spec.track === 6 ? '' : A.brandBar({mark, theme: th, t, handle: spec.brand?.handle || '@mwijay__davie'})}
      ${body}
      ${cast}
      ${spec.track === 4 ? storyCta(spec, scene, th, t) : ''}
      ${cue ? A.captions({...cue, out: cue.out}, t, {theme: th, size: scene.captionSize || 50}) : ''}
      ${spec.track === 4 || spec.track === 5 || spec.track === 6 || scene.footerCta === false || !(idx === 0 || idx === total - 1) ? '' : A.footer({
        keyword: scene.keywordFooter || spec.keyword,
        line1: scene.footerLine || spec.footerLine || 'Free file in DM.',
        theme: th, t, start: idx === 0 ? 60 : 150,
        note: scene.footerNote || (scene.source ? `${scene.source}.` : spec.footerNote),
      })}
    ${move.close || ''}
    ${move.bar || ''}
  </g>
  ${ticks(spec.track, {color: th.chromeInk, o: 0.16})}
  <rect x="0" y="${H - 6}" width="${round(W * clamp(frame / Math.max(1, totalFrames - 1)))}" height="6" fill="${th.accent}"/>
</svg>`;
  assertBalanced(svg);
  return svg;
}

export function activeCue(cues, t) {
  let found = null;
  for (const c of cues) {
    if (t >= c.in && t <= c.out) found = c;
  }
  return found;
}

export const totalFrames = (spec) => { const st = sceneStarts(spec); return st.at(-1) + sceneFrames(spec, spec.scenes.length - 1); };
