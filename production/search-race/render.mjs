import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {copyFile,mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {availableParallelism,tmpdir} from 'node:os';
import {dirname,resolve,join,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {out,runLab} from './lab.mjs';

const here=dirname(fileURLToPath(import.meta.url));const root=resolve(here,'../..');
const mode=process.argv[2]??'all';assert(['all','stills','video','caption'].includes(mode));
const ff=process.env.FFMPEG_PATH||'ffmpeg';assert(!ff.includes('/')||isAbsolute(ff));
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const qa=join(out,'qa');await mkdir(qa,{recursive:true});
const [tl,rig,layout,proof]=await Promise.all([json(join(out,'audio/timeline.json')),json(join(qa,'host-rig.json')),json(join(here,'layout.json')),runLab()]);
const {shots,captions,fps,frames}=tl;assert.equal(fps,layout.fps);assert.equal(frames,layout.frames);assert.equal(captions.length,16);
assert.deepEqual(shots.map(s=>s.shot),['hook','race','fix','repeat','cta']);assert.equal(shots[0].start,0);assert.equal(shots.at(-1).end,frames);
for(const [i,s] of shots.entries())assert((i===0||s.start===shots[i-1].end)&&s.start<s.voiceStart&&s.voiceStart<s.voiceEnd&&s.voiceEnd<s.end);
assert.deepEqual(Object.keys(rig.poses),['hello','point']);assert.equal(rig.files.length,7);
await writeFile(join(qa,'search-proof.json'),JSON.stringify(proof,null,2)+'\n');
const props={shots,rig,proof,cover:false};
const pic=join(out,'Search-Race-Clean-Picture.mp4');const fx=join(out,'Search-Race-Picture-and-SFX.mp4');const preview=join(out,'Mbona-Pilau-Imerudi-Reel.mp4');
const sha=b=>createHash('sha256').update(b).digest('hex');
const source=['Story.tsx','TechHost.tsx','story.css','host.css','index.ts','layout.json'].map(n=>join(here,n));
const mark=join(root,'content/assets/altraware-mark.png');
const signature=sha(JSON.stringify({props,files:await Promise.all([...source,mark].map(async n=>sha(await readFile(n))))}));
const tc=f=>{const t=Math.round(f*100/fps);return `0:00:${String(Math.floor(t/100)).padStart(2,'0')}.${String(t%100).padStart(2,'0')}`;};
function ass(){
 const head=`[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: SW,DejaVu Sans,40,&H003A2E1D,&H003A2E1D,&H00FDF7E8,&H00FDF7E8,-1,0,0,0,100,100,0,0,3,10,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
 let prev=-1;
 return head+captions.map(c=>{
  assert(prev<c.start&&c.start<c.end&&c.end<frames&&c.sw.length<=2&&c.sw.every(s=>s.length<=43&&!/[{}\\\r\n]/.test(s)));prev=c.end;
  return `Dialogue: 0,${tc(c.start)},${tc(c.end)},SW,,0,0,0,,{\\an5\\pos(470,1361)}${c.sw.join('\\N')}`;
 }).join('\n')+'\n';
}
const temp=await mkdtemp(join(tmpdir(),'search-race-'));let site,browser;
try{
 if(mode!=='caption'){
  const pub=join(temp,'public');const assets=join(pub,'search-race');await mkdir(assets,{recursive:true});
  for(const a of rig.files){const src=join(out,'assets',a.file);assert.equal(sha(await readFile(src)),a.sha256);await copyFile(src,join(assets,a.file));}
  await copyFile(mark,join(assets,'altraware.png'));
  site=await bundle({entryPoint:join(here,'index.ts'),publicDir:pub});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH||null,logLevel:'warn'});
  const ctx={serveUrl:site,puppeteerInstance:browser,logLevel:'warn'};
  const composition=await selectComposition({...ctx,id:'SearchRace',inputProps:props});
  assert.deepEqual([composition.width,composition.height,composition.fps,composition.durationInFrames],[layout.width,layout.height,layout.fps,layout.frames]);
  if(mode==='all'||mode==='stills'){
   for(const [k,frame] of Object.entries(layout.review))await renderStill({...ctx,composition,inputProps:props,scale:.5,frame,output:join(qa,`still-${k}.png`)});
   const coverProps={...props,cover:true};
   await renderStill({...ctx,composition,inputProps:coverProps,frame:0,output:join(out,'Cover-Mbona-Pilau.png')});
   console.log('Keyframes and cover rendered.');
  }
  if(mode==='all'||mode==='video'){
   let m=-1;
   await renderMedia({...ctx,composition,inputProps:props,codec:'h264',muted:true,outputLocation:pic,pixelFormat:'yuv420p',colorSpace:'bt709',
        crf:16,imageFormat:'jpeg',jpegQuality:95,x264Preset:'veryfast',concurrency:Math.min(2,availableParallelism()),
        onProgress:({renderedFrames})=>{const n=Math.floor(renderedFrames/(frames/10));if(n!==m){m=n;console.log(`${renderedFrames}/${frames} picture`);}}});
   await writeFile(join(qa,'picture-cut.json'),JSON.stringify({signature,sha256:sha(await readFile(pic))},null,2)+'\n');
  }
 }
 if(mode!=='stills'){
  assert.deepEqual(await json(join(qa,'picture-cut.json')),{signature,sha256:sha(await readFile(pic))});await writeFile(join(temp,'captions.ass'),ass());
  const encode=['-vf','ass=captions.ass','-c:v','libx264','-threads','2','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709'];
  for(const [stem,target,v] of [['SFX-Only.wav',fx,['-c:v','copy']],['Voice-and-SFX.wav',preview,encode]]){
   await promisify(execFile)(ff,['-nostdin','-v','error','-xerror','-y','-i',pic,'-i',join(out,'audio',stem),'-map','0:v:0','-map','1:a:0',...v,
     '-c:a','aac','-b:a','192k','-ar','48000','-t',String(frames/fps),'-movflags','+faststart',target],{cwd:temp});
  }
  console.log('37s review with Swanglish captions, picture + SFX master, clean silent picture.');
 }
}finally{if(browser)await browser.close({silent:true});if(site)await rm(site,{force:true,recursive:true});await rm(temp,{force:true,recursive:true});}
