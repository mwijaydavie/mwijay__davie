# Noellyne — Tech Bila Hype · EP.2: TOOLS? ZA BURE.

50.40 s · 1080×1920 · 60 fps · **Kiswahili TTS voice-over (scratch take) + lip-sync** · Kiswahili captions.

**Nini hiki:** episode ya pili, mwandamizi wa EP.1 ("MAANDISHI? HAYASOMEKI."). EP.1
iliongeza "captions" — EP.2 inazungumzia **apps unazozilipia ukiweza kupata bure**.
Beat grammar ni ile ile ya EP.1 v4 (voice-led, poses ndani ya safe box, kit visemes,
mstone flash cuts); copy mpya imeandikwa upya kuzunguka mwongozo wa bure —
**Tech Bila Hype PDF** (Apps · AI · Tools — zana 12, halisi, bonyeza 'PDF' comment yipate).

**Sauti:** takes sita za Kiswahili, TTS scratch take (voice-19, feminine entertainment) —
**ni scratch, sio owner's voice.** Owner akipiga takes zake (copy.json = script ya rekodi;
EN sidecar iko), mix.py itapima upya na picture itafuata moja kwa moja.

**Contents (EP.2):**

| Beat | pose | On screen | VO (`copy.json`) |
|---|---|---|---|
| hook | wave | pill "TECH BILA HYPE — EP.2" · "TOOLS?" / "ZA BURE." · kicker "UNALIPA?" | Karibu Tech Bila Hype. Kipindi cha pili: tools za bure. |
| problem | phone | ink slab "KWA NINI?" + wall of bars + red slashes · kicker "hakuna anayekwambia — kila mtu anauza tu." | Kila mwezi unalipa apps… |
| rule1 | desk | KANUNI 01 · "DRIVE." / "DOCS. MEET." · gold stamp "BURE." · kicker "google, bure kabisa" | Kanuni ya kwanza: ikiwa kuna free tier… |
| rule2 | ok | KANUNI 02 · "CANVA." / "CAPCUT." / "FREE." · chips "CANVA · FREE" / "CAPCUT · FREE" · kicker "design + video — bila kadi" | Kanuni ya pili: Canva na CapCut… |
| rule3 | point | KANUNI 03 · "JARIBU" / "KWANZA." · card "FREE FIRST!" · kicker "lipa ukiona inahitajika." | Kanuni ya tatu: jaribu free kwanza… |
| cta | thumbsup | logo wipe · "HIYO NDIYO." / "PATA PDF." · "Tools 12 · za bure · bila hype." · altra.tanzaniareach.com | Hiyo ndiyo. Zaidi: comment PDF… |

**Kiufundi:**

- Voice-led: `mix.py` inapima takes → `out/timeline.json`; `mouth.json` kutoka `lipsync.py`
  kwenye mix.wav halisi (60.4 % voiced frames); poses kupitia rig (bez A,F,G,B,C,H,D,E, gamma 0.75).
- Poses: hook wave (w660 cx540) · problem phone (w520 cx795) · rule1 desk (w580 cx760) ·
  rule2 ok (w560 cx775) · rule3 point (w530 cx780) · cta thumbsup (w720 cx560) — safe box.
- Encode: H.264 High, 1080×1920, 60 fps CFR, yuv420p, AAC 48 kHz stereo, ≈ 3.7 Mbps,
  23.5 MB, 50.40 s.
- QA: `proof/qa-ep2-beats.png`; stills: `proof/ep2-*.png`.

**Rebuild:**

```bash
export FFMPEG=$PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2
PYTHONPATH=$PWD/.cache/rt python3 production/noellyne-tech-reel-02/mix.py
PYTHONPATH=$PWD/.cache/rt python3 production/noellyne-host/lipsync.py \
  production/noellyne-tech-reel-02/out/mix.wav production/noellyne-tech-reel-02/out/mouth.json --fps 60
node production/noellyne-tech-reel-02/render.mjs
```

Frames hazijawekwa git. `out/` ina mp4 + mix.wav + mouth.json + timeline.json; `voice/` ina takes sita (mp3, scratch TTS).

**Ukweli wa kujua:** EP.2 ni 50.4 s — polepole zaidi kuliko EP.1 (37.9 s) kwa sababu voice-19
inasoma taratibu; owner anapoamua kurekodi take lake, pacing itafuata sauti yake moja kwa moja.
References kwenye SPEC ya EP.1 zinabaki sawa; PDF references za zana 12 kwenye
`production/noellyne-ig/identity/pdf/build-pdf.py` ndizo chanzo cha claims (Canva, CapCut, Google, ChatGPT na Claude, Notion, Drive…).
