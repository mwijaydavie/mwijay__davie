"""Prepare the cleared FaidaHQ preview and two illustrative photos for the Reel."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

CAPTURE = 'Screenshot 2026-10-09 005445.png'
CAPTURE_SHA256 = '100103023fe7f7877457a6c3214e787a14ccc7b65cd5ef187e34eddb6338431b'
# These are regions of the owner's 1919 x 1076 preview, not an authenticated app.
CROPS = {
    'faida-preview.webp': (985, 330, 1862, 969),
    'faida-brand.webp': (19, 17, 220, 79),
}
# Source-space rectangles: remove sales KPIs, example prices/counts, AI result and the sync badge.
MASKS = [
    ((1054, 554, 1249, 586), '#F5F7F9'),
    ((1310, 552, 1474, 588), '#F5F7F9'),
    ((1578, 554, 1707, 587), '#F5F7F9'),
    ((1310, 683, 1416, 724), '#EDF1F4'),
    ((1081, 824, 1380, 859), '#FAE5EA'),
    ((1483, 824, 1781, 859), '#F1EBFD'),
    ((1680, 444, 1828, 493), '#FFFFFF'),
]


def sha(path):
    return sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('uploads', type=Path)
    parser.add_argument('illustrations', type=Path)
    parser.add_argument('out', type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    original = args.uploads / CAPTURE
    if sha(original) != CAPTURE_SHA256:
        parser.error('Capture differs; redo crop/redaction review.')
    source = Image.open(original).convert('RGB')
    assert source.size == (1919, 1076)
    clean = source.copy()
    paint = ImageDraw.Draw(clean)
    for box, fill in MASKS:
        paint.rounded_rectangle(box, radius=5, fill=fill)
    rows = []
    for name, box in CROPS.items():
        media = (source if name == 'faida-brand.webp' else clean).crop(box)
        out = args.out / name
        media.save(out, lossless=True)
        rows.append(dict(file=name, kind='owner preview screenshot', source=CAPTURE, source_sha256=CAPTURE_SHA256,
                         box=box, redactions=MASKS if name=='faida-preview.webp' else [], sha256=sha(out)))
    for name in ('desk-hero', 'desk-approval'):
        src = args.illustrations / (name + '.png')
        out = args.out / (name + '.webp')
        with Image.open(src) as photo:
            ImageOps.contain(photo.convert('RGB'), (865, 1540)).save(out, 'WEBP', quality=89, method=6)
        rows.append(dict(file=out.name, kind='AI-generated editorial illustration; not a client or site', source=src.name,
                         source_sha256=sha(src), sha256=sha(out)))
    (args.out / 'evidence.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Render inputs: {len(rows)} files, one owner capture and two labelled illustrations')


if __name__ == '__main__':
    main()
