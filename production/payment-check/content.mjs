import {cases, simulate, order, mismatch, paid} from './lab.mjs';

export const keyword='MALIPO';
export const links={
  bot:'https://www.bot.go.tz/Publications/Regular/Annual%20Report/en/2026060211494565.pdf',
  provider:'https://docs.clickpesa.com/home/payment-status',
};
export const results=Object.fromEntries(Object.entries(cases).map(([name,events])=>[name,simulate(events)]));
export const slideFiles=[
  '01-Ujumbe-mara-mbili','02-Takwimu-za-BoT','03-Ombi-si-malipo','04-Muda-umeisha','05-Risiti-moja','06-Kagua-kiasi','07-Comment-MALIPO',
];
const format=value=>new Intl.NumberFormat('en-TZ').format(value);
const svg=(name,size=45)=>{
  const paths={inbox:'M6 11h42v33H6zM7 14l20 15 21-15',clock:'M46 27a19 19 0 1 1-38 0 19 19 0 0 1 38 0zM27 16v12l8 5',
    check:'M10 28l11 11 23-25',arrow:'M7 27h38M33 14l13 13-13 13',loop:'M43 22a17 17 0 0 0-29-8l-4 4M10 8v11h11m-9 14a17 17 0 0 0 29 8l4-4m0 10V36H34',
    doc:'M14 7h28v42l-7-4-7 4-7-4-7 4zM21 17h14M21 25h14M21 33h10',query:'M36 36l12 12M40 24a15 15 0 1 1-30 0 15 15 0 0 1 30 0z',
    alert:'M27 7 50 46H4zM27 20v12m0 6v1'};
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 54 54" fill="none"><path d="${paths[name]}" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};
const mark='<img src="/mark.png" alt="" width="48" height="48"/>';
const brand=`<div class="brand">${mark}<span>Altraware<span class="brand-second"> Technology</span></span></div>`;
const kicker=(text)=>`<span class="kicker"><i></i>${text}</span>`;
const doc=(title,kind,body)=>`<!doctype html><html lang="sw"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title><link rel="stylesheet" href="/theme.css"/>${kind==='guide'?'<link rel="stylesheet" href="/guide.css"/>':''}</head><body class="${kind}">${body}</body></html>`;
const tile=(label,icon,title,text,tone='')=>`<div class="tile ${tone}"><div class="tile-top">${svg(icon)}<span>${label}</span></div><strong>${title}</strong><p>${text}</p></div>`;
const schematic=(label,body)=>`<div class="schematic"><div class="art-label">${kicker(label)}</div>${body}</div>`;
const note=text=>`<p class="side-note">${text}</p>`;
const statArt=()=>schematic('BANK OF TANZANIA / TAKWIMU ZA KITAIFA',`
  <div class="stats" aria-label="Wafanyabiashara wanaokubali malipo ya kidijitali, milioni 1.33 mwaka 2024 na milioni 2.79 mwaka 2025">
    <div class="stat-row"><div><span>2024</span><b>1.33 <small>milioni</small></b></div><div class="bar-track"><i style="width:${1.33/3*100}%"></i></div></div>
    <div class="stat-row"><div><span>2025</span><b>2.79 <small>milioni</small></b></div><div class="bar-track"><i style="width:${2.79/3*100}%"></i></div></div>
  </div>
  <div class="chart-axis"><span>0</span><span>3 milioni</span></div>
  <p class="source">BoT · National Payment Systems Annual Report 2025<br/>Executive Summary. Si matokeo ya programu yetu.</p>`);

const slides=[
  {tag:'PAYMENT CHECK / SWALI', h:['Ujumbe mara mbili.','Risiti ngapi?'], lead:'Uthibitisho wa muamala uleule ukifika tena, mfumo wako utafanya nini?', art:()=>schematic('MFANO WA MUAMALA',`
    <div class="hook-flow">
      <div class="hook-in"><div>${svg('inbox',38)}<span>UJUMBE 01<b>PAY-DEMO-01</b></span></div><div>${svg('loop',38)}<span>UJUMBE 02<b>PAY-DEMO-01</b></span></div></div>
      <svg viewBox="0 0 154 206" class="converge" aria-hidden="true"><path d="M0 49h43c26 0 29 54 58 54h39M0 157h43c26 0 29-54 58-54m23-14 17 14-17 14" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="94" cy="103" r="7" fill="#1b6c53"/></svg>
      <div class="hook-out">${svg('doc',55)}<b>?</b><span>RISITI</span></div>
    </div>${note('Marejeo ni yale yale. Hii si miamala miwili tofauti.')}`)},
  {tag:'01 / MUKTADHA WA TANZANIA', h:['Malipo ya','kidijitali.'], lead:'Wafanyabiashara wanaokubali malipo ya kidijitali nchini Tanzania.', art:statArt},
  {tag:'02 / HALI YA MUAMALA',h:['Ombi limefika.','Subiri uthibitisho.'],lead:'Ombi kupokelewa si sawa na malipo kuthibitishwa.',art:()=>schematic('MCHORO WA MFUMO',`
    <div class="duo">${tile('01 / OMBI','inbox','Limepokelewa','Hali: inasubiri. Risiti bado.','waiting')}${tile('02 / UTHIBITISHO','check','Imelipwa','Malipo yamethibitishwa na yanalingana na oda.','confirmed')}</div>
    ${note('Onyesha hali mbili tofauti kwenye app.')}`)},
  {tag:'03 / MUDA WA KUSUBIRI',h:['Muda umeisha.','Kagua kwanza.'],lead:'Jibu kuchelewa hakumaanishi malipo yameshindwa.',art:()=>schematic('UKAGUZI WA MUAMALA',`
    <div class="duo lookup">${tile('HALI HAIJAJULIKANA','clock','Inasubiri','Hifadhi kumbukumbu ya jaribio.','waiting')}${tile('HATUA INAYOFUATA','query','Angalia hali','Tumia marejeo ya muamala uliopo.','confirmed')}</div>
    ${note('Usianzishe malipo mengine kabla ya kufahamu hali ya yale ya kwanza.')}`)},
  {tag:'04 / MATOKEO YA JARIBIO',h:['Muamala mmoja.','Risiti moja.'],lead:'Tulituma uthibitisho uleule mara mbili kwenye mfano wa ndani.',art:()=>schematic('SIMULATION ILIYOPIMWA / PAY-DEMO-01',`
    <div class="counts" aria-label="Taarifa mbili, rekodi moja ya malipo, risiti moja">${[['Taarifa',results.repeat.confirmations],['Rekodi ya malipo',results.repeat.payments],['Risiti',results.repeat.receipts]].map(([l,n])=>`<div><b>${n}</b><span>${l}</span></div>`).join('')}</div>
    <div class="trace">${svg('check',37)}<b>RISITI-DEMO-01</b><span>ileile baada ya marudio</span></div>
    ${note('Mfano wa ndani. Hakuna malipo halisi.')}`)},
  {tag:'05 / KUMBUKUMBU ZILINGANE',h:['Kiasi hakilingani?','Usitoe risiti.'],lead:'Linganisha marejeo ya oda, kiasi na sarafu.',art:()=>schematic('DATA YA MFANO / SI MALIPO HALISI',`
    <div class="duo money">${tile('KIASI CHA ODA','doc',`TSh ${format(order.amount)}`,'Oda ya majaribio')}${tile('KIASI KILICHORIPOTIWA','alert',`TSh ${format(mismatch.amount)}`,'Haijalingana na oda.','waiting')}</div>
    <div class="trace review">${svg('query',35)}<b>KAGUA KWANZA</b><span>Risiti ${results.mismatch.receipts} kwenye simulation hii</span></div>` )},
  {tag:'06 / MWONGOZO WA KUTUMIA',h:['Comment',keyword],lead:'Nikutumie PDF ya majaribio matano ya malipo.',art:()=>`<div class="resource"><div class="paper-preview"><img src="/guide-cover.png" alt="Ukurasa wa kwanza wa PDF ya Ukaguzi wa Malipo"/></div><div class="resource-copy">${kicker('PDF / KISWAHILI')}<strong>Majaribio 5.<br/>Karatasi ya matokeo.</strong><p>Pima kwenye sandbox au kwa data ya mfano. Andika matokeo kabla ya kwenda live.</p></div></div>`},
];

export function slide(index){
  const s=slides[index];
  return doc(`${s.h.join(' ')} · Payment Check`,'carousel',`<article class="slide slide-${index+1}">
    <div class="ribbon" aria-hidden="true"></div>
    <header>${brand}<span class="collection">MAJARIBIO YA SOFTWARE <b>/ 05</b></span></header>
    <div class="title">${kicker(s.tag)}<h1><span>${s.h[0]}</span><em>${s.h[1]}</em></h1><p>${s.lead}</p></div>
    <section class="art">${s.art()}</section>
    <footer><div class="index-progress"><i style="width:${(index+1)/slides.length*100}%"></i></div><span>PAYMENT CHECK</span><span>0${index+1} / 0${slides.length}</span></footer>
  </article>`);
}

const tests=[
  ['01','Ombi limepokelewa','Anzisha oda ya mfano. Jibu la kwanza liseme ombi limepokelewa tu.','Inasubiri kuthibitishwa; rekodi 0 za malipo, risiti 0.','Picha ya hali na idadi ya rekodi.'],
  ['02','Jibu halijarudi','Igiza muda kuisha bila jibu. Kagua jaribio lililopo kwa marejeo yale yale, ukiiga jibu linalosubiri.','Bado inasubiri; rekodi 0, risiti 0. Hakuna ombi jipya la kutoza.', 'Marejeo yale yale kabla na baada ya ukaguzi.'],
  ['03','Uthibitisho unaolingana','Tumia jibu la mfano lililothibitishwa lenye oda, kiasi na sarafu zinazolingana.', 'Hali ya malipo imethibitishwa. Rekodi 1, risiti 1 inayohusishwa na oda.', 'Marejeo ya risiti na rekodi ya oda.'],
  ['04','Uthibitisho umerudiwa','Rudia uthibitisho wa muamala uleule mara ya pili. Usibadilishe marejeo yake.', 'Rekodi ya malipo inabaki 1. Risiti yake haibadiliki.', 'Pima idadi na marejeo baada ya kila taarifa.'],
  ['05','Kiasi hakilingani','Tumia oda mpya ya mfano. Leta taarifa yenye kiasi tofauti na kilicho kwenye oda.', 'Hali ya kukagua; risiti 0. Usikamilishe oda kiotomatiki.', 'Andika kiasi kilichotarajiwa, kilichoripotiwa na hali.'],
];
const row=(t)=>`<article class="test"><div class="case-num">${t[0]}</div><div><h3>${t[1]}</h3><p>${t[2]}</p><p class="pass"><b>Ipite ikiwa:</b> ${t[3]}</p><p class="record"><b>Hifadhi:</b> ${t[4]}</p></div></article>`;
const page=(n,tag,body)=>`<section class="sheet" aria-label="Ukurasa wa ${n}"><header>${brand}<span class="edition">PAYMENT CHECK / v1</span></header><main>${kicker(tag)}${body}</main><footer><span>MALIPO · ALTRAWARE TECHNOLOGY</span><span>0${n} / 03</span></footer></section>`;
export function guide(){
  return doc('Ukaguzi wa malipo · Majaribio 5 na karatasi ya matokeo','guide',
    page(1,'MWONGOZO WA MAJARIBIO / 18 NOV 2026',`
      <h1>Ukaguzi wa<br/><em>malipo.</em></h1>
      <p class="intro">Majaribio matano ya checkout au POS, na karatasi ya kurekodi matokeo kabla ya mfumo kuanza kutumika.</p>
      <div class="guide-rule"><div>${svg('inbox',36)}<span>Ombi limepokelewa</span></div><b>≠</b><div>${svg('check',36)}<span>Malipo yamethibitishwa</span></div></div>
      <h2>Anzia kwenye mazingira ya majaribio.</h2>
      <p>Tumia sandbox ya mtoa huduma au mfano wa ndani. Andaa oda moja ya TSh ${format(order.amount)} kwa data ya majaribio. Usitumie pesa, akaunti, PIN au taarifa za wateja halisi.</p>
      <div class="guide-proof"><span>MATOKEO YA MFANO WA NDANI</span><strong>Taarifa ${results.repeat.confirmations} → rekodi ${results.repeat.payments} → risiti ${results.repeat.receipts}</strong><p>Taarifa ileile ya ${paid.paymentRef} ilirudiwa. Huu si uthibitisho wa mfumo halisi au huduma ya malipo.</p></div>
      <h2>Uamuzi wa app</h2>
      <ul><li><b>Inasubiri:</b> jibu halijathibitisha malipo bado. Hakuna risiti ya malipo.</li><li><b>Imethibitishwa:</b> linganisha hali kutoka chanzo kilichothibitishwa, marejeo ya oda, kiasi na sarafu.</li><li><b>Inahitaji ukaguzi:</b> kiasi au marejeo yakitofautiana, usikamilishe oda kiotomatiki.</li></ul>
      <p class="guide-footnote">Hali za mtoa huduma zina maana tofauti; malipo kupokelewa si lazima fedha ziwe tayari kwenye akaunti ya biashara. Fuata docs halisi. Refund, reversal, mgawanyo wa malipo na risiti za kodi hazijapimwa hapa.</p>`)+
    page(2,'HATUA / MATOKEO YANAYOTARAJIWA',`
      <h1 class="compact">Majaribio <em>5.</em></h1>
      <p class="intro short">Tumia oda mpya kwa kila jaribio. Kwa jaribio 04, tuma taarifa ileile mara mbili kwa oda hiyo. Andika hali, idadi ya rekodi na risiti.</p>
      <div class="tests">${tests.map(row).join('')}</div>
      <p class="guide-footnote">Katika mfumo halisi, linda uundaji wa rekodi na risiti dhidi ya taarifa zinazofika kwa wakati mmoja. Simulation hii imepima mlolongo mmoja tu, si concurrency au uendelevu baada ya restart.</p>`)+
    page(3,'KARATASI YA KUCHAPISHA',`
      <h1 class="compact">Rekodi <em>matokeo.</em></h1>
      <p class="intro short">Andika data ya mfano tu. Ukiwa na hitilafu, rekebisha na urudie jaribio lile lile kabla ya kwenda live.</p>
      <div class="fields"><div>TOLEO / BUILD</div><div>TAREHE</div><div>MAZINGIRA YA MAJARIBIO</div><div>MKAGUZI</div></div>
      <table><thead><tr><th scope="col">Jaribio</th><th scope="col">Hali, rekodi na risiti</th><th scope="col">Pita / Rudia</th></tr></thead><tbody>
      ${tests.map(t=>`<tr><th scope="row">${t[0]} · ${t[1]}</th><td></td><td></td></tr>`).join('')}
      </tbody></table>
      <p class="worksheet-example">Mfano wa kujaza: Imethibitishwa · rekodi 1 · risiti 1 (RISITI-DEMO-01).</p>
      <div class="notes"><b>Hitilafu / hatua inayofuata</b><div></div><div></div></div>
      <div class="release"><b>Usiende live</b> kama hali isiyojulikana inatoa risiti, kiasi hakilingani, au taarifa ileile inaongeza rekodi. Rudia kwenye sandbox ya mtoa huduma pia.</div>
      <div class="refs"><b>Vyanzo</b><p><a href="${links.bot}">Bank of Tanzania · NPS Annual Report 2025, Executive Summary</a> — Milioni 1.33 (2024) hadi milioni 2.79 (2025), wafanyabiashara wanaokubali malipo ya kidijitali.</p>
      <p><a href="${links.provider}">ClickPesa · Payment Statuses</a> — mfano wa maelezo ya hali za mtoa huduma; si tangazo la bidhaa. Vyanzo vilihakikiwa 18 Novemba 2026.</p></div>`));
}
