import {execFile} from 'node:child_process';
import {mkdtemp,rename,rm} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {promisify} from 'node:util';

const run=promisify(execFile);

// Remotion may mux through the end of its final AAC block. Encode once from the
// prepared 30-second PCM and signal the exact track end, while copying all 1,800 video frames.
export async function muxExact({video,pcm,output,ffmpeg=process.env.FFMPEG_PATH||'ffmpeg'}){
  const dir=await mkdtemp(join(dirname(resolve(output)),'.mux-'));
  const tmp=join(dir,'exact.mp4');
  try{
    await run(ffmpeg,['-nostdin','-v','error','-xerror','-y','-i',video,'-i',pcm,
      '-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000',
      '-t','30','-movflags','+faststart',tmp]);
    await rename(tmp,output);
  }finally{
    await rm(dir,{recursive:true,force:true});
  }
}
