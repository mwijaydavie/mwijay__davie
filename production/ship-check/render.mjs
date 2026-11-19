import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
import {carousel, slideFiles} from './carousel.mjs';
import {guide, keyword} from './guide.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const out = resolve(process.env.SHIP_CHECK_OUT || join(root, 'out/ship-check'));
const site = 'https://ship-check.invalid';
const proofOnly = process.argv.includes('--proof-only');
const asset = (name, type) => ({body: undefined, name, type});
const routes = new Map([
  ['/lab', asset(join(here, 'lab.html'), 'text/html; charset=utf-8')],
  ['/theme.css', asset(join(here, 'theme.css'), 'text/css')],
  ['/guide.css', asset(join(here, 'guide.css'), 'text/css')],
  ['/carousel.css', asset(join(here, 'carousel.css'), 'text/css')],
  ['/mark.png', asset(join(root, 'content/assets/altraware-mark.png'), 'image/png')],
  ['/font/inter.woff2', asset(join(here,'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),'font/woff2')],
  ['/font/jetbrains.woff2', asset(join(here,'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'),'font/woff2')],
]);
for (const file of routes.values()) file.body = await readFile(file.name);
for (const dir of ['proof', 'slides', 'qa']) await mkdir(join(out,dir), {recursive:true});

async function mount(context) {
  // All synthetic-origin assets are served in memory. Deny network requests during render.
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    const file = url.origin === site ? routes.get(url.pathname) : undefined;
    if (!file) return route.abort();
    await route.fulfill({status:200, body:file.body, contentType:file.type});
  });
}
const html = (path, body) => routes.set(path, {body, type:'text/html; charset=utf-8'});
const image = (path, body) => routes.set(path, {body, type:'image/png'});
async function ready(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const img of document.images) await img.decode();
  });
}

const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || undefined, headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']});
try {
  const receipt = [];
  for (const [variant, after] of [['A',0],['B',1]]) {
    const context = await browser.newContext({viewport:{width:660,height:790},deviceScaleFactor:1});
    await mount(context);
    const p = await context.newPage();
    await p.goto(`${site}/lab?variant=${variant}`);
    await ready(p);
    assert.equal((await p.locator('#variant-label').textContent()).trim(), `BUILD ${variant}`);
    assert.equal(await p.locator('#count').textContent(), '0');
    await p.locator('#title').fill('QA-01');
    await p.locator('form').screenshot({path:join(out,'proof',`${variant}-form-ready.png`)});
    await p.getByRole('button',{name:'Save',exact:true}).click();
    assert.equal(await p.getByRole('status').textContent(), 'Saved');
    assert.equal(await p.locator('#count').textContent(), '1');
    await p.locator('form').screenshot({path:join(out,'proof',`${variant}-form-saved.png`)});
    await p.locator('main').screenshot({path:join(out,'proof',`${variant}-before.png`)});
    await p.reload();
    await ready(p);
    assert.equal(await p.locator('#count').textContent(), String(after));
    assert.equal(await p.locator('#record').textContent(), after ? 'QA-01' : 'No notes');
    image(`/proof/${variant}.png`, await p.locator('.ledger').screenshot({path:join(out,'proof',`${variant}.png`)}));
    receipt.push({build:variant, environment:'local teaching lab', browser:browser.version(), test:'Save, reload, verify the same test note',
      testRecord:'QA-01', toast:'Saved', recordsBeforeReload:1, recordsAfterReload:after, found:after===1, verdict:after===1?'PASS':'FAIL'});
    await context.close();
  }
  await writeFile(join(out,'proof','test-results.json'),JSON.stringify(receipt,null,2)+'\n');
  console.log('Verified browser receipts: A has 0 notes after reload; B has exactly 1 (QA-01).');
  if (!proofOnly) {
    const context = await browser.newContext({viewport:{width:1080,height:1350},deviceScaleFactor:1});
    await mount(context);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror',e=>errors.push(e.message));
    for (const [lang, name] of [['sw','Ship-Check-Test-7-Kiswahili.pdf'],['en','Ship-Check-7-Release-Tests-English.pdf']]) {
      html(`/guide/${lang}`,guide(lang));
      await page.goto(`${site}/guide/${lang}`);
      await ready(page);
      const layout = await page.locator('.sheet').evaluateAll(sheets=>sheets.map((sheet,index)=>{
        const foot = sheet.querySelector('footer').getBoundingClientRect();
        const body = sheet.querySelector(index===2?'.decision':index===1?'.guide-source':'.prompt').getBoundingClientRect();
        return {page:index+1,space:foot.top-body.bottom};
      }));
      for (const a of layout) assert(a.space > 7,`${lang}: guide page ${a.page} overlaps its footer (${a.space}px)`);
      await page.pdf({path:join(out,name),printBackground:true,preferCSSPageSize:true,tagged:true});
      for (const i of [0,1,2]) {
        const capture = await page.locator('.sheet').nth(i).screenshot({path:join(out,'qa',`guide-${lang}-0${i+1}.png`)});
        if (i===0 && lang==='sw') image('/proof/guide-cover.png',capture);
      }
      console.log(`Rendered ${lang}: ${name}`);
    }
    for (const [index,name] of slideFiles.entries()) {
      html('/carousel/slide',carousel(index));
      await page.goto(`${site}/carousel/slide`);
      await ready(page);
      const layout = await page.locator('.deck').evaluate(deck=>{
        const rect = node => node.getBoundingClientRect();
        const headline = deck.querySelector('h1');
        return {left:rect(headline).left,right:headline.scrollWidth + rect(headline).left,
          titleBottom:rect(deck.querySelector('.lead')).bottom, artTop:rect(deck.querySelector('.visual')).top,
          artBottom:rect(deck.querySelector('.visual')).bottom, footTop:rect(deck.querySelector('.deck-foot')).top,
          overflow:[...deck.querySelectorAll('.visual img,.proof-tag,.proof-note,.source-line,.retry-note')].some(n=>rect(n).bottom > rect(deck.querySelector('.deck-foot')).top)};
      });
      assert(layout.right<=1012 && layout.titleBottom<layout.artTop && layout.artBottom<layout.footTop && !layout.overflow,
        `Slide ${index+1} text/safe-area check: ${JSON.stringify(layout)}`);
      if (index===6) assert.match(await page.locator('h1').innerText(),new RegExp(`\\b${keyword}\\b`));
      await page.locator('.deck').screenshot({path:join(out,'slides',`${name}.png`)});
      console.log(`Rendered: ${name}`);
    }
    html('/carousel/review',carousel());
    await page.goto(`${site}/carousel/review`);
    await ready(page);
    await page.pdf({path:join(out,'Carousel-Ship-Check-Review.pdf'),printBackground:true,preferCSSPageSize:true,tagged:true});
    assert.deepEqual(errors, []);
    await context.close();
  }
} finally {
  await browser.close();
}
