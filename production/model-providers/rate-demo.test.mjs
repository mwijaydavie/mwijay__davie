import {test} from 'node:test';
import assert from 'node:assert/strict';
import {decide,demoProvider,proof} from './rate-demo.mjs';

test('mock accepts one request, gives 429 and a positive Retry-After on a burst',()=>{
 const mock=demoProvider(); assert.equal(mock(0).status,200);
 const r=mock(1000); assert.equal(r.status,429);assert.equal(r.headers.get('Retry-After'),'2');
});
test('client does not send during the wait, then mock accepts one retry',()=>{
 const p=proof();assert.deepEqual([p.first.status,p.limited.status,p.recovered.status],[200,429,200]);
 assert.deepEqual(p.policy,{action:'wait',after:2,notBefore:3000});
 assert.equal(p.calls,3);assert(p.blockedAtMs<p.recovered.t);
});
test('absent, malformed, long or zero waiting headers stop',()=>{
 for(const v of [null,'tomorrow','60','0','1.5']){
  const r=new Response(null,{status:429,headers:v===null?{}:{'Retry-After':v}});
  assert.equal(decide(r,0,0).action,'stop');
 }
});
test('no infinite retry loop',()=>{
 const r=new Response(null,{status:429,headers:{'Retry-After':'2'}});
 assert.equal(decide(r,0,1).action,'stop');
});
test('unauthorized and billing errors are not retried',()=>{
 for(const status of [401,402,403]) assert.equal(decide(new Response(null,{status,headers:{'Retry-After':'2'}}),0,0).action,'stop');
});
