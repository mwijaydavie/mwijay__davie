# Nia — the account character

> **Status: superseded for the story track.** Nia is the paper-card character used by
> tracks 1–3 (documents, tool comparisons, business stories). The story track (track 4) uses
> a rendered human cast — see §"Story cast" below. Both are documented here because they are
> the same role: the face that makes the feed recognisable.

---

## Story cast (track 4)

A young Tanzanian woman, rendered in a stylised 3D look, used as the narrator-performer of
the *Mjomba Daudi* story reels. She does not explain a document; she reacts to one.

### Why a rendered human at all

Track 1–3 posts are about objects (an invoice, a phone, a workflow), so a paper card that is
literally a document is the right mascot. A story needs a face the audience will come back
for: someone who can look tired, get shocked, and then laugh. That is a performance, and a
performance needs eyes.

### Identity rules (fixed — never change per episode)

| Trait | Value |
|---|---|
| Silhouette | black satin head-wrap, knot at the back-left, short afro puff below it |
| Face | warm brown skin, wide-set brown eyes, black winged liner, full lips |
| Jewellery | thin gold chain + small gold cross, small gold studs |
| Wardrobe | charcoal blazer, cream collared blouse |
| Framing | chest-up, three-quarter, shoulders square to camera |
| Background | never a room; a warm wash with one lamp pool behind her |

Changing any of these breaks recognition. Outfits and expressions may grow; the sheet, the
chain and the shoulder line may not.

### Sheets we hold (assets/character/)

| Pose | File | Use |
|---|---|---|
| `calm` | `nia-office-cut.png` | narration, listening, the default |
| `shock` | `nia-shock-cut.png` | the turn — eyebrow up, mouth open |
| `laugh` | `nia-warm-cut.png` | the payoff, the closing card |

Every sheet is a **transparent PNG** produced by `tools/cutout.py` from a rendered portrait:

```bash
python3 tools/cutout.py in.png out.png --bg purple   # or --bg auto
```

The cut is a colour test plus a flood fill from the frame edge, then a 1px shave and a
feather, so the subject keeps a clean silhouette against any background. It is deterministic
and needs no model download.

### Directing rules

- **Never scale her inside one shot.** A photo that grows reads as a cheap zoom. Move the
  whole frame, or cut.
- **One pose per shot; a pose change is a cut.** The eye forgives a cut and never forgives a
  morph between two photographs.
- **Type lives above her head.** Framing presets (`hero` / `mid` / `close` in `src/story.mjs`)
  anchor her so the headline always has the top third to itself.
- **Keep her clear of the subtitle band** (y ≥ 1470). Chin above 1430, always.
- **Two props maximum.** The CV, the envelope, the January ledger. She holds one idea at a time.
- **One expression per beat.** If the line is not shocking, do not use the shock sheet.

### Legal / brand guardrails

- The character is **fictional**. She is not modelled on a real person, and the reference
  portrait was used only to fix a look.
- **No third-party marks on her clothing.** The original tee carried an "XO / BE KIND" chest
  print; that sheet was retired for that reason (and because a right-side shot mirrors the
  plate, which would publish the mark reversed). Do not reintroduce it.
- Do not publish a sheet that has not been cut out (a coloured rectangle of backdrop behind
  her reads as a broken asset).

---

## Nia — the paper-card character (tracks 1–3)

A document card with a folded corner, a lime tab, and two amber eyes. Her head is literally
the object every Reel is about (a form, a sheet, a page), so the silhouette reads as "this
channel" before the text is legible.

Pure SVG from a frame counter: same input, same pixels. No external assets, so she costs
nothing per render. Each appearance flexes ONE parameter from a fixed set:

| # | Pose | Reads as |
|---|---|---|
| 0 | `idle` | present, breathing |
| 1 | `perk` | "listen to this" |
| 2 | `lean` | confiding |
| 3 | `present` | "here it is" |
| 4 | `tick` | confirming a step |
| 5 | `nod` | agreeing |
| 6 | `point` | directing attention |
| 7 | `celebrate` | payoff |
| 8 | `solve` | the answer |

Usage: `nia(frameInScene, {x, y, scale, pose, accent, tab, ink, talk})`
Drawn in a 200×200 box with the transform applied by the caller, so motion stays inside the
safe area. Deterministic breath (144 f) and blink (186 f).

### Fixed vs flexible

**Fixed:** head 132×124, folded top-right corner, lime tab `#DFFC77`, rust eyes `#C2410C`,
cobalt glove `#3343C5`, two-sheet body, ink outline.

**Flexible:** pose, scale (0.6–1.0), accent + tab colour (follows the track theme), label
text, x/y position (respect the safe area).

### Placement limits

- Nia sits in a 200×200 box; her feet land at about +130·scale.
- Below y ≈ 1330 she enters the caption band.
- At scale 1.0 she collides with keyword lines unless x ≥ ~870.

### Clutter rules

- One Nia per frame. Never two poses at once (a scene change is the only way to change pose).
- She may overlap a card, never a line of text.
- If a scene already has a prop (clip, chart, table), she stays out of it unless she is
  pointing at one specific thing.
