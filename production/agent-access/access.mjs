// Deliberately local: two in-memory endpoints and fictional inventory. No credentials,
// remote URLs, actual AI, payments, filesystem tools, or Faida integration.
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';

export async function tryStockAccess(){
  const fixture={sku:'BOX-DEMO-01',stock:12,priceTsh:5000};
  const initialPrice=fixture.priceTsh;
  const server=new McpServer({name:'stock-demo-local',version:'1.0.0'});
  server.registerTool('read_stock', {description:'Read stock for the local dummy item',inputSchema:{},
    annotations:{readOnlyHint:true}},async()=>({content:[{type:'text',text:JSON.stringify({sku:fixture.sku,stock:fixture.stock})}]}));
  // There is intentionally no change_price handler and no administrative write path in this demo.
  const client=new Client({name:'test-client',version:'1.0.0'});
  const [toServer,toClient]=InMemoryTransport.createLinkedPair();
  try{
    await server.connect(toServer);
    await client.connect(toClient);
    const offered=(await client.listTools()).tools.map(t=>t.name);
    const read=await client.callTool({name:'read_stock',arguments:{}});
    if(read.isError||read.content?.[0]?.type!=='text') throw new Error('Read fixture did not resolve');
    let denial;
    try{
      const result=await client.callTool({name:'change_price',arguments:{sku:fixture.sku,priceTsh:4000}});
      if(result.isError) denial=result.content?.[0]?.text;
    }catch(error){
      if(error instanceof Error && /change_price/.test(error.message) && /not found|unknown|not supported/i.test(error.message)){
        denial=error.message;
      }else throw error;
    }
    return {
      env:'in-memory MCP test · fictional data',
      offered,read:{tool:'read_stock',ok:true,...JSON.parse(read.content[0].text)},
      rejected:{tool:'change_price',attemptedPriceTsh:4000,denied:typeof denial==='string'&&/change_price/.test(denial)&&/not found|unknown|not supported/i.test(denial),message:denial??null},
      book:{before:initialPrice,after:fixture.priceTsh,currency:'TZS'},
    };
  }finally{
    await client.close();
    await server.close();
  }
}
