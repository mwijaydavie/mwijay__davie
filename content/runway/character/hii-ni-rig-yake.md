# Hii ni rig yake — Zuri, kipimo halisi

Kabla ya kuomba tena ishara, hii ni msingi. Kila joint imepimwa kutoka pichani
(`production/runway-engine/assets/character/zuri-full-src.png`, 843×1264), sio kukadiriwa.

## Kanuni mbili zilizokosewa mwanzo

1. **Bega si mstari mpana wa sweta.** Mstari mpana ni **hip** — meta tatu chini.
   Bega ni pale bomba la mkono linapoanza.
2. **Joint haiko kwenye ukingo wa picha.** Ilikuwa inachukuliwa kutoka outline,
   ndio maana viwiko vilianguka kwenye makali ya mikono. Joint iko katikati —
   nusu ya unene wa sleeve ndani.

## Namba zake (head units, kipimo kutoka kidevu)

| Kipimo | Thamani |
|---|---|
| Urefu wa kichwa | 391 px (0.309 ya picha) |
| Upana wa kichwa | 0.918 h |
| Mabega | 0.286 h |
| Kidevu → bega | 0.179 h |
| Bega → kiwiko (upper arm) | 0.921 h |
| Kiwiko → kifundo (forearm) | 0.921 h |
| Bega → kifundo | 1.841 h |
| Kidevu → kiuno | 2.023 h |

`h` = urefu wa kichwa. Hii ndio unit inayobaki sawa ukimbadilisha ukubwa kwenye scene.

## Pivots (head units, asili = kidevu katikati)

```
neck      (0.000, -0.280)
shoulder  (-0.146, 0.179)   ( 0.142, 0.179)
elbow     (-0.318, 1.100)   ( 0.223, 1.100)
wrist     (-0.745, 2.020)   ( 0.654, 2.020)
waist     (0.000, 2.023)
hip       (0.000, 2.005)
```

Faili: `content/runway/character/zuri-rig.json` · picha ya rig: `zuri-rig.png`

## Mwendo unaotokana na rig hii

| Tabaka | Pivot | Mzunguko |
|---|---|---|
| Pumzi | kiuno | 1.1% wima, mzunguko 2.4 s |
| Kuteleza | **hip** | 0.85°, mzunguko 6.4 s |
| Kichwa | shingo | −55% ya kuteleza, lag ya fremu 3 |

Lag na counter-rotation ndio tofauti kati ya mwili na kadi iliyokatwa.

## Kosa la braid (lilirekebishwa)

Kukata kichwa kwenye collar kulikata **braids vipande viwili**. Braid ni sehemu ya
kichwa. Mask sasa inafuata nywele: inashuka hadi chini kwenye columns zenye braid.

Study: `out/runway/character-rig-study.mp4` · motion 1.017 (reference 0.325, awali 0.237)
