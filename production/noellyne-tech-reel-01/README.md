# Noellyne — Tech Bila Hype · EP.1 v4: MAANDISHI? HAYASOMEKI.

37.93 s · 1080×1920 · 60 fps · **Kiswahili TTS voice-over (scratch take) + lip-sync** · Kiswahili captions.

**Nini hiki:** EP.1 baada ya owner kuikataa v3 (masked AI mouth — "mouth imekua kama
unusual"). Repair ya mwisho (v4) inabadilisha vitu viwili tu, bila kuvunja v2 bones
(framing, cuts, copy, voice-led timeline):

1. **Mouth** — AI masked plates zimeondolewa kabisa kwenye `host.mjs`; midomo sasa ni
   **kit visemes peke yake** (A,F,G,B,C,H,D,E, gamma 0.75). Hakuna ellipse masks
   kwenye AI plates.
2. **Poses zenye kinywa halisi cha kufunguka + mikono waziwazi** — `problem` sasa ni
   **phone** (simu mkononi, kinywa kinapasuka hadi meno) na `rule1` sasa ni **desk**
   (mikono miwili mbele). Zamani `present` na `one` zilikuwa na kit patches zinazofanana
   zikiwa karibu-kufungwa — ndiyo sababu "haiongei".

Mbali na hilo, **title imebadilishwa** kwa ombi la owner: "MAANDISHI HAYASOMEKI" →
**"MAANDISHI? HAYASOMEKI."** (swali la kwanza). Poses zilipanuliwa kidogo kwa reel-distance
readability (problem 560→520→phone, rule1 580→desk, rule2 ok, rule3 point, cta 720).

**Sauti:** takes sita za Kiswahili, zilizotengenezwa na TTS (tool `add_voice`/`generate_speech`,
voice-18, feminine entertainment) — ni **scratch take ya review**, sio owner's voice. Owner akipiga
takes zake (copy.json ina maandishi halisi, EN sidecar iko), mix.py itaipima upya na picture
itafuata moja kwa moja. Bed ni 62 Hz + fifth; tick moja kwa scene change. Hakuna music, hakuna risers.

**Midomo (v4):** kitvisemes peke yake, zilizopangwa kwa aperture halisi (A,F,G,B,C,H,D,E,
gamma 0.75 — zamani 0.7). Hakuna AI plates, hakuna ellipse masks. Mouth open kwenye
56.9 % ya frames; peaks ≥ 0.91 kwenye kila take. `wave` ina range pana zaidi; phone/desk
patches zina meno na hupaka wazi kwenye peaks; one/ok/point/thumbsup patches ni ndogo
kwa nature (source art) — mwendo wa midomo uko lakini ni mdogo.

| Beat | pose | mikono | VO (`copy.json`) |
|---|---|---|---|
| hook | wave (hand layer) | flat hand juu | Karibu Tech Bila Hype. Kipindi cha kwanza: maandishi hayasomeki. |
| problem | **phone** | simu mkononi | Kila siku unaona captions ndefu… |
| rule1 | **desk** | mikono miwili mbele | Kanuni ya kwanza: neno moja. Kubwa. |
| rule2 | ok | OK-sign | Kanuni ya pili: rangi mbili tu. |
| rule3 | point (hand layer) | kidole kinachoelekeza | Kanuni ya tatu: anza na swali. Swali huwasimamisha. |
| cta | thumbsup | kidole juu | Hiyo ndiyo. Tips fupi, bila hype. Altraware. |

**Maelezo ya kiufundi (v4 fixes):**

- **Mouth:** `lipsync.py` hupima formant energy ya mix.wav → `out/mouth.json` (56.9 % ya frames
  zina midomo iliyofunguka). Kit viseme patches zimepangwa kwa aperture halisi
  (A,F,G,B,C,H,D,E, gamma 0.75). AI masked plates (v3) **zimeondolewa**; owner aliikataa v3 kama
  "unusual" — kwa hiyo hakuna AI ellipse masks kwenye v4.
- **Pose swap:** problem present→phone, rule1 one→desk — kit patches za phone/desk zina meno
  na aperture halisi; present/one patches ni near-identical smiles (verifikishwa kwenye
  `/tmp/all-poses-all-patches.png`, sheet haijahifadhiwa repo).
- **Framing:** poses zote zimewekwa ndani ya 1080-px frame (safe box), kwa viwango vipya:
  hook wave w660 cx540 · problem phone w520 cx795 · rule1 desk w580 cx760 · rule2 ok w560 cx775 ·
  rule3 point w530 cx780 · cta thumbsup w720 cx560.
- **Title:** hook inaonyesha "MAANDISHI?" (fitSize 150) + "HAYASOMEKI." — kwa ombi la owner.
- **Kicker mpya (bado):** "UNALISOMA?"; B2 kicker → "mistari midogo, hakuna anayesoma.";
  B5 kicker → "swali jema huwasimamisha."; CTA line 2: "FUATA HIYO."
- **Flash cuts** cream 6 frames kila cut — cuts zinaishi.

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

Frames hazijawekwa kwenye git. `out/` ina mp4 (~18 MB), `mix.wav`, `mouth.json`, `timeline.json`;
`proof/` ina stills nane za v4 (`proof/v4-*.png`) + QA sheet (`proof/qa-v4-beats.png`). `voice/` ina takes sita (mp3, scratch TTS).

## Verification (ilichofanywa)

- Deterministic renderer; frames 2276 (37.93 s) zinalingana na mix.wav timestamp-for-timestamp.
- Stills za kila beat ziliokaguliwa (hook / problem / rules 1–3 / cta) — poses zote ndani ya frame,
  mikono yaonekana (phone simu mkononi, desk mikono miwili), hakuna text overflow (fitSize),
  hakuna overlap ya type na silhouette.
- Midomo: max openness ≥ 0.91 kwenye peaks za kila take; voiced frames 56.9 %. Phone/desk patches
  zinaashiria wazi (meno) kwenye hotuba; one/ok/point/thumbsup ni ndogo (source-art limit).
- Blinks: [start+44, +160, +276] kila beat; NODs: [start+16].
- Encode: H.264 High, 1080×1920, 60 fps, yuv420p, AAC 48 kHz stereo; bitrate ≈ 3.8 Mbps,
  37.93 s, ≈ 17.9 MB.
- QA sheet: `proof/qa-v4-beats.png`; full-res: `proof/v4-*.png`.

## Reference files (si sehemu ya repo)

Reference ni ile ile pin 924363892282992611 (violet/cream motion-design self-promo kutoka
Pinterest/Klickpin) — motion technique peke yake. Hakuna asset, picha, maandishi au brand ya
original kwenye EP.1. Spec kamili: SPEC.md.
