#!/usr/bin/env python3
"""
TECH BILA HYPE — Noellyne's free PDF.

A lead magnet for the "comment 'PDF' and I'll send it" post. The promise in the
pack is "Apps · AI · Tools — bila hype", so the document is exactly that:
twelve tools, each one real, each one free or free to start, in plain Swahili.

Honesty rules baked into the copy:
  · every tool named here actually exists and its free tier is real
  · no invented prices; where a product is only free in a limited way, say so
  · no USSD codes or phone shortcuts quoted from memory
  · a closing page that says prices and apps change — check official sites

Pages are rendered at 150 dpi and wrapped into one PDF with title metadata.
"""
import json
import math
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = Path(__file__).resolve().parent
ASSETS = Path(__file__).resolve().parents[3] / "noellyne-host" / "assets"
OUT = HERE / "tech-bila-hype.pdf"

W, H = 1240, 1754   # A4 @150dpi

PAPER = "#fbf7ef"; CREAM = "#f7f1e6"; INK = "#1d2a33"; SLATE = "#5b6b76"
VIOLET = "#5b3fb5"; LILAC = "#b9a6f2"; MINT = "#2fa87a"; MINT_SOFT = "#dff0e6"
SAND = "#f4e3c4"; CORAL = "#e8735a"; GOLD = "#c98a1f"; CARD = "#ffffff"

SANS = ASSETS / "inter-latin-wght-normal.ttf"
SERIF = ASSETS / "fraunces-latin-opsz-normal.ttf"
SERIF_IT = ASSETS / "fraunces-latin-opsz-italic.ttf"
MONO = ASSETS / "jetbrains-mono-latin-wght-normal.ttf"

def f_sans(sz, weight=700):
    f = ImageFont.truetype(str(SANS), sz)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f

def f_serif(sz, italic=False):
    return ImageFont.truetype(str(SERIF_IT if italic else SERIF), sz)

def f_mono(sz):
    return ImageFont.truetype(str(MONO), sz)

def rr(d, x, y, w, h, r, fill=None, outline=None, width=1):
    d.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=fill, outline=outline, width=width)

def wrap(d, text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=font) <= max_w or not cur:
            cur = t
        else:
            lines.append(cur); cur = wd
    if cur:
        lines.append(cur)
    return lines

def para(d, text, x, y, font, max_w, fill, leading, track=0):
    for line in wrap(d, text, font, max_w):
        if track:
            cx = x
            for ch in line:
                d.text((cx, y), ch, font=font, fill=fill)
                cx += d.textlength(ch, font=font) + track
        else:
            d.text((x, y), line, font=font, fill=fill)
        y += leading
    return y

def base_page(tag_left, tag_right, page_no, total):
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im, "RGBA")
    # header
    d.rectangle([0, 0, W, 6], fill=VIOLET)
    d.text((72, 40), "TECH BILA HYPE", font=f_mono(22), fill=SLATE)
    d.text((W-72, 40), f"{tag_right}", font=f_mono(22), fill=SLATE, anchor="ra")
    d.line([(72, 76), (W-72, 76)], fill=(29, 42, 51, 38), width=2)
    # footer
    d.line([(72, H-74), (W-72, H-74)], fill=(29, 42, 51, 38), width=2)
    d.text((72, H-54), "NOELLYNE · ALTRAWARE", font=f_mono(19), fill=SLATE)
    d.text((W//2, H-54), "TECH BILA HYPE", font=f_mono(19), fill=SLATE, anchor="mm")
    d.text((W-72, H-54), f"{page_no:02d} / {total:02d}", font=f_mono(19), fill=VIOLET, anchor="ra")
    return im, d

def chip(d, x, y, text, fill, textcol):
    f = f_mono(19)
    tw = d.textlength(text, font=f)
    rr(d, x, y, tw + 34, 34, 17, fill=fill)
    d.text((x + 17, y + 17), text, font=f, fill=textcol, anchor="lm")
    return tw + 34

def cover():
    im = Image.new("RGB", (W, H), CREAM)
    # daylight pool behind her — an actual radial gradient, so no edge can show
    grad = Image.radial_gradient("L").resize((W * 2, H))          # 256-px gradient, scaled
    grad = grad.crop((W // 2, 0, W + W // 2, H))                  # centre it
    # radial_gradient is 0 at centre / 255 at edge; invert so centre is bright
    grad = grad.point(lambda v: 255 - v)
    pool = Image.composite(Image.new("RGB", (W, H), (255, 253, 247)), im, grad)
    im = pool
    d = ImageDraw.Draw(im, "RGBA")
    # deco papers, corners
    for (px, py, ang, seed) in [(-46, 54, -9, 3), (W-150, 66, 8, 7)]:
        pg = Image.new("RGBA", (230, 172), (0, 0, 0, 0))
        gd = ImageDraw.Draw(pg)
        gd.rounded_rectangle([4, 4, 226, 168], radius=8, fill="#fffdf8", outline=(29, 42, 51, 30), width=2)
        for i in range(4):
            gd.line([(30, 52 + i*26), (200 - (seed*13+i*29) % 70, 52 + i*26)], fill=(91, 63, 181, 90), width=5)
        pg = pg.rotate(ang, resample=Image.BICUBIC, expand=True)
        im.paste(pg, (px, py), pg)
    # header
    mark = Image.open(ASSETS / "altraware.png").convert("RGBA")
    mh = 58
    mw = int(mark.width * mh / mark.height)
    im.paste(mark.resize((mw, mh), Image.LANCZOS), (72, 150), mark.resize((mw, mh), Image.LANCZOS))
    d.text((72 + mw + 22, 150 + mh//2), "ALTRAWARE", font=f_sans(30, 800), fill=INK, anchor="lm")
    d.text((W-72, 150 + mh//2), "PDF — BURE", font=f_mono(22), fill=VIOLET, anchor="rm")
    # eyebrow + title
    d.line([(72, 320), (72, 560)], fill=VIOLET, width=8)
    d.text((104, 322), "GUIDE YA BURE", font=f_mono(26), fill=SLATE)
    # one fitted size for both lines, so they read as one headline
    sz = 176
    while sz > 40:
        f_head = f_serif(sz)
        if d.textlength("BILA HYPE.", font=f_head) <= W - 190:
            break
        sz -= 4
    d.text((100, 386), "TECH", font=f_head, fill=INK)
    d.text((96, 386 + sz + 10), "BILA HYPE.", font=f_head, fill=INK)
    d.text((104, 830), "Zana 12 — Apps · AI · Tools —", font=f_sans(42, 600), fill=SLATE)
    d.text((104, 884), "kwa Mtanzania anayetaka kuanza leo.", font=f_sans(42, 600), fill=SLATE)
    d.text((104, 968), "bila maneno ya kigeni · bila bei ya siri · bila hype",
           font=f_mono(20), fill=GOLD)
    # her, seated at the bottom, presenting
    her = Image.open("production/noellyne-host/assets/hold-base.png").convert("RGBA")
    hw = 660
    hh = int(her.height * hw / her.width)
    hx = W - hw + 40
    hy = H - hh + 6
    im.paste(her.resize((hw, hh), Image.LANCZOS), (hx, hy), her.resize((hw, hh), Image.LANCZOS))
    # desk strip so the crop is physical
    d.rectangle([0, H-118, W, H], fill="#eee2cd")
    d.rectangle([0, H-118, W, H-110], fill=(255, 255, 255, 140))
    d.text((72, H-74), "NOELLYNE · TECH HOST", font=f_mono(22), fill=SLATE)
    d.text((W-72, H-74), "@noellyne", font=f_mono(22), fill=VIOLET, anchor="ra")
    return im

TOC = [
    ("01", "ChatGPT na Claude", "AI"),
    ("02", "Google Search na Lens", "SEARCH"),
    ("03", "YouTube, kama darasa", "VIDEO"),
    ("04", "Canva", "DESIGN"),
    ("05", "Notion", "APPS"),
    ("06", "Google Drive", "APPS"),
    ("07", "CapCut na Audacity", "TOOLS"),
    ("08", "WhatsApp Business", "BIASHARA"),
    ("09", "Google Password Manager", "SALAMA"),
    ("10", "M-Pesa na pesa ya simu", "BIASHARA"),
    ("11", "GitHub", "TOOLS"),
    ("12", "VS Code", "TOOLS"),
]

def toc_page(page_no, total):
    im, d = base_page("", "YALIYOMO", page_no, total)
    y = 132
    d.text((72, y), "Yaliyomo", font=f_serif(92), fill=INK); y += 118
    d.text((72, y), "Ukurasa moja kwa kila zana. Kila moja ni halisi, na kila moja inaanza bure.",
           font=f_sans(27, 500), fill=SLATE); y += 64
    col_x = [72, W//2 + 20]
    col_y = [y, y]
    for i, (num, name, tag) in enumerate(TOC):
        ci = i % 2
        x = col_x[ci]
        yy = col_y[ci]
        rr(d, x, yy, W//2 - 96, 128, 16, fill=CARD, outline=(29,42,51,28), width=2)
        d.text((x + 26, yy + 30), num, font=f_serif(46), fill=VIOLET)
        d.text((x + 96, yy + 22), name, font=f_sans(24, 700), fill=INK)
        chip(d, x + 96, yy + 66, tag, MINT_SOFT, MINT)
        col_y[ci] += 152
    return im

TOOLS = [
    dict(num="01", name="ChatGPT na Claude", tag="AI",
         what="Wasaidizi wa AI wa kuandika na kufikiri. Unaandika unachotaka kwa lugha ya kawaida, wanakujibu: barua pepe, ufupisho, mawazo, code, hata maelezo ya kikao.",
         why="Ni zana moja inayoweza kurudisha masaa yako. Inafanya kazi kwenye simu na laptop, na toleo la bure linatosha kuanza.",
         start="Ndika: 'Andika upya barua pepe hii iwe fupi na ya heshima' — na ubandike barua unayotaka.",
         tip="Mpe jukumu, muktadha, na matokeo unayoyataka. Mifano miwili ni bora kuliko maelezo marefu.",
         mfano="Wewe: 'Nipange budget ya mwezi ya 500,000 kwa kodi, chakula, usafiri na akiba.' Jibu: jedwali la mgawanyo — 250k kodi, 120k chakula, 60k usafiri, 70k akiba — ukitaka nibadilishe, nataka tu."
     ),
    dict(num="02", name="Google Search na Lens", tag="SEARCH",
         what="Search ni kitabu cha rejea cha ulimwengu. Lens ni kamera inayosoma: piga picha ya neno lolote — kwa mfano kwenye bango au kitabu — nayo itakutafutia maana au link.",
         why="Wengi hutumia Google kwa neno moja la siri. Kwa kuyajua maneno machache ya search, unapata jibu la kwanza badala ya kuchimba ukurasa 10.",
         start="Tafuta: site:wikipedia.org 'jina la kitu' — kupata ufafanuzi bila blogu za kujielekeza.",
         tip="Search kwa Kiingereza, na ungani na Kiswahili ukiona majibu machache sana.",
         mfano="Bangiekwenye bango: 'SATURDAY MARKET, Sinza, kuanzia SAA 12'. Piga picha na Lens — maana, eneo, na ratiba — kabla ya kuuliza mtu."
     ),
    dict(num="03", name="YouTube, kama darasa", tag="VIDEO",
         what="YouTube ni chaneli ya kujifunza, si burudani peke yake. Kila somo ambalo shule haiwezi kukupa limelipakiwa bure, kwa Kiingereza na Kiswahili.",
         why="Saa 5 za video za mada moja ni sawa na kozi fupi. Ni njia ya haraka ya kujifunza zana, lugha, na biashara.",
         start="Tafuta 'how to budget a salary 2026', chagua video chini ya dakika 10, uitazame hadi mwisho.",
         tip="Tumia filter 'Under 4 minutes' upate majibu ya haraka bila kutumia muda mwingi.",
         mfano="Lengo: kujifunza budget kwenye Excel. Tafuta 'excel personal budget beginner' — video za kwanza 3, chagua ya dakika 4, fuata kila hatua kisha pause."
     ),
    dict(num="04", name="Canva", tag="DESIGN",
         what="Canva ni programu ya kubuni inayofanya kazi kwenye browser au simu. Poster, ofa ya biashara, slides, kadi ya matangazo — ukichagua muundo na kubadilisha maandishi.",
         why="Huna haja ya fundi ili uonekana kitaaluma. Biashara ndogo yenye poster nzuri huuzwa zaidi.",
         start="Fungua Canva, chagua 'Instagram Post', andika maneno matatu ya biashara yako, export PNG.",
         tip="Font 2 tu na rangi 3 — kupita hapo ndiko kunakoua muundo.",
         mfano="Ofa: 'Cut + Blow Dry — 20,000 TZS, leo tu.' Template 'Sale announcement', font 2 tu, rangi 3 tu — PNG tayari kwa WhatsApp Status."
     ),
    dict(num="05", name="Notion", tag="APPS",
         what="Notion ni daftari la dijitali linalochanganya notes, kalenda, orodha, na database ndogo. Unaweza kuanza na ukurasa mmoja kwa siku yako.",
         why="Kila sehemu ya kichwa chako iliyohifadhiwa ni mzigo uliokatika. Notion ni ubongo wa pili wa mpangilio wa kazi au masomo.",
         start="Unda ukurasa 'Leo 18 Nov' — andika mambo 3 muhimu, na uweke alama ukiyamaliza.",
         tip="Anza na ukurasa mmoja. Kuweka database kabla hujaujua matumizi yako ni kosa la kawaida.",
         mfano="Ukurasa 'KAZI' wenye sehemu tatu: LEO (mambo 3), YATAKUJA (deadlines), MAWAZO (ideas). Dakika 5 asubuhi, dakika 2 jioni."
     ),
    dict(num="06", name="Google Drive", tag="APPS",
         what="Faili zako kwenye wingu la Google. Akaunti ya bure inakupa nafasi kubwa ya kuhifadhi photos, video, na kazi — na kuifungua kutoka simu yoyote.",
         why="Simu ya kupoteza si kazi iliyopotea. Hii ndiyo sababu ya kwanza ya kuwa nayo, kabla ya usalama au ushirikiano.",
         start="Fungua Drive, unda folda 'KAZI', upakie faili 5 muhimu kutoka simu yako.",
         tip="Shiriki folder na family badala ya kupeleka faili moja moja kwa WhatsApp.",
         mfano="Simu imepotea jioni. Folda 'KAZI' kwenye Drive — faili zote zinapatikana kwenye laptop ya rafiki yako dakika 5 baadaye."
     ),
    dict(num="07", name="CapCut na Audacity", tag="TOOLS",
         what="CapCut ni mhariri wa video bure kwenye simu. Audacity ni mhariri wa sauti bure kwenye kompyuta. Yote mawili yanaondoa sehemu usizotaka na kutia captions.",
         why="Video ya dakika 1 yenye captions inauzwa vizuri kuliko video ya dakika 5 bila captions.",
         start="Kwenye CapCut: kata sekunde 10 za kelele mwanzoni, ongeza caption, export.",
         tip="Captions si mapambo — ni njia ya kutazama bila modemo, na zinaruhusu lugha yako.",
         mfano="Video ya sekunde 40: kata mapya ya kimya mwanzoni, caption 'SKIZA HII', muziki -20 dB, export 1080p. Tayari kwa Reels."
     ),
    dict(num="08", name="WhatsApp Business", tag="BIASHARA",
         what="WhatsApp Business ni toleo la biashara: ujumbe wa mapokezi, majibu ya haraka (quick replies), katalogi ya bidhaa, na takwimu. Ni bure.",
         why="Karibu kila mteja wa Tanzania ana WhatsApp. Biashara inayojibu haraka na kuonyesha katalogi inaonekana kama duka, si mtu binafsi.",
         start="Weka quick reply: 'Asante! Tutarudi ndani ya saa 1.' — aujitayarishe kupunguza simu.",
         tip="Picha za katalogi zikiwa na bei na maelezo, maswali hayapungui — majibu hufika kabla ya kuulizwa.",
         mfano="Mteja: 'Bei ngapi?' → 'Karibuni! Begi 25,000 · viatu 30,000. Oda hapa 👇' — kazi ya dakika 1, mauzo ya siku nzima."
     ),
    dict(num="09", name="Google Password Manager", tag="SALAMA",
         what="Mfumo unaohifadhi nywila zako zote salama, na kukupa nywila ndefu kwa kila tovuti. Umejumuishwa ndani ya Chrome na Google account yako.",
         why="Nywila moja kwa tovuti zote ni mlango mmoja kwa majambazi. Password manager ni tofauti kati ya 'akaunti yako imedhulumiwa' na hakuna.",
         start="Kwenye Chrome: Settings → Passwords — ona nywila zilizovujwa, ubadilishe 3 leo.",
         tip="Nywila 10+ za nasibu, tofauti kwa kila tovuti. Usiikumbuke — ilindwe.",
         mfano="Inabainika email yako imevujwa. fungua haveibeenpwned.com — Password Manager inakwama nywila zilizovujwa zinabadilishwa kwa dakika 10."
     ),
    dict(num="10", name="M-Pesa na pesa ya simu", tag="BIASHARA",
         what="Pesa ya simu ni huduma ya kusafa pesa, kulipia bili na kununua — bila kwenda benki. Vodacom M-Pesa, Tigo PESA, Airtel Money — zote zinafanya kazi kwa msingi mmoja.",
         why="Biashara isiyokubali malipo ya simu inapoteza nusu ya wateja. Estate za malipo (paybill/QR) zinakupa risiti moja kwa moja.",
         start="Washa risiti za mfumo kwenye simu yako, ukiona atokani na mnunuzi — wewe ni fundi.",
         tip="Fuata kampeni za kampeni za mfumo? Hapana — angalia tu ada za miamala yako, ndizo zinazoliwa.",
         mfano="Duka: namba ya malipo (paybill) yenye jina lako — risiti kuja kiotomatiki kwa kila mteja, bila wewe kujibu 'ujumbe mmoja'."
     ),
    dict(num="11", name="GitHub", tag="TOOLS",
         what="GitHub ni mahali pa kuhifadhi kazi zako (hasa code) na history yake. Kila badiliko linarekodiwa: unarudi toleo la jana, au mwaka jana.",
         why="Kazi bila history ni kazi iliyojificha. Kwa developers ni CV; kwa biashara ni kumbukumbu ya mradi.",
         start="Unda akaunti, tengeneza repo 'my-first', pakia faili moja — umeifanya, hata kama ni txt.",
         tip="README nini unachoamini ndani — ni uso wa mradi wako, si maelezo ya nyongeza.",
         mfano="Hariri faili la totals: commit 'fix: totals', push — makosa ya jana yanarudiwa kwa klik moja."
     ),
    dict(num="12", name="VS Code", tag="TOOLS",
         what="VS Code ni mhariri wa code bure, mdogo, na wenye extensions nyingi. Inafaa hata kama hujui programu — inaonyesha makosa na kukusaidia kuyaelewa.",
         why="Ni chaguo la kwanza duniani, kwa sababu inaanza rahisi na kukua nawe. Extensions (Copilot, Prettier) zinazidisha nguvu.",
         start="Pakua VS Code, fungua folda yoyote ya kazi, sakinisha 'Markdown All in One' ukiona unapanga maandishi.",
         tip="Keyboard shortcuts: Ctrl+P (fungua faili), Ctrl+Shift+P (amri zote). Jifunze hizo mbili tu kwanza.",
         mfano="Kuandika red squiggle: VS Code inakwama makosa yako, inapendekeza marekebisho — usiposte code yenye makosa."
     ),
]

def tool_page(t, page_no, total):
    im, d = base_page("", "ZANA " + t["num"], page_no, total)
    y = 150
    d.text((72, y), t["num"], font=f_serif(150), fill=LILAC)
    d.text((286, y + 24), t["name"], font=f_serif(62), fill=INK)
    chip(d, 286, y + 106, t["tag"], VIOLET, "#ffffff")
    y += 200
    d.line([(72, y), (W-72, y)], fill=(29,42,51,38), width=2)
    y += 40
    sections = [("Ni nini", t["what"], VIOLET), ("Kwa nini uijali", t["why"], GOLD), ("Anza leo", t["start"], MINT)]
    for label, body, accent in sections:
        d.text((72, y), label.upper(), font=f_mono(23), fill=accent)
        y += 44
        y = para(d, body, 72, y, f_sans(29, 500), W - 144, INK, 44) + 30
    # mfano — a concrete worked example, the most useful line on the page
    d.text((72, y), "MFANO", font=f_mono(23), fill=CORAL)
    y += 40
    y = para(d, t["mfano"], 72, y, f_sans(27, 500), W - 144, INK, 40) + 26
    # tip box
    rr(d, 72, y + 4, W - 144, 148, 16, fill=SAND)
    d.text((100, y + 26), "BILA HYPE TIP", font=f_mono(20), fill=GOLD)
    para(d, t["tip"], 100, y + 60, f_sans(26, 500), W - 200, INK, 37)
    y = y + 4 + 148 + 44
    # worksheet strip, right after the tip box
    rr(d, 72, y, W - 144, 140, 16, fill="#eef7f0", outline=(47, 168, 122, 60), width=2)
    d.text((100, y + 24), "UMEFANYA HATUA HII?", font=f_mono(21), fill=MINT)
    boxes = ["Nimeifungua", "Nimefanya 'Anza leo'", "Nimemshirikisha mtu 1"]
    bx = 100
    for b in boxes:
        d.rectangle([bx, y + 76, bx + 28, y + 104], outline=MINT, width=3)
        d.text((bx + 40, y + 90), b, font=f_sans(23, 500), fill=INK, anchor="lm")
        bx += int(d.textlength(b, font=f_sans(23, 500))) + 92
    # progress dots — twelve tools, where you are
    cur = int(t["num"])
    dots_y = H - 158
    d.text((72, dots_y), f"ZANA {cur:02d} / 12", font=f_mono(18), fill=SLATE)
    r = 8; gap = 30
    total_w = 11 * gap + r * 2
    dx = W - 72 - total_w
    for i in range(1, 13):
        cx = dx + (i - 1) * gap + r
        if i == cur:
            d.ellipse([cx - r, dots_y - r, cx + r, dots_y + r], fill=VIOLET)
        else:
            d.ellipse([cx - r, dots_y - r, cx + r, dots_y + r], outline=LILAC, width=2)
    return im

def closing(page_no, total):
    im, d = base_page("", "MWISHO", page_no, total)
    y = 150
    d.text((72, y), "Mwisho.", font=f_serif(120), fill=INK)
    y += 148
    y = para(d, "Hii sio mwisho — ni mlango. Kila zana hapa ni bure kuanza, na kila moja inasubiri uishikilie leo.",
              72, y, f_sans(30, 500), 660, SLATE, 44)
    y += 44
    rr(d, 72, y, 660, 196, 18, fill=CARD, outline=(29,42,51,28), width=2)
    d.text((100, y + 30), "FUATA NOELLYNE", font=f_mono(20), fill=VIOLET)
    d.text((100, y + 74), "IG & YouTube — @noellyne", font=f_sans(32, 800), fill=INK)
    d.text((100, y + 128), "Kila siku: Apps · AI · Tools — bila hype.", font=f_sans(22, 500), fill=SLATE)
    y += 226
    rr(d, 72, y, 660, 210, 18, fill=MINT_SOFT)
    d.text((100, y + 28), "JINSI YA KUPATA GUIDE YA IJUMUIYA", font=f_mono(18), fill=MINT)
    para(d, "Comment 'PDF' kwenye post hiyo — tutakutumia toleo linalofuata, na list mpya kila mwezi.",
         100, y + 60, f_sans(23, 500), 600, INK, 34)
    y += 240
    para(d, "Bei, mipaka ya bure, na vipengele hubadilika. Kabla ya kulipia chochote, angalia tovuti rasmi ya zana husika. Guide hii ina malengo ya kukufungua njia, si kukuhukumi matumizi.",
         72, y, f_sans(19, 400), 660, SLATE, 28)
    # her on the right, presenting back into the guide
    her = Image.open("production/noellyne-host/assets/present-base.png").convert("RGBA")
    hw = 560
    hh = int(her.height * hw / her.width)
    hx = W - hw + 30
    hy = H - hh - 108
    im.paste(her.resize((hw, hh), Image.LANCZOS), (hx, hy), her.resize((hw, hh), Image.LANCZOS))
    # brand strip at the bottom, so the page closes like the cover opened it
    d.rectangle([0, H - 118, W, H], fill="#eee2cd")
    d.rectangle([0, H - 118, W, H - 110], fill=(255, 255, 255, 140))
    d.text((72, H - 66), "TECH BILA HYPE — NOELLYNE · ALTRAWARE · NOVEMBA 2026",
           font=f_mono(19), fill=SLATE)
    d.text((W - 72, H - 66), "@noellyne", font=f_mono(19), fill=VIOLET, anchor="ra")
    return im

def main():
    total = 1 + 1 + 12 + 1
    pages = [cover(), toc_page(2, total)] + [tool_page(t, 3 + i, total) for i, t in enumerate(TOOLS)] + [closing(total, total)]
    pages[0].save(OUT, "PDF", save_all=True, append_images=pages[1:],
                  title="Tech Bila Hype — Zana 12 za Tech kwa Mtanzania",
                  author="Noellyne · Altraware", subject="Apps, AI, Tools — bila hype")
    print(f"wrote {OUT} ({len(pages)} pages, {OUT.stat().st_size/1024:.0f} KB)")

if __name__ == "__main__":
    main()
