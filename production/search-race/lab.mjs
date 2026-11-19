import assert from 'node:assert/strict';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
import {race,successExcerpt} from './latest.mjs';
export const out=resolve(process.env.SEARCH_RACE_OUT||join(dirname(fileURLToPath(import.meta.url)),'../../out/search-race'));
export async function runLab(){
 const [before,after,oldError]=await Promise.all([race({guard:false}),race({guard:true}),race({guard:true,oldError:true})]);
 for(const case_ of [before,after,oldError])assert.deepEqual(case_.trace.map(x=>x.id),[1,2,2,1]);
 assert.deepEqual([before.final.query,before.final.rows[0],after.final.rows[0],oldError.final.rows[0]],['chai','Pilau','Chai','Chai']);
 return {scope:'Manually settled synthetic promises; no live endpoints or real menu. Frame timings are editorial, not latency measurements.',before,after,oldError,successExcerpt};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const x=await runLab();await mkdir(join(out,'qa'),{recursive:true});await writeFile(join(out,'qa/search-proof.json'),JSON.stringify(x,null,2)+'\n');console.log('Send 1 → Send 2 → Finish 2 → Finish 1. Before: Pilau | After: Chai | Old error: Chai.');
}
