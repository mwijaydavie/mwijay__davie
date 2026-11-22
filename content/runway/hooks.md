# Hook library · what the research says, and the four hooks we start with

**Hali: 21 Nov 2026.** Hii ni library ya hooks zilizopimwa kwenye research, sio maoni. Kila
takwimu ina source yenye tarehe; ambapo source ni blog ya vendor, imeandikwa hivyo.

## 1 · Kilichopimwa (na kile ambacho ni maoni)

| Kipimo | Namba | Chanzo | Aina |
| --- | --- | --- | --- |
| Muda wa kuamua kuendelea kutazama | sekunde 1–3 | Meta research, iliyoripotiwa na Blitzcut, 25 May 2026 | secondary |
| Hook 7–10 maneno vs 4–6 maneno | 1.38× vs 0.75× baseline | 2,421 TikTok posts, clipspeed.ai, 12 Aug 2026 | measured, TikTok |
| Scenario hooks ("POV:", "When you…") | familia yenye nguvu zaidi, bands 4/4 | clipspeed.ai, 12 Aug 2026 | measured, TikTok |
| Flat contradiction ("You are editing your Reels wrong") | karibu na scenario family | clipspeed.ai, 12 Aug 2026 | measured, TikTok |
| Specific result ("three edits took this from 400 to 40,000") | namba halisi, hakuna question mark | clipspeed.ai, 12 Aug 2026 | measured, TikTok |
| Text overlay kwa watazamaji wasio na sauti | ~60% hutazama bila sauti | transformationjunction.com, 23 Aug 2026 | vendor blog |
| Hook window (3-second hold) | 46% → 71% kwa kubadilisha hook | transformationjunction.com, 23 Aug 2026 | vendor case study, single account |

**Kilichoaminika:** hook inafanya kazi pale inaposema **kitu kimoja** kwa **mtu mmoja** ndani ya
sekunde mbili, na text overlay inasema kitu hicho hicho kwa watazamaji wasio na sauti.

**Kilichokataliwa:** "hook length barely matters" (clipspeed) na "8–15 words" (blitzcut) ni ushauri
unaogongana; hatukuamua kwa maneno, tukaamua kwa **muundo**. Hooks zetu zina maneno 6–10 kwa
sababu ndio urefu wa script yetu, sio kwa sababu ya takwimu hiyo.

## 2 · Mahali hook inakaa kwenye Reel yetu

Mpangilio huu unafuata ushauri unaorudia kwenye source zote tatu:

| Sekunde | Kinachotokea | Kwa nini |
| --- | --- | --- |
| 0.0 | Nia anaingia + rangi + brand bar | pattern interrupt; jicho linatambua channel |
| 0.0–0.3 | Text overlay = hook | 60% hutazama bila sauti |
| 0.3–2.0 | Sauti inasema hook ileile | anayesikia na anayesoma wanapata kitu kimoja |
| 2.0–5.0 | Micro-reward: hatua ya kwanza | "nilikuja kwa sababu, naipata" |
| ~5.0 | Cut ya kwanza + whoosh | inashikilia watch time kabla ya sekunde 7 |
| mwisho | CTA + `COMMENT <KEYWORD>` | ombi moja tu |

## 3 · Hooks nne za kuanza (na kwa nini)

Kila moja ni template, sio sentensi moja. Tumia kwenye posts za wiki 1–2 na pima kwa
`hook_type` kwenye `post-log.csv`.

### A · Flat contradiction (the default for A1)

> "You are typing every invoice twice."
> "You are not behind on AI. You are behind on fields."
> "Your dashboard is lying about zero."

**Kwa nini:** inasema kitu kimoja, kinachogongana na kile mtu anadhani, bila swali. Haivunji
tumaini ya mtu; inampa kosa la kurekebisha leo. Ni hook ya t1 iliyorenderwa.

**Epuka:** contradiction ambayo ni tusi ("you are lazy") au ambayo inahitaji context.

### B · Scenario (the default for A3)

> "When the app takes 8 seconds to open, you stop taking notes."
> "Ukiwa na app tatu za notes, huandiki kitu."
> "When the client asks for the invoice and you are still in the chat."

**Kwa nini:** familia yenye nguvu zaidi kwenye data ya TikTok (bands 4/4). Inamweka mtu ndani ya
tukio, sio kwenye somo. Nia anaweza kuigiza tukio hilo kwa pose moja.

### C · Specific result (for A1 numbers and A3 tests)

> "Six fields took this invoice from 20 minutes to 4."
> "One test saved me from paying for an app I would have dropped in a week."

**Kwa nini:** namba halisi, bila question mark. **Sharti:** namba inatoka kwenye kipimo chako,
sio kwenye hadithi. Kama hujaipima, usiitumie — tumia A au B.

### D · Stakes first (the default for A2)

> "In 2000, Netflix offered itself to Blockbuster for $50 million."
> "The biggest supermarket in East Africa filed for administration on 31 October 2017."

**Kwa nini:** hadithi inahitaji mtu, tarehe na namba kabla ya jina la kampuni. Tarehe ndio
inayofanya claim iwe ya kuangalia, sio ya kuamini.

## 4 · Vitu vitatu vinavyoua hook (tuliviona kwenye drafts zetu)

1. **Swali la caption.** "What do you think?" inagawanya attention; tunatumia keyword moja.
2. **Hook inayoeleza channel.** "In this video I will show you…" — sekunde mbili zimepotea.
3. **Text overlay ndefu.** Zaidi ya maneno 8 kwenye screen yanakwenda chini ya 40px kwenye simu.

## 5 · Jinsi ya kupima hook (sio kwa hisia)

Kwenye `post-log.csv`, ongeza safu ya `hook_type` (A/B/C/D) na `hook_line`. Baada ya posts 7 kwa
akaunti, linganisha:

- **3-second hold** (kama insights inaruhusu) au `views @ 3s ÷ views`;
- `follows ÷ reach × 1000`;
- `keyword comments unique ÷ reach × 1000`.

Usibadilishe hook na niche kwa wiki moja. Badilisha `hook_type` pekee, posts 7, kisha amua.
Kanuni ya kukata iko kwenye [README](README.md) §5.

## 6 · Sources

- clipspeed.ai — *Hooks for Instagram Reels: what transfers from TikTok*, 12 Aug 2026 (2,421 posts).
- transformationjunction.com — *Instagram Reel hook framework*, 23 Aug 2026 (vendor case study).
- blitzcutai.com — *Best Instagram Reels hooks 2026*, 25 May 2026 (cites Meta research).
- pcstacks.com — *Good hooks for Reels*, 03 Sep 2026 (single creator test, watch time 5.8→9.4 s).
- reddit r/InstagramMarketing — *Instagram algorithm 2025*, 07 Apr 2025 (community notes, not data).

Hakuna moja ya hizi ni data ya akaunti yetu. Zote ni starting hypothesis; kipimo chetu ni
`post-log.csv`.
