import assert from 'node:assert/strict';

export const links={
  video:'https://www.youtube.com/watch?v=R12RLqs14fY',
  studio:'https://altra.tanzaniareach.com/contact',
  geminiRegion:'https://aistudio.google.com/docs/available-regions',
  geminiTerms:'https://aistudio.google.com/docs/terms',
  claudeRegion:'https://platform.claude.com/docs/en/api/supported-regions',
  qwenModels:'https://www.alibabacloud.com/help/en/model-studio/models',
  router:'https://openrouter.ai/docs/guides/routing/routers/free-router',
  routerPrivacy:'https://openrouter.ai/docs/guides/privacy/data-collection',
  routerModels:'https://openrouter.ai/models?pricing=free',
  harborModel:'https://tokenharbor.ai/models/deepseek-v4.1-flash:free',
  qwenLocal:'https://ollama.com/library/qwen2.5-coder:1.5b',
};
const h=s=>s.replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[k]);
const a=(url,txt,cls='')=>`<a ${cls?`class="${cls}"`:''} href="${h(url)}">${h(txt)}</a>`;
const resource=(key,txt)=>a(links[key],txt);
export const req=String.raw`curl -sS -i --max-time 20 \
  https://openrouter.ai/api/v1/responses \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"openrouter/free",
       "input":"Reply with just OK."}'`;

export function guide({lang,css,fonts,art,logos,routes,demo}){
 assert(['sw','en'].includes(lang));assert.equal(routes.length,16);assert.equal(new Set(routes.map(r=>r.key)).size,16);
 assert.deepEqual([demo.first.status,demo.limited.status,demo.recovered.status],[200,429,200]);
 const en=lang==='en'; const t=(sw,eng)=>en?eng:sw;
 const locale=t('SWANGLISH','ENGLISH');
 const kinds={metered:'METERED',selected:'SELECTED FREE',trial:'TRIAL / QUOTA',client:'CLIENT ONLY',user:'USER-PAYS',local:'LOCAL'};
 const page=(i,kicker,title,body,cls='')=>`<section class="sheet ${cls}" id="p${i}" aria-labelledby="h${i}"><div class="folio"><b>ALTRAWARE / TECH TIP</b><span>${kicker} · ${locale}</span></div><div class="body">${i===1?`<h1 id="h${i}">${title}</h1>`:`<h2 id="h${i}">${title}</h2>`}${body}</div><div class="foot"><span>AI MODEL PROVIDERS &nbsp;/&nbsp; 18 NOV 2026</span><b>${String(i).padStart(2,'0')} / 07</b></div></section>`;
 const blurb=text=>`<p class="intro">${text}</p>`;
 const note=text=>`<p class="note">${text}</p>`;
 const routePage=(i,title,intro,first,extra='')=>page(i,'ROUTE MAP',title,blurb(intro)+`<ol class="routes" start="${first+1}">${routes.slice(first,first+4).map((r,j)=>`<li>
  <span class="route-no" aria-hidden="true">${String(first+j+1).padStart(2,'0')}</span>
  <div class="route-main"><div class="route-name">${logos[r.key]?`<img src="${logos[r.key]}" alt="">`:''}<h3>${h(r.name)}</h3></div>
  <p>${h(r[lang])}</p><div class="route-foot"><span class="tag ${r.kind}">${kinds[r.kind]}</span>${a(r.url,`${r.label} ↗`,'route-link')}</div></div></li>`).join('')}</ol>`+extra);
 return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Free AI API? · Altraware Tech Tip · ${locale}</title><meta name="author" content="Altraware Technology / Mwijay Davie"><style>${fonts}\n${css}</style></head><body><main>
 ${page(1,'FIELD GUIDE','Free AI API?<br><em>Unlimited?</em>',`
  <p class="subtitle">${t('Usiangalie key tu. Angalia usage.','Look past the key. Check the usage.')}</p>
  <div class="cover-photo" style="background-image:linear-gradient(0deg,#121528bb,transparent 60%),url('${art.key}')"><div><b>16</b><span>${t('ROUTES ZA KUCHAGUA','ROUTES TO COMPARE')}</span></div><div class="cover-logos">${['deepseek','anthropic','zai','qwen'].map(k=>`<span><img src="${logos[k]}" alt="${({deepseek:'DeepSeek',anthropic:'Claude',zai:'Z.AI',qwen:'Qwen'})[k]}"></span>`).join('')}</div></div>
  ${blurb(t('API key ni credential. Bill inategemea <strong>model ID, provider na plan</strong>. Guide hii ni ya kuchagua route moja ya build, si ahadi ya keys za bure bila limit.','An API key is a credential. The bill depends on <strong>the model ID, provider and plan</strong>. This guide helps you pick one route, not find unlimited free keys.'))}
  <nav aria-label="${t('Yaliyomo','Contents')}">${[[2,t('Direct APIs','Direct APIs')],[3,t('Hosted','Hosted')],[4,t('Dev / gateways','Dev / gateways')],[5,t('Local / tools','Local / tools')],[6,'Quickstart'],[7,'Checklist']].map(([i,l])=>`<a href="#p${i}"><b>0${i}</b> ${l}</a>`).join('')}</nav>
  <p class="cover-note">${t('Docs zimekaguliwa 18 Nov 2026. Offers hubadilika. Hatukufungua account, kutoa keys halisi au kupima live inference.','Docs checked 18 Nov 2026. Offers change. We did not create accounts, issue real keys or benchmark live inference.')}</p>`, 'cover')}
 ${routePage(2,t('Majina unayosikia','The names you hear'),t('Model ni injini. Provider ndiyo ina-host na kubill. Tool kama OpenCode ndiyo client. Jina la model halikuambii bei ya endpoint.','A model does the work. A provider hosts and bills it. A tool such as OpenCode is the client. The model name does not tell you the endpoint price.'),0,
 note(`${t('Kwa Tanzania: docs zinaorodhesha nchi hii kwa','For Tanzania: official supported-region lists include it for')} ${resource('geminiRegion','Gemini API')} ${t('na','and')} ${resource('claudeRegion','Claude API')}. ${t('Hiyo si guarantee ya credits au verification.','That does not guarantee credits or verification.')}`))}
 ${routePage(3,t('Hosted: anza hapa','Hosted: start here'),t('Prototype yenye dummy data? Chagua free model moja iliyo kwenye docs. Soma quota na privacy kabla ya ku-copy base URL.','Prototyping with dummy data? Choose one documented free model. Check quotas and privacy before copying a base URL.'),4,
 note(`${resource('routerModels','OpenRouter model list')} · ${resource('geminiTerms','Gemini data terms')} · ${resource('routerPrivacy','OpenRouter data policy')}`))}
 ${routePage(4,t('Compute na gateways','Compute and gateways'),t('Trial, daily cap na weekly allowance si vitu sawa. Offer ya gateway haitoi credit kwenye official API ya mtengenezaji.','Trials, daily caps and weekly allowances are not interchangeable. A gateway offer does not add credit to the model maker’s official API.'),8,
 note(`${t('Mfano wa exact ID (gateway tofauti):','Example of an exact ID on a separate gateway:')} ${resource('harborModel','Token Harbor · deepseek-v4.1-flash:free')}.`))}
 ${routePage(5,t('Client, SDK au local','Client, SDK or local'),t('Usichanganye free model ndani ya coding tool, user-funded SDK na local inference. Hakuna inayomaanisha Claude API key ya bure.','Do not confuse a free model in a coding tool with a user-funded SDK or local inference. None implies a free Claude API key.'),12,
 note(`${t('Self-host si zero cost: unalipia hardware, storage, power na maintenance. Test license ya variant kabla ya commercial use.','Self-hosting is not zero cost: hardware, storage, power and maintenance still count. Check the exact variant license before commercial use.')}`))}
 ${page(6,'HAND TEST',t('Request moja kwanza','One request first'),`
  ${blurb(t('Usi-copy key kutoka video, group au broker. Tengeneza yako kwenye official dashboard. Ihifadhi kwenye env/secret manager upande wa server; isiingie kwenye browser bundle au Git.','Do not copy a key from a video, group or broker. Create your own in the official dashboard. Store it in a server-side environment or secret manager, never in the browser bundle or Git.'))}
  <div class="code-box"><b>A / OPENROUTER · DUMMY TEST</b><pre>${h(req)}</pre></div>
  <p class="explain">${t('Setup ya mfano kutoka','Example based on')} ${resource('router','Free Models Router docs')}. ${t('Inachagua free model inayopatikana; si Claude guarantee. Rekodi response.model. Kwa comparison tumia exact ID ya :free iliyo live. Usiwashe paid plugins au fallback bila budget.','It chooses an available free model; it does not promise Claude. Record response.model. For comparison, pin a currently listed :free ID. Leave paid plugins and fallback off unless budgeted.')}</p>
  <div class="code-box light"><b>B / OLLAMA · LOCAL VARIANT</b><pre>ollama run qwen2.5-coder:1.5b</pre></div>
  <p class="explain">${t('Example ndogo ya','A small example from')} ${resource('qwenLocal','Ollama’s Qwen library')}. ${t('Baada ya download, model ina-run kwenye machine inayoiweza. Usiexpose local service bila access controls. Hosted Qwen? Angalia','After downloading the weights, the model runs on a suitable machine. Do not expose the local service without access controls. For hosted Qwen, see')} ${resource('qwenModels','Model Studio docs')}.</p>
  <aside class="warn"><b>${t('Scope ya test','Test scope')}</b><p>${t('Hizi ni docs-based examples. Hakuna live key iliyotumika; tumia dummy prompt na confirm bei kwenye account yako.','These are docs-based examples. No live key was used; send a dummy prompt and verify your account’s pricing.')}</p></aside>`)}
 ${page(7,'SHIP CHECK',t('Pima kabla ya ku-ship','Test before you ship'),`
  <div class="demo-box"><b>${t('MOCK YA NDANI · SIO PROVIDER TEST','LOCAL MOCK · NOT A PROVIDER TEST')}</b><code>${demo.first.status} → ${demo.limited.status} → WAIT ${demo.policy.after}s → ${demo.recovered.status}</code><p>${t('Tume-simulate short burst. Hakuna request nyingine wakati wa kusubiri. Quota ya siku ikiisha, simamisha; usi-retry bila mwisho.','We simulated a short burst limit. No request was sent during the wait. For an exhausted daily quota, stop; do not retry forever.')}</p></div>
  <ol class="checks">
    <li><b>${t('Pin model ID + plan','Pin the model ID + plan')}</b> ${t('Andika base URL, cap (RPM/TPM/daily), reset na nani analipa.','Record the base URL, caps (RPM/TPM/daily), reset and payer.')}</li>
    <li><b>${t('Tumia input 10 za mfano','Use 10 dummy inputs')}</b> ${t('Pima valid output, latency na USD/task. No customer data, keys au private repo.','Measure valid outputs, latency and USD per task. No customer data, keys or private repository contents.')}</li>
    <li><b>${t('Stop vizuri','Fail gracefully')}</b> ${t('401: kagua auth. 429: angalia reset/Retry-After ikitolewa. Credit imeisha? Stop; no paid fallback bila idhini.','401: check auth. 429: check the reset/Retry-After if provided. Out of credit? Stop; no paid fallback without approval.')}</li>
  </ol>
  <p class="quick-map">${t("Coding tool: match API format → base URL → exact model ID. RPM ni requests/min; TPM ni tokens/min. Compatibility ya format si guarantee ya model au tool calling.","Coding tool: match API format → base URL → exact model ID. RPM is requests/min; TPM is tokens/min. Format compatibility does not guarantee a model or tool calling.")}</p>
  <div class="cost"><b>${t('MFANO WA BAJETI · SI BEI YA PROVIDER','BUDGET EXAMPLE · NOT VENDOR PRICING')}</b><p>20k × $0.50/M + 5k × $2/M = <strong>$0.02</strong></p><small>${t('Input + output; kabla ya tools, cache au fees.','Input + output, before tools, cache or extra fees.')}</small></div>
  <div class="link-grid"><div><b>${t('CHANZO CHA WAZO','EDITORIAL INSPIRATION')}</b>${resource('video','CodeWithUsman · YouTube')}</div><div><b>${t('LINK YETU · ALTRAWARE','OUR LINK · ALTRAWARE')}</b>${resource('studio',t('Ongea nasi kuhusu build','Talk to us about your build'))}</div></div>
  ${note(t('Independent guide. Links nyingine ni docs za nje, si affiliate offers. Hakuna sponsorship au keys zinazogawiwa.','Independent guide. All other links are external docs or references, not affiliate offers. No sponsorship; no keys are distributed.'))}`)}
 </main></body></html>`;
}
