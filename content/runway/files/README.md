# Runway files · lead magnets

The Reels in `content/runway/` end with one comment keyword each, and that keyword promises a
file. This folder holds the files that actually exist, built from one print system so all five
look like the account that sent them.

**Hali (21 Nov 2026): 5 files tayari.** Posts 58 zilizobaki zina CTA ya file ambalo bado
halipo — rejista kamili iko sehemu ya 4 hapa chini. Kanuni ya `AGENTS.md` inabaki: *file halisi
kabla ya post; kama file haiko tayari, badilisha CTA, usiachie ahadi hewani.*

## 1 · Files zilizopo

| File | Keyword | Akaunti | Kurasa | Kilichomo |
| --- | --- | --- | --- | --- |
| `Invoice-Flow-Checklist.pdf` | `STACK` | A1 · Mwijay Systems | 5 | Fields 6 za kukusanya, flow ya hatua 3, jedwali la kujaza, na kile kinachovunja flow wiki 3 |
| `The-Decision-File-Sources.pdf` | `FILE` | A2 · The Decision File | 6 | Source dossier ya episodes 01–03: timeline, mahali account zinagongana, na URL zote |
| `Kipimo-cha-App-5-Tests.pdf` | `KIT` | A3 · Mwijay Tools | 5 | Tests 5 za kupima app kabla ya kulipia + jedwali la kujaza + checklist ya mwezi wa kwanza |
| `Toolkit-ya-Freelancer.pdf` | `TOOLKIT` | A3 · Mwijay Tools | 5 | Zana 7 za bure, kazi moja kila moja, na kile ambacho hazifanyi |
| `Bei-Sample-Sura-1.pdf` | `BEI` | A3 · Mwijay Tools | 5 | Sura ya mfano (sample) ya kit cha bei cha TSh 9,000 — bile ya malipo haijawashwa |

`manifest.json` ni rejista inayozalishwa: kurasa, ukubwa, keyword, idadi ya herufi, na preview
ya kila ukurasa. Vitu hivi ni vya kuzalishwa tena, si documents.

## 2 · Jinsi ya kubuild

```bash
cd production/runway-kit
python3 build.py              # files zote 5 -> content/runway/files/
python3 build.py invoice      # file moja (invoice | apptests | decisionfile | toolkit | pricing)
python3 test_kit.py           # QA iliyopimwa: margins, fonts, keyword CTA, banned claims
```

Inahitaji `reportlab`, `pypdf`, `pypdfium2`. Fonts ziko tayari kwenye `production/runway-kit/fonts/`
(TTF, zimetolewa kutoka `@fontsource` woff2 kwa `fontTools`) — hakuna chromium, hakuna
internet, na build ni deterministic.

## 3 · Muundo na uamuzi wa design

- **A5 portrait, 148×210 mm** kama print pipeline ya `production/api-tip/`. Faili inasomwa
  kwenye simu (ukurasa mmoja kwa screen) na inachapishwa A4 ikiwa nusu.
- **Rangi kwa akaunti:** A1 paper + cobalt `#3343C5` + lime `#DFFC77`; A2 inverted documentary
  (ink `#101322` head table + lime accent); A3 paper + terracotta `#C1441F`. Hii inafuata
  muonekano wa Reels, sio brand ya tovuti.
- **Fonts:** Inter (body), Space Grotesk (display), Fraunces (serif quote), JetBrains Mono
  (kicker, namba, keywords). Zote subset-embedded; hakuna Helvetica iliyobaki (test inailinda).
- **Kila ukurasa una jukumu moja:** cover yenye meta + "inside", kisha sehemu moja kwa ukurasa.
  Hakuna ukurasa wa tupu, hakuna ukurasa wenye mistari 3 pekee (test ya `test_no_orphan_pages`).
- **Measured text:** `fit_paragraph`/`fit_block` zinapunguza copy hadi inatoshea — ndio sababu
  hakuna overflow. Reportlab haifanyi auto-shrink, kwa hiyo kila block inapimwa kwa `wrap()`.
- **PDF metadata:** title, author, subject, keywords (`STACK`/`KIT`/`FILE`…) na `/Lang` (`en`/`sw`).
  Kila ukurasa una header/footer ya chrome iliyochorwa kwenye page template, sio kwenye story.

## 4 · Rejista ya CTA: file gani lipo, lipi bado

Posts 63 kwa jumla; 5 zina file halisi leo. Hii ni orodha ya kazi, sio ahadi.

| Akaunti | Posts zenye file | Zipo | Bado zinahitaji |
| --- | --- | --- | --- |
| A1 · Systems | 21 | 1 (`STACK`) | 20 — `WIRE`, `FIELDS`, `ZERO`, `LOG`, `BRIDGE`, `GUARD`, `READ`, `CATALOG`, `RESEARCH`, `PACK`, `MARGIN`, `NUDGE`, `SANDBOX`, `BRIEF`, `BACKUP`, `OFFLINE`, `MAP`, + 4 za wiki 3 |
| A2 · Stories | 21 (keyword `FILE` kwa roundup) | 1 (`FILE`) | Roundup ya episodes zote 21; kila episode ina sources kwenye caption, sio file |
| A3 · Tools | 12 zilizoandikwa na file | 3 (`KIT`, `TOOLKIT`, `BEI`) | 9 — `PDF`, `CATALOG`, `SPECS`, `DATA`, `MALIPO`, `STORAGE`, `PASS`, `TIME`, `VIRUS` |

Kanuni ya kutoka: post isiyo na file **haipostiwi**. Ama file inaandikwa (mchakato huu, siku 1
kwa file), ama CTA inabadilishwa kwenda file lililopo (mf. `STACK` kwa post ya fields 8), ama post
inabadilishwa na post yenye file. Rekebisha `calendar.csv` siku hiyo hiyo.

## 5 · Mipaka

- Hakuna affiliate link, hakuna bei ya soko, na hakuna madai ya mapato kwenye files hizi. Test
  ya `test_banned_claims` inazuia lugha ya guarantee/earnings ikiingia kwa bahati.
- `Bei-Sample-Sura-1.pdf` ni **sample**, imeandikwa wazi kwenye cover na ukurasa wa mwisho;
  kiungo cha malipo hakijawashwa. Usiiite bidhaa iliyouzwa mpaka uanze kuiuza.
- Namba zote za mfano (TSh 45,000, saa 14) ni za kubuni na zimeandikwa hivyo. Hakuna mteja halisi.
- Episodes 01–03 za A2 zina sources; episodes 04–21 bado ni `research-needed`. Usitume dossier
  hii kama uthibitisho wa episode isiyo na source.
- Files hazijatumwa kwa mtu yeyote na hazijapakiwa kwenye Dropbox/Drive/Vercel. Upload ni uamuzi
  wako; mchakato huu unaacha faili kwenye repo.

## 6 · Kuongeza file mpya

1. Andika `docs/<jina>.py` na `TITLE`, `FILENAME`, `KEYWORD`, `build()` inayorudisha story.
2. Ongeza kwenye `DOCS` ndani ya `build.py` (key, module, palette, subject).
3. Ongeza kwenye `EXPECTED` ndani ya `test_kit.py` (kurasa, keyword, lugha).
4. `python3 build.py <key> && python3 test_kit.py` — kisha soma previews kwenye
   `out/runway-kit/preview/<key>/` kabla ya kuiweka kwenye caption.
