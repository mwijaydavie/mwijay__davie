import assert from 'node:assert/strict';

export const links = {
  mcp:'https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture',
  tools:'https://modelcontextprotocol.io/specification/2026-07-28/server/tools',
  auth:'https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization',
  openai:'https://developers.openai.com/api/docs/guides/function-calling?api-mode=responses',
  claude:'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview',
  gemini:'https://aistudio.google.com/docs/function-calling',
  ollama:'https://docs.ollama.com/capabilities/tool-calling',
  faida:'https://faida-hq.vercel.app/',
  studio:'https://altra.tanzaniareach.com/contact',
};
const link=(key,label)=>`<a class="outlink" href="${links[key]}">${label} <span aria-hidden="true">↗</span></a>`;
const linked=(key,label)=>`<a href="${links[key]}">${label}</a>`;
const page=(n,kicker,title,body,cls='')=>`<section class="sheet ${cls}" id="p${n}" aria-labelledby="heading-${n}">
  <div class="folio"><b>ALTRAWARE / TECH TIP</b><span>01 — ${kicker}</span></div>
  <div class="page-body">${n===1?`<h1 id="heading-${n}">${title}</h1>`:`<h2 id="heading-${n}">${title}</h2>`}${body}</div>
  <div class="page-foot"><span>API NA MCP &nbsp;/&nbsp; MWONGOZO WA BURE</span><b>${String(n).padStart(2,'0')} / 06</b></div>
</section>`;

export function guide({css,fonts,mark,proof}){
  assert.deepEqual(proof.mcp.body,proof.direct.body);
  assert.equal(proof.direct.status,200);
  assert.deepEqual(proof.mcp.listed,['read_stock']);
  const stock=proof.direct.body;
  return `<!doctype html>
<html lang="sw"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>API na MCP · Mwongozo wa Tech Tip 01 · Altraware</title><meta name="author" content="Altraware Technology / Mwijay Davie">
<style>${fonts}\n${css}</style></head><body><main>
${page(1,'MWONGOZO','API na MCP.<br><em>Uunganishe nini?</em>',`
  <div class="cover-brand"><img src="${mark}" alt="" width="38" height="38"> <b>Altraware Technology</b><span>18.11.2026</span></div>
  <p class="intro">App yako inataka kujua vilivyopo stoo. Je, iite API moja kwa moja, au uongeze MCP? Huu ni mwongozo wa kufanya uamuzi na kuupima.</p>
  <div class="map-cover" aria-label="API moja kwa app ya stoo na zana ya MCP">
    <span class="map-cap">NJIA MBILI · CHANZO KIMOJA</span>
    <div class="map-in"><b>App ya stoo</b><b>App ya AI + MCP</b></div>
    <svg aria-hidden="true" viewBox="0 0 400 78"><path d="M85 0v13q0 17 20 17h69q26 0 26 24v24 M315 0v13q0 17-20 17h-69q-26 0-26 24v24" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="200" cy="66" r="6" fill="#343dc4"/></svg>
    <b class="map-result">API ya stoo</b>
  </div>
  <div class="toc" aria-label="Yaliyomo">
    <a href="#p2"><b>02</b> Tofauti</a><a href="#p3"><b>03</b> Jaribio</a><a href="#p4"><b>04</b> Uamuzi</a><a href="#p5"><b>05</b> Model docs</a><a href="#p6"><b>06</b> Worksheet</a>
  </div>
  <p class="small">Kwa vibe coders, wahandisi na wamiliki wa biashara. PDF hii haisukumii huduma ya kulipia, na unaweza kuisoma bila akaunti.</p>`, 'cover')}
${page(2,'DHANA','API ≠ MCP',`
  <p class="intro">API ni mkataba wa kuwasiliana na programu. MCP (Model Context Protocol) ni itifaki ya pamoja kwa app za AI kupata zana na muktadha.</p>
  <dl class="compare">
    <div><dt><b>API</b> <span>Kitendo kinachojulikana</span></dt><dd>API inaweza kuwa interface ya library au huduma ya mtandao. Mfano wa HTTP: app inajua endpoint, inatuma <code>GET ${proof.direct.endpoint}</code>, inasoma jibu. API si lazima iwe REST wala itumie AI.</dd></div>
    <div><dt><b>MCP</b> <span>Kugundua zana kwa muundo mmoja</span></dt><dd>Host ya AI hutumia <strong>MCP client</strong> kuwasiliana na <strong>MCP server</strong>. Server inaweza kutangaza zana, resources au prompts. Host huuliza orodha na kuita tool yenye inputs zilizofafanuliwa.</dd></div>
  </dl>
  <div class="flow-box"><b>Hivi vinaweza kufanya kazi pamoja</b><code>App → API ya stoo<br>App ya AI → MCP server → API ya stoo</code><small>Katika njia ya pili, MCP client imo ndani ya app ya AI.</small></div>
  <p class="detail"><strong>Usichanganye na model API:</strong> hiyo inatoa uwezo wa model kujibu au kupendekeza tool call. API ya stoo ndiyo chanzo cha kiasi. MCP si model wala database.</p>
  <p class="small">Soma ${linked('mcp','Architecture ya MCP')} au ${linked('tools','zile tools/list na tools/call')}.</p>`)}
${page(3,'USHUHUDA','Jaribio la stoo',`
  <p class="intro">Tulijaribu njia mbili juu ya handler moja, kwa bidhaa ya kubuni <code>${stock.sku}</code>.</p>
  <article class="terminal" aria-label="Muhtasari wa request na response">
    <b>01 / API MOJA KWA MOJA</b><pre>GET ${proof.direct.endpoint}
${proof.direct.status}  {"sku":"${stock.sku}","units":${stock.units}}</pre>
    <b>02 / KUPITIA MCP</b><pre>tools/list  → read_stock
tools/call  → read_stock({sku: "${stock.sku}"})
             → units: ${stock.units}</pre>
    <small>Muhtasari wa flow, si JSON-RPC payload kamili.</small>
  </article>
  <table class="results"><thead><tr><th scope="col">Jaribio</th><th scope="col">Kilichotokea</th></tr></thead><tbody>
    <tr><th scope="row">SKU ipo</th><td>Njia zote zilirudisha rekodi ileile: <b>${stock.units}</b> vipande.</td></tr>
    <tr><th scope="row">SKU haipo</th><td>API: ${proof.missing.direct}. MCP: tool error. Hakuna sifuri ya kubuni.</td></tr>
    <tr><th scope="row">POST</th><td>${proof.writeMethod}: njia ya mfano ni ya kusoma tu.</td></tr>
  </tbody></table>
  <p class="detail"><strong>Jaribu kwenye build yako:</strong> weka record moja ya dummy. Pima output kwa ID, kiasi na status. Badili SKU kuwa isiyopo; hakikisha UI yako inasema “haipatikani” badala ya “0”.</p>
  <p class="small">Lab: Node <code>Request/Response</code> ndani ya process + MCP SDK 1.32.2 in-memory. Hakuna HTTP ya nje, credentials, model au FaidaHQ iliounganishwa. Si benchmark ya kasi, usalama au toleo lote la spec.</p>`)}
${page(4,'UAMUZI','Anza na njia fupi',`
  <div class="decision"><span>A</span><div><h3>Flow moja, unajua iulize wapi?</h3><p>API moja kwa moja. Mfano: dashboard ije na idadi kutoka stoo. Hata app yenye AI inaweza kuita function yako bila MCP kama ina tool moja iliyofungwa.</p></div></div>
  <div class="decision"><span>B</span><div><h3>Hosts kadhaa zinahitaji zana ileile?</h3><p>Fikiria MCP adapter. Expose <code>read_stock</code> kwa hosts zinazoiunga mkono. Acha API na rules za biashara zibaki kwenye backend; pima compatibility ya host, transport na auth.</p></div></div>
  <div class="decision"><span>C</span><div><h3>Unataka AI ibadilishe data?</h3><p>Subiri. Tenganisha kupendekeza na kutekeleza. Backend ithibitishe mtu, role na kitendo husika kabla ya kuandika bei au oda.</p></div></div>
  <aside class="tip"><b>Checklist ya rollout</b>
    <ul><li>Anza na data ya mfano na read-only tool moja.</li><li>Validate input, tenant na ruhusa kwenye server; API key isiwe frontend. Maandishi ya prompt si permission check.</li><li>Pima missing, timeout na denied. Weka muda wa kusubiri na ujumbe wa kosa. Log tool, status na muda bila kuweka secrets au data nyeti.</li></ul>
  </aside>
  <p class="small">Kwa remote MCP, angalia ${linked('auth','docs za authorization')} za revision mnayotumia. Approval ya biashara ni uamuzi wa app na backend, si checkbox inayokuja na MCP.</p>`)}
${page(5,'DOCS ZA NJE','Provider gani?',`
  <p class="intro">Usianze na majina ya models. Chagua kazi unayotaka ipite, kisha pima model au runtime unayoweza kuitumia.</p>
  <div class="providers">
    <div><div><h3>OpenAI</h3><p>Jinsi app inavyopeleka schema, kupata function call na kurudisha tool output.</p></div>${link('openai','Function calling')}</div>
    <div><div><h3>Anthropic / Claude</h3><p>Tofauti kati ya tool ya app na tool inayotekelezwa na provider.</p></div>${link('claude','Tool use')}</div>
    <div><div><h3>Google Gemini</h3><p>Function declaration, arguments na hatua ya app kuendesha tool.</p></div>${link('gemini','Function calling')}</div>
    <div><div><h3>Ollama · local</h3><p>Jaribu tool calling kwenye model inayoiunga mkono. Hakiki RAM, speed na terms.</p></div>${link('ollama','Tool calling')}</div>
  </div>
  <aside class="tip"><b>Test ya pamoja kwa model zote</b><p>Andaa maswali 10 ya Kiswahili, SKU ipo na haipo. Pima tool sahihi, jibu lisilobuni idadi, muda na gharama kwa ombi. Kagua masharti ya data, nchi zinazopata huduma na model/SDK support kwenye docs kabla ya production.</p></aside>
  <p class="small">Links ni docs rasmi za kuanzia, si affiliate links, ranking, bei au ahadi kwamba huduma ni bure. Provider yoyote haikuitwa katika lab yetu.</p>`)}
${page(6,'WORKSHEET','Panga jaribio lako',`
  <p class="intro">Jaza haya kabla ya kuandika integration. Mmiliki na engineer wakubaliane kwenye jibu moja linalopimika.</p>
  <ol class="worksheet">
    <li><b>Swali la mtumiaji</b><small>Mf. “Vipande vingapi vya BOX-DEMO-01 vipo?”</small><span aria-hidden="true"></span></li>
    <li><b>Njia ya kwanza + kwa nini</b><small>Direct API / MCP. Ni app gani zinahitaji zana?</small><span aria-hidden="true"></span></li>
    <li><b>Je, hakuna jibu?</b><small>Andika status, ujumbe wa UI, na lini mtu achukue hatua.</small><span aria-hidden="true"></span></li>
    <li><b>Kitu kimoja kisiruhusiwe</b><small>Mf. kubadili bei bila idhini; pima kuwa data haijabadilika.</small><span aria-hidden="true"></span></li>
  </ol>
  <p class="owned-kicker">LINKS ZETU · ALTRAWARE</p>
  <div class="actions"><div><b>Mfano wa muktadha</b>${link('faida','Ona preview ya FaidaHQ')}</div><div><b>Una mradi?</b>${link('studio','Ongea na Altraware')}</div></div>
  <p class="small">FaidaHQ ni preview ya bidhaa, si integration iliyopimwa hapa. Vyanzo vya somo: ${linked('mcp','MCP Architecture')} · ${linked('tools','Tools spec')} (2026-07-28), vilikaguliwa 18 Nov 2026. Episode ijayo: <strong>Stoo ikikosa jibu, AI iseme sifuri?</strong></p>`) }
</main></body></html>`;
}
