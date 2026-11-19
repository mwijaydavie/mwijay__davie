"""Crop the cleared UAUT Connect nav and CTA controls, not the student/poster imagery."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
from PIL import Image, ImageDraw

RAW = {
    'image-6.png': ((1918, 952), '2fa4cdaf37e861138d2e6a01a0fdc1dc73fe35724053eb8069b49dbef6849718'),
    'Screenshot 2026-10-05 124753.png': ((1915, 1079), '842f0362b859fa5b82eb9423c61bfa4f2c07f9b73d7a0d6ce4660eed76c3e6c3'),
}
CROPS = {
    'nav': ('image-6.png', (70, 57, 532, 138), 'Actual UAUT Connect mark and Programs nav, from the owner’s new capture.'),
    'mark': ('image-6.png', (70, 57, 265, 138), 'Original mark and wordmark only; not a generated crest.'),
    'programs': ('image-6.png', (349, 68, 532, 127), 'Original Programs nav label and icon, isolated for focus.'),
    'home-actions': ('Screenshot 2026-10-05 124753.png', (519, 976, 1392, 1076), 'Actual Apply for Admission and Explore Degrees buttons from the earlier owner capture; no face or poster.'),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('captures', type=Path)
    parser.add_argument('out', type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    sources = {}
    for name, (size, digest) in RAW.items():
        path = args.captures / name
        assert sha256(path.read_bytes()).hexdigest() == digest, f'{name}: review new crops before rendering'
        with Image.open(path) as im:
            assert im.size == size
            sources[name] = im.convert('RGB')
    records = []
    audit = Image.new('RGB', (940, 680), '#e7edf6')
    pen = ImageDraw.Draw(audit)
    for i, (key, (name, box, scope)) in enumerate(CROPS.items()):
        cut = sources[name].crop(box)
        cut.save(args.out / f'{key}.png', optimize=True)
        records.append({'file': f'{key}.png', 'source': name, 'box': box, 'description': scope})
        cut.thumbnail((905, 133), Image.Resampling.LANCZOS)
        y = 160 * i + 12
        pen.text((16, y), key + ' / ' + name, fill='#102441')
        audit.paste(cut, (16, y + 24))
    (args.out / 'evidence.json').write_text(json.dumps({'ownerCaptureSHA256': {k: h for k, (_, h) in RAW.items()}, 'crops': records}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    audit.save(args.out.parent / 'capture-review.jpg', quality=94)
    print('Prepared 4 original UI crops from two reviewed owner captures.')

if __name__ == '__main__':
    main()
