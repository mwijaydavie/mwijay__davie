# Sprint · 21–29 Nov 2026 · kutoka spec hadi posts 21

**Lengo:** ifikapo Jumapili 29 Nov, kila akaunti imeposti posts 7 na tuna data ya kuanzia (si matokeo ya mwisho).

Muda wa kazi: masaa 2–3 kwa siku. Ikiwa huna masaa hayo, punguza kwa akaunti moja (A3) na uache zingine zikikomaa.

## Sat 21 Nov · uamuzi na mfumo (leo)

- [ ] Chagua majina 3 ya akaunti na handle. Rekebisha `brand.handle` kwenye specs 3 zilizopo.
  - Mfano: `@mwijaysystems` (A1) · `@thedecisionfile` (A2) · `@mwijaytools` (A3). Hakikisha hazijachukuliwa.
- [ ] `cd production/runway-engine && npm install && npm test` — tests 13 zipite.
- [ ] `node src/cli.mjs check` kwa specs 3.
- [x] **A1-01 na A2-01 ziko tayari kwa sauti** (41.4s na 34.2s). A3-01 inasubiri clips 6 za sauti pekee — manifest na spec ziko tayari.
  - [x] A1-01 `t1-vo.mp4` · 34.2s · `STACK`
  - [x] A2-01 `t2-vo.mp4` · 41.4s · `FILE` · sources 2 zilizo na tarehe
  - [ ] A3-01 `t3-01-note-apps` · beats 4 · `KIT` — rekodi s2a/s2b/s2c/s3a/s4a/s4b kisha `node build-audio.mjs t3-01-note-apps`
- [x] Files 5 za lead magnets zimebuild na kupimwa: `content/runway/files/` (`STACK`, `FILE`, `KIT`, `TOOLKIT`, `BEI`). Rejista ya CTA zilizobaki: `content/runway/files/README.md` §4.
- [ ] Kagua PDFs 5 kwenye simu (sio preview pekee); rekebisha copy ukiona kitu kibaya.

## Sun 22 Nov · akaunti na sauti

- [ ] Fungua akaunti 3; jaza picha, bio, link (link moja kwa akaunti: Gumroad/Stan au landing ya file).
- [ ] Andika bio ya kila akaunti (mistari 3, bila emoji nyingi):
  - A1: `Systems for small businesses. One workflow per Reel. Free files in DM.`
  - A2: `One business decision per episode. Sources in every caption.`
  - A3: `Ulinganisho wa tools kwa Kiswahili. Kipimo, bei, na kasoro moja.`
- [ ] ManyChat (au any-comment tool): keyword 7 za wiki 1 kila akaunti, kila moja na faili lake.
- [ ] Rekodi sauti za posts 1–7 kwa akaunti (beat 5–6 kila moja; dakika ~40 kwa akaunti).
- [ ] Subiri saa 2 baada ya kumaliza profile kabla ya post ya kwanza.

## Mon 23 Nov · post ya kwanza

| Saa (EAT) | Akaunti | Post |
| --- | --- | --- |
| 10:00 | A1 | 01 Invoice twice → `STACK` |
| 18:00 | A3 | 01 Note apps → `KIT` |
| 20:00 | A2 | 01 Netflix $50m |

- [ ] Kabla ya post: hakiki DM kwa follower na non-follower kwa akaunti inayotoa file.
- [ ] Post; andika `published_at_eat` na URL kwenye [`post-log.csv`](../post-log.csv).
- [ ] Usikae kwenye app baada ya post (hakuna refresh loop).

## Tue 24 – Sun 29 Nov · mzunguko

Kila siku:

1. **Asubuhi (10 min):** jibu comments/DM zilizo na keyword; andika maswali yanayorudia.
2. **Jioni (45 min):** rekodi sauti ya post ya kesho; render video mbili usiku.
3. **Usiku:** post ya kesho iko tayari (video + cover + caption + keyword).

Kila Jumatano: angalia `post-log.csv` — je, kuna post moja inayoshinda mara mbili? Usibadilishe kitu zaidi ya kimoja.

## Sun 29 Nov · pitio la wiki 1

- [ ] Jaza metrics za saa 48 kwa posts zote 21.
- [ ] Hesabu: `shares ÷ reach`, `follows ÷ reach × 1000`, `keyword commenters ÷ reach × 1000`.
- [ ] Chagua **kitu kimoja** cha kubadilisha wiki 2: hook style, urefu, au CTA. Andika uamuzi kwenye `content/runway/README.md` (sehemu ya 5).
- [ ] Kama akaunti haipati followers 2 kwa 1,000 views kwa posts 7: badilisha hook, usibadilishe niche bado (siku 21 ndio kipimo).

## Nini kitaanguka kwanza (na jibu)

| Tatizo | Jibu |
| --- | --- |
| Hakuna muda wa kurekodi sauti | Tumia TTS scratch kwa wiki 1, rekodi yako wiki 2; usikae bila post |
| File haiko tayari | Badilisha CTA kwenda file lililopo (rejista: `files/README.md` §4); usiachie ahadi hewani |
| ManyChat haifanyi kazi kwa non-follower | Weka DM ya manual kwa siku 2, rekebisha, kisha post |
| Video inachukua muda mrefu | `--limit 300` kwa preview, render kamili usiku mmoja kwa zote |
| Hukubaliwi na namba za Track 2 | Chagua episodes 01, 06, 08 (zina source zilizothibitishwa) kwanza |

## Kipimo cha mafanikio ya sprint (si views)

- Posts 21 zimepostiwa kwa ratiba (au 7 kwa akaunti moja).
- Kila post ina: caption yenye keyword, file inayofika, na rekodi kwenye `post-log.csv`.
- Hakuna claim iliyopostiwa bila source.
- Tuna uamuzi mmoja wa kubadilisha wiki 2, tukiwa na data ya kutosha kuutetea.
