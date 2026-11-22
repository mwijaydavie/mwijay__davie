# Runway engine · spec JSON → Reel

One engine for three accounts, plus a story track. A spec file describes what is on screen; `vo.json` describes what is
said; the engine renders 1080×1920/60fps H.264 with a burned-in caption track, an optional AAC
soundtrack, a character, and scene transitions. Everything is deterministic: the same inputs give
the same file.

```bash
npm install
npm test                          # 25 tests
node src/cli.mjs check  <spec>    # validate before rendering
node src/cli.mjs stills <spec> --frames 120,900
node build-audio.mjs <slug>       # voice + music -> out/runway/<slug>/mix.wav (updates the spec)
node src/cli.mjs video  <spec>    # muxes the mix if spec.audio.mix exists
node src/cli.mjs carousel <spec>
```

## The pieces

| File | What it owns |
| --- | --- |
| `src/core.mjs` | frame math, font measuring, SVG primitives, glyph fallbacks |
| `src/templates.mjs` | the three visual systems, cover/workflow/checklist/stat/cta layouts |
| `src/art.mjs` | reusable art: clip panels, charts, workflow, compare table, chrome |
| `src/nia.mjs` | **Nia**, the character: 9 poses, 1 sprite box, pure function of the frame |
| `src/story.mjs` | **story cast**: cut-out sheets, `castAt`, framings, props (CV / envelope / ledger) |
| `src/storyTrack.mjs` | **track 4**: the story look — warm lamp world, big serif headlines, the drawer, the tally |
| `tools/cutout.py` | backdrop → transparent PNG (colour key + edge flood fill), for new cast sheets |
| `src/motion.mjs` | scene transitions (`push`, `wipe`, `cut`) and the move schedule |
| `src/sound.mjs` | the soundtrack synthesised from scratch (pad, whooshes, ticks, sting) + ducking |
| `build-audio.mjs` | reads `vo.json`, measures clips, builds the mix, rewrites cue windows |
| `voice/README.md` | voice ids, how to re-record a line, what "cloning a voice" does and does not mean |

## Design decisions

- **Text is vector glyph paths, never `<text>` with a system font.** Resvg cannot resolve families
  here; paths keep every frame identical on any machine. Do not add `<text>` to a template.
- **The character is drawn, not generated.** Nia is ~100 lines of SVG from a frame counter: no image
  assets, no model call, no drift between renders. A generated character would cost per frame and
  would not stay consistent.
- **The story cast is a fixed set of rendered sheets, not a live model.** One portrait per
  expression, cut out once, embedded as base64 in the frame. Nothing is generated at render time,
  so a story reel re-renders byte-identically months later. Consistency comes from reusing the same
  sheets, which is also why they are reviewed once and then left alone.
- **Framing presets own the shot.** `hero` / `mid` / `close` in `src/story.mjs` decide her height
  and anchor; a spec says `framing: "close"` and nothing else. Type placement is derived from the
  preset, so a headline cannot land on her forehead.
- **Sound is synthesised, not sampled.** No sample library, no licence surface, no download. The bed
  is a two-note pad and filtered air; cues are filtered noise and decaying tones; deterministic
  xorshift noise means a re-render is byte-identical.
- **The picture follows the voice, not the other way around.** `build-audio.mjs` measures each clip,
  decides the scene length, and writes the *measured* cue windows back into the spec. Hand-written
  frames drift the moment a line is re-recorded; measured frames cannot.
- **One hard cut per reel.** Transitions are `push` by default, `wipe` on a turn, and the CTA always
  cuts. If everything slides, nothing lands.
- **Nia gets a column, not a collision.** Cover, workflow and checklist templates narrow to 672px
  when she stands on the right, and the validator warns if her feet enter the caption band.

## Timing model

| Thing | Nominal | Can grow? |
| --- | --- | --- |
| Scene | 5.5 s (330 frames) | yes, to `maxSceneSeconds` 7.4 s, driven by dialogue |
| Cue | authored in frames, rewritten from the mix | — |
| Transition | 12 frames (200 ms) | fixed |
| Reel | 5 scenes = 27.5 s | 25–45 s is the target band; validator warns past 60 s |

A scene that needs more than 7.4 s of dialogue is a script problem: split the beat, do not stretch
the scene.

## Verified

- `node --test test/engine.test.mjs` → 20 tests: tag balance, no NaN, determinism, pose timing,
  transition windows, bed loudness, cue containment.
- `t1-01-invoice-twice` → 34.2 s, 1080×1920, 60 fps, AAC 48 kHz stereo, mean −19.2 dBFS, peak
  −3.5 dBFS, decodes clean end to end.

## Limits

- No phoneme lip sync. Nia's mouth opens while a cue is active; do not cut to a close-up.
- No footage compositing: stills only. A2 archival clips still need cleared stills.
- No horizontal export, no captions burned in Swahili separate from English (one reel, one language).
- Audio is stereo-from-mono voice; there is no stereo placement or sidechain bus beyond the duck.

## Track 4 · the story track

Tracks 1–3 are 5.5s-per-beat explainers with one flat timeline. A story is not flat: a two-word
turn deserves four seconds and a twist deserves nine. Track 4 therefore allows **per-scene hooks**.

```json
{ "track": 4, "sceneHooks": [6.2, 3.4, 7.9, 6.5, 6.7, 5.5, 4.3, 7.3], "scenes": [ ... ] }
```

`build-audio.mjs` reads `vo.scenes[].hook`, sizes each beat to its own dialogue, re-places the clips
on the final boundaries, and writes the resolved `sceneHooks` back into the spec. The invariant is
**sum(sceneHooks) === audio.seconds**, so the picture never outruns the mix by a silent tail.
`framesPerScene(spec)` still works for tracks 1–3; `sceneStarts(spec)` / `sceneFrames(spec, i)` are
the layout-aware calls.

### What a story scene can say

| Field | Does |
| --- | --- |
| `mode` | `face` (her + one prop), `card` (type only), `stack` (the drawer), `tally` (one number) |
| `headline` | the **turn**, 2–4 words. `\n` forces a line break. Never transcribe the VO |
| `kicker` | place · time, or the name of the beat ("SI CV") |
| `quote` | a line of dialogue, on a torn strip |
| `tally` | `{n, label}` — counts into place |
| `cast` | `{pose, side, framing}` — pose is a sheet name, framing is `hero` / `mid` / `close` |
| `prop` | `cv` · `envelope` · `ledger` |
| `tone` | `warm` (Kariakoo daylight) or `cold` (the office, the turn) |
| `underline` / `strike` | a hand-drawn mark under, or through, the headline |

### Rules that keep it from looking cheap

1. **The subtitle carries the line; the headline carries the turn.** If they say the same thing you
   have burned half the screen for nothing.
2. **No scaling inside a shot.** The whole frame pushes (~2%), she does not.
3. **Cuts, not morphs.** A new expression is a new shot, usually a new side.
4. **One prop at a time**, in the half of the frame she is not occupying.
5. **The CTA appears once**, on the closing card, after the body has painted.
6. **`assertBalanced` runs on every frame** — an unclosed `<g>` paints nothing and throws nothing.

### Voice

`voice-03` (Kiswahili, female) is the story narrator. `pace` in `vo.json` time-stretches the read
without moving pitch (1.25 turns a 60s read into 48s); re-record rather than pushing past ~1.3,
where the consonants start to smear.
