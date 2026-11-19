import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mouthFrames,mouthWeights} from './motion.mjs';
import {searchAt,validateOpening} from '../../.agents/skills/altraware-search-reels/scripts/search-opening.mjs';
import {readFileSync} from 'node:fs';
const plan=validateOpening(JSON.parse(readFileSync(new URL('../../.agents/skills/altraware-search-reels/examples/opening.plan.json',import.meta.url),'utf8')));

test('search fields resolve only after submit, before the click',()=>{
 assert.equal(searchAt(plan,0).query,'');assert.equal(searchAt(plan,plan.beats.typed).query,plan.query);
 assert.equal(searchAt(plan,plan.beats.submit).phase,'waiting');assert(!searchAt(plan,plan.beats.ready-1).canShowResult);
 assert(searchAt(plan,plan.beats.click).canShowResult);assert.equal(searchAt(plan,plan.beats.open).phase,'open');
});
test('synthetic search cannot carry a real domain',()=>assert.throws(()=>validateOpening({...plan,domain:'altra.tanzaniareach.com'})));
test('only gated VO spans move; a precise closure wins an overlap',()=>{
 const seq=mouthFrames([{start:0,end:1,value:'D'},{start:.20,end:.25,value:'A'}],12,20,i=>i!==3,2,8);
 assert.deepEqual(seq,['X','X','D','X','A','D','D','D','X','X','X','X']);
});
test('new mouth texture ramps in while a silent hold stays neutral',()=>{
 const s='XBDDXXX';assert.deepEqual(mouthWeights(s,0),{});assert.equal(mouthWeights(s,1).B,1/3);
 const w=mouthWeights(s,2);assert(Math.abs(w.B+w.D-1)<1e-9);assert.deepEqual(mouthWeights(s,6),{});
});
