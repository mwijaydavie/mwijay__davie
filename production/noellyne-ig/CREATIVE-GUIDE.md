# Noellyne Instagram creative guide

**Read this before making or polishing any Noellyne Reel.** The owner wants work to build on the established character and existing project—not create another near-identical Reel or repeatedly regenerate the same content. Revise the current source in place where possible, keep the old Drive copy untouched, and make a separate local review render for owner approval. Do not post, schedule, replace Drive files, or change sharing.

## Visual source of truth

1. `private-media/noellyne-ig/reference/Noellyne-Preferred-Character.webp` — the owner's direct character reference.
2. `private-media/noellyne-ig/reference/Noellyne-Intro-SW-V1-Reference.mp4` and `Noellyne-V1-Reference-Board.jpg` — the earlier liked video and its scene overview.
3. `Noellyne-V1-1s.jpg`, `Noellyne-V1-5s.jpg`, `Noellyne-V1-18s.jpg`, and `Noellyne-V1-23s.jpg` — phone, hands-together intro, pointing-tip, and end-card pose references.
4. `private-media/noellyne-ig/intro-v2/Noellyne-Host-{Phone,Desk,Point}-Alpha.png` — aligned pose cutouts made from the owner's reference and V1 frames for the current polish.

The owner said the previous character had nice poses and the later full-body version looked like a major downgrade. **The rejected V2 full-body cutout is not the character reference.** Prefer the owner/V1 likeness and the three saved upper-body poses above; do not regenerate them without a specific need.

### Keep consistent

- Same warm, stylized 3D East African host: dark-brown skin, expressive brown eyes, twin rounded curly puffs with copper ringlets, small gold earrings, textured blue/periwinkle hoodie, same face and proportions.
- Round violet glasses sit **on top of her hair**, not over her eyes. No visible legs or full-body framing unless the owner explicitly asks.
- Head-and-shoulders to roughly waist-up crop; keep head size and location consistent between scenes. Pose variety should come from the accepted phone, hands-together, and upward-point poses—not a new character or outfit.
- Deep plum/purple studio, soft lavender orbit/rim light, restrained Altraware branding. Avoid the bright teal/neon room and full-body direction from the rejected version.
- Keep transitions smooth; no glitch over Noellyne's introduction, face, or logos.

## Content and pacing

The owner corrected the creative direction: **“This content you're creating is the same. I want something engaging, entertaining for people to enjoy watching or gain information.”** A polished Reel must be more than attractive pictures, a list of sites, or the same tip with a different pose.

- Give every Reel a fresh, clear audience payoff: a playful hook or mini-challenge, one useful tip demonstrated on screen, a short memorable reveal, and one CTA. Use lively movement and visual storytelling while keeping the information accurate and easy to follow.
- Do not repeat the same topic/script in future Reels just to make another version. For a polish request, change the specific weak beat and keep the rest that the owner has already accepted.
- Keep claims grounded, show genuine product logos and relevant public sites, and never invent customer stories, testimonials, sales, screenshots, results, benchmarks, or offers. Generic fill-in prompts must be visibly labelled with placeholders.
- Retain useful small-business/tech information, natural Kiswahili, and an advert-like finish; do not overload one 30-second Reel with a long catalogue of tools.

## Previous V2 revision

The existing 30-second V2 intro was polished around a distinct **AI-prompt challenge for business captions**: four context fields (product, audience, tone, next step), one copy-ready fill-in template, genuine ChatGPT/Gemini/Claude marks, Canva as text, and a reminder to verify prices/facts. That work remains separate; do not overwrite its review or the older Drive copies.

## Latest owner brief · short IG profile intro

The owner now wants a **fresh, short introduction for Noellyne's IG**, with simple natural Swahili/English for a Tanzanian Gen Z audience. Working audience pick: tech-curious young people who want practical AI/app tips. Keep Noellyne's identity clear, give one content promise and one follow CTA; don't force slang or cram two languages onto one screen. A separate English version is welcome.

The owner supplied two Drive Reels as **motion references**. They specifically value depth, visible background/scene changes, lively head/gaze movement, a pointer and usable hand gestures. Borrow that motion rhythm, not their footage, screenshots, exact wording or audio. The script/storyboard lives under `intro-v3/`.

**V8 is the current cut** — full bleed, her own audio, no page and no panel:
<https://drive.google.com/file/d/1hryxjJlzlNgRGrDzs6OvyzbqZrbOuX3s/view>

**V6**: `Noellyne-Intro-V6-Altraware-Review.mp4`, 1080×1920, 30 fps, 19.8 s, owner-only in Drive (file id `1pCbmkkdpeHGTrwCQ09QgdbKteQiwPpBB`).
Earlier cuts, all kept and never to be replaced: V5 `1jn9AxvMQFbJBkiemLpXx-QfKZRLAOWTv`, V4 `1swGkvjuqg-BtgykP1HBn8Tjgjqu7TISm`, V3 `17PZki_K-1ZjRsz0bpnZUqOe4h0LJwynO`.

**Always give the owner a link when a cut is delivered.** He asked for this explicitly after V5: a file in Drive without a link is not a deliverable. Include the `web_view_link` in the reply.

Owner corrections that produced V4 — keep these as rules:

- Noellyne is the **Altraware** technology host. Not Tech Pulse TZ. The line is "Mimi ni Noellyne, tech host wa Altraware."
- Head movement is **horizontal only**. No pushing/pulling the head toward or away from camera; that reads as popping. Rotate/slide about the neck pivot and keep the body planted. Never rescale the character mid-shot.
- Cutouts must be real alpha (decontaminated + despilled), not a crop rectangle with a feathered edge.
- Every cut, card landing and button needs a **sound effect**. The bed and cues are synthesised in `intro-v4/tools/sfx.py` and `mix-audio.mjs`.
- Backgrounds should change scene to scene and carry real depth (floor grid, HUD ring, aurora, motes), never a flat gradient.

V3 (`Noellyne-Intro-V3-Swanglish-Review.mp4`) is superseded and should not be posted.

Mouth QA for V3 is settled: no cross-pose face patches are used, and a mouth-interior animation anchored on the source lip landmarks replaced the earlier patch approach. Any future change to a pose needs its own lip landmarks regenerated by `intro-v3/tools/plates.py` before it is used. Do not post, change the profile, or replace/share Drive files without explicit approval.

## The three reference reels (studied for V6)

The owner sent LIMS, MwijayNote and Model Mpya and said all three were made by
code. They share one visual system — **copy it, don't reinvent it**:

1. **Cream-on-cream.** The character's background is the same beige as the page
   (`#EEE7DA`). This is the reason those reels never show a matte line. Any look
   that puts a *plum-set* subject on a *cream page* will always show its edge.
2. **She stands in the scene**, planted on a table plane, dissolving into it at
   the bottom. Not inside a card, not inside a box.
3. **Serif type** with one italic accent line (DejaVu Serif / BoldItalic is the
   closest available face). Sans headlines read as a template.
4. **Numbered sections** top right (`01 / UTANGULIZI`), hairline rule, small
   violet or ochre mark top left.
5. **UI that builds in place** — rows appear one at a time, then a total lands.
   Never cut to an already-finished card.
6. **One navy caption pill**, centred, over her.

### The extraction recipe (settled)

Four matte strategies failed between V3 and V5. The working one is a hybrid, in
`intro-v6/tools/plates.py`: SelfieSeg for body coverage + a hue/luma test for
the hair line (set is dark and blue-dominant; hoodie is blue but bright; hair is
warm), combined, closed morphologically, then saved RGBA and composited on the
page beige. Do not go back to a single model or to plain re-keying.

## V4 rejection — the rules that produced V5

The owner rejected V4 with three specific complaints. These override the earlier
"one SFX per cut" instinct below, which is what caused the first of them.

1. **The cutout approach is retired.** V3 and V4 both composited an alpha
   cutout onto a stage. On a light page the matte edge always read as "pasted",
   which the owner called out twice ("character hadi cutout inaonekana poorly
   done whyy!!!!!"). Three matte pipelines were tried for V5 — SelfieSeg with a
   narrow GrabCut band, alpha unmixing against a rebuilt background, and an
   external matting model — and none gave a clean hair edge. **Do not bring the
   cutout back.** Her real footage goes inside a designed media panel, the way
   the Altraware references present screenshots. A designed edge is not a
   mistake.
2. **Copy must survive being read out loud.** "Tech kwa viteno" was rejected as
   meaningless. Every line in `intro-v5/copy.json` carries its English and a
   note on why it is safe. Check new copy the same way before rendering.
3. **Fewer sounds, voice on top.** V4's 19 cues plus bed plus compressor was
   "uchafu, hamna muelewano". V5: one bed (low-passed at 900 Hz, sidechain
   ducked by the VO) and exactly two cues. Near-silence between phrases is
   correct and lets the voice land.
4. **Never let the source reel's own graphics through.** The approved footage
   has `TECH PULSE TZ`, a header, its own cards and a caption pill baked in.
   Every crop window must exclude them; a window that includes them puts the
   rejected brand back on screen.
5. **Match the reference page, not a template.** Measure the references: cream
   field, navy display type with one royal accent, a single caption pill that
   overlaps the media panel, a soft desk plane at the bottom, a hairline header
   with progress ticks. Flat empty cream reads as unfinished.

## Iteration checklist

1. Read this guide and inspect the saved owner reference plus V1 frames before touching character art.
2. Prefer the saved V1-style pose assets; compare framing and face details before a full render. Confirm no legs and glasses on hair.
3. Change only what the owner asked to improve; preserve accepted style/audio/layout outside that scope. Use a new review filename, and never overwrite an earlier Drive file.
4. Run the storyboard, full-decode and phone-playback checks. Review the contact sheet and a representative frame before presenting the final.
5. Save new references under `private-media/noellyne-ig/reference/` and update this guide only when the owner gives a new preference. Keep private reference/media files out of Git.
