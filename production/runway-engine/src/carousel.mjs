// 1080x1350 carousel slides that reuse the same type system as the Reel, so a feed
// and its Reel look related without being the same layout.
import {
  W, clamp, lerp, unlerp, easeOut, spring, rect, circle, line, text, block, pill, arrow, round,
  measure, fit, gridLines, ticks, readImage,
} from './core.mjs';
import {TRACKS} from './templates.mjs';

export const CW = 1080;
export const CH = 1350;
export const carouselSize = () => ({width: CW, height: CH});

export function renderCarouselSlide(spec, index, {mark, images = {}} = {}) {
  const track = TRACKS[spec.track];
  const handle = spec.brand?.handle || '@mwijay__davie';
  const th = track.theme;
  const slides = spec.carousel?.slides || [];
  const s = slides[index];
  const total = slides.length;
  const im = s.image ? readImage(s.image) : null;
  let out = rect(0, 0, CW, CH, {fill: th.bg});
  if (track.layout === 'dark') {
    out += `<defs><radialGradient id="cg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#2B3566" stop-opacity="0.6"/><stop offset="1" stop-color="#0B0D18" stop-opacity="0"/></radialGradient></defs>`;
    out += `<ellipse cx="820" cy="520" rx="620" ry="560" fill="url(#cg)"/>`;
    out += gridLines({w: CW, h: CH, step: 90, color: '#FFFFFF', o: 0.03});
  } else if (track.layout === 'idea') {
    out += gridLines({w: CW, h: CH, step: 66, color: '#20242E', o: 0.04});
    out += rect(0, 520, CW, 6, {fill: th.ink});
    out += rect(0, 538, 420, 6, {fill: th.accent});
  } else {
    out += gridLines({w: CW, h: CH, step: 72, color: '#161827', o: 0.05});
    out += `<ellipse cx="900" cy="180" rx="520" ry="420" fill="${th.accent}" opacity="0.06"/>`;
  }

  // header
  out += mark
    ? `<g transform="translate(72 84)"><clipPath id="mk2"><circle cx="24" cy="24" r="24"/></clipPath><image href="${mark}" width="48" height="48" clip-path="url(#mk2)"/></g>`
    : circle(96, 108, 24, {fill: th.accent});
  out += text('MWIJAY DAVIE', 136, 118, {role: 'head', weight: 730, size: 25, fill: th.chromeInk, tracking: 0.6});
  out += text(`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, CW - 72, 118, {role: 'mono', weight: 650, size: 22, fill: th.chromeMuted, anchor: 'end', tracking: 1.4});

  if (s.type === 'cover') {
    if (im || images.cover) {
      out += `<g clip-path="url(#cimg)"><image href="${im || images.cover}" x="0" y="180" width="${CW}" height="620" preserveAspectRatio="xMidYMid slice"/></g>`;
      out += `<defs><clipPath id="cimg"><rect x="0" y="180" width="${CW}" height="620"/></clipPath>
        <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="${th.bg}" stop-opacity="0"/><stop offset="1" stop-color="${th.bg}" stop-opacity="1"/></linearGradient></defs>`;
      out += rect(0, 180, CW, 620, {fill: 'url(#cf)'});
    } else {
      out += rect(620, 240, 380, 380, {fill: th.accent, rx: 24, o: 0.9});
      out += circle(300, 520, 170, {fill: th.accent2, o: 0.24});
    }
    if (s.kicker) out += pill(s.kicker, 72, 690, {size: 24, padX: 16, padY: 10, fill: th.accent, ink: track.layout === 'dark' ? '#111521' : '#FFFFFF', tracking: 2.4}).svg;
    const f = fit(s.headline, {role: track.layout === 'dark' ? 'serif' : 'head', weight: 780, size: 96, maxWidth: 936, maxLines: 4, tracking: -3.6, lineHeight: 1.0});
    out += f.lines.map((l, i) => text(l, 72, 800 + i * f.size * 1.02, {role: track.layout === 'dark' ? 'serif' : 'head', weight: 780, size: f.size, fill: th.ink, tracking: -3.6})).join('');
    if (s.sub) out += block(s.sub, 72, 800 + f.lines.length * f.size * 1.02 + 16, {role: 'body', weight: 470, size: 33, fill: th.muted, maxWidth: 920, maxLines: 3, lineHeight: 1.3}).svg;
    out += swipeCue(th, track);
  } else if (s.type === 'list') {
    const role = track.layout === 'dark' ? 'serif' : 'head';
    out += block(s.headline, 72, 250, {role, weight: 780, size: 70, fill: th.ink, maxWidth: 930, maxLines: 3, tracking: -2.4}).svg;
    s.items.forEach((item, i) => {
      const yy = 470 + i * 190;
      out += `<g>${rect(72, yy, 936, 164, {fill: th.card, rx: 16, stroke: th.cardEdge, sw: 2})}
        ${circle(124, yy + 82, 32, {fill: i % 2 ? th.card : th.accent, stroke: th.cardEdge, sw: 2})}
        ${text(String(i + 1), 124, yy + 94, {role: 'mono', weight: 700, size: 28, fill: i % 2 ? th.ink : (track.layout === 'dark' ? '#111521' : '#FFFFFF'), anchor: 'middle'})}
        ${text(item.title, 176, yy + 70, {role: 'head', weight: 720, size: 36, fill: th.ink, tracking: -1})}
        ${block(item.detail, 176, yy + 116, {role: 'body', weight: 450, size: 25, fill: th.muted, maxWidth: 790, maxLines: 2, lineHeight: 1.3}).svg}
      </g>`;
    });
    out += swipeCue(th, track);
  } else if (s.type === 'quote') {
    out += text('“', 72, 420, {role: 'serif', weight: 800, size: 200, fill: th.accent});
    out += block(s.text, 72, 540, {role: 'serif', weight: 700, size: 66, fill: th.ink, maxWidth: 930, maxLines: 6, tracking: -1.4, lineHeight: 1.14}).svg;
    if (s.attrib) out += text('— ' + s.attrib, 72, 1180, {role: 'body', weight: 550, size: 30, fill: th.muted});
    if (s.source) out += text(s.source, 72, 1230, {role: 'mono', weight: 550, size: 20, fill: th.muted, o: 0.8});
    out += swipeCue(th, track);
  } else if (s.type === 'save') {
    out += rect(72, 240, 936, 760, {fill: th.accent, rx: 24});
    out += block(s.headline, 120, 380, {role: 'head', weight: 780, size: 78, fill: track.layout === 'dark' ? '#111521' : '#FFFFFF', maxWidth: 840, maxLines: 4, tracking: -3}).svg;
    if (s.line) out += block(s.line, 120, 760, {role: 'body', weight: 500, size: 32, fill: track.layout === 'dark' ? '#111521CC' : '#FFFFFFD0', maxWidth: 800, maxLines: 4, lineHeight: 1.3}).svg;
    out += text(`Comment ${spec.keyword}`, 120, 940, {role: 'mono', weight: 700, size: 34, fill: track.layout === 'dark' ? '#111521' : '#FFFFFF', tracking: 1.6});
    out += `<g transform="translate(72 1060)">${s.source ? text(s.source, 0, 0, {role: 'mono', weight: 550, size: 19, fill: th.muted}) : ''}</g>`;
  } else if (s.type === 'cta') {
    out += rect(72, 240, 936, 820, {fill: th.ink, rx: 24});
    out += text(s.kicker || 'FREE', 120, 340, {role: 'mono', weight: 700, size: 24, fill: th.accent, tracking: 4});
    out += block(s.headline, 120, 470, {role: 'head', weight: 780, size: 76, fill: '#FFFFFF', maxWidth: 840, maxLines: 4, tracking: -2.6}).svg;
    if (s.line) out += block(s.line, 120, 760, {role: 'body', weight: 450, size: 30, fill: '#FFFFFFB8', maxWidth: 800, maxLines: 3, lineHeight: 1.32}).svg;
    out += text('Comment', 120, 940, {role: 'body', weight: 500, size: 28, fill: '#FFFFFFA8'});
    out += text(spec.keyword, 120, 1050, {role: 'head', weight: 780, size: 88, fill: th.accent, tracking: -2});
    out += text(handle, 936, 1050, {role: 'mono', weight: 650, size: 26, fill: '#FFFFFF80', anchor: 'end'});
    if (s.source) out += text(s.source, 120, 1112, {role: 'mono', weight: 550, size: 19, fill: '#FFFFFF70'});
  } else {
    throw new Error(`unknown carousel slide type: ${s.type}`);
  }

  out += line(72, CH - 118, CW - 72, CH - 118, {stroke: th.chromeInk, sw: 2, o: 0.16});
  out += text(handle, 72, CH - 62, {role: 'mono', weight: 600, size: 22, fill: th.chromeMuted, tracking: 0.4});
  out += text(spec.carousel?.label || track.name, CW - 72, CH - 62, {role: 'mono', weight: 650, size: 20, fill: th.chromeMuted, anchor: 'end', tracking: 2});
  out += ticks(`c${index}`, {color: th.chromeInk, o: 0.14});
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">
    <defs><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity="0.2"/></filter></defs>
    ${out}</svg>`;
}

function swipeCue(th, track) {
  const y = CH - 190;
  return `<g opacity="0.9">${text('SWIPE', 72, y, {role: 'mono', weight: 700, size: 22, fill: th.chromeInk, tracking: 2.4})}
    ${arrow(196, y - 7, 262, y - 7, {stroke: th.chromeInk, sw: 3, head: 11, o: 0.85})}
    ${line(72, y + 22, 260, y + 22, {stroke: th.chromeInk, sw: 2, o: 0.3})}</g>`;
}
