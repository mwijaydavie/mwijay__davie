import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {promisify} from 'node:util';
import {Rhubarb} from 'rhubarb-lip-sync-wasm';
import {mouthFrames} from './motion.mjs';

const audio=resolve(process.argv[2]||'out/website-era/audio');
const input=join(audio,'reference.wav');const tl=JSON.parse(await readFile(join(audio,'timeline.json'),'utf8'));
const ff=process.env.FFMPEG_PATH||'ffmpeg';const rate=16000;
const raw=(await promisify(execFile)(ff,['-nostdin','-v','error','-i',input,'-ac','1','-ar',String(rate),'-f','s16le','-'],{encoding:'buffer',maxBuffer:6e6})).stdout;
assert.equal(raw.length,tl.frames/tl.fps*rate*2);
const at=f=>Math.round(f/tl.fps*rate)*2;
const frames=Array(tl.frames).fill('X');const counts=[];const rawCues={};
const portraits=tl.portraitShots||['link','own','close'];
assert(portraits.length&&new Set(portraits).size===portraits.length&&portraits.every(id=>tl.shots.some(s=>s.shot===id)));
for(const s of tl.shots){
 if(!portraits.includes(s.shot))continue;
 const wav=raw.subarray(at(s.start),at(s.end));
 // This port recognizes phones without an English transcript. Approximate visemes; not SW ASR.
 const {mouthCues:cues}=await Rhubarb.getLipSync(wav);assert(cues?.length>15);
 const e=(lo,hi)=>{
  let p=0,n=0;for(let i=Math.max(0,lo);i<Math.min(wav.length/2,hi);i++){const x=wav.readInt16LE(i*2);p+=x*x;n++;}
  return Math.sqrt(p/Math.max(n,1));
 };
 const series=mouthFrames(cues,s.end-s.start,tl.fps,i=>e(Math.floor((i-1)/tl.fps*rate),Math.floor((i+2)/tl.fps*rate))>=138,
                          s.voiceStart-s.start,s.voiceEnd-s.start);
 for(const [i,k] of series.entries())frames[s.start+i]=k;
 const distinct=[...new Set(series)].sort();assert(distinct.length>=5);
 counts.push({shot:s.shot,distinct,openFrames:series.filter(k=>!['X','A'].includes(k)).length,closedFrames:series.filter(k=>['X','A'].includes(k)).length,
             changes:series.filter((k,i)=>i&&series[i-1]!==k).length});
 rawCues[s.shot]=cues;
 console.log(`Visemes ${s.shot}: ${cues.length} raw cues → ${series.length} frames; ${distinct.join('')}`);
}
const proof={source:'rhubarb-lip-sync-wasm 0.1.8, phonetic estimate on final dry VO; audible-segment gate; not phoneme-accurate SW lip tracking',fps:tl.fps,frames:frames.join(''),
 source_sha256:createHash('sha256').update(await readFile(input)).digest('hex'),counts,rawCues};
await writeFile(join(audio,'mouth-timeline.json'),JSON.stringify(proof,null,2)+'\n');
