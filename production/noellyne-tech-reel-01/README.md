# Noellyne — Tech Bila Hype · EP.1: MAANDISHI HAYASOMEKI

22.0 s · 1080×1920 · 60 fps · SFX-only (no music, no VO) · Kiswahili captions.

**Nini hiki:** Noellyne anaelezea kanuni tatu za maandishi ya kwenye reels, kwa kutegemea
motion grammar ya reference video (typography slap-in serif, halftone dots, starburst
spikes, hard cuts). Reference ni motion-design studio self-promo kutoka Pinterest/Klickpin
— **hakuna asset yao, picha yao, maandishi yao, au brand yao yeyote** kwenye hii episode;
ni mbinu tu (technique), si maudhui (content). Angalia `SPEC.md` kwa maelezo kamili ya
cromani ya kifasihi.

**Kwa nini hakuna VO:** hakuna sauti iliyorekodiwa kwa script hii, na hakuna muziki
uliowekwa wazi kwenye repo. Sound design ni synthesized SFX (`mix.py`, numpy) iliyopangwa
kwa frame — picha na sauti haziwezi kutengenana. Noellyne anatumia plates za poses
zimeidhinishwa (present/wave/point/thumbsup) na breathing + scheduled blinks — **uso wake haupigi maneno kwa sababu hakuna sauti ya kusema**. Kama unataka toleo la VO,
nipe takes (au kibali cha TTS) — kitengeneza visemes upya kama shule-altra-reel.

## Kujenga tena (rebuild)

```bash
npm ci                                          # root — @napi-rs/canvas
cd production/noellyne-tech-reel-01 && node render.mjs        # writes out/frames/ (60 fps PNGs)
PYTHONPATH=.cache/rt python3 mix.py             # out/mix.wav (48 kHz stereo)
ffmpeg -framerate 60 -i out/frames/%04d.png -i out/mix.wav \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 17 -preset medium \
  -c:a aac -b:a 192k -movflags +faststart -shortest \
  out/noellyne-tech-bila-hype-ep1.mp4
```

Frames hazijawekwa kwenye git (~215 MB, deterministic — zinajenga upya kutoka kwenye
`render.mjs`). `out/` ina mp4 (2.5 MB) na `mix.wav`; `proof/` ina stills tatu.

## Verification (ilichofanywa)

- Deterministic renderer (frame-driven, hakuna Date.now()/Math.random()).
- Stills za kila beat boundary zilikaguliwa (hook, slashes, stamp, card pop, end-card);
  header line "MAANDISHI/HAYASOMEKI." ilikuwa ina-overflow — imeletwa katika fitSize() na
  imehakikiwa upya. "?" kwenye question card inapiga blink kwa kila 18f.
- Gradation kuanzia black mwanzo na mwisho (8–10 frames) imehakikiwa.
- Encode: H.264 high profile, 1080×1920, 60 fps constant, yuv420p, AAC stereo.
- Frame count = 1320; audio duration = 22.00 s (inalingana).

Residuals: hakuna text wraparound check ya mstari mmoja kwa line kwenye beat yoyote
(kila mstari ni moja). U-clone ni wa mbinu tu — reference na clone haziendani pixel kwa
pixel, na hazipaswi (SPEC.md §Fidelity).

## Reference files (si sehemu ya repo)

Vidio tano za marejeo zilipakuliwa kutoka Drive kwenda `/google_drive/` (imoge repo kwa
`.gitignore`) — pin 924363892282992611 ilikuwa msingi wa EP.1 hii; zingine (1140395936913435621
ChatGPT-story, 1086986060091213065 Amazon 1896, 1086986060089969292 Hedy Lamarr vintage,
885872189233454908 AI-tutorial light) zinahifadhiwa kwa mwongozo wa baadaye.
