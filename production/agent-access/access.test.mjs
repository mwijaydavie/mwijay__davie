import assert from 'node:assert/strict';
import {test} from 'node:test';
import {tryStockAccess} from './access.mjs';

const proof=await tryStockAccess();
test('local MCP exposes one read tool, not a price-change tool',()=>assert.deepEqual(proof.offered,['read_stock']));
test('read_stock returns the dummy inventory record',()=>assert.deepEqual(proof.read,{tool:'read_stock',ok:true,sku:'BOX-DEMO-01',stock:12}));
test('unexposed change_price is rejected and fixture price stays unchanged',()=>{
  assert.equal(proof.rejected.denied,true,proof.rejected.message);
  assert.notEqual(proof.rejected.attemptedPriceTsh,proof.book.before);
  assert.equal(proof.book.before,proof.book.after);
});
