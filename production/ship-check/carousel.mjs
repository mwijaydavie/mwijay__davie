import {header, keyword} from './guide.mjs';

const refresh = `<svg viewBox="0 0 400 400" class="reload-figure" aria-hidden="true" fill="none">
  <circle cx="200" cy="200" r="177" stroke="#706c98" stroke-width="1.4" stroke-dasharray="4 12"/>
  <circle cx="200" cy="200" r="143" stroke="#b8a5ff" stroke-opacity=".4" stroke-width="1.5"/>
  <path d="M104 164a103 103 0 1 1-1 68" stroke="#b8a5ff" stroke-width="17" stroke-linecap="round"/>
  <path d="m77 130 22 47 50-18" stroke="#b8a5ff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M190 182c0-13 10-23 25-23 14 0 24 8 24 21 0 12-7 18-14 23-7 5-11 9-11 20" stroke="#d9fd92" stroke-width="11" stroke-linecap="round"/>
  <circle cx="214" cy="245" r="6.5" fill="#d9fd92"/>
  <path d="M200 6v13m0 362v13m181-194h13M6 200h13" stroke="#b8a5ff" stroke-width="2"/>
</svg>`;
const wifi = `<svg class="wifi" viewBox="0 0 240 210" aria-hidden="true" fill="none"><path d="M19 66c55-57 147-57 202 0M49 97a101 101 0 0 1 142 0M80 129a57 57 0 0 1 80 0" stroke="#b8a5ff" stroke-width="12" stroke-linecap="round"/><circle cx="120" cy="164" r="9" fill="#b8a5ff"/><path d="M42 191 200 25" stroke="#1d2140" stroke-width="25" stroke-linecap="round"/><path d="M42 191 200 25" stroke="#d9fd92" stroke-width="10" stroke-linecap="round"/></svg>`;
const arrow = `<svg width="40" height="24" viewBox="0 0 40 24" fill="none" aria-hidden="true"><path d="M2 12h34m-9-9 9 9-9 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const icon = {
  add: 'M24 8v32m-16-16h32M7 7h34v34H7z',
  reload: 'M8 19a17 17 0 1 1 1 14M7 9l1 12 12-1',
  find: 'M31 28l10 12M33 20a13 13 0 1 0-26 0 13 13 0 0 0 26 0Z',
};
const stepIcon = key => `<svg width="52" height="52" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="${icon[key]}" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const kicker = text => `<div class="kicker mono"><span></span>${text}</div>`;
const title = (top, bottom) => `<h1>${top}<br><em>${bottom}</em></h1>`;
export const slideFiles = [
  '01-Saved-Ukirefresh-je', '02-Ushahidi-wa-browser', '03-Run-it-locally',
  '04-Save-na-refresh', '05-Kata-net', '06-Bonyeza-mara-mbili', '07-Comment-TEST',
];

const slides = [
  {theme:'night', label:'VIBE CODING · WITH RECEIPTS', html:`
    <div class="lead">${title('App inasema','“Saved”.')}<p class="hook-question">Ukirefresh, note ipo?</p></div>
    <div class="visual hook-art">
      <div class="demo-toast"><div class="demo-bar mono"><i></i><i></i><i></i> <span>LOCAL SAVE LAB</span></div><div class="demo-note mono">REKODI YA MFANO</div><strong>Note QA-01</strong><span class="save-badge mono">✓ &nbsp;Saved</span></div>
      ${refresh}<span class="hook-tag mono">UJUMBE ≠ USHAHIDI</span>
    </div>`},
  {theme:'night',label:'USHAHIDI · BROWSER TEST',html:`
    <div class="lead">${title('Toast sawa.','Matokeo tofauti.')}<p>Zote ziliandika “Saved”. Hii ndiyo hali baada ya refresh.</p></div>
    <div class="visual proof-pairs">
      <div><div class="proof-label mono"><span>BUILD A</span><b>FAIL</b></div><img src="/proof/A.png" alt="Build A: zero saved notes after reload"><p>Note haikubaki.</p></div>
      <div><div class="proof-label mono good"><span>BUILD B</span><b>PASS</b></div><img src="/proof/B.png" alt="Build B: one saved note, QA-01, after reload"><p>QA-01 ilibaki.</p></div>
      <span class="proof-tag mono">PICHA ZA LOCAL LAB · DATA YA MFANO</span>
    </div>
    <p class="proof-note"><b>A</b> iliweka note kwenye memory tu. <b>B</b> ilihifadhi note kwenye storage ya browser.</p>`},
  {theme:'light',label:'SIGNAL · DEVELOPER SURVEY 2026',html:`
    <div class="lead">${title('Usiisome tu.','I-run.')}</div>
    <div class="visual data-card"><div class="data-top mono"><span>AIWORKNEXT / 2026</span><span>n = 13,162</span></div>
      <div class="data-number mono">76.5<span>%</span></div>
      <div class="gauge"><i></i></div>
      <p>Walichagua <b>“Run it locally”</b> walipoulizwa wanachofanya kabla ya kutumia jibu la AI kwa kazi ya development.</p>
    </div>
    <p class="source-line"><b>Stack Overflow Developer Survey 2026 · AIWorkNext.</b><br>Swali la hiari, majibu mengi · ODbL 1.0. Si sampuli ya Tanzania.</p>`},
  {theme:'light',label:'TEST 01 · PERSISTENCE',html:`
    <div class="lead">${title('Save. Refresh.','Tafuta rekodi.')}<p>Usiamini toast pekee. Hakiki rekodi kwenye browser hiyohiyo.</p></div>
    <div class="visual save-flow">
      <div class="steps">${[['add','SAVE','Weka QA-01'],['reload','REFRESH','Pakia tena'],['find','HAKIKI','Tafuta QA-01']].map(([i,l,t],n)=>`<div>${stepIcon(i)}<span class="mono">0${n+1} / ${l}</span><strong>${t}</strong></div>`).join('')}</div>
      <div class="pass-banner"><strong>✓ PASS</strong> Rekodi moja, data ileile.</div>
      <div class="light-note">Local save si uthibitisho wa cloud sync.</div>
    </div>`},
  {theme:'night',label:'TEST 02 · NETWORK',html:`
    <div class="lead">${title('Kata net','katikati.')}<p>Kwenye staging, kata net wakati app inatuma data. Rudisha net, kisha fuata njia ya retry.</p></div>
    <div class="visual network-art">
      <div class="network-banner">${wifi}<p><span class="mono">USICHANGANYE</span><strong>Pending<br>na Synced.</strong></p></div>
      <div class="network-states mono"><b>Inasubiri</b>${arrow}<b class="verified">Synced</b></div>
      <p class="net-note">“Synced” ionekane baada ya kuthibitishwa.</p>
    </div>`},
  {theme:'light',label:'TEST 03 · RETRY',html:`
    <div class="lead">${title('Bonyeza','mara mbili.')}<p>Kwenye staging, bonyeza Submit mara mbili kisha hakiki kilichoandikwa.</p></div>
    <div class="visual retry-art">
      <div class="tap-stack"><div class="tap mono"><b>01</b> Submit</div><div class="tap mono"><b>02</b> Submit</div></div>
      ${arrow}
      <div class="count-tile"><span class="mono">MATOKEO YA PASS</span><strong class="mono">01</strong><p>rekodi, si mbili.</p></div>
    </div>
    <p class="light-note retry-note">Tumia data ya mfano. Kwa malipo, tumia simulator.</p>`},
  {theme:'night',label:'ZAWADI · SHIP CHECK PDF',html:`
    <div class="lead cta"><h1>Comment<br><em>${keyword}</em></h1><p>Nikutumie checklist kabla ya kumpa client app.</p></div>
    <div class="visual offer-art">
      <div class="offer-copy"><span class="mono">NDANI YA PDF</span><ul><li>Test 7 za app</li><li>PASS inaonekanaje</li><li>Release test log</li></ul><span class="mono offer-language">KISWAHILI / ENGLISH</span></div>
      <img src="/proof/guide-cover.png" alt="Preview of the first page of the Ship Check PDF">
    </div>`},
];

function deckSlide(slide, index) {
  const num = String(index+1).padStart(2,'0');
  return `<section class="deck ${slide.theme} slide-${index+1}">
  <div class="top-grid" aria-hidden="true"></div>
  ${header('BUILD NOTES', '02')}
  ${kicker(slide.label)}${slide.html}
  <footer class="deck-foot mono"><span>SHIP CHECK · APP QA</span><div aria-hidden="true" class="progress">${slides.map((_,i)=>`<i${i<=index?' class="reached"':''}></i>`).join('')}</div><span>${num} / 07</span></footer>
  </section>`;
}

export function carousel(index) {
  const selected = index === undefined ? slides.map(deckSlide).join('') : deckSlide(slides[index],index);
  return `<!doctype html><html lang="sw"><head><meta charset="utf-8"><title>Ship Check · carousel</title>
<link rel="stylesheet" href="/theme.css"><link rel="stylesheet" href="/carousel.css"></head><body>${selected}</body></html>`;
}
