"""Stage a private owner handoff, including only cleared and prepared media."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import shutil
from zipfile import ZIP_DEFLATED, ZIP_STORED, ZipFile

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'production/agent-access'
MP4 = 'Reel-AI-Isome-Stoo-Bei-Ibaki-30s.mp4'
COVER = 'Cover-AI-Isome-Stoo.png'
CAPTION = 'Caption-AI-Isome-Stoo.txt'
SRTS = [f'Subtitles-AI-Isome-Stoo-{lang}.srt' for lang in ('Kiswahili','English')]
ZIP = 'AI-Isome-Stoo-Post-Kit.zip'

START = '''AI isome stoo. Bei ibaki. · Altraware Field Notes 06

1. Tazama MP4 ndani ya Post/ — sekunde 30, 1080 × 1920, 60 fps.
2. Tumia Cover-AI-Isome-Stoo.png kwa cover na Caption-AI-Isome-Stoo.txt kwa copy.
   Manukuu ya Kiswahili tayari yako kwenye video. Faili za SRT za Kiswahili na
   Kiingereza zipo ukizihitaji; usiongeze SW ya pili juu ya iliyopo.
3. Stickers/ ina SVG tano tulizochora kwa Reel. Review/ ina vyanzo, ushahidi wa
   jaribio la ndani na ukaguzi wa video. Hii si integration ya FaidaHQ au Proof.

Rebuild/ has the pinned source and the prepared, credited images and audio.
No raw owner upload, owner links, unredacted demo figures, secrets or node_modules.
From Rebuild/ with Node 22, FFmpeg and Chromium installed:
  npm ci --prefix production/agent-access
  npm --prefix production/agent-access test
  CHROME_PATH=/path/to/chromium npm --prefix production/agent-access run render -- all
Generated photos are editorial illustrations; no customers or real shop records
are depicted. The prepared FaidaHQ screenshot is product context only.
No upload to social or change to sharing permissions is implied by this kit.
'''


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('export',type=Path)
    parser.add_argument('delivery',type=Path)
    args=parser.parse_args()
    p,dst=args.export.resolve(),args.delivery.resolve()
    dst.mkdir(parents=True,exist_ok=True)
    qa=json.loads((p/'qa/encoded-checks.json').read_text(encoding='utf-8'))
    assert qa['full_decode_ok'] and qa['sha256']==sha256((p/MP4).read_bytes()).hexdigest()
    manifest=json.loads((p/'assets/evidence.json').read_text(encoding='utf-8'))
    for a in manifest:
        expected=p/'assets'/Path(a['file']).name
        assert a['sha256']==sha256(expected.read_bytes()).hexdigest()
    for name in (MP4,COVER):
        shutil.copyfile(p/name,dst/name)
    source_files=[path for path in SOURCE.iterdir() if path.is_file() and path.suffix in
                  ('.mjs','.json','.ts','.tsx','.css','.md','.py')]
    content_files=[ROOT/'content/pilots/06-agent-access-caption.txt',ROOT/'content/pilots/06-agent-access.md',
                   ROOT/'content/research/2026-11-18-agent-permissions.md',ROOT/'content/assets/altraware-mark.png']
    with ZipFile(dst/ZIP,'w',ZIP_DEFLATED,compresslevel=6) as z:
        z.writestr('START-HERE.txt',START)
        for name in (MP4,COVER,CAPTION):
            z.write(p/name,f'Post/{name}',compress_type=ZIP_STORED if name in (MP4,COVER) else ZIP_DEFLATED)
        for name in SRTS:
            z.write(p/'audio'/name,f'Post/{name}')
        for name in ('box','link','lock','stamp','tag'):
            z.write(p/'stickers'/f'{name}.svg',f'Stickers/{name}.svg')
        z.write(content_files[2],'Review/Dated-sources.md')
        z.write(content_files[1],'Review/Editorial-notes.md')
        for name in ('encoded-checks.json','local-mcp-results.json'):
            z.write(p/'qa'/name,f'Review/{name}')
        for path in sorted(source_files+content_files):
            z.write(path,f'Rebuild/{path.relative_to(ROOT).as_posix()}')
        for name in [f'assets/{a["file"]}' for a in manifest] + ['assets/evidence.json','audio/mix.wav','audio/props.json',
                    *[f'audio/{srt}' for srt in SRTS]]:
            z.write(p/name,f'Rebuild/out/agent-access/{name}')
    with ZipFile(dst/ZIP) as z:
        assert z.testzip() is None
        assert len(z.namelist())==len(set(z.namelist()))
        count=len(z.namelist())
    assert all(0 < (dst/name).stat().st_size < 100_000_000 for name in (MP4,COVER,ZIP))
    print(f'ZIP CRC OK · {count} files')
    for name in (MP4,COVER,ZIP):
        print(f'{(dst/name).stat().st_size:>10,} bytes · {name}')


if __name__ == '__main__':
    main()
