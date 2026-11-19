import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSearch,queue,race} from './latest.mjs';

test('control: unguarded late result overwrites Chai while query is chai',async()=>{
 const p=await race({guard:false});assert.deepEqual(p.trace[2].rows,['Chai']);assert.equal(p.final.query,'chai');assert.deepEqual(p.final.rows,['Pilau']);
});
test('latest wins: same completion order, Chai survives',async()=>{
 const p=await race({guard:true});assert.equal(p.trace.at(-1).event,'ignored-result');assert.deepEqual(p.final.rows,['Chai']);
});
test('old error does not wipe a good new result',async()=>{
 const p=await race({guard:true,oldError:true});assert.equal(p.trace.at(-1).event,'ignored-error');assert.equal(p.final.status,'ready');assert.deepEqual(p.final.rows,['Chai']);
});
test('old error cannot prematurely end the newest loading state',async()=>{
 const q=queue(),ui=createSearch(q.lookup);const a=ui.run('pilau'),b=ui.run('chai');q.fail(1);await a;assert.equal(ui.state().status,'loading');q.send(2,'Chai');await b;assert.deepEqual(ui.state().rows,['Chai']);
});
test('latest error remains visible even if the old request succeeds',async()=>{
 const p=await race({guard:true,newError:true});assert.equal(p.final.status,'error');assert(p.final.notice);assert.deepEqual(p.final.rows,[]);
});
test('clear invalidates an in-flight result',async()=>{
 const q=queue(),ui=createSearch(q.lookup);const a=ui.run('pilau');ui.clear();q.send(1,'Pilau');await a;assert.equal(ui.state().status,'idle');assert.deepEqual(ui.state().rows,[]);
});
test('the same query typed twice still has two independent IDs',async()=>{
 const q=queue(),ui=createSearch(q.lookup);const a=ui.run('chai'),b=ui.run('chai');q.send(2,'Chai 2');await b;q.send(1,'Chai 1');await a;assert.deepEqual(ui.state().rows,['Chai 2']);
});
