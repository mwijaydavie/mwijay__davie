import assert from 'node:assert/strict';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {copyFile,mkdir,mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const root=resolve(here,'../..');
const out=resolve(process.env.UAUT_OUT??join(root,'out/uaut'));
const mode=process.argv[2]??'all';
assert(['all','stills','reel'].includes(mode),'Use all, stills or reel');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const [project,voice,props,evidence,copy]=await Promise.all([
  json(join(here,'project.json')),json(join(here,'voice-cues.json')),json(join(out,'audio/props.json')),
  json(join(out,'assets/evidence.json')),readFile(join(root,'content/pilots/04-uaut-caption.txt'),'utf8'),
]);
assert.equal(voice.length,props.cues.length);
assert(copy.includes(new URL(project.url).hostname.replace(/^www\./,'')));
assert(Number.isInteger(props.durationInFrames)&&props.durationInFrames<25*60);
for(const [i,c] of props.cues.entries()){
  assert.deepEqual({shot:c.shot,sw:c.sw,en:c.en},voice[i]);
  assert([c.start,c.end,c.captionEnd].every(Number.isInteger)&&c.start>=0&&c.end>c.start&&c.captionEnd>c.end);
  assert.equal(c.captionEnd,props.cues[i+1]?props.cues[i+1].start-7:props.durationInFrames);
}
const crops=['nav.png','mark.png','programs.png','home-actions.png'];
assert.deepEqual(evidence.crops.map(x=>x.file).sort(),[...crops].sort());
const temp=await mkdtemp(join(tmpdir(),'uaut-reel-'));
const publicDir=join(temp,'public'), assets=join(publicDir,'uaut');
let build;
let browser;
try{
  await mkdir(assets,{recursive:true});
  await Promise.all([
    ...crops.map(name=>copyFile(join(out,'assets',name),join(assets,name))),
    copyFile(join(root,'content/assets/altraware-mark.png'),join(assets,'altraware.png')),
    copyFile(join(out,'audio/narration.wav'),join(assets,'narration.wav')),
  ]);
  build=await bundle({entryPoint:join(here,'src/index.ts'),publicDir});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH??null,logLevel:'warn'});
  const ctx={serveUrl:build,puppeteerInstance:browser,logLevel:'warn'};
  const reel=await selectComposition({...ctx,id:'UautReel',inputProps:props});
  assert.equal(reel.durationInFrames,props.durationInFrames);
  assert.equal(reel.fps,60);
  if(mode!=='reel'){
    const slides=join(out,'slides'), qa=join(out,'qa');
    await Promise.all([mkdir(slides,{recursive:true}),mkdir(qa,{recursive:true})]);
    const carousel=await selectComposition({...ctx,id:'UautCarousel'});
    for(const [i,{file}] of project.slides.entries()){
      await renderStill({...ctx,composition:carousel,frame:i,output:join(slides,`${file}.png`)});
      console.log(`Slide ${i+1}: ${file}`);
    }
    await renderStill({...ctx,composition:reel,frame:0,inputProps:props,output:join(qa,'reel-0-opening.png'),scale:.5});
    for(const [i,cue] of props.cues.entries()){
      const frame=Math.round(cue.start+.81*(cue.end-cue.start));
      await renderStill({...ctx,composition:reel,frame,inputProps:props,output:join(qa,`reel-${i+1}-${cue.shot}.png`),scale:.5});
    }
    await renderStill({...ctx,composition:reel,frame:props.cues[0].end-12,inputProps:{...props,cover:true},output:join(out,'Cover-UAUT-Connect.png')});
  }
  if(mode!=='stills'){
    let checkpoint=-1;
    const outputLocation=join(out,'Reel-UAUT-Connect-Tulipata-Nafasi.mp4');
    await renderMedia({...ctx,composition:reel,inputProps:props,outputLocation,codec:'h264',audioCodec:'aac',audioBitrate:'192k',sampleRate:48000,
      pixelFormat:'yuv420p',colorSpace:'bt709',imageFormat:'jpeg',jpegQuality:92,crf:18,x264Preset:'veryfast',concurrency:2,
      onProgress:({renderedFrames})=>{
        const step=Math.floor(renderedFrames*10/reel.durationInFrames);
        if(step>checkpoint){checkpoint=step;console.log(`${renderedFrames}/${reel.durationInFrames} frames`);}
      }});
    console.log(`Rendered ${outputLocation}`);
  }
}finally{
  if(browser) await browser.close({silent:true});
  if(build) await rm(build,{recursive:true,force:true});
  await rm(temp,{recursive:true,force:true});
}
