# Pilot 03 · Quickopia: Cart si oda

**Audience:** business owners and builders evaluating Altraware’s e-commerce software. **Hook:** “Cart si oda. Tazama tofauti kwenye mfumo wa Quickopia.” Seven Kiswahili carousel slides, one vertical narrated Reel, English copy and subtitles. The subject is software, not products, inventory, fulfillment or the launch of a retailer.

## Evidence · 18 Nov 2026

| Beat | Source / crop | What we can say |
| --- | --- | --- |
| Catalog | `image-1.png` (`Chagua kategoria`, selected `Zote`) and [public preview](https://quickopia.tanzaniareach.com/shop#catalog) | The preview groups items by category. We did not test changing the category. No product cards, prices, stock or counts in the crop. |
| Language | `image-1.png` (`EN` and `SW`) | Both controls appear; SW is selected in this screenshot. No language switch was tested. |
| Cart | `image-1.png` (`Kikapu`) and [workflow instructions](https://quickopia.tanzaniareach.com/shop#how-it-works) | The preview shows a cart button and describes quantity controls. The interior is an **illustration**, not a captured transaction or measured state change. No customer data. The direct `/cart` route returned not found during the earlier read-only check. |
| Checkout | `image-3.png` (preview notice) and [checkout status](https://quickopia.tanzaniareach.com/checkout) | Website checkout has not opened. No order, payment or delivery claim. The preview is not an isolated sandbox. |
| Help | `image-2.png`, byte-identical to `image-4.png` | The actual panel shows topic chips and says “Majibu ya haraka · si AI bado.” No message was sent and no AI functionality was claimed. |
| Identity | `image-5.png` (cart/parcel mark) and `image-1.png` (wordmark) | Animate the owner’s real Quickopia mark with a path, parcel and speed-line reveal; preserve the original pixels. Keep Altraware’s original logo as the maker mark. |

**Visual source:** Quickopia navy `#0F2A4A` and orange `#FF6B18` from the nav, warm `#F8F6F1` from the preview, off-white `#FFFDF9` from launch and cool `#F8FAFC` from catalog. Use software SVGs: tile focus, signal path, quantity stepper and closed checkout gate. Show only software-control crops; no supermarket hero images.

**CTA:** **Comment QUICKOPIA nikutumie link ya kuangalia mfumo.** Send the [public workflow section](https://quickopia.tanzaniareach.com/shop#how-it-works), not the private creative folder. Say checkout is still closed and avoid sensitive data. See [IG/LinkedIn copy, alt text and manual reply](03-quickopia-caption.txt).

## Reel V2 · Kikapu si oda

The owner asked for a white-dominant Reel that reads better on a phone outdoors, a calmer male Kiswahili voice, and a cut under 25 seconds. V2 starts on the actual catalog crop and follows only category → illustrative quantity change → paused checkout → comment CTA. EN/SW and help remain in the unchanged carousel. The original Quickopia mark and the SVG stepper, lock and connecting line still move. See the [V2 caption and reply](03-quickopia-reel-v2-caption.txt).

The five-clip script is shorter, with the selected voice at 0.92× its source tempo, reading pauses between beats, and a 1.3 s end hold. Checkout was rechecked read-only on 18 Nov 2026 and still said it had not opened. No prices or checkout interaction were added.

**Encoded QA:** 21.933 s (1,316 frames at 60 fps), 1080 × 1920 H.264/yuv420p + AAC 48 kHz; full decode passed. Measured −16.17 LUFS and −4.81 dBTP. Five aligned cues in each SW/EN SRT. In 44 sampled encoded frames at least 87.8% of pixels were near-white (all RGB channels ≥235); the navy headline on white has 14.5:1 source contrast. Reviewed at 360 px wide and confirmed the catalog at frame 0 and distinct logo/quantity states. This is phone-size QA, not a physical sunlight test.

## Original export QA · 18 Nov 2026

- Reviewed seven ordered 1080 × 1350 PNGs, a 9:16 cover and the seven-page carousel review. The private asset kit includes cropped UI PNGs and three editable SVG illustrations. The PDF and ZIP are for review and reuse, not for the comment CTA.
- Decoded and sampled the final 34.90 s Reel: 2,094 frames at 60 fps, 1080 × 1920 H.264/yuv420p, AAC at 48 kHz. Measured −16.13 LUFS integrated and −4.48 dBTP. Both SRTs have seven non-overlapping cues aligned to the render. Checked the logo reveal and the illustrated quantity transition in the encoded video.

[Reproducible source and export steps](../../production/quickopia/README.md). Raw captures, voice, exports and private handoff links stay out of Git. No posting, messaging, checkout testing, change to public permissions, or deployment.
