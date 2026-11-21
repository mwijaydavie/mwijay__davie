"""Shared design system for the runway lead-magnet PDFs.

A5 portrait, same palette and type roles as the Reels so a DM file looks like the
account that sent it. Everything is measured before it is drawn: `fit_block` shrinks
until copy fits the column, and `paginate` refuses to overflow a page.

Marketing copy lives in content, technical URLs live in code (`links.py`) so a
reviewer only has to read prose.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A5
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, KeepTogether, PageBreak,
                                PageTemplate, Paragraph, Spacer, TableStyle)
from reportlab.platypus import Table as _RLTable


class Table(_RLTable):
    """reportlab emits an empty Helvetica text object for cells without an explicit font;
    that would embed no font at all, so every table starts from the embedded body face."""

    def __init__(self, data, *a, **kw):
        super().__init__(data, *a, **kw)
        self.setStyle(TableStyle([("FONTNAME", (0, 0), (-1, -1), "Body")]))

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")

PAGE_W, PAGE_H = A5  # 419.53 x 595.28 pt
MARGIN_X = 36
MARGIN_TOP = 34
MARGIN_BOTTOM = 40
COL_W = PAGE_W - 2 * MARGIN_X


# ---------------------------------------------------------------- palettes
@dataclass(frozen=True)
class Palette:
    ink: str = "#161827"
    soft: str = "#3C4355"
    muted: str = "#6B7285"
    line: str = "#D5D9E3"
    paper: str = "#FBFAF4"
    panel: str = "#F2F3EC"
    accent: str = "#3343C5"
    accent_ink: str = "#FFFFFF"
    highlight: str = "#DFFC77"
    highlight_ink: str = "#14161F"

    def c(self, name: str) -> Color:
        return HexColor(getattr(self, name))


# Track 1 (systems, English): paper + cobalt + lime, on the site's brand palette
TRACK1 = Palette()
# Track 2 (stories, English): the dark vertical is inverted for a printable handout
TRACK2 = Palette(paper="#F7F6F1", accent="#101322", highlight="#DFFC77",
                 panel="#ECEDE4", muted="#5C6478")
# Track 3 (tools, Swahili): paper + terracotta (the account colour, not the site's)
TRACK3 = Palette(accent="#C1441F", highlight="#F6D9C9", highlight_ink="#5A1D0C",
                 panel="#F1F2EA")


# ---------------------------------------------------------------- fonts
_registered = False


def register_fonts() -> None:
    global _registered
    if _registered:
        return
    from reportlab import rl_config
    rl_config.canvas_basefontname = "Body"   # no implicit Helvetica anywhere
    for name, file in {
        "Body": "Inter-400.ttf",
        "BodyMed": "Inter-600.ttf",
        "BodyBold": "Inter-700.ttf",
        "Display": "SpaceGrotesk-700.ttf",
        "Serif": "Fraunces-700.ttf",
        "Mono": "JetBrainsMono-600.ttf",
        "MonoBold": "JetBrainsMono-700.ttf",
    }.items():
        pdfmetrics.registerFont(TTFont(name, os.path.join(FONT_DIR, file)))
    _registered = True


# ---------------------------------------------------------------- styles
def styles(p: Palette) -> dict[str, ParagraphStyle]:
    register_fonts()
    base = dict(fontName="Body", textColor=p.c("ink"), spaceBefore=0)
    return {
        "kicker": ParagraphStyle("kicker", fontName="MonoBold", fontSize=7.6, leading=10,
                                 textColor=p.c("accent"), spaceAfter=5),
        "h1": ParagraphStyle("h1", fontName="Display", fontSize=31, leading=31.5,
                             textColor=p.c("ink"), spaceAfter=9, tracking=-0.9),
        "h2": ParagraphStyle("h2", fontName="Display", fontSize=17.5, leading=19.5,
                             textColor=p.c("ink"), spaceBefore=11, spaceAfter=5, tracking=-0.4),
        "h3": ParagraphStyle("h3", fontName="BodyBold", fontSize=10.2, leading=13,
                             textColor=p.c("ink"), spaceAfter=2),
        "body": ParagraphStyle("body", fontSize=9.3, leading=13.4, spaceAfter=5, **base),
        "bodytight": ParagraphStyle("bodytight", fontSize=9.3, leading=13.4, spaceAfter=0, **base),
        "small": ParagraphStyle("small", fontSize=7.9, leading=11, spaceAfter=3,
                                textColor=p.c("soft"), fontName="Body"),
        "tiny": ParagraphStyle("tiny", fontName="Body", fontSize=7, leading=9.6,
                               textColor=p.c("muted")),
        "mono": ParagraphStyle("mono", fontName="Mono", fontSize=7.6, leading=11,
                               textColor=p.c("ink")),
        "monosmall": ParagraphStyle("monosmall", fontName="Mono", fontSize=6.6, leading=9,
                                    textColor=p.c("muted")),
        "lead": ParagraphStyle("lead", fontName="BodyMed", fontSize=10.6, leading=15.2,
                               textColor=p.c("soft"), spaceAfter=8),
        "cell": ParagraphStyle("cell", fontName="Body", fontSize=8.3, leading=11.2,
                               textColor=p.c("ink")),
        "cellhead": ParagraphStyle("cellhead", fontName="BodyBold", fontSize=8.3, leading=11.2,
                                   textColor=p.c("ink")),
        "cellmono": ParagraphStyle("cellmono", fontName="Mono", fontSize=7.4, leading=10.4,
                                   textColor=p.c("ink")),
        "quote": ParagraphStyle("quote", fontName="Serif", fontSize=13, leading=17.5,
                                textColor=p.c("ink"), spaceAfter=6),
    }


# ---------------------------------------------------------------- measuring
def measure(par: Paragraph, width: float) -> float:
    return par.wrap(width, 2000)[1]


def fit_paragraph(text: str, style: ParagraphStyle, width: float, max_height: float,
                  min_size: float = 7.4, step: float = 0.3) -> Paragraph:
    """Shrink a paragraph until it fits `max_height`; keeps the style's colour/leading ratio."""
    size = style.fontSize
    while True:
        par = Paragraph(text, style)
        if measure(par, width) <= max_height or size <= min_size:
            return par
        size = round(size - step, 2)
        style = ParagraphStyle(style.name, parent=style, fontSize=size,
                               leading=size * (style.leading / style.fontSize))


def fit_block(blocks: list, width: float, max_height: float, min_scale: float = 0.78) -> list:
    """Scale a group of paragraphs down together (as fit_paragraph does per block)."""
    scale = 1.0
    while True:
        scaled = [_scaled(b, scale) for b in blocks]
        if sum(measure(b, width) for b in scaled) <= max_height or scale <= min_scale:
            return scaled
        scale = round(scale - 0.03, 3)


def _scaled(par: Paragraph, scale: float) -> Paragraph:
    st = par.style
    st2 = ParagraphStyle(st.name, parent=st, fontSize=st.fontSize * scale,
                         leading=st.leading * scale, spaceAfter=st.spaceAfter * scale)
    return Paragraph(par.text, st2)


# ---------------------------------------------------------------- blocks
def kicker(text: str, p: Palette) -> Paragraph:
    return Paragraph(text.upper(), styles(p)["kicker"])


def h1(text: str, p: Palette) -> Paragraph:
    return Paragraph(text, styles(p)["h1"])


def h2(text: str, p: Palette) -> Paragraph:
    return Paragraph(text, styles(p)["h2"])


def body(text: str, p: Palette, style: str = "body") -> Paragraph:
    return Paragraph(text, styles(p)[style])


def rule(p: Palette, thickness: float = 1.1, color: str = "ink") -> Table:
    t = Table([[""]], colWidths=[COL_W], rowHeights=[thickness])
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), thickness, p.c(color)),
                             ("TOPPADDING", (0, 0), (-1, -1), 0),
                             ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    return t


def panel(flowables: list, p: Palette, bg: str = "panel", pad: float = 11,
          bar: str | None = None, bar_color: str = "accent") -> Table:
    t = Table([[flowables]], colWidths=[COL_W])
    cmds = [
        ("BACKGROUND", (0, 0), (-1, -1), p.c(bg)),
        ("LEFTPADDING", (0, 0), (-1, -1), pad + (4 if bar else 0)),
        ("RIGHTPADDING", (0, 0), (-1, -1), pad),
        ("TOPPADDING", (0, 0), (-1, -1), pad),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROUNDEDCORNERS", [4, 4, 4, 4]),
    ]
    if bar:
        cmds.append(("LINEBEFORE", (0, 0), (0, -1), 3.2, p.c(bar_color)))
    t.setStyle(TableStyle(cmds))
    return t


def chip(text: str, p: Palette, fill: str = "highlight", ink: str = "highlight_ink",
         size: float = 7.4) -> Table:
    st = ParagraphStyle("chip", fontName="MonoBold", fontSize=size, leading=size * 1.3,
                        textColor=p.c(ink))
    par = Paragraph(text, st)
    w = pdfmetrics.stringWidth(text, "MonoBold", size) + 12
    t = Table([[par]], colWidths=[w], rowHeights=[size * 1.3 + 7])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), p.c(fill)),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("ROUNDEDCORNERS", [3, 3, 3, 3]),
    ]))
    return t


def bullets(items: list[str], p: Palette, marker: str = "–", size: float | None = None) -> list:
    out = []
    st = styles(p)["body"] if size is None else ParagraphStyle(
        "b", parent=styles(p)["body"], fontSize=size, leading=size * 1.44)
    for it in items:
        out.append(Paragraph(f'<font name="BodyBold">{marker}</font>&nbsp;&nbsp;{it}', st))
    return out


def table(header: list, rows: list, p: Palette, widths: list[float] | None = None,
          mono_cols: tuple = (), head_bg: str = "accent", head_ink: str = "accent_ink",
          zebra: bool = True, size: float | None = None, pad: float = 5) -> Table:
    st = styles(p)
    if size:
        head_style = ParagraphStyle("ch", parent=st["cellhead"], fontSize=size, leading=size * 1.32)
        cell_style = ParagraphStyle("cc", parent=st["cell"], fontSize=size, leading=size * 1.32)
        mono_style = ParagraphStyle("cm", parent=st["cellmono"], fontSize=size - 0.6, leading=size * 1.32)
    else:
        head_style, cell_style, mono_style = st["cellhead"], st["cell"], st["cellmono"]
    head = [Paragraph(h, head_style) for h in header]
    data = [head]
    for r in rows:
        data.append([Paragraph(str(cell), mono_style if i in mono_cols else cell_style)
                     for i, cell in enumerate(r)])
    cw = widths or [COL_W / len(header)] * len(header)
    t = Table(data, colWidths=cw, repeatRows=1)
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), p.c(head_bg)),
        ("TEXTCOLOR", (0, 0), (-1, 0), p.c(head_ink)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), pad),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 1), (-1, -1), 0.5, p.c("line")),
    ]
    if zebra:
        for i in range(2, len(data), 2):
            cmds.append(("BACKGROUND", (0, i), (-1, i), p.c("paper")))
    t.setStyle(TableStyle(cmds))
    return t


def checkbox_row(label: str, detail: str, p: Palette, hint: str = "") -> Table:
    """One writeable line: an empty box, a label, and a light rule for the answer."""
    st = styles(p)
    box = Table([[""]], colWidths=[11], rowHeights=[11])
    box.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.9, p.c("soft")),
                            ("LEFTPADDING", (0, 0), (-1, -1), 0),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                            ("TOPPADDING", (0, 0), (-1, -1), 0),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    # empty strings would be drawn by reportlab's implicit Helvetica -> keep a Spacer instead
    txt = [Paragraph(f"{label}", ParagraphStyle("cb", parent=st["cellhead"], fontSize=9.4)),
           Paragraph(detail, ParagraphStyle("cbd", parent=st["small"], fontSize=8))
           if detail else Spacer(1, 0)]
    hint_par = Paragraph(hint, st["tiny"]) if hint else Spacer(1, 0)
    t = Table([[box, txt, hint_par]], colWidths=[18, COL_W * 0.56, COL_W * 0.44 - 18])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (0, 0), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, p.c("line")),
    ]))
    return t


def cover_block(p: Palette, brand: str, title: str, standfirst: str, meta: list[tuple[str, str]],
                chip_text: str = "FREE · NO SIGN-UP", note: str = "",
                toc: list[tuple[str, str]] | None = None) -> list:
    """Cover composition: brand line, kicker, display title, standfirst, meta grid."""
    st = styles(p)
    out = [
        Paragraph(f'<font name="MonoBold" color="{p.accent}">■</font>&nbsp; {brand.upper()}',
                  ParagraphStyle("brand", fontName="Mono", fontSize=7.4, leading=10,
                                 textColor=p.c("soft"))),
        Spacer(1, 16),
    ]
    if chip_text:
        out += [chip(chip_text, p), Spacer(1, 12)]
    out += [
        Paragraph(title, ParagraphStyle("covertitle", fontName="Display", fontSize=30, leading=30.5,
                                        textColor=p.c("ink"), tracking=-0.9)),
        Spacer(1, 10),
        Paragraph(standfirst, ParagraphStyle("coverlead", fontName="BodyMed", fontSize=10.6,
                                             leading=15.4, textColor=p.c("soft"))),
        Spacer(1, 18),
    ]
    rows = [[Paragraph(k.upper(), st["monosmall"]), Paragraph(v, st["cell"])] for k, v in meta]
    t = Table(rows, colWidths=[COL_W * 0.3, COL_W * 0.7])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, p.c("line")),
    ]))
    out.append(t)
    if toc:
        out.append(Spacer(1, 16))
        out.append(Paragraph("INSIDE", ParagraphStyle("toclabel", fontName="MonoBold", fontSize=6.8,
                                                      leading=9, textColor=p.c("muted"), spaceAfter=4)))
        rows = [[Paragraph(k, st["monosmall"]), Paragraph(v, st["cell"])] for k, v in toc]
        tt = Table(rows, colWidths=[COL_W * 0.13, COL_W * 0.87])
        tt.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 2.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
        ]))
        out.append(tt)
    if note:
        out += [Spacer(1, 12), Paragraph(note, st["small"])]
    return out


def callout(label: str, text: str, p: Palette, fill: str = "highlight",
            ink: str = "highlight_ink") -> Table:
    st = styles(p)
    label_par = Paragraph(label.upper(), ParagraphStyle("colabel", fontName="MonoBold", fontSize=7,
                                                        leading=9.4, textColor=p.c(ink)))
    body_par = Paragraph(text, ParagraphStyle("cobody", fontName="BodyMed", fontSize=9.2,
                                              leading=13, textColor=p.c(ink)))
    t = Table([[label_par], [body_par]], colWidths=[COL_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), p.c(fill)),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (0, 0), 8), ("BOTTOMPADDING", (0, 0), (0, 0), 2),
        ("TOPPADDING", (0, 1), (0, 1), 0), ("BOTTOMPADDING", (0, 1), (0, 1), 9),
    ]))
    return t


def numbered_steps(steps: list[tuple[str, str, str]], p: Palette) -> Table:
    """steps = [(number, title, detail)]. Drawn as a table so rows cannot split."""
    st = styles(p)
    rows = []
    for num, title, detail in steps:
        badge = Table([[Paragraph(num, ParagraphStyle("num", fontName="MonoBold", fontSize=8.6,
                                                      leading=11, textColor=p.c("accent_ink")))]],
                      colWidths=[17], rowHeights=[17])
        badge.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), p.c("accent")),
                                  ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                                  ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                                  ("LEFTPADDING", (0, 0), (-1, -1), 0),
                                  ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                                  ("TOPPADDING", (0, 0), (-1, -1), 0),
                                  ("BOTTOMPADDING", (0, 0), (-1, -1), 1)]))
        rows.append([badge, [Paragraph(title, st["cellhead"]),
                             Paragraph(detail, ParagraphStyle("d", parent=st["small"], fontSize=8.2,
                                                              leading=11.2))]])
    t = Table(rows, colWidths=[26, COL_W - 26])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, p.c("line")),
    ]))
    return t


def source_line(text: str, p: Palette) -> Paragraph:
    return Paragraph(text, ParagraphStyle("src", fontName="Mono", fontSize=6.4, leading=9.2,
                                          textColor=p.c("muted"), spaceBefore=4))


def write_lines(n: int, p: Palette, height: float = 15, width: float = COL_W) -> Table:
    rows = [[Paragraph("", styles(p)["tiny"])] for _ in range(n)]
    t = Table(rows, colWidths=[width], rowHeights=[height] * n)
    cmds = [("LINEBELOW", (0, i), (-1, i), 0.5, p.c("line")) for i in range(n)]
    t.setStyle(TableStyle(cmds + [("LEFTPADDING", (0, 0), (-1, -1), 0),
                                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                                ("TOPPADDING", (0, 0), (-1, -1), 0),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
    return t


# ---------------------------------------------------------------- document
class Doc(BaseDocTemplate):
    def __init__(self, path: str, p: Palette, title: str, author: str = "Mwijay Davie",
                 subject: str = "", keywords: str = "", **kw):
        self.palette = p
        register_fonts()
        super().__init__(path, pagesize=A5, initialFontName="Body", initialFontSize=9, leftMargin=MARGIN_X, rightMargin=MARGIN_X,
                         topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
                         title=title, author=author, subject=subject, keywords=keywords,
                         lang="sw" if p is TRACK3 else "en", **kw)
        frame = Frame(MARGIN_X, MARGIN_BOTTOM, COL_W, PAGE_H - MARGIN_TOP - MARGIN_BOTTOM,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
                      id="body")
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[frame], onPage=self._cover_chrome),
            PageTemplate(id="inner", frames=[frame], onPage=self._inner_chrome),
        ])

    # page chrome is drawn here so content flowables can never cover it
    def _cover_chrome(self, canvas, doc):
        p = self.palette
        canvas.saveState()
        canvas.setFillColor(p.c("paper"))
        canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        canvas.setFillColor(p.c("accent"))
        canvas.rect(0, PAGE_H - 6, PAGE_W, 6, stroke=0, fill=1)
        canvas.setFont("Mono", 6.8)
        canvas.setFillColor(p.c("muted"))
        canvas.drawString(MARGIN_X, PAGE_H - 26, self.title.upper()[:64])
        canvas.restoreState()

    def _inner_chrome(self, canvas, doc):
        p = self.palette
        canvas.saveState()
        canvas.setStrokeColor(p.c("line"))
        canvas.setLineWidth(0.6)
        canvas.line(MARGIN_X, PAGE_H - 28, PAGE_W - MARGIN_X, PAGE_H - 28)
        canvas.setFont("Mono", 6.6)
        canvas.setFillColor(p.c("muted"))
        canvas.drawString(MARGIN_X, PAGE_H - 24, self.title)
        canvas.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 24, self.author)
        canvas.line(MARGIN_X, 30, PAGE_W - MARGIN_X, 30)
        canvas.drawString(MARGIN_X, 19, f"{doc.page:02d}")
        canvas.restoreState()

    def afterFlowable(self, flowable):
        pass
