import assert from 'node:assert/strict';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

// One-shot local test: no auth or deployment; the actual public HTTPS endpoint needs a separate check.
const here=dirname(fileURLToPath(import.meta.url));
const out=resolve(process.env.API_TIP_OUT||join(here,'../../out/api-tip'));
const landing=join(out,'audience-page');
const pdf='Mwongozo-Bure-API-na-MCP.pdf';
const files={'/':['index.html','text/html; charset=utf-8'],'/altraware.png':['altraware.png','image/png'],
 '/guide-cover.jpg':['guide-cover.jpg','image/jpeg'],[`/${pdf}`]:[pdf,'application/pdf']};
const cached=new Map(await Promise.all(Object.entries(files).map(async ([path,[file,type]])=>[path,{type,body:await readFile(join(landing,file))}])));
const server=createServer((req,res)=>{
 const f=cached.get(req.url);
 if(!f||req.method!=='GET'){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':f.type,'Content-Length':f.body.length,'X-Content-Type-Options':'nosniff'}).end(f.body);
});
server.listen(0,'0.0.0.0');
await once(server,'listening');
let browser;
try{
 const view=`http://127.0.0.1:${server.address().port}`; // Only Playwright inside the sandbox calls this.
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,acceptDownloads:true,isMobile:true,hasTouch:true});
 const page=await ctx.newPage();
 await page.goto(view,{waitUntil:'networkidle'});
 assert.equal(await page.locator('h1').count(),1);
 assert(await page.locator('figure img').evaluate(img=>img.complete&&img.naturalWidth>0));
 for(const width of [320,390,860]){
  await page.setViewportSize({width,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth===window.innerWidth),`Horizontal overflow at ${width}px`);
 }
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:join(out,'qa/download-mobile.png'),fullPage:true});
 const [d]=await Promise.all([page.waitForEvent('download'),page.getByRole('link',{name:'Pakua PDF ya bure'}).click()]);
 assert.equal(d.suggestedFilename(),pdf);
 assert.deepEqual(await readFile(await d.path()),await readFile(join(out,pdf)));
 assert.deepEqual(await ctx.cookies(),[]);
 console.log('Local Chrome mobile: 320/390/860px, images load, no login or cookies, direct PDF download matches export. No public URL tested.');
}finally{if(browser)await browser.close();server.close();}
