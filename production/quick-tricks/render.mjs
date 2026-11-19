import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url)),repo=resolve(here,'../..');
const tools=join(here,'../website-era');
const require=createRequire(join(tools,'package.json'));
const {chromium}=require('playwright-core');
const out=resolve(process.env.QUICK_TRICKS_OUT||join(repo,'out/quick-tricks'));
await mkdir(out,{recursive:true});
const base64=async p=>(await readFile(p)).toString('base64');
const font=async(family,slug)=>`@font-face{font-family:${family};src:url(data:font/woff2;base64,${await base64(join(tools,`node_modules/@fontsource-variable/${slug}/files/${slug}-latin-wght-normal.woff2`))}) format('woff2');font-weight:100 900;font-display:block}`;
const [html,head,body,logo]=await Promise.all([readFile(join(here,'restore-tab.html'),'utf8'),font('Bricolage','bricolage-grotesque'),font('Inter','inter'),base64(join(repo,'content/assets/altraware-mark.png'))]);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1080,height:1350}}),requests=[];
 page.on('request',r=>requests.push(r.url()));
 await page.setContent(html.replace('<style>',`<style>${head}${body}`).replace('@@LOGO@@',`data:image/png;base64,${logo}`));
 await page.evaluate(()=>document.fonts.ready);
 const fit=await page.locator('.art').evaluate(e=>{
  const main=e.querySelector('main').getBoundingClientRect(),foot=e.querySelector('footer').getBoundingClientRect();
  const reserve=Math.floor(foot.top-main.bottom);
  const bounds=e.getBoundingClientRect();
  const protrudes=Array.from(e.querySelectorAll('h1,.index,.lead,.tab b,.tab i,.chord,.note,footer')).some(n=>{
   const r=document.createRange();r.selectNodeContents(n);const g=r.getBoundingClientRect();return g.left<bounds.left+65||g.right>bounds.right-65;
  });
  const keyrows=Array.from(e.querySelectorAll('.chord'),n=>Array.from(n.querySelectorAll('kbd'),el=>el.textContent));
  return {reserve,protrudes,keyrows};
 });
 assert(fit.reserve>=22&&!fit.protrudes,JSON.stringify(fit));
 assert.deepEqual(fit.keyrows,[['Ctrl','Shift','T'],['⌘','Shift','T']]);
 assert(requests.every(url=>!/^https?:/.test(url)),'No runtime network');
 await page.locator('.art').screenshot({path:join(out,'Quick-Tricks-01-Rudisha-Tab.png')});
 await writeFile(join(out,'card-fit.json'),JSON.stringify(fit,null,2)+'\n');
 console.log('Quick Tricks 01 · card and keyboard layout',fit);
}finally{await browser.close();}
