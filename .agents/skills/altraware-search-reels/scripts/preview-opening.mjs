// Standalone frame storyboard, not a search engine or a copy of a third-party UI.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {searchAt,validateOpening} from './search-opening.mjs';
const [number='316',file='opening.svg',planPath]=process.argv.slice(2);
assert(/\.svg$/i.test(file),'Write an SVG path');
const plan=validateOpening(JSON.parse(await readFile(planPath||new URL('../examples/opening.plan.json',import.meta.url),'utf8')));
const f=Number(number);
assert(Number.isInteger(f)&&f>=0&&f<plan.beats.end,'Choose a frame inside the opening');
const s=searchAt(plan,f),open=s.phase==='open';
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const t=plan.label==='SEARCH DEMO'?{
 type:'Type a question…',link:'DEMO LINK',result:'Open the demo page ↗',waiting:'SEARCHING · SIMULATION',title:'A customer searches.',
 openTag:'DEMO PAGE',mockTag:'SIMULATED SEARCH',opened:'The page opens.',next:'What do they find?',notice:'Not an actual AI response.',
}:{
 type:'Andika swali…',link:'LINK YA MFANO',result:'Fungua page ya mfano ↗',waiting:'INATAFUTA · SIMULATION',title:'Mteja anatafuta.',
 openTag:'PAGE YA MFANO',mockTag:'UI YA MFANO · SI LIVE',opened:'Page imefunguka.',next:'Sasa mteja anakuta nini?',notice:'Si jibu halisi la AI.',
};
const query=s.query||t.type;
const font=Math.min(26,Math.floor(690/Array.from(query).length));
const marker=s.pressed?'#925942':'#4b356f';
const answer=s.canShowResult?`<rect x="48" y="257" width="444" height="113" rx="10" fill="${s.phase==='result'?'#f2e6ff':'#fff2d7'}" stroke="#8d70ac"/><text x="62" y="287" font-size="16" fill="#604482">${esc(s.domain)} · ${t.link}</text><text x="62" y="326" font-size="25" font-weight="750">${t.result}</text>`:s.phase==='waiting'?`<text x="54" y="290" font-size="18">${t.waiting}</text>`:'';
const pointer=['hover','click'].includes(s.phase)?`<path d="M420 315 l31 26 -15 2 5 11 -8 3 -6 -11 -8 7 Z" fill="${marker}" stroke="white" stroke-width="3"/>`:'';
const entered=`<rect x="48" y="181" width="444" height="54" rx="8" fill="#f7f0ff" stroke="#997abe"/><text x="62" y="215" font-size="${font}" font-weight="650">${esc(query)}</text>${answer}${pointer}`;
await writeFile(file,`<svg xmlns="http://www.w3.org/2000/svg" width="540" height="485" viewBox="0 0 540 485" role="img" aria-label="Search opening storyboard, frame ${f}">
<rect width="540" height="485" fill="#fcf5e9"/>
<g font-family="system-ui,sans-serif" fill="#2b203f"><text x="28" y="37" font-size="16" font-weight="800" fill="#683e92">${esc(s.label)} / FRAME ${f}</text>
<text x="28" y="81" font-size="39" font-weight="800">${t.title}</text>
<rect x="28" y="106" width="484" height="314" rx="15" fill="#fffdfa" stroke="#a68cbc" stroke-width="2"/>
<rect x="28" y="106" width="484" height="51" rx="14" fill="#49337c"/><text x="48" y="139" fill="#fffaf0" font-size="18" font-weight="700">${open?esc(s.domain)+' · '+t.openTag:t.mockTag}</text>
${open?`<text x="48" y="224" font-size="40" font-weight="800">${t.opened}</text><text x="48" y="271" font-size="19">${t.next}</text>`:entered}
<text x="48" y="401" font-size="15" fill="#5b4569">${t.notice}</text>
<text x="28" y="457" font-size="15" font-weight="650">${esc(s.phase.toUpperCase())} · SEEKABLE STORYBOARD</text></g></svg>\n`);
console.log(`${file}: frame ${f}, ${s.phase}`);
