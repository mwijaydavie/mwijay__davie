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

## Depth (ukurasa wa tatu)

Nilibadilisha ukurasa mmoja kuwa **tabaka tatu**, kama LIMS:

| Tabaka | Kina | Kimechorwa |
| --- | --- | --- |
| Nyuma | ukuta `#EDF3F9`, mwanga juu-kushoto, mikunjo miwili ya diagonal, mstari wa skirting y=1122 | kabla ya mhusika |
| **Mhusika** | amesimama **nyuma ya counter** | kati |
| Mbele | counter nyeupe yenye ukingo wa mraba (y≈1240), kivuli chini ya mdomo wake, **band ya navy `#31528F`** chini | baada ya mhusika |
| Caption | ON the counter, sio kwenye band | mwisho |

Counter inamficha kiunoni — ndio inampa uzito. Bila hiyo anaonekana kama sticker iliyobandikwa.

## Character animation

Mhusika ni picha, kwa hivyo mwendo umeandikwa (`pose()` kwenye `src/zuri.mjs`):

| Tabaka | Kipimo | Kwa nini |
| --- | --- | --- |
| Pumzi | scale 0.52%, mzunguko 2.6 s, lift 4.2 px | kifua kinapanda, sio mwili wote |
| Kuyumba | 0.85° kuzunguka kiuno, mzunguko 4.1 s | hii ndio inafanya aonekane mtu |
| Mkono | squash 2.4% kwa 1.55 s (`wave`, `point` tu) | mkono unaotikisika kamwe hausimami |
| Kadi | kuelea 2.6 px / 1.4 px | kadi iliyosimama ni kitu kilichokufa |
| Kichwa | drift 1.2 px | juu ya fremu isikae tupu |

**Kipimo:** tofauti ya fremu mfululizo (60 fps) — video yako LIMS ni **0.325**, yangu ilianza **0.089**, sasa ni **0.237**. Bado 27% chini; sababu ni kwamba LIMS ina video halisi ya screen ndani ya kadi na mwendo wa kamera zaidi.

## Mikono: picha kamili, sio kubandika

**Hakuna mkono unaobandikwa juu ya mwili.** Mkono wa kubandikwa hauwezi kuungana na
sleeve — unaonekana kama sticker, kwa sababu ndio.

Kila ishara ni **render kamili ya mtu mmoja**: mkono, sleeve, kifundo, na cuff zote
zimechorwa pamoja. Ishara tisa: `open · point · peace · like · ok · pray · heart · count`
pamoja na `calm` na `laugh`.

Pose zote zinasawazishwa kwa kichwa kimoja (`tools/normalize_poses.py`), na scene
inamweka kwa **kidevu** (`cast.chinY`), sio kwa chini ya picha.

## Hakuna float

Mwili uliosimama hauna bob. Kile kinachosogea:

| Tabaka | Pivot | Kiasi |
| --- | --- | --- |
| Pumzi | kiuno | 0.75% ubavu, shoulder drop 0.22% |
| Kuteleza | hip | 1.15° kwa 5.9 s |
| Uzito | hip | 0.4% usawa, phase 90° |
| Kichwa | shingo | −38% ya kuteleza |

Na **kamera ni moja kwa reel nzima** (`+3%` kwa 30 s). Kamera ya kila scene inarudisha
zoom nyuma kwenye kila kukata — hiyo ndio ilikuwa "float" halisi.

## Mkono na ishara

Mikono ni **picha sita zilizorender** kwa mtindo wake (`assets/character/hand-*-cut.png`):

| Faili | Ishara | Matumizi |
| --- | --- | --- |
| `hand-open` | 🖐🏾 / ✋🏾 | kufungua reel, "sawa" |
| `hand-point` | 🫵🏾 | kuonyesha kadi |
| `hand-peace` | ✌🏾 | "mbili" kwenye list |
| `hand-like` | 👍🏾 | kuidhinisha |
| `hand-ok` | 👌🏾 | "sawa kabisa" |
| `hand-pray` | 🙏🏾 | asante, CTA |

`src/hands.mjs` inaziweka; kila ishara inayumba kwa **kiwiko** (14° kwa `wave`, 1.6° kwa nyingine).

`zuri-body-cut.png` ni picha ya `wave` iliyofutwa mkono kwa **connected component** (sio kwa rangi) — braid iliyokuwa nyuma ya mkono ilinusurika.

## Kamera

Kila scene ina push-in ya **2.4%** na kupanda kwa 8 px katika fremu 34 za kwanza. Counter na band **hazishiriki** kwenye zoom — ni ndege ya mbele ya 2D, na kuzizoom kunamficha kiunoni.

## Kanuni tano

1. **Nyeupe inatawala.** Background ni karatasi, sio chumba.
2. **Mstari wa pili ni serif ya bluu.** Ndio sahihi ya Altraware.
3. **Mistari mifupi.** Maneno 2–3 kwa mstari; jicho linapaswa kulimaliza kabla ya cut.
4. **Kitu kinaingia ndani ya sekunde 1.2.** Hakuna fremu tupu yenye maandishi pekee.
5. **Mhusika hakatwa na ukingo.** Kamwe sio sticker inayoelea.
