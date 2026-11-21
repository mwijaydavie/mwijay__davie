# Specs · maelezo ya kuandika post

Post moja = faili moja la JSON. Engine inasoma spec, inatoa **cover PNG**, **MP4 1080×1920 @ 60 fps**, **SRT** na **cue sheet**.

```sh
cd production/runway-engine
node src/cli.mjs check    ../../content/runway/specs/t1-01-invoice-twice.spec.json
node src/cli.mjs stills   ../../content/runway/specs/t1-01-invoice-twice.spec.json
node src/cli.mjs video    ../../content/runway/specs/t1-01-invoice-twice.spec.json
node src/cli.mjs carousel ../../content/runway/specs/t1-01-invoice-twice.spec.json
node src/cli.mjs sheet    ../../content/runway/specs/t1-01-invoice-twice.spec.json   # contact sheet ya haraka
```

Matokeo: `out/runway/<slug>/` (haingii Git).

## Muundo

```jsonc
{
  "slug": "t1-01-invoice-twice",       // jina la folder ya output
  "track": 1,                           // 1 AI systems · 2 stories · 3 tools
  "keyword": "STACK",                   // neno moja, herufi kubwa, la kipekee
  "tag": "AI SYSTEMS",                  // kinachoandikwa kwenye cover card
  "footerLine": "Free file in DM.",
  "footerNote": "Illustrative; no client data.",
  "caption": "…",                       // caption kamili ya Instagram
  "cta": "ManyChat: STACK → Invoice-Flow-Checklist.pdf",

  "cover": "content/runway/assets/…png",   // hiari; bila hiyo, cover art inajengwa
  "clips": {
    "invoice": {
      "image": "content/runway/assets/invoice-demo.png",
      "label": "DEMO · SAMPLE DATA",       // lebo inayoonekana kwenye clip
      "credit": "Own screen recording, 20 Nov 2026"
    }
  },
  "sources": [
    {"name": "Reuters", "url": "https://…", "date": "2017-10-31"}
  ],

  "scenes": [
    {"type": "cover", "eyebrow": "AI WORKFLOWS", "kicker": "INVOICING",
     "headline": "…", "sub": "…",
     "cues": [{"in": 8, "out": 150, "text": "…"}]}
  ]
}
```

## Scenes kwa track

**Track 1:** `cover` · `workflow` · `checklist` · `clip` · `stat` · `table` · `cta`
**Track 2:** `cover` · `stat` · `quote` · `timeline` · `article` · `chart` · `clip` · `cta`
**Track 3:** `cover` · `compare` · `bars` · `demo` · `roi` · `checklist` · `cta`

## Muda

Kila scene ni **330 frames = 5.5 s @ 60 fps**.

- scenes 8 = 44 s · scenes 9 = 49.5 s · scenes 7 = 38.5 s
- Habari: Reels 25–45 s zinafanya vizuri kwa akaunti hizi; Track 2 inaweza kufika 55 s (scenes 10).
- `cues[].in` / `out` ni frames **ndani ya scene** (0–330), si mwisho wa video.

## Kanuni za cue

- Mistari 2 kwa maximum; `check` inakataa cue inayozidi.
- Kasi ya kusoma ≤ 4.4 maneno/s.
- Hakuna cue inayoingiliana na nyingine.
- Cue inaisha kabla ya 324 (mwisho wa scene) ili isikatwe na scene inayofuata.
- Usimalizie cue kwa swali; `check` inatoa warning.

## Safe area

Maandishi muhimu yanasimama kati ya **y = 300 na 1440**. Captions ziko 1470–1620; footer (keyword) 1660–1790. Header 176–290. `check` inakataa headline inayozidi mistari 4 hata kwa 48 px.

## Vitu vinavyokataliwa na `check`

- keyword tupu, yenye nafasi, au ya kawaida (`link`, `info`, `yes`…)
- scene 1 isiyo `cover`, au scene ya mwisho isiyo `cta`
- stat/article/chart/timeline bila `source`, au spec bila `sources[]`
- clip/demo isiyo na `credit` kwenye `clips{}`
- cue zinazoingiliana, au zinazozidi mistari 2
- headline inayozidi mistari 4

Tumia `check` kabla ya kila render; ni sekunde moja badala ya render ya dakika 20 yenye hitilafu.

## Sauti

Engine haizalishi sauti. Inatoa:
- `captions.srt` — timing inayolingana na cues (import kwenye CapCut/Premiere au upload kwenye IG captions)
- `cue-sheet.json` — maandishi ya kusoma kwa beats, kwa recording ya simu
- video ya **silent** — weka voiceover yako kwenye CapCut au ffmpeg

Kanuni: rekodi beats 5–6, take mbili kila beat, simu umbali wa kiganja. Weka sauti kwanza, kisha rekebisha cues kwenye spec kama maneno yalibadilika.

## Carousel (hiari)

Kama post ni carousel badala ya Reel, ongeza:

```jsonc
"carousel": {
  "label": "TOOL SHOWDOWN",
  "slides": [
    {"type": "cover", "kicker": "NOTE APPS", "headline": "…", "sub": "…"},
    {"type": "list", "headline": "…", "items": [{"title": "…", "detail": "…"}]},
    {"type": "cta", "headline": "…", "line": "…"}
  ]
}
```

Slide types: `cover` · `list` · `quote` · `save` · `cta`. Ukubwa: 1080×1350.
