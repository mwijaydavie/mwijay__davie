import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runLab, STOCK, ENDPOINT} from './lab.mjs';

const proof = await runLab();
test('known route returns 12 fictional stock units', () => assert.deepEqual(proof.direct,{endpoint:ENDPOINT,status:200,body:STOCK}));
test('the MCP client discovers exactly one read tool', () => assert.deepEqual(proof.mcp.listed,['read_stock']));
test('the MCP tool delegates to the same handler and returns the same record', () => assert.deepEqual(proof.mcp.body,proof.direct.body));
test('a missing SKU is an error, never silently shown as zero', () => assert.deepEqual(proof.missing,{direct:404,mcpError:true}));
test('a non-read method cannot change the fixture', () => assert.equal(proof.writeMethod,405));
