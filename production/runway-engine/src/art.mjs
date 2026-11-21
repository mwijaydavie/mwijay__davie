// Motion-graphics props. Every prop is a pure function of (props, t) where t is the
// frame index inside the scene. Nothing reads the clock, the network or global CSS.
import {
  W, H, clamp, lerp, unlerp, easeOut, easeInOut, spring, between, reveal,
  rect, circle, line, text, block, pill, arrow, roundedPath, attrs, round, measure, fit,
  fontFiles, FAMILY, pick, hash01,
} from './core.mjs';

/* ---------------- floating "real-world clip" panel ---------------- */

/**
 * A real still/video frame (image file) cropped into a card with a slow, deterministic
 * Ken-Burns push. `label` states what the clip is and its rights status.
 */
export function clipPanel(img, t, {
  x = 84, y = 640, w = 912, h = 520, label, sublabel, radius = 22,
  palette = {}, dur = 240, push = 0.055, angle = -1.2, dark = false,
} = {}) {
  const t0 = 18;
  const p = spring(unlerp(t, t0, t0 + 26));
  if (p <= 0.001) return '';
  const sc = 1.02 + push * clamp((t - t0) / Math.max(1, dur));
  const dx = -w * (sc - 1) * 0.5 + (hash01(label || 'clip') - 0.5) * 8;
  const dy = -h * (sc - 1) * 0.42;
  const inner = img
    ? `<g transform="translate(${round(x + w / 2 + dx)} ${round(y + h / 2 + dy)}) scale(${round(sc * 1000) / 1000}) translate(${round(-w / 2)} ${round(-h / 2)})">
         <image href="${img}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>
       </g>`
    : `<g><rect x="0" y="0" width="${w}" height="${h}" fill="${palette.placeholder || '#232A44'}"/>
         ${text('CLIP', w / 2, h / 2, {role: 'mono', weight: 700, size: 34, fill: '#8C93B4', anchor: 'middle', tracking: 6})}</g>`;
  const clipId = `cl${Math.round(x)}${Math.round(y)}`;
  return `<g opacity="${round(p)}" transform="translate(${round(x + w / 2)} ${round(y + h / 2)}) rotate(${angle}) translate(${round(-w / 2)} ${round(-h / 2)})">
    <defs><clipPath id="${clipId}"><rect x="0" y="0" width="${w}" height="${h}" rx="${radius}"/></clipPath></defs>
    <g filter="url(#soft)"><rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="#0B0D18"/></g>
    <g clip-path="url(#${clipId})">${inner}
      <rect x="0" y="${h - 128}" width="${w}" height="128" fill="url(#fadeDown)"/>
    </g>
    <rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="none" stroke="${dark ? '#FFFFFF22' : '#16182722'}" stroke-width="2"/>
    ${label ? pill(label, 18, 18, {size: 22, padX: 14, padY: 9, fill: dark ? '#0E1220CC' : '#FFFFFFE6', ink: dark ? '#F8FAFC' : '#161827', stroke: dark ? '#FFFFFF33' : '#16182722', tracking: 1.4}) .svg : ''}
    ${sublabel ? text(sublabel, 20, h - 22, {role: 'mono', weight: 600, size: 21, fill: '#FFFFFFDD', tracking: 0.4}) : ''}
  </g>`;
}

/* ---------------- document / article clipping ---------------- */

export function articleClip(t, {
  masthead = 'THE BUSINESS DAILY', date = 'MARCH 2000', headline, dek, source,
  x = 84, y = 620, w = 912, h = 470, angle = -1.6, highlight, palette = {}, highlightAt = 70,
} = {}) {
  const p = spring(unlerp(t, 26, 26 + 22));
  if (p <= 0.001) return '';
  const hl = easeInOut(unlerp(t, highlightAt, highlightAt + 28));
  const body = fit(headline, {role: 'serif', weight: 800, size: 56, maxWidth: w - 96, maxLines: 3});
  const dekBody = dek ? fit(dek, {role: 'body', weight: 450, size: 25, maxWidth: w - 96, maxLines: 4, lineHeight: 1.22}) : null;
  const fake = [];
  const colW = (w - 96 - 34) / 2;
  for (let c = 0; c < 2; c++) {
    let y2 = 0;
    for (let i = 0; i < 11; i++) {
      const widthPct = 0.62 + ((hash01(`${source}${c}${i}`) * 38) / 100);
      fake.push(rect(48 + c * (colW + 34), 0, colW * widthPct, 8, {fill: palette.rule || '#C9C2B2', rx: 4, o: 0.55}));
      y2 += 17;
    }
    fake.push(`<g transform="translate(0 ${y2})"></g>`);
  }
  const hlY = 48 + body.size * 1.08 * body.lines.length - body.size * 0.92;
  const hlW = measure(body.lines[body.lines.length - 1], {role: 'serif', weight: 800, size: body.size});
  return `<g opacity="${round(p)}" transform="translate(${round(x + w / 2)} ${round(y + h / 2)}) rotate(${angle}) translate(${round(-w / 2)} ${round(-h / 2)})">
    <g filter="url(#soft)">${rect(0, 0, w, h, {fill: palette.paper || '#F3EEE2', rx: 6})}</g>
    ${rect(0, 0, w, h, {fill: 'none', stroke: '#16182718', rx: 6})}
    ${line(48, 64, w - 48, 64, {stroke: palette.rule || '#161827', sw: 2, o: 0.5})}
    ${text(masthead, 48, 44, {role: 'mono', weight: 700, size: 22, fill: palette.ink || '#2A2620', tracking: 3.2})}
    ${text(date, w - 48, 44, {role: 'mono', weight: 600, size: 20, fill: '#2A262099', anchor: 'end', tracking: 1.6})}
    ${body.lines.map((l, i) => text(l, 48, 48 + body.size + i * body.size * 1.08, {role: 'serif', weight: 800, size: body.size, fill: palette.ink || '#211E19', tracking: -0.8})).join('')}
    ${highlight ? `<rect x="${44}" y="${round(hlY - body.size * 0.16)}" width="${round(hlW * hl + 8)}" height="${round(body.size * 0.42)}" fill="${palette.mark || '#F5C445'}" opacity="${round(0.85 * hl)}" rx="3"/>` : ''}
    ${dekBody ? dekBody.lines.map((l, i) => text(l, 48, 48 + body.size + body.lines.length * body.size * 1.08 + 16 + i * dekBody.size * 1.22, {role: 'body', weight: 450, size: dekBody.size, fill: '#2A2620CC'})).join('') : ''}
    ${source ? text(source, 48, h - 26, {role: 'mono', weight: 600, size: 19, fill: '#2A262088', tracking: 0.4}) : ''}
  </g>`;
}

/* ---------------- animated line chart ---------------- */

export function lineChart(t, {
  series, x = 96, y = 700, w = 888, h = 400, palette = {}, start = 60, dur = 120,
  grid = 4, yLabel, xLabels = [], annotate, unit = '',
} = {}) {
  const p = easeInOut(unlerp(t, start, start + dur));
  if (p <= 0.001 && t < start) return '';
  const max = Math.max(...series.map((s) => s.value));
  const min = Math.min(0, ...series.map((s) => s.value));
  const padX = 8, padTop = 26, padBottom = 44;
  const px = (i) => x + padX + ((w - padX * 2) * i) / Math.max(1, series.length - 1);
  const py = (v) => y + h - padBottom - ((h - padBottom - padTop) * (v - min)) / Math.max(1e-9, max - min);
  let out = '';
  for (let i = 0; i <= grid; i++) {
    const gy = y + padTop + ((h - padBottom - padTop) * i) / grid;
    out += line(x, gy, x + w, gy, {stroke: palette.grid || '#FFFFFF18', sw: 1});
  }
  out += line(x, y + h - padBottom, x + w, y + h - padBottom, {stroke: palette.axis || '#FFFFFF44', sw: 2});
  // draw the visible portion of each segment
  let path = `M${round(px(0))},${round(py(series[0].value))}`;
  const total = series.length - 1;
  const shown = p * total;
  for (let i = 1; i <= total; i++) {
    const seg = clamp(shown - (i - 1));
    if (seg <= 0) break;
    const x1 = px(i - 1), y1 = py(series[i - 1].value);
    const x2 = lerp(px(i - 1), px(i), seg), y2 = lerp(py(series[i - 1].value), py(series[i].value), seg);
    path += ` L${round(x2)},${round(y2)}`;
  }
  const area = `${path} L${round(lerp(px(0), px(Math.min(total, shown)), 1))},${round(y + h - padBottom)} L${round(px(0))},${round(y + h - padBottom)} Z`;
  out += `<defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${palette.line || '#DFFC77'}" stop-opacity="0.34"/><stop offset="1" stop-color="${palette.line || '#DFFC77'}" stop-opacity="0"/></linearGradient></defs>`;
  out += `<path d="${area}" fill="url(#areaG)"/>`;
  out += `<path d="${path}" fill="none" stroke="${palette.line || '#DFFC77'}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  series.forEach((s, i) => {
    const at = clamp(shown - i + 1);
    const o = easeOut(clamp(at * 1.6));
    if (o <= 0.01) return;
    out += circle(px(i), py(s.value), 9, {fill: palette.dotFill || '#0E1220', stroke: palette.line || '#DFFC77', sw: 5, o});
    if (s.label) out += text(s.label, px(i), py(s.value) - 26, {role: 'mono', weight: 700, size: 26, fill: palette.label || '#FFFFFF', anchor: 'middle', o, tracking: 0.4});
  });
  // last point pulse
  const lastShown = Math.floor(shown);
  if (lastShown >= 0 && shown > 0.02) {
    const lx = px(Math.min(total, shown - (shown % 1)));
    const ly = py(series[Math.min(total, Math.floor(shown))].value);
    const pulse = ((t * 0.02) % 1);
    out += circle(lx, ly, 9 + pulse * 26, {fill: 'none', stroke: palette.line || '#DFFC77', sw: 3, o: 0.5 * (1 - pulse)});
  }
  xLabels.forEach((l, i) => {
    const idx = Math.round((i / Math.max(1, xLabels.length - 1)) * total);
    out += text(l, px(idx), y + h - 12, {role: 'mono', weight: 600, size: 21, fill: palette.axisLabel || '#FFFFFF8A', anchor: 'middle', tracking: 1});
  });
  if (yLabel) out += text(yLabel, x, y - 4, {role: 'mono', weight: 600, size: 21, fill: palette.axisLabel || '#FFFFFF8A', tracking: 1.2});
  if (annotate && p > 0.86) {
    const a = easeOut(unlerp(p, 0.86, 1));
    const idx = annotate.index ?? series.length - 1;
    out += `<g opacity="${round(a)}">${text(annotate.text, px(idx), py(series[idx].value) + 54, {role: 'mono', weight: 700, size: 24, fill: annotate.color || palette.line || '#DFFC77', anchor: 'middle'})}</g>`;
  }
  return out;
}

/* ---------------- number counter card ---------------- */

export function counterCard(t, {
  label, to, from = 0, prefix = '', suffix = '', x = 84, y = 700, w = 430, h = 210,
  palette = {}, start = 30, dur = 70, decimals = 0,
} = {}) {
  const p = spring(unlerp(t, start, start + dur));
  if (p <= 0.001) return '';
  const v = lerp(from, to, easeOut(unlerp(t, start, start + dur)));
  const num = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-US');
  const labelFit = fit(label, {role: 'mono', weight: 650, size: 22, maxWidth: w - 44, maxLines: 2, lineHeight: 1.2});
  const numSize = Math.min(96, Math.floor((w - 40) / Math.max(1, measure(`${prefix}${num}${suffix}`, {role: 'head', weight: 760, size: 100, tracking: -3}) / 100)));
  return `<g opacity="${round(easeOut(unlerp(t, start, start + 18)))}" transform="translate(0 ${round((1 - p) * 32)})">
    ${rect(x, y, w, h, {fill: palette.card || '#FFFFFF10', rx: 16, stroke: palette.cardEdge || '#FFFFFF26', sw: 1.5})}
    ${labelFit.lines.map((l, i) => text(l, x + 22, y + 40 + i * labelFit.size * 1.2, {role: 'mono', weight: 650, size: labelFit.size, fill: palette.muted || '#FFFFFF9E', tracking: 1.2})).join('')}
    ${text(`${prefix}${num}${suffix}`, x + 22, y + h - 34, {role: 'head', weight: 760, size: numSize, fill: palette.accent || '#DFFC77', tracking: -3})}
  </g>`;
}

/* ---------------- phone mockup with rows ---------------- */

export function phone(t, {
  rows, x = 330, y = 620, w = 420, h = 720, palette = {}, start = 40, step = 18, screenLabel = 'MFANO',
} = {}) {
  const p = spring(unlerp(t, 12, 38));
  if (p <= 0.001) return '';
  let out = `<g transform="translate(${round(x)} ${round(y + (1 - p) * 60)})" opacity="${round(clamp(p * 1.4))}">
    <g filter="url(#soft)">${rect(-14, -14, w + 28, h + 28, {fill: palette.phoneShell || '#0A0C16', rx: 52})}</g>
    ${rect(-14, -14, w + 28, h + 28, {fill: 'none', stroke: '#FFFFFF26', rx: 52, sw: 2})}
    ${rect(0, 0, w, h, {fill: palette.screen || '#FFFFFF', rx: 40})}`;
  out += text(screenLabel, w - 30, 44, {role: 'mono', weight: 700, size: 17, fill: palette.screenMuted || '#16182766', anchor: 'end', tracking: 1.4});
  rows.forEach((r, i) => {
    const s = reveal(t, start + i * step, 16);
    if (s.o <= 0.01) return;
    const ry = 96 + i * (h - 150) / Math.max(1, rows.length);
    out += `<g opacity="${round(s.o)}" transform="translate(0 ${round(s.dy)})">
      ${rect(24, ry, w - 48, (h - 170) / Math.max(1, rows.length) - 14, {fill: r.bg || palette.row || '#F1F3F8', rx: 14})}
      ${r.icon ? circle(60, ry + 27, 15, {fill: r.iconFill || palette.accent || '#3343C5'}) : ''}
      ${text(r.title, r.icon ? 88 : 42, ry + 34, {role: 'head', weight: 700, size: 26, fill: palette.ink || '#161827', tracking: -0.8})}
      ${r.value ? text(r.value, w - 42, ry + 34, {role: 'mono', weight: 700, size: 24, fill: r.valueFill || palette.accent || '#3343C5', anchor: 'end'}) : ''}
      ${r.sub ? text(r.sub, 42, ry + 64, {role: 'body', weight: 450, size: 19, fill: palette.screenMuted || '#16182799'}) : ''}
    </g>`;
  });
  return out + '</g>';
}

/* ---------------- workflow nodes (Track 1) ---------------- */

export function workflow(t, {nodes, x = 84, y = 760, w = 912, gap = 118, palette = {}, start = 50, step = 30} = {}) {
  let out = '';
  nodes.forEach((n, i) => {
    const s = reveal(t, start + i * step, 20);
    if (s.p <= 0.001) return;
    const ny = y + i * gap;
    const bw = w - 110;
    if (i > 0) {
      const lp = easeInOut(unlerp(t, start + i * step - 14, start + i * step + 8));
      out += `<g opacity="${round(lp)}">${line(x + 46, ny - gap + 62, x + 46, ny - 6, {stroke: palette.route || '#3343C5', sw: 4, dash: '10 10'})}
        ${arrow(x + 46, ny - gap + 62, x + 46, ny - 4, {stroke: palette.route || '#3343C5', sw: 4, head: 13, o: lp})}</g>`;
    }
    out += `<g opacity="${round(s.o)}" transform="translate(${round((1 - s.p) * -34)} ${round(s.dy * 0.4)})">
      ${rect(x, ny, 92, 92, {fill: n.numberFill || palette.nodeNumber || '#3343C5', rx: 18})}
      ${text(String(i + 1).padStart(2, '0'), x + 46, ny + 62, {role: 'mono', weight: 700, size: 40, fill: palette.numberInk || '#FFFFFF', anchor: 'middle', tracking: -1})}
      <g>${rect(x + 110, ny - 12, bw, 116, {fill: palette.card || '#FFFFFF', rx: 16, stroke: palette.cardEdge || '#16182714', sw: 2})}
      ${text(n.title, x + 138, ny + 34, {role: 'head', weight: 720, size: 34, fill: palette.ink || '#161827', tracking: -1})}
      ${text(n.detail, x + 138, ny + 70, {role: 'body', weight: 450, size: 24, fill: palette.muted || '#16182799'})}
      ${n.badge ? pill(n.badge, x + 110 + bw - 16, ny + 22, {size: 20, padX: 12, padY: 7, fill: n.badgeFill || palette.accent || '#DFFC77', ink: '#161827', anchor: 'end', tracking: 1.2}).svg : ''}
      </g>
    </g>`;
  });
  return out;
}

/* ---------------- comparison table (Track 3) ---------------- */

export function compareTable(t, {
  columns, rows, x = 84, y = 640, w = 912, rowH = 132, palette = {}, start = 60, step = 22, verdict,
} = {}) {
  let out = '';
  const cw = (w - 24 * (columns.length - 1)) / columns.length;
  columns.forEach((c, i) => {
    const s = reveal(t, start - 16 + i * 8, 18);
    out += `<g opacity="${round(s.o)}">
      ${rect(x + i * (cw + 24), y, cw, 74, {fill: c.highlight ? palette.accent || '#DFFC77' : palette.head || '#161827', rx: 12})}
      ${text(c.name, x + i * (cw + 24) + cw / 2, y + 48, {role: 'head', weight: 720, size: 30, fill: c.highlight ? '#161827' : '#FFFFFF', anchor: 'middle', tracking: -0.8})}
    </g>`;
  });
  rows.forEach((r, ri) => {
    const s = reveal(t, start + ri * step, 18);
    const ry = y + 92 + ri * rowH;
    out += `<g opacity="${round(s.o)}" transform="translate(0 ${round(s.dy * 0.5)})">
      ${text(r.name, x + 4, ry + 26, {role: 'mono', weight: 700, size: 21, fill: palette.muted || '#16182788', tracking: 1.1})}`;
    r.cells.forEach((cell, ci) => {
      const cx = x + ci * (cw + 24);
      const boxY = ry + 40;
      const boxH = rowH - 52;
      out += `<g>
        ${rect(cx, boxY, cw, boxH, {fill: cell.best ? (palette.accent || '#DFFC77') + '2E' : '#FFFFFF', rx: 12, stroke: cell.best ? (palette.accent || '#DFFC77') : palette.cardEdge || '#16182714', sw: cell.best ? 3 : 1.5})}
        ${(() => {
          const cf = fit(cell.text, {role: 'head', weight: 700, size: 30, maxWidth: cw - 32, maxLines: 2, tracking: -0.6, lineHeight: 1.1});
          const lh = cf.size * 1.15;
          const top = boxY + boxH / 2 - ((cf.lines.length - 1) * lh) / 2 + cf.size * 0.34;
          return cf.lines.map((l, li) => text(l, cx + cw / 2, top + li * lh, {role: 'head', weight: 700, size: cf.size, fill: palette.ink || '#161827', anchor: 'middle', tracking: -0.6})).join('');
        })()}
      </g>`;
    });
    out += '</g>';
  });
  if (verdict && t > start + rows.length * step + 18) {
    const a = easeOut(unlerp(t, start + rows.length * step + 18, start + rows.length * step + 40));
    const yy = y + 92 + rows.length * rowH + 14;
    const vb = fit(verdict, {role: 'head', weight: 700, size: 30, maxWidth: w - 56, maxLines: 2, tracking: -0.6});
    out += `<g opacity="${round(a)}" transform="translate(0 ${round((1 - a) * 18)})">
      ${rect(x, yy, w, 34 + vb.size * 1.24 * vb.lines.length, {fill: palette.verdictBg || '#101322', rx: 14})}
      ${vb.lines.map((l, i) => text(l, x + 28, yy + 20 + vb.size * 1.24 * (i + 0.8), {role: 'head', weight: 700, size: vb.size, fill: palette.verdictInk || '#DFFC77', tracking: -0.6})).join('')}
    </g>`;
  }
  return out;
}

/* ---------------- horizontal spec bars ---------------- */

export function specBars(t, {items, x = 100, y = 700, w = 880, gap = 108, palette = {}, start = 50, step = 20, unit = '', max} = {}) {
  const top = max ?? Math.max(...items.map((i) => i.value));
  let out = '';
  items.forEach((it, i) => {
    const p = spring(unlerp(t, start + i * step, start + i * step + 34));
    const yy = y + i * gap;
    out += `<g opacity="${round(easeOut(unlerp(t, start + i * step, start + i * step + 14)))}">
      ${text(it.label, x, yy, {role: 'head', weight: 700, size: 30, fill: palette.ink || '#FFFFFF', tracking: -0.8})}
      ${text(`${it.display ?? it.value}${unit}`, x + w, yy, {role: 'mono', weight: 700, size: 30, fill: palette.accent || '#DFFC77', anchor: 'end'})}
      ${rect(x, yy + 22, w, 16, {fill: palette.track || '#FFFFFF14', rx: 8})}
      ${rect(x, yy + 22, Math.max(10, (w * it.value * p) / top), 16, {fill: it.color || palette.bar || '#DFFC77', rx: 8})}
      ${it.note ? text(it.note, x, yy + 68, {role: 'body', weight: 450, size: 22, fill: palette.muted || '#FFFFFF88'}) : ''}
    </g>`;
  });
  return out;
}

/* ---------------- vertical timeline ---------------- */

export function timeline(t, {events, x = 120, y = 640, gap = 190, palette = {}, start = 50, step = 26, w = 800} = {}) {
  let out = line(x, y - 10, x, y + (events.length - 1) * gap + 30, {stroke: palette.rail || '#FFFFFF26', sw: 4});
  events.forEach((e, i) => {
    const s = reveal(t, start + i * step, 20);
    if (s.o <= 0.01) return;
    const ey = y + i * gap;
    out += `<g opacity="${round(s.o)}" transform="translate(${round((1 - s.p) * 26)} 0)">
      ${circle(x, ey + 8, e.big ? 17 : 11, {fill: e.color || palette.accent || '#DFFC77'})}
      ${circle(x, ey + 8, (e.big ? 17 : 11) + 9, {fill: 'none', stroke: e.color || palette.accent || '#DFFC77', sw: 2, o: 0.4})}
      ${text(e.year, x + 44, ey + 2, {role: 'mono', weight: 700, size: 26, fill: palette.year || '#FFFFFF99', tracking: 1.6})}
      ${block(e.title, x + 44, ey + 44, {role: 'head', weight: 720, size: 34, fill: palette.ink2 || '#FFFFFF', maxWidth: w, maxLines: 2, tracking: -1}).svg}
      ${e.note ? text(e.note, x + 44, ey + 44 + 56, {role: 'body', weight: 450, size: 23, fill: palette.muted2 || '#FFFFFF88'}) : ''}
    </g>`;
  });
  return out;
}

/* ---------------- highlight marker & stamps ---------------- */

export function marker(t, {x, y, w, h, color = '#DFFC77', start = 20, dur = 24, angle = 0} = {}) {
  const p = easeInOut(unlerp(t, start, start + dur));
  if (p <= 0) return '';
  return `<g transform="rotate(${angle} ${round(x + w / 2)} ${round(y + h / 2)})">
    ${rect(x, y + h * 0.52, w * p, h * 0.5, {fill: color, rx: 4, o: 0.62})}
    ${rect(x, y + h * 0.52, w * p, h * 0.5, {fill: 'none', stroke: color, sw: 2, o: 0.35, rx: 4})}
  </g>`;
}

export function stamp(t, {label, x, y, color = '#E4572E', start = 30, size = 30}) {
  const p = spring(unlerp(t, start, start + 22));
  if (p <= 0.001) return '';
  const w = measure(label, {role: 'mono', weight: 700, size, tracking: 2.4}) + 40;
  const s = 0.82 + p * 0.18;
  return `<g transform="translate(${round(x)} ${round(y)}) rotate(-7) scale(${round(s * 100) / 100})" opacity="${round(clamp(p * 1.5))}">
    ${rect(0, 0, w, size + 26, {fill: 'none', stroke: color, sw: 4, rx: 6})}
    ${text(label, w / 2, size + 9, {role: 'mono', weight: 700, size, fill: color, anchor: 'middle', tracking: 2.4})}
  </g>`;
}

/* ---------------- brand + chrome ---------------- */

export function brandBar({handle = '@mwijay__davie', mark, theme, label, t}) {
  const o = easeOut(unlerp(t, 0, 18));
  const ink = theme.chromeInk;
  return `<g opacity="${round(o)}">
    ${mark ? `<g transform="translate(84 176)"><clipPath id="mk"><circle cx="26" cy="26" r="26"/></clipPath><image href="${mark}" x="0" y="0" width="52" height="52" clip-path="url(#mk)"/></g>` : circle(110, 202, 26, {fill: theme.chromeAccent})}
    ${text('MWIJAY DAVIE', 154, 212, {role: 'head', weight: 730, size: 27, fill: ink, tracking: 0.6})}
    ${text(handle, 996, 212, {role: 'mono', weight: 600, size: 22, fill: theme.chromeMuted, anchor: 'end', tracking: 0.4})}
    ${line(84, 250, 996, 250, {stroke: ink, sw: 2, o: 0.22})}
    ${label ? text(label, 84, 290, {role: 'mono', weight: 700, size: 21, fill: theme.chromeMuted, tracking: 3}) : ''}
  </g>`;
}

export function footer({keyword, line1, theme, t, start = 150, note}) {
  const s = spring(unlerp(t, start, start + 26));
  if (s <= 0.001) return '';
  const p = pill(keyword, 84, 1660, {size: 34, padX: 26, padY: 16, fill: theme.accent, ink: '#14161F', tracking: 3.4, anchor: 'start'});
  return `<g opacity="${round(clamp(s * 1.4))}" transform="translate(0 ${round((1 - s) * 40)})">
    ${rect(0, 1620, W, 300, {fill: theme.footerBg || 'none'})}
    ${line(84, 1646, 996, 1646, {stroke: theme.chromeInk, sw: 2, o: 0.25})}
    ${p.svg}
    ${text(line1, 84 + p.width + 26, 1706, {role: 'head', weight: 700, size: 40, fill: theme.chromeInk, tracking: -1})}
    ${note ? text(note, 84, 1792, {role: 'body', weight: 500, size: 23, fill: theme.chromeMuted}) : ''}
  </g>`;
}

/** Burned-in captions with a wiped background; up to two lines, phrase-timed. */
export function captions(cue, t, {theme, size = 50, y = 1512, maxWidth = 900}) {
  if (!cue) return '';
  const inP = easeOut(unlerp(t, cue.in - 6, cue.in + 8));
  const outP = cue.out == null ? 1 : 1 - easeInOut(unlerp(t, cue.out - 8, cue.out + 2));
  const a = clamp(Math.min(inP, outP));
  if (a <= 0.001) return '';
  const f = fit(cue.text, {role: 'head', weight: 700, size, maxWidth, maxLines: 2, lineHeight: 1.08, tracking: -1.4, minSize: 38});
  const lp = f.size * 1.08;
  const boxH = f.lines.length * lp + 30;
  return `<g opacity="${round(a)}" transform="translate(0 ${round((1 - inP) * 14)})">
    ${rect(W / 2 - maxWidth / 2 - 24, y - boxH + 6, maxWidth + 48, boxH, {fill: theme.captionBg || '#0B0D18CC', rx: 14})}
    ${f.lines.map((l, i) => text(l, W / 2, y - boxH + 12 + lp * (i + 1) - lp * 0.26, {role: 'head', weight: 700, size: f.size, fill: theme.captionInk || '#FFFFFF', anchor: 'middle', tracking: -1.4})).join('')}
  </g>`;
}
