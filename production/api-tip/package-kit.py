"""Bundle only reviewed exports and pre-stage the separate no-login audience download."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import shutil
from zipfile import ZIP_DEFLATED, ZipFile
from PIL import Image

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent.parent
PDF='Mwongozo-Bure-API-na-MCP.pdf'
REF='Tech-Tip-01-MCP-au-API.mp4'
CLEAN='Tech-Tip-01-Voiceover-Master.mp4'
COVER='Cover-Tech-Tip-01.png'


def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument('output',type=Path)
    cli.add_argument('private_dir',type=Path)
    args=cli.parse_args(); out=args.output.resolve(); private=args.private_dir.resolve()
    private.mkdir(parents=True,exist_ok=True)
    qa=json.loads((out/'qa/encoded-checks.json').read_text(encoding='utf-8'))
    for name,q in [(PDF,'guide'),(REF,'reference'),(CLEAN,'voiceover_master'),(COVER,'cover')]:
        assert sha256((out/name).read_bytes()).hexdigest()==qa[q]['sha256'], f'{name}: rerun QA'
    aud=out/'audience-page'; aud.mkdir(exist_ok=True)
    shutil.copyfile(HERE/'download.html',aud/'index.html')
    shutil.copyfile(ROOT/'content/assets/altraware-mark.png',aud/'altraware.png')
    shutil.copyfile(out/PDF,aud/PDF)
    with Image.open(out/'qa/guide-1.png') as im:
        im.thumbnail((445,632),Image.Resampling.LANCZOS)
        im.convert('RGB').save(aud/'guide-cover.jpg',quality=88,optimize=True)
    expected_public={'index.html','altraware.png','guide-cover.jpg',PDF}
    assert {p.name for p in aud.iterdir()}==expected_public, 'Remove stale files from audience-page; never deploy owner assets.'
    files={name:out/name for name in (REF,CLEAN,COVER,PDF)}
    for name in ('API-MCP-Kiswahili.srt','API-MCP-English.srt','Record-Your-Voiceover.txt','timeline.json'):
        files[f'voiceover/{name}']=out/'audio'/name
    for name in ('encoded-checks.json','lab.json'):
        files[f'qa/{name}']=out/'qa'/name
    files['qa/asset-credits.json']=out/'assets/manifest.json'
    for name in ('scan','route','guide'):
        files[f'graphics/{name}.svg']=out/'stickers'/f'{name}.svg'
    for name in ('07-api-tip.md','07-api-tip-caption.txt','07-api-tip-manychat.md'):
        files[f'publish/{name}']=ROOT/'content/pilots'/name
    for name in ('creative-direction.md','tech-tip-series.md'):
        files[f'publish/{name}']=ROOT/'content'/name
    files['publish/Source-Notes.md']=ROOT/'content/research/2026-11-18-api-tip.md'
    # The lab is offline and small enough to independently run after npm install.
    for name in ('lab.mjs','lab.test.mjs','package.json','package-lock.json'):
        files[f'fixture/{name}']=HERE/name
    for name in sorted(expected_public):
        files[f'audience-page/{name}']=aud/name
    dest=private/'Tech-Tip-01-Review-Kit.zip'
    with ZipFile(dest,'w',compression=ZIP_DEFLATED,compresslevel=7) as z:
        for relative,p in files.items():z.write(p,relative)
        z.writestr('START-HERE.txt',"""ALTRAWARE · TECH TIP 01 · PRIVATE REVIEW ONLY

Tech-Tip-01-MCP-au-API.mp4: Kiswahili synthetic-voice reference, not Mwijay's voice.
Tech-Tip-01-Voiceover-Master.mp4: clean visual edit. Open voiceover/Record-Your-Voiceover.txt to record your five lines.
Cover-Tech-Tip-01.png: 9:16 cover. Crop by eye in Instagram.
Mwongozo-Bure-API-na-MCP.pdf: standalone free field guide with live link annotations.

Read publish/07-api-tip.md for content and QA; use caption.txt and manychat.md after sign-off.
The only audience files are in audience-page/ (or the PDF alone). Do not publish this ZIP or its folder.
Nothing was posted, scheduled or connected to Manychat. A real logged-out URL test and a DM test remain.
Pexels credits: Tima Miroshnichenko / 6170331 and Erkan Avanoğlu / 5903898. See qa/asset-credits.json.
Fixture: cd fixture && npm ci && npm test && npm run proof --silent. No provider account or true stock records.
""")
    with ZipFile(dest) as z:
        assert z.testzip() is None and set(z.namelist())==set(files)|{'START-HERE.txt'}
        for name in (PDF,REF,CLEAN,COVER):assert z.read(name)==(out/name).read_bytes()
        print(f'{dest}: {len(z.namelist())} files · {dest.stat().st_size:,} bytes')


if __name__=='__main__':
    main()
