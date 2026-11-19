import assert from 'node:assert/strict';
import {test} from 'node:test';
import {cases,simulate,paid} from './lab.mjs';

const expect=(scenario,status,payments,receipts)=>{
  const actual=simulate(cases[scenario]);
  assert.equal(actual.status,status);
  assert.equal(actual.payments,payments);
  assert.equal(actual.receipts,receipts);
  return actual;
};
test('accepted request waits without a receipt',()=>expect('accepted','WAIT',0,0));
test('timeout asks for lookup and does not record payment',()=>assert.equal(expect('timeout','WAIT',0,0).timeoutChecks,1));
test('matching confirmation records exactly one receipt',()=>expect('paid','PAID',1,1));
test('same payment confirmed twice has the same single receipt',()=>{
  const a=expect('repeat','PAID',1,1);
  assert.equal(a.confirmations,2);
  assert.deepEqual(a.receiptRefs,simulate([paid]).receiptRefs);
});
test('mismatched amount is held for review without a receipt',()=>expect('mismatch','REVIEW',0,0));
