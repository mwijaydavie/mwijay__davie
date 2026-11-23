# Noellyne — identity pack (IG + YouTube)

One character, one palette, four formats. Everything here is generated from the
same rig in `production/noellyne-host/`, so the banners, the avatar, the feed
scenes and the video all agree with each other.

Read `../CREATIVE-GUIDE.md` first — it carries the identity rules. This file
carries the files.

## What is in here

| File | Size | Use |
|---|---|---|
| `out/banner-ig.png` | 1080 × 1920 | IG Story / Reel cover / highlight cover |
| `out/banner-yt.png` | 2048 × 1152 | YouTube channel banner (text inside the 1235 × 338 safe area) |
| `out/avatar.png` | 1024 × 1024 | profile picture for both platforms |
| `out/scenes/look-plum.png` | 1080 × 1350 | feed post — mint intro |
| `out/scenes/look-studio.png` | 1080 × 1350 | feed post — the desk |
| `out/scenes/look-room.png` | 1080 × 1350 | feed post — making a point |
| `out/scenes/look-sky.png` | 1080 × 1350 | feed post — the sign-off |
| `out/intro.mp4` | 1080 × 1920, 16.5 s | Reel / Story / Shorts intro |
| `out/intro-yt.mp4` | 1920 × 1080, 16.5 s | the same cut, re-framed for YouTube |
| `GOOGLE-FLOW-PROMPT.md` | — | paste-ready prompt for a cinematic motion version |

## The video

16.47 s, four shots, one voice.

| # | Set | Pose | On screen | In |
|---|---|---|---|---|
| 01 | violet sky | wave | `Tech` / `inakuchanganya?` | 0.27 s |
| 02 | plum studio | clasped | `MIMI NI` / `Noellyne.` | 3.90 s |
| 03 | amber room | point | `APPS · AI · TOOLS` / `bila hype.` | 8.43 s |
| 04 | desk, mint | peace | `FOLLOW` / `tukutane hapa.` | 12.87 s |

Every shot pushes in ~5 %, has its own travelling light, and ends on a six-frame
dip so the cuts do not snap. The type sits under her measured hem on a floor
scrim — never over her silhouette, never on a card.

### The audio

Four spoken lines, one 62 Hz bed at −26 dB, four soft cues — one per cut. No
risers, no whooshes, no impacts. The restraint is the point.

The cut points in `out/timeline.json` are **measured from the actual voice
clips**, not typed by hand. Re-record a line, re-run `mix.py`, re-run
`intro.mjs`, and the picture follows the voice.

## Rebuilding

```bash
# stills
node production/noellyne-ig/identity/banners.mjs

# audio (writes out/intro.wav + out/timeline.json)
export FFMPEG=$(ls $PWD/.cache/rt/imageio_ffmpeg/binaries/ffmpeg-* | head -1)
PYTHONPATH=$PWD/.cache/rt python3 production/noellyne-ig/identity/mix.py

# video — both aspects
node production/noellyne-ig/identity/intro.mjs                     # out/intro.mp4
node production/noellyne-ig/identity/intro.mjs --landscape         # out/intro-yt.mp4

# a contact sheet of one frame per shot, to check placement without encoding
node production/noellyne-ig/identity/intro.mjs --stills=a:40,b:150,c:260,d:400
```

Voice lines live in `audio/01-hook.mp3` … `04-cta.mp3`. Replacing a file with a
different length is safe — `mix.py` re-measures and the edit moves with it.

## Layout rules learned the hard way

- **IG banner**: she is 880 px wide at `0.190 H`. Her ink bottom is at
  `y + w × 0.985`; the wordmark block starts at `max(hem + 210, 0.735 H)`. The
  wordmark must own a measured clear band — type over the silhouette was tried
  three times and failed three times.
- **YT banner**: never centre her. Type in the left column inside the
  1235 × 338 safe area, her cropped by the right edge. Centring puts the name
  through her head.
- **Feed scenes (4:5)**: she is 780–800 px at `0.10–0.13 H`; the headline starts
  at `max(hem + 96, 0.855 H)` above a floor scrim, and the bottom-corner paper
  sheets live in the top third so they cannot cross the type.
- **Video**: tall frames type from the hem down; wide frames put type in a left
  column with a gradient scrim that fades out by `0.78 W`.

## Palette

`VIOLET #6444bf` · `PLUM #0e0716` · `LAV #b8a6ff` · `CREAM #f7f1e6` ·
`GOLD #f2c66d` · `MINT #3ddc97`

## What not to do

- Do not put the sunglasses over her eyes. They live on top of her hair.
- Do not frame her full-body. She is a half-body rig; the desk is what makes the
  bottom of the frame honest.
- Do not add a text card on a cream mat. Every frame is built, full bleed.
- Do not stack two audios. One voice, one bed.

## Drive links (public) — v3 (current)

**v3** replaces the v2 uploads for anything that changed: the videos (raw-plate
double-draw is gone — her jaw finally has no dark smudge), the banners, the
four feed scenes, the poster and the thumbnail (all carry the **photo props**:
laptop, mug, plant). New: the **Tech Bila Hype** PDF and the comment-PDF feed
and story creatives. The avatar is unchanged, so v2's link stands.

| Item | Link |
|---|---|
| **IG Reel / Story (v3)** | https://drive.google.com/file/d/16r89JYcTwOPig3LqyO9QMqWz1i0bkoQq/view |
| **YouTube (v3)** | https://drive.google.com/file/d/1To2xcIPIkuSGdlUCl0FP7ktZ4-VZ5Ejk/view |
| IG banner (v3) | https://drive.google.com/file/d/1Q_mSmAUGGBEELAfaGTX7rROqy8ikphF1/view |
| YouTube banner (v3) | https://drive.google.com/file/d/1e2l9AHpg67INO9d0oxgaRZfvNUfVRrwA/view |
| Avatar | https://drive.google.com/file/d/1Rs_AU6DV1iSUK13QiCLvCZDAivcJCuOZ/view |
| Feed 01 — Studio (v3) | https://drive.google.com/file/d/1W6FKEkfjOQNBc9KGPzO1u_K-O807HmZ_/view |
| Feed 02 — Desk (v3) | https://drive.google.com/file/d/14up8AvZ33eifxWEo7F6Kdw4pJ1GUpGJ_/view |
| Feed 03 — Floor (v3) | https://drive.google.com/file/d/1UiN_RhkuM91KLXQ2hW7l6cmRPzjNszCc/view |
| Feed 04 — Outro (v3) | https://drive.google.com/file/d/1FtGzng8-vH7hlNBsJWaptLODuITVI89N/view |
| YouTube thumbnail (v3) | https://drive.google.com/file/d/1kIawzvDx9qWS4viWIs8zHnt3XD_oYYGD/view |
| Reel cover (v3) | https://drive.google.com/file/d/1-visou7_n0ryalGY-ZPQH8lYYaTR30jN/view |
| **Tech Bila Hype PDF (free)** | https://drive.google.com/file/d/1bWXa_u4wR9pwoMC4mnlKdrsrjrLcDaJ2/view |
| **Feed post — comment 'PDF' (4:5)** | https://drive.google.com/file/d/1LE02AmJ3Q55tO5UrCAMVcJyEr5b6_IRm/view |
| **Story — comment 'PDF' (9:16)** | https://drive.google.com/file/d/1rdzmMXeocfSurT8_g97Ryz7hOm2v0N-B/view |

## Drive links (public) — v2 (superseded)

**v2** answers three notes: daylight instead of black/neon, a mouth that moves, and a desk in front of her so she never reads as a floating sticker.

| Item | Link |
|---|---|
| **IG Reel / Story** | https://drive.google.com/file/d/1RM0Q6Ip4S0UKmhJXUa_vjj-OQgsVSUfD/view |
| **YouTube** | https://drive.google.com/file/d/1jFTTUZBk16fQBIv61kWQmZJP1k8dCxTz/view |
| IG banner | https://drive.google.com/file/d/1Jnl9yBvsDubnnvmXbflMy4ne-UwQuJwk/view |
| YouTube banner | https://drive.google.com/file/d/1hLQdffw8cYLxIwcruNwWR4zSNPooar7O/view |
| Avatar | https://drive.google.com/file/d/1Rs_AU6DV1iSUK13QiCLvCZDAivcJCuOZ/view |
| Feed 01 — Studio | https://drive.google.com/file/d/17y1jNSmAnkldiZJ4NKsZgxWmLTexguaE/view |
| Feed 02 — Desk | https://drive.google.com/file/d/1JcT9BTwJllRi2YJM-mHITh_CxZzJt0iY/view |
| Feed 03 — Floor | https://drive.google.com/file/d/1h7r0RZHmJ0RRU81gEtQSyRowrDXMQQsl/view |
| Feed 04 — Outro | https://drive.google.com/file/d/1nIRgSDbGTik0T6HzSSB-GIZf00VIeh0a/view |
| YouTube thumbnail | https://drive.google.com/file/d/1wNmuxojaZS6AmquJ7sqxDwdNv4hkJJEf/view |
| Reel cover | https://drive.google.com/file/d/15vABdq6DhZJJjPI9HfifNQJiFRbZMcf5/view |

<details><summary>v1 links (superseded — dark sets)</summary>

IG Reel `18chfAQkXp0MJJRkiUMbZEaoLgz83czzx` · YouTube `1YIa3HgFClkC5p438qXLhRhJUX18WHUR` · IG banner `1mPNt1n1U4ISCkNrBNzqRptgBw_oErmnV` · YT banner `1DYlIasvMbL7qw_hBWwXK0KkxYtl5yk57` · Avatar `1KmJ6_apeDlP6hLiZv5CjMntpYG01xfwv` · Feed plum `1-0bFxEkURT1F3xEz8GZTRwEseB-aRkV2` · desk `1aidtQ2tufCToHzVPcYWvYYOr0ARfOJen` · room `126lzAY2RBR97cT-riuTMjEW-ffV3KZ3T` · sky `1x8qkQBOaIchHHImMGEdV7-1l_jO5Aj9Z` · thumb `1PPPgyS6t_mYbu7fi7CMmU8nL00pNS7FX` · poster `1ItpzbJmfRLcTK29lgydsjTVNiSkGz0Id`

</details>

---

## v2 — what changed and why

Three notes from the owner drove the rebuild. Each one is a rule now, not a one-off.

### 1. Daylight, not neon

> *"dont prioritize dark bgs kama hii neons nyeusi kisa tupo in tech"*

The dark plum/violet sets are gone from the pack. Every scene is a room in daylight — cream paper, soft mint, warm sand, pale lilac sky. Accents stay saturated (violet, mint, gold, coral); the **field** does not. Nothing paints a black frame.

The rule: *tech is not a nightclub.* A tech host in daylight reads as a person you would trust; a neon void reads as a gaming channel.

### 2. She speaks

> *"mbona mouth movements hamna"*

The rig always had real AI visemes — her own mouth at three openness levels, per pose — but `performerDraw` only draws them when it is handed a track, and the stills never were.

- **Stills** get the `mid` plate: mouth slightly open, reading as *just spoke*.
- **Video** gets `out/mouth.json`, produced by `production/noellyne-host/lipsync.py` from the actual mix. 58.9 % of frames are open.

Two bugs had to be fixed for this to look right:

- `mouth: null` meant "she is silent", not "draw nothing" — so it drew the closed plate *including* the dark corner the white-key missed. That corner is the black smudge on her ear. **`mouth: false`** is the real opt-out.
- The AI plates carry an opaque near-black fringe outside her jaw. Every plate is now masked to **the pose's own base alpha**, plus a soft radial falloff, at load. `plate(pose, file)` in both `banners.mjs` and `intro.mjs`.

### 3. A desk, so "hana legs" stops being visible

> *"character wetu hana legs so try basi huku chini kuwe kama na design au table … isionekane kama floating sticker"*

This is the important one. The fix is **not** a fade, a crop, or a gradient — those still leave a cut-out floating in the frame. The fix is a **physical object in front of her**, drawn **after** her:

```
her(...)           ← she is drawn first
desk(...)          ← then the desk, at `hem - 0.035 w`, so her hem goes BEHIND it
laptop / mug / plant / books   ← objects on the desk surface
floorPapers(...)   ← loose sheets on the floor
```

Three ordering bugs were fixed to get here:

1. Her mouth plate has to be re-stamped **after** her body but **before** the desk.
2. The desk's back edge must sit **above** her hem (`hem - 0.035 w`), not at `hem + 2`. At `hem + 2` she ends *on* the desk and still looks cut.
3. The `desk()` function originally took the *frame height* as its `h` argument, so the apron filled two thirds of the frame. It takes `bottom` now, and the apron is a measured band between `d.front` and `floorY`.

The type then rides the apron at `d.front + 104`, which is inside that band by construction — the same "measured band" rule that fixed the IG banner in v1.

### Wide frames are a different composition

`--landscape` is not a resize. A centred portrait in 16:9 leaves two dead columns and puts the name through her head, so wide frames:

- crop her against the right edge (`x = W - w * 0.80`),
- put the type in a left column at `H * 0.560` over a wash that fades out by `0.66 W`,
- drop the corner paper (her hand is there) and keep one sheet high-left instead.

The `by = d.front + 104` apron rule is for tall frames only.

### Cuts are a paper-white flash

Fading to black in a daylight set reads as a mistake. Each cut is a 4-frame flash to the paper colour instead — the same value as the set, so it reads as a shutter, not a blackout.

---

## v3 — Tech Bila Hype campaign, photo props, two mouth-fixes

Owner's ask: *"new content nzuri we can ask people to comment an get PDF nzuri
nice more poses na real reference za vitu kama picha umezicut out vyema"*.

**New poses** — `present` (open palm offer), `one` (index up) and `hold`
(both hands presenting), keyed/registered exactly like the first six, badge
mark baked, on the 939×1136 canvas. Their AI viseme renders are pending —
`performerDraw` falls back to the base still for them until those exist, so
stills use them; motion work should wait for the visemes.

**Photo props** — laptop, mug, plant are generated product shots on seamless
white, cut by `cut-props.py` (border flood → shadow-growth → enclosed-pocket
seal). They carry no shadow of their own; a soft contact ellipse seats them
on the surface. Call sites in `banners.mjs` and `intro.mjs` draw
`photoProp(...)`. The hand-drawn laptop/mug/plant are gone from every
composition.

**Two mouth bugs found and fixed in `intro.mjs`** — v2's videos shipped both:
the per-frame MOUTH track was also passed to `performerDraw`, which drew the
*raw* AI plate (opaque dark background beyond her jaw) onto the wall, and the
masked re-stamp then picked the openness level from `MOUTH[beatStart]` instead
of `MOUTH[frame]`. Now `performerDraw` gets `mouth: false` and the re-stamp
reads the current frame. Do not pass the track to both places again.

**The PDF** — `pdf/tech-bila-hype.pdf`, built by `pdf/build-pdf.py`. 15 A4
pages: cover (the `hold` pose), contents, twelve real tools each with Ni nini
/ Kwa nini / Anza leo / Mfano / Bila Hype tip, a worksheet strip and 01–12
progress dots, closing CTA. No invented prices, no USSD codes from memory,
and a closing note that caps/limits change.

**The creatives** — `out/post-comment-pdf.png` (4:5) and
`out/story-comment-pdf.png` (9:16), her presenting the guide, with a
three-step strip (COMMENT 'PDF' → NITAKUTUMIA PDF → ANZA LEO). Caption in
`campaign-caption.txt`.

**GOOGLE-FLOW-PROMPT.md** was still v1 (plum/neon). It now describes the
daylight pack; the remaining "plum" reference is a note telling the reader to
delete leftovers.
