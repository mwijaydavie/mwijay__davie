# Runway engine · spec JSON → Reel

One engine for three accounts. A spec file describes what is on screen; `vo.json` describes what is
said; the engine renders 1080×1920/60fps H.264 with a burned-in caption track, an optional AAC
soundtrack, a character, and scene transitions. Everything is deterministic: the same inputs give
the same file.

```bash
npm install
npm test                          # 20 tests
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
