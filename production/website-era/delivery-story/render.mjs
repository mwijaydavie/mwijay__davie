import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFile,mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {availableParallelism,tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';

const here=dirname(fileURLToPath(import.meta.url));
const out=resolve(process.env.DELIVERY_STORY_OUT||join(here,'../../../out/delivery-story'));
const mode=process.argv[2]||'all';assert(['all','stills','video','mux'].includes(mode));
const run=promisify(execFile),json=async path=>JSON.parse(await readFile(path,'utf8'));
const sha=data=>createHash('sha256').update(data).digest('hex');
const digest=async path=>sha(await readFile(path));
const ff=process.env.FFMPEG_PATH||'ffmpeg';
const qa=join(out,'qa'),audio=join(out,'audio');
const [layout,cues,tl,rig,lip,assets]=await Promise.all([
 json(join(here,'layout.json')),json(join(here,'cues.json')),json(join(audio,'timeline.json')),json(join(qa,'host-rig.json')),
 json(join(audio,'mouth-timeline.json')),json(join(qa,'assets.json')),
]);
const {fps,frames,shots,captions}=tl;
assert.deepEqual([fps,frames,lip.frames.length,lip.fps],[layout.fps,layout.frames,layout.frames,layout.fps]);
assert.deepEqual(shots.map(s=>[s.shot,s.end]),cues.map(s=>[s.shot,s.end]));
assert.deepEqual(tl.portraitShots,['hook','close']);
assert.equal(lip.source_sha256,await digest(join(audio,'reference.wav')));
assert.equal(captions.length,cues.reduce((n,s)=>n+s.parts.length,0));
const props={shots,rig,mouth:lip.frames};
const sync=join(qa,'picture-synced.mp4'),master=join(out,'Free-Delivery-Silent-Master.mp4');
const review=join(out,'Free-Delivery-Angalia-Total-Reel.mp4'),cover=join(out,'Free-Delivery-Cover.png');
const code=['index.ts','Story.tsx','story.css','checkout.mjs','layout.json','example.json','../Host.tsx','../motion.mjs','../package-lock.json'];
const signature=sha(JSON.stringify({props,assets:assets.sha256,code:await Promise.all(code.map(f=>digest(join(here,f))))}));
const encoder=['-c:v','libx264','-threads','2','-preset','veryfast','-crf','17','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart'];
const tm=f=>{const cs=Math.round(f*100/fps);return `0:00:${String(Math.floor(cs/100)).padStart(2,'0')}.${String(cs%100).padStart(2,'0')}`;};
function ass(){let last=0;return `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: VO,DejaVu Sans,43,&H00E9F9FF,&H00E9F9FF,&H003B2033,&H003B2033,-1,0,0,0,100,100,0,0,3,10,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`+captions.map(c=>{
 assert(last<=c.start&&c.start<c.end&&c.end<frames);
 assert(c.sw.length<=2&&c.sw.every(s=>s.length<=42&&!/[{}\\\r\n]/.test(s)));last=c.end;
 return `Dialogue: 0,${tm(c.start)},${tm(c.end)},VO,,0,0,0,,{\\an5\\pos(509,1357)}${c.sw.join('\\N')}`;
 }).join('\n')+'\n';}
const getPicture=async()=>({signature,sync:await digest(sync),master:await digest(master)});
const temp=await mkdtemp(join(tmpdir(),'delivery-story-'));let site,browser;
try{
 if(mode!=='mux'){
  const pub=join(temp,'public'),dir=join(pub,'website-era');await mkdir(dir,{recursive:true});
  const expected=Object.fromEntries(rig.files.map(x=>[x.file,x.sha256]));
  assert.equal(Object.keys(assets.sha256).length,rig.files.length+1);
  for(const [name,hash] of Object.entries(assets.sha256)){
   assert(/^[a-zA-Z0-9.-]+\.png$/.test(name));assert(name==='altraware.png'||expected[name]===hash);
   const from=join(out,'assets',name);assert.equal(await digest(from),hash,name);await copyFile(from,join(dir,name));
  }
  site=await bundle({entryPoint:join(here,'index.ts'),publicDir:pub});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH||null,logLevel:'warn'});
  const ctx={serveUrl:site,puppeteerInstance:browser,logLevel:'warn'};
  const select=inputProps=>selectComposition({...ctx,id:'DeliveryStory',inputProps});
  const comp=await select(props);
  assert.deepEqual([comp.width,comp.height,comp.fps,comp.durationInFrames],[layout.width,layout.height,fps,frames]);
  if(mode==='all'||mode==='stills'){
   for(const [key,f] of Object.entries(layout.review))await renderStill({...ctx,composition:comp,inputProps:props,scale:.5,frame:f,output:join(qa,`still-${key}.png`)});
   const coverProps={...props,cover:true};
   await renderStill({...ctx,composition:await select(coverProps),inputProps:coverProps,frame:0,output:cover});
   await writeFile(join(qa,'still-receipt.json'),JSON.stringify({signature,cover:await digest(cover)},null,2)+'\n');
   console.log('Review stills and cover ready.');
  }
  if(mode==='all'||mode==='video'){
   const render=async(name,composition,inputProps,outputLocation,frameRange)=>{
    let step=-1;const n=frameRange?frameRange[1]-frameRange[0]+1:frames;
    await renderMedia({...ctx,composition,inputProps,frameRange,outputLocation,codec:'h264',muted:true,pixelFormat:'yuv420p',colorSpace:'bt709',
     crf:16,imageFormat:'jpeg',jpegQuality:95,x264Preset:'veryfast',concurrency:Math.min(2,availableParallelism()),
     onProgress:({renderedFrames:r})=>{const q=Math.floor(8*r/n);if(q!==step){step=q;console.log(`${name}: ${r}/${n}`);}}});
   };
   await render('Speaking picture',comp,props,sync);
   const neutral={...props,mouth:''},rest=await select(neutral);
   const a=join(temp,'portrait-start.mp4'),b=join(temp,'portrait-end.mp4');
   const first=shots[0].end,last=shots.at(-1).start;
   await render('Resting hook',rest,neutral,a,[0,first-1]);
   await render('Resting close',rest,neutral,b,[last,frames-1]);
   const filter=`[0:v]setpts=PTS-STARTPTS[a];[1:v]trim=start_frame=${first}:end_frame=${last},setpts=PTS-STARTPTS[p];[2:v]setpts=PTS-STARTPTS[b];[a][p][b]concat=n=3:v=1:a=0[v]`;
   await run(ff,['-nostdin','-v','error','-xerror','-y','-i',a,'-i',sync,'-i',b,'-filter_complex_threads','2','-filter_complex',filter,'-map','[v]','-r',String(fps),'-frames:v',String(frames),'-an',...encoder,master]);
   await writeFile(join(qa,'picture-cut.json'),JSON.stringify(await getPicture(),null,2)+'\n');
  }
 }
 if(mode!=='stills'){
  assert.deepEqual(await json(join(qa,'picture-cut.json')),await getPicture());
  await writeFile(join(temp,'captions.ass'),ass());
  await run(ff,['-nostdin','-v','error','-xerror','-y','-i',sync,'-i',join(audio,'Voice-and-SFX.wav'),'-map','0:v:0','-map','1:a:0','-vf','ass=captions.ass',
   ...encoder,'-c:a','aac','-b:a','192k','-ar','48000','-t',String(frames/fps),review],{cwd:temp});
  console.log(`${frames/fps}s Swanglish Reel with captions, VO and original foley; silent master ready.`);
 }
}finally{if(browser)await browser.close({silent:true});if(site)await rm(site,{recursive:true,force:true});await rm(temp,{recursive:true,force:true});}
