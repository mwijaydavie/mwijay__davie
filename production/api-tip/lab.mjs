// TEST FIXTURE ONLY: no connections, credentials, provider calls, models or writes.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export const SKU = 'BOX-DEMO-01';
export const STOCK = Object.freeze({sku: SKU, units: 12});
export const ENDPOINT = `/stock/${SKU}`;
const fixtureOrigin = 'https://demo.invalid'; // URL for the Request object, never fetched.
const makeRequest = (sku, method = 'GET') => new Request(`${fixtureOrigin}/stock/${encodeURIComponent(sku)}`, {method});

export function stockApi(request) {
  const path = new URL(request.url).pathname;
  if (request.method !== 'GET') return Response.json({error: 'read-only fixture'}, {status: 405, headers: {Allow:'GET'}});
  if (path !== ENDPOINT) return Response.json({error: 'unknown stock item'}, {status: 404});
  return Response.json(STOCK);
}

export async function runLab() {
  const direct = stockApi(makeRequest(SKU));
  const body = await direct.json();
  const server = new McpServer({name:'local-stock-tool',version:'1.0.0'});
  server.registerTool('read_stock', {
    description:'Read quantity of a fictional stock item',
    inputSchema:{sku:z.string().min(1).max(32)}, annotations:{readOnlyHint:true},
  }, async ({sku}) => {
    const response = stockApi(makeRequest(sku));
    return {isError: !response.ok, content:[{type:'text',text:await response.text()}]};
  });
  const client = new Client({name:'example-ai-host-client',version:'1.0.0'});
  const [serverSide,clientSide] = InMemoryTransport.createLinkedPair();
  try {
    await server.connect(serverSide);
    await client.connect(clientSide);
    const listed = (await client.listTools()).tools.map(({name})=>name);
    const result = await client.callTool({name:'read_stock',arguments:{sku:SKU}});
    const absent = await client.callTool({name:'read_stock',arguments:{sku:'NOT-IN-FIXTURE'}});
    if (result.isError || result.content[0]?.type !== 'text') throw new Error('Read did not return a stock record.');
    return {direct:{endpoint:ENDPOINT,status:direct.status,body},mcp:{listed,tool:'read_stock',body:JSON.parse(result.content[0].text)},
      missing:{direct:stockApi(makeRequest('NOT-IN-FIXTURE')).status,mcpError:!!absent.isError},writeMethod:stockApi(makeRequest(SKU,'POST')).status};
  } finally {
    await client.close();
    await server.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await runLab(),null,2));
}
