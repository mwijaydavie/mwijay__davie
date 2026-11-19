import assert from 'node:assert/strict';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {copyFile, mkdir, mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {keyword} from '../guide.mjs';

const project=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root=resolve(project,'../..');
const out=resolve(process.env.SHIP_CHECK_OUT || join(root,'out/ship-check'));
const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
const mode=process.argv[2] ?? 'all';
assert(['stills','reel','all'].includes(mode),'Use stills, reel or all');
const props=await readJson(join(out,'audio/props.json'));
const script=await readJson(join(project,'reel-cues.json'));
const receipts=await readJson(join(out,'proof/test-results.json'));
assert.deepEqual(receipts.map(r=>[r.build,r.toast,r.recordsBeforeReload,r.recordsAfterReload,r.verdict]),[
  ['A','Saved',1,0,'FAIL'],['B','Saved',1,1,'PASS'],
]);
assert.equal(props.cues.length,script.length);
assert(Number.isInteger(props.durationInFrames) && props.durationInFrames>props.cues.at(-1).end);
assert(props.cues.at(-1).sw.join(' ').includes(keyword) && props.cues.at(-1).en.join(' ').includes(keyword));
for (const [i,cue] of props.cues.entries()) {
  assert(Number.isInteger(cue.start) && Number.isInteger(cue.end) && cue.start>=0 && cue.end>cue.start);
  if(i) assert(cue.start>=props.cues[i-1].end);
  assert.deepEqual({shot:cue.shot,sw:cue.sw,en:cue.en},script[i]);
}
let serveUrl;
let browser;
const scratch=await mkdtemp(join(tmpdir(),'ship-check-reel-'));
const publicDir=join(scratch,'public');
const assets=join(publicDir,'ship-check');
try {
  await mkdir(assets,{recursive:true});
  await Promise.all([
    ...['A','B','A-form-ready','A-form-saved','B-form-saved'].map(n=>copyFile(join(out,'proof',`${n}.png`),join(assets,`${n}.png`))),
    copyFile(join(out,'qa','guide-sw-01.png'),join(assets,'guide-sw-01.png')),
    copyFile(join(out,'audio','narration.wav'),join(assets,'narration.wav')),
    copyFile(join(root,'content','assets','altraware-mark.png'),join(assets,'mark.png')),
  ]);
  serveUrl=await bundle({entryPoint:join(project,'reel/index.ts'),publicDir});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH ?? null,logLevel:'warn'});
  const client={serveUrl,puppeteerInstance:browser,logLevel:'warn'};
  const composition=await selectComposition({...client,id:'ShipCheckReel',inputProps:props});
  assert.equal(composition.durationInFrames,props.durationInFrames);
  assert.equal(composition.fps,60);
  if(mode!=='reel') {
    const qa=join(out,'qa','reel');
    await mkdir(qa,{recursive:true});
    for(const [i,cue] of props.cues.entries()) {
      const frame=Math.round(cue.start+.76*(cue.end-cue.start));
      await renderStill({...client,composition,frame,inputProps:props,output:join(qa,`${i+1}-${cue.shot}.png`),scale:.5});
    }
    await renderStill({...client,composition,frame:composition.durationInFrames-1,inputProps:props,output:join(qa,'9-last.png'),scale:.5});
    const first=props.cues[0];
    await renderStill({...client,composition,frame:Math.round(first.start+.79*(first.end-first.start)),inputProps:{...props,cover:true},
      output:join(out,'Cover-Ship-Check.png')});
    console.log('Reel QA stills and cover rendered.');
  }
  if(mode!=='stills') {
    let step=-1;
    const outputLocation=join(out,'Reel-Ship-Check-Kiswahili.mp4');
    await renderMedia({...client,composition,inputProps:props,outputLocation,codec:'h264',pixelFormat:'yuv420p',colorSpace:'bt709',
      audioCodec:'aac',audioBitrate:'192k',sampleRate:48000,crf:18,x264Preset:'veryfast',imageFormat:'jpeg',jpegQuality:90,
      concurrency:2,onProgress:({renderedFrames,encodedFrames})=>{
        const n=Math.floor(10*renderedFrames/composition.durationInFrames);
        if(n>step){step=n;console.log(`Reel: ${renderedFrames}/${composition.durationInFrames} frames (${encodedFrames} encoded)`);}
      }});
    console.log(`Ready: ${outputLocation}`);
  }
} finally {
  if(browser) await browser.close({silent:true});
  if(serveUrl) await rm(serveUrl,{recursive:true,force:true});
  await rm(scratch,{recursive:true,force:true});
}
