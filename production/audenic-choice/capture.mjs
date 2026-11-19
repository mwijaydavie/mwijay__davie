import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

const here=dirname(fileURLToPath(import.meta.url));
const out=resolve(process.env.AUDENIC_OUT||join(here,'../../out/audenic-choice'));
assert(process.argv[2],'Pass the pinned Audenic dist directory.');
const dist=resolve(process.argv[2]);
const ref='e4b211085f78181421fb9f4562395a8fb2568d0b';
const product='/shop/audenic-classic-red';
const docs={'/shop':await readFile(join(dist,'index.html'))};docs[product]=docs['/shop'];
const files=new Map(await Promise.all((await readdir(join(dist,'assets'))).filter(n=>/^[\w-]+\.(js|css)$/.test(n)).map(async n=>[`/assets/${n}`,{body:await readFile(join(dist,'assets',n)),type:n.endsWith('.js')?'text/javascript':'text/css'}])));
for(const [route,body] of Object.entries(docs))files.set(route,{body,type:'text/html; charset=utf-8'});
const server=createServer((r,w)=>{
 const x=files.get(new URL(r.url,'http://capture.test').pathname);
 if(!x||!['GET','HEAD'].includes(r.method)){w.writeHead(404).end();return;}
 w.writeHead(200,{'Content-Type':x.type,'Content-Length':x.body.length,'X-Content-Type-Options':'nosniff'});
 w.end(r.method==='HEAD'?undefined:x.body);
});
const art=join(out,'assets');const qa=join(out,'qa');await mkdir(art,{recursive:true});await mkdir(qa,{recursive:true});
server.listen(0,'0.0.0.0');await once(server,'listening');
const origin=`http://127.0.0.1:${server.address().port}`; // Local capture only.
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const cx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});cx.setDefaultTimeout(8000);
 const blocked=new Set();await cx.route('**/*',r=>{
  const u=new URL(r.request().url());if(u.origin!==origin){blocked.add(u.origin);return r.abort();}return r.continue();
 });
 const p=await cx.newPage();const errors=[];p.on('pageerror',e=>errors.push(String(e)));
 const res=await p.goto(`${origin}/shop`,{waitUntil:'networkidle'});assert.equal(res.status(),200);
 await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
 await p.evaluate(()=>document.fonts.ready.then(()=>true));
 async function align(h,y){await h.evaluate((el,y)=>window.scrollTo({top:window.scrollY+el.getBoundingClientRect().top-y,behavior:'instant'}),y);}
 async function capture(file,b){assert(b.x>=0&&b.y>=72&&b.x+b.width<=390&&b.y+b.height<=844);await p.screenshot({path:join(art,file),clip:b,animations:'disabled'});return [file,b];}
 const cat=p.getByRole('heading',{level:1,name:'The full catalogue.',exact:true});await cat.waitFor();await p.waitForFunction(() => [...document.querySelectorAll('h1')].some(el => el.textContent?.includes('The full catalogue.') && parseFloat(getComputedStyle(el).opacity) >= .99));
 // Capture only the heading, not the adjacent sample catalogue count/marketing.
 const catClip=await cat.boundingBox();const catLabel=await cat.locator('..').getByText('[ Shop / All ]',{exact:true}).boundingBox();assert(catClip&&catLabel);
 const catY=Math.floor(catLabel.y)-8;
 const catalogue=await capture('catalogue.png',{x:0,y:catY,width:390,height:Math.ceil(catClip.y+catClip.height-catY)+9});
 const link=p.locator(`a[href="${product}"]`).filter({has:p.getByRole('heading',{name:'Audenic Classic',exact:true})});
 const card=link.getByRole('heading',{name:'Audenic Classic',exact:true});
 await card.waitFor();await align(card,461);
 const cb=await card.boundingBox();assert(cb);
 // Crop to the title's column, above price/reviews/tagline text.
 const cardTitle=await capture('select.png',{x:Math.floor(cb.x),y:Math.floor(cb.y)-19,width:Math.floor(cb.width),height:Math.ceil(cb.height)+19});
 await card.tap();await p.waitForURL(`${origin}${product}`);
 const h1=p.getByRole('heading',{level:1,name:'Audenic Classic',exact:true});await h1.waitFor();
 await align(h1,199);
 const h1box=await h1.boundingBox();assert(h1box);
 const nameBox={x:0,y:Math.max(0,Math.floor(h1box.y)-39),width:390,height:Math.ceil(h1box.height)+47};
 assert(nameBox.y+nameBox.height<=844&&nameBox.y>=72);
 await p.screenshot({path:join(art,'name.png'),clip:nameBox,animations:'disabled'});
 const scrollBefore=await p.evaluate(()=>window.scrollY);
 const h2=p.getByRole('heading',{level:2,name:'Technical specifications',exact:true});await h2.waitFor();await align(h2,151);
 const scrollAfter=await p.evaluate(()=>window.scrollY);assert(scrollAfter>scrollBefore+260);
 const specBlock=h2.locator('..');
 const rows=await specBlock.locator('dl > div').evaluateAll(els=>els.map(el=>({field:el.querySelector('dt').innerText.trim(),value:el.querySelector('dd').innerText.trim()})));
 assert.deepEqual(rows.map(r=>r.field.replace(/^\d+\s+·\s+/, '').toLowerCase()),['driver','impedance','frequency','battery','weight']);
 assert.deepEqual(rows.slice(-2).map(r=>r.value),['60h playback','248g']);
 const hs=await h2.boundingBox();const last=await specBlock.locator('dl > div').last().boundingBox();assert(hs&&last);
 const y=Math.floor(hs.y)-14;
 const clip={x:0,y,width:390,height:Math.ceil(last.y+last.height-y)+18};assert(clip.y>=72&&clip.y+clip.height<820);
 const focuses=[];
 for(const i of [3,4]){
  const b=await specBlock.locator('dl > div').nth(i).boundingBox();assert(b);
  focuses.push({x:b.x/clip.width,y:(b.y-clip.y)/clip.height,w:b.width/clip.width,h:b.height/clip.height});
 }
 await p.screenshot({path:join(art,'specs.png'),clip,animations:'disabled'});
 assert(await p.evaluate(()=>document.documentElement.scrollWidth===window.innerWidth));
 assert.deepEqual(await cx.cookies(),[]);assert.deepEqual(errors,[]);
 const assets=await Promise.all([catalogue,cardTitle,['name.png',nameBox],['specs.png',clip]].map(async ([file,b])=>({file,width:b.width*2,height:b.height*2,sha256:createHash('sha256').update(await readFile(join(art,file))).digest('hex')})));
 const proof={ref,source:`https://github.com/mwijay12/audenic/tree/${ref}`,audience:`https://audenic.vercel.app${product}`,viewport:[390,844],dpr:2,
  capture:'Guest session on pinned Vite production build, no live credentials or auth/order action. Only catalogue, title and specs excerpts. Fonts may fall back offline.',
  releaseCheck:'Public shop/product pages checked by read; not a live mobile interaction test.',action:'/shop → Audenic Classic → scroll down to Technical specifications',scrollBefore,scrollAfter,rows,focuses,blockedOrigins:[...blocked].sort(),assets};
 await writeFile(join(qa,'capture-proof.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2));
}finally{if(browser)await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
