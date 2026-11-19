# Altraware host · reusable cutout rig

This is the owner's character reference adapted for the Business Story series. Original source art stays private. The three new poses are AI image edits; the blink and hand movements are actual frame-driven compositing, not an AI video or audio-driven lip sync. Confirm rights in the supplied reference/edits before posting or using them outside review.

**Layers at their authored positions**

- `wave-base.png` + `wave-hand.png` – smile and open palm. The transparent hand swings around the documented cuff pivot.
- `point-base.png` + `point-hand.png` – eyes to image left, index extended. Small positive wrist cue tips it toward a number.
- `think-base.png` – side-eye and folded arms. All three poses have a separate `*-blink.png` patch; do not move the patches independently of the head.
- `host-rig.json` maps layer offsets/size and logos/pivots in **939 × 1136** coordinates. Per hand, its pivot is **relative to the hand crop**, not relative to the base. Compositing order: base → hand → eyelids → Altraware mark.

For Remotion use `Host.tsx` with `logic.mjs`, the marked PNG and the rig JSON. Place the layers and `altraware.png` under `public/price-story/`; pass `rig`, pose, local frame and size. Set `blinks` to frame centers and `targets` to the price beats. Without Remotion, import transparent PNGs into your editor and apply the same coordinates and pivot. Scale all offsets by `desiredBaseWidth / 939`.

At 60 fps try a wave in the first two seconds, a quick 8–11-frame blink and one left point to cue the visual proof. Avoid looping a wave through a dense read. Keep the explanation unobstructed; use the folded-arms pose for a moment of doubt rather than unnecessary full-time movement.
