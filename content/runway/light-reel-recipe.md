# Altraware light product reel · kichocheo

Chanzo: video tatu za Drive, zilizochambuliwa fremu kwa fremu (3 fps, 1080×1920, 60 fps):

| Video | Urefu | Rangi ya ukurasa | Kichwa |
| --- | --- | --- | --- |
| `MwijayNote - Wazo lisipotee` | 20.8 s | `#D8D2C8` (joto) | serif nyeusi |
| `Altraware - LIMS (Simu Moja, Kazi Tatu)` | 52.4 s | `#EDF3F9` (bluu-nyeupe) | grotesk navy + serif bluu |
| `Altraware - Model Mpya, Pima Kazi Yako` | 26.3 s | `#E6F6EE` (mint) | grotesk navy |

## Mtindo halisi (uliopimwa, sio kukisiwa)

| Kipengele | Kipimo / rangi |
| --- | --- |
| Ukurasa | `#EDF3F9` · joto `#D8D2C8` · mint `#E6F6EE` — **nyeupe inatawala** |
| Kichwa | navy `#0B1B33`, uzito 700, heroline → mstari wa 2 ni **serif ya bluu `#1755C9`** |
| Pill ya juu | nyeupe, mpaka `#B2C6DF`, radius 30, `[alama] JINA / SEHEMU` kwa mono |
| Kadi | `#FBFDFF`, radius 26, kivuli laini, ikoni nyeusi ya mraba |
| Caption | bar moja navy `#0B1B33`, chini, mistari 1–2, nyeupe |
| Mhusika | amesimama kulia, amekatwa na ukingo; **kichwa 19–36% ya fremu** kuanzia juu |
| Mwanga | mstari mmoja mweupe wa diagonal; hakuna gradient nyingine |

## Muundo wa beat (LIMS, ndio ulio bora)

1. **Hook** — mistari **mifupi**: "Simu moja." / "Kazi tatu." (maneno 2–3, sio sentensi)
2. **Beat ya pili ndani ya sekunde 1.2** — kadi au slide inaingia; hakuna fremu tupu
3. **Kila beat inabadilisha KADI, sio scene** — kichwa kinabaki, kadi inabadilika
4. **CTA** — nembo inabadilika kuwa `COMMENT APP`, kadi inaeleza nini kitakuja

Kosa nililofanya mara ya kwanza: mistari mirefu ("Sekunde tatu. / Dhidi ya kumi na moja.")
yaliingia kwenye nywele na kukaa sekunde 6 bila kitu. Sasa: "Sekunde 3." / "Dhidi ya 11." —
tarakimu zinabeba utofauti, na kadi inaingia sekunde 1.2.

## Mhusika

Zuri (turtleneck ya periwinkle, braids mbili, hoops za fedha) — poses tano:

- `wave` — anafungua kila reel (ishara ya nyumbani, kama kwenye zote tatu)
- `point` — anaonyesha kadi
- `calm` — anasimama na kadi
- `shock` — namba mbaya
- `laugh` — CTA

## Faili

- `production/runway-engine/src/light.mjs` — template ya **track 6** (room, pillLockup, headline, card, bigNumber, cta, summaryCard, caption)
- `production/runway-engine/src/zuri.mjs` — poses + anchorage
- `production/runway-engine/assets/character/zuri-*-cut.png` — cut-outs
- `production/runway-engine/tools/cut_white.py` — kukata kutoka background nyeupe
- `content/runway/specs/a3-01-note-apps.spec.json` — reel halisi ya Jumatatu 23 Nov

## Kanuni tano

1. **Nyeupe inatawala.** Background ni karatasi, sio chumba.
2. **Mstari wa pili ni serif ya bluu.** Ndio sahihi ya Altraware.
3. **Mistari mifupi.** Maneno 2–3 kwa mstari; jicho linapaswa kulimaliza kabla ya cut.
4. **Kitu kinaingia ndani ya sekunde 1.2.** Hakuna fremu tupu yenye maandishi pekee.
5. **Mhusika hakatwa na ukingo.** Kamwe sio sticker inayoelea.
