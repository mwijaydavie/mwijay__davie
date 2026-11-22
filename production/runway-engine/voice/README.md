# Voice · Nia speaks

Every Reel is voiced by the same two voices: one English, one Kiswahili. Both were auditioned
against this channel's copy, not against a generic demo line, so the read matches the pacing the
Reels are cut for.

| Track | Language | Voice id | Where it is used |
| --- | --- | --- | --- |
| A1 · Mwijay Systems | English | `voice-00` | every A1 Reel |
| A2 · The Decision File | English | `voice-00` | every A2 episode (slower, darker mix) |
| A3 · Mwijay Tools | Kiswahili | `voice-01` | every A3 Reel |

Idioms, emphasis and pacing live in the text, not in the engine: write the clip the way it should
be read.

## About "cloning" a voice

Two different things are worth separating:

- **Same voice every time.** `voice-00` / `voice-01` are fixed ids. A given id always resolves to
  the same speaker, so a reel rendered next month sounds like the one rendered today. That is the
  practical version of "clone a voice", and it is already in place — nothing to install.
- **A clone of a specific person.** Cloning a real person's voice needs that person's recording and
  their written consent, and the tool that does it (training or a zero-shot TTS model) is not
  something this sandbox can run offline. It is also a poor fit for the accounts: a synthetic
  presenter is a *character* voice, and holding one consistent character voice is the point. If you
  want your own voice on A1 later, record it — `build-audio.mjs` takes any mp3/wav, so a real take
  drops into the same pipeline without changing a line of the engine.

## How a reel gets its voice

1. **Write the lines** into `vo.json` next to the spec, one clip per spoken beat:

   ```json
   {
     "voice": "English · female · voice-00",
     "voiceId": "voice-00",
     "sceneSeconds": 5.5,
     "spacedThrough": 4,
     "cues": ["rise", "whoosh", "thud", "whoosh", "whoosh", "cut"],
     "clips": [
       {"scene": 1, "file": "production/runway-engine/voice/t1-01/s1.mp3", "text": "You're typing every invoice twice."}
     ]
   }
   ```

2. **Render the clips.** One `generate_speech` call per clip, saved under
   `voice/<slug>/s<N>.mp3`. Keep the text in sync with what you generated — `text` is what the
   caption shows.

3. **Build the mix.** `node build-audio.mjs <slug>`:
   - normalises each clip to 48 kHz mono, trims head/tail silence to 120 ms, loudness-normalises
     to −16 LUFS;
   - measures each clip, then decides the scene length from the *longest* scene of dialogue
     (it grows past 5.5 s rather than dropping a line);
   - writes `out/runway/<slug>/mix.wav` (voice + bed + cues + sting), `audio.json`, and updates
     the spec with `sceneSeconds`, `audio.mix` and **measured cue windows** — captions can no
     longer drift from the voice.

4. **Render.** `node src/cli.mjs video <spec>` picks up `spec.audio.mix` and muxes an AAC track.

## Timing rules the builder enforces

| Rule | Why |
| --- | --- |
| Cue `in`/`out` come from the measured clip, not from hand-written frames | captions must match the audio after any re-record |
| `spacedThrough: N` lets scenes 2..N start on the grid and then run on from the previous line | three short chips (who / what / how much) stay one beat instead of stretching into three scenes |
| A scene may not exceed `maxSceneSeconds` (7.4 s) without a warning | a long silent tail is what makes a Reel feel slow |
| Bed ducks −9 dB under voice | phone speakers, small room, words must win |
| Everything is deterministic | a re-render produces byte-identical audio for the same clips |

## Re-recording one line

Replace `voice/<slug>/s<N>.mp3`, update `text` in `vo.json`, re-run `build-audio.mjs`, re-render.
Nothing in the templates changes: the cue windows and scene length are recomputed from the clip.

## Limits

- The voices are TTS. They read well but they will not laugh, shout or sigh; write around that.
- No phoneme-level lip sync — Nia's mouth opens while a cue is active, it does not track vowels.
  At Reel scale and 5-second scenes that reads correctly; do not cut to a close-up of her face.
- Kiswahili clips are read by a Kiswahili voice (`voice-01`); do not feed English clips to it, the
  stress pattern comes out wrong.
