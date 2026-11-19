import assert from 'node:assert/strict';
import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
import {slide, slideFiles, guide, keyword, results, links} from './content.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const out=resolve(process.env.PAYMENT_CHECK_OUT||join(root,'out/payment-check'));
const site='https://payment-check.invalid';
const routes=new Map();
const assets=[
  ['/theme.css',join(here,'theme.css'),'text/css'],
  ['/guide.css',join(here,'guide.css'),'text/css'],
  ['/mark.png',join(root,'content/assets/altraware-mark.png'),'image/png'],
  ...[['inter','inter'],['fraunces','fraunces'],['jetbrains','jetbrains-mono']].map(([alias,font])=>
    [`/font/${alias}.woff2`,join(here,`node_modules/@fontsource-variable/${font}/files/${font}-latin-wght-normal.woff2`),'font/woff2']),
];
for(const [path,name,type] of assets) routes.set(path,{body:await readFile(name),contentType:type});
for(const dir of ['slides','qa']) await mkdir(join(out,dir),{recursive:true});
const html=(path,body)=>routes.set(path,{body,contentType:'text/html; charset=utf-8'});
html('/guide',guide());
for(const [i] of slideFiles.entries()) html(`/slide/${i+1}`,slide(i));
assert.equal(results.repeat.confirmations,2);
assert.equal(results.repeat.payments,1);
assert.equal(results.repeat.receipts,1);
assert.deepEqual(results.repeat.receiptRefs,results.paid.receiptRefs);
const runtimeErrors=[];
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
  const context=await browser.newContext({viewport:{width:1080,height:1350},deviceScaleFactor:1});
  // No network-backed fonts, UI states, payment endpoints or tracking.
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    const file=url.origin===site&&routes.get(url.pathname);
    if(file) await route.fulfill({status:200,...file});
    else {runtimeErrors.push(`Unexpected request: ${url.href}`);await route.abort();}
  });
  const page=await context.newPage();
  page.on('pageerror',error=>runtimeErrors.push(error.message));
  async function load(path){
    await page.goto(site+path);
    await page.evaluate(async()=>{
      await document.fonts.ready;
      for(const img of document.images) await img.decode();
      for(const face of ['Inter','Fraunces','JetBrains']){
        const loaded=Array.from(document.fonts).some(f=>f.family===face&&f.status==='loaded');
        if(!loaded) throw new Error(`Expected loaded local font: ${face}`);
      }
    });
  }
  const guideName='Ukaguzi-wa-Malipo-Majaribio-5-Kiswahili.pdf';
  await load('/guide');
  const sheetBounds=()=>page.locator('.sheet').evaluateAll(sheets=>sheets.map(sheet=>{
    const main=sheet.querySelector('main');
    const guard=sheet.querySelector('footer').getBoundingClientRect();
    return Number((guard.top-main.getBoundingClientRect().bottom).toFixed(2));
  }));
  await page.emulateMedia({media:'print'});
  const gap=await sheetBounds();
  assert.equal(gap.length,3);
  for(const [i,g] of gap.entries()) assert(g>=16,`PDF p${i+1} body/footer clearance: ${g}px`);
  assert.deepEqual(await page.locator('.refs a').evaluateAll(a=>a.map(x=>x.href)),Object.values(links));
  await page.pdf({path:join(out,guideName),printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
  const checks={browser:browser.version(),worksheet:{pages:3,footerClearancePx:gap,links},slides:[],proof:results};
  console.log(`Rendered ${guideName}`);
  await page.emulateMedia({media:'screen'});
  for(let i=0;i<3;i++){
    const capture=await page.locator('.sheet').nth(i).screenshot({path:join(out,'qa',`guide-0${i+1}.png`)});
    if(i===0) routes.set('/guide-cover.png',{body:capture,contentType:'image/png'});
  }
  for(const [i,name] of slideFiles.entries()){
    await load(`/slide/${i+1}`);
    const layout=await page.locator('.slide').evaluate(s=>{
      const rect=el=>el.getBoundingClientRect();
      const art=s.querySelector('.schematic,.resource');
      const containing=rect(s);
      const safe={left:containing.left+69,right:containing.right-69,top:0,bottom:containing.bottom};
      const overflow=[];
      const walker=document.createTreeWalker(s,NodeFilter.SHOW_TEXT);
      let node;
      while((node=walker.nextNode())){
        if(!node.textContent.trim())continue;
        const range=new Range();range.selectNodeContents(node);
        for(const b of range.getClientRects()){
          if(b.left<safe.left||b.right>safe.right||b.top<safe.top||b.bottom>safe.bottom){overflow.push(node.textContent);break;}
        }
      }
      return {overflow,width:containing.width,height:containing.height,
        titleGap:Math.round(rect(art).top-rect(s.querySelector('.title')).bottom),
        artGap:Math.round(rect(s.querySelector('footer')).top-rect(art).bottom),
        localOverflow:[...s.querySelectorAll('.tile,.trace,.counts>div')].some(n=>n.scrollWidth>n.clientWidth+2||n.scrollHeight>n.clientHeight+2)};
    });
    assert.deepEqual([layout.width,layout.height],[1080,1350]);
    assert(layout.titleGap>=32&&layout.artGap>=28&&!layout.localOverflow&&!layout.overflow.length,`${name} layout: ${JSON.stringify(layout)}`);
    if(i===4){
      const observed=await page.locator('.counts b').allTextContents();
      assert.deepEqual(observed,['2','1','1']);
    }
    if(i===slideFiles.length-1) assert.equal(await page.locator('h1 em').innerText(),keyword);
    await page.locator('.slide').screenshot({path:join(out,'slides',`${name}.png`)});
    checks.slides.push({name,...layout});
    console.log(`Rendered ${name}`);
  }
  await copyFile(join(root,'content/pilots/05-payment-check-caption.txt'),join(out,'Caption-na-Replies-MALIPO.txt'));
  assert.deepEqual(runtimeErrors,[]);
  await writeFile(join(out,'qa','layout-and-proof.json'),JSON.stringify(checks,null,2)+'\n');
}finally{await browser.close();}
