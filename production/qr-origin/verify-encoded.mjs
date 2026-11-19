// Make sure the code shown to the viewer is the same one the fixture decoded.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import jsQR from 'jsqr';

const here=dirname(fileURLToPath(import.meta.url));
const out=resolve(process.env.QR_ORIGIN_OUT||join(here,'../../out/qr-origin'));
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const [layout,t,proof]=await Promise.all([json(join(here,'layout.json')),json(join(out,'audio/timeline.json')),json(join(out,'qa/rotation-proof.json'))]);
const shot=t.shots.find(s=>s.shot==='test');assert(shot);
const samples=[0,90].map(angle=>({...proof.rows.find(r=>r.angle===angle),frame:shot.start+layout.sampleOffsets[angle]}));
const [x,y,w,h]=layout.board;
assert(samples.every(s=>s.frame>=shot.start&&s.frame<shot.end&&s.width===w&&s.height===h));
const selector=samples.map(s=>`eq(n\\,${s.frame})`).join('+');
const ff=process.env.FFMPEG_PATH||'ffmpeg';
const results=[];
for(const file of ['QR-Ilianzia-Wapi-Reel.mp4','QR-Origin-Voiceover-Master.mp4']){
 // ~360px-wide phone preview as well as the original 1080px encoded frame.
 for(const width of [w,Math.round(w/3)]){
  const size=4*width**2;
  const filter=`select=${selector},crop=${w}:${h}:${x}:${y}:exact=1,scale=${width}:${width}:flags=lanczos,format=rgba`;
  const raw=execFileSync(ff,['-nostdin','-v','error','-xerror','-i',join(out,file),'-an','-vf',filter,'-vsync','0','-c:v','rawvideo','-threads:v','1','-f','rawvideo','-'],{maxBuffer:size*samples.length+65536});
  assert.equal(raw.length,size*samples.length);
  for(const [i,s] of samples.entries()){
   const decoded=jsQR(new Uint8ClampedArray(raw.subarray(i*size,(i+1)*size)),width,width,{inversionAttempts:'dontInvert'});
   assert.equal(decoded?.data,s.decoded,`${file}: ${s.angle} degrees`);
   const xyz=['topLeftFinderPattern','topRightFinderPattern','bottomLeftFinderPattern'];
   for(const [k,key] of xyz.entries())for(const axis of ['x','y']){
    // Location checking also proves the bitmaps really changed orientation.
    const observed=decoded.location[key][axis]*w/width;
    assert(Math.abs(observed-s.finderCenters[k][axis])<7,`${file}: wrong QR orientation at frame ${s.frame}`);
   }
   results.push({file,frame:s.frame,angle:s.angle,decoded:decoded.data,sampledSymbolWidth:width,observedFinderCenters:xyz.map(k=>decoded.location[k])});
  }
 }
}
await writeFile(join(out,'qa/encoded-rotation.json'),JSON.stringify({crop:layout.board,scope:'Two frames from each encoded MP4, each decoded at native and ~360px-equivalent scale. This is a local library check, not a physical-camera or Instagram test.',results},null,2)+'\n');
console.log(`${results.length}/${results.length} encoded symbol checks: both cuts, 0° and 90°, full size and phone scale → ${samples[0].decoded}.`);
