#!/usr/bin/env python3
"""Altraware — "Website au Application?" tangazo la Kiswahili, sekunde 30.
Production PDF kwa Google Flow (Veo) — 3 × 10s. Kilichoko README.md, kimebadilishwa kuwa PDF nzuri."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Table, TableStyle, KeepTogether, PageBreak, Preformatted,
                                HRFlowable)
from reportlab.pdfgen import canvas as pdfcanvas

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "Altraware-Tangazo-Kiswahili.pdf")

VIOLET   = HexColor("#5b3fb5")
VIOLET_D = HexColor("#3d2a7a")
LILAC    = HexColor("#b9a6f2")
LILAC_BG = HexColor("#f2edfd")
CREAM    = HexColor("#fbf7ef")
SAND     = HexColor("#f4e3c4")
SAND_BG  = HexColor("#faf3e3")
INK      = HexColor("#1d2a33")
SLATE    = HexColor("#5b6b76")
MINT     = HexColor("#2fa87a")
CORAL    = HexColor("#e8735a")
GOLD     = HexColor("#c98a1f")

PAGE_W, PAGE_H = A4
M = 16 * mm

def cover(c: pdfcanvas.Canvas, doc):
    c.saveState()
    # field
    c.setFillColor(CREAM); c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    # big soft circle top-right (brand sun)
    c.setFillColor(HexColor("#f7e8d9")); c.circle(PAGE_W * 0.86, PAGE_H * 0.80, 64 * mm, stroke=0, fill=1)
    c.setFillColor(HexColor("#efe6fd")); c.circle(PAGE_W * 0.10, PAGE_H * 0.16, 46 * mm, stroke=0, fill=1)
    # footer bar
    c.setFillColor(VIOLET); c.rect(0, 0, PAGE_W, 26 * mm, stroke=0, fill=1)
    c.setFillColor(HexColor("#fbf7ef"))
    c.setFont("DVSB", 11)
    c.drawString(M, 14.5 * mm, "altra.tanzaniareach.com")
    c.setFont("DVS", 8)
    c.drawRightString(PAGE_W - M, 14.5 * mm, "DAR ES SALAAM  ·  2026")
    # logo line: cloud glyph
    c.setFillColor(VIOLET)
    _cloud(c, M, PAGE_H - 21 * mm, 11 * mm)
    c.setFillColor(INK)
    c.setFont("DVSB", 15.5)
    c.drawString(M + 15 * mm, PAGE_H - 18.6 * mm, "ALTRAWARE")
    c.setFont("DVSB", 15.5)
    c.setFillColor(VIOLET)
    c.drawString(M + 15 * mm + c.stringWidth("ALTRAWARE", "DVSB", 15.5) + 2.2 * mm, PAGE_H - 18.6 * mm, "TECHNOLOGY")
    c.setFont("DVS", 7.5)
    c.setFillColor(SLATE)
    c.drawString(M, PAGE_H - 25.5 * mm, "T A N Z A N I A N   S O F T W A R E   S T U D I O")
    # kicker
    c.setFont("DVSB", 10.5)
    c.setFillColor(CORAL)
    c.drawString(M, PAGE_H - 48 * mm, "M W O N G O Z O   W A   U Z A L I S H A J I   ·   P R O D U C T I O N   D O C")
    # Title
    c.setFillColor(INK)
    c.setFont("DVSB", 44)
    c.drawString(M, PAGE_H - 66 * mm, "“Website au")
    c.drawString(M, PAGE_H - 82 * mm, "Application?”")
    c.setFillColor(VIOLET)
    c.rect(M, PAGE_H - 88 * mm, 46 * mm, 2.2 * mm, stroke=0, fill=1)
    # subtitle
    c.setFillColor(INK)
    c.setFont("DVSB", 17)
    c.drawString(M, PAGE_H - 102 * mm, "Tangazo la Kiswahili — sekunde 30.")
    c.setFont("DVS", 10.5)
    c.setFillColor(SLATE)
    c.drawString(M, PAGE_H - 110 * mm, "Google Flow (Veo)  ·  3 × 10 sekunde  ·  9:16 kwa Reels/TikTok  ·  16:9 kwa YouTube")
    # three product cards
    y = PAGE_H - 152 * mm
    _card(c, M, y, "altra.tanzaniareach.com", "TOVUTI · MIUMBA", VIOLET)
    _card(c, M + 62 * mm, y, "faida-hq.vercel.app", "FAIDA POS · MADUKA", MINT)
    _card(c, M + 124 * mm, y, "caretrack-six.vercel.app", "CARETRACK · SHULE & VITUO", GOLD)
    # presenter line
    c.setFillColor(INK); c.setFont("DVSB", 10)
    c.drawString(M, y - 9 * mm, "Presenter: picha uliyochagua mwenyewe (image-30.png) — uso, nywele, hoops za dhahabu.")
    c.setFont("DVS", 9); c.setFillColor(SLATE)
    c.drawString(M, y - 15 * mm, "Maudhui yote: script ya Kiswahili, VO, ma-prompt ya Flow, mwongozo wa motion graphics,")
    c.drawString(M, y - 20.5 * mm, "picha halisi za demos, na kanuni za uongozi — hakuna kitu cha kubuni.")
    # tagline in footer bar
    c.setFillColor(HexColor("#fbf7ef")); c.setFont("DVSB", 9.5)
    c.drawCentredString(PAGE_W / 2, 8.5 * mm, "TECHNOLOGY  THAT  SPEAKS  OUR  LANGUAGE.")
    c.restoreState()

def _cloud(c, x, y, s):
    c.saveState(); c.translate(x, y); c.scale(s / 22, s / 14)
    p = c.beginPath()
    p.arc(2, 3, 10, 11, 90, 180); p.arc(6, 6, 17, 15, 160, 140); p.arc(12, 2, 22, 10, 250, 150)
    c.setFillColor(VIOLET); c.drawPath(p, stroke=0, fill=1); c.restoreState()

def _card(c, x, y, title, sub, accent):
    w, h = 54 * mm, 34 * mm
    c.saveState()
    c.setFillColor(INK); c.setFillAlpha(0.14)
    c.roundRect(x + 1.2 * mm, y - 1.2 * mm, w, h, 4 * mm, stroke=0, fill=1)
    c.setFillAlpha(1)
    c.setFillColor(HexColor("#fffdf8"))
    c.roundRect(x, y, w, h, 4 * mm, stroke=0, fill=1)
    c.setFillColor(accent); c.roundRect(x, y + h - 7 * mm, w, 7 * mm, 4 * mm, stroke=0, fill=1)
    c.rect(x, y + h - 7 * mm, w, 3.5 * mm, stroke=0, fill=1)
    c.setFillColor(HexColor("#fffdf8")); c.setFont("DVSB", 6.5)
    c.drawString(x + 4 * mm, y + h - 4.6 * mm, sub)
    c.setFillColor(INK); c.setFont("DVMonoB", 8.5)
    c.drawString(x + 4 * mm, y + h - 15 * mm, title)
    c.setFillColor(SLATE); c.setFont("DVS", 7)
    c.drawString(x + 4 * mm, y + h - 23 * mm, "· moja kwa moja ·")
    c.restoreState()

def content_page(c: pdfcanvas.Canvas, doc):
    c.saveState()
    c.setFillColor(VIOLET); c.rect(0, PAGE_H - 8 * mm, PAGE_W, 1.1 * mm, stroke=0, fill=1)
    c.setFillColor(SLATE); c.setFont("DVSB", 6.5)
    c.drawString(M, PAGE_H - 5.6 * mm, "ALTRAWARE TECHNOLOGY")
    c.drawRightString(PAGE_W - M, PAGE_H - 5.6 * mm, "WEBSITE AU APPLICATION? — TANGAZO LA KISWAHILI")
    c.setStrokeColor(HexColor("#e6ddcd")); c.setLineWidth(0.6)
    c.line(M, 9 * mm, PAGE_W - M, 9 * mm)
    c.setFillColor(SLATE); c.setFont("DVS", 6.5)
    c.drawString(M, 5.4 * mm, "altra.tanzaniareach.com")
    c.drawRightString(PAGE_W - M, 5.4 * mm, f"ukurasa {doc.page}")
    c.restoreState()

# ── styles ───────────────────────────────────────────────────────────────────
def st(name, **kw):
    base = dict(fontName="DVS", fontSize=9.5, leading=14, textColor=INK,
                spaceAfter=6, alignment=TA_LEFT)
    base.update(kw)
    return ParagraphStyle(name, **base)

H1  = st("H1", fontName="DVSB", fontSize=20, leading=24, textColor=VIOLET,
         spaceBefore=2, spaceAfter=10)
H2  = st("H2", fontName="DVSB", fontSize=12.5, leading=16, textColor=INK,
         spaceBefore=10, spaceAfter=5)
BODY = st("BODY")
SMALL = st("SMALL", fontSize=8, leading=11, textColor=SLATE)
VO   = st("VO", fontName="DVSB", fontSize=11.5, leading=17, textColor=INK)
CELL = st("CELL", fontSize=7.6, leading=10.5)
CELLB= st("CELLB", fontName="DVSB", fontSize=7.6, leading=10.5)
CELLW= st("CELLW", fontName="DVSB", fontSize=7.6, leading=10.5, textColor=HexColor("#fffdf8"))
CODE = ParagraphStyle("CODE", fontName="DVMono", fontSize=6.1, leading=8.6,
                      textColor=HexColor("#2b2340"))

def codebox(text):
    p = Preformatted(text, CODE)
    t = Table([[p]], colWidths=[PAGE_W - 2 * M])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LILAC_BG),
        ("LINEBEFORE", (0, 0), (0, -1), 2.6, VIOLET),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t

def voquote(text):
    t = Table([[Paragraph("SAUTI (VO)", st("VOtag", fontName="DVSB",
                fontSize=6.5, leading=8, textColor=CORAL, spaceAfter=2)), ],
               [Paragraph(text, VO)]], colWidths=[PAGE_W - 2 * M])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SAND_BG),
        ("LINEBEFORE", (0, 0), (0, -1), 3.2, CORAL),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t

def frame_table(rows):
    data = [[Paragraph("WAKATI", CELLW), Paragraph("PICHA", CELLW), Paragraph("MOTION GRAPHICS / SFX", CELLW)]]
    for a, b, c3 in rows:
        data.append([Paragraph(f"<b>{a}</b>", CELL), Paragraph(b, CELL), Paragraph(c3, CELL)])
    t = Table(data, colWidths=[17 * mm, 74 * mm, PAGE_W - 2 * M - 91 * mm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), VIOLET),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#fffdf8")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#fffdf8"), HexColor("#faf7ee")]),
        ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#e7dfcf")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    # white header text needs light color on first row via paragraph color
    return t

def hrow(label, value):
    return [Paragraph(f"<b>{label}</b>", CELL), Paragraph(value, CELL)]

# ── document ─────────────────────────────────────────────────────────────────
doc = BaseDocTemplate(OUT, pagesize=A4,
                      leftMargin=M, rightMargin=M, topMargin=14 * mm, bottomMargin=13 * mm,
                      title="Altraware — Tangazo la Kiswahili: Website au Application?",
                      author="Altraware Technology")
cover_frame = Frame(0, 0, PAGE_W, PAGE_H, id="cover")
body_frame  = Frame(M, 13 * mm, PAGE_W - 2 * M, PAGE_H - 14 * mm - 13 * mm, id="body")
doc.addPageTemplates([PageTemplate(id="cover", frames=[cover_frame], onPage=cover),
                      PageTemplate(id="body",  frames=[body_frame],  onPage=content_page)])

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
FD = "/usr/share/fonts/truetype/dejavu/"
for name, file in [("DVS", "DejaVuSans.ttf"), ("DVSB", "DejaVuSans-Bold.ttf"),
                   ("DVMono", "DejaVuSansMono.ttf"), ("DVMonoB", "DejaVuSansMono-Bold.ttf"),
                   ("DVSerifB", "DejaVuSerif-Bold.ttf")]:
    pdfmetrics.registerFont(TTFont(name, FD + file))

from reportlab.platypus import NextPageTemplate
story = [NextPageTemplate("body"), PageBreak()]

# ── §0 Yaliyomo ──────────────────────────────────────────────────────────────
story.append(Paragraph("Yaliyomo", H1))
toc = [
    ("01", "Muhtasari — lengo, watu, jukwaa, sauti na paleti"),
    ("02", "Muundo wa beats tatu (SWALI → MAJIBU HALISI → ANZA LEO)"),
    ("03", "BEAT 1 — SWALI (0:00–0:10): script ya VO + kila frame"),
    ("04", "BEAT 2 — MAJIBU HALISI (0:10–0:20): Faida POS + CareTrack halisi"),
    ("05", "BEAT 3 — ANZA LEO (0:20–0:30): CTA, bei, domain, tagline"),
    ("06", "Ma-prompt ya Google Flow — CLIP 1 (kunakili moja kwa moja)"),
    ("07", "Ma-prompt ya Google Flow — CLIP 2"),
    ("08", "Ma-prompt ya Google Flow — CLIP 3 (toleo la bidhaa)"),
    ("★", "TOLEO JIPYA — KARIAKOO · GENERAL & FUN: soko la Kariakoo, Kiswahili kamili (linapendekezwa)"),
    ("09", "Configura Flow: reference image, 9:16, 10s, Veo"),
    ("10", "Picha halisi za demos — jinsi ya kurekodi Faida & CareTrack"),
    ("11", "Picha za kurejea kutoka tovuti (altra.tanzaniareach.com)"),
    ("12", "Sauti: VO, muziki, SFX, captions za Kiswahili"),
    ("13", "Muunganisho kwenye editor + export specs + toleo la 16:9"),
    ("14", "UFAME — claim zote lazima zifanane na tovuti"),
    ("15", "Orodha ya kuanzisha — Flow to live"),
]
data = [[Paragraph(f"<font color='#5b3fb5'><b>{n}</b></font>", CELL), Paragraph(t, CELL)] for n, t in toc]
t = Table(data, colWidths=[14 * mm, PAGE_W - 2 * M - 14 * mm])
t.setStyle(TableStyle([
    ("ROWBACKGROUNDS", (0, 0), (-1, -1), [HexColor("#fffdf8"), HexColor("#faf7ee")]),
    ("LINEBELOW", (0, 0), (-1, -2), 0.35, HexColor("#eee7d8")),
    ("TOPPADDING", (0, 0), (-1, -1), 6.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 6.5),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
]))
story.append(t)
story.append(Spacer(1, 10))
story.append(Paragraph("Kumbuka: PDF hii ikiwa na picha zipya za tovuti zenu — "
                       "ukiniletea au ukielekeza kwenye folda ya Drive, ninaweka ndani yake "
                       "na kuitoa upya siku hiyo hiyo.", SMALL))

# ── §01 Muhtasari ────────────────────────────────────────────────────────────
story.append(Paragraph("01 — Muhtasari", H1))
tbl = [
    hrow("Lengo", "Tangazo la sekunde 30 — mtu anayeangalia ajibu swali: “Unahitaji website au application?” — na azungushe macho mara moja: <b>altra.tanzaniareach.com</b>"),
    hrow("Watu", "Wamiliki wa biashara ndogo–ndogo, maduka Kariakoo & mitaa, shule/vituo vya malezi, NGOs — Tanzania"),
    hrow("Jukwaa", "IG Reels · TikTok · YouTube Shorts (9:16) — toleo la YouTube (16:9) pia"),
    hrow("Lugha", "Kiswahili kwanza (VO + maandishi), Kiingereza tu kwenye tagline ya mwisho"),
    hrow("Mbinu", "Google Flow (Veo) · 3 klip za 10s · kuunganishwa CapCut / Alight Motion / Premiere"),
    hrow("Presenter", "Picha yako (image-30.png) — mwanamke mwenye nywele ndefu nyeusi, hoops za dhahabu, koti jeusi, ukuta wa hudhurungi"),
    hrow("Paleti", "Cream #FBF7EF · Sand #F4E3C4 · Violet #5B3FB5 · Ink #1D2A33 — hakuna black bg, hakuna neon"),
    hrow("Sauti", "VO ya nje (urekodiwe na wenu) — Flow epushwe kusoma Kiswahili; muziki wa afro-house instrumental -18 dB"),
]
t = Table(tbl, colWidths=[30 * mm, PAGE_W - 2 * M - 30 * mm])
t.setStyle(TableStyle([
    ("ROWBACKGROUNDS", (0, 0), (-1, -1), [HexColor("#fffdf8"), HexColor("#faf7ee")]),
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, HexColor("#eee7d8")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ("LEFTPADDING", (0, 0), (-1, -1), 2),
]))
story.append(t)

# ── §02 Muundo ───────────────────────────────────────────────────────────────
story.append(Paragraph("02 — Muundo wa beats tatu", H1))
tbl = [[Paragraph("<b>BEAT</b>", CELLW), Paragraph("<b>SEKUNDE</b>", CELLW), Paragraph("<b>KAZI YAKE</b>", CELLW)],
       [Paragraph("<b>1 — SWALI</b>", CELL), Paragraph("0:00 – 0:10", CELL),
        Paragraph("Mvutano: “daftari?” → Google kuwa haikumpati → <b>website au application?</b> — mtu huamka", CELL)],
       [Paragraph("<b>2 — MAJIBU HALISI</b>", CELL), Paragraph("0:10 – 0:20", CELL),
        Paragraph("Bidhaa zilizo hai: <b>Faida POS</b> (checkout 0.8s, 100% offline, ripoti SMS) na <b>CareTrack</b> (mahudhurio + SMS mzazi, ada M-Pesa, SW/EN)", CELL)],
       [Paragraph("<b>3 — ANZA LEO</b>", CELL), Paragraph("0:20 – 0:30", CELL),
        Paragraph("CTA moja tu: tovuti kuanzia <b>TSh 350,000</b> · <b>altra.tanzaniareach.com</b> · tagline halisi", CELL)]]
t = Table(tbl, colWidths=[38 * mm, 24 * mm, PAGE_W - 2 * M - 62 * mm])
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), VIOLET), ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#fffdf8")),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#fffdf8"), HexColor("#faf7ee")]),
    ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#e7dfcf")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
]))
# white text on the header row is handled by TEXTCOLOR against violet
story.append(t)
story.append(Paragraph("Kanuni moja: kila beat lina kazi moja — mvutano, uthibitisho, au hatua. Zisiingilie.", SMALL))

# ── §03 BEAT 1 ───────────────────────────────────────────────────────────────
story.append(Paragraph("03 — BEAT 1 · SWALI (0:00–0:10)", H1))
story.append(voquote("“Biashara yako bado inahesabu kwa daftari? Wateja wanakutafuta Google — na hawakupati. Unahitaji <b>website</b>. Au <b>application</b>. Si yoyote — unahitaji inayofanya kazi <b>HAPA</b>.”"))
story.append(Spacer(1, 6))
story.append(frame_table([
    ("0:00–0:02", "Extreme close-up ya uso wake — analeata kamera, sauti imejaa imani",
     "Kinetic type <b>“DAFTARI?”</b> inapiga — bold sans, nyeupe, cream pill · SFX stamp"),
    ("0:02–0:04", "Mikono tu (bila uso) ikichora namba kwenye daftari, penseli",
     "Type ya ziada ndogo: <b>“GOOGLE ✗ duka lako”</b> · SFX whoosh"),
    ("0:04–0:06", "Simu ikishikwa — search bar inaandika “duka la Kariakoo” → “Hakuna matokeo”",
     "Type hupiga: <b>“HAKUNA?”</b> — usiongeze maandishi madogo · SFX error pop"),
    ("0:06–0:08", "Medium shot — anashruga kidogo",
     "<b>“WEBSITE?”</b> inapiga → beat → <b>“APP?”</b> inapiga pili · SFX impact ×2"),
    ("0:08–0:10", "Hero shot — analeata kamera moja kwa moja",
     "Type kubwa: <b>“HAPA. KWETU.”</b> (cream serif + mshazari wa violet) · whoosh kwenda white frame"),
]))
story.append(Paragraph("Lengo la beat: mtu atoke kwenye video akiwa ameshikwa na swali — sio na majibu bado.", SMALL))

# ── §04 BEAT 2 ───────────────────────────────────────────────────────────────
story.append(Paragraph("04 — BEAT 2 · MAJIBU HALISI (0:10–0:20)", H1))
story.append(voquote("“Altraware Tech — tumetengeneza bidhaa halisi. <b>Faida POS</b>: duka linafungwa — ripoti iko simu yako. Hata bila internet. <b>CareTrack</b>: mahudhurio, ada kwa M-Pesa, na SMS kwa mzazi.”"))
story.append(Spacer(1, 6))
story.append(frame_table([
    ("0:10–0:13", "Presenter anasing simu gorofa kuelekea kamera — onyesho la moja kwa moja; screen ya <b>faida-hq.vercel.app</b> inachapwa (tap Chai/Chapati → CHARGE → ✓ kijani)",
     "Callout mono: <b>“FAIDA POS · 0.8s CHECKOUT”</b> · SFX UI blips + chime ya kisasa"),
    ("0:13–0:16", "Simu karibu na kamera — SMS toast inaingia chini ya skrini",
     "Type: <b>“Ripoti ya mauzo imewasili ✓”</b> · SFX notification pop"),
    ("0:16–0:18", "Cut — laptop + dashboard ya <b>caretrack-six.vercel.app/dashboard</b> (mahudhurio, ✓ za kijani)",
     "Callout mono: <b>“CARETRACK · SW / EN”</b> · SFX blip"),
    ("0:18–0:20", "Presenter, kamera moja kwa moja — kumalizia kwa nguvu",
     "Type: <b>“YOTE KISWAHILI KWANZA.”</b> · cut ngumu kwenda Beat 3"),
]))
story.append(Paragraph("Lengo la beat: jibu la swali la Beat 1 — si ahadi tupu, ni bidhaa halisi zinazofungika kwenye URLs ambazo mtu anaweza kugusa leo.", SMALL))

# ── §05 BEAT 3 ───────────────────────────────────────────────────────────────
story.append(Paragraph("05 — BEAT 3 · ANZA LEO (0:20–0:30)", H1))
story.append(voquote("“Unahitaji website, application, au mfumo wa biashara? Tovuti kuanzia <b>TSh 350,000</b>. Piga WhatsApp leo — <b>altra.tanzaniareach.com</b>. Technology that speaks our language.”"))
story.append(Spacer(1, 6))
story.append(frame_table([
    ("0:20–0:23", "Medium close-up — utulivu na uhakika, sio hype",
     "Kinetic rapida: <b>“WEBSITE?” “APP?” “MFUMO?”</b> — zikipitia haraka"),
    ("0:23–0:26", "Nyuma yake (out of focus), kadi 3 za UI zinafan out kwa 3D — browser cards",
     "Kadi mono: <b>altra.tanzaniareach.com</b> · <b>faida-hq.vercel.app</b> · <b>caretrack-six.vercel.app</b> — violet headers, cream fills"),
    ("0:26–0:28", "End-card inajengwa juu ya cream — logo ya Altraware inajisetiria",
     "<b>altra.tanzaniareach.com</b> inaandikwa herufi kwa herufi + cursor · sub-line: <b>“DAR ES SALAAM · KISWAHILI KWANZA”</b>"),
    ("0:28–0:30", "Wide ya mwisho — anapunga mkono mara moja, na kusema kwa utulivu",
     "<b>“TECHNOLOGY THAT SPEAKS OUR LANGUAGE.”</b> · hold frames 12 · instrumental swell inatulia · fade to black frames 6"),
]))
story.append(Paragraph("Bei ya kuanzia = toleo la tovuti (350K/550K/750K — tazama ukurasa wa Bei kwenye tovuti). Mifumo mikubwa haikatazwi kukataa — bei kamili iko kwenye /pricing.", SMALL))

print("Part 1 OK — pages so far built in memory")

# ── helpers for the prompt sections ─────────────────────────────────────────
import textwrap

def wrap_code(text, width=96):
    out = []
    for raw in text.split("\n"):
        if not raw.strip():
            out.append("")
            continue
        indent = len(raw) - len(raw.lstrip())
        out.extend(textwrap.wrap(raw, width=width,
                                 initial_indent=" " * indent,
                                 subsequent_indent=" " * indent,
                                 replace_whitespace=False,
                                 break_long_words=True,
                                 break_on_hyphens=False) or [""])
    return "\n".join(out)

def prompt_block(text):
    """Split a wrapped prompt into page-safe codeboxes (one per paragraph block)."""
    blocks = [b for b in wrap_code(text).split("\n\n")]
    for b in blocks:
        story.append(codebox(b))
        story.append(Spacer(1, 4))

CLIP1 = """Vertical 9:16 cinematic advertising shot, 10 seconds, premium Tanzanian tech-brand
aesthetic. Use the attached reference image as the EXACT presenter — same face, same
long voluminous dark wavy hair, same gold hoop earrings, thin gold necklace, black
off-shoulder top. Do not redesign her. Warm seamless brown studio backdrop, soft
directional key light from camera left, subtle film grain. Palette: cream, sand,
warm terracotta, one violet accent. No dark backgrounds, no neon.

0:00-0:02  Extreme close-up, she leans toward camera, speaks with clear moving lips:
           "Biashara yako bado inahesabu kwa daftari?" — her voice, natural Swahili.
           SFX: single paper-stamp impact.
0:02-0:04  Hard cut to macro of hands scribbling numbers in a paper ledger, pencil only,
           face never shown. Kinetic bold white sans-serif lower-third SLAMS in:
           "DAFTARI?"  SFX: whoosh.
0:04-0:06  Hard cut to a hand holding a smartphone; on screen a search bar types
           "duka la Kariakoo" and returns no results (keep this text SHORT and LARGE).
           Kinetic type slams: "HAKUNA?"  SFX: error pop.
0:06-0:08  Hard cut back to presenter, medium close-up, she shrugs one shoulder:
           "Unahitaji website." — beat — "Au application." Two quick kinetic slams:
           "WEBSITE?" then "APP?"  SFX: two impacts.
0:08-0:10  Presenter leans fully into camera, direct eye contact, conviction:
           "Si yoyote — unahitaji inayofanya kazi HAPA." End on held frame with huge
           cream serif kinetic type: "HAPA. KWETU." with a violet underline.
           SFX: whoosh into white frame cut.

Camera: 35mm lens feel, eye-level, subtle handheld float, no warping, no zoom drift.
Motion graphics style: bold, minimal, cream pills + violet accents, max 2 lines of
text on screen at any time. Audio: her voice + light SFX only, very subtle warm
drone underneath. No music yet. No logos anywhere in this clip."""

CLIP2 = """Vertical 9:16, 10 seconds, SAME presenter as before (attached reference image) — same
face, hair, gold hoops, black top, same warm brown studio with soft key light. This
clip is the PROOF — fast, confident intercuts between her and devices. Her dialogue,
natural Swahili, lips clearly moving:

0:00-0:03  Medium close-up, she holds a smartphone flat toward camera like a live demo,
           small warm smile: "Altraware Tech — tumetengeneza bidhaa halisi."
0:03-0:06  Full-frame phone: a retail tap-to-charge screen — items tapped (Chai ya Maziwa,
           Chapati Maharage), a big CHARGE button, then a large green success check
           sweeping across. KEEP UI TEXT HUGE. Mono-spaced callout slides in bottom-third:
           "Faida POS · 0.8s CHECKOUT" — second line, smaller: "100% OFFLINE".
           SFX: soft UI blips, one warm modern chime.
           She continues VO: "Faida POS: duka linafungwa — ripoti iko simu yako."
0:06-0:08  Phone tilts edge-on in her hand; a push notification slides down the screen:
           "Ripoti ya mauzo imewasili" (short text, big). She nods once, smiles:
           "Hata bila internet."
0:08-0:10  Stack cut — laptop and tablet on a desk in the same warm set, both showing
           a care-centre dashboard: pupil attendance rows with green check marks,
           amount due column, one-tap actions. Mono callout: "CARETRACK · SW / EN".
           Presenter direct to camera, last line: "Yote Kiswahili kwanza."
           Hard cut to white.

Motion graphics: mono-spaced terminal-style captions, cream + violet + teal accents.
Max 3 lines of text on screen at once. Camera: locked-off or 5% drift only; the energy
comes from CUTS, not camera moves. SFX: UI blips, one notification pop, one chime.
Audio: her voice + SFX, faint warm drone continues from clip 1. No music hit yet."""

CLIP3 = """Vertical 9:16, 10 seconds, SAME presenter, SAME warm studio and light. The CLOSE —
calm, certain energy, slower cuts than clips 1-2. Her dialogue, natural Swahili:

0:00-0:03  Medium close-up, direct eye contact, slight smile:
           "Unahitaji website, application, au mfumo wa biashara?"
0:03-0:06  Behind her (out of focus), three cream browser/phone cards fan out in 3D:
           "altra.tanzaniareach.com" · "faida-hq.vercel.app" ·
           "caretrack-six.vercel.app" — violet headers, mono type, cards drift, she
           gestures between them loosely. VO:
           "Tovuti kuanzia TSh 350,000. Piga WhatsApp leo."
0:06-0:08  End-card builds over cream: the violet ALTRAWARE cloud logo draws itself in,
           below it the domain "altra.tanzaniareach.com" types out letter by letter
           with a blinking cursor. Mono sub-line, small but legible:
           "DAR ES SALAAM · KISWAHILI KWANZA".
0:08-0:10  Final wide of presenter — she waves once, small and genuine, closes with:
           "Technology that speaks our language." Hold the end-card 12 frames.
           Instrumental swell resolves. Cut to black for 6 frames, end.

Motion graphics: cream cards, violet accents, mono + one big serif headline.
Camera: slow 4% push-in on the open, gentle pull-back on the hold — everything else
still. Audio: her voice + music swell (warm afro-house / amapiano-lite, no vocals),
resolving on the last word."""

CLIP1_G = """Vertical 9:16, 10 seconds, Altraware commercial — bright, playful, Dar es Salaam morning.
Subject: the attached reference image — the EXACT same woman, same face, same long voluminous
dark wavy hair, same gold hoop earrings, thin gold necklace, black off-shoulder top. Do not
redesign her. Action: she POPS UP from behind a market stall counter mid-sentence, a phone
in one hand and a bundle of vitenge fabric in the other; laughs; points straight at the
viewer like she caught them out; leans in mock-serious for the final line. Environment:
a bustling Kariakoo market at 8am — hand-painted enamel shop sign, stacks of colourful
vitenge and kanga, wooden crates of tomatoes and onions, rice sacks, canvas awning striping
the sunlight; people drift behind her, slightly out of focus; one bodaboda parked far back.
Warm golden morning sun, dappled shade under the awning. Camera: eye-level medium shot;
one slow push-in (dolly-in) across the 10 seconds, ending at medium close-up. Movements:
handheld micro-float only; at 0:08 a quick whip-pan cut to white. Lighting: warm golden
morning key from camera right, dappled shade fill from the awning, no blacks, no neon.
Composition: she sits slightly right-of-frame; the left third stays open for big bold text.
Mood: a savvy market friend teasing you — quick, bright, warm, never slick.

Swahili VO (clear moving lips, perfect natural Swahili): "Huu ni Kariakoo! Hapa biashara
haiogopi — lakini nina swali. Mteja akiingia Google akaandika jina lako: anakukuta, au
anakukosa? Wacha nikuonyeshe."

Motion graphics — simple, big, one language, easy to build in the editor:
- 0:02 Lower-third text pops in with a soft pop: "BIASHARA YAKO IKO WAPI?" (bold white
  letters on a violet pill, bottom-left).
- 0:04 Fast full-screen joke card: "MWENZIO YUKO GOOGLE — WEWE?!" (violet text on cream,
  stamped on with a thump).
- 0:08 On "Wacha nikuonyeshe." the frame flashes white for 0.4s — then CLIP 2.
SFX: crate knock on her pop-up · thump · whoosh. Music: afro-house sneaks in from 0:06.
Audio: silent from Flow — VO is recorded separately."""

CLIP2_G = """Vertical 9:16, 10 seconds, SAME presenter, SAME Kariakoo market — a busier corner of it.
Subject: the attached reference image again — same face, same hair, same gold hoops, same
black off-shoulder top. Action: she taps her phone like casting a spell over the counter;
a playful fan of floating icons blooms above her palm — a browser window, a WhatsApp chat
bubble, a bar chart — each popping with its own sound; a tomato vendor in the background
hands her a receipt and she stamps it "LIMESHUGHULIKIWA" on her palm-held pad, slides it
into the crate; finishes with both hands wide open, delighted. Environment: same market
stall from CLIP 1, slightly wider angle — enamel signage, crates, fabric walls behind her;
cool blue phone glow against warm sunlight. Camera: starts on her hands (detail), slowly
tilts up to her face, then locked-off medium shot with a gentle 4% push-in. Movement:
one tilt-up — no other camera move. Lighting: warm golden morning key (as CLIP 1) + cool
soft glow from the phone screen. Composition: she dead centre for the palms-open finish;
icons orbit left, text lands right. Mood: mischievous delight — "look how easily this works,
right here in Kariakoo."

Swahili VO (perfect, natural): "Website? Tunayo. Application? Tunaitengeneza. Agizo likifika
— arifa inaingia kwenye simu, M-Pesa inalipa, risiti inatoka. Teknolojia inayofanya kazi —
hapa, kwetu."

Motion graphics — big and readable, build in the editor:
- 0:01–0:04 Three sticker-icons pop in one by one over her palm (browser, WhatsApp bubble,
  bar chart) — each with a soft pop SFX.
- 0:05 Words land on the right in mono font: "AGIZO → WHATSAPP → M-PESA" (cream on violet
  strip).
- 0:07 A price counter clicks up slot-machine style: "TSh 350,000/=" with a small mono
  caption under it: "tovuti · kuanzia" — then stamps down with a thump. Hold 1s.
- 0:08 Toggle pill flicks on: "SW / EN".
- 0:09–0:10 Flash to cream; cut to CLIP 3.
SFX: pop x3 · phone chime (notification) · cash-register thump · toggle click · whoosh.
Music: beat drops in properly. Keep text to 2 lines per moment."""

CLIP3_G = """Vertical 9:16, 10 seconds, SAME presenter, SAME Kariakoo market — low sun, warm glow.
Subject: the attached reference image, centred — same face, same hair, same gold hoops,
same black off-shoulder top. Action: she half-smiles at camera and wags a finger playfully;
then opens both hands toward the viewer like a show-and-tell invitation; last beat — small
wink, small wave, satisfied nod toward the stalls behind her. Environment: same market
corner, sun lower and warmer now, awning edges lit amber, a tea vendor's enamel kettle
steaming softly far back; the market hum continues behind her. Camera: eye-level medium
close-up; ONE slow 4% dolly-in across the whole clip — no cuts until the end-card.
Lighting: golden key from camera right, raised warmer; soft rim light behind her shoulder
from the low sun; gentle bloom on highlights. Composition: she dead centre; lower third
left stays clean for the CTA card; the end-card fills frame 0:26–0:30. Mood: warm sign-off
— friend in the know, zero desperation.

Swahili VO (perfect, natural): "Basi. Unataka website? Application? Wacha tuanze leo.
Tembelea altra.tanzaniareach.com — au tuandikie WhatsApp. Sisi ni Altraware: teknolojia
inayozungumza lugha yako."

End-card (build in the editor over a cream card or the last warm frame):
- Altraware violet cloud logo draws itself in (left).
- Under it, "altra.tanzaniareach.com" types out letter-by-letter with a blinking cursor.
- Big serif headline: "ANZA LEO."
- Tagline: "Technology that speaks our language." (small, elegant)
- Tiny mono line: "DAR ES SALAAM · KISWAHILI KWANZA".
Hold 12 frames, then cut to black for 6 frames. Music resolves.
SFX: soft whoosh + warm chime on "ANZA LEO."""

WIDE_NOTE = ("YouTube/16:9: kwa kila prompt ongeza tu — “frame for 16:9, subject "
             "right-of-centre, copy block on the left third, end-card centred.” "
             "Kwa Flow, chagua aspect 16:9 kwenye settings; muundo wa kamera alio mahali yake.")

# ── §06–08 prompts ───────────────────────────────────────────────────────────
story.append(Paragraph("06 — CLIP 1 · Ma-prompt ya Flow: SWALI", H1))
story.append(Paragraph("Nakili block yote kutoka hapa kwenda kwenye sanduku la Flow. Kila block ni prompt moja ya 10s.", SMALL))
prompt_block(CLIP1)
story.append(Paragraph("07 — CLIP 2 · Ma-prompt ya Flow: MAJIBU HALISI", H1))
prompt_block(CLIP2)
story.append(Paragraph("08 — CLIP 3 · Ma-prompt ya Flow: ANZA LEO", H1))
prompt_block(CLIP3)

# ── ★ TOLEO JIPYA — GENERAL & FUN ───────────────────────────────────────────
story.append(Paragraph("★ TOLEO JIPYA — KARIAKOO · GENERAL &amp; FUN (linapendekezwa)", H1))
story.append(Paragraph(
    "Toleo jipya kabisa: hakuna CareTrack — wala bidhaa yoyote yenyewe; nguvu zote iko "
    "kwenye hisia, ucheshi na CTA moja; eneo ni <b>soko la Kariakoo</b> (asubuhi, daylight "
    "safi) badala ya studio ya terracotta; na Kiswahili cha VO na maandishi <b>kimewekwa "
    "sawa sawa</b> — grammar ya Kitanzania, si tafsiri ya Kiingereza. Direction ya "
    "kamera/mwanga/utunzi inafuata kanuni ya .agents/skills/google-flow-cinematic-prompts/SKILL.md "
    "(sentensi kamili — si /commands).", SMALL))
gen_tbl = [[Paragraph("<b>BEAT</b>", CELLW), Paragraph("<b>SEKUNDE</b>", CELLW), Paragraph("<b>HISIA</b>", CELLW)],
    [Paragraph("<b>1 — SWALI FUN</b>", CELL), Paragraph("0:00 – 0:10", CELL),
     Paragraph("Anaruka kutoka nyuma ya kibanda cha vitenge — simu mkononi — anawabisha macho watazamaji: “Mteja akiingia Google… anakukuta, au anakukosa?”", CELL)],
    [Paragraph("<b>2 — TECH INAYOFANYA KAZI</b>", CELL), Paragraph("0:10 – 0:20", CELL),
     Paragraph("Sticker icons, agizo linaingia, arifa + M-Pesa, counter ya 350K, SW/EN — ucheshi lakini ukweli: teknolojia inafanya kazi hapa Kariakoo", CELL)],
    [Paragraph("<b>3 — ANZA LEO</b>", CELL), Paragraph("0:20 – 0:30", CELL),
     Paragraph("Jua la mchana Kariakoo → finger-wag ya kirafiki → mkono waalikio → end-card: logo, domain, “ANZA LEO.”, tagline halisi", CELL)]]
t = Table(gen_tbl, colWidths=[40 * mm, 22 * mm, PAGE_W - 2 * M - 62 * mm])
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), VIOLET),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#fffdf8"), HexColor("#faf7ee")]),
    ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#e7dfcf")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(t)
story.append(Spacer(1, 6))
story.append(Paragraph("VO (rekodiwenu — Flow isindeze Kiswahili)", H2))
story.append(Paragraph("CLIP 1 — <i>“Huu ni Kariakoo! Hapa biashara haiogopi — lakini nina swali. Mteja akiingia Google akaandika jina lako: anakukuta, au anakukosa? Wacha nikuonyeshe.”</i><br/>"
                       "CLIP 2 — <i>“Website? Tunayo. Application? Tunaitengeneza. Agizo likifika — arifa inaingia kwenye simu, M-Pesa inalipa, risiti inatoka. Teknolojia inayofanya kazi — hapa, kwetu.”</i><br/>"
                       "CLIP 3 — <i>“Basi. Unataka website? Application? Wacha tuanze leo. Tembelea altra.tanzaniareach.com — au tuandikie WhatsApp. Sisi ni Altraware: teknolojia inayozungumza lugha yako.”</i>", BODY))
story.append(Paragraph("CLIP 1 — BIASHARA HAIOGOPI (Kariakoo, 0:00–0:10)", H2))
prompt_block(CLIP1_G)
story.append(Paragraph("CLIP 2 — AGIZO, SMS, M-PESA (Kariakoo, 0:10–0:20)", H2))
prompt_block(CLIP2_G)
story.append(Paragraph("CLIP 3 — ANZA LEO (Kariakoo, 0:20–0:30)", H2))
prompt_block(CLIP3_G)
story.append(Paragraph("Toleo la bidhaa (Faida + CareTrack) lipo §03–§08. Chagua moja — kanuni zote za sauti, editor, UFAME na uzinduzi zinasalia kama zilivyo.", SMALL))

story.append(Paragraph(WIDE_NOTE, SMALL))

# ── §09 Flow config ─────────────────────────────────────────────────────────
story.append(Paragraph("09 — Weka Flow kwa usahihi", H1))
tbl = [
    hrow("Reference image", "Upload <b>image-30.png</b> (736×1104) kama ingredient/reference kwa CLIP zote tatu — uso, nywele, hoops, vazi"),
    hrow("Aspect ratio", "<b>9:16</b> (Reels/TikTok/Shorts). Kwa YouTube, generate upya CLIP 1–3 kwa 16:9 kwa kutumia WIDE_NOTE"),
    hrow("Modeli / urefu", "Veo (latest) · <b>10 sekunde</b> · generate tofauti CLIP 1 → 2 → 3"),
    hrow("Iterations", "CLIP 1 na CLIP 3 mara nyingi huhitaji 2–4 regenerate — uso au maandishi yakipotoka, rerun. Usikubali kwanza"),
    hrow("Audio", "Chagua “no audio”/strip sauti. Flow haisakati Kiswahili vizuri — VO yako (§12) ndiyo inayosikiwa mwisho"),
    hrow("Muundo", "Cuts ngumu kwa CLIP 1–2, pole pole CLIP 3 · kamera haina drift · maandishi ≤ 2–3 mistari kwa wakati"),
]
t = Table(tbl, colWidths=[34 * mm, PAGE_W - 2 * M - 34 * mm])
t.setStyle(TableStyle([
    ("ROWBACKGROUNDS", (0, 0), (-1, -1), [HexColor("#fffdf8"), HexColor("#faf7ee")]),
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, HexColor("#eee7d8")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 6.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 6.5),
]))
story.append(t)

# ── §10 screen-record demos ─────────────────────────────────────────────────
story.append(Paragraph("10 — Picha halisi: kurekodi Faida &amp; CareTrack", H1))
story.append(Paragraph("Flow itazifanya — lakini maandishi madogo yote ya UI yatapotoka. “Real examples hadi websites” hufanyika hivi: unarekodi demos zenu halisi na kuziweka kwenye CLIP 2.", BODY))
for title, steps in [
    ("Faida POS — https://faida-hq.vercel.app/", [
        "Fungua tovuti kwenye browser ya simu au desktop (Chrome, mode ya simu recommended).",
        "Tap bidhaa 2–3: Chai ya Maziwa (TSh 1,500), Chapati Maharage (TSh 3,000), Pilau Nyama (TSh 5,000).",
        "Bonyeza CHARGE — ona ✓ ya kijani / receipt #FD-… inajengwa.",
        "Record kwa sekunde ~15–20 (screen recorder ya simu au OBS), 30 fps.",
        "Crop/pad kwenda 9:16 kwenye editor; au weka kwenye mockup ya simu (Frames X / mockup png).",
    ]),
    ("CareTrack — https://caretrack-six.vercel.app/dashboard", [
        "Fungua dashboard (demo data ya malezi/shuleni inaonekana).",
        "Tap attendance ya mtoto mmoja — ✓ moja tosha.",
        "Onesha SMS toast ya mzazi ikitokea (au mock ya toast kwa editor).",
        "Record sekunde ~10–15; screenshot ya “ADA” / receipts pia inaruhusiwa kama b-roll still ya 0.5s.",
    ]),
]:
    story.append(Paragraph(title, H2))
    for i, st_txt in enumerate(steps, 1):
        story.append(Paragraph(f"<font color='#5b3fb5'><b>{i}.</b></font>  {st_txt}", BODY))
story.append(Paragraph("Kumbuka: demo ya malipo ni simulation (<i>“STK push simulation · No real charge”</i> imeandikwa kwenye demo yenyewe). Tambua hivyo kwenye endcap au captions — usidai kwamba “malipo halisi yamepitia tangazo”.", SMALL))

# ── §11 site reference pics ─────────────────────────────────────────────────
story.append(Paragraph("11 — Picha za kurejea kutoka tovuti", H1))
story.append(Paragraph("Hizi ni URLs halisi kutoka altra.tanzaniareach.com na Cloudinary CDN yake — zipakue wewe mwenyewe (sihotlink kwenye tangazo) au uniletee, nitaziweka ndani ya PDF ijayo.", BODY))
tbl = [[Paragraph("<b>PICHA</b>", CELLW), Paragraph("<b>URL</b>", CELLW), Paragraph("<b>MATUMIZI</b>", CELLW)]]
refs = [
    ("Logo ya Altraware", "https://altra.tanzaniareach.com/logo.png", "End-card + watermark ndogo"),
    ("Faida POS showcase", "https://altra.tanzaniareach.com/faidahq.png", "Reference ya UI kwenye Flow / mockup"),
    ("Homepage hero (DSM)", "https://altra.tanzaniareach.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Foc8018um%2Fimage%2Fupload%2Fv1791538425%2F68a10efadb9f7044fba3a3e10d587f89.jpg&w=1600&q=80", "Uhakika wa DSM hook shot"),
    ("Jamii ya wafanyabiashara", "https://res.cloudinary.com/oc8018um/image/upload/v1791638315/a390bcf6072c113af9e46d0a69cefa7d.jpg", "B-roll halisi wa duka"),
    ("Neema (duka, Kariakoo)", "https://res.cloudinary.com/oc8018um/image/upload/v1791538374/b7c4862eb39d306e152686f8e0bad15a.jpg", "Ikiwa unataka jaribio la testimonial still"),
    ("Be the Website They Remember", "https://res.cloudinary.com/oc8018um/image/upload/v1791639444/Be_the_Website_They_Remember.png", "Mchoro wa kampeni — poster"),
    ("App screen — mfano", "https://res.cloudinary.com/oc8018um/image/upload/v1791639306/Screenshot_2026-10-01_160124.png", "Reference ya UI kwa Flow"),
]
for a, b, c3 in refs:
    url = b.replace("&", "&amp;")
    tbl.append([Paragraph(f"<b>{a}</b>", CELL), Paragraph(f"<font face='DVMono' size='5.4'>{url}</font>", CELL), Paragraph(c3, CELL)])
t = Table(tbl, colWidths=[40 * mm, 92 * mm, PAGE_W - 2 * M - 132 * mm], repeatRows=1)
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), VIOLET),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#fffdf8"), HexColor("#faf7ee")]),
    ("GRID", (0, 0), (-1, -1), 0.4, HexColor("#e7dfcf")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
story.append(t)
story.append(Paragraph("Ukizituma links hizi kwenye chat au kwenye folda ya Drive, nitazijenga upya PDF ukiwa na picha ndani yake — pamoja na mfano wa end-card uliyosasishwa.", SMALL))

# ── §12 audio ───────────────────────────────────────────────────────────────
story.append(Paragraph("12 — Sauti (audio)", H1))
tbl = [
    hrow("VO", "Rekodi wewe au mwigizaji wenu — ~2.8–3 neno/sekunde, tone ya utulivu na uhakika. Mistari yote iko kwenye §03–05. Flow iondolewe kuongea (§09)"),
    hrow("Muziki", "Afro-house / amapiano-lite instrumental, <b>-18 dB</b> chini ya VO, swell tu kwenye Beat 3 — hakuna vocals"),
    hrow("SFX", "Stamp · whoosh · error pop · impact ×2 · UI blips · notification pop · chime ya kisasa · whoosh ya mwisho"),
    hrow("Loudness", "-14 LUFS integrated (IG/TikTok standard), ceiling -1.5 dBTP"),
    hrow("Captions", "Kiswahili burned-in kwa kila neno — Instagram/TikTok wengi wakiwa silent. Style: Inter/DejaVuSans-Bold, cream pill, violet underline"),
]
t = Table(tbl, colWidths=[26 * mm, PAGE_W - 2 * M - 26 * mm])
t.setStyle(TableStyle([
    ("ROWBACKGROUNDS", (0, 0), (-1, -1), [HexColor("#fffdf8"), HexColor("#faf7ee")]),
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, HexColor("#eee7d8")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 6.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 6.5),
]))
story.append(t)

# ── §13 editor ──────────────────────────────────────────────────────────────
story.append(Paragraph("13 — Muunganisho kwenye editor", H1))
steps = [
    "Import CLIP 1 → 2 → 3 (kwa mpangilio) — cuts ngumu zote zinabaki jinsi zilivyotoka Flow.",
    "Weka screen-recordings (§10) kwenye CLIP 2 — kwenye mockup ya simu/laptop, au full-screen gorofa kwa 0.5–1.5s kwa kila onyesho.",
    "Andika upya maandishi yote makubwa (captions za kinetic zilizotajwa §03–05) kwa font ya editor — kuhakikisha hakuna gibberish.",
    "End-card ya mwisho: logo halisi (altra.tanzaniareach.com/logo.png) + domain typeout + tagline.",
    "Subtitles za Kiswahili burned-in (§12).",
    "Export 9:16: 1080×1920, H.264, 30 fps, 8–12 Mbps, -14 LUFS. Toleo la 16:9: 1920×1080.",
    "Weka Spot-check kwenye simu — kila mstari wa caption uonekane kwenye skrini ya 6-inch.",
]
for i, t_txt in enumerate(steps, 1):
    story.append(Paragraph(f"<font color='#5b3fb5'><b>{i}.</b></font>  {t_txt}", BODY))
story.append(Paragraph("16:9 kwa YouTube: Flow 16:9 upya (§09) OR mazao ya 9:16 yakiwekwa kwenye canvas ya 1920×1080 na copy block ukiwekwa upande wa kushoto — §11 picha za DSM zinasaidia kujaza upande wa pili.", SMALL))

# ── §14 UFAME ───────────────────────────────────────────────────────────────
story.append(Paragraph("14 — UFAME (uongozi): claim zote zifanane na tovuti", H1))
story.append(Paragraph("RUHUSIWA (kutoka altra.tanzaniareach.com, Nov 2026)", H2))
ok = [
    "Faida POS — 100% offline · 0.8s wastani wa checkout · ripoti SMS mwisho wa siku · M-Pesa/Tigo Pesa/Cash · SW/EN · tap-to-charge",
    "CareTrack — mahudhurio ya tap moja + SMS kwa mzazi · ada kwa M-Pesa + risiti otomatiki · inakaa 2G · SW/EN",
    "Kiswahili kwanza · DSM · DSM timu · 24/7 WhatsApp support · “Technology that speaks our language”",
    "Tovuti kuanzia <b>TSh 350,000</b> (ticker: 350K / 550K / 750K — thibitisha /pricing siku ya uzinduzi)",
    "Demo URLs: faida-hq.vercel.app · caretrack-six.vercel.app/dashboard · altra.tanzaniareach.com",
    "Neema quote — ni ya tovuti yenu; unaweza kumnukuu kwa uhuru (“Duka langu …”)",
]
for o in ok:
    story.append(Paragraph(f"<font color='#2fa87a'><b>OK</b></font>  {o}", BODY))
story.append(Paragraph("MARUFUKU", H2))
no = [
    "Kusema Altraware imetengeneza M-Pesa — ni ya Vodacom. Sema: <b>“tunatoa malipo ya M-Pesa kwenye mfumo wako.”</b>",
    "Bei bila kuhakiki /pricing siku ya launch",
    "“Wateja 5000+” na hesabu yoyote bila chanzo",
    "Namba ya simu au WhatsApp ya kubuni — elekeza tu <b>altra.tanzaniareach.com</b> (kuna WhatsApp button pale)",
    "Kudai “malipo halisi yamepitia tangazo” — demo ya STK push ni simulation",
    "Picha za kushikilia biashara hiyo hiyo — Neema ni ya tovuti; mtu mwingine yeyote ni uongo",
]
for n in no:
    story.append(Paragraph(f"<font color='#e8735a'><b>X</b></font>  {n}", BODY))

# ── §15 launch checklist ────────────────────────────────────────────────────
story.append(Paragraph("15 — Orodha ya kuanzisha (Flow → live)", H1))
launch = [
    "Pakua image-30.png + (kwa hiari) picha za §10–11 kwenye folda moja.",
    "Google Flow → mradi mpya → upload reference (§09).",
    "Klip 1 → generate → angalia uso &amp; maneno → rerun hadi uonekane nayo (2–4 × kawaida).",
    "Klip 2 → generate (screen recordings zitaingia kwenye editor baadaye).",
    "Klip 3 → generate; end-card ikisumbua, rerun — maandishi madogo ndiyo sehemu dhaifu.",
    "Editor: zunganisha 1→2→3, screen recordings, maandishi upya, subtitles, VO, muziki, end-card, logo.",
    "Spot-check kwenye simu (screen ya 6″) — kila caption ionekane wazi.",
    "Export 9:16 (na 16:9) → ongeza kwenye IG/TikTok/Shorts + YouTube → Drive → shiriki na timu kwa link ya public view.",
]
for i, t_txt in enumerate(launch, 1):
    story.append(Paragraph(f"<font color='#5b3fb5'><b>{i}.</b></font>  {t_txt}", BODY))

# ── back page ────────────────────────────────────────────────────────────────
story.append(Spacer(1, 40))
story.append(Paragraph("“Technology that speaks<br/>our language.”",
    st("tag", fontName="DVSerifB", fontSize=30, leading=38, textColor=VIOLET, alignment=TA_CENTER, spaceAfter=14)))
story.append(Paragraph("Unahitaji website, mfumo, au application?<br/>",
    st("cta", fontName="DVSB", fontSize=13, leading=19, textColor=INK, alignment=TA_CENTER, spaceAfter=4)))
story.append(Paragraph("altra.tanzaniareach.com — kwenye kila ukurasa kuna WhatsApp.",
    st("cta2", fontSize=10, alignment=TA_CENTER, textColor=SLATE, spaceAfter=26)))
story.append(HRFlowable(width="30%", thickness=2, color=VIOLET, hAlign="CENTER"))
story.append(Spacer(1, 18))
story.append(Paragraph("ALTRAWARE TECHNOLOGY · DAR ES SALAAM · KISWAHILI KWANZA",
    st("foot", fontName="DVMonoB", fontSize=8, textColor=SLATE, alignment=TA_CENTER)))
story.append(Paragraph("Tangazo “Website au Application?” — production doc · Novemba 2026 · Matumizi ya kampeni ya ndani",
    st("foot2", fontSize=7, textColor=SLATE, alignment=TA_CENTER)))

doc.build(story)
print("wrote", OUT)
