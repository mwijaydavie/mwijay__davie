---
name: google-flow-cinematic-prompts
description: Write cinematic Google Flow (Veo) prompts for Altraware video ads — the layered formula (subject + action + environment + camera + movement + lighting + composition + mood), prompting vocabulary as art direction, and house rules. Use whenever the user asks for a Flow prompt, a Veo prompt, an AI video ad, a Flow generation, or to "ongezea cinematic direction" to a video concept.
---

# Google Flow cinematic prompts

Distilled from WebOpTech's "99 Google Flow Prompts & Commands for Cinematic AI Videos" (Manas Das, 24 Aug) plus everything we have hit shipping Flow prompts for Altraware. Read this before writing any Flow prompt.

**The one truth from the article:** there is no official 99-command slash language. Flow's documented interface is natural language. Slash terms are a vocabulary — use them as direction in sentences, never as literal commands:

> "/dollyin /goldenhour /shallowdepth" → write: "Slowly push the camera toward the subject during golden-hour light, keeping the background softly out of focus."

---

## 1 · The formula (use it every time)

**Subject + Action + Environment + Camera + Movement + Lighting + Composition + Mood**

Each layer has one job. Fill them in order. If a layer is missing, Flow invents it — and it invents badly.

Worked example (Altraware, ANZA LEO beat):

> "The presenter (attached reference image) wags a finger playfully, then offers an open-hand invite, eye-level medium close-up, slow 4% dolly-in throughout, warm golden key blown slightly warmer, she centred with negative space below for the end-card, calm signed-off African-warmth mood."

## 2 · The eight layers

| Layer | Ask yourself | Weak → strong |
|---|---|---|
| Subject | what matters most in frame? | "a person" → "the presenter from the reference image — same face, hair, gold hoops, black top" |
| Action | what are they doing, exactly? | "talks" → "bursts into frame mid-sentence, laughs, points at the viewer" |
| Environment | where does this live? | "a room" → "warm terracotta wall, soft string lights left, single wooden stool" |
| Camera | where is the lens? | "shot of her" → "eye-level medium shot, 35mm feel" |
| Movement | how does the frame change? | "camera moves" → "one whip pan at 0:08, then locked; handheld micro-float" |
| Lighting | what shapes the subject? | "good light" → "warm golden key from camera right, soft bounce fill, one subtle lens flare at 0:09" |
| Composition | what sits where? | "she's in the frame" → "she right-of-frame, left third open for kinetic type" |
| Mood | how should it feel? | "nice" → "playful conspiracy between friends; bright, not slick" |

## 3 · Vocabulary you can spend (as sentences, not slashes)

**Camera & movement** — cinematic · drone view (elevated) · close-up · wide angle · orbit (circle the subject) · dolly in (push toward) · dolly out (pull back) · tracking (follow the moving subject — always say what is being tracked) · slow motion · timelapse · low angle (looks up: power) · high angle (looks down: context) · POV · over-the-shoulder · establishing shot · rack focus (attention moves between planes) · handheld (realism) · steadicam (smooth walk-through) · crane up/down (reveal).

**Lighting** — golden hour (warm, portraits) · blue hour (cool, city/dusk) · soft light (beauty/product) · rim light (edge separation) · backlight (silhouette/portrait) · spotlight (focus) · volumetric (visible rays, atmosphere) · moody (dark tone — only if the brief wants it; Altraware = daylight).

**Composition** — wide · tight framing · minimal · leading lines · rule of thirds · symmetry · foreground element · frame-within-frame · diagonal · centred · negative space (leave room for text/end-cards).

**Focus & depth** — macro (tiny details) · shallow depth (isolate subject) · deep focus · selective focus · eye focus · bokeh (soft highlights).

**Colour** — warm · cool · contrast · saturation up/down · teal-and-orange · vibrant · monochrome · film grain (use sparingly).

Never spend more than ~2 of these per shot. Effects are garnish, not the meal.

## 4 · What Flow is bad at (and the fix)

| Failure | Fix |
|---|---|
| Kiswahili speech comes out with wrong rhythm/accent | **Never let Flow voice Swahili.** Generate visuals, record VO separately (~2.8–3 words/sec) |
| Small UI text = gibberish | Compose real screen recordings in the editor; keep Flow text ≤ 2 lines, huge |
| Face drifts between clips | Same reference image every generation; name the wardrobe ("same gold hoops, black top") in the prompt |
| Overloaded prompt = mush | One subject, one action, one move per shot. Change one variable per regenerate |
| Contradictory direction | "Slowly pushes in while rapidly pulling away" → never. Pick one |
| Effects pile-up | One lighting + one camera move per shot, max |
| Platform not named | 9:16 Reels/TikTok/Shorts vs 16:9 YouTube — always state it. Safe text zone differs |
| "Cool" / "beautiful" / "amazing" | Useless. Replace with temperature of light, lens feel, composition |

## 5 · Altraware house rules

- **Daylight, never neon-black.** Cream #FBF7EF, sand #F4E3C4, warm terracotta, one violet accent (#5B3FB5), ink type (#1D2A33). Tech ≠ black.
- **Reference is law**: `image-30.png` (presenter) or the approved Noellyne rig stills. Same face, same hair, same hoops every clip — name them in every prompt.
- **Text discipline in-frame**: max 2 lines, ≥4 words, huge; final legibility passes through the editor, not Flow.
- **Reality check**: product UIs (Faida POS, CareTrack) enter via screen recording comped in the editor — never via Flow's hallucinated UI. Demos are simulations; never claim real transactions happened in-ad.
- **Voice**: Flow silent; VO recorded properly; Kiswahili burned-in captions; music below voice (-18 dB).
- **Length**: 10 s per generation, 3 clips = 30 s. Regenerate 2–4× per clip; the first render is a sketch.
- **End-card**: logo + domain type-out + tagline ("Technology that speaks our language.") — always built in the editor over a Flow-made backdrop or a clean cream card.

## 6 · Prompt template (copy, fill, ship)

```
Vertical 9:16 (or 16:9), <N> seconds, <Altraware commercial / Reels short>.
Subject: <who, from the attached reference image — name wardrobe/details>.
Action: <what they do, in order, with timestamps>.
Environment: <place, set dressing, props>.
Camera: <height, lens feel, framing for the whole shot>.
Movement: <the ONE camera move (plus micro-float if handheld)>.
Lighting: <key + fill + one accent, with direction and temperature>.
Composition: <where subject sits; negative space for type/end-card>.
Mood: <one sentence of emotional direction>.

<Swahili VO lines, timed 0:00–0:XX — lips clearly moving.>
Motion graphics (simple, big, one language): <list each pop/card/line as a sentence>.
SFX: <2–4 cues>. Music: <enters/swells where>. Audio: <who voices — Flow silent, VO recorded>.
```

## 7 · Before you hit Generate (checklist)

1. Subject/environment/lighting reference named? 2. Exactly one camera move?
3. ≤2 lines of text anywhere? 4. Swahili voice off? 5. Platform + aspect stated?
6. End-card plan stated? 7. Claims match the site? (see UFAME in `production/altraware-ad/README.md`)

After generating: watch on a 6-inch phone, muted, at arm's length. If you can't read a single line, Flow gets cut and the editor builds it.

## 8 · Worked examples

The general/fun 30s Altraware ad ("Sema boss!") and the product variant (Faida + CareTrack) — prompts, timings, MG callouts — live in `production/altraware-ad/README.md` and `Altraware-Tangazo-Kiswahili.pdf` (Drive). If those drift from this skill, the skill wins on *method*; the files win on *current copy*.
