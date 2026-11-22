# Altraware house reel · kichocheo kilichotokana na video zako

Chanzo: reels za Drive zilizoandaliwa **jana (21 Nov 2026) na kabla** — hasa `Faida POS - Jumla ni ngapi` (22.3 s), `Altraware - Nyama TZ v2`, `Altraware - Security Kabla ya Ship`, `Altraware - LIMS (Simu Moja, Kazi Tatu)`, `Altraware - Shule Altra`. Reels za leo (`Noellyne-*`) hazikupitiwa kwa maelekezo yako.

## Kile video yako ilifanya vizuri

| Kipengele | Kilivyofanyika | Kwa nini kinafanya kazi |
| --- | --- | --- |
| **Chumba kimoja** | Navy nyeusi `#030815` → `#04102B`, taa moja ya joto upande wa kushoto `#B06040` | Kila post inatambulika kwa sekunde moja, kabla ya kusoma neno |
| **Sentensi moja kubwa** | Juu-kushoto, uzito 800, neno la muhimu kwa dhahabu ya italiki (`Jumla?`) | Ni swali, sio tangazo; jicho linaishia hapo |
| **Nembo ndogo juu** | `[alama] ALTRAWARE / PROJECT 02` kwa herufi ndogo za mono | Inasema ni nani na ni project gani, bila kuchukua nafasi |
| **UI halisi mbele** | Risiti nyeupe yenye vitu, bei, total — si picha ya simu | Inaonyesha kazi ya software, sio matangazo |
| **Mhusika amekatwa na ukingo** | Anaingia kulia, amekatwa kiunoni; anaonyesha kadi | Haonekani kama sticker; anaonekani kama mtu kwenye chumba |
| **Caption ya mstari 1–2** | Bar ya navy yenye pembe, Kiswahili, chini | Inasomeka bila sauti; haigusani na headline |
| **Mwangaza wa mstari** | Beam ya diagonal kwenye mpito | Mpito unasikika kama "scene" sio "slide" |

## Kile nilibadilisha (na kwa nini)

1. **Mhusika mpya: Zuri.** Reels zako zilikuwa na msichana mmoja mwenye miwani ya jua na hoodie ya bluu. Zuri ni msichana yuleyule kwa mtindo — turtleneck ya periwinkle, braids mbili, hoops za fedha — lakini ana uso unaoweza **kuhukumu** na **kucheka**. Kwa reel za kulinganisha (A3: 3s dhidi ya 11s), sura ya kuhukumu ni muhimu.
2. **Hook haina mhusika.** Kwenye fremu ya kwanza ni maandishi pekee. Yeye anaingia kwenye beat ya pili — ile ya UI. Hii inaipa hook nafasi yote ya skrini.
3. **Hakuna sauti ya kiume.** Playbook inasema jaribu sauti ya kiume; wewe umesisitiza sauti ya kike yenye kupendeza, moja kila wakati (`voice-01` Kiswahili).
4. **Muda: sekunde 15–25, sio 5.5 kwa scene.** Hook ya sekunde 5.5 bila kitu kinachotokea ni ndefu; scene ya UI inahitaji sekunde 5+ ili jicho lipitie risiti.

## Kichocheo cha uzalishaji (kinachojirudia)

```
1  hook     4–5 s   maandishi pekee, swali, neno la dhahabu        (hakuna mhusika)
2  UI       5–7 s   kadi nyeupe + mhusika akiashiria               (anakuja na kadi)
3  CTA      3–4 s   mhusika upande mmoja, chip ya dhahabu + URL     (anacheka/tabasamu)
```

Kanuni tatu zisizovunjika:

- **Kadi iko mbele ya mhusika.** Kila mara. Ndio inafanya ionekane kama anashughulika na kitu halisi.
- **Mhusika hakatwa na ukingo.** Kichwa juu kuliko nusu ya skrini, miguu chini ya fremu.
- **Caption haigusani na kitu kingine.** Bar moja, chini, mistari 2 ya juu.

## Faili za kiufundi

- `production/runway-engine/src/altraware.mjs` — template ya track 5 (room, hero, eyebrow, uiCard, bigStat, ctaChip, captionBar, push).
- `production/runway-engine/src/zuri.mjs` — mhusika: poses, anchorage, kivuli cha sakafu.
- `production/runway-engine/assets/character/zuri-*-cut.png` — cut-outs nne (calm, point, shock, laugh).
- `production/runway-engine/tools/cut_white.py` — kukata kwa usafi kutoka background nyeupe (flood fill + shave + feather; bila hii kuna halo nyeupe kwenye nywele).
- `content/runway/specs/t5-test-zuri.spec.json` — spec ya jaribio.
- `content/runway/specs/vo/t5-test-zuri.vo.json` — sauti (voice-01, Kiswahili).
