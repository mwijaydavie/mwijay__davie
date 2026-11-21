"""Track 3 · TOOLKIT → Toolkit-ya-Freelancer.pdf (Kiswahili)

Seven free tools, one job each, plus what each one does NOT do. No affiliate links, no
prices quoted (they change), and the paid version is clearly marked as not existing yet.
"""
from reportlab.platypus import NextPageTemplate, PageBreak, Spacer

from kit import (COL_W, TRACK3, body, bullets, callout, checkbox_row, cover_block, h1, h2,
                 kicker, rule, source_line, table, write_lines)

P = TRACK3
TITLE = "Toolkit ya freelancer"
FILENAME = "Toolkit-ya-Freelancer.pdf"
KEYWORD = "TOOLKIT"


def build() -> list:
    story: list = [NextPageTemplate("inner")]

    story += cover_block(
        P,
        brand="Mwijay Tools · zana za kazi",
        title="Zana saba za bure. Kazi moja kila moja.",
        standfirst=("Si orodha ya apps 40. Ni zana saba ambazo zinatosha kuanza kazi ya freelancer "
                    "leo: ofisi, nyaraka, ankara, muda, mawasiliano, hifadhi na cheti cha malipo."),
        meta=[
            ("Kwa nani", "Freelancer anayeanza, au anayelipia zana nyingi bila sababu"),
            ("Unachopata", "Zana 7, kazi moja kila moja, na kile ambacho hazifanyi"),
            ("Muda", "Dakika 30 kuziweka zote; hakuna malipo, hakuna usajili wa lazima"),
            ("Lugha", "Kiswahili · maneno ya kiufundi hayajatafsiriwa"),
        ],
        chip_text="BURE · HAKUNA LINK YA AFFILIATE",
        toc=[("02", "Kanuni tatu za kuchagua zana"), ("03", "Zana 1–4 · ofisi na nyaraka"),
             ("04", "Zana 5–7 · pesa na hifadhi"), ("05", "Jedwali lako la kujaza")],
        note=("Hakuna bei kwenye faili hili kwa sababu bei za zana hubadilika kila mwezi — angalia "
              "tovuti yao kwa tarehe ya leo. Toleo la kulipia la toolkit hili halijatolewa bado; "
              "hakuna kiungo cha kununua hapa."),
    )
    story.append(PageBreak())

    # ---------------------------------------------------------------- page 2
    story += [
        kicker("Kanuni", P),
        h1("Zana nyingi si uzalishaji mkubwa. Mara nyingi ni kisingizio.", P),
        body("Kila zana unayoongeza ina gharama: usajili, faili nyingine, na mahali pengine pa "
             "kutafuta kitu. Kanuni hizi tatu zinanizuia kuongeza zana bila sababu.", P, "body"),
        Spacer(1, 8),
    ]
    story += bullets([
        "<b>Zana moja, kazi moja.</b> Kama zana inafanya vitu saba, itatumika kwa kitu kimoja tu — "
        "kile kilicho rahisi zaidi.",
        "<b>Faili lako linapaswa kutoka nje.</b> Kama huwezi kupakua kazi yako (export), hiyo si zana "
        "yako; ni mahali unakopesha kazi yako.",
        "<b>Bure kwanza, lipa kwa kipimo.</b> Lipa zana inayokuokoa muda unaoweza kupima (dakika kwa "
        "wiki), sio zana inayoonekana vizuri kwenye simu.",
    ], P, size=8.8)
    story += [
        Spacer(1, 10),
        callout("Kipimo cha wiki moja", "Andika dakika unazotumia kwenye kazi moja kabla ya kuongeza zana. "
                                        "Baada ya wiki mbili, pima tena. Kama hakuna tofauti, ondoa zana.",
                P),
        Spacer(1, 10),
        h2("Kabla ya kuanza", P),
        body("Tafuta neno moja la siri unalotumia kwenye kazi zako zote (mf. jina la biashara yako). "
             "Kila faili unalohifadhi linapaswa kuwa na neno hilo. Hivyo utapata kila kitu kwa "
             "utafutaji mmoja, hata kama umehifadhi mahali tofauti.", P, "small"),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 3
    story += [
        kicker("Zana 1–4", P),
        h1("Ofisi, nyaraka, ankara, muda.", P),
        body("Zana nne za kuanza kazi bila kununua kitu. Kila moja ina kasoro iliyoelezwa — soma "
             "kabla ya kuitegemea.", P, "body"),
        Spacer(1, 6),
        table(
            ["Zana", "Kazi moja", "Haifanyi"],
            [
                ["① Hifadhi ya wingu", "Faili za kazi zote mahali pamoja", "Haitumiki kama backup pekee — nakala ya nje inahitajika"],
                ["② Nyaraka", "Barua, proposal, CV kutoka template moja", "Haiwezi kufuatilia nani alifungua faili"],
                ["③ Ankara", "Namba ya ankara inayofuatana, bila kurudia", "Haikusanyi malipo wala kukumbusha mteja"],
                ["④ Muda", "Kupima saa za kazi kwa mradi", "Haiamui bei; wewe ndio unayeamua"],
            ],
            P,
            widths=[COL_W * 0.24, COL_W * 0.36, COL_W * 0.4],
        ),
        Spacer(1, 12),
        h2("Jinsi ya kuziweka leo", P),
    ]
    story += bullets([
        "Fungua folda moja: <font name='Mono'>kazi/2026/</font> ndani ya hifadhi. Kila mteja ana folda yake.",
        "Weka template moja ya nyaraka; usianze na faili tupu kila mara.",
        "Anza namba ya ankara kwa <font name='Mono'>2026-001</font> na usiirudie.",
        "Weka timer kabla ya kuanza kazi, sio baada ya kumaliza.",
    ], P, size=8.6)
    story += [
        Spacer(1, 8),
        body("<font name='MonoBold'>Kanuni ya folda:</font> jina la faili lina tarehe, mteja, na kile "
             "kilichomo — <font name='Mono'>2026-11-21_mteja-aina_proposal.pdf</font>. Faili yenye jina "
             "&ldquo;final2&rdquo; haitapatikana baada ya mwezi mmoja.", P, "small"),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 4
    story += [
        kicker("Zana 5–7", P),
        h1("Mawasiliano, hifadhi, na cheti cha malipo.", P),
        body("Hizi tatu ndizo zinazokuzuia kupoteza mteja au pesa. Ni boring, na ndizo muhimu zaidi.", P,
             "body"),
        Spacer(1, 6),
        table(
            ["Zana", "Kazi moja", "Haifanyi"],
            [
                ["⑤ Mawasiliano", "Namba moja ya kazi, tofauti na namba ya familia", "Haikusanyi mazungumzo ya WhatsApp ya zamani"],
                ["⑥ Hifadhi (backup)", "Nakala ya pili ya faili, sio ileile", "Haiokoi kitu kama haijajaribiwa kurestore"],
                ["⑦ Cheti cha malipo", "Risiti inayofanana kila mara, yenye tarehe", "Haithibitishi pesa imeingia; M-Pesa ndio rekodi"],
            ],
            P,
            widths=[COL_W * 0.24, COL_W * 0.36, COL_W * 0.4],
        ),
        Spacer(1, 12),
        callout("Risiti ni marketing", "Mteja anayepata risiti safi ya namba na tarehe anarudi. "
                                       "Risiti ya picha ya screen haimpi kitu cha kuhifadhi.", P),
        Spacer(1, 10),
        h2("Mfululizo wa kazi (kila wiki)", P),
    ]
    story += bullets([
        "Jumatatu: fungua folda ya mteja mpya, weka namba ya ankara.",
        "Kila siku: timer kwa kazi inayolipwa; kazi za bure zina muda wake.",
        "Ijumaa: hamisha faili kwenye hifadhi ya pili; angalia moja inafunguka.",
        "Mwisho wa mwezi: pakua ankara zote na risiti kwenye folda moja ya mwaka.",
    ], P, size=8.6)
    story.append(PageBreak())

    # ---------------------------------------------------------------- page 5
    story += [
        kicker("Jedwali lako", P),
        h1("Andika zana unazotumia sasa.", P),
        body("Sio zana unazotaka. Zile unazotumia, na kile kinachokosekana. Ukimaliza, ondoa zana moja "
             "isiyofanya kazi yoyote kwenye jedwali hili.", P, "body"),
        Spacer(1, 8),
    ]
    for label, detail, hint in [
        ("Hifadhi ya faili", "Faili za kazi zinaishi wapi? Nani mwingine anaweza kuzifungua?", "Jina / mwezi"),
        ("Nyaraka", "Template moja ipo wapi? Ilifanywa lini?", "Template"),
        ("Ankara", "Namba ya mwisho uliyotumia, na tarehe", "2026-___"),
        ("Muda", "Unapimaje saa za kazi? Kwa mkono au zana?", "Zana"),
        ("Mawasiliano", "Namba moja ya kazi, na nani anaisoma", "Namba"),
        ("Backup", "Backup ya mwisho ilijaribiwa lini kurestore?", "Tarehe"),
        ("Risiti", "Risiti inatumwa vipi? Kwa picha au PDF?", "Njia"),
    ]:
        story.append(checkbox_row(label, detail, P, hint))
        story.append(Spacer(1, 1))
    story += [
        Spacer(1, 6),
        h2("Zana moja ya kuondoa", P),
        body("Chagua zana moja unayolipia ambayo haipo kwenye orodha ya kazi zako. Ifute wiki hii, "
             "na andika kile kilichovunjika.", P, "bodytight"),
        write_lines(2, P, height=15),
        Spacer(1, 12),
        rule(P),
        Spacer(1, 8),
        body(f"<font name='MonoBold'>Andika {KEYWORD}</font> kwenye Reel kupata faili hili tena. "
             "Hakuna kiungo cha kununua ndani yake.", P, "small"),
        source_line("Orodha na kanuni: Mwijay Davie, 21 Nov 2026. Hakuna bei iliyotajwa (hubadilika), "
                    "hakuna affiliate, na hakuna madai ya mapato.", P),
    ]
    return story
