import assert from 'node:assert/strict';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {copyFile,mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {tryStockAccess} from './access.mjs';
import {writeStickers} from './stickers.mjs';
import {muxExact} from './mux.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const out=resolve(process.env.AGENT_ACCESS_OUT||join(root,'out/agent-access'));
const mode=process.argv[2]||'all';
assert(['stills','video','all'].includes(mode),'Use stills, video or all');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const [takes,cues,assets,proof]=await Promise.all([
  json(join(out,'audio/props.json')),json(join(here,'voice-cues.json')),json(join(out,'assets/evidence.json')),tryStockAccess(),
]);
assert.equal(takes.durationInFrames,1800);
assert.deepEqual(takes.cues.map(({scene,spoken,sw,en})=>({scene,spoken,sw,en})),cues);
for(const [i,c] of takes.cues.entries()){
  const steps=[c.sceneStart,c.start,c.end,c.captionEnd,c.sceneEnd];
  assert(steps.every(Number.isInteger)&&steps.every((n,j)=>j===0||n>steps[j-1]));
  assert.equal(c.sceneStart,i?takes.cues[i-1].sceneEnd:0);
}
assert.equal(takes.cues.at(-1).sceneEnd,1800);
assert.deepEqual(proof.offered,['read_stock']);
assert.equal(proof.read.ok,true);
assert.equal(proof.rejected.denied,true,proof.rejected.message);
assert.equal(proof.book.before,proof.book.after);
assert.deepEqual(assets.map(x=>x.file).sort(),['desk-approval.webp','desk-hero.webp','faida-brand.webp','faida-preview.webp']);
for(const asset of assets){
  const digest=createHash('sha256').update(await readFile(join(out,'assets',asset.file))).digest('hex');
  assert.equal(digest,asset.sha256,`${asset.file} differs from render manifest`);
}
const props={...takes,proof};
await Promise.all([mkdir(join(out,'qa'),{recursive:true}),writeStickers(join(out,'stickers'))]);
await writeFile(join(out,'qa','local-mcp-results.json'),JSON.stringify(proof,null,2)+'\n');
await copyFile(join(root,'content/pilots/06-agent-access-caption.txt'),join(out,'Caption-AI-Isome-Stoo.txt'));
const tmp=await mkdtemp(join(tmpdir(),'agent-access-reel-'));
const publicDir=join(tmp,'public');
const imageDir=join(publicDir,'agent-access');
let site,browser;
try{
  await mkdir(imageDir,{recursive:true});
  await Promise.all([
    ...assets.map(a=>copyFile(join(out,'assets',a.file),join(imageDir,a.file))),
    copyFile(join(out,'audio/mix.wav'),join(imageDir,'mix.wav')),
    copyFile(join(root,'content/assets/altraware-mark.png'),join(imageDir,'altraware.png')),
  ]);
  site=await bundle({entryPoint:join(here,'index.ts'),publicDir});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH??null,logLevel:'warn'});
  const ctx={serveUrl:site,puppeteerInstance:browser,logLevel:'warn'};
  const composition=await selectComposition({...ctx,id:'AgentAccess30',inputProps:props});
  assert.deepEqual([composition.width,composition.height,composition.fps,composition.durationInFrames],[1080,1920,60,1800]);
  if(mode!=='video'){
    const keyFrames=[['opening',0],...takes.cues.map((c,i)=>[c.scene,c.sceneStart+(i===4?173:259)]),['last',1799]];
    for(const [key,frame] of keyFrames){
      await renderStill({...ctx,composition,inputProps:props,frame,scale:.5,output:join(out,'qa',`${key}.png`)});
      console.log(`${key}: f${frame}`);
    }
    const coverProps={...props,cover:true};
    const cover=await selectComposition({...ctx,id:'AgentAccess30',inputProps:coverProps});
    await renderStill({...ctx,composition:cover,inputProps:coverProps,frame:0,output:join(out,'Cover-AI-Isome-Stoo.png')});
  }
  if(mode!=='stills'){
    let last=-1;
    const video=join(tmp,'picture.mp4');
    const output=join(out,'Reel-AI-Isome-Stoo-Bei-Ibaki-30s.mp4');
    await renderMedia({...ctx,composition,inputProps:props,outputLocation:video,codec:'h264',muted:true,
      pixelFormat:'yuv420p',colorSpace:'bt709',imageFormat:'jpeg',jpegQuality:92,crf:18,x264Preset:'veryfast',concurrency:2,
      onProgress:({renderedFrames})=>{
        const step=Math.floor(renderedFrames/180);
        if(step>last){last=step;console.log(`${renderedFrames}/1800`);}
      }});
    await muxExact({video,pcm:join(out,'audio/mix.wav'),output});
    console.log(output);
  }
}finally{
  if(browser) await browser.close({silent:true});
  if(site) await rm(site,{recursive:true,force:true});
  await rm(tmp,{recursive:true,force:true});
}
