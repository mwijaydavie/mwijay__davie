# Pilot 08 · Free AI API? Unlimited? · Model providers

**Hook:** “Free AI API key? Key ya bure haimaanishi usage unlimited.” A one-minute Swanglish Tech Tip for developers/vibe coders choosing a model for a first build. [CodeWithUsman video](https://www.youtube.com/watch?v=R12RLqs14fY) inspired the question, not a copy of its title as our promise. Keep dev language: `model ID`, `rate limit`, `base URL`, `free tier`, `token pricing`, `API key`. No invented acronym translations.

**Status:** private owner review. TTS is scratch audio, to mute/replace with Mwijay's VO. No post, scheduling, deploy, sharing changes, provider accounts, keys or Manychat activation. Public CTA waits for sign-off and tested URL.

## What we can stand behind

1. DeepSeek and Claude direct APIs list token pricing. A free chat, trial credit, same family via a gateway, or local weights are different paths. Z.AI's pricing on 18 Nov 2026 lists `GLM-4.7-Flash` free versus metered `GLM-5.3-Flash` (not “all Flash free”). Qwen can be hosted; run compatible open-weight variants locally if hardware and license fit.
2. Guides: 16 routes, not 16 unlimited keys. Four first-party model families, tier-limited hosted endpoints, trial/gateway choices, client-specific access, user-funded SDK, metered hosted service and local runtime. Vetted [public docs](../research/2026-11-18-model-providers.md); no live calls or signup eligibility tests. Tanzania listed by Gemini and Claude docs, but no plan/credit guarantees.
3. One tiny evidence beat: mock `200` → `429` with `Retry-After: 2` → no call during wait → one `200` retry. [Local tests](../../production/model-providers/rate-demo.test.mjs): five cases. Never read this as a real vendor's 2-second cooldown or a way around caps.

| Time | Shot / motion |
| --- | --- |
| 0–6.75 s | Macro key still life, genuine brand stickers, hand-drawn key/usage callout |
| 6.75–14.43 s | App / tool → Provider API → Model, then Model ID / Rate limit / Billing |
| 14.43–22.48 s | DeepSeek/Claude die-cut pricing receipts, free chat vs API |
| 22.48–28.58 s | Z.AI mark, two exact models and source date; variant mismatch |
| 28.58–36.18 s | Laptop still life, two Qwen paths, Ollama cutout, RAM/storage note |
| 36.18–43.80 s | Gemini and OpenRouter start paths, dummy data + data policy |
| 43.80–52.87 s | Mock 429 terminal, countdown, lock sticker = server-side key |
| 52.87–60 s | Shows actual two guide covers; comment **MODEL** |

**Motion:** original die-cut outline/scalpel geometry, staggered pop and SVG ink-on-draw; two editorial generated stills (not app UI), no reuse of Pilot 07 footage/layout or YouTube media. Seven unmodified identifier marks from the pinned LobeHub collection; independent education, no affiliation. [Credits and evidence](../research/2026-11-18-model-providers.md).

## What to use

- `Tech-Tip-Free-AI-API-60s.mp4`: TTS reference with Swanglish subtitles. In editor mute only the audio, or use `Tech-Tip-Model-Providers-Voiceover-Master.mp4` for completely clean picture (same graphics, no audio or dialogue burn-in).
- `voiceover/Record-Your-Voiceover.txt`: eight beats. Record naturally and retime captions; no forcing the TTS pacing/language. Editable Swanglish and English SRTs included.
- `Free-AI-API-Guide-Swanglish.pdf` and `Free-AI-API-Guide-English.pdf`: separate 7-page guides, date, clickable official links, quickstart, cost/429/privacy checks. Altraware contact clearly marked as ours, separate from non-affiliate external provider docs.
- [Caption drafts](08-model-providers-caption.txt) and [optional MODEL delivery](08-model-providers-manychat.md). `audience-page/` stages two direct language buttons. Do not publish the ZIP or review folder; no audience domain approved. Recheck offers on publish date, test both languages and DM in IG (including non-follower Requests).

Series position: a model-provider side story after [MCP au API?](07-api-tip.md), not a replacement for the four-part stock workflow. Next comparison idea if comments ask: one dummy task, same instructions, two exact routes, compare valid output + latency + cost before recommending. [Creative direction](../creative-direction.md) · [production/rebuild](../../production/model-providers/README.md).
