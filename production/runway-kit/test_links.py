"""Guard: every file a track doc points at must exist, and every committed PDF must be claimed.

    python3 test_links.py

The rule from AGENTS.md is "no CTA for a file that is not ready". This test enforces it
mechanically: any markdown link into content/runway/files/ has to resolve to a real file, and
any PDF sitting in that folder has to be listed in its README with a keyword.
"""
from __future__ import annotations

import os
import re
import unittest

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../.."))
FILES_DIR = os.path.join(REPO, "content/runway/files")
TRACK_DOCS = [
    "content/runway/README.md",
    "content/runway/track-1-ai-systems.md",
    "content/runway/track-2-stories.md",
    "content/runway/track-3-tools.md",
    "content/runway/files/README.md",
    "content/runway/sprint-novi-21-29.md",
]
LINK = re.compile(r"\]\((files/[^)\s]+|[A-Za-z0-9._-]+\.pdf)\)")


class LinkTest(unittest.TestCase):
    @staticmethod
    def read(path: str) -> str:
        with open(path, encoding="utf-8") as fh:
            return fh.read()

    def test_doc_links_resolve(self):
        for doc in TRACK_DOCS:
            path = os.path.join(REPO, doc)
            self.assertTrue(os.path.exists(path), f"{doc} is missing")
            base = os.path.dirname(path)
            text = self.read(path)
            for target in LINK.findall(text):
                candidates = [os.path.join(base, target), os.path.join(FILES_DIR, target)]
                self.assertTrue(any(os.path.exists(c) for c in candidates),
                                f"{doc}: broken link -> {target}")

    def test_every_pdf_is_documented(self):
        readme = self.read(os.path.join(FILES_DIR, "README.md"))
        pdfs = sorted(f for f in os.listdir(FILES_DIR) if f.endswith(".pdf"))
        self.assertEqual(len(pdfs), 5, f"expected 5 lead magnets, found {pdfs}")
        for name in pdfs:
            self.assertIn(f"`{name}`", readme, f"{name} exists but is not listed in files/README.md")

    def test_no_dangling_file_promises(self):
        """A post may not name a file as ready when the folder does not contain it."""
        have = {f for f in os.listdir(FILES_DIR) if f.endswith(".pdf")}
        for doc in TRACK_DOCS[:4]:
            text = self.read(os.path.join(REPO, doc))
            for claimed in re.findall(r"`([A-Za-z0-9-]+\.pdf)`", text):
                if claimed in have:
                    continue
                # not built yet is fine, but it must not be described as ready
                for line in text.splitlines():
                    if f"`{claimed}`" in line and "Tayari" in line:
                        self.fail(f"{doc}: {claimed} is described as ready but is not in files/")


if __name__ == "__main__":
    unittest.main(verbosity=2)
