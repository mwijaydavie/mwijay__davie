import {Resvg} from '@resvg/resvg-js';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DURATION, FPS, frameSvg} from './elements.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const out=resolve(process.env.QUICKOPIA_OUT || join(root,'out/quickopia/motion-proof'));
const image=await readFile(join(root,'content/assets/altraware-mark.png'));
const src=`data:image/png;base64,${image.toString('base64')}`;
const fontFiles=process.env.QUICKOPIA_FONT?[resolve(process.env.QUICKOPIA_FONT)]:[];
const options={font:{fontFiles,loadSystemFonts:fontFiles.length===0,defaultFontFamily:fontFiles.length?'Geist':'sans-serif'},fitTo:{mode:'width',value:720}};
const png=frame=>new Resvg(frameSvg(frame,src),options).render().asPng();
const count=FPS*DURATION;
assert.equal(frameSvg(173,src),frameSvg(173,src));
await mkdir(out,{recursive:true});
await writeFile(join(out,'final-frame.png'),png(count-1));
const dst=join(out,'Quickopia-Logo-SVG-Motion-Test.mp4');
const ff=spawn(process.env.FFMPEG || 'ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-vcodec','png','-i','pipe:0',
  '-frames:v',String(count),'-an','-vf','scale=720:1280:flags=lanczos,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','18','-movflags','+faststart',dst],
  {stdio:['pipe','inherit','inherit']});
const done=once(ff,'close');
ff.stdin.on('error',()=>{});
for(let i=0;i<count;i++) {
  if(ff.exitCode!==null || ff.stdin.destroyed) break;
  const buffer=png(i);
  if(!ff.stdin.write(buffer)) await Promise.race([once(ff.stdin,'drain'),done]);
}
ff.stdin.end();
const [code]=await done;
assert.equal(code,0,'FFmpeg did not finish the motion proof');
console.log(`Rendered ${count} deterministic frames at ${FPS} fps: ${dst}`);
