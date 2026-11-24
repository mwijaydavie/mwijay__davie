# Noellyne — social setup kit (YT + IG)

Kila kitu tayari kwa kuanzisha accounts — wewe kufanya signup; mimi sina uwezo wa kufungua accounts.

| File | Use |
|---|---|
| `banner-yt.png` | **YT channel art** — 2560×1440. Text + face ziko ndani ya universal safe area (1546×423); inasomwa fresh kwenye TV / desktop / tablet / mobile. |
| `banner-yt-devices.png` | Proof: TV (2560×1440), laptop (2560×423), tablet (1855×423), mobile (1546×423) crops. Si ya upload. |
| `avatar.png` | Profile picture — YT (1024, circle crop) + IG. Same rig-rendered identity as the reels. |
| `avatar-sizes.png` | Readability check at 256/128/64/32 px. Si ya upload. |
| `COPY-KIT.md` | **The copy-paste kit** — every field for YT + IG, video tags, pinned comments, PDF flow, launch checklist. |
| `make-yt-banner.mjs` | Generator for `banner-yt.png` (rerun: `node production/noellyne-social/make-yt-banner.mjs`). |

Asset sources: banner rebuilt here (2560×1440, safe-band layout); avatar + feed scenes + reel covers + PDF + intro videos live in `production/noellyne-ig/identity/out/` (tracked) and are re-used by the kit — don't regenerate them twice.

Honest status: handles `@NoellyneTech` / `@noellyne.tech` are **unverified** (checked only at signup); `altra.tanzaniareach.com` not confirmed reachable from this workspace; accounts are **not created** — this folder is everything needed to create them in ~20 minutes.
