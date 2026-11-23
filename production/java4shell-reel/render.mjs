/**
 * Java4Shell — a tech-observation Reel.
 *
 * The beat the owner asked for: "make her speaking of a tech observation,
 * recent trending issue". The story is CVE-2026-114938, disclosed 17 Nov 2026,
 * because it is the one that actually changes how a team works: an AI agent
 * found a critical RCE in OpenJDK's Base64 decoder in about an hour, for under
 * $200, then built a working exploit. Every figure on screen is from the public
 * advisory, the Calif write-up and Oracle's CPU — nothing is invented.
 *
 * Visual language, deliberately not the school Reel:
 *   · a dark machine room (a generated server-corridor plate), not an eggshell
 *     school page. Red is reserved for the bug; mint for the fix.
 *   · the artifact band is one box on every beat: y 452 -> 900. She starts
 *     below it at 900-960. Same rule as the other two Reels, so the series
 *     reads as a series.
 *   · type is native UI, not decoration: a byte ruler, a heap diagram, an app
 *     matrix, a fix card.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { loadFonts, loadHost, performerDraw, FONTS } from "../noellyne-host/host.mjs";
import { makeSet, groundShadow } from "../noellyne-host/background.mjs";
import {
  drawDeskBack, drawDeskFront, drawPaper, drawPulse, drawTechnicalFrame, drawKeyLight,
} from "./set.mjs";

const ROOT = process.cwd();
const HERE = path.join(ROOT, "production/java4shell-reel");
const OUT = path.join(HERE, "out");
const FF = process.env.FFMPEG;
const W = 1080, H = 1920, FPS = 60;

const INK = "#0a1522", SLATE = "#132234", MINT = "#3ddc97", AMBER = "#ffb545",
      RED = "#ff5c5c", PAPER = "#eef4fb", DIM = "#8fa3b8", BLUE = "#4a9eff";

const tl = JSON.parse(fs.readFileSync(path.join(OUT, "timeline.json"), "utf8"));
const MOUTH = JSON.parse(fs.readFileSync(path.join(OUT, "mouth.json"), "utf8"));
const COPY = JSON.parse(fs.readFileSync(path.join(HERE, "copy.json"), "utf8"));
const takeOf = (id) => COPY.takes.find((t) => t.id === id);

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, f) => { const q = clamp((f - a) / (b - a)); return q * q * (3 - 2 * q); };
const lerp = (a, b, p) => a + (b - a) * p;

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function rect(c, x, y, w, h, r, col) { rr(c, x, y, w, h, r); c.fillStyle = col; c.fill(); }
function edge(c, x, y, w, h, r, col, n = 2) { rr(c, x, y, w, h, r); c.strokeStyle = col; c.lineWidth = n; c.stroke(); }
function line(c, pts, col, px = 3) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
  c.strokeStyle = col; c.lineWidth = px; c.lineCap = "round"; c.stroke();
}
function dot(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); }

function type(c, s, x, y, size, o = {}) {
  const { family = FONTS.sans, color = PAPER, width = 900, weight = 700,
          align = "left", italic = false } = o;
  c.save();
  c.font = `${italic ? "italic " : ""}${weight} ${size}px '${family}'`;
  c.fillStyle = color; c.textAlign = align; c.textBaseline = "alphabetic";
  c.fillText(s, x, y, width);
  c.restore();
}
function mono(c, s, x, y, size, o = {}) {
  type(c, s, x, y, size, { family: FONTS.mono, weight: 500, ...o });
}
function wrapType(c, lines, x, y, size, lh, o = {}) {
  lines.forEach((ln, i) => type(c, ln, x, y + i * lh, size, o));
}

/* ------------------------------------------------------------------ chrome */
const BAND = { x: 84, w: 912, top: 452, bot: 900 };

/** One dark card, hairline border, a small mono label, an accent tick. */
function pane(c, x, y, w, h, label, accent = MINT) {
  rect(c, x + 6, y + 16, w - 12, h, 22, "rgba(0,0,0,0.40)");
  rect(c, x, y, w, h, 20, "rgba(19,34,52,0.94)");
  edge(c, x, y, w, h, 20, "rgba(143,163,184,0.28)", 2);
  if (label) {
    rect(c, x + 26, y + 20, 5, 24, 2.5, accent);
    mono(c, label, x + 42, y + 40, 20, { color: DIM });
  }
  return { x, y, w, h, top: y + (label ? 60 : 24) };
}

function chip(c, x, y, w, h, label, col, k = 1, size = 24) {
  if (k <= 0.001) return;
  rect(c, x, y, w * k, h, h / 2, col + "22");
  edge(c, x, y, w * k, h, h / 2, col + "77", 2);
  if (k > 0.9) mono(c, label, x + 22, y + h / 2 + 8, size, { color: col });
}

/** the section label, top right — this Reel numbers its beats like a report */
function beatLabel(span) {
  const i = tl.spans.indexOf(span) + 1;
  return `${String(i).padStart(2, "0")} / ${span.id.toUpperCase()}`;
}

/* ------------------------------------------------------------------ scenes */
const SCENES = {
  /** 65 characters counted out, one per cell, then the fence goes red. */
  hook(c, f, a) {
    const p = pane(c, BAND.x, 452, BAND.w, 448, "input — 65 bytes of Base64");
    const cells = 20, cols = 10, cw = 74, ch = 58, gap = 8;
    const x0 = p.x + 46, y0 = p.top + 18;
    // the characters. 65 shown as 20 glyphs and a count, not 65 illegible boxes.
    for (let i = 0; i < cells; i++) {
      const k = smooth(4 + i * 2.4, 16 + i * 2.4, a[0]);
      if (k <= 0.001) continue;
      const cx = x0 + (i % cols) * (cw + gap);
      const cy = y0 + Math.floor(i / cols) * (ch + gap);
      const last = i === cells - 1;
      c.save(); c.globalAlpha = k;
      rect(c, cx, cy, cw, ch, 10, last ? "rgba(255,92,92,0.20)" : "rgba(74,158,255,0.10)");
      edge(c, cx, cy, cw, ch, 10, last ? "rgba(255,92,92,0.85)" : "rgba(74,158,255,0.35)", 2);
      mono(c, last ? "=" : "A", cx + cw / 2, cy + ch / 2 + 12, 32,
           { color: last ? RED : PAPER, align: "center", weight: 700 });
      c.restore();
    }
    // the count, and the claim
    const k2 = smooth(50, 74, a[0]);
    if (k2 > 0.001) {
      c.save(); c.globalAlpha = k2;
      type(c, "64 × A  +  1 × =", p.x + 46, p.top + 196, 40, { weight: 760, color: PAPER, width: 620 });
      mono(c, "65 bytes total — that is the whole attack", p.x + 46, p.top + 236, 22, { color: DIM });
      line(c, [[p.x + 46, p.top + 258], [p.x + p.w - 46, p.top + 258]], "rgba(143,163,184,0.22)", 2);
      chip(c, p.x + 46, p.top + 282, 254, 62, "no login needed", RED, smooth(70, 88, a[0]), 22);
      chip(c, p.x + 322, p.top + 282, 300, 62, "CVSS 9.2 critical", RED, smooth(78, 96, a[0]), 22);
      c.restore();
    }
  },

  /** one hour vs years: the timeline that makes the point. */
  found(c, f, a) {
    const p = pane(c, BAND.x, 452, BAND.w, 448, "time to a working exploit", AMBER);
    const rows = [
      ["traditional audit", "months", 0.0, "rgba(143,163,184,0.35)", DIM],
      ["AI-assisted audit", "~1 hour", 1.0, AMBER, AMBER],
      ["first exploit", "+2 hours", 0.92, RED, RED],
    ];
    rows.forEach(([label, val, frac, col, tc], i) => {
      const t = smooth(6 + i * 28, 30 + i * 28, a[0]);
      if (t <= 0.001) return;
      const y = p.top + 26 + i * 104;
      c.save(); c.globalAlpha = t; c.translate(0, (1 - t) * 16);
      mono(c, label, p.x + 46, y + 22, 24, { color: DIM });
      type(c, val, p.x + p.w - 46, y + 30, 38, { weight: 760, color: tc, align: "right", width: 320 });
      const bw = 700 * frac * t;
      rect(c, p.x + 46, y + 42, 700, 8, 4, "rgba(143,163,184,0.07)");
      rect(c, p.x + 46, y + 42, Math.max(2, bw), 8, 4, col);
      c.restore();
    });
    const k = smooth(96, 116, a[0]);
    if (k > 0.001) {
      c.save(); c.globalAlpha = k;
      line(c, [[p.x + 46, p.top + 316], [p.x + p.w - 46, p.top + 316]], "rgba(143,163,184,0.22)", 2);
      mono(c, "token cost of the whole find:  under $200", p.x + 46, p.top + 354, 24, { color: AMBER });
      c.restore();
    }
  },

  /** the heap: a 50-byte buffer and the 62 bytes that land outside it. */
  bug(c, f, a) {
    const p = pane(c, BAND.x, 452, BAND.w, 448, "heap — the write that escapes", RED);
    const bx = p.x + 46, by = p.top + 34, bw = 380, bh = 96;
    const t = smooth(6, 30, a[0]);
    c.save(); c.globalAlpha = t;
    mono(c, "output buffer — 50 bytes", bx, by - 12, 20, { color: DIM });
    rect(c, bx, by, bw, bh, 8, "rgba(74,158,255,0.12)");
    edge(c, bx, by, bw, bh, 8, "rgba(74,158,255,0.55)", 2);
    // the overflow: 62 bytes past the end, drawn as a red slab that breaks the frame
    const ov = smooth(34, 62, a[0]);
    if (ov > 0.001) {
      c.save(); c.globalAlpha = ov;
      const ow = 62 / 50 * bw;
      rect(c, bx + bw, by + 10, ow * ov, bh - 20, 6, "rgba(255,92,92,0.24)");
      edge(c, bx + bw, by + 10, ow * ov, bh - 20, 6, "rgba(255,92,92,0.85)", 2);
      mono(c, "+62 bytes outside", bx + bw + 12, by + bh / 2 + 8, 20, { color: RED, width: 300 });
      c.restore();
    }
    c.restore();

    const k = smooth(64, 88, a[0]);
    if (k > 0.001) {
      c.save(); c.globalAlpha = k;
      mono(c, "trigger", p.x + 46, p.top + 190, 20, { color: DIM });
      // 64 A cells then the equals, small
      for (let i = 0; i < 16; i++) {
        const cellW = 30, gap = 4, cx = p.x + 46 + i * (cellW + gap);
        rect(c, cx, p.top + 202, cellW, 44, 6, i === 15 ? "rgba(255,92,92,0.20)" : "rgba(74,158,255,0.10)");
        edge(c, cx, p.top + 202, cellW, 44, 6, i === 15 ? "rgba(255,92,92,0.85)" : "rgba(74,158,255,0.30)", 1.5);
        mono(c, i === 15 ? "=" : "A", cx + cellW / 2, p.top + 232, 22,
             { color: i === 15 ? RED : PAPER, align: "center" });
      }
      mono(c, "…64 total", p.x + 46 + 16 * 34 + 14, p.top + 232, 20, { color: DIM });
      line(c, [[p.x + 46, p.top + 258], [p.x + p.w - 46, p.top + 258]], "rgba(143,163,184,0.22)", 2);
      mono(c, "a stray '=' underflows the length to −1,", p.x + 46, p.top + 292, 22, { color: PAPER });
      mono(c, "the store mask goes all-ones, 64 bytes land.", p.x + 46, p.top + 324, 22, { color: RED });
      mono(c, "Java throws afterwards — too late, heap already written.", p.x + 46, p.top + 358, 19, { color: DIM });
      c.restore();
    }
  },

  /** the app matrix: pre-auth on the left column, post-auth on the right */
  apps(c, f, a) {
    const p = pane(c, BAND.x, 452, BAND.w, 448, "demonstrated against, default configs", RED);
    const pre = ["Keycloak", "Jira", "Confluence", "Jenkins", "Artifactory", "PingFederate"];
    const post = ["Kafka", "Solr", "Elasticsearch", "Gerrit", "Spinnaker"];
    mono(c, "before login", p.x + 46, p.top + 30, 20, { color: RED });
    pre.forEach((name, i) => {
      const t = smooth(6 + i * 12, 26 + i * 12, a[0]);
      if (t <= 0.001) return;
      const x = p.x + 46 + (i % 2) * 400, y = p.top + 46 + Math.floor(i / 2) * 74;
      c.save(); c.globalAlpha = t;
      rect(c, x, y, 388, 62, 12, "rgba(255,92,92,0.10)");
      edge(c, x, y, 388, 62, 12, "rgba(255,92,92,0.40)", 2);
      mono(c, name, x + 20, y + 40, 24, { color: PAPER });
      dot(c, x + 354, y + 31, 7, RED);
      c.restore();
    });
    const k = smooth(80, 100, a[0]);
    if (k > 0.001) {
      c.save(); c.globalAlpha = k;
      line(c, [[p.x + 46, p.top + 264], [p.x + p.w - 46, p.top + 264]], "rgba(143,163,184,0.22)", 2);
      mono(c, "after login", p.x + 46, p.top + 294, 20, { color: AMBER });
      post.forEach((name, i) => {
        mono(c, name, p.x + 46 + i * 168, p.top + 332, 19, { color: DIM, width: 162 });
      });
      mono(c, "six apps, no credentials — one decoder", p.x + 46, p.top + 368, 21, { color: PAPER });
      c.restore();
    }
  },

  /** the fix, two lines: update, or kill the intrinsic */
  patch(c, f, a) {
    const p = pane(c, BAND.x, 452, BAND.w, 448, "fixed 17 Nov 2026 — Oracle CPU", MINT);
    const opts = [
      ["update the JDK", "17.0.21.1 · 21.0.13.1 · 25.0.5.1 · 27.0.1.1", MINT, true],
      ["or disable the intrinsic", "-XX:-UseBASE64Intrinsics", AMBER, false],
    ];
    opts.forEach(([head, body, col, primary], i) => {
      const t = smooth(8 + i * 34, 34 + i * 34, a[0]);
      if (t <= 0.001) return;
      const y = p.top + 16 + i * 148;
      c.save(); c.globalAlpha = t; c.translate(0, (1 - t) * 18);
      rect(c, p.x + 46, y, p.w - 92, 124, 16, col + (primary ? "18" : "0e"));
      edge(c, p.x + 46, y, p.w - 92, 124, 16, col + "66", 2);
      mono(c, primary ? "recommended" : "stop-gap", p.x + 70, y + 34, 18, { color: col });
      type(c, head, p.x + 70, y + 78, 34, { weight: 760, color: PAPER, width: 720 });
      mono(c, body, p.x + 70, y + 108, 19, { color: DIM, width: 740 });
      c.restore();
    });
    const k = smooth(104, 124, a[0]);
    if (k > 0.001) {
      c.save(); c.globalAlpha = k;
      mono(c, "Java 11 and standard Java 8 are not affected.", p.x + 46, p.top + 336, 22, { color: DIM });
      mono(c, "ARM64 is not affected — the stub is x86-64 AVX-512 only.", p.x + 46, p.top + 372, 22, { color: DIM });
      c.restore();
    }
  },

  /** the action: three checks, in order, today */
  action(c, f, a) {
    const p = pane(c, BAND.x, 452, BAND.w, 448, "check before you close this app", AMBER);
    const items = [
      ["1", "is your JDK 17.0.6 or newer?", "then the stub is in your build"],
      ["2", "does the app Base64-decode input?", "auth headers, JWT, uploads, API fields"],
      ["3", "is the CPU x86-64 with AVX-512 VBMI?", "Ice Lake+, Zen 4+ — or you are clear"],
    ];
    items.forEach(([n, head, sub], i) => {
      const t = smooth(6 + i * 26, 30 + i * 26, a[0]);
      if (t <= 0.001) return;
      const y = p.top + 14 + i * 118;
      c.save(); c.globalAlpha = t; c.translate(0, (1 - t) * 16);
      dot(c, p.x + 74, y + 46, 22, "rgba(255,181,69,0.16)");
      mono(c, n, p.x + 74, y + 55, 24, { color: AMBER, align: "center", weight: 700 });
      type(c, head, p.x + 118, y + 42, 29, { weight: 720, color: PAPER, width: 760 });
      mono(c, sub, p.x + 118, y + 78, 20, { color: DIM, width: 760 });
      c.restore();
    });
    const k = smooth(92, 112, a[0]);
    if (k > 0.001) {
      c.save(); c.globalAlpha = k;
      line(c, [[p.x + 46, p.top + 350], [p.x + p.w - 46, p.top + 350]], "rgba(143,163,184,0.22)", 2);
      mono(c, "all three true = you were exploitable before the patch.", p.x + 46, p.top + 366, 21, { color: RED });
      c.restore();
    }
  },

  /** the CTA: one keyword, a receipt-style card, nothing else */
  cta(c, f, a) {
    const t = smooth(0, 30, a[0]);
    c.save(); c.globalAlpha = t;
    rect(c, BAND.x, 452, Math.max(12, 620 * t), 116, 58, MINT);
    type(c, "Comment PATCH", BAND.x + 42, 452 + 78, 46, { weight: 800, color: "#04231a", width: 540 });
    const p = pane(c, BAND.x, 610, BAND.w, 290, "what comes back to you", MINT);
    const rows = [
      ["1", "the four fixed JDK builds"],
      ["2", "the -XX flag, if you cannot update today"],
      ["3", "the three-condition check, on one line"],
    ];
    rows.forEach(([n, text], i) => {
      const k = smooth(14 + i * 16, 34 + i * 16, a[0]);
      if (k <= 0.001) return;
      c.save(); c.globalAlpha = t * k;
      mono(c, n, p.x + 60, p.top + 26 + i * 62, 22, { color: MINT });
      type(c, text, p.x + 100, p.top + 32 + i * 62, 27, { weight: 620, color: PAPER, width: 740 });
      c.restore();
    });
    mono(c, "no form, no signup, no email", p.x + 60, p.top + 202, 20, { color: DIM });
    c.restore();
  },
};

/* ------------------------------------------------------------------ page */
await loadFonts();
const HOST = await loadHost();
const PLATE = await loadImage(path.join(HERE, "assets/plate-serverroom.jpg"));
const DESK = await loadImage(path.join(HERE, "assets/desk-console.jpg"));

/**
 * Eight beats in one machine room, but not the same still: each beat gets its
 * own tint, its own photo weight and its own drift, so the corridor reads as a
 * different part of the room rather than one background swapped behind text.
 */
const PALETTE = {
  hook:   { tint: "#0a1522", tint2: "#0e2338", photo: 0.30, sweep: 0.34, dust: 26 },
  found:  { tint: "#0b1725", tint2: "#102a42", photo: 0.26, sweep: 0.30, dust: 22 },
  bug:    { tint: "#120d16", tint2: "#2a1220", photo: 0.24, sweep: 0.28, dust: 18 },
  apps:   { tint: "#0a1420", tint2: "#122234", photo: 0.28, sweep: 0.32, dust: 24 },
  patch:  { tint: "#08181a", tint2: "#0d2a28", photo: 0.26, sweep: 0.36, dust: 22 },
  action: { tint: "#0c1622", tint2: "#152638", photo: 0.24, sweep: 0.30, dust: 20 },
  cta:    { tint: "#08181c", tint2: "#0f2e2a", photo: 0.30, sweep: 0.40, dust: 28 },
};

const sets = new Map();
for (const [id, p] of Object.entries(PALETTE)) {
  sets.set(id, makeSet(W, H, PLATE, { ...p, parallax: 22, vig: 0.34 }));
}

/**
 * She stands under the band, never in it. Same rule as the other two Reels —
 * and the same reason: her raised hand used to land on the artifact.
 */
const POS = {
  hook:   { x: 520, y: 826, w: 600 },
  found:  { x: 528, y: 836, w: 592 },
  bug:    { x: 524, y: 830, w: 596 },
  apps:   { x: 536, y: 844, w: 584 },
  patch:  { x: 528, y: 836, w: 592 },
  action: { x: 532, y: 840, w: 588 },
  cta:    { x: 300, y: 872, w: 690 },
};

/**
 * Per-beat desk settings. `top` is where the console surface begins; her waist
 * lands just under it, so the desk crops her rather than her ending in mid-air.
 * `key` drifts the plate sideways so two beats in the same room are not the
 * same still.
 */
const DESKS = {
  hook:   { surfaceY: 1382, drift: 12, key: -18, lift: 0.55, glow: 0.55, pulse: "rgba(255,181,69,0.85)", speed: 1.3, scale: "INPUT 65 B" },
  found:  { surfaceY: 1374, drift: 10, key: 14,  lift: 0.50, glow: 0.48, pulse: "rgba(255,181,69,0.80)", speed: 1.7, scale: "T+0H" },
  bug:    { surfaceY: 1380, drift: 14, key: -8,  lift: 0.42, glow: 0.42, pulse: "rgba(255,92,92,0.85)",  speed: 2.2, scale: "HEAP -62B" },
  apps:   { surfaceY: 1388, drift: 9,  key: 22,  lift: 0.52, glow: 0.50, pulse: "rgba(255,92,92,0.75)",  speed: 1.5, scale: "N = 6" },
  patch:  { surfaceY: 1378, drift: 11, key: -22, lift: 0.58, glow: 0.60, pulse: "rgba(61,220,151,0.90)", speed: 1.2, scale: "JDK 17.0.21.1" },
  action: { surfaceY: 1384, drift: 13, key: 6,   lift: 0.54, glow: 0.52, pulse: "rgba(255,181,69,0.85)", speed: 1.8, scale: "CHECK 1-3" },
  cta:    { surfaceY: 1404, drift: 12, key: 0,   lift: 0.66, glow: 0.72, pulse: "rgba(61,220,151,0.95)", speed: 1.4, scale: "PATCH" },
};

/**
 * Paper on the desk. Each sheet is pinned at an angle and carries `delay`, so
 * they land in sequence. They sit OUTSIDE the artifact band — left and right
 * margins, plus the desk surface — so they never compete with the card.
 */
const SHEETS = {
  hook: [
    { x: 8,   y: 1246, w: 118, h: 146, rot: -8, delay: 26, rules: 4, seed: 3, torn: true },
    { x: 1012, y: 1296, w: 104, h: 122, rot: 10, delay: 54, grid: true, seed: 9 },
    { x: 96,  y: 1342, w: 176, h: 96,  rot: -3, delay: 82, rules: 3, seed: 5, fill: "rgba(255,245,225,0.90)" },
  ],
  found: [
    { x: 1010, y: 1290, w: 110, h: 132, rot: 8,  delay: 22, rules: 4, seed: 2 },
    { x: 6,   y: 1268, w: 116, h: 150, rot: -9, delay: 46, grid: true, seed: 7, torn: true },
    { x: 888, y: 1382, w: 158, h: 86,  rot: 4,  delay: 74, rules: 3, seed: 11 },
  ],
  bug: [
    { x: 4,   y: 1252, w: 120, h: 152, rot: -6, delay: 24, grid: true, seed: 4, ink: "rgba(255,92,92,0.30)" },
    { x: 1012, y: 1294, w: 108, h: 134, rot: 10, delay: 52, rules: 4, seed: 8, torn: true },
    { x: 104, y: 1348, w: 168, h: 90,  rot: -2, delay: 78, rules: 3, seed: 13 },
  ],
  apps: [
    { x: 8,   y: 1242, w: 114, h: 148, rot: -8, delay: 20, rules: 5, seed: 6 },
    { x: 1014, y: 1300, w: 106, h: 128, rot: 8,  delay: 48, grid: true, seed: 12, torn: true },
    { x: 886, y: 1388, w: 152, h: 82,  rot: 5,  delay: 76, rules: 3, seed: 15 },
  ],
  patch: [
    { x: 6,   y: 1256, w: 118, h: 144, rot: -5, delay: 22, rules: 4, seed: 1, ink: "rgba(61,220,151,0.32)" },
    { x: 1012, y: 1288, w: 108, h: 142, rot: 9,  delay: 50, grid: true, seed: 10, torn: true },
    { x: 112, y: 1344, w: 172, h: 92,  rot: -4, delay: 80, rules: 3, seed: 17 },
  ],
  action: [
    { x: 4,   y: 1250, w: 116, h: 146, rot: -7, delay: 24, grid: true, seed: 14 },
    { x: 1014, y: 1302, w: 104, h: 126, rot: 10, delay: 52, rules: 4, seed: 16, torn: true },
    { x: 884, y: 1384, w: 150, h: 84,  rot: 3,  delay: 78, rules: 3, seed: 19 },
  ],
  cta: [
    { x: 6,   y: 1252, w: 120, h: 142, rot: -6, delay: 20, rules: 4, seed: 21, torn: true },
    { x: 1012, y: 1296, w: 108, h: 130, rot: 8,  delay: 46, grid: true, seed: 23 },
    { x: 96,  y: 1350, w: 178, h: 94,  rot: -3, delay: 72, rules: 3, seed: 25, fill: "rgba(232,248,240,0.92)" },
  ],
};

function drawFrame(ctx, f) {
  const span = tl.spans.find((s) => f >= s.start - 3 && f < s.end + 40) || tl.spans[tl.spans.length - 1];
  const take = takeOf(span.id);
  const a = [f - span.start, f - span.end];

  sets.get(span.id)(ctx, f, span.start, span.end);

  // a slow push, so nothing in the frame is dead
  const cam = 1 + 0.016 * clamp((f - span.start) / Math.max(1, span.end - span.start));
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(cam, cam); ctx.translate(-W / 2, -H / 2);
  SCENES[span.id](ctx, f, a);
  ctx.restore();

  /**
   * The desk goes down BEFORE her, so she stands behind it. This is the answer
   * to "hana legs": the rig is half-body, so a real console cropping her at the
   * waist is how a news desk crops a presenter. It is also a place to put the
   * paper and the stickers, which is what stops the frame being a text box on a
   * dark plate.
   */
  const p = POS[span.id];
  const deskCfg = DESKS[span.id];

  // the desk BEHIND her: monitors and the back of the surface
  drawDeskBack(ctx, DESK, W, H, f, span.start, span.end, deskCfg);

  // a key light behind her head so a dark hoodie on a dark room is not one shape
  drawKeyLight(ctx, p.x + p.w * 0.52, p.y + p.w * 0.40, p.w * 0.94, deskCfg.lift ?? 0.6);

  // her
  const draw = performerDraw(ctx, HOST, FPS);
  const cues = (take.gesture || []).map((g) => ({
    kind: g.kind, start: span.start + Math.round(g.at * FPS), len: g.len,
  }));
  const blinks = [span.start + 44, span.start + 44 + 116, span.start + 44 + 232]
    .filter((x) => x > span.start + 8 && x < span.end + 18);
  groundShadow(ctx, p.x + p.w * 0.5, p.y + p.w * 0.99, p.w * 0.74, 0.30);
  draw(f, "review", { pose: take.pose, mouth: MOUTH, ...p, cues, blinks, nods: [span.start + 18] });

  // the desk IN FRONT: crops her at the waist, which is the whole point
  const front = drawDeskFront(ctx, DESK, W, H, f, span.start, span.end, deskCfg);
  drawPulse(ctx, W, front.lip + 2, f, span.start, span.end, {
    col: deskCfg.pulse ?? "rgba(61,220,151,0.85)",
    speed: deskCfg.speed ?? 1.5,
  });

  // paper layer: notes pinned to the desk, landing one after another
  drawPaper(ctx, SHEETS[span.id] || [], f, span.start);

  // a technical frame around the artifact band — brackets, ticks, a scale label
  drawTechnicalFrame(ctx, f, span.start, {
    x: BAND.x - 14, y: BAND.top - 14, w: BAND.w + 28, h: BAND.bot - BAND.top + 28,
    col: "rgba(143,163,184,0.30)", ticks: 13,
  });

  // chrome
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.drawImage(HOST.mark, 62, 58, 46, 46);
  type(ctx, "ALTRAWARE", 120, 92, 24, { weight: 750, color: PAPER });
  mono(ctx, beatLabel(span), 1002, 92, 20, { color: DIM, align: "right" });
  line(ctx, [[96, 118], [984, 118]], "rgba(143,163,184,0.20)", 2);
  ctx.restore();

  // headline: the spoken line, not a caption duplicate
  const head = { hook: 84, found: 70, bug: 66, apps: 66, patch: 70, action: 72, cta: 82 }[span.id];
  const tIn = smooth(span.start + 2, span.start + 24, f);
  if (tIn > 0.001) {
    ctx.save(); ctx.globalAlpha = tIn; ctx.translate(0, (1 - tIn) * 18);
    const accent = span.id === "bug" || span.id === "apps" ? RED
      : span.id === "patch" || span.id === "cta" ? MINT : AMBER;
    rect(ctx, 84, 222, 6, take.sw.length * (head + 12) - 10, 3, accent);
    wrapType(ctx, take.sw, 112, 222 + head * 0.78, head, head + 12,
             { weight: 800, color: PAPER, width: 860 });
    ctx.restore();
  }

  // caption: the same line, one place, always at 1616
  const capT = smooth(span.start + 8, span.start + 24, f) * (1 - smooth(span.end + 4, span.end + 22, f));
  if (capT > 0.001) {
    ctx.save(); ctx.globalAlpha = capT;
    const text = take.sw.join(" ");
    ctx.font = `600 32px '${FONTS.sans}'`;
    const tw = ctx.measureText(text).width;
    const bw = Math.min(920, tw + 76);
    rect(ctx, (W - bw) / 2, 1616, bw, 80, 18, "rgba(9,20,32,0.92)");
    edge(ctx, (W - bw) / 2, 1616, bw, 80, 18, "rgba(143,163,184,0.26)", 2);
    type(ctx, text, W / 2, 1668, 32, { weight: 620, color: PAPER, align: "center", width: 860 });
    ctx.restore();
  }

  // progress hairline
  rect(ctx, 0, H - 7, W, 7, 0, "rgba(143,163,184,0.16)");
  rect(ctx, 0, H - 7, W * clamp(f / tl.frames), 7, 0, MINT);
}

/* ------------------------------------------------------------------ main */
const frames = tl.frames;
const outFile = process.argv[2] || path.join(OUT, "java4shell.mp4");
const audio = process.argv[3] || path.join(OUT, "mix.wav");
const proof = Number((process.argv.find((x) => x.startsWith("--proof=")) || "").split("=")[1] || frames);

if (!FF) throw new Error("FFMPEG env var required");
const cv = createCanvas(W, H);
const ctx = cv.getContext("2d");
const n = Math.min(frames, proof);

/**
 * `--stills=hook:150,bug:1000` writes full-res PNGs at those frames and exits.
 * Pull stills from the middle of a beat, never from the entrance ramp: a faded
 * card hides a layout collision.
 */
const stillsArg = process.argv.find((x) => x.startsWith("--stills="));
if (stillsArg) {
  const dir = path.join(ROOT, ".cache/stills");
  fs.mkdirSync(dir, { recursive: true });
  for (const pair of stillsArg.split("=")[1].split(",")) {
    const [id, fr] = pair.split(":");
    drawFrame(ctx, Number(fr));
    fs.writeFileSync(path.join(dir, `${id}.png`), cv.toBuffer("image/png"));
  }
  process.stderr.write(`stills -> ${dir}\n`);
  process.exit(0);
}

const args = ["-y", "-hide_banner", "-loglevel", "error",
  "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-"];
if (fs.existsSync(audio)) args.push("-i", audio);
args.push("-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p");
if (fs.existsSync(audio)) args.push("-c:a", "aac", "-b:a", "192k", "-shortest");
args.push("-movflags", "+faststart", outFile);

const ff = spawn(FF, args, { stdio: ["pipe", "inherit", "inherit"] });
ff.stdin.on("error", (e) => process.stderr.write(`stdin: ${e.message}\n`));
for (let f = 0; f < n; f++) {
  drawFrame(ctx, f);
  // Buffer.from(typedarray) truncates silently in this build; wrap the memory.
  const d = ctx.getImageData(0, 0, W, H).data;
  const buf = Buffer.from(d.buffer, d.byteOffset, d.byteLength);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 120 === 0) process.stderr.write(`frame ${f}/${n}\n`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`)))));
process.stderr.write(`wrote ${outFile}\n`);
