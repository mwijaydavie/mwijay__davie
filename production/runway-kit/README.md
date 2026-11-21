# Runway kit · print engine ya lead magnets

Print pipeline ya files ambazo Reels zinaahidi: PDF moja kwa kila comment keyword. Toleo hili
linatoa files 5 za `content/runway/files/` — A5 portrait, fonts zilizoembed, deterministic, bila
browser.

```bash
cd production/runway-kit
python3 build.py        # files 5 -> ../../content/runway/files/
python3 test_kit.py     # QA iliyopimwa (margins, fonts, CTA, banned claims)
python3 test_links.py   # hakuna link iliyovunjika, hakuna ahadi ya file lisilopo
```

## Muundo

| Faili | Kazi |
| --- | --- |
| `kit.py` | Design system: A5 frame, palette tatu, fonts, `fit_paragraph`, panels, tables, checkboxes, page chrome |
| `build.py` | Inabuild docs zote, inaandika `manifest.json` na previews za kila ukurasa |
| `docs/invoice_flow.py` | A1 · `STACK` · `Invoice-Flow-Checklist.pdf` (5 kurasa) |
| `docs/decision_file.py` | A2 · `FILE` · `The-Decision-File-Sources.pdf` (6 kurasa) |
| `docs/app_tests_sw.py` | A3 · `KIT` · `Kipimo-cha-App-5-Tests.pdf` (5 kurasa) |
| `docs/toolkit_sw.py` | A3 · `TOOLKIT` · `Toolkit-ya-Freelancer.pdf` (5 kurasa) |
| `docs/pricing_sw.py` | A3 · `BEI` · `Bei-Sample-Sura-1.pdf` (5 kurasa) |
| `fonts/*.ttf` | Inter 400/600/700, Space Grotesk 700, Fraunces 700, JetBrains Mono 600/700 |
| `test_kit.py` | QA: saizi ya ukurasa, hakuna ukurasa tupu, glyphs ndani ya margins, fonts embedded, CTA, banned claims, metadata |
| `test_links.py` | Uhusiano kati ya docs na files halisi |

Outputs: PDFs + `manifest.json` kwenye `content/runway/files/` (zina-commit); previews za PNG
kwenye `out/runway-kit/preview/` (hazina-commit).

## Uamuzi wa kiufundi

- **ReportLab, sio Chromium.** Pipeline ya `production/api-tip/` inahitaji Playwright/Chromium
  ambayo haipo kwenye sandbox hii; print output ilijengwa upya kwa ReportLab. Matokeo: hakuna
  browser, hakuna network, na build ya sekunde 2 kwa docs zote 5.
- **Fonts zimetolewa kutoka woff2 → TTF** kwa `fontTools` (`flavor = None`). Zote zipo kwenye
  repo (392 KB), kwa hiyo build haiitegemei `node_modules` wala internet.
- **Text inapimwa, haidhaniwi.** `fit_paragraph()` inapunguza hadi `wrap()` irudishe urefu
  unaotoshea; `panel()`/`table()` zinajenga kwa flowables, sio kwa mistari iliyohesabiwa.
  Ukurasa mmoja = sehemu moja; `test_no_orphan_pages` inazuia ukurasa wa mistari 3.
- **Hakuna Helvetica.** ReportLab huweka `/Helvetica` kwa cell tupu au style isiyo na `fontName`.
  Tuligundua hilo kwa test ya font-embedded: sasa `Table` ya kit inaweka `Body` kwa kila cell,
  `tiny` style ina `fontName`, na `rl_config.canvas_basefontname = "Body"`. Test inashika
  regression yoyote.
- **Page chrome kwenye template, sio kwenye story.** Header/footer zinaachwa nje ya frame
  (margins 34/40/36 pt) ili flowables zisizidi kamwe kwenye chrome.
- **Kila file ina language tag** (`/Lang en` au `sw`) na keywords kwenye metadata; A3 files
  zina `/Lang sw` na Kiswahili kwenye PDF properties.

## Ripoti ya QA (21 Nov 2026)

| File | Kurasa | KB | Herufi | Fonts | Margins | CTA |
| --- | --- | --- | --- | --- | --- | --- |
| Invoice-Flow-Checklist.pdf | 5 | 63.7 | 4,914 | embedded | pass | `Comment STACK` |
| The-Decision-File-Sources.pdf | 6 | 68.5 | 7,091 | embedded | pass | `Comment FILE` |
| Kipimo-cha-App-5-Tests.pdf | 5 | 63.6 | 4,621 | embedded | pass | `Andika KIT` |
| Toolkit-ya-Freelancer.pdf | 5 | 63.4 | 4,851 | embedded | pass | `Andika TOOLKIT` |
| Bei-Sample-Sura-1.pdf | 5 | 62.6 | 3,847 | embedded | pass | `Andika BEI` |

`python3 test_kit.py` → 9 tests pass; `python3 test_links.py` → 3 tests pass.

## Uwezo na mipaka

- **Inaweza:** kubuild PDF yoyote ya A5 yenye sehemu za maandishi, tables, checkboxes, panels,
  na mistari ya kuandika kwa mkono; kurudia build kwa matokeo yale yale; kuthibitisha kila
  ukurasa kwa preview ya PNG.
- **Haiwezi:** kuchora picha/charts za data (hakuna matplotlib kwa sasa), kutoa docx au epub,
  kutuma email, kupakia Dropbox/Drive, au kufanya hifadhi ya files hizo kwa niaba yako.
- **Haipaswi:** kuweka affiliate link, bei ya soko, au madai ya mapato ndani ya file. Files hizi
  ni value-first: hakuna CTA ya kununua ndani, na `BEI` sample inasema kiungo hakijawashwa.
- **Sio legal/financial advice.** Files zinaonyesha mchakato, sio matokeo.
