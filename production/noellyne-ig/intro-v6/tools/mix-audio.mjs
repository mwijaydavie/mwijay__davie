/**
 * V6 mix — the fix for "audios zimekuwa nyingi ka uchafu, hamna muelewano".
 *
 * V4 put 19 SFX cues plus a music layer plus a compressor on the timeline, so
 * nothing was readable. V5 has exactly three sources:
 *
 *   1. the voice, placed on the beat grid, never ducked, never compressed in a
 *      way that pumps;
 *   2. one continuous bed at a low level, sidechain-ducked under every word;
 *   3. two cues, one on the panel landing and one on the follow button.
 *
 * The chain is deliberately gentle: a high-pass on the voice only, a 2:1
 * leveller, a limiter at -1 dBTP. Target -15 LUFS.
 *
 * Usage: node tools/mix-audio.mjs <out.wav>
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const AUDIO = path.join(ROOT, "production/noellyne-ig/intro-v6/audio-src");
const SFX = path.join(ROOT, "production/noellyne-ig/intro-v6/sfx");
const TIMING = path.join(AUDIO, "vo-timing.json");

const FF = process.env.FFMPEG;
if (!FF) throw new Error("set FFMPEG");

/** Beat starts, matching BEATS in render.mjs. */
const BEATS = { hook: 0.0, name: 5.0, promise: 11.0, cta: 16.6 };
const TOTAL = 19.8;

/** Voice: file, beat, and the offset that lands the first syllable on the beat. */
const VO = [
  { file: "vo-1-hook.mp3", beat: "hook" },
  { file: "vo-2-name.mp3", beat: "name" },
  { file: "vo-3-promise.mp3", beat: "promise" },
  { file: "vo-4-together.mp3", beat: "cta" },
];

function run(args) {
  return new Promise((res, rej) => {
    const p = spawn(FF, args, { stdio: ["ignore", "inherit", "inherit"] });
    p.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`))));
  });
}

// ---------------------------------------------------------------- placement
const timing = JSON.parse(fs.readFileSync(TIMING, "utf8"));
const placed = VO.map(({ file, beat }) => {
  const key = file.replace(".mp3", "");
  const t = timing[key];
  const start = Math.max(0, BEATS[beat] - (t?.speechStart ?? 0.28));
  return { file, start, dur: t?.duration ?? 3 };
});
console.log("voice placement:");
for (const p of placed) console.log(`  ${p.file} @ ${p.start.toFixed(2)}s (${p.dur.toFixed(2)}s)`);

// ---------------------------------------------------------------- build
const out = process.argv[2] || path.join(ROOT, "out/noellyne-ig-intro-v6/mix.wav");
fs.mkdirSync(path.dirname(out), { recursive: true });

const inputs = [];
for (const p of placed) inputs.push("-i", path.join(AUDIO, p.file));
inputs.push("-i", path.join(SFX, "bed.wav"));
inputs.push("-i", path.join(SFX, "thump.wav"));
inputs.push("-i", path.join(SFX, "blip.wav"));

const nVo = placed.length;
const iBed = nVo;
const iThump = nVo + 1;
const iBlip = nVo + 2;

const filters = [];

// --- voice: sum with adelay, then one gentle leveller
placed.forEach((p, i) => {
  const ms = Math.round(p.start * 1000);
  filters.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[v${i}]`);
});
filters.push(
  `${placed.map((_, i) => `[v${i}]`).join("")}amix=inputs=${nVo}:normalize=0[vo]`
);
filters.push(
  "[vo]highpass=f=95,acompressor=threshold=0.16:ratio=2:attack=12:release=170:makeup=1.35[voL]"
);

// --- bed: low, looped/trimmed to length, then ducked hard under the voice
filters.push(
  `[${iBed}:a]aresample=48000,aformat=channel_layouts=stereo,` +
    `atrim=0:${TOTAL},volume=0.16,afade=t=in:st=0:d=1.2,afade=t=out:st=${TOTAL - 1.6}:d=1.6[bed]`
);
// sidechain: the VO drives a compressor on the bed. This is the duck, so the
// bed never competes with a word.
// pad the VO to the full length first: sidechaincompress stops when its key
// stops, which is what truncated the V6 mix to the last word.
filters.push(`[voL]apad=whole_dur=${TOTAL},asplit=2[voM][voKey]`);
filters.push("[bed][voKey]sidechaincompress=threshold=0.05:ratio=9:attack=8:release=320[bedD]");

// --- two cues only
filters.push(
  `[${iThump}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(
    BEATS.name * 1000
  )}|${Math.round(BEATS.name * 1000)},volume=0.42[thump]`
);
filters.push(
  `[${iBlip}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(
    (BEATS.cta + 1.05) * 1000
  )}|${Math.round((BEATS.cta + 1.05) * 1000)},volume=0.30[blip]`
);

// --- sum and master: -1 dBTP ceiling, -15 LUFS target
filters.push("[voM][bedD][thump][blip]amix=inputs=4:normalize=0[mixed]");
filters.push(
  "[mixed]alimiter=limit=0.89:level=false,loudnorm=I=-15:TP=-1.0:LRA=9[out]"
);

await run([
  "-y", "-hide_banner", "-loglevel", "error",
  ...inputs,
  "-filter_complex", filters.join(";"),
  "-map", "[out]",
  "-ar", "48000", "-ac", "2",
  out,
]);

console.log(`wrote ${out}`);
