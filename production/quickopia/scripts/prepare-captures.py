"""Extract only software controls and statuses from the owner's preview captures."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
from PIL import Image, ImageDraw

SIZES = {'image-1.png': (1891, 1078), 'image-2.png': (1897, 1077),
         'image-3.png': (1893, 1078), 'image-4.png': (1897, 1077), 'image-5.png': (1894, 1075)}
# Pixel coordinates are for this exact input set, not a general crop for other screenshots.
CROPS = {
    'catalog': ('image-1.png', (99, 114, 950, 430), 'Category heading and first three choices, including selected Zote; no product listings.'),
    'locale': ('image-1.png', (1272, 7, 1414, 88), 'Navigation EN and SW controls, SW selected. No language switch tested.'),
    'cart-nav': ('image-1.png', (1623, 8, 1803, 88), 'Kikapu button only; not the inside of the cart.'),
    'help': ('image-2.png', (1321, 426, 1866, 793), 'Help widget heading, visible guidance, and topic chips. No message sent.'),
    'notice': ('image-3.png', (115, 811, 699, 856), 'Original preview footer statement that checkout has not opened.'),
    'quickopia-icon': ('image-5.png', (127, 8, 231, 94), 'Original Quickopia mark from launch header on its original off-white matte.'),
    'quickopia-wordmark': ('image-1.png', (175, 22, 327, 58), 'Original navigation Quickopia wordmark, excluding the small slogan.'),
}
PALETTE = {'navy': '#0F2A4A', 'orange': '#FF6B18', 'warm': '#F8F6F1', 'light': '#FFFDF9', 'cool': '#F8FAFC'}


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('captures', type=Path)
    cli.add_argument('out', type=Path)
    args = cli.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    imgs = {}
    hashes = {}
    for name, size in SIZES.items():
        p = args.captures / name
        hashes[name] = sha256(p.read_bytes()).hexdigest()
        with Image.open(p) as im:
            assert im.size == size, (name, im.size, 'Review each crop for a different source set')
            imgs[name] = im.convert('RGB')
    assert hashes['image-2.png'] == hashes['image-4.png'], 'Review duplicates if the input set changed'
    assert imgs['image-1.png'].getpixel((80, 30)) == (15, 42, 74)
    assert imgs['image-1.png'].getpixel((1765, 42)) == (255, 107, 24)
    assert imgs['image-3.png'].getpixel((600, 170)) == (248, 246, 241)
    assert imgs['image-5.png'].getpixel((500, 160)) == (255, 253, 249)
    records = []
    check = Image.new('RGB', (1040, 1000), '#e2e9f0')
    label = ImageDraw.Draw(check)
    for i, (name, (source, box, scope)) in enumerate(CROPS.items()):
        cut = imgs[source].crop(box)
        cut.save(args.out / (name + '.png'), optimize=True)
        x, y = i % 2 * 520 + 8, i // 2 * 250 + 8
        label.text((x, y), name + ' · ' + source, fill='#0f2a4a')
        cut.thumbnail((500, 225), Image.Resampling.LANCZOS)
        check.paste(cut, (x, y+21))
        records.append({'asset': name+'.png', 'capture':source, 'cropPx':box, 'scope':scope})
    check.save(args.out.parent / 'capture-check.jpg', quality=95)
    (args.out / 'evidence.json').write_text(json.dumps(dict(source='owner website preview', palette=PALETTE,
        rawSHA256=hashes, assets=records), indent=2) + '\n', encoding='utf-8')
    print(f'{len(records)} software-focused crops from 5 attachments (1 duplicate).')


if __name__ == '__main__':
    main()
