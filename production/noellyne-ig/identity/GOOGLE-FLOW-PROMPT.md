# Noellyne — Google Flow prompt (cinematic motion intro)

Paste-ready prompt for **Google Flow** (Flow with Gemini / Veo). Flow animates a
**still you supply**, so the job of the prompt is not to invent her — it is to
tell Flow what to move, what to leave alone, and how the camera behaves.

Use it with `out/look-plum.png` (or the head-and-shoulders crop of it). Read
**§ 0** before you paste, and **§ 6** if the first take drifts off-model.

---

## 0. Before you paste — three rules

1. **Upload the still, do not describe her into existence.** Every word spent on
   her hair is a word Flow spends re-inventing her. Say *"preserve the woman in
   the reference image exactly"* and let the picture carry the identity.
2. **Short clips, cut together.** Flow gives you 8 s per generation. Ask for one
   move per generation and cut them — not one 8 s clip that pans, zooms, blinks
   and turns. Four small clips cut together always beat one crowded one.
3. **No camera move that reveals her legs.** She is a half-body rig. Push in,
   drift sideways, tilt a little — never pull back, never crane down, never
   dolly around to show the floor she is standing on.

---

## 1. The main prompt — "she comes alive" (vertical, 9:16)

> Cinematic 3D animated portrait, vertical 9:16, 8 seconds.
>
> **Reference:** preserve the woman in the reference image exactly — same face,
> same dark-brown skin with warm undertones, same twin rounded curly afro puffs
> with copper ringlets, same small gold hoop earrings, same round violet
> sunglasses resting **on top of her hair, never over her eyes**, same textured
> periwinkle-blue hoodie with its small embroidered chest patch. Do not restyle
> her, do not change her age, do not change her outfit.
>
> **The action:** she is looking slightly off-camera, then her eyes find the
> lens. A small, warm, closed-lip smile arrives a beat later. One slow natural
> blink at 0:02. A tiny nod at 0:05. Her left hand lifts into a relaxed
> half-wave that stops at shoulder height — it does **not** come toward the
> camera and it does **not** leave the frame. Nothing else moves.
>
> **The camera:** very slow push-in, about 6 % over the full eight seconds,
> locked-off horizon, no handheld wobble, no parallax shift. The framing never
> changes: head-and-shoulders, her eyes sitting on the upper third, the top of
> her puffs just inside the frame.
>
> **The light:** soft key from camera-left, a cool violet rim light from behind
> separating her shoulders from a deep plum background, a faint lavender haze
> low in the frame. The key does not flicker and its direction never changes.
>
> **The background:** a quiet deep-plum studio with a single soft violet glow
> behind her, a few very faint out-of-focus dust motes drifting slowly upward.
> No text, no logos, no props entering frame.
>
> **Avoid:** photoreal skin, changing her hairstyle, adding sunglasses over her
> eyes, adding hands or fingers that did not exist, morphing her hoodie, rapid
> camera moves, zoom-out, full-body reveal, feet, text, captions, watermarks,
> extra people, lens flare, film grain heavier than a whisper.

---

## 2. The four shots — copy/paste each one separately

Generate these as **four separate 8-second clips**, then cut them at the points
in § 4. Each prompt keeps § 1's reference block and light block; only the
**action** and **camera** lines change.

### Shot A — the greeting (wave)
> **Action:** she raises her right hand and gives one warm, unhurried wave —
> fingers together, wrist relaxed, two small arcs — then lowers it. She is
> smiling straight at the lens the whole time.
> **Camera:** static with a 3 % push-in. The hand must stay inside the frame.

### Shot B — the introduction (hands clasped)
> **Action:** hands loosely clasped in front of her chest, she tips her head a
> few degrees to one side, holds the lens with her eyes, and gives a single
> confident nod on the last beat.
> **Camera:** a slow lateral drift, 40 pixels left to right across the clip,
> like a slider, not a pan.

### Shot C — the point (making a point)
> **Action:** she lifts her right index finger to chest height and points
> slightly off-camera to her left, as if saying *"this one, look at this"* —
> then her eyebrows lift a touch and she looks back to the lens.
> **Camera:** slight push-in, then settle. No tilt.

### Shot D — the sign-off (peace)
> **Action:** she brings up a peace sign beside her cheek, holds it, and her
> smile widens a little as she leans in toward the lens by a few centimetres.
> **Camera:** a gentle push-in that ends a touch closer than it started.

---

## 3. The B-roll (no person) — for cutting under the voice

Six seconds each, same palette. These give you something to cut to, so her face
is not on screen for the full sixteen seconds.

> Cinematic macro shot, vertical 9:16. A sheet of cream paper with faint
> technical grid lines floats slowly in deep-plum space, rotating two degrees,
> catching a soft violet rim light along one edge. Very shallow depth of field,
> the background a smooth plum-to-black gradient. Slow drift to the right. No
> text, no writing, no hands, no person.

> Cinematic shot, vertical 9:16. A thin lavender circle drawn in space rotates
> slowly, exactly one quarter turn over six seconds, while a soft light travels
> around it once. Deep plum background, faint dust motes, generous negative
> space on the left. No text, no person.

> Cinematic shot, vertical 9:16. Thirty small paper squares in cream, lavender
> and gold drift gently upward through a dark violet void, tumbling slowly, out
> of focus in the foreground, sharp in the middle distance. Calm, no turbulence,
> no wind, no camera shake.

---

## 4. Cut sheet — where each clip lands

The audio is 16.47 s. These are the measured cut points from `out/timeline.json`:

| # | In | Out | Clip | On screen |
|---|----|-----|------|-----------|
| 01 | 0.27 s | 3.63 s | **Shot A** (wave) | `Tech` / `inakuchanganya?` |
| 02 | 3.90 s | 8.13 s | **Shot B** (clasped) | `MIMI NI` / `Noellyne.` |
| 03 | 8.43 s | 12.57 s | **Shot C** (point) | `APPS · AI · TOOLS` / `bila hype.` |
| 04 | 12.87 s | 15.40 s | **Shot D** (peace) | `FOLLOW` / `tukutane hapa.` |

Cut on the syllable, not on the frame: the last word of each line is the edit
point. Insert one B-roll clip (0.6–0.9 s) between 02→03 and 03→04 if the voices
feel too wall-to-wall.

---

## 5. The voice lines

Record these yourself if you can — the read is the whole personality. If you use
a synthetic voice, keep one voice for all four lines and keep it dry.

| Beat | Line | Notes |
|------|------|-------|
| 01 | *"Tech inakuchanganya? Tuiweke rahisi."* | Question up, answer down. Genuine, not salesy. |
| 02 | *"Mimi ni Noellyne, tech host wa Altraware."* | Slower. Let the name land. |
| 03 | *"Apps, AI, tools. Bila hype."* | Three items, even rhythm, then a small pause before *bila hype*. |
| 04 | *"Follow — tukutane hapa."* | Warm, inviting, not a command. |

Mix: voice at −16 LUFS short-term, bed at −34, one soft cue per cut. **No
risers, no whooshes, no impacts.** The restraint is the brand.

---

## 6. If Flow drifts off-model

The failure modes, in the order they happen:

| What you see | What caused it | Fix in the prompt |
|---|---|---|
| She becomes photoreal | "cinematic" pulls toward film | add **`stylised 3D animation, Pixar-grade subsurface skin, not photographic`** |
| Sunglasses slide onto her eyes | Flow "helpfully" completes the look | add **`the sunglasses remain resting on top of her hair throughout, her eyes stay fully visible`** |
| A second hand appears / fingers multiply | motion blur on a fast gesture | add **`exactly two arms, five fingers per hand, no extra limbs`** and slow the gesture |
| Her hoodie changes colour or cut | the prompt described the outfit too loosely | do not describe it at all — rely on **`preserve the reference image exactly`** |
| The camera pulls back and shows no legs | "cinematic" implies a wide | add **`the camera never pulls back; framing stays head-and-shoulders for the entire clip`** |
| Her puffs jiggle like jelly | too much motion amplitude | add **`her hair moves only slightly, with weight, as real curls do`** |
| Background turns into a room | model adds context | add **`the background stays an abstract deep-plum studio void; no walls, no furniture, no windows`** |

---

## 7. Export settings

| Platform | Size | Notes |
|---|---|---|
| IG Reel / Story | 1080 × 1920, 9:16 | keep type inside the middle 80 % so the UI does not eat it |
| IG feed (4:5) | 1080 × 1350 | crop from the 9:16 master, or use `out/scenes/look-*.png` |
| YouTube (16:9) | 1920 × 1080 | re-frame, do not letterbox — see `out/intro-yt.mp4` |
| YouTube Shorts | 1080 × 1920 | same master as IG |

Bitrate 12–16 Mbps H.264 for upload; let the platform transcode down. Loudness
−14 LUFS integrated for IG and YouTube.
