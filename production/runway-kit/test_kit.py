"""Measured QA for the lead-magnet PDFs. Run: python3 test_kit.py

These do not check that a file exists — they open the PDF and measure it: page size, glyph
boxes against the print margins, embedded fonts, the keyword line on the last page, and the
copy rules from AGENTS.md (no guarantee/earnings language, no unlaunched price claims).
"""
from __future__ import annotations

import os
import re
import sys
import unittest

import pypdf
import pypdfium2 as pdfium

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import MARGIN_BOTTOM, MARGIN_TOP, MARGIN_X, PAGE_H, PAGE_W  # noqa: E402

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../.."))
OUT = os.path.join(REPO, "content/runway/files")

# file -> (pages, keyword, language)
EXPECTED = {
    "Invoice-Flow-Checklist.pdf": (5, "STACK", "en"),
    "Kipimo-cha-App-5-Tests.pdf": (5, "KIT", "sw"),
    "The-Decision-File-Sources.pdf": (6, "FILE", "en"),
    "Toolkit-ya-Freelancer.pdf": (5, "TOOLKIT", "sw"),
    "Bei-Sample-Sura-1.pdf": (5, "BEI", "sw"),
}

BANNED = [
    r"\bguarantee(d|s)?\b", r"\bguaranteed income\b", r"\bpassive income\b",
    r"\bproven (system|method) to (make|earn)\b", r"\$?\d+k? ?/ ?month\b",
    r"\bearn(ing)? (TSh|KES|USD|\$)\b", r"\b100% (safe|accurate|reliable)\b",
]
# Chrome drawn in the margins on purpose; excluded from the body-box test.
CHROME = re.compile(r"^(Mwijay Davie|\d{2}|[A-Z][a-z].{0,60})$")


def pdf_path(name: str) -> str:
    return os.path.join(OUT, name)


class KitTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        missing = [n for n in EXPECTED if not os.path.exists(pdf_path(n))]
        if missing:
            raise unittest.SkipTest(f"run `python3 build.py` first; missing {missing}")

    def each(self):
        """Eager list, not a generator: subTest + generators silently abort the loop."""
        out = []
        for name, (_pages, keyword, lang) in EXPECTED.items():
            out.append((name, keyword, lang, pypdf.PdfReader(pdf_path(name))))
        return out

    def test_page_count_and_size(self):
        for name, _kw, _lang, reader in self.each():
            self.assertEqual(len(reader.pages), EXPECTED[name][0], f"{name}: page count")
            for i, page in enumerate(reader.pages):
                box = page.mediabox
                self.assertAlmostEqual(float(box.width), PAGE_W, delta=0.6, msg=f"{name} p{i + 1} width")
                self.assertAlmostEqual(float(box.height), PAGE_H, delta=0.6, msg=f"{name} p{i + 1} height")

    def test_no_orphan_pages(self):
        """A page with almost no text is a pagination bug, not a design choice."""
        for name, _kw, _lang, reader in self.each():
            for i, page in enumerate(reader.pages[1:], start=2):
                text = (page.extract_text() or "").strip()
                self.assertGreater(len(text), 320, f"{name} p{i} has only {len(text)} chars: {text[:80]!r}")

    def test_text_stays_inside_print_margins(self):
        for name in EXPECTED:
            pdf = pdfium.PdfDocument(pdf_path(name))
            for i in range(len(pdf)):
                page = pdf[i]
                tp = page.get_textpage()
                for j in range(tp.count_rects()):
                    left, bottom, right, top = tp.get_rect(j)
                    if left < 0 or bottom < 0:
                        continue  # blank/zero rects
                    self.assertGreaterEqual(left, MARGIN_X - 1.5,
                                            f"{name} p{i + 1}: glyph at x={left:.1f} left of margin")
                    self.assertLessEqual(right, PAGE_W - MARGIN_X + 1.5,
                                         f"{name} p{i + 1}: glyph at x={right:.1f} past right margin")
                    in_chrome_band = bottom < MARGIN_BOTTOM - 6 or top > PAGE_H - MARGIN_TOP + 2
                    if not in_chrome_band:
                        self.assertGreaterEqual(bottom, MARGIN_BOTTOM - 1.5,
                                                f"{name} p{i + 1}: body glyph below frame")
                        self.assertLessEqual(top, PAGE_H - MARGIN_TOP + 1.5,
                                             f"{name} p{i + 1}: body glyph above frame")

    def test_fonts_are_embedded(self):
        for name, _kw, _lang, reader in self.each():
            for i, page in enumerate(reader.pages, start=1):
                res = page.get("/Resources")
                res = res.get_object() if hasattr(res, "get_object") else (res or {})
                fonts = (res.get("/Font") or {})
                fonts = fonts.get_object() if hasattr(fonts, "get_object") else fonts
                self.assertGreater(len(fonts), 0, f"{name} p{i}: no fonts")
                for ref in fonts.values():
                    base = str(ref.get_object().get("/BaseFont", ""))
                    self.assertTrue(base.startswith("/"), f"{name} p{i}: odd font name {base}")
                    descriptor_key = "/FontDescriptor"
                    font = ref.get_object()
                    desc = font.get(descriptor_key)
                    if desc is None and "/DescendantFonts" in font:
                        desc = font["/DescendantFonts"][0].get_object().get("/FontDescriptor")
                    embeds = ("/FontFile" in (desc or {})) | ("/FontFile2" in (desc or {}))
                    self.assertTrue(embeds, f"{name} p{i}: {base} not embedded")

    def test_keyword_cta_on_last_page(self):
        pattern = {"en": r"(?i)comment {kw}", "sw": r"(?i)andika {kw}"}
        for name, keyword, lang, reader in self.each():
            tail = (reader.pages[-1].extract_text() or "")
            rx = pattern[lang].format(kw=re.escape(keyword))
            self.assertRegex(re.sub(r"\s+", " ", tail), rx,
                             f"{name}: last page is missing the {keyword} call to action")

    def test_banned_claims(self):
        for name, _kw, _lang, reader in self.each():
            all_text = " ".join((p.extract_text() or "") for p in reader.pages)
            flat = re.sub(r"\s+", " ", all_text)
            for rx in BANNED:
                self.assertNotRegex(flat, rx, f"{name}: banned claim /{rx}/")

    def test_metadata(self):
        for name, keyword, lang, reader in self.each():
            meta = reader.metadata
            self.assertEqual(meta.author, "Mwijay Davie", f"{name}: author")
            self.assertTrue(meta.title, f"{name}: title")
            self.assertIn(keyword, (meta.get("/Keywords") or ""), f"{name}: keyword in metadata")
            cat = str(reader.trailer["/Root"].get("/Lang") or "").lstrip("/")
            self.assertEqual(cat, lang, f"{name}: document language")

    def test_every_page_has_a_visible_section_label(self):
        """Kicker lines keep the documents skimmable; each page after the cover needs one."""
        for name, _kw, _lang, reader in self.each():
            for i, page in enumerate(reader.pages[1:], start=2):
                text = (page.extract_text() or "").upper()
                self.assertRegex(text, r"(PART|SURA|TESTS|EPISODE|APPENDIX|KANUNI|ZANA|JEDWALI|"
                                       r"KINACHOFUATA|BAADA|KWA NINI|JEDWALI LA|HOW TO READ)",
                                 f"{name} p{i}: no section label")


class ManifestTest(unittest.TestCase):
    def test_manifest_matches_files(self):
        import json
        mpath = os.path.join(OUT, "manifest.json")
        if not os.path.exists(mpath):
            self.skipTest("no manifest")
        with open(mpath) as fh:
            data = {m["file"]: m for m in json.load(fh)}
        for name, (pages, _kw, _lang) in EXPECTED.items():
            self.assertIn(name, data, f"{name} missing from manifest.json")
            self.assertEqual(data[name]["pages"], pages, f"{name}: manifest page count stale")
            self.assertEqual(data[name]["bytes"], os.path.getsize(pdf_path(name)),
                             f"{name}: manifest is stale — rebuild")


if __name__ == "__main__":
    unittest.main(verbosity=2)
