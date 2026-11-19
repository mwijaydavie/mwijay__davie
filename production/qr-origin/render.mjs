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

const here=dirname(fileURLToPath(import.meta.url));const root=resolve(here,'../..');
const out=resolve(process.env.QR_ORIGIN_OUT||join(root,'out/qr-origin'));
const mode=process.argv[2]??'all';assert(['all','stills','cover','video','caption'].includes(mode));
const ff=process.env.FFMPEG_PATH||'ffmpeg';assert(!ff.includes('/')||isAbsolute(ff));
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const [tl,p,layout,credits]=await Promise.all([json(join(out,'audio/timeline.json')),json(join(out,'qa/rotation-proof.json')),json(join(here,'layout.json')),json(join(out,'qa/art-credits.json'))]);
const {shots,captions,fps,frames}=tl;assert(fps===layout.fps&&frames===layout.frames&&shots.length===6&&captions.length===14);
assert.equal(shots[0].start,0);assert.equal(shots.at(-1).end,frames);
for(const [i,s] of shots.entries()) assert((i===0||s.start===shots[i-1].end)&&s.start<s.voiceStart&&s.voiceStart<s.voiceEnd&&s.voiceEnd<s.end);
assert.deepEqual(p.rows.map(r=>r.angle),[0,90,180,270]);assert(p.rows.every(r=>r.decoded==='HABARI DAR'&&r.width===layout.board[2]&&r.height===layout.board[3]));
const props={shots,proof:p.rows.map(({angle,file,decoded,width})=>({angle,file,decoded,width})),cover:false};
const files=[...p.rows,...credits];assert.deepEqual(files.map(a=>a.file),['qr-0.png','qr-90.png','qr-180.png','qr-270.png','factory.jpg','cafe.jpg']);
const keyframes=[188,345,411,247,layout.sampleOffsets[90],326];
const pic=join(out,'QR-Origin-Voiceover-Master.mp4');const preview=join(out,'QR-Ilianzia-Wapi-Reel.mp4');
const sceneCut=shots.map(s=>[s.shot,s.start,s.end]);
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
Style: SW,DejaVu Sans,39,&H00452418,&H00452418,&H00EBF6FF,&H00EBF6FF,-1,0,0,0,100,100,0,0,3,10,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
 let prev=-1;
 return head+captions.map(c=>{
  assert(prev<c.start&&c.start<c.end&&c.end<=frames&&c.sw.length<=2&&c.sw.every(s=>s.length<=43&&!/[{}\\\r\n]/.test(s)));prev=c.end;
  return `Dialogue: 0,${tc(c.start)},${tc(c.end)},SW,,0,0,0,,{\\an5\\pos(474,1355)}${c.sw.join('\\N')}`;
 }).join('\n')+'\n';
}
const temp=await mkdtemp(join(tmpdir(),'qr-origin-'));let site,browser;
try{
 if(mode!=='caption'){
  const pub=join(temp,'public');const assets=join(pub,'qr-origin');await mkdir(assets,{recursive:true});
  for(const a of files){
   const src=join(out,'assets',a.file);assert.equal(createHash('sha256').update(await readFile(src)).digest('hex'),a.sha256);await copyFile(src,join(assets,a.file));
  }
  await copyFile(join(root,'content/assets/altraware-mark.png'),join(assets,'altraware.png'));
  site=await bundle({entryPoint:join(here,'index.ts'),publicDir:pub});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH||null,logLevel:'warn'});
  const ctx={serveUrl:site,puppeteerInstance:browser,logLevel:'warn'};
  const composition=await selectComposition({...ctx,id:'QROrigin',inputProps:props});
  assert.deepEqual([composition.width,composition.height,composition.fps,composition.durationInFrames],[layout.width,layout.height,layout.fps,layout.frames]);
  if(mode==='all'||mode==='stills'){
   if(mode==='stills')await renderStill({...ctx,composition,inputProps:props,scale:.5,frame:shots[4].start+layout.sampleOffsets[0],output:join(out,'qa','test-start.png')});
   for(const [i,s] of shots.entries())await renderStill({...ctx,composition,inputProps:props,scale:.5,frame:s.start+keyframes[i],output:join(out,'qa',`${s.shot}.png`)});
  }
  if(mode!=='video'){
   const cover={...props,cover:true};
   const coverComp=await selectComposition({...ctx,id:'QROrigin',inputProps:cover});
   await renderStill({...ctx,composition:coverComp,inputProps:cover,frame:196,output:join(out,'Cover-QR-Ilianzia-Wapi.png')});
   console.log('1080×1920 cover.');
  }
  if(mode==='all'||mode==='video'){
   let m=-1;
   await renderMedia({...ctx,composition,inputProps:props,codec:'h264',muted:true,outputLocation:pic,pixelFormat:'yuv420p',colorSpace:'bt709',
        crf:16,imageFormat:'jpeg',jpegQuality:94,x264Preset:'veryfast',concurrency:Math.min(2,availableParallelism()),
        onProgress:({renderedFrames})=>{const n=Math.floor(renderedFrames/(frames/10));if(n!==m){m=n;console.log(`${renderedFrames}/${frames} picture`);}}});
   await writeFile(join(out,'qa/picture-cut.json'),JSON.stringify(sceneCut)+'\n');
  }
 }
 if(mode!=='stills'&&mode!=='cover'){
  assert.deepEqual(await json(join(out,'qa/picture-cut.json')),sceneCut);await writeFile(join(temp,'captions.ass'),ass());
  await promisify(execFile)(ff,['-nostdin','-v','error','-xerror','-y','-i',pic,'-i',join(out,'audio/reference.wav'),'-map','0:v:0','-map','1:a:0',
   '-vf','ass=captions.ass','-c:v','libx264','-threads','2','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-colorspace','bt709',
   '-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','192k','-ar','48000','-t',String(frames/fps),'-movflags','+faststart',preview],{cwd:temp});
  console.log('Muxed scratch VO + Swanglish captions, 36 seconds.');
 }
}finally{if(browser)await browser.close({silent:true});if(site)await rm(site,{force:true,recursive:true});await rm(temp,{force:true,recursive:true});}
