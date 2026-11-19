import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {copyFile,mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {runLab} from './lab.mjs';
import {art,stickerSvg} from './art.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const out=resolve(process.env.API_TIP_OUT||join(root,'out/api-tip'));
const mode=process.argv[2]||'all';
assert(['all','stills','video','caption'].includes(mode));
const run=promisify(execFile);
const ff=process.env.FFMPEG_PATH||'ffmpeg';
const picture=join(out,'Tech-Tip-01-Voiceover-Master.mp4');
const voice=join(out,'Tech-Tip-01-MCP-au-API.mp4');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const [timing,script,proof,manifest]=await Promise.all([
  json(join(out,'audio/timeline.json')),json(join(here,'cues.json')),runLab(),json(join(out,'assets/manifest.json')),
]);
const {cues,frames}=timing;
assert.equal(frames,1800);
assert.deepEqual(cues.map(({shot,sw,en,tts})=>({shot,sw,en,tts})),script);
for(const [i,c] of cues.entries()){
 const times=[c.sceneStart,c.start,c.end,c.captionEnd,c.sceneEnd];
 assert(times.every(Number.isInteger)&&times.every((n,j)=>j===0||n>times[j-1]));
 assert.equal(c.sceneStart,i?cues[i-1].sceneEnd:0);
}
assert.equal(cues.at(-1).sceneEnd,frames);
assert.deepEqual(proof.direct.body,proof.mcp.body);
assert.deepEqual(manifest.map(a=>a.file).sort(),['dispatch.mp4','faida-context.webp','packing.mp4']);
for(const a of manifest){
 assert.equal(createHash('sha256').update(await readFile(join(out,'assets',a.file))).digest('hex'),a.sha256);
}

const pad=(n)=>String(n).padStart(2,'0');
const time=(frame)=>{const t=Math.round(frame*100/60); return `${Math.floor(t/360000)}:${pad(Math.floor(t/6000)%60)}:${pad(Math.floor(t/100)%60)}.${pad(t%100)}`;};
function makeAss(cues){
 const styles=`[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\nScaledBorderAndShadow: yes\nYCbCr Matrix: TV.709\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: SW,DejaVu Sans,39,&H00271914,&H00271914,&H00F8FAFF,&H00F8FAFF,-1,0,0,0,100,100,0,0,3,10,0,5,0,0,0,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
 const escape=s=>s.replace(/[{}\\]/g,'');
 return styles+cues.map(c=>`Dialogue: 0,${time(c.start)},${time(c.captionEnd)},SW,,0,0,0,,{\\an5\\pos(471,1333)}${c.sw.map(escape).join('\\N')}`).join('\n')+'\n';
}

let browser,site;
const tmp=await mkdtemp(join(tmpdir(),'tech-tip-01-'));
try{
 await Promise.all([mkdir(join(out,'qa'),{recursive:true}),mkdir(join(out,'stickers'),{recursive:true})]);
 await Promise.all(Object.entries(art).map(([name,a])=>writeFile(join(out,'stickers',`${name}.svg`),stickerSvg(a))));
 await writeFile(join(out,'qa','lab.json'),JSON.stringify(proof,null,2)+'\n');
 if(mode!=='caption'){
  const publicDir=join(tmp,'public');
  const assets=join(publicDir,'api-tip');
  await mkdir(assets,{recursive:true});
  await Promise.all([
    ...manifest.map(a=>copyFile(join(out,'assets',a.file),join(assets,a.file))),
    copyFile(join(root,'content/assets/altraware-mark.png'),join(assets,'altraware.png')),
    copyFile(join(out,'qa/guide-1.png'),join(assets,'guide-cover.png')),
    copyFile(join(out,'qa/guide-3.png'),join(assets,'guide-proof.png')),
  ]);
  site=await bundle({entryPoint:join(here,'index.ts'),publicDir});
  browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH||null,logLevel:'warn'});
  const ctx={serveUrl:site,puppeteerInstance:browser,logLevel:'warn'};
  const props={cues,proof};
  const composition=await selectComposition({...ctx,id:'APITip01',inputProps:props});
  assert.deepEqual([composition.width,composition.height,composition.fps,composition.durationInFrames],[1080,1920,60,1800]);
  if(mode!=='video'){
    const fs=[0,137,...cues.slice(1).map((c,i)=>c.sceneStart+[241,328,209,223][i]),1799];
    for(const f of fs){
      await renderStill({...ctx,composition,inputProps:props,scale:.5,frame:f,output:join(out,'qa',`tip-${f}.png`)});
      console.log(`Still f${f}`);
    }
    const coverProps={...props,cover:true};
    const cover=await selectComposition({...ctx,id:'APITip01',inputProps:coverProps});
    await renderStill({...ctx,composition:cover,inputProps:coverProps,frame:139,output:join(out,'Cover-Tech-Tip-01.png')});
  }
  if(mode!=='stills'){
    let mark=-1;
    await renderMedia({...ctx,composition,inputProps:props,codec:'h264',muted:true,outputLocation:picture,
      pixelFormat:'yuv420p',colorSpace:'bt709',crf:16,imageFormat:'jpeg',jpegQuality:93,x264Preset:'veryfast',concurrency:2,
      onProgress:({renderedFrames})=>{if(Math.floor(renderedFrames/180)>mark){mark=Math.floor(renderedFrames/180); console.log(`${renderedFrames}/1800 picture`);}}});
  }
 }
 if(mode!=='stills'){
  // Render picture once. Keep a genuinely clean voiceover master and add burn-in/voice to the other cut.
  await writeFile(join(tmp,'captions.ass'),makeAss(cues),'utf8');
  await run(ff,['-nostdin','-v','error','-xerror','-y','-i',picture,'-i',join(out,'audio/mix.wav'),
   '-map','0:v:0','-map','1:a:0','-vf','ass=captions.ass','-c:v','libx264','-threads','2','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',
   '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','192k','-ar','48000','-t','30','-movflags','+faststart',voice],{cwd:tmp});
  console.log(`Narrated + captioned: ${voice}`);
 }
}finally{
 if(browser) await browser.close({silent:true});
 if(site) await rm(site,{recursive:true,force:true});
 await rm(tmp,{force:true,recursive:true});
}
