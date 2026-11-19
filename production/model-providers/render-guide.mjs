import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
import {guide} from './guide.mjs';
import {proof} from './rate-demo.mjs';

const here=dirname(fileURLToPath(import.meta.url));const root=resolve(here,'../..');
const out=resolve(process.env.MODEL_GUIDE_OUT||join(root,'out/model-providers'));
await mkdir(join(out,'qa'),{recursive:true});
const txt=f=>readFile(f,'utf8');
const data=async (f,type)=>`data:${type};base64,${(await readFile(f)).toString('base64')}`;
const fonts=(await Promise.all([['Inter','inter'],['Fraunces','fraunces'],['JetBrains','jetbrains-mono']].map(async ([f,p])=>
 `@font-face{font-family:${f};src:url(${await data(join(here,`node_modules/@fontsource-variable/${p}/files/${p}-latin-wght-normal.woff2`),'font/woff2')}) format('woff2');font-weight:100 900;font-display:block}`))).join('\n');
const css=await txt(join(here,'guide.css'));
const routes=JSON.parse(await txt(join(here,'routes.json')));
const demo=proof();
const art={key:await data(join(out,'assets/key-desk.jpg'),'image/jpeg')};
const logos=Object.fromEntries(await Promise.all(Object.entries({deepseek:'deepseek-color',anthropic:'claude-color',zai:'zai',qwen:'qwen-color',gemini:'gemini-color',openrouter:'openrouter-color',ollama:'ollama'}).map(async ([k,v])=>
 [k,await data(join(here,`node_modules/@lobehub/icons-static-svg/icons/${v}.svg`),'image/svg+xml')])));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:850,height:1050},deviceScaleFactor:2});
 await page.emulateMedia({media:'print'});
 for(const [lang,label] of [['sw','Swanglish'],['en','English']]){
  await page.setContent(guide({lang,css,fonts,art,logos,routes,demo}));
  await page.evaluate(()=>document.fonts.ready);
  const qa=await page.locator('.sheet').evaluateAll(s=>s.map(x=>({page:x.id,clear:Math.round(x.querySelector('.foot').getBoundingClientRect().top-x.querySelector('.body').getBoundingClientRect().bottom),overflow:x.scrollWidth-x.clientWidth})));
  assert.equal(qa.length,7);console.log(label,qa);
  assert(qa.every(q=>q.clear>=12&&q.overflow<=1),`Repair guide overflow before printing: ${label}`);
  await page.pdf({path:join(out,`Free-AI-API-Guide-${label}.pdf`),printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
  for(let i=1;i<=7;i++)await page.locator(`#p${i}`).screenshot({path:join(out,'qa',`guide-${lang}-${i}.png`)});
 }
 await writeFile(join(out,'qa/local-proof.json'),JSON.stringify(demo,null,2)+'\n');
}finally{await browser.close();}
