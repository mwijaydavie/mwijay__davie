---
name: altraware-search-reels
description: Build an Altraware Business Reel around a clearly staged search, one real website payoff, the existing female host, natural Swanglish, and a useful comment-to-resource handoff. Use for search-led website explainers or when asked to reproduce the search opening without copying reference audio.
---

# Search-led Altraware Business Reels

**The mechanism:** a customer asks a specific question → types it → submits → sees one illustrative link → clicks → now we need the real answer on a site the business controls. Show the payoff, not a monologue about SEO. The search animation in this skill is fictional and original. Do not substitute it for a real AI answer, referral, ranking result, app test, or network timing measurement.

## 1 · Brief and rights

- Choose one audience, one customer question and one business decision. Start with an everyday question (menu, quote, stock or hours), not a result invented for a real client. Say what a business controls: its own current information and next step, not what an AI platform will recommend.
- If a reference is available, note the first 6 seconds' input, visible state changes, holds, screen cut and sound accents. Borrow that rhythm/mechanism, not its art, screen, words or voice. If access is missing, say so and use this independent model.
- Keep the **same approved female Business host**. Do not generate a replacement face for every shot. Use the separate Tech host for shortcut/coding episodes. Keep private media out of source control or shared examples.
- If asked to identify ChatGPT and Gemini, names in plain text are the fallback. If permitted, keep verified, unaltered marks small, visually separate from the simulated UI and subordinate to the maker's identity. Check [OpenAI marks terms](https://openai.com/brand/) and [Google product-icon guidance](https://about.google/brand-resource-center/brand-elements/#product-icons) for the actual use. Don't imply integration, partnership or endorsement. Don't promote with an uncleared logo-bearing review cut.

## 2 · Make the opening seekable

Keep the label `MFANO WA SEARCH` visible throughout. Use neutral original UI, one short query, one highlighted link on a reserved `.example` domain, a clear pointer/contact beat and a new page state. No API, live browser dependency, copied AI app layout, live customer data or real domain in the fake result. Separate the mock from evidence with a hard cut and `UI HALISI`/local capture label.

| Beat (60 fps example) | Frame | What changes |
| --- | ---: | --- |
| Type | 19–108 | Cursor and complete readable question, by character |
| Submit | 119 | Send button presses, small click; no result yet |
| Answer card | 166 | Hold one `.example` result; clear `LINK YA MFANO` |
| Hover | 243 | Pointer travels to the link, link gains focus |
| Click | 312 | Pointer tip lands inside the link and presses |
| Open | 324–359 | The address changes to `.example` and the illustrative destination opens |

Use `examples/opening.plan.json` and `scripts/search-opening.mjs` as the state source. For an English-only cut, use `examples/opening-en.plan.json` and keep `SEARCH DEMO` visible instead. Copy the example plan to change a question and beats. Positions, opacity, type length, press and SFX should derive from frame and the beat table, not `setTimeout`, remote responses or CSS transitions. Caption/dialogue can start immediately. Don't add a long logo intro or a second mock result.

```sh
node scripts/check-opening.mjs
node scripts/preview-opening.mjs 316 opening.svg
```

Run from the skill folder (Node 18+, no npm install, API key or network). To use another plan, pass its path to the checker or as the last arg to the SVG script. The SVG is an aid for inspecting the state, not an export of the reel. In Remotion call `searchAt(validatedPlan, useCurrentFrame())` inside the opening Sequence and set `durationInFrames = plan.beats.end`. The `.example` link is not clickable in the demo. Check frame `ready-1`, `ready`, `click`, `open`, frame 0 and the end; random seek must match sequential render. Recheck finger/pointer contact and UI/label fit in the styled composition.

## 3 · Cut to something the owner can verify

For 45s, use an audio-led starting rhythm: **0–6** search; **6–12** ask what they find; **12–20** show the owner's real levers; **20–28** two real built examples; **28–38** one value proposition and caveat; **38–45** one useful close. Move transitions to the approved take. Show the relevant part of 2–3 approved builds at phone size; no three thumbnails that nobody can read. One interaction or before/after per build. Keep the original capture, route, revision and hash; note when local data, edits, mock prices or scope are involved. Don't infer performance, checkout, hardware, production data or citation from a crop.

Write the offer as mobile-friendly, lightweight design and clear, crawlable information, not “we'll rank you in AI.” [Search/AI eligibility is not inclusion](https://developers.google.com/search/docs/appearance/ai-features). Keep the caveat audible and visible. Show a result you can actually reproduce; no fabricated speed scores or backfilled proof claims.

## 4 · Voice and portrait

1. Write 5–6 short takes with conversational Swanglish. Have the owner record or audition a language-appropriate voice on **this** script. Use the selected voice ID; don't copy the reference narrator. Read ChatGPT, Gemini, the firm name and keyword naturally. If the scratch take mispronounces them, replace the take, not only the subtitles.
2. Edit the dry VO first at natural rate; log trims/gaps and frame windows. Spot-align 1–2 line captions to words and leave optional English as a separate SRT. Don't infer phoneme or pronunciation accuracy from a loudness reading.
3. Rig matched closed, narrow, open and round mouth patches over the same face/pose. Keep cheek edges, jaw, teeth and texture registered. Derive per-frame visemes from the **final dry VO** (Rhubarb phonetic mode is an estimate for Swahili); select the strongest cue at conflicting boundaries, gate to voiced spans, test plosives/rests by eye and ear, and ease 2–3 frames. No repeated open/close loop or mouth motion on SFX. Render comparisons and check quiet holds with the sound off too.
4. Full body is optional. For close-ups show enough shoulder/chest, with an intentional window crop, table edge or a visible grounded pose. Keep the face and important copy clear of the IG controls. Don't suspend a hard-cut torso mid-frame. Use a blink and one hand movement to guide attention, not constant wiggle.
5. Add quiet original UI taps only where states change. Keep dialogue, SFX and titles separately replaceable. For an owner VO use an uncapped neutral-mouth silent picture and SFX stem, or rerun visemes/captions against the new recording. Never call the old sync exact for a new take.

## 5 · Handoff, not publishing

- Make the offered file first (e.g. a free `WEB` checklist for a website audit). Match spoken, on-screen, caption and DM keyword. Use one useful resource and no paid/follow/email gate. A private review link is not an audience delivery link. With an any-comment responder, use neutral reply copy and test routing, follower/non-follower, Message Requests, logged-out IG browser and duplicates before any release. Don't change automation without approval. If the file can't be delivered, replace the CTA before publishing.
- Render 1080×1920, 60 CFR, H.264 yuv420p, 45s = 2700 frames. Check actual encoded cut boundaries, under-UI safe areas, captions, mouse contact, proof and CTA at ~360px wide. Check AAC and peaks, mute coverage, mouth rests and the owner listen-through. Provide a cover, review MP4, clean picture, SFX stem, editable script/captions, dated claim/asset receipts and a clear release gate.
- In this studio repo see `production/website-era/README.md` for a working example and `.agents/skills/tech-video-motion-graphics/SKILL.md` for the render-check contract. This skill and its example run independently of any private art, voice, third-party marks or working tree.
