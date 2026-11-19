import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {copyFile,mkdir,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {availableParallelism,tmpdir} from 'node:os';
import {join,resolve,dirname,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {proof} from './rate-demo.mjs';

const here=dirname(fileURLToPath(import.meta.url));const root=resolve(here,'../..');
const out=resolve(process.env.MODEL_GUIDE_OUT||join(root,'out/model-providers'));
const ff=process.env.FFMPEG_PATH||'ffmpeg';
assert(!ff.includes('/')||isAbsolute(ff),'Set FFMPEG_PATH to an absolute path.');
const mode=process.argv[2]||'all';assert(['all','stills','video','caption'].includes(mode));
const dims=[1080,1920,60,3600];
const picture=join(out,'Tech-Tip-Model-Providers-Voiceover-Master.mp4');
const voiced=join(out,'Tech-Tip-Free-AI-API-60s.mp4');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const {fps,frames,scenes,captions}=await json(join(out,'audio/timeline.json'));
const cueSource=await json(join(here,'cues.json'));
assert.equal(fps,60);assert.equal(frames,3600);
assert.deepEqual(scenes.map(s=>[s.shot,s.end]),cueSource.map(s=>[s.shot,s.end]));
for(const [i,s] of scenes.entries()){
 assert.equal(s.start,i===0?0:scenes[i-1].end);
 assert(s.start<s.voiceStart&&s.voiceStart<s.voiceEnd&&s.voiceEnd<s.end);
}
assert.equal(scenes.at(-1).end,frames);
assert.equal(captions.length,17);
const demo=proof();
assert.equal(demo.policy.action,'wait');
assert.equal(demo.policy.after,2);
const marks={deepseek:'deepseek-color',claude:'claude-color',zai:'zai',qwen:'qwen-color',gemini:'gemini-color',openrouter:'openrouter-color',ollama:'ollama'};
const imgManifest=await json(join(out,'assets/manifest.json'));
assert.deepEqual(imgManifest.map(a=>a.file).sort(),['key-desk.jpg','local-desk.jpg']);
for(const a of imgManifest)assert.equal(hash(await readFile(join(out,'assets',a.file))),a.sha256);
const assure=await readFile(join(out,'audio/reference.wav'));
assert(assure.length>=60*48000*2);
const sceneCut=scenes.map(s=>[s.shot,s.start,s.end]);
const tm=n=>{const t=Math.round(n*100/60);const z=v=>String(v).padStart(2,'0');return `${Math.floor(t/360000)}:${z(Math.floor(t/6000)%60)}:${z(Math.floor(t/100)%60)}.${z(t%100)}`;};
function ass(){
 let last=-1;
 const header='[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\nScaledBorderAndShadow: yes\nYCbCr Matrix: TV.709\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: SW,DejaVu Sans,39,&H00331E24,&H00331E24,&H00EAF5FF,&H00EAF5FF,-1,0,0,0,100,100,0,0,3,10,0,5,0,0,0,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';
 const rows=captions.map(c=>{assert(last<c.start&&c.start<c.end&&c.end<=frames);last=c.end;
  assert(c.sw.length<=2&&c.sw.every(s=>s.length<=42&&!/[{}\\\r\n]/.test(s)));
  return `Dialogue: 0,${tm(c.start)},${tm(c.end)},SW,,0,0,0,,{\\an5\\pos(474,1355)}${c.sw.join('\\N')}`;
 });
 return header+rows.join('\n')+'\n';
}
await mkdir(join(out,'qa'),{recursive:true});
const tmp=await mkdtemp(join(tmpdir(),'model-guide-reel-'));let site,browser;
try{
 if(mode!=='caption'){
  const pub=join(tmp,'public');const assets=join(pub,'models');await mkdir(assets,{recursive:true});
  const licenses=await Promise.all(Object.entries(marks).map(async ([name,symbol])=>{
   const file=join(here,`node_modules/@lobehub/icons-static-svg/icons/${symbol}.svg`);const b=await readFile(file);
   await writeFile(join(assets,`${name}.svg`),b);
   return {file:`${name}.svg`,source:`@lobehub/icons-static-svg@1.104.0/icons/${symbol}.svg`,sha256:hash(b),use:'Identification in editorial review; respective trademarks, no affiliation.'};
  }));
  await writeFile(join(out,'qa/asset-credits.json'),JSON.stringify([...imgManifest,...licenses],null,2)+'\n');
  await Promise.all([
   ...imgManifest.map(a=>copyFile(join(out,'assets',a.file),join(assets,a.file))),
   copyFile(join(root,'content/assets/altraware-mark.png'),join(assets,'altraware.png')),
   copyFile(join(out,'qa/guide-sw-1.png'),join(assets,'guide-sw.png')),
   copyFile(join(out,'qa/guide-en-1.png'),join(assets,'guide-en.png')),
  ]);
  site=await bundle({entryPoint:join(here,'index.ts'),publicDir:pub});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH||null,logLevel:'warn'});
  const ctx={serveUrl:site,puppeteerInstance:browser,logLevel:'warn'};
  const props={scenes,demo};
  const comp=await selectComposition({...ctx,id:'ModelProviders',inputProps:props});
  assert.deepEqual([comp.width,comp.height,comp.fps,comp.durationInFrames],dims);
  if(mode!=='video'){
   for(const [i,s] of scenes.entries()){
    const f=s.start+[280,360,370,240,330,330,402,265][i];
    assert(f<s.end);
    await renderStill({...ctx,composition:comp,inputProps:props,scale:.5,frame:f,output:join(out,'qa',`phone-${i+1}.png`)});
    console.log(`Still ${i+1}: f${f}`);
   }
   const coverProps={...props,cover:true};
   const cover=await selectComposition({...ctx,id:'ModelProviders',inputProps:coverProps});
   await renderStill({...ctx,composition:cover,inputProps:coverProps,frame:232,output:join(out,'Cover-Free-AI-API.png')});
  }
  if(mode!=='stills'){
   let m=-1;
   await renderMedia({...ctx,composition:comp,inputProps:props,codec:'h264',muted:true,outputLocation:picture,
       pixelFormat:'yuv420p',colorSpace:'bt709',crf:16,imageFormat:'jpeg',jpegQuality:94,x264Preset:'veryfast',concurrency:Math.min(2,availableParallelism()),
       onProgress:({renderedFrames})=>{if(Math.floor(renderedFrames/180)>m){m=Math.floor(renderedFrames/180);console.log(`${renderedFrames}/3600 picture`);}}});
   await writeFile(join(out,'qa/picture-cut.json'),JSON.stringify(sceneCut)+'\n');
  }
 }
 if(mode!=='stills'){
  assert.deepEqual(await json(join(out,'qa/picture-cut.json')),sceneCut,'Scene edits changed; rerender the picture');
  await writeFile(join(tmp,'captions.ass'),ass());
  const exec=promisify(execFile);
  await exec(ff,['-nostdin','-v','error','-xerror','-y','-i',picture,'-i',join(out,'audio/reference.wav'),'-map','0:v:0','-map','1:a:0',
   '-vf','ass=captions.ass','-c:v','libx264','-threads','3','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-colorspace','bt709',
   '-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','192k','-ar','48000','-t','60','-movflags','+faststart',voiced],{cwd:tmp});
  console.log('Muxed 60.000s with reference VO and SW burn-in.');
 }
}finally{if(browser)await browser.close({silent:true});if(site)await rm(site,{recursive:true,force:true});await rm(tmp,{recursive:true,force:true});}
