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
import {validateOpening} from '../../.agents/skills/altraware-search-reels/scripts/search-opening.mjs';

const here=dirname(fileURLToPath(import.meta.url)),repo=resolve(here,'../..');
const run=promisify(execFile),json=async p=>JSON.parse(await readFile(p,'utf8'));
const locale=process.env.WEBSITE_ERA_LOCALE||'sw',edition=(await json(join(here,'editions.json')))[locale];
assert(edition,`Unknown edition: ${locale}`);
const out=resolve(process.env.WEBSITE_ERA_OUT||join(repo,'out',edition.slug)),qa=join(out,'qa'),audio=join(out,'audio');
const mode=process.argv[2]||'all';assert(['all','stills','video','mux'].includes(mode));
const ff=process.env.FFMPEG_PATH||'ffmpeg';assert(!ff.includes('/')||isAbsolute(ff));
const [tl,rig,lip,assets,baseLayout,opening]=await Promise.all([json(join(audio,'timeline.json')),json(join(qa,'host-rig.json')),json(join(audio,'mouth-timeline.json')),
 json(join(qa,'capture-assets.json')),json(join(here,'layout.json')),json(join(repo,'.agents/skills/altraware-search-reels/examples',edition.plan))]);
const layout=locale==='en'?{...baseLayout,...baseLayout.english}:baseLayout;
validateOpening(opening);
assert.equal(tl.locale||'sw',locale,'Dry VO timeline must match the edition');
const sha=b=>createHash('sha256').update(b).digest('hex');
assert.equal(lip.source_sha256,sha(await readFile(join(audio,'reference.wav'))));
const expected=(await json(join(here,edition.cues))).reduce((n,c)=>n+c.parts.length,0);
assert.equal(tl.captions.length,expected);assert.deepEqual([lip.fps,lip.frames.length],[layout.fps,layout.frames]);
const {shots,captions,fps,frames}=tl;
assert.deepEqual([fps,frames],[60,2700]);assert.deepEqual(shots.map(q=>q.shot),['search','link','own','work','offer','close']);
assert.equal(shots[0].end,opening.beats.end);assert.equal(shots.at(-1).end,frames);
const labelsOnly=process.env.WEBSITE_ERA_LABELS_ONLY==='1';
const props={shots,rig,mouth:lip.frames,cover:false,labelsOnly,locale};
const sync=join(qa,'picture-synced.mp4'),master=join(out,edition.master),preview=join(out,edition.preview),cover=join(out,edition.cover);
const signatureFiles=['Story.tsx','story-copy.ts','Host.tsx','index.ts','story.css','motion.mjs','layout.json','editions.json'].map(f=>join(here,f));
signatureFiles.push(join(repo,'.agents/skills/altraware-search-reels/scripts/search-opening.mjs'));
const motionSig=sha(JSON.stringify({props,assets,opening,code:await Promise.all(signatureFiles.map(async f=>sha(await readFile(f))))}));
const temp=await mkdtemp(join(tmpdir(),'website-era-'));let site,browser;
const assTime=f=>{const t=Math.round(f*100/fps);return `0:00:${String(Math.floor(t/100)).padStart(2,'0')}.${String(t%100).padStart(2,'0')}`;};
function ass(){let end=0;
 return `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: VO,DejaVu Sans,40,&H003A1A25,&H003A1A25,&H00EEFAFF,&H00EEFAFF,-1,0,0,0,100,100,0,0,3,10,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`+captions.map(c=>{
 const lines=c[locale];
 assert(end<=c.start&&c.start<c.end&&c.end<frames&&lines.length<=2&&lines.every(s=>s.length<=43&&!/[{}\\\r\n]/.test(s)));end=c.end;
 return `Dialogue: 0,${assTime(c.start)},${assTime(c.end)},VO,,0,0,0,,{\\an5\\pos(459,1373)}${lines.join('\\N')}`;
 }).join('\n')+'\n';}
const encoder=['-c:v','libx264','-threads','2','-preset','veryfast','-crf','17','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart'];
try{
 if(mode!=='mux'){
  const pub=join(temp,'public'),folder=join(pub,'website-era');await mkdir(folder,{recursive:true});
  for(const [file,d] of [...Object.entries(assets),...rig.files.map(a=>[a.file,a])]){
   assert.equal(sha(await readFile(join(out,'assets',file))),d.sha256,file);await copyFile(join(out,'assets',file),join(folder,file));
  }
  site=await bundle({entryPoint:join(here,'index.ts'),publicDir:pub});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH||null,logLevel:'warn'});
  const ctx={serveUrl:site,puppeteerInstance:browser,logLevel:'warn'};
  // Remotion resolves render props on select, not just in renderStill/renderMedia inputProps.
  const select=inputProps=>selectComposition({...ctx,id:'WebsiteEra',inputProps});
  const comp=await select(props);
  assert.deepEqual([comp.width,comp.height,comp.fps,comp.durationInFrames],[1080,1920,60,2700]);
  if(mode==='all'||mode==='stills'){
   const suffix=labelsOnly?'-text':'';
   for(const [key,f] of Object.entries(layout.review))await renderStill({...ctx,composition:comp,inputProps:props,scale:.5,frame:f,output:join(qa,`still-${key}${suffix}.png`)});
   const coverProps={...props,cover:true},neutral={...props,mouth:''};
   await renderStill({...ctx,composition:await select(coverProps),inputProps:coverProps,frame:0,output:cover});
   const word=props.mouth.slice(shots[1].start,shots[1].end),k=word.search(/(C{3}|D{3}|E{3}|F{3})/);
   assert(k>=7,'Verify a stable open viseme inside the first portrait shot');
   const vowel=shots[1].start+k+1;
   const files=[];
   for (const [file,inputProps,composition] of [['viseme-open',props,comp],['viseme-rest',neutral,await select(neutral)]]){
    const output=join(qa,`${file}.png`);files.push(output);
    await renderStill({...ctx,composition,inputProps,scale:.5,frame:vowel,output});
   }
   assert.notEqual(sha(await readFile(files[0])),sha(await readFile(files[1])),'Mouth override did not reach the composition');
   await writeFile(join(qa,'still-receipt.json'),JSON.stringify({signature:motionSig,vowel,cover:sha(await readFile(cover))},null,2)+'\n');
   console.log(`Stills, viseme comparison at ${vowel} and cover.`);
  }
  if(mode==='all'||mode==='video'){
   const render=async(name,composition,inputProps,outputLocation,frameRange)=>{
    let step=-1;const n=frameRange?frameRange[1]-frameRange[0]+1:frames;
    await renderMedia({...ctx,composition,inputProps,frameRange,outputLocation,codec:'h264',muted:true,pixelFormat:'yuv420p',colorSpace:'bt709',
     crf:16,imageFormat:'jpeg',jpegQuality:94,x264Preset:'veryfast',concurrency:Math.min(2,availableParallelism()),
     onProgress:({renderedFrames:r})=>{const q=Math.floor(r/(n/8));if(q!==step){step=q;console.log(`${name}: ${r}/${n}`);}}});
   };
   await render('Synced picture',comp,props,sync);
   // Only the three portrait scenes differ for owner VO. Reuse the other picture frames.
   const neutral={...props,mouth:''},neutralComp=await select(neutral);
   const chunks=[{start:shots[1].start,end:shots[2].end,file:join(temp,'neutral-explain.mp4')},{start:shots[5].start,end:frames,file:join(temp,'neutral-close.mp4')}];
   for(const c of chunks)await render('Relaxed mouth master',neutralComp,neutral,c.file,[c.start,c.end-1]);
   const filter=`[0:v]trim=start_frame=0:end_frame=${chunks[0].start},setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[0:v]trim=start_frame=${chunks[0].end}:end_frame=${chunks[1].start},setpts=PTS-STARTPTS[c];[2:v]setpts=PTS-STARTPTS[d];[a][b][c][d]concat=n=4:v=1:a=0[v]`;
   await run(ff,['-nostdin','-v','error','-xerror','-y','-i',sync,'-i',chunks[0].file,'-i',chunks[1].file,'-filter_threads','2','-filter_complex_threads','2','-filter_complex',filter,'-map','[v]','-r',String(fps),'-frames:v',String(frames),'-an',...encoder,master]);
   await writeFile(join(qa,'picture-cut.json'),JSON.stringify({signature:motionSig,sync:sha(await readFile(sync)),master:sha(await readFile(master)),labelsOnly},null,2)+'\n');
  }
 }
 if(mode!=='stills'){
  assert.deepEqual(await json(join(qa,'picture-cut.json')),{signature:motionSig,sync:sha(await readFile(sync)),master:sha(await readFile(master)),labelsOnly});
  await writeFile(join(temp,'captions.ass'),ass());
  await run(ff,['-nostdin','-v','error','-xerror','-y','-i',sync,'-i',join(audio,'Voice-and-SFX.wav'),'-map','0:v:0','-map','1:a:0','-vf','ass=captions.ass',
   ...encoder,'-c:a','aac','-b:a','192k','-ar','48000','-t','45',preview],{cwd:temp});
  console.log(`${locale}: 45s review Reel with dubbed VO and original SFX; neutral-mouth silent master.`);
 }
}finally{if(browser)await browser.close({silent:true});if(site)await rm(site,{recursive:true,force:true});await rm(temp,{recursive:true,force:true});}
