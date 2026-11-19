# Altraware Code Story 01 · Build / rerender notes

**What was made:** an original 37s vertical pilot for the male Tech/Coding host, not a replacement for the female Business host. Hook → failed search → one line of defense → same order succeeds → separate old-error proof → **Comment SEARCH**. The signal is the screen's state, not a claim about real app speed.

## How we made it

1. **Prove the story first.** A handmade Promise queue fires `pilau` then `chai`. Resolve #2 first and settle #1 last in three deterministic runs. `lab.mjs` exports the trace that supplies the request rows and result values in the Reel. Node tests guard success and error, preserve the current loading state and still show the newest request's own error. Invalidate pending work on Clear. Timings in `layout.json` slow/accelerate beats for narration; they don't measure a network.
2. **Design two poses of the same host.** Generated a new full-body wave pose (violet glasses, curls, aubergine jacket, lavender tee, sneakers), then edited that art into a left-point / side-eye pose. Both original illustrations and the synthetic voice takes stay private. The Altraware mark is a separate overlay. No public photo or reference audio copied. The female host and first Business export are unchanged.
3. **Fix the float.** The whole poses are chroma-keyed; seven transparent parts include one shared pair of legs, two upper poses, two wrist pieces and two eyelid patches. The soles are aligned at source row 1309. In `TechHost.tsx` the bottom of the legs is fixed to the floor plane with a contact shadow under each shoe; only the torso pivots at the hip and the hands at the wrists. A short closed-lid patch gives the blink. We cut from friendly wave → more skeptical side-eye/point → wave; that's a pose change plus 2D motion, not simulated walking, skeletal animation or lip sync. Keep the floor line, both shoes and shadows visible on reuse.
4. **Cut to the take.** Five selected male `sw/voice-04` takes, trimmed at silences at 1×, set the five sections. `Story.tsx` ties the gestures, lane arrival, SVG trace and guard highlight to frame offsets. The before shot's last trace touches the result. The after shot stops short; a separate error beat changes just #1's outcome. The keyword has a small emphasis, then a hold. Swanglish captions on the review cut; optional English SRT. Human pronunciation and in-app crop still need owner review.
5. **Keep audio modular.** `sfx.py` synthesizes short taps, sends, return accents and a muted stop; no library tracks, music or audio from the Pinterest pins. The soft accents are about -28 dBFS peak on the FX stem. The shots and cue marks don't change if SFX are muted. Start with `Search-Race-Picture-and-SFX.mp4` and add your VO, or use `Search-Race-Clean-Picture.mp4` plus `SFX-Only.wav` on its own fader. Don't add the FX stem on top of the already-mixed SFX video. Use `Record-Your-Voiceover.txt` and re-time the SRT to your take. Both masters have no dialogue and no burned-in dialogue captions.
6. **Finish the offer.** `guides.mjs` prints a three-page SEARCH PDF including a tested paste-and-run example. `SEARCH-Code-Kit.zip` adds the tested lab source and trace. The same generator prints a separate filled/blank `SIZE` worksheet using Business Story 01's checked example as input. They're prepared for an approved DM destination, not published.

**Pinterest reference review not done:** all three [first](https://www.pinterest.com/pin/885872189233454908/), [second](https://www.pinterest.com/pin/791437334567656517/), [third](https://www.pinterest.com/pin/924363892282992611/) returned HTTP 403. No claims about those edits or audio. On receipt of owner-provided clips, compare timing of accent vs cut/spoken word, frequency overlap with VO, length and loudness; treat them as reference only.

## Reproduce

From repo root. Node 18+ for the lab/quick example; use a current Node LTS for the render tooling. For the render: pinned npm dependencies, Chromium (`CHROME_PATH` if supplied), FFmpeg with libass and DejaVu Sans Bold available, optional `FFMPEG_PATH`, FFprobe, and Python with Pillow / NumPy / OpenCV (`pypdf` for PDF QA).

```sh
npm --prefix production/search-race test      # no dependency install needed
npm --prefix production/search-race run lab
npm --prefix production/search-race ci
python3 production/search-race/rig.py .cache/search-race/art out/search-race
python3 production/search-race/prepare-voice.py .cache/search-race/voice out/search-race/audio --ffmpeg "${FFMPEG_PATH:-ffmpeg}"
python3 production/search-race/sfx.py out/search-race/audio
npm --prefix production/search-race run guides
npm --prefix production/search-race run reel -- stills   # cover + layout review
npm --prefix production/search-race run reel -- video    # 2,220 frames; mux both versions
python3 production/search-race/verify-and-pack.py out/search-race private-media/search-race \
  --ffmpeg "${FFMPEG_PATH:-ffmpeg}" --ffprobe ffprobe
```

Ready-to-use keyed assets and normalized stems can substitute for the two private input directories: restore kit `04-Source-And-QA/rig-assets/` to `out/search-race/assets/`, its `qa/` JSON to `out/search-race/qa/`, and `02-Record` timing/audio files to `out/search-race/audio/`. Keep the repo's `content/assets/altraware-mark.png`. The pose images are 768×1376, `host-rig.json` stores crop/pivot/sole coordinates and SHA-256s, and the render verifies them. `SEARCH_RACE_OUT` changes the Node output directory; match that in the Python args. `reel -- caption` uses an already-rendered and checksum-validated clean picture. For a caption-only update, don't change picture props or timeline. The tests and guide don't require raw artwork or VO.

**Release gate:** exact 37s/1080×1920/60 CFR proof + decoded frames and audio checks are in `qa/export-checks.json`; `guide-checks.json` records PDF fit and both runs. Watch with and without sound on phone before posting. For owner-recorded VO, check music/SFX against the new take, not only against the scratch WAV. Nothing has been posted or made public.
