import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {compare,eyelid,wrist} from './logic.mjs';
const fixture=JSON.parse(readFileSync(new URL('./example.json',import.meta.url),'utf8'));
const c=compare(fixture);
test('TSh 5,000 / 500 mL goes from most expensive to middle without changing',()=>{
 assert.deepEqual([c.from,c.to],[[2,2],[2,3]]);assert.deepEqual([c.samePrice,c.sameMl],[5000,500]);
});
test('per 100 mL uses the same denominator for all three bottles',()=>{
 assert.deepEqual(c.rows.map(r=>r.per100),[1200,1000,900]);
});
test('no fake dominated tier: larger volumes cost more, not the same or less',()=>{
 const fake=structuredClone(fixture);fake.tiers[2].price=5000;
 assert.throws(()=>compare(fake));
});
test('actual wave: wrist moves both directions and comes back to rest',()=>{
 assert(wrist('wave',38)>9&&wrist('wave',62)<-9);assert.equal(wrist('wave',167),0);
});
test('point moves to the cue and settle; blink closes and reopens',()=>{
 assert.equal(wrist('point',200,[258]),0);assert(wrist('point',264,[258])>6);assert.equal(wrist('point',340,[258]),0);
 assert.equal(eyelid(124,[132]),0);assert.equal(eyelid(132,[132]),1);assert.equal(eyelid(139,[132]),0);
});
