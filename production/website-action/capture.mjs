import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

const here=dirname(fileURLToPath(import.meta.url));
const out=resolve(process.env.WEB_ACTION_OUT||join(here,'../../out/website-action'));
assert(process.argv[2], 'Pass the built, pinned Bongo Foodie web directory.');
const web=resolve(process.argv[2]);
const ref='f469acbb6dc3fb2274e87d8c1a22379fcda2ea36';
for(const key of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','NEXT_PUBLIC_SUPABASE_ANON_KEY']){
 assert(!process.env[key],`Unset ${key}. Showcase data only.`);
}
process.env.NEXT_TELEMETRY_DISABLED='1';
const require=createRequire(join(web,'package.json'));
const app=require('next')({dev:false,dir:web,hostname:'0.0.0.0'});
await app.prepare();
const next=app.getRequestHandler();
const server=createServer((req,res)=>{
 const u=new URL(req.url,'http://capture.test');
 const path=u.pathname;
 const allowed=['/','/search','/favicon.ico'].includes(path)||path.startsWith('/_next/static/')||path.startsWith('/assets/')||
  (path==='/_next/image'&&u.searchParams.get('url')?.startsWith('/assets/'));
 if(!allowed||!['GET','HEAD'].includes(req.method)){res.writeHead(404).end();return;}
 next(req,res).catch(()=>{if(!res.headersSent)res.writeHead(500);res.end();});
});
const dir=join(out,'assets');const qa=join(out,'qa');await mkdir(dir,{recursive:true});await mkdir(qa,{recursive:true});
server.listen(0,'0.0.0.0');await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`; // This browser runs inside the sandbox, not the user preview.
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const device={viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'};
 const attempted=new Set();
 async function context(javaScriptEnabled){
  const ctx=await browser.newContext({...device,javaScriptEnabled});ctx.setDefaultTimeout(8000);
  await ctx.route('**/*',r=>{
   const u=new URL(r.request().url());if(u.origin!==base){attempted.add(u.origin);return r.abort();}return r.continue();
  });return ctx;
 }
 // The authored server HTML includes the tap target. Skip the unrelated 3D
 // scene's external environment asset by keeping scripts off on the home shot.
 const home=await context(false);let p=await home.newPage();
 const resp=await p.goto(base,{waitUntil:'networkidle'});assert.equal(resp.status(),200);
 await p.evaluate(()=>document.fonts.ready.then(()=>true));
 const cta=p.getByRole('link',{name:'Explore the menu',exact:true});assert.equal(await cta.getAttribute('href'),'/search');
 const ctaBox=await cta.boundingBox();assert(ctaBox&&ctaBox.y+ctaBox.height<844);
 const hero=p.locator('section[aria-labelledby="home-title"]');const heroBox=await hero.boundingBox();assert(heroBox);
 // Real pixels from the pinned UI; omit delivery marketing and the smaller proprietary claims by framing a crop.
 const homeClip={x:Math.floor(heroBox.x),y:Math.floor(heroBox.y),width:Math.floor(heroBox.width),height:Math.ceil(ctaBox.y+ctaBox.height-heroBox.y)+15};
 await p.screenshot({path:join(dir,'home.png'),clip:homeClip,animations:'disabled',style:'section[aria-labelledby="home-title"] p[class*="intro"]{visibility:hidden}'});
 const homeButton={x:(ctaBox.x-homeClip.x)/homeClip.width,y:(ctaBox.y-homeClip.y)/homeClip.height,w:ctaBox.width/homeClip.width,h:ctaBox.height/homeClip.height};

 await cta.tap();await p.waitForURL(`${base}/search`);const menuUrl=p.url();await home.close();
 const ctx=await context(true);p=await ctx.newPage();
 const menuResp=await p.goto(menuUrl,{waitUntil:'networkidle'});assert.equal(menuResp.status(),200);
 await p.getByRole('heading',{name:'Menyu',exact:true}).waitFor();
 await p.getByRole('heading',{name:'Chipsi Mayai',exact:true}).waitFor();
 const before=await p.locator('article h3').allTextContents();assert(before.length>5);
 const input=p.getByPlaceholder('Search food items',{exact:false});const ib=await input.boundingBox();assert(ib);
 const head=p.getByRole('heading',{name:'Menyu',exact:true});const hb=await head.boundingBox();assert(hb);
 const menuClip={x:0,y:Math.max(0,Math.floor(hb.y)-12),width:390,height:Math.ceil(ib.y+ib.height-hb.y)+22};
 const inputRect={x:ib.x/390,y:(ib.y-menuClip.y)/menuClip.height,w:ib.width/390,h:ib.height/menuClip.height};
 await p.screenshot({path:join(dir,'menu-before.png'),clip:menuClip,animations:'disabled',caret:'hide'});
 await input.fill('pilau');await p.getByRole('heading',{name:'Chipsi Mayai',exact:true}).waitFor({state:'detached'});
 const card=p.locator('article').filter({has:p.getByRole('heading',{name:'Pilau ya Kuku',exact:true})});
 await card.waitFor();
 const matching=await p.locator('article h3').allTextContents();assert(matching.length>=1&&matching.length<before.length);assert.equal(await input.inputValue(),'pilau');
 const label=await card.getByText('TSh 10,000',{exact:true}).textContent();assert.equal(label,'TSh 10,000');
 const image=card.getByRole('img',{name:'Pilau ya Kuku',exact:true});
 await image.evaluate(async img=>{await img.decode();if(!(img.complete&&img.naturalWidth>0))throw Error('No food artwork');});
 await p.screenshot({path:join(dir,'menu-pilau.png'),clip:menuClip,animations:'disabled',caret:'hide'});
 // Retain the actual picture, name and price; omit the showcase rating and add-to-cart control.
 await card.screenshot({path:join(dir,'pilau-result.png'),animations:'disabled',style:'article div[class*="top-2.5"][class*="right-2.5"]{visibility:hidden} article [aria-label^="Add "]{visibility:hidden}'});
 assert.deepEqual(await ctx.cookies(),[]);
 await copyFile(join(web,'public/assets/pilau-ya-kuku.png'),join(dir,'pilau-art.png'));
 await copyFile(join(web,'public/assets/brand/app-icon.png'),join(dir,'bongo-icon.png'));
 const files=await Promise.all(['home.png','menu-before.png','menu-pilau.png','pilau-result.png','pilau-art.png','bongo-icon.png'].map(async n=>({file:n,sha256:createHash('sha256').update(await readFile(join(dir,n))).digest('hex')})));
 const proof={source:`https://github.com/mwijay12/bongofoodie/tree/${ref}/web`,capture:'local pinned Next.js production build, no credentials; built-in showcase data',sourceRef:ref,audience:'https://bongofoodie.vercel.app/',releaseCheck:'Separate public homepage/menu route text check; live search and IG browser not tested.',viewport:[390,844],dpr:2,action:'tap Explore the menu → /search → fill pilau',before:before.length,visibleMenu:matching,highlight:{dish:'Pilau ya Kuku',priceExample:label},homeCapture:'Server-rendered hero; decorative client-side 3D off; link clicked.',redactions:['home intro (delivery marketing)','showcase rating and cart button in result crop'],homeButton,inputRect,externalOriginsBlocked:[...attempted].sort(),files};
 await writeFile(join(qa,'capture-proof.json'),JSON.stringify(proof,null,2)+'\n');
 console.log(JSON.stringify(proof,null,2));
} catch(err){console.error(err);process.exitCode=1;} finally {if(browser)await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));await app.close();}
