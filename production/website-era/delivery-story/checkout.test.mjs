import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkout,compareCart} from './checkout.mjs';
const example=JSON.parse(readFileSync(new URL('./example.json',import.meta.url)));

test('the two receipts reconcile with the example threshold and add-on',()=>{
 const {before,after,delta,deliverySaved}=compareCart(example);
 assert.deepEqual(before,{subtotal:24000,delivery:5000,total:29000,qualifies:false,remaining:6000});
 assert.deepEqual(after,{subtotal:30000,delivery:0,total:30000,qualifies:true,remaining:0});
 assert.equal(delta,1000);assert.equal(deliverySaved,5000);
});
test('only the merchandise subtotal counts; the threshold is inclusive',()=>{
 assert.equal(checkout(example,5999).delivery,5000);
 assert.equal(checkout(example,6000).delivery,0);
 assert.equal(checkout({...example,freeAt:29000}).remaining,5000);
});
test('the same rule can make the final total lower in another example',()=>{
 const lower=compareCart({...example,basket:28000,addOn:2000});
 assert(lower.after.qualifies);assert.equal(lower.delta,-3000);
 assert.throws(()=>checkout(example,-10));
});
