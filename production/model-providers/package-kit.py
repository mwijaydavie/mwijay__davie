"""Stage the bilingual audience files and package the QA-locked private owner kit."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import shutil
from zipfile import ZipFile, ZIP_DEFLATED
from PIL import Image

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent.parent
PDFS=tuple(f'Free-AI-API-Guide-{n}.pdf' for n in ('Swanglish','English'))
MEDIA=('Tech-Tip-Free-AI-API-60s.mp4','Tech-Tip-Model-Providers-Voiceover-Master.mp4','Cover-Free-AI-API.png')
PUBLIC=('index.html','altraware.png','guide-preview.jpg',*PDFS)


def stage(out):
    dest=out/'audience-page';dest.mkdir(exist_ok=True)
    shutil.copyfile(HERE/'download.html',dest/'index.html')
    shutil.copyfile(ROOT/'content/assets/altraware-mark.png',dest/'altraware.png')
    for n in PDFS:shutil.copyfile(out/n,dest/n)
    with Image.open(out/'qa/guide-sw-1.png') as im:
        im.thumbnail((444,630),Image.Resampling.LANCZOS);im.convert('RGB').save(dest/'guide-preview.jpg',quality=89,optimize=True)
    assert set(p.name for p in dest.iterdir())==set(PUBLIC), 'Do not publish owner files.'
    return dest


def main():
    cli=argparse.ArgumentParser(description=__doc__);cli.add_argument('output',type=Path);cli.add_argument('private',type=Path);cli.add_argument('--stage-only',action='store_true')
    args=cli.parse_args();out=args.output.resolve();pub=stage(out)
    if args.stage_only:print(f'Staged both PDFs in {pub}, not deployed.');return
    qa=json.loads((out/'qa/encoded-checks.json').read_text(encoding='utf-8'))
    for n in (*PDFS,*MEDIA):assert sha256((out/n).read_bytes()).hexdigest()==qa[n]['sha256'],n
    assert sha256((out/'audio/reference.wav').read_bytes()).hexdigest()==qa[MEDIA[0]]['reference']['sha256']
    for a in json.loads((out/'assets/manifest.json').read_text(encoding='utf-8')):
        assert sha256((out/'assets'/a['file']).read_bytes()).hexdigest()==a['sha256'],a['file']
    files={n:out/n for n in (*MEDIA,*PDFS)}
    files.update({f'audience-page/{n}':pub/n for n in PUBLIC})
    for n in ('reference.wav','Model-Providers-Swanglish.srt','Model-Providers-English.srt','Record-Your-Voiceover.txt','timeline.json'):
        files[f'voiceover/{n}']=out/'audio'/n
    for n in ('key-desk.jpg','local-desk.jpg','manifest.json'):
        files[f'assets/{n}']=out/'assets'/n
    for n in ('08-model-providers.md','08-model-providers-caption.txt','08-model-providers-manychat.md'):
        files[f'publish/{n}']=ROOT/'content/pilots'/n
    files['publish/Source-Notes.md']=ROOT/'content/research/2026-11-18-model-providers.md'
    for n in ('encoded-checks.json','asset-credits.json','local-proof.json'):
        files[f'qa/{n}']=out/'qa'/n
    for n in ('rate-demo.mjs','rate-demo.test.mjs','routes.json','cues.json'):
        files[f'source/{n}']=HERE/n
    args.private.mkdir(parents=True,exist_ok=True)
    dest=args.private/'Tech-Tip-Model-Providers-Review-Kit.zip'
    with ZipFile(dest,'w',compression=ZIP_DEFLATED,compresslevel=7) as z:
        for n,f in files.items():z.write(f,n)
        z.writestr('START-HERE.txt','''ALTRAWARE · FREE AI API? · PRIVATE OWNER REVIEW

Tech-Tip-Free-AI-API-60s.mp4 = TTS reference (Swanglish, captions burned in).
Tech-Tip-Model-Providers-Voiceover-Master.mp4 = picture only for your own voice.
Record eight beats using voiceover/Record-Your-Voiceover.txt. Do not copy the TTS pace.
voiceover/reference.wav is the separate TTS track, paced to this edit only.
Edit and retime the two SRTs after changing narration. Use Cover-Free-AI-API.png for the Reel.
assets/ has the two prepared backgrounds for rebuild, not a public download.

PDFs: separate 7-page Swanglish and English versions. Works without sign-in once downloaded.
The only public-ready payload is audience-page/ and the standalone PDFs, pending owner approval.
Do not send the Drive review folder or ZIP to commenters. No sharing, post or automation was enabled.
Model/offer docs reviewed 18 Nov 2026; no keys were used. See publish/Source-Notes.md for scope and credits.
Local fixture: node --test source/rate-demo.test.mjs (Node 22+).
''')
    with ZipFile(dest) as z:
        assert z.testzip() is None and set(z.namelist())==set(files)|{'START-HERE.txt'}
        for n in (*PDFS,*MEDIA):assert z.read(n)==(out/n).read_bytes()
        print(f'{dest} · {len(z.namelist())} files · {dest.stat().st_size:,} bytes')


if __name__=='__main__':main()
