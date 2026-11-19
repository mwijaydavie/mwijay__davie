import assert from 'node:assert/strict';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {copyFile,mkdir,mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const out=resolve(process.env.PAYMENT_CHECK_OUT||join(root,'out/payment-check'));
const mode=process.argv[2]??'all';
assert(['all','stills','video'].includes(mode),'Use all, stills or video');
const props=JSON.parse(await readFile(join(out,'audio/props.json'),'utf8'));
const script=JSON.parse(await readFile(join(here,'voice-cues.json'),'utf8'));
assert(Number.isInteger(props.durationInFrames)&&props.durationInFrames>0&&props.durationInFrames<1500);
assert.deepEqual(props.cues.map(({shot,sw,en})=>({shot,sw,en})),script);
for(const [i,c] of props.cues.entries()){
  assert([c.start,c.end,c.captionEnd].every(Number.isInteger)&&c.start>=0&&c.start<c.end&&c.end<c.captionEnd);
  assert.equal(c.captionEnd,props.cues[i+1]?props.cues[i+1].start-5:props.durationInFrames);
}
const tmp=await mkdtemp(join(tmpdir(),'payment-check-reel-'));
const publicDir=join(tmp,'public'), assets=join(publicDir,'payment-check');
let build,browser;
try{
  await mkdir(assets,{recursive:true});
  await Promise.all([
    copyFile(join(root,'content/assets/altraware-mark.png'),join(assets,'mark.png')),
    copyFile(join(out,'qa/guide-01.png'),join(assets,'guide-cover.png')),
    copyFile(join(out,'qa/guide-03.png'),join(assets,'guide-worksheet.png')),
    copyFile(join(out,'audio/narration.wav'),join(assets,'narration.wav')),
  ]);
  build=await bundle({entryPoint:join(here,'reel-index.ts'),publicDir});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH??null,logLevel:'warn'});
  const ctx={serveUrl:build,puppeteerInstance:browser,logLevel:'warn'};
  const composition=await selectComposition({...ctx,id:'PaymentCheck',inputProps:props});
  assert.deepEqual([composition.width,composition.height,composition.fps,composition.durationInFrames],
    [1080,1920,60,props.durationInFrames]);
  if(mode!=='video'){
    await renderStill({...ctx,composition,inputProps:{...props,cover:true},frame:0,output:join(out,'Cover-Payment-Check.png')});
    const frames=[['opening',0],...props.cues.map(c=>[c.shot,Math.round(c.start+(c.end-c.start)*.77)]),['final',props.durationInFrames-1]];
    for(const [name,frame] of frames){
      await renderStill({...ctx,composition,inputProps:props,frame,scale:.5,output:join(out,'qa',`reel-${name}.png`)});
      console.log(`Reel ${name}: frame ${frame}`);
    }
  }
  if(mode!=='stills'){
    const outputLocation=join(out,'Reel-Payment-Check-Risiti-Moja.mp4');
    let step=-1;
    await renderMedia({...ctx,composition,inputProps:props,outputLocation,codec:'h264',audioCodec:'aac',audioBitrate:'192k',sampleRate:48000,
      pixelFormat:'yuv420p',colorSpace:'bt709',imageFormat:'jpeg',jpegQuality:92,crf:18,x264Preset:'veryfast',concurrency:2,
      onProgress:({renderedFrames})=>{
        const next=Math.floor(renderedFrames*10/composition.durationInFrames);
        if(next>step){step=next;console.log(`${renderedFrames}/${composition.durationInFrames} frames`);}
      }});
    console.log(`Rendered ${outputLocation}`);
  }
}finally{
  if(browser) await browser.close({silent:true});
  if(build) await rm(build,{recursive:true,force:true});
  await rm(tmp,{recursive:true,force:true});
}
