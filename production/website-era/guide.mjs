import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../..');
const locale=process.env.WEBSITE_ERA_LOCALE||'sw';
const edition=JSON.parse(await readFile(join(here,'editions.json'),'utf8'))[locale];assert(edition);
const english=locale==='en';
const out=resolve(process.env.WEBSITE_ERA_OUT||join(root,'out',edition.slug));
const audience=join(out,'audience'),qa=join(out,'qa');
await Promise.all([mkdir(audience,{recursive:true}),mkdir(qa,{recursive:true})]);
const logo=(await readFile(join(root,'content/assets/altraware-mark.png'))).toString('base64');
const font=async(family,slug)=>`@font-face{font-family:${family};src:url(data:font/woff2;base64,${(await readFile(join(here,`node_modules/@fontsource-variable/${slug}/files/${slug}-latin-wght-normal.woff2`))).toString('base64')}) format('woff2');font-weight:100 900;font-display:block}`;
const [head,body,css]=await Promise.all([font('Bricolage','bricolage-grotesque'),font('Inter','inter'),readFile(join(here,'guide.css'),'utf8')]);
const checks=english?[
 ['Mobile','Open the page on your phone using mobile data. Read it without zooming and try the main button.'],
 ['Services and prices','Explain what you sell and show the current price or how to get a quote. Note if price or stock can change.'],
 ['One clear next step','Make the phone, WhatsApp or booking link easy to find. Try it from a second device.'],
 ['Details in text','Write the menu, prices or specs on the page, not just inside an image.'],
]:[
 ['Simu','Tumia data ya simu. Soma bila ku-zoom; jaribu kubonyeza button.'],
 ['Huduma na bei','Weka unachouza, bei ya sasa au njia ya kupata quote. Taja kama bei au stock inabadilika.'],
 ['Hatua inayofuata','Jaribu link ya WhatsApp, simu au booking. Mgeni aione bila kutafuta sana.'],
 ['Maelezo ya maandishi','Andika menyu, bei au specs kama text kwenye page, si picha pekee.'],
];
const rows=checks.map(([title,copy],i)=>`<li><i aria-hidden="true"></i><div><b>${i+1}. ${title}</b><p>${copy}</p></div></li>`).join('');
const page=(i,label,body)=>`<section class="sheet" id="p${i}"><header><img src="data:image/png;base64,${logo}" alt=""><b>ALTRAWARE</b><span>WEB / CHECKLIST</span></header><main><small>${label}</small>${body}</main><footer><span>BUSINESS STORY 02 · ${english?'FREE RESOURCE':'RESOURCE BURE'}</span><b>0${i} / 02</b></footer></section>`;
const sw=`<!doctype html><html lang="sw"><meta charset="utf-8"><title>WEB · Checklist ya Website Yako</title><style>${head}\n${body}\n${css}</style><body>${page(1,'01 / ANZA NA MTEJA',`
<h1>Website yako <em>inajibu?</em></h1>
<p class="lead">Chagua page moja muhimu: menu, huduma au product. Ijaribu kama mteja mpya.</p>
<ol>${rows}</ol>
<div class="callout"><b>Jaribio la mtu mwingine</b><p>Muombe atafute bei au njia ya kuwasiliana bila msaada. Alikwama wapi?</p></div>
`)}${page(2,'02 / ANGALIA SEARCH',`
<h2>Page inaweza<br><em>kupatikana?</em></h2>
<div class="steps"><p><b>01 · Jaribu link.</b> Fungua URL kwenye private tab bila ku-login. Hakikisha inaonyesha page sahihi, si error.</p>
<p><b>02 · Hakiki indexing.</b> Ukiwa na access ya Google Search Console, angalia URL Inspection. Muulize developer aangalie vizuizi vya crawl au <code>noindex</code> visivyokusudiwa.</p>
<p><b>03 · Chagua fix moja.</b> Rekebisha kilichomkwamisha mteja. Rudia jaribio kwa link ileile baada ya ku-update.</p></div>
<div class="worksheet"><p><b>Page ninayoanza nayo</b></p><p><b>Fix moja nitakayofanya</b></p></div>
<div class="callout"><b>Hakuna guarantee.</b><p>Page kuwa wazi au indexed hakumaanishi ita-rank au kutajwa na AI.</p></div>
<p class="links"><a href="https://support.google.com/webmasters/answer/9012289">URL Inspection</a> · <a href="https://developers.google.com/search/docs/appearance/ai-features">Google Search: AI features</a></p>
`)}</body></html>`;

const en=`<!doctype html><html lang="en"><meta charset="utf-8"><title>WEB · Website Checklist</title><style>${head}\n${body}\n${css}</style><body>${page(1,'01 / START WITH THE CUSTOMER',`
<h1>Can customers <em>find it?</em></h1>
<p class="lead">Pick one key page: a menu, a service or a product. Test it like a new customer.</p>
<ol>${rows}</ol>
<div class="callout"><b>Try it with a second person</b><p>Ask them to find a price or contact you without help. Where do they get stuck?</p></div>
`)}${page(2,'02 / CHECK SEARCH ACCESS',`
<h2>Can search<br><em>read the page?</em></h2>
<div class="steps"><p><b>01 · Open the link.</b> Use a private tab to make sure the right page loads without signing in.</p>
<p><b>02 · Check indexing.</b> If you have Google Search Console access, use URL Inspection. Ask your developer to check for unintended crawl blocks or <code>noindex</code>.</p>
<p><b>03 · Pick one fix.</b> Fix the first thing that stopped your customer. Test the same link again after publishing the change.</p></div>
<div class="worksheet"><p><b>The page I’ll start with</b></p><p><b>One change I’ll make</b></p></div>
<div class="callout"><b>What this check tells you</b><p>Indexing tells you a search engine knows about the page. Which results or sources it shows depends on the search.</p></div>
<p class="links"><a href="https://support.google.com/webmasters/answer/9012289">URL Inspection</a> · <a href="https://developers.google.com/search/docs/appearance/ai-features">Google Search: AI features</a></p>
`)}</body></html>`;

const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const tab=await browser.newPage({viewport:{width:630,height:840},deviceScaleFactor:1.5});
 const network=[];tab.on('request',r=>network.push(r.url()));
 await tab.emulateMedia({media:'print'});await tab.setContent(english?en:sw);await tab.evaluate(()=>document.fonts.ready);
 const checks=await tab.locator('.sheet').evaluateAll(pages=>pages.map(p=>({
  reserve:Math.floor(p.querySelector('footer').getBoundingClientRect().top-p.querySelector('main').getBoundingClientRect().bottom),
  overflow:Math.max(p.scrollWidth-p.clientWidth,...Array.from(p.querySelectorAll('main,header,li,.steps'),e=>e.scrollWidth-e.clientWidth)),
 })));
 console.log('WEB · A5 fit',checks);
 assert(checks.length===2&&checks.every(d=>d.reserve>=12&&d.overflow<=1),'Guide text must fit with footer clearance');
 await tab.pdf({path:join(audience,edition.pdf),printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
 for(const id of ['p1','p2'])await tab.locator(`#${id}`).screenshot({path:join(qa,`web-guide-${id}.png`)});
 assert(network.every(u=>!/^https?:/.test(u)),'Guide has remote runtime assets');
 await writeFile(join(qa,'web-guide-fit.json'),JSON.stringify(checks,null,2)+'\n');
}finally{await browser.close();}
