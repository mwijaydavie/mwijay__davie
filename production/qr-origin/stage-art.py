"""Stage the two clearly labelled AI illustrations; remove the factory image's blurred bars."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
from PIL import Image, ImageOps

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('input', type=Path)
p.add_argument('output', type=Path)
a = p.parse_args()
assets, qa = a.output / 'assets', a.output / 'qa'
assets.mkdir(exist_ok=True, parents=True)
qa.mkdir(exist_ok=True, parents=True)
credits = []
for tag, note in [('factory', 'Illustration of early-1990s automotive parts scanning; not archival footage or a real site'), ('cafe', 'Modern cafe illustration; not a real scan, person or location')]:
    source = a.input / f'{tag}.jpg'
    made = assets / source.name
    with Image.open(source) as im:
        im = ImageOps.exif_transpose(im).convert('RGB')
        if tag == 'factory':
            im = im.crop((0, round(im.height * .126), im.width, round(im.height * .873)))
        im.save(made, quality=91, optimize=True)
    credits.append(dict(file=made.name, sha256=sha256(made.read_bytes()).hexdigest(), source_sha256=sha256(source.read_bytes()).hexdigest(), source=f'AI-generated. {note}.'))
(qa / 'art-credits.json').write_text(json.dumps(credits, indent=2)+'\n', encoding='utf-8')
