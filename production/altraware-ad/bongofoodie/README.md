# Noellyne — Tech Bila Hype · TANGAZO: Altraware × BongoFoodie

53.10 s · 1080×1920 · 60 fps · **Kiswahili TTS voice-over (scratch take, voice-20) + lip-sync** · Kiswahili captions.

**Nini hiki:** tangazo (sponsored ad) la Altraware — huduma ya kutengeneza **app na websites
za biashara Tanzania** — ikitumia **BongoFoodie kama uthibitisho halisi** (bongofoodie.vercel.app,
DEMO admin view). Si tangazo la BongoFoodie pekee; ni tangazo la Altraware mjenzi.
Grammar ni ya EP.1/EP.2 (voice-led cut, kit visemes, safe-box poses, flash cuts);
copy ni mpya, na palette ni ya brand ya BongoFoodie (nyeusi + machungwa juu ya cream),
not EP.2's violet — hapa ni tangazo, sio episode.

**Sauti:** takes sita za Kiswahili, scratch TTS (**voice-20**, feminine advertising —
**ni scratch, sio owner's voice**; owner anapoamua kurekodi take yake, `copy.json` ni
rekodi ya maneno halisi). *Note ya uaminifu:* wakati wa session, user aliruka kuchagua
sauti kwenye audition — voice-20 ilipewa mojawapo, siyo chaguo lake la moja kwa moja.
Owner anaweza kuomba sauti nyingine wakati wowote.

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
| hook | cheer | pill "TANGAZO — ALTRAWARE × BONGOFOODIE" · "APP NA" / "WEBSITE" · kicker "kwa biashara yako — Tanzania." | Karibu Tech Bila Hype. Leo ni tangazo — fupi, zito. |
| problem | phone | "BIASHARA YAKO INAKAAJE?" · wall ya notifications (call/WhatsApp/orders zinapotea) · red stamp "ORDER + PESA = ZINAPOTEA" | Biashara nyingi Tanzania… Hakuna anayeona menu mtandaoni. |
| menu | point | "1 · MENU MTANDAONI" · "MENU YAKO" / "ONLINE." · chips za bei (Nyama Choma 13,500 · Chipsi Mayai 5,500) · phone mock yenye menu ya kweli (bob animation) · bongofoodie.vercel.app | BongoFoodie — app na website tuliyoujenga… |
| brains | ok | "2 · NYUMA YA PAZIA" · DEMO dashboard cards (redrawn, values exact) · Chef AI Atelier chat (redrawn, verbatim) · her "ok" pose | Nyuma ya pazia: orders zinaingia moja kwa moja… |
| pitch | desk | orange field + white starburst · "ALTRAWARE — TUNAJENGA" · "APP YAKO." / "WEBSITE YAKO." · gold stamp "TUNAWEZA." · chips APP ✓ WEBSITE ✓ CHEF AI ✓ · "biashara yoyote Tanzania." | Tunachoweza kufanya kwa biashara yako… |
| cta | thumbsup | Altraware mark × BongoFoodie lockup (real, keyed PNG) · "TECH BILA HYPE — TANGAZO" · "ANZA LEO." · typewriter altra.tanzaniareach.com · "comment APP" · bongofoodie.vercel.app | Biashara yako inahitaji app au website? … Altraware — tunatengeneza. |

**Kiufundi:**

- Voice-led: `mix.py` inapima takes → `out/timeline.json` (3186 frames / 53.10 s); mouth kutoka
  `lipsync.py` kwenye mix.wav halisi (**60.6 % voiced frames**); poses kupitia rig (gamma 0.75 ladder).
- Poses: hook cheer (w640 cx540) · problem phone (w470 cx800) · menu point (w400 cx268) ·
  brains ok (w390 cx806) · pitch desk (w440 cx820) · cta thumbsup (w700 cx540) — safe box.
- Encode: H.264 High, 1080×1920, 60 fps CFR, yuv420p, AAC 48 kHz stereo, faststart,
  ≈ 1.0 Mbps v / 191 kbps a, 7.9 MB, 53.10 s. Decode check: `ffmpeg -v error -f null -` safi.
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
