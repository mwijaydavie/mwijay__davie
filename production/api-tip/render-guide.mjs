import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {guide} from './guide.mjs';
import {runLab} from './lab.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const out=resolve(process.env.API_TIP_OUT||join(root,'out/api-tip'));
await mkdir(join(out,'qa'),{recursive:true});
const font=async (family,slug)=>{
  const src=await readFile(join(here,`node_modules/@fontsource-variable/${slug}/files/${slug}-latin-wght-normal.woff2`));
  return `@font-face{font-family:${family};src:url(data:font/woff2;base64,${src.toString('base64')}) format('woff2');font-weight:100 900;font-display:block}`;
};
const [fonts,css,mark,proof]=await Promise.all([
  Promise.all([font('Inter','inter'),font('Fraunces','fraunces'),font('JetBrains','jetbrains-mono')]),
  readFile(join(here,'guide.css'),'utf8'),
  readFile(join(root,'content/assets/altraware-mark.png')),
  runLab(),
]);
const html=guide({css,fonts:fonts.join('\n'),mark:`data:image/png;base64,${mark.toString('base64')}`,proof});
await writeFile(join(out,'qa','guide.html'),html);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
  const page=await browser.newPage({viewport:{width:800,height:1000},deviceScaleFactor:2});
  await page.emulateMedia({media:'print'});
  await page.setContent(html);
  await page.evaluate(()=>document.fonts.ready);
  const clearance=await page.locator('.sheet').evaluateAll(sheets=>sheets.map(s=>{
    const main=s.querySelector('.page-body').getBoundingClientRect();
    const foot=s.querySelector('.page-foot').getBoundingClientRect();
    return {page:s.id,reserve:Math.round(foot.top-main.bottom),overflow:s.scrollWidth-s.clientWidth};
  }));
  console.log(clearance);
  assert.equal(clearance.length,6);
  assert(clearance.every(x=>x.reserve>=12&&x.overflow<=1), 'One guide page needs reflow.');
  await page.pdf({path:join(out,'Mwongozo-Bure-API-na-MCP.pdf'),printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
  for(let i=1;i<=6;i++){
    await page.locator(`#p${i}`).screenshot({path:join(out,'qa',`guide-${i}.png`)});
  }
  await writeFile(join(out,'qa','lab.json'),JSON.stringify(proof,null,2)+'\n');
  console.log('Six-page guide with clickable resources and lab results.');
}finally{await browser.close();}
