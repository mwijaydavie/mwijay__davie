#!/usr/bin/env python3
"""
Rebuild the mouth plates from AI renders of HER OWN mouth, not from the kit.

The kit ships eight visemes for `wave` only, and those eight are all the same
painted grin — no teeth, no interior. Pasting one onto `cheer` put a painted
smile on her chin. That is the "inachekesha" the owner reported.

What works: ask the image model for the SAME pose with only the mouth changed.
It gives a clean, natural, anatomically correct open mouth in her own style,
in her own lighting, on her own face. Then:

  1. key the white background back to the base's alpha
  2. take ONLY the mouth region (a soft ellipse around the lips)
  3. composite it onto the base

Verified: the difference between the AI render and the base is confined to the
mouth. Everything else is pixel-identical, so the paste cannot drift.

Inputs (checked in): poses-src/ai/<pose>-<level>.png
Outputs:            assets/<pose>-ai<level>.png  +  host-rig.json `ai` block
"""
import json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"
SRC = HERE / "poses-src" / "ai"
RIG = json.loads((ASSETS / "host-rig.json").read_text())

# Measured mouth centres (in the 939x1136 canvas).
MOUTH = {
    "wave": (520, 480), "point": (525, 478), "desk": (520, 487), "phone": (515, 485),
    "cheer": (540, 455), "ok": (520, 465), "peace": (520, 435), "pray": (520, 470),
    "thumbsup": (510, 490),
    "present": (505, 485), "one": (505, 485), "hold": (505, 485),
}
# lip width per pose, so the plate always covers the real mouth
LIPW = {
    "wave": 200, "point": 200, "desk": 200, "phone": 200, "cheer": 176,
    "ok": 200, "peace": 186, "pray": 200, "thumbsup": 196,
    "present": 200, "one": 200, "hold": 200,
}
LEVELS = ("closed", "mid", "open")


def key_to_base(gen: Image.Image, base: Image.Image) -> Image.Image:
    """The model returns a white background; restore the base wherever it is white."""
    g = np.array(gen.convert("RGB")).astype(np.float32)
    b = np.array(base.convert("RGBA")).astype(np.float32)
    if g.shape[:2] != b.shape[:2]:
        gen = gen.resize(base.size, Image.LANCZOS)
        g = np.array(gen.convert("RGB")).astype(np.float32)
    lum = g.mean(axis=2)
    white = (lum > 238) & ((g.max(axis=2) - g.min(axis=2)) < 14)
    out = g.copy()
    out[white] = b[..., :3][white]
    return Image.fromarray(np.dstack([out, b[..., 3]]).astype(np.uint8), "RGBA")


def mouth_plate(gen_keyed: Image.Image, name: str) -> Image.Image:
    """Cut a soft ellipse around the lips — never a rectangle."""
    cx, cy = MOUTH[name]
    w = LIPW[name] + 44
    h = int(w * 0.70)
    box = (cx - w // 2, cy - h // 2 - 6, cx + w // 2, cy + h // 2 - 6)
    p = gen_keyed.crop(box)
    W, H = p.size
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).ellipse([0, 0, W - 1, H - 1], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(int(W * 0.075)))
    p.putalpha(m)
    return p


def main():
    made = {}
    for name in RIG["poses_order"]:
        base = Image.open(ASSETS / RIG["poses"][name]["base"]["file"]).convert("RGBA")
        entry = {}
        for lv in LEVELS:
            f = SRC / f"{name}-{lv}.png"
            if not f.exists():
                print(f"{name}/{lv}: no AI render, skipped")
                continue
            keyed = key_to_base(Image.open(f), base)
            plate = mouth_plate(keyed, name)
            out = ASSETS / f"{name}-ai-{lv}.png"
            plate.save(out)
            entry[lv] = {
                "file": out.name, "w": plate.width, "h": plate.height,
                "cx": MOUTH[name][0], "cy": MOUTH[name][1] - 6,
                "sha256": hashlib.sha256(out.read_bytes()).hexdigest(),
            }
            print(f"{name}/{lv}: plate {plate.width}x{plate.height}")
        if entry:
            RIG["poses"][name]["ai"] = entry
            made[name] = entry
    (ASSETS / "host-rig.json").write_text(json.dumps(RIG, indent=1))
    print(f"\n{len(made)} poses now carry AI visemes")


if __name__ == "__main__":
    main()
