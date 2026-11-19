import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
import {amount,compareCart} from './checkout.mjs';

const here=dirname(fileURLToPath(import.meta.url)),repo=resolve(here,'../../..');
const out=resolve(process.env.DELIVERY_STORY_OUT||join(repo,'out/delivery-story'));
const audience=join(out,'audience'),qa=join(out,'qa');
await Promise.all([mkdir(audience,{recursive:true}),mkdir(qa,{recursive:true})]);
const example=JSON.parse(await readFile(join(here,'example.json'),'utf8'));
const {before,after,delta}=compareCart(example);
const b64=async p=>(await readFile(p)).toString('base64');
const font=async(family,slug)=>`@font-face{font-family:${family};src:url(data:font/woff2;base64,${await b64(join(here,`../node_modules/@fontsource-variable/${slug}/files/${slug}-latin-wght-normal.woff2`))}) format('woff2');font-weight:100 900;font-display:block}`;
const [head,body,mark]=await Promise.all([font('Bricolage','bricolage-grotesque'),font('Inter','inter'),b64(join(repo,'content/assets/altraware-mark.png'))]);
const row=(label,a,b)=>`<tr><th scope="row">${label}</th><td>${amount(a)}</td><td>${amount(b)}</td></tr>`;
const html=`<!doctype html><html lang="sw"><meta charset="utf-8"><title>TOTAL · Worksheet ya Kulinganisha Checkout</title>
<style>${head}${body}
@page{size:A5;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:#fbf1df;color:#351f49;font:490 15px/1.34 Inter,Arial,sans-serif}
.sheet{position:relative;width:148mm;height:210mm;padding:31px 35px;background:linear-gradient(155deg,#fffaec 48%,#f5e8d7)}
header{display:flex;align-items:center;gap:9px;padding-bottom:14px;border-bottom:1px solid #c4a9bb;color:#482c63;font-size:12px;letter-spacing:.07em;font-weight:820}
header img{width:27px;height:27px;object-fit:contain}header span{margin-left:auto;padding:4px 6px;border:1px solid #8c6a9a;border-radius:2px;font-size:10px}
main{padding-top:18px}h1,h2,p{margin:0}.kicker{font-size:12px;font-weight:790;letter-spacing:.065em;color:#684280}
h1{font:850 54px/.95 Bricolage,Georgia,serif;letter-spacing:-.071em;margin:6px 0 10px}h1 em{color:#73359b;font-style:normal}
.lead{color:#5c445d;line-height:1.35;max-width:445px;margin-bottom:14px}
.block{background:#fffdf4;border:1px solid #bda6b5;border-radius:3px;overflow:hidden}
.meta{padding:9px 10px;background:#eee1f7;color:#54346b;font-weight:710;font-size:13px}
table{border-collapse:collapse;width:100%;text-align:right;font-variant-numeric:tabular-nums}th,td{padding:7px 10px;border-bottom:1px solid #e9d8dc}tr :first-child{text-align:left}thead th{font-size:12px;color:#644763}tbody th{font-weight:630}tbody td{font-weight:750}tbody tr:last-child{background:#dff0dd}tbody tr:last-child>*{border:none;font-weight:840}
.delta{margin-top:10px;background:#eef1bd;border-left:4px solid #8c9849;padding:8px 10px;color:#45384d;font-size:13.5px}.delta b{font-weight:850}
h2{font:820 28px/1 Bricolage,Georgia,serif;letter-spacing:-.048em;margin:18px 0 6px}.equation{font-size:13px;color:#5f465f}
.blanks{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}.blanks div{background:#fffaf0;border:1px dashed #a787ad;padding:8px 10px 9px;border-radius:3px;font:720 12px/1.2 Inter,sans-serif}.blanks i{display:block;margin-top:12px;border-bottom:1px solid #b69ab8;width:100%}
.seller{margin-top:12px;border-left:4px solid #775095;padding:6px 9px;background:#f0e5f6;color:#523762;font-size:13px}
footer{position:absolute;bottom:25px;left:35px;right:35px;display:flex;justify-content:space-between;padding-top:9px;border-top:1px solid #c2a7b8;color:#66466a;font-size:10.5px;font-weight:750;letter-spacing:.06em}
</style><body><section class="sheet"><header><img alt="" src="data:image/png;base64,${mark}"><b>ALTRAWARE</b><span>BUSINESS STORY 03 / TOTAL</span></header><main>
<div class="kicker">WORKSHEET / KABLA YA CHECKOUT</div><h1>Linganisha <em>total.</em></h1>
<p class="lead">Usiangalie “free” peke yake. Andika jumla utakayolipa kwenye kila option.</p>
<div class="block"><div class="meta">MFANO · Free delivery kuanzia TSh ${amount(example.freeAt)} kwa bidhaa</div>
<table aria-label="Mfano wa kulinganisha checkout"><thead><tr><th scope="col">Gharama · TSh</th><th scope="col">A / Bila add-on</th><th scope="col">B / Na add-on</th></tr></thead><tbody>
${row('Basket ya mwanzo',before.subtotal,before.subtotal)}${row('Bidhaa ya ziada',0,example.addOn)}${row('Delivery',before.delivery,after.delivery)}${row('Jumla',before.total,after.total)}
</tbody></table></div>
<p class="delta"><b>Tofauti: +TSh ${amount(delta)}.</b> Unapata bidhaa ya ziada. Unaihitaji?</p>
<h2>Jaribu kwa basket yako.</h2><p class="equation">Tofauti = jumla ukiongeza − jumla bila kuongeza.</p>
<div class="blanks"><div>Jumla bila kuongeza · TSh<i></i></div><div>Jumla ukiongeza · TSh<i></i></div></div>
<p class="seller"><b>Kwa muuzaji:</b> Onyesha kiwango na jumla kwenye basket. Jaribu order iliyo chini, sawa na, na juu ya kiwango.</p>
</main><footer><span>MFANO TU · SI BEI YA DUKA</span><span>01 / 01</span></footer></section></body></html>`;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:600,height:830},deviceScaleFactor:1.5});
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.emulateMedia({media:'print'});await page.setContent(html);await page.evaluate(()=>document.fonts.ready);
 const fit=await page.locator('.sheet').evaluate(p=>({
  room:Math.floor(p.querySelector('footer').getBoundingClientRect().top-p.querySelector('main').getBoundingClientRect().bottom),
  overflow:Math.max(...Array.from(p.querySelectorAll('main,header,table,.block,.blanks'),e=>e.scrollWidth-e.clientWidth))
 }));
 assert(fit.room>=12&&fit.overflow<=1,JSON.stringify(fit));
 await page.pdf({path:join(audience,'TOTAL-Checkout-Worksheet.pdf'),printBackground:true,preferCSSPageSize:true,tagged:true});
 await page.locator('.sheet').screenshot({path:join(qa,'worksheet.png')});
 assert(requests.every(u=>!/^https?:/.test(u)));
 await writeFile(join(qa,'worksheet-fit.json'),JSON.stringify(fit,null,2)+'\n');
 console.log('TOTAL worksheet A5 fit:',fit);
}finally{await browser.close();}
