# Altraware Business Story 02 · Website Yako

The 45s vertical review cut answers one question: when an AI answer sends customers looking, is there a useful, current page the business controls? The independent `menyu.example` search sequence is a labelled simulation; two real local capture crops follow in a separate proof section. This is not an AI citation, performance, checkout or ranking test. See `content/pilots/14-website-era.md` for editorial choices, the breakdown and dated sources.

## Pieces and ordering

- **Search state:** `.agents/skills/altraware-search-reels/examples/opening.plan.json` drives the pure `searchAt()` and matching synthetic tap cues. Until submit/ready no result is shown; then the pointer moves inside the result before click/open. The provided skill ZIP is runnable without artwork, credentials or npm. Sim labels and a reserved domain carry the distinction into the link shot.
- **Proof:** Bongo Foodie from `Menu-Iko-Wapi-Review-Kit.zip`, md5 `ee757d9f71a2a3ad2c00b97ac48ff00e`, pin `f469acbb6dc3fb2274e87d8c1a22379fcda2ea36`; no new live result. Audenic from the earlier pinned guest capture, `e4b211085f78181421fb9f4562395a8fb2568d0b`. `qa/{capture-assets,bongo-source,audenic-source}.json` records exact crops and revisions. `bongo-menu-before.png`/`bongo-menu-pilau.png` switch at the action; `bongo-pilau-result.png` is cropped to the visible title, price and dish. Audenic scrolls from original product title to original specs crops.
- **Host:** same Business host from `production/price-story`, wave and point poses. `rig-mouth.py` registered eight tight mouth patches, two blinks and two wrists on the original 939×1136 art. Baked eyes and body remain the original pose; the counter makes the chest crop intentional. `visemes.mjs` estimates A–H/X after assembling the dry track, only in the three speaking portrait scenes. Three-frame blends; short closure preference and amplitude/VO window gates. This is 2D approximate lip sync, not validated Swahili phoneme tracking. `Record-Your-Voiceover.txt` and `timeline.json` are a reading/cut guide, not a substitute for a listen-through.
- **Review sound:** user-selected `sw/voice-05` scratch, six phrases at 1×, plus 16 original UI effects, no music/reference audio. `prepare-voice.py` edits to frame boundaries before making the mouth pass/SRT. `sfx.py` writes dry FX and mix. The MP4 has Swanglish captions baked only on the review cut; English SRT is optional. The silent logical edit master re-renders the three portrait scenes neutral-mouth and reuses the other picture frames. No narration, SFX or burned dialogue captions in the master. Add only `SFX-Only.wav` to it, not the scratch mix too.
- **Marks:** candidate OpenAI Blossom/Gemini icons in the private review from `@lobehub/icons-static-svg@1.104.0` (`openai.svg`, `gemini-color.svg`); not official asset/permission verification. Kept outside the fictitious UI. `WEBSITE_ERA_LABELS_ONLY=1` omits the marks while keeping names. Use a separate output restore/directory for that edit rather than replacing the review accidentally. Clear usage or use the text-only variant before public promotion.

## Rebuild (current Node LTS, Chromium, FFmpeg/FFprobe, Python 3)

Prereqs: FFmpeg with libass and libx264, fontconfig with DejaVu Sans, Pillow / NumPy / pypdf for rig and export QA. The Chromium executable can be supplied as `CHROME_PATH`. FFmpeg and FFprobe can be selected as `FFMPEG_PATH`/`FFPROBE_PATH`. From repo root or **`04-Rebuild/`** of the Owner Kit:

```sh
W=production/website-era
O=${WEBSITE_ERA_OUT:-out/website-era}
npm --prefix "$W" ci
npm --prefix "$W" test
node .agents/skills/altraware-search-reels/scripts/check-opening.mjs
npm --prefix "$W" run guide         # two-page WEB PDF + print fit checks
npm --prefix "$W" run reel -- stills # cover, staged proof, active vs relaxed mouth
npm --prefix "$W" run reel -- video  # synced picture, neutral-mouth master and final AAC/captions
python3 "$W/verify-and-pack.py" "$O" private-media/website-era \
  --ffmpeg "${FFMPEG_PATH:-ffmpeg}" --ffprobe "${FFPROBE_PATH:-ffprobe}"
```

The kit's rebuild tree has resolved assets/receipts and final audio, not the raw portrait source/reference clips/untrimmed takes. Stills need the restored dry VO/mouth table, and video needs `audio/Voice-and-SFX.wav`. Use `-- all` for stills and video together; `-- mux` uses the current SHA-validated uncaptioned synced picture and silent master and only updates the review mix/caption encode. A changed picture plan needs a full rerender. `WEBSITE_ERA_OUT` changes the Node output directory; pass it to the Python commands too.

With the original inputs, regenerate before rendering:

```sh
python3 "$W/rig-mouth.py" out/price-story "$O"
python3 "$W/prepare-voice.py" .cache/website-era/voice "$O/audio" --ffmpeg "${FFMPEG_PATH:-ffmpeg}"
node "$W/visemes.mjs" "$O/audio"
python3 "$W/sfx.py" "$O/audio"
```

`cues.json` is tied to the selected raw take lengths and hand-picked cuts. For new VO, recut cues manually first; then align visemes and captions to the actual new audio. Don't time-stretch the owner to match the synthetic read. Choose the relaxed-mouth picture if finishing directly in an editor; it matches the proof/edit timings, not the new VO lips.

## English-only edition

[Why Your Website Matters](../../content/pilots/14-website-era-en.md) keeps the same six scenes and original website captures. `cues.en.json` uses the chosen English audition and new word timings; `story-copy.ts`, `opening-en.plan.json` and the English stage timings localize the picture. English narration, captions, titles, cover and WEB PDF are all separate outputs. The English script replaces the rank disclaimer with the practical benefit: clear pages help search engines and AI tools understand what the business offers. The same claims/brand guards apply.

With the English kit's `04-Rebuild/` tree (or matching runtime assets and prepared audio under `out/website-era-en`), run:

```sh
W=production/website-era
export WEBSITE_ERA_LOCALE=en
O=${WEBSITE_ERA_OUT:-out/website-era-en}
npm --prefix "$W" ci
npm --prefix "$W" test
npm --prefix "$W" run guide
npm --prefix "$W" run reel -- all
python3 "$W/verify-and-pack.py" "$O" private-media/website-era-en --locale en \
  --ffmpeg "${FFMPEG_PATH:-ffmpeg}" --ffprobe "${FFPROBE_PATH:-ffprobe}"
```

If starting from the six raw English takes, use `prepare-voice.py ... --locale en` before the viseme and SFX commands. Old Swanglish masters and review files are not overwritten. Use the English checklist for the English Reel; keep private review links out of the public DM flow. Source/notes go in Git; captures, TTS inputs, WAVs, MP4s, owner kits and releases stay off Git.

## QA and release

The verifier checks decoded CFR timestamps and frames, AAC/mix and loudness, caption/quiet frames, visible mouth motion vs the relaxed master, safe caption bounds, evidence hashes and printed PDF. `qa/export-checks.json` and encoded phone stills document those checks. Phone listen-through/comprehension and actual IG UI, mark clearance, CTA approval and in-IG WEB delivery are owner gates. Nothing posted, shared publicly or deployed.
