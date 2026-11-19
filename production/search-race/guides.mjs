import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {chromium} from 'playwright-core';
import {runLab,out} from './lab.mjs';
import {compare} from '../price-story/logic.mjs';

const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../..');
const faq='https://react.dev/reference/react/useEffect#fetching-data-with-effects';
const simonson='https://www.gsb.stanford.edu/faculty-research/publications/choice-based-reasons-case-attraction-compromise-effects';
const qa=join(out,'qa'),audience=join(out,'audience');
await Promise.all([mkdir(qa,{recursive:true}),mkdir(audience,{recursive:true})]);
const font=async (family,slug)=>{
 const buf=await readFile(join(here,`node_modules/@fontsource-variable/${slug}/files/${slug}-latin-wght-normal.woff2`));
 return `@font-face{font-family:${family};src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');font-weight:100 900;font-display:block}`;
};
const [fonts,css,logo,proof,pricing,quick]=await Promise.all([
 Promise.all([font('Bricolage','bricolage-grotesque'),font('Inter','inter'),font('JetBrains','jetbrains-mono')]),
 readFile(join(here,'guide.css'),'utf8'),readFile(join(root,'content/assets/altraware-mark.png')),
 runLab(),readFile(join(root,'production/price-story/example.json'),'utf8').then(JSON.parse).then(compare),readFile(join(here,'quick-example.mjs'),'utf8'),
]);
const examples={};
for(const [k,args] of [['oldResult',[]],['oldError',['--old-error']]]){
 const {stdout}=await promisify(execFile)(process.execPath,[join(here,'quick-example.mjs'),...args]);
 assert.equal(stdout.trim(),'chai Chai ready');examples[k]=stdout.trim();
}
const [wrapper,setup]=quick.trim().split('\n\n// Local simulation: no fetch, timer or API key.\n');
assert(wrapper&&setup);
const logoUrl=`data:image/png;base64,${logo.toString('base64')}`;
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const number=s=>s.toLocaleString('en-GB');
const showCode=(label,src)=>`<div class="box"><div class="bar"><i></i>${label}</div><pre>${esc(src).replace(/^( +if \(id !== latest\) return;)$/gm,'<b>$1</b>')}</pre></div>`;
const page=(label,i,total,theme,body)=>`<section class="sheet ${theme}" id="p${i}"><header class="head"><img src="${logoUrl}" alt=""><b>ALTRAWARE</b><span>${label}</span></header><main class="main">${body}</main><footer class="foot"><span>${theme?'BUSINESS STORY 01':'CODE STORY 01'} / RESOURCE</span><b>0${i} / 0${total}</b></footer></section>`;
const doc=(title,pages)=>`<!doctype html><html lang="sw"><meta charset="utf-8"><title>${title}</title><style>${fonts.join('\n')}\n${css}</style><body>${pages.join('\n')}</body></html>`;

const search=doc('SEARCH · Mfano wa code: latest request wins',[
 page('SEARCH / JAVASCRIPT',1,3,'',`
  <p class="eyebrow">Jaribio la search · Bila API</p>
  <h1 class="title">Mbona <b>pilau</b><br>imerudi?</h1>
  <p class="lead">Uliandika <strong>chai</strong> baada ya pilau. Request ya zamani ikimaliza mwisho, isiandike juu ya jibu jipya.</p>
  <div class="compare"><div class="result wrong"><small>BILA GUARD · QUERY CHAI</small><b>${proof.before.final.rows[0]}</b>Jibu la zamani limefuta chai.</div><div class="result"><small>GUARD ON · QUERY CHAI</small><b>${proof.after.final.rows[0]}</b>Jibu la request mpya limebaki.</div></div>
  <ol class="trace">${proof.before.trace.map((x,i)=>`<li><b>#${x.id} ${esc(x.forQuery)}</b> ${['Tuma search ya kwanza','Tuma search ya pili','Chai inajibu kwanza','Pilau inajibu baadaye'][i]}</li>`).join('')}</ol>
  <div class="note"><strong>KANUNI MOJA</strong><p>Hesabu ID wakati wa kutuma. Jibu likirudi, badili UI tu kama ID yake bado ndiyo ya request ya karibuni. Hata <strong>error ya zamani</strong> ipuuzwe.</p></div>
  <p class="small">Menu na requests ni za mfano; mpangilio umetengenezwa kwa test, si kipimo cha latency. Kwa mfano mwingine wa tatizo hili, soma <a href="${faq}">React: Fetching data with Effects</a>.</p>`),
 page('SEARCH / JAVASCRIPT',2,3,'',`
  <p class="eyebrow">Hatua 1 · Copy kwenye search-demo.mjs</p>
  <h2 class="subtitle">Guard mara mbili.</h2>
  <p>Tumia instance moja kwa kila search box. <code>lookup</code> irudishe Promise; <code>paint</code> ipokee state.</p>
  ${showCode('SEARCH-DEMO.MJS · 1 / 2',wrapper)}
  <div class="note indigo"><strong>USISAHAU CLEAR</strong><p><code>clear()</code> inabatilisha ID ya jibu lililo njiani, haikatishi network. Guard <code>finally</code> pia ikiwa inabadilisha UI.</p></div>`),
 page('SEARCH / JAVASCRIPT',3,3,'',`
  <p class="eyebrow">Hatua 2 · Ongeza chini ya code ya ukurasa 02</p>
  <h2 class="subtitle">Chelewesha pilau.</h2>
  ${showCode('SEARCH-DEMO.MJS · 2 / 2',setup)}
  <span class="cmd">node search-demo.mjs<br>node search-demo.mjs --old-error</span>
  <div class="note"><strong>EXPECTED · ${esc(examples.oldError.toUpperCase())}</strong><p>Zote mbili: query <b>chai</b>, result <b>Chai</b>, status <b>ready</b>. Hakuna API key au <code>npm install</code>. Tumia Node.js 18+.</p></div>
  <p class="small">Ukitumia ZIP, <code>node --test latest.test.mjs</code> ina tests 7, pamoja na error ya request mpya, clear na kurudia query ileile.</p>`),
]);
const sizes=doc('SIZE · Worksheet ya chaguo tatu',[
 page('SIZE / PRICING',1,2,'price',`
  <p class="eyebrow">Worksheet ya bei · Mfano uliojazwa</p>
  <h1 class="title">Bei ileile.<br><b>Chaguo jipya.</b></h1>
  <p class="lead">Ongeza size yenye kazi yake. Linganisha bei yote, kiasi unachopata na bei kwa unit.</p>
  <div class="shift"><span>500 mL · ${number(pricing.samePrice)} TSh</span><b>→</b><span class="middle">Juu kati ya 2 → Kati ya 3</span></div>
  <table aria-label="Bei za mfano"><thead><tr><th>Size</th><th>Bei (TSh)</th><th>TSh / 100 mL</th><th>Inamfaa nani?</th></tr></thead><tbody>${pricing.rows.map(v=>`<tr class="${v.id==='half'?'key':''}"><td><b>${esc(v.size)}</b></td><td class="num">${number(v.price)}</td><td class="num">${number(v.per100)}</td><td>${esc(v.for)}</td></tr>`).join('')}</tbody></table>
  <div class="formula">TSh / 100 mL = bei ÷ mL × 100</div>
  <div class="note"><strong>HAKUNA DISCOUNT HAPA</strong><p>500 mL bado ni TSh 5,000. Inakuwa ya kati baada ya 1 L kuingia. Nafasi ya kati <b>inaweza</b> kuonekana kama balance, si lazima iwe bora kwa kila mtu.</p></div>
  <p class="small">Bei za mfano, si ofa wala data ya mauzo. Soma <a href="${simonson}">Simonson (1989), compromise effect</a>.</p>`),
 page('SIZE / PRICING',2,2,'price',`
  <p class="eyebrow">Worksheet · Jaza kwa bidhaa yako / print</p>
  <h2 class="subtitle">Kila size ina kazi gani?</h2>
  <p>Andika chaguo 3 halisi. Tumia unit moja kwa kila row: mL, gramu au idadi. Linganisha bei kwa unit ileile.</p>
  <div class="lines"><p><b>Bidhaa:</b></p><p><b>Unit ya kulinganisha (mf. 100 mL):</b></p></div>
  <div class="spacer"></div>
  <table class="worksheet" aria-label="Jedwali la kujaza"><thead><tr><th>Tier</th><th>Size</th><th>Bei (TSh)</th><th>TSh / unit</th><th>Mteja / matumizi</th></tr></thead><tbody>${['A','B','C'].map(x=>`<tr><td>${x}</td><td></td><td></td><td></td><td></td></tr>`).join('')}</tbody></table>
  <div class="lines"><p><b>Bei ÷ kiasi × unit ya kulinganisha:</b></p><p><b>Bei − gharama zinazobadilika kwa unit inayouzwa:</b></p><p><b>Sababu halisi ya kuweka option ya tatu:</b></p></div>
  <div class="note"><strong>TEST KABLA YA KUWEKA MENU MPYA</strong><p>Uliza wateja wachache: “Ungechagua ipi, na kwa nini?” Majibu si prediction ya sales. Bei ukitoa variable costs si net profit.</p></div>`),
]);

const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const checks={examples};
try{
 for(const [prefix,html,name,count] of [['search',search,'SEARCH-Mfano-wa-Code.pdf',3],['size',sizes,'SIZE-Worksheet-ya-Bei.pdf',2]]){
  const page=await browser.newPage({viewport:{width:710,height:900},deviceScaleFactor:1.4});
  await page.emulateMedia({media:'print'});await page.setContent(html);await page.evaluate(()=>document.fonts.ready);
  const sizes=await page.locator('.sheet').evaluateAll(s=>s.map(el=>({
   reserve:Math.round(el.querySelector('.foot').getBoundingClientRect().top-el.querySelector('.main').getBoundingClientRect().bottom),
   overflow:Math.max(el.scrollWidth-el.clientWidth,...Array.from(el.querySelectorAll('table,pre,.main'),x=>x.scrollWidth-x.clientWidth)),
  })));
  console.log(name,sizes);assert.equal(sizes.length,count);assert(sizes.every(x=>x.reserve>=14&&x.overflow<=1),'A5 overflow: reflow guide.');
  const network=[];page.on('request',r=>network.push(r.url()));
  await page.pdf({path:join(audience,name),printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
  for(let i=1;i<=count;i++)await page.locator(`#p${i}`).screenshot({path:join(qa,`guide-${prefix}-${i}.png`)});
  assert(network.every(u=>!/^https?:/.test(u)));
  checks[prefix]=sizes;await page.close();
 }
 await copyFile(join(here,'quick-example.mjs'),join(audience,'search-demo.mjs'));
 await writeFile(join(qa,'guide-checks.json'),JSON.stringify(checks,null,2)+'\n');
}finally{await browser.close();}
