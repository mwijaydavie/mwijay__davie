import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {copyFile, cp, mkdir, mkdtemp, readFile, rm} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(project, '../..');
const output = resolve(process.env.NJOMBE_OUT ?? join(root, 'out/njombe'));
const mode = process.argv[2] ?? 'all';
if (!['all', 'stills', 'reel'].includes(mode)) throw new Error('Usage: npm run render -- [all|stills|reel]');
const brief = JSON.parse(await readFile(join(project, 'project.json'), 'utf8'));
const carouselNames = brief.slideFiles;
const propsFile = join(output, 'audio/props.json');
const scratch = await mkdtemp(join(tmpdir(), 'njombe-remotion-'));
const publicDir = join(scratch, 'public');
const browserExecutable = process.env.CHROME_PATH ?? null;
let browser;
let serveUrl;

function validateVoice(props, script) {
  if (props.cues.length !== script.length || props.cues.at(-1).end >= props.durationInFrames ||
      !props.cues.at(-1).lines.join(' ').split(/\s+/).includes(brief.keyword)) {
    throw new Error('Invalid cue sheet or CTA. Regenerate it from the approved audio and script.');
  }
  for (const [index, cue] of props.cues.entries()) {
    if (!Number.isInteger(cue.start) || !Number.isInteger(cue.end) || cue.end <= cue.start ||
        cue.lines.length > 2 || cue.shot !== script[index].shot ||
        cue.lines.join(' ') !== script[index].lines.join(' ') ||
        (index > 0 && cue.start < props.cues[index - 1].end)) throw new Error(`Bad cue at ${index + 1}.`);
  }
}

try {
  const props = JSON.parse(await readFile(propsFile, 'utf8'));
  const script = JSON.parse(await readFile(join(project, 'voice-cues.json'), 'utf8'));
  validateVoice(props, script);
  await cp(join(project, 'public'), publicDir, {recursive: true});
  await copyFile(join(output, 'audio/narration.wav'), join(publicDir, 'njombe/narration.wav'));
  serveUrl = await bundle({entryPoint: join(project, 'src/index.ts'), publicDir});
  browser = await openBrowser('chrome', {browserExecutable, logLevel: 'warn'});
  const client = {serveUrl, puppeteerInstance: browser, logLevel: 'warn'};
  const reel = await selectComposition({...client, id: 'NjombeReel', inputProps: props});
  if (mode !== 'reel') {
    const [carouselDir, checksDir] = [join(output, 'carousel'), join(output, 'checks')];
    await Promise.all([mkdir(carouselDir, {recursive: true}), mkdir(checksDir, {recursive: true})]);
    const carousel = await selectComposition({...client, id: 'NjombeCarousel'});
    for (const [frame, name] of carouselNames.entries()) {
      await renderStill({...client, composition: carousel, frame, output: join(carouselDir, `${name}.png`)});
      console.log(`Carousel: ${name}`);
    }
    for (const cue of props.cues) {
      const frame = Math.min(cue.end - 2, cue.start + Math.round((cue.end - cue.start)*0.75));
      await renderStill({...client, composition: reel, frame, inputProps: props,
        output: join(checksDir, `${String(frame).padStart(4, '0')}-${cue.shot}.png`), scale: 0.5});
    }
    await renderStill({...client, composition: reel, frame: reel.durationInFrames - 1, inputProps: props,
      output: join(checksDir, 'last-frame.png'), scale: 0.5});
    console.log('Reel stills: hook, every story beat and final frame.');
  }
  if (mode !== 'stills') {
    const outputLocation = join(output, 'Reel-Parachichi-la-Njombe.mp4');
    const total = reel.durationInFrames;
    let lastLog = -1;
    await renderMedia({...client, composition: reel, inputProps: props, outputLocation,
      codec: 'h264', audioCodec: 'aac', audioBitrate: '192k', sampleRate: 48000, pixelFormat: 'yuv420p',
      colorSpace: 'bt709', imageFormat: 'jpeg', jpegQuality: 90, crf: 18, x264Preset: 'veryfast',
      concurrency: Number(process.env.NJOMBE_CONCURRENCY ?? 2),
      onProgress: ({renderedFrames, encodedFrames}) => {
        const milestone = Math.floor(renderedFrames / total * 10);
        if (milestone > lastLog) {
          console.log(`Reel: ${renderedFrames}/${total} frames rendered (${encodedFrames} encoded)`);
          lastLog = milestone;
        }
      }});
    console.log(`Ready: ${outputLocation}`);
  }
} finally {
  if (browser) await browser.close({silent: true});
  if (serveUrl) await rm(serveUrl, {recursive: true, force: true});
  await rm(scratch, {recursive: true, force: true});
}
