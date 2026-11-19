import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

const here=dirname(fileURLToPath(import.meta.url));
const out=resolve(process.env.MODEL_GUIDE_OUT||join(here,'../../out/model-providers'));
const folder=join(out,'audience-page');const names=['Swanglish','English'].map(l=>`Free-AI-API-Guide-${l}.pdf`);
const files=[['/','index.html','text/html; charset=utf-8'],['/guide-preview.jpg','guide-preview.jpg','image/jpeg'],
 ['/altraware.png','altraware.png','image/png'],...names.map(n=>[`/${n}`,n,'application/pdf'])];
const map=new Map(await Promise.all(files.map(async ([url,n,type])=>[url,{type,body:await readFile(join(folder,n))}])));
const server=createServer((req,res)=>{
 const f=map.get(req.url);
 if(!f||req.method!=='GET'){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':f.type,'Content-Length':f.body.length,'X-Content-Type-Options':'nosniff'}).end(f.body);
});
server.listen(0,'0.0.0.0');await once(server,'listening');let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const ctx=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true,isMobile:true,hasTouch:true});
 const p=await ctx.newPage();
 await p.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'networkidle'}); // Local automated browser only.
 assert(await p.locator('figure img').evaluate(i=>i.complete&&i.naturalWidth>0));
 for(const w of [320,390,890]){
  await p.setViewportSize({width:w,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth===window.innerWidth));
 }
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:join(out,'qa/audience-mobile.png'),fullPage:true});
 for(const [i,name] of names.entries()){
  const [d]=await Promise.all([p.waitForEvent('download'),p.getByRole('link',{name:i?'Download English':'Pakua Swanglish'}).click()]);
  assert.equal(d.suggestedFilename(),name);assert.deepEqual(await readFile(await d.path()),await readFile(join(out,name)));
 }
 assert.deepEqual(await ctx.cookies(),[]);
 console.log('Mobile landing: 320/390/890px, zero overflow; both downloaded PDFs byte-match. Local HTTP only; no published URL tested.');
}finally{if(browser)await browser.close();server.close();}
