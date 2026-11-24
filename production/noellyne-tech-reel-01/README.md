# Noellyne — Tech Bila Hype · EP.1 v2: MAANDISHI HAYASOMEKI

37.93 s · 1080×1920 · 60 fps · **Kiswahili TTS voice-over (scratch take) + lip-sync** · Kiswahili captions.

**Nini hiki:** version ya pili ya EP.1, iliyorekebishwa baada ya mwandishi/owner
aidikataa ya kwanza ("hamna hands, hamna TTS, video ni mbaya"). Motion grammar ni zile zile
(typography slam-in, halftone dots, starburst spikes, hard cuts) — pair ya zamani (present/wave/point/thumbsup)
imebadilishwa na poses zenye mikono waziwazi (**wave, present, one, ok, point, thumbsup**), zote zikiwa
**ndani ya safe box** (v1 ilizikataa kwa kupotea kona — "hamna hands"). Fremu sasa inayoongozwa na sauti:
timeline inapimwa kutoka takes (mix.py), mouth track inatoka kwenye lipsync.py ya mix.wav halisi,
na Noellyne anatolewa kupitia rig halisi (host.mjs `performerDraw`) — visemes, lids, na hand layers
za kweli. Copy ya Kiswahili imeandikwa upya, idiomatic na fupi.

**Sauti:** takes sita za Kiswahili, zilizotengenezwa na TTS (tool `add_voice`/`generate_speech`,
voice-18, feminine entertainment) — ni **scratch take ya review**, sio owner's voice. Owner akipiga
takes zake (copy.json ina maandishi halisi, EN sidecar iko), mix.py itaipima upya na picture
itafuata moja kwa moja. Bed ni 62 Hz + fifth; tick moja kwa scene change. Hakuna music, hakuna risers.

| Beat | pose | mikono | VO (`copy.json`) |
|---|---|---|---|
| hook | wave (hand layer) | flat hand juu | Karibu Tech Bila Hype. Kipindi cha kwanza: maandishi hayasomeki. |
| problem | present | mikono miwili wazi | Kila siku unaona captions ndefu… |
| rule1 | one | kidole kimoja juu | Kanuni ya kwanza: neno moja. Kubwa. |
| rule2 | ok | OK-sign | Kanuni ya pili: rangi mbili tu. |
| rule3 | point (hand layer) | kidole kinachoelekeza | Kanuni ya tatu: anza na swali. Swali huwasimamisha. |
| cta | thumbsup | kidole juu | Hiyo ndiyo. Tips fupi, bila hype. Altraware. |

**Maelezo ya kiufundi (v2 fixes):**

- **Framing:** poses zote zimewekwa 100% ndani ya 1080-px frame (min x−w/2 = 24..45, max x+w/2 ≤ 1056).
  v1: wave ilivuka mpaka wa kulia (535→1095), point pia (648→1116) — mikono ilikatika.
- **Voice-led cut:** timeline (`out/timeline.json`) inapimwa kutoka urefu wa takes; sio fixed frames.
- **Mouth:** `lipsync.py` hupima formant energy ya mix.wav → `out/mouth.json` (56.9 % ya frames
  zina midomo iliyofunguka). Kit viseme patches zimepangwa upya kwa aperture halisi
  (A,F,G,B,C,H,D,E) — zamani 0.9+ openness ililingana na patch F (kinywa kilichofungwa).
- **AI mouth plates zimeachwa:** hazikuwa calibishwa kwa rig hii (wave: backdrop ilatoka nje ya
  silhouette na mstari mweusi ndani ya kifua). Kit patches zimehakikiwa moja moja; `peace` ilingatika
  vibaya (patch alitua shingoni) — ilibadilishwa na `ok` ("TU."). `cheer` pia vibaya (patch kifuani) — haikutumika.
- **Kicker mpya:** "HOYO MWENYEWE." (haikuwa Kiswahili) → "UNALISOMA?"; B2 kicker → "mistari midogo, hakuna anayesoma.";
  B5 kicker → "swali jema huwasimamisha."; CTA line 2: "UFUATE." → "FUATA HIYO."
- **Flash cuts** cream 6 frames kila cut (badala ya ink wash) — cuts zinaishi.

## Kujenga tena (rebuild)

```bash
npm ci                                          # root — @napi-rs/canvas
export FFMPEG=$(ls $PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-* | head -1)
PYTHONPATH=$PWD/.cache/rt python3 production/noellyne-tech-reel-01/mix.py        # mix.wav + timeline.json
PYTHONPATH=$PWD/.cache/rt python3 production/noellyne-host/lipsync.py \
  production/noellyne-tech-reel-01/out/mix.wav production/noellyne-tech-reel-01/out/mouth.json --fps 60
node production/noellyne-tech-reel-01/render.mjs        # frames/ (2276, deterministic)
ffmpeg -framerate 60 -i out/frames/%04d.png -i out/mix.wav \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 17 -preset medium \
  -c:a aac -b:a 192k -movflags +faststart -shortest \
  out/noellyne-tech-bila-hype-ep1.mp4
```

Frames hazijawekwa kwenye git. `out/` ina mp4 (~16 MB), `mix.wav`, `mouth.json`, `timeline.json`;
`proof/` ina stills nane za v2. `voice/` ina takes sita (mp3, scratch TTS).

## Verification (ilichofanywa)

- Deterministic renderer; frames 2276 (37.93 s) zinalingana na mix.wav timestamp-for-timestamp.
- Stills za kila beat ziliokaguliwa (hook / problem / rules 1–3 / cta) — poses zote ndani ya frame,
  mikono yaonekana, hakuna text overflow (fitSize), hakuna overlap ya type na silhouette.
- Midomo: max openness ≥ 0.91 kwenye peaks za kila take, visemes D/E zinaonekana kwenye stills;
  mouth open 56.9 % ya frames (wastani wa kawaida wa hotuba).
- Blinks: [start+44, +160, +276] kila beat; NODs: [start+16].
- Encode: H.264 High, 1080×1920, 60 fps, yuv420p, AAC 48 kHz stereo; bitrate ≈ 3.4 Mbps.
- QA sheet: `proof/qa-v2-beats.png`; full-res: `proof/v2-*.png`.

## Reference files (si sehemu ya repo)

Reference ni ile ile pin 924363892282992611 (violet/cream motion-design self-promo kutoka
Pinterest/Klickpin) — motion technique peke yake. Hakuna asset, picha, maandishi au brand ya
original kwenye EP.1. Spec kamili: SPEC.md.
