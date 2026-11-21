# Runway engine · Reels + carousels kutoka spec moja

Engine ndogo inayozalisha **motion graphics halisi** (1080×1920, 60 fps, H.264) kutoka faili la JSON. Templates tatu za kuonekana, moja kwa kila akaunti ya [runway](../../content/runway/README.md):

| Track | Muonekano | Templates |
| --- | --- | --- |
| 1 · AI systems | Karatasi nyeupe, grid, cobalt `#3343C5`, lime accent | `cover` `workflow` `checklist` `clip` `stat` `table` `cta` |
| 2 · Stories | Dark documentary, serif display, lime + terracotta | `cover` `stat` `quote` `timeline` `article` `chart` `clip` `cta` |
| 3 · Tools | Karatasi `#F2F4ED`, terracotta, rule lines | `cover` `compare` `bars` `demo` `roi` `checklist` `cta` |

## Maamuzi ya kiufundi (kwa nini hivi)

- **Hakuna browser, hakuna Chromium.** Kila frame ni SVG inayozalishwa kwa code, kisha `@resvg/resvg-js` inai-convert kuwa pixels. Inafanya kazi kwenye sandbox isiyo na display, ni deterministic, na ni haraka (~0.12 s kwa frame).
- **Text ni vector paths, si `<text>`.** Fonts zinasomwa kwa `fontkit` na glyph outlines zinaandikwa moja kwa moja. Hii inaondoa tatizo la renderer kupanga font weight vibaya (ilijaribiwa: `font-weight:800` ilirudisha weight ileile ya 400 kwa baadhi ya fonts). Pia inafanya measurement (`measure()`) na rendering zilingane kabisa — ndio maana `wrap()` na safe area haziwezi kukosea.
- **Fonts zote ziko npm**, hakuna download: Inter, Space Grotesk, JetBrains Mono, Fraunces (latin subsets, static weights).
- **Motion ni pure function ya frame.** Springs, `lerp`, `interpolate` — hakuna `Date.now()`, `Math.random()`, `setTimeout` au CSS animation. `renderFrame(spec, 900)` inatoa picha ileile ikiwa imeombwa ya kwanza au ya mwisho (test inathibitisha).
- **Video:** frames zinaingizwa kwenye ffmpeg kama raw RGBA kupitia pipe (`@ffmpeg-installer/ffmpeg`, haihitaji install ya system). Output: H.264, `yuv420p`, 60 fps CFR, `+faststart`.
- **Audio haipo kwa makusudi.** Engine inatoa silent master + `captions.srt` + `cue-sheet.json`; sauti ni yako (au TTS iliyoidhinishwa) na inawekwa kwenye CapCut/ffmpeg.

## Kutumia

```sh
cd production/runway-engine
npm install                      # mara moja

node src/cli.mjs list            # specs zote + hali ya check
node src/cli.mjs check    <spec> # validation ya sekunde 1 (bila render)
node src/cli.mjs stills   <spec> # PNG kwa kila scene
node src/cli.mjs sheet    <spec> # contact sheet ya haraka
node src/cli.mjs video    <spec> # MP4 kamili + SRT + cue sheet
node src/cli.mjs carousel <spec> # PNG 1080x1350 kwa kila slide
node --test test/engine.test.mjs # 13 regression tests
```

`<spec>` ni path ya faili lolote la `.spec.json`, mfano `../../content/runway/specs/t1-01-invoice-twice.spec.json`.

Matokeo yanaenda `out/runway/<slug>/` (gitignored):

```
out/runway/t1-01-invoice-twice/
  t1-01-invoice-twice.mp4   1080x1920 · 60fps · H.264 yuv420p
  captions.srt              timing inayolingana na cues
  cue-sheet.json            maandishi ya kurekodi kwa beats
  stills/f00xxx.png         keyframes kwa review
  carousel/slide-0x.png     kama spec ina carousel
```

## Flags

| Flag | Kazi |
| --- | --- |
| `--frames 120,900` | stills maalum (badala ya moja kwa kila scene) |
| `--limit 300` | video ya frames 300 tu (preview ya haraka) |
| `--from 900 --to 1200` | render ya sehemu (kurekebisha scene moja) |
| `--name draft.mp4` | jina la faili la output |

## Muda

| Kazi | Muda (sandbox ya vCPU 2) |
| --- | --- |
| `check` | < 1 s |
| still moja | ~0.15 s |
| Reel ya 27.5 s (1,650 frames) | ~3.5 min |
| Carousel ya slides 4 | ~1 s |

Kwa siku ya kazi: render video mbili usiku (dakika 7) na uwe na buffer ya siku 5–7 mbele.

## Kuongeza template

1. Ongeza function kwenye `src/art.mjs` (pure: `(t, props) => svg`).
2. Iite kwenye switch ya track husika kwenye `src/templates.mjs`.
3. Ongeza jina la type kwenye `TYPES` ya `src/validate.mjs` kwa track husika.
4. Ongeza test moja kwenye `test/engine.test.mjs` ikiwa na spec ndogo.

Kanuni: hakuna rangi mpya nje ya theme ya track; hakuna text chini ya `y = 1440`; kila namba inayodaiwa inahitaji `source`.

## Mipaka

- Engine haiposti, haipangi muda, haitumi DM na haipandishi kwenye cloud.
- Haizalishi picha halisi: `clip`/`demo` zinahitaji faili la picha ulilopiga au clip iliyoruhusiwa, pamoja na `credit`.
- Haithibitishi facts. `sources[]` ni mahali pa kuandika chanzo; wewe unahakiki.
- Fonts ni za leseni ya OFL (Inter, Space Grotesk, JetBrains Mono, Fraunces) — zinatumika kawaida kwenye video.

## Leseni za fonts na tools

- Inter, Space Grotesk, JetBrains Mono, Fraunces: SIL Open Font License 1.1 (kupitia `@fontsource`).
- `@resvg/resvg-js`: MPL-2.0. `fontkit`: MIT. `@ffmpeg-installer/ffmpeg`: FFmpeg LGPL/GPL build; tumia kama tool ya ndani.
