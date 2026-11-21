"""Build the five lead-magnet PDFs and a QA contact sheet.

    python3 build.py            # all docs -> ../../out/runway-kit/
    python3 build.py invoice    # a single doc

Each doc is one module in docs/. The build writes PDFs, a machine-readable manifest and
PNG previews (pdfium) so a reviewer can check every page without a PDF reader.
"""
from __future__ import annotations

import importlib
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from kit import Doc, TRACK1, TRACK2, TRACK3  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "../.."))
# The PDFs are the deliverable the captions promise, so they are committed; previews and
# the manifest are regenerable and stay in the ignored out/ folder.
OUT = os.path.join(REPO, "content/runway/files")
PREVIEW = os.path.join(REPO, "out/runway-kit/preview")

DOCS = [
    ("invoice", "docs.invoice_flow", TRACK1, "Read this before you automate an invoice"),
    ("apptests", "docs.app_tests_sw", TRACK3, "Kipimo cha app tano kabla ya kulipia"),
    ("decisionfile", "docs.decision_file", TRACK2, "The Decision File · sources for episodes 01–03"),
    ("toolkit", "docs.toolkit_sw", TRACK3, "Toolkit ya freelancer · zana 7 za bure"),
    ("pricing", "docs.pricing_sw", TRACK3, "Kipimo cha bei · toleo la bure la jaribio"),
]


def build_one(key: str) -> dict:
    name, module_path, palette, subject = next(d for d in DOCS if d[0] == key)
    mod = importlib.import_module(module_path)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, mod.FILENAME)
    doc = Doc(path, palette, title=mod.TITLE, subject=subject,
              keywords=f"{mod.KEYWORD}, checklist, Mwijay Davie")
    doc.build(mod.build())

    import pypdf
    import pypdfium2 as pdfium

    reader = pypdf.PdfReader(path)
    pdf = pdfium.PdfDocument(path)
    previews = []
    pdir = os.path.join(PREVIEW, name)
    os.makedirs(pdir, exist_ok=True)
    for i in range(len(pdf)):
        out_png = os.path.join(pdir, f"p{i + 1}.png")
        pdf[i].render(scale=2).to_pil().save(out_png)
        previews.append(os.path.relpath(out_png, REPO))

    text = "\n".join((pg.extract_text() or "") for pg in reader.pages)
    urls = []
    for pg in reader.pages:
        for annot in pg.get("/Annots") or []:
            obj = annot.get_object()
            action = obj.get("/A")
            if action and action.get("/URI"):
                urls.append(str(action["/URI"]))
    return {
        "key": name,
        "file": os.path.basename(path),
        "title": mod.TITLE,
        "keyword": mod.KEYWORD,
        "pages": len(reader.pages),
        "bytes": os.path.getsize(path),
        "previews": previews,
        "link_annotations": len(urls),
        "chars": len(text),
        "first_page_chars": len(reader.pages[0].extract_text() or ""),
        "subject": subject,
    }


def main() -> None:
    only = sys.argv[1:] or [d[0] for d in DOCS]
    manifest = []
    for key in only:
        info = build_one(key)
        manifest.append(info)
        print(f"{info['file']:38s} {info['pages']} pages  {info['bytes'] / 1024:6.1f} KB  "
              f"{info['chars']:5d} chars  {len(info['previews'])} previews")
    mpath = os.path.join(OUT, "manifest.json")
    os.makedirs(OUT, exist_ok=True)
    existing = {}
    if os.path.exists(mpath):
        existing = {m["key"]: m for m in json.load(open(mpath))}
    for m in manifest:
        existing[m["key"]] = m
    with open(mpath, "w") as fh:
        json.dump(sorted(existing.values(), key=lambda m: m["key"]), fh, indent=2)
        fh.write("\n")
    print(f"\nmanifest -> {os.path.relpath(mpath, REPO)}")


if __name__ == "__main__":
    main()
