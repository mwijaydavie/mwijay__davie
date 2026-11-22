# Nia · the character

The account needs one face a viewer recognises before reading the username. Nia is that face: the
document card from every Reel, given eyes, a lime bookmark tab and one blue glove.

**Hali: tayari kwenye engine (`production/runway-engine/src/nia.mjs`).** Ametumika kwenye t1
(Reel ya kwanza). Hajaruhusiwa kubadilika sura baada ya post ya kwanza; anaruhusiwa kubadilisha
pose tu.

## Why a document and not a presenter

| Option | Why it was rejected / chosen |
| --- | --- |
| AI presenter (human) | Reads as a fake testimonial; every channel has one; faces drift between renders |
| Animal mascot | Cute, but says nothing about the niche; belongs to anyone |
| **Paper card with a face** | **Chosen.** Her head *is* the object the account talks about: a form, an invoice, a checklist. The silhouette is the brand mark |
| Logo only | Identifies but cannot act: cannot look surprised, point, approve, celebrate |

Three details carry her identity at thumbnail size: the **lime bookmark tab** (top-right), the
**rust-orange eyes**, and the **folded corner**. Remove any one and she stops being Nia.

## Fixed traits vs flexible ones

| Fixed (never change) | Flexible (per scene) |
| --- | --- |
| Head = white card, 132×124, rounded 18px, 4.5px ink stroke | Position on screen |
| Lime tab on the top-right, behind the head | Scale (0.5 for a background beat, 1.0 for a column) |
| Folded top-right corner | Pose (nine approved, below) |
| Rust-orange eyes, ink brows, one blue glove | Mouth open while a cue is speaking |
| Body = short stack of sheets with two ruled lines | Accent colour of the glove follows the account |

Across accounts she stays the same character but takes the account's accent: cobalt glove on A1,
lime on A2, terracotta on A3. That is how a viewer knows it is the same studio but a different feed.

## The nine poses

| Pose | Meaning | Typical beat |
| --- | --- | --- |
| `idle` | listening | first frame of a scene |
| `perk` | "oh — this one" | hook |
| `lean` | thinking | explaining a trap |
| `present` | "here it is" | introducing the file or the step |
| `tick` | confirming | a checklist row lands |
| `nod` | agreement / "yes, still true" | the boundary line |
| `point` | look at this | a number on screen |
| `celebrate` | payoff | the CTA |
| `solve` | the answer | resolution |

A scene chooses its poses with a beat list, so she reacts to the line, not to a timer:

```json
"nia": {"pose": "tick", "x": 862, "y": 960, "scale": 1.0,
        "poses": [{"at": 0, "pose": "idle"}, {"at": 90, "pose": "tick"}, {"at": 200, "pose": "nod"}]}
```

## Rules that keep her from becoming clutter

1. **One appearance per scene.** She is a presenter, not wallpaper.
2. **She never covers a caption.** `validate` warns if her feet land in the caption band
   (y > 1462). Raise `nia.y` or move her aside.
3. **Text gets a column, not a collision.** When she is on the right, the cover, workflow and
   checklist templates narrow to 672px so nothing runs underneath her.
4. **She opens and closes every Reel.** Scene 1 defaults to `perk`, the CTA to `present`, even
   if the spec says nothing.
5. **No face close-ups.** Her mouth opens on speech but does not lip-sync; keep her between 0.5
   and 1.0 scale.

## What is not decided yet

- Her name is on-screen as `NIA` in mono caps under her body. If the accounts get their own names,
  that label should change with them — one label per account, not three characters.
- She has no accessories yet (a pen, a stamp, a receipt). Add one only if a specific post needs it,
  and add it to the fixed-traits table above on the same day.
- A2 (stories) may want her only at the start and end, not mid-episode: the story is about the
  companies, not about her. That is a per-track rule, not a per-post decision.
