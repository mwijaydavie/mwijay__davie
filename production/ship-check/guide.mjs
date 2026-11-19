export const keyword = 'TEST';
export const survey = 'https://survey.stackoverflow.co/2026/ai/data/ai-work-next';
export const header = (tag, index) => `<header class="mast"><span class="brand"><img src="/mark.png" alt="">Altraware Technology</span><span class="edition mono">${tag}${index ? ` / ${index}` : ''}</span></header>`;
const copy = {
  sw: {
    intro: 'Test 7 kabla ya<br>kumpa client app.',
    blurb: 'Checklist ya kujaribu kilichotokea kwenye app, si ujumbe unaoonekana kwenye screen pekee.',
    start: ['Anza kwenye test environment', 'Chagua kazi moja muhimu (mfano: kuhifadhi note). Tumia data ya mfano na build inayolingana na ile utakayompa client. Usiutumie mwongozo huu kujaribu malipo au data halisi.'],
    prompt: ['Prompt ya kupanga test', '“Kwa flow [weka flow], andika setup, hatua, matokeo yanayotarajiwa na ushahidi wa kukusanya kwa save/refresh, kukatika kwa net na retry. Weka NOT RUN kwa test ambayo haijafanywa.”'],
    second: 'Kagua zaidi,<br>kisha amua.',
    secondBlurb: 'Tumia checks hizi zinazohusika na flow yako. Kama check haitumiki, andika sababu ya N/A.',
    labels: ['Jaribu', 'PASS ikiwa'],
    tests: [
      ['Save na refresh', 'Weka rekodi ya mfano QA-01, bonyeza Save, kisha refresh kwenye browser hiyohiyo.', 'Rekodi moja yenye data ileile inaonekana. Local save haimaanishi data imesync.'],
      ['Kata net, kisha rudisha', 'Kwenye staging, kata net hatua ya kutuma data ikiendelea. Angalia status; rudisha net, kisha fuata njia ya retry iliyo kwenye app.', 'Inasema offline au pending inapohusika. “Synced” inaonekana baada ya uthibitisho; hakuna rekodi ya ziada.'],
      ['Bonyeza mara mbili', 'Kwa data mpya ya mfano, bonyeza Submit mara mbili kwa haraka. Refresh kisha angalia rekodi zilizohifadhiwa.', 'Ombi moja tu limerekodiwa. Tumia simulator ikiwa flow ina malipo.'],
      ['Weka input batili', 'Acha field inayohitajika tupu au weka kiasi nje ya kiwango kinachoruhusiwa.', 'Hakuna rekodi batili iliyohifadhiwa. Error inaonyesha field na jinsi ya kuisahihisha.'],
      ['Hakiki roles', 'Kwenye staging, tumia akaunti za mfano za owner na viewer kwenye flow ileile. Fuata njia za kawaida za app.', 'Owner anaweza kufanya kazi iliyoruhusiwa. Viewer hawezi kuona au kubadilisha rekodi iliyozuiwa; ruhusa zihakikiwe upande wa server pia.'],
      ['Jaribu kwenye skrini ndogo', 'Tumia simu, au viewport yenye upana wa 360 px. Jaza form, fungua keyboard, kisha jaribu error moja.', 'Unaweza kusoma label na error, na kufikia kitufe bila kuscroll kwa upande.'],
      ['Rudia baada ya error', 'Tumia simulator ya staging kurudisha error kwenye hatua muhimu. Rudisha huduma, kisha jaribu tena kama mtumiaji.', 'Hakuna ujumbe wa mafanikio wa uongo. Input inabaki au app inaelekeza cha kufanya; retry haileti rekodi mbili.'],
    ],
    receipt: ['Mfano wa ushahidi · Save Check local lab', 'Expected: QA-01 ibaki baada ya refresh. Build A: note 0 → FAIL. Build B: note 1 → PASS kwa test hii pekee. Hii ni test ya browser moja, si uthibitisho wa cloud sync.'],
    gate: ['GO au HOLD?', 'Kama flow muhimu imefeli, HOLD. Andika kilichotokea, mpe mtu wa kurekebisha, kisha rudia test kabla ya ku-release. PASS hapa si hakikisho kuwa app haina bugs.'],
    log: 'Rekodi ya release',
    logBlurb: 'Print ukurasa huu au annotati PDF. Andika PASS / FAIL / N/A pamoja na ushahidi (picha, test run au ID ya rekodi ya mfano).',
    fields: ['App / build', 'Tarehe', 'Environment', 'Flow ninayotest', 'Device / browser', 'Aliyekagua'],
    columns: ['Check', 'PASS', 'FAIL', 'N/A', 'Ushahidi / sababu'],
    hold: 'Uamuzi:    □ GO     □ HOLD',
    logFields: ['Kasoro iliyobaki / hatua inayofuata', 'Mhusika / tarehe ya retest'],
    foot: 'TEST DATA TU · MWONGOZO WA ALTRAWARE',
    source: 'Muktadha: Stack Overflow Developer Survey 2026, AIWorkNext, ODbL 1.0. Checklist ni ya Altraware.',
  },
  en: {
    intro: '7 checks before you<br>hand off an app.',
    blurb: 'A practical release checklist for testing what the app actually did, not just what the screen says.',
    start: ['Start in a test environment', 'Pick a critical flow, such as saving a note. Use dummy records and a build that matches the one you plan to hand off. Don’t run these checks against real payments or customer data.'],
    prompt: ['Reusable test-planning prompt', '“For [flow], list setup, steps, expected results, and evidence to collect for save/reload, a lost connection, and retry. Mark any unexecuted test NOT RUN.”'],
    second: 'Finish the checks.<br>Make the call.',
    secondBlurb: 'Use the tests that apply to your workflow. For anything not applicable, record why.',
    labels: ['Try this', 'Passes when'],
    tests: [
      ['Save and reload', 'Save the dummy record QA-01, then reload in the same browser.', 'Exactly one record with the same data appears. A local save does not prove cloud sync.'],
      ['Disconnect and reconnect', 'Interrupt the network during a staging submission. Check the status, reconnect, and follow the app’s normal retry path.', 'Offline or pending appears as appropriate. “Synced” waits for confirmation, with no extra record.'],
      ['Submit twice', 'With fresh dummy data, tap Submit twice quickly. Reload and inspect the saved records.', 'Only one request was recorded. Use a simulator for any payment flow.'],
      ['Enter invalid input', 'Leave a required field empty or enter a number outside the allowed range.', 'No invalid record is written. The error identifies the field and shows how to fix it.'],
      ['Check roles', 'Use staging owner and viewer test accounts on the same flow through the app’s normal interface.', 'The owner can perform the authorized action. The viewer can’t see or change restricted records; authorization must also be enforced on the server.'],
      ['Use a small screen', 'On a phone or a 360 px-wide viewport, fill in the form, open the keyboard, and trigger one error.', 'Labels, errors, and the button are reachable without sideways scrolling.'],
      ['Recover from an error', 'Use a staging simulator to return an error during a critical step. Restore the service and retry like a user.', 'No false success. Input is kept or recovery is clear. A retry doesn’t create a duplicate record.'],
    ],
    receipt: ['Worked receipt · Save Check local lab', 'Expected: QA-01 stays after reload. Build A: 0 notes → FAIL. Build B: 1 note → PASS on this check only. This is a same-browser test, not cloud-sync proof.'],
    gate: ['GO or HOLD?', 'If a critical flow fails, HOLD. Record what happened, assign a fix owner, and retest before release. Passing these checks does not guarantee a bug-free app.'],
    log: 'Release test log',
    logBlurb: 'Print this page or annotate the PDF. Record PASS / FAIL / N/A and evidence: a screenshot, test run, or dummy record ID.',
    fields: ['App / build', 'Test date', 'Environment', 'Flow under test', 'Device / browser', 'Reviewer'],
    columns: ['Check', 'PASS', 'FAIL', 'N/A', 'Evidence / reason'],
    hold: 'Decision:    □ GO     □ HOLD',
    logFields: ['Open issue / next action', 'Owner / retest date'],
    foot: 'TEST DATA ONLY · GUIDE BY ALTRAWARE',
    source: 'Context: Stack Overflow Developer Survey 2026, AIWorkNext, ODbL 1.0. Checklist by Altraware.',
  },
};

const check = (test, index, labels) => `
  <article class="check-card">
    <div class="check-id mono">${String(index + 1).padStart(2, '0')}</div>
    <div><h2>${test[0]}</h2><p><b>${labels[0]}:</b> ${test[1]}</p><p><b>${labels[1]}:</b> ${test[2]}</p></div>
  </article>`;

export function guide(lang) {
  const c = copy[lang];
  const foot = page => `<footer class="print-foot mono"><span>${c.foot}</span><span>${page} / 03</span></footer>`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>Ship Check · ${lang === 'sw' ? 'Test 7 za app' : 'Seven app release checks'}</title>
  <link rel="stylesheet" href="/theme.css"><link rel="stylesheet" href="/guide.css"></head><body>
  <section class="sheet">
    ${header('SHIP CHECK 07', lang.toUpperCase())}
    <div class="guide-head"><div class="guide-no mono">01–04</div><h1>${c.intro}</h1><p>${c.blurb}</p></div>
    <aside class="box"><b>${c.start[0]}</b><p>${c.start[1]}</p></aside>
    <div class="checks">${c.tests.slice(0,4).map((t,i)=>check(t,i,c.labels)).join('')}</div>
    <aside class="box prompt"><b>${c.prompt[0]}</b><p>${c.prompt[1]}</p></aside>
    ${foot('01')}
  </section>
  <section class="sheet">
    ${header('SHIP CHECK 07', lang.toUpperCase())}
    <div class="guide-head narrow"><div class="guide-no mono">05–07</div><h1>${c.second}</h1><p>${c.secondBlurb}</p></div>
    <div class="checks">${c.tests.slice(4).map((t,i)=>check(t,i+4,c.labels)).join('')}</div>
    <aside class="box receipt"><b>${c.receipt[0]}</b><p>${c.receipt[1]}</p></aside>
    <aside class="box gate"><b>${c.gate[0]}</b><p>${c.gate[1]}</p></aside>
    <p class="guide-source"><a href="${survey}">${c.source}</a></p>
    ${foot('02')}
  </section>
  <section class="sheet">
    ${header('SHIP CHECK 07', lang.toUpperCase())}
    <div class="log-head"><span class="guide-no mono">WORKSHEET</span><h1>${c.log}</h1><p>${c.logBlurb}</p></div>
    <section class="log-fields" aria-label="Build details">${c.fields.map(x=>`<div>${x}<span></span></div>`).join('')}</section>
    <table aria-label="Test results"><thead><tr>${c.columns.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead>
      <tbody>${c.tests.map((t,i)=>`<tr><th scope="row"><samp>0${i+1}</samp> ${t[0]}</th><td><i></i></td><td><i></i></td><td><i></i></td><td class="evidence"></td></tr>`).join('')}</tbody>
    </table>
    <aside class="decision"><b>${c.hold}</b>${c.logFields.map(x=>`<div>${x}<span></span></div>`).join('')}</aside>
    ${foot('03')}
  </section></body></html>`;
}
