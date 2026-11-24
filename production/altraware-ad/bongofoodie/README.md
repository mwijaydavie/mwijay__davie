# Noellyne — Tech Bila Hype · TANGAZO: Altraware × BongoFoodie

77.93 s · 1080×1920 · 60 fps · **Kiswahili TTS voice-over (scratch take, voice-21 — chosen by owner in audition) + lip-sync** · Kiswahili captions.

**Nini hiki:** tangazo (sponsored ad) la Altraware — huduma ya kutengeneza **app na websites
za biashara Tanzania** — ikitumia **BongoFoodie kama uthibitisho halisi** (bongofoodie.vercel.app,
DEMO admin view). Si tangazo la BongoFoodie pekee; ni tangazo la Altraware mjenzi.
Grammar ni ya EP.1/EP.2 (voice-led cut, kit visemes, safe-box poses, flash cuts);
copy ni mpya, na palette ni ya brand ya BongoFoodie (nyeusi + machungwa juu ya cream),
not EP.2's violet — hapa ni tangazo, sio episode.

**Sauti:** takes sita za Kiswahili, scratch TTS (**voice-21**, feminine advertising —
**ni scratch, sio owner's voice**; owner anapoamua kurekodi take yake, `copy.json` ni
rekodi ya maneno halisi). v2 ilikuwa voice-20 (auto, user aliruka audition); **v3 ni
voice-21 — mmiliki alichaguliwa kwenye audition (battle 21)**.

**Claims kwenye picha:** kila namba inayoonyeshwa inatoka screenshots za mmiliki
(2026-11-18): revenue **TSh 92,500**, **3 Orders**, **1 Pending**, **TSh 30,833** avg ticket
(DEMO: ADMIN — imeandikwa DEMO kwenye video); Chef AI Atelier EN/SW/AUTO, swali
"Recommend a drink for Nyama Choma" na jibu "Mmmh, Nyama Choma" (maneno halisi kutoka
demo); menu: Chipsi Mayai TSh 5,500, Nyama Choma TSh 13,500, ★ 4.9 · (126).
Dashboard cards na chat zimerithiwa tena (redrawn) kwa maandishi ya wazi — ni uthibitisho
wa kweli, si picha ya kawaida ya stock.

**Contents:**

| Beat | pose | On screen | VO (`copy.json`) |
|---|---|---|---|
| hook | cheer | pill · "APP NA" / "WEBSITE" · kicker · overhead spread polaroid (ours) top-right · Noellyne w840 | Karibu Tech Bila Hype. Leo ni tangazo — fupi, zito. |
| problem | phone | "BIASHARA YAKO INAKAAJE?" · wall (5 notifications) · chipsi mayai polaroid (ours) · stacked red stamp "ORDER + PESA = ZINAPOTEA" | Biashara nyingi Tanzania… Hakuna anayeona menu mtandaoni. |
| menu | point | "MENU YAKO" / "ONLINE." · chips za bei · phone mock (bob) · **nyama choma hero plate (ours) kama full-height panel** · bongofoodie.vercel.app | BongoFoodie — app na website tuliyoujenga… |
| brains | desk | "2 · NYUMA YA PAZIA" · DEMO dashboard cards (redrawn, values exact) · Chef AI Atelier chat (redrawn, verbatim) · overhead spread card (gold frame, drawn steam) · her "desk" pose | Nyuma ya pazia: orders zinaingia moja kwa moja… |
| pitch | present | orange field + white starburst · "ALTRAWARE — TUNAJENGA" · "APP YAKO." / "WEBSITE YAKO." · gold stamp "TUNAWEZA." · chips APP ✓ WEBSITE ✓ CHEF AI ✓ · "biashara yoyote Tanzania." | Tunachoweza kufanya kwa biashara yako… |
| cta | wave | Altraware mark × BongoFoodie lockup (real, keyed PNG) · "TECH BILA HYPE — TANGAZO" · "ANZA LEO." · typewriter altra.tanzaniareach.com · "comment APP" · bongofoodie.vercel.app | Biashara yako inahitaji app au website? … Altraware — tunatengeneza. |

**Kiufundi:**

- Voice-led: `mix.py` inapima takes → `out/timeline.json` (4676 frames / 77.93 s); mouth kutoka
  `lipsync.py` kwenye mix.wav halisi (**60.6 % voiced frames**); poses kupitia rig (gamma 0.75 ladder).
- Poses (v3, **Noellyne KUBWA kwenye frame — kila beat**): hook cheer (w840 cx540) ·
  problem phone (w680 cx330) · menu point (w620 cx330) · brains desk (w560 cx845) ·
  pitch present (w640 cx810) · cta wave (w760 cx540) — safe box.
- **v3 set nzima imeundwa upya ("mesa ya tangazo")**: original AI food plates (nyama choma
  hero, chipsi mayai, overhead spread) zilizotengenezwa kwenye session — **asili yetu, si
  picha za mtu mwingine** — zimewekwa ndani ya palette ya BongoFoodie kwa scrims za canvas:
  nyama hero kama full-height panel kwenye beat ya menu (behind phone), chipsi mayai polaroid
  kwenye problem ("Mna chips mayai?"), overhead spread kama gold-framed card kwenye brains.
  **Plates hizi ni scenery ya kuonyesha, si claim yoyote** — hakuna "halisi" inayoandikwa;
  ukweli wa bidhaa unabaki: DEMO screenshots (redrawn, values exact) + live site.
- Poses za v3: cheer/phone/point/desk/present/wave (mzunguko mpya; "ok" na "one" zimeachwa nje ya mzunguko wa tangazo).
- **Foreground café counter** (`production/noellyne-host/counter.mjs`): canvas-drawn — slab,
  beadboard, brand inlay, brass rail, kick plate — mbele ya Noellyne kila beat, inaficha
  "hana legs / sharp ends" cut; props asili per beat (chalkboard WA special pub, receipts,
  LEO: NYAMA CHOMA, espresso cups, TUNAWEZA chips, ASANTE/KARIBU board); dark beats zinatumia
  theme ya espresso (gold inlay), light beats walnut.
- **Mouth plates** sasa zime-feather elliptically (`host.mjs` → `featheredMouth()`,
  cache `mouthMaskCache`) na anchored kwenye (421, 452) kwenye **kila pose** — anchor ilikuwa
  imefanya offsets vibaya kwenye poses 9 (ok/peace/pray/cheer/phone/desk/thumbsup/…);
  normalized kwenye `host-rig.json` baada ya scan ya template matching. Kit visemes zime-wrap,
  hazijatengenezwa upya — rule ya kit mouth art inasimama.
- Encode: H.264 High, 1080×1920, 60 fps CFR, yuv420p, AAC 48 kHz stereo, faststart,
  13.2 MB, 77.93 s, ≈ 1.15 Mbps v / 191 kbps a. Decode check: `ffmpeg -v error -f null -` safi.
- QA: `proof/qa-tangazo-beats.jpg` (grid ya beats) + `proof/still-*.png` (frames halisi za mp4).

**Rebuild:**

```bash
# repo root; requires: npm ci (@napi-rs/canvas) and pillow/numpy/imageio-ffmpeg in .cache/rt
export FFMPEG=$PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v9.0.2
PYTHONPATH=$PWD/.cache/rt python3 production/altraware-ad/bongofoodie/mix.py
PYTHONPATH=$PWD/.cache/rt python3 production/noellyne-host/lipsync.py \
  production/altraware-ad/bongofoodie/out/mix.wav production/altraware-ad/bongofoodie/out/mouth.json --fps 60
node production/altraware-ad/bongofoodie/render.mjs
# encode (example): ffmpeg -framerate 60 -i out/frames/%04d.png -i out/mix.wav -c:v libx264 -profile:v high -pix_fmt yuv420p -r 60 -c:a aac -ar 48000 -ac 2 -movflags +faststart out/noellyne-bongofoodie-tangazo.mp4
```

Frames hazijawekwa git. `out/` ina mp4 + mix.wav + mouth.json + timeline.json; `voice/` ina takes sita (mp3, scratch TTS).

**Ukweli wa kujua:**

- Scratch TTS — **sio owner's voice**; pacing itafuata sauti ya owner anaporekodi.
- `altra.tanzaniareach.com` — **domain haijathibitishwa** (kimeachwa kama EP.1/EP.2 walivyokitumia); owner aikatee kabla ya kwenda live.
- `bongofoodie.vercel.app` — live (inapatikana kwenye screenshot); CTA inaita "mfano halisi" kwa usahihi.
- Numbers za dashboard ni za DEMO view — zimeandikwa "DEMO: ADMIN" kwenye video; si claims za mauzo ya kampuni.
- Cheo cha "Mfano halisi" kwa BongoFoodie — ni bidhaa ya mmiliki yenyewe (ushahidi wa kazi ya Altraware).
