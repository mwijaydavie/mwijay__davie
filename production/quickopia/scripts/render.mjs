import assert from 'node:assert/strict';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {copyFile,mkdir,mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const root=resolve(here,'../..');
const mode=process.argv[2]??'all';
const version=process.argv[3]??'v1';
assert(['all','stills','reel'].includes(mode),'Use all, stills or reel');
assert(['v1','v2'].includes(version),'Use v1 or v2');
const daylight=version==='v2';
const out=resolve(process.env.QUICKOPIA_OUT||join(root,daylight?'out/quickopia-v2':'out/quickopia'));
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const [brief,props,script,evidence,caption]=await Promise.all([
  json(join(here,'project.json')),json(join(out,'audio','props.json')),json(join(here,daylight?'voice-cues-v2.json':'voice-cues.json')),
  json(join(out,'assets','evidence.json')),readFile(join(root,'content/pilots/03-quickopia-caption.txt'),'utf8'),
]);
assert.deepEqual(brief.palette,evidence.palette);
if(!daylight)assert.equal(props.cues.length,brief.slideFiles.length);
assert.equal(props.cues.length,script.length);
assert(Number.isInteger(props.durationInFrames)&&props.durationInFrames>props.cues.at(-1).end);
assert(['sw','en'].every(lang=>props.cues.at(-1)[lang].join(' ').toUpperCase().includes(brief.keyword)));
assert(caption.includes(brief.walkthroughUrl)&&caption.includes(`“${brief.keyword}”`));
if(daylight)assert(props.durationInFrames<25*60,'V2 must be under 25 seconds');
for(const [i,c] of props.cues.entries()){
  assert(Number.isInteger(c.start)&&Number.isInteger(c.end)&&c.start>=0&&c.end>c.start);
  if(i)assert(c.start>=props.cues[i-1].end);
  assert.deepEqual({shot:c.shot,sw:c.sw,en:c.en},script[i]);
  if(daylight){
    assert(Number.isInteger(c.captionEnd)&&c.captionEnd>=c.end);
    assert(c.captionEnd===(props.cues[i+1]?props.cues[i+1].start-7:props.durationInFrames));
  }
}
const scratch=await mkdtemp(join(tmpdir(),'quickopia-'));
const publicDir=join(scratch,'public'), assets=join(publicDir,'quickopia');
const cropFiles=['quickopia-icon','quickopia-wordmark','catalog','locale','cart-nav','notice','help'];
assert.deepEqual(evidence.assets.map(a=>a.asset).sort(),cropFiles.map(x=>`${x}.png`).sort());
let build;
let browser;
try{
  await mkdir(assets,{recursive:true});
  await Promise.all([
    ...cropFiles.map(k=>copyFile(join(out,'assets',`${k}.png`),join(assets,`${k}.png`))),
    copyFile(join(out,'audio','narration.wav'),join(assets,'narration.wav')),
    copyFile(join(root,'content/assets/altraware-mark.png'),join(assets,'altraware.png')),
  ]);
  build=await bundle({entryPoint:join(here,'src/index.ts'),publicDir});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH??null,logLevel:'warn'});
  const client={serveUrl:build,puppeteerInstance:browser,logLevel:'warn'};
  const reel=await selectComposition({...client,id:daylight?'QuickopiaDaylight':'QuickopiaReel',inputProps:props});
  assert.equal(reel.fps,60);
  assert.equal(reel.durationInFrames,props.durationInFrames);
  if(mode!=='reel'){
    const qa=join(out,'qa');
    await mkdir(qa,{recursive:true});
    if(!daylight){
      const slides=join(out,'slides');
      await mkdir(slides,{recursive:true});
      const gallery=await selectComposition({...client,id:'QuickopiaCarousel'});
      for(const [frame,name] of brief.slideFiles.entries()){
        await renderStill({...client,composition:gallery,frame,output:join(slides,`${name}.png`)});
        console.log(`Slide ${frame+1}: ${name}`);
      }
    }
    for(const [i,cue] of props.cues.entries()){
      const frame=Math.round(cue.start+.82*(cue.end-cue.start));
      await renderStill({...client,composition:reel,frame,inputProps:props,output:join(qa,`${i+1}-${cue.shot}.png`),scale:.5});
    }
    const first=props.cues[0];
    await renderStill({...client,composition:reel,frame:Math.round(first.start+.88*(first.end-first.start)),inputProps:{...props,cover:true},output:join(out,daylight?'Cover-Quickopia-V2.png':'Cover-Quickopia.png')});
  }
  if(mode!=='stills'){
    let last=-1;
    const outputLocation=join(out,daylight?'Reel-Quickopia-Kikapu-si-oda-V2.mp4':'Reel-Quickopia-Cart-si-oda.mp4');
    await renderMedia({...client,composition:reel,inputProps:props,outputLocation,codec:'h264',audioCodec:'aac',audioBitrate:'192k',sampleRate:48000,
      pixelFormat:'yuv420p',colorSpace:'bt709',imageFormat:'jpeg',jpegQuality:91,crf:18,x264Preset:'veryfast',concurrency:2,
      onProgress:({renderedFrames,encodedFrames})=>{
        const step=Math.floor(10*renderedFrames/reel.durationInFrames);
        if(step>last){last=step;console.log(`${renderedFrames}/${reel.durationInFrames} frames (${encodedFrames} encoded)`);}
      }});
    console.log(`Ready: ${outputLocation}`);
  }
}finally{
  if(browser)await browser.close({silent:true});
  if(build)await rm(build,{recursive:true,force:true});
  await rm(scratch,{recursive:true,force:true});
}
