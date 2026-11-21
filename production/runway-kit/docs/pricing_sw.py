"""Track 3 · BEI → Bei-Sample-Sura-1.pdf (Kiswahili)

A free sample chapter of the TSh 9,000 pricing worksheet planned for week 3. Every page is
marked SAMPLE and the purchase link is explicitly not live — nothing here pretends to be a
revenue result.
"""
from reportlab.platypus import NextPageTemplate, PageBreak, Spacer

from kit import (COL_W, TRACK3, body, bullets, callout, checkbox_row, cover_block, h1, h2,
                 kicker, panel, rule, source_line, table, write_lines)

P = TRACK3
TITLE = "Bei · sura ya mfano"
FILENAME = "Bei-Sample-Sura-1.pdf"
KEYWORD = "BEI"


def build() -> list:
    story: list = [NextPageTemplate("inner")]

    story += cover_block(
        P,
        brand="Mwijay Tools · bei na kazi",
        title="Bei si namba. Ni uamuzi wa mara moja, ulioandikwa.",
        standfirst=("Hii ni sura ya kwanza ya kit cha bei: jinsi ya kupanga bei ya kazi moja, "
                    "kuandika kile kinachojumuishwa, na kuongeza bei bila kupoteza mteja."),
        meta=[
            ("Hii ni nini", "Sura ya mfano (sample) ya kit cha bei cha TSh 9,000"),
            ("Inashughulikia", "Gharama, muda, hatari, na sentensi ya kuongeza bei"),
            ("Hali ya kununua", "Kiungo cha malipo hakijawashwa bado — hakuna cha kulipa leo"),
            ("Lugha", "Kiswahili · mifano ni ya kubuni, imeandikwa wazi"),
        ],
        chip_text="SAMPLE · BURE · HAKUNA MALIPO",
        note=("Mifano yote ya namba hapa ni ya kubuni kwa mazoezi, na imeandikwa hivyo. "
              "Hakuna madai ya mapato, hakuna mteja halisi, na hakuna bei ya soko inayodaiwa."),
    )
    story.append(PageBreak())

    # ---------------------------------------------------------------- page 2
    story += [
        kicker("Sura 1 · sehemu 1", P),
        h1("Bei tatu zinaingia kwenye namba moja.", P),
        body("Ukisema &ldquo;TSh 300,000&rdquo; bila kuhesabu, unatarajia mteja asijadili. Kila bei "
             "inayojadiliwa ina sehemu tatu ambazo zinapaswa kuonekana kabla ya kusema namba.", P, "body"),
        Spacer(1, 8),
        table(
            ["Sehemu", "Swali", "Mfano (wa kubuni)"],
            [
                ["Gharama", "Nini kinatumika bila kurudi? (usafiri, data, print, mtu wa nje)", "TSh 45,000"],
                ["Muda", "Saa ngapi kwa kazi hii, kwa uzoefu wako?", "Saa 14"],
                ["Hatari", "Nini kitatokea kama mteja abadilisha mawazo mara mbili?", "Marekebisho 2 ya bure"],
            ],
            P,
            widths=[COL_W * 0.18, COL_W * 0.5, COL_W * 0.32],
        ),
        Spacer(1, 10),
        callout("Kanuni", "Bei = gharama + (saa × kiwango chako) + kiasi cha hatari. Ukikosa moja, "
                          "ile nyingine inagharimu.", P),
        Spacer(1, 10),
        h2("Kwa nini hatari inahesabiwa", P),
        body("Kazi yenye marekebisho yasiyokuwa na kikomo inaweza kuwa kazi mbili kwa bei ya moja. "
             "Ukiandika &ldquo;marekebisho 2&rdquo; kabla ya kuanza, hiyo sio ukorofi — ni mkataba "
             "mdogo unaookoa uhusiano.", P, "small"),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 3
    story += [
        kicker("Sura 1 · sehemu 2", P),
        h1("Andika kile kinachojumuishwa, kwa sentensi tatu.", P),
        body("Mteja hakubishani na bei. Anabishana na kile asichokijua. Sentensi tatu hizi "
             "zinamaliza mabishano kabla ya kuanza.", P, "body"),
        Spacer(1, 8),
        panel([
            body("1 · Kazi", P, "h3"),
            body("&ldquo;Nitatengeneza kurasa 6 za proposal, kwa Kiswahili, kwa muundo mmoja.&rdquo;", P, "small"),
            Spacer(1, 6),
            body("2 · Muda", P, "h3"),
            body("&ldquo;Siku 5 za kazi kuanzia tarehe ya malipo ya kwanza; siku 7 kama mabadiliko yanakuja baadaye.&rdquo;", P, "small"),
            Spacer(1, 6),
            body("3 · Mipaka", P, "h3"),
            body("&ldquo;Marekebisho 2 ya bure; ya tatu inalipiwa TSh 40,000. Picha na maandishi yanatoka kwako.&rdquo;", P, "small"),
        ], P, pad=12),
        Spacer(1, 12),
        h2("Sentensi ya kuongeza bei", P),
        body("Ongeza bei kwa kazi mpya, sio kwa kazi iliyoanza. Sentensi: &ldquo;Kuanzia tarehe 1 "
             "Desemba, bei ya huduma hii ni TSh X. Kazi zilizoanza kabla ya tarehe hiyo zinabaki "
             "kwenye bei ya awali.&rdquo; Tarehe ndio inayofanya sentensi iwe ya kweli.", P, "small"),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 4
    story += [
        kicker("Sura 1 · jedwali", P),
        h1("Hesabu ya kazi moja.", P),
        body("Chagua kazi moja unayoifanya mara kwa mara. Jaza namba zako — sio za mfano hapo juu.", P,
             "body"),
        Spacer(1, 6),
    ]
    for label, detail, hint in [
        ("Jina la kazi", "Kazi unayoifanya mara kwa mara", "Mf. proposal ya kurasa 6"),
        ("Gharama za moja kwa moja", "Usafiri, data, print, mtu wa nje", "TSh"),
        ("Saa za kazi", "Kwa uzoefu wako, sio kwa matumaini", "Saa"),
        ("Kiwango cha saa", "Kile unachotaka kulipwa kwa saa", "TSh / saa"),
        ("Marekebisho ya bure", "Ngapi kabla ya kulipia", "0 / 1 / 2"),
        ("Bei ya jumla", "Gharama + (saa × kiwango) + hatari", "TSh"),
        ("Tarehe ya bei hii", "Bei inabadilika; tarehe inabaki", "DD / MM"),
    ]:
        story.append(checkbox_row(label, detail, P, hint))
        story.append(Spacer(1, 1))
    story += [
        Spacer(1, 8),
        h2("Sentensi yako ya kwanza", P),
        body("Andika sentensi moja utakayotumia kueleza bei hii kwa mteja. Kama haisomeki kwa "
             "sekunde 10, mteja hataisoma.", P, "bodytight"),
        write_lines(2, P, height=15),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 5
    story += [
        kicker("Kinachofuata", P),
        h2("Kit kamili (bado hakijauzwa)", P),
        body("Sura hii ni moja ya tano. Kit kamili kina vitu vitano; hakuna kati yao kinachohitaji "
             "zana ya kulipia.", P, "body"),
        Spacer(1, 6),
        table(
            ["Sura", "Kinachomo", "Hali"],
            [
                ["1", "Gharama, muda na hatari kwenye bei moja", "Tayari (hii)"],
                ["2", "Jedwali la kazi 5 unazoifanya mara kwa mara", "Inaandikwa"],
                ["3", "Barua fupi ya kuongeza bei kwa tarehe", "Inaandikwa"],
                ["4", "Mipaka: marekebisho, muda, na malipo", "Inaandikwa"],
                ["5", "Ukaguzi wa mwezi: kazi gani iligharimu", "Inaandikwa"],
            ],
            P,
            widths=[COL_W * 0.12, COL_W * 0.56, COL_W * 0.32],
        ),
        Spacer(1, 12),
        callout("Kuhusu kuuza", "Kiungo cha malipo (TSh 9,000) hakijawashwa. Nitawapa wasomaji wa "
                                "kwanza sura hii bure na kuuliza kile kinachokosekana kabla ya kuweka "
                                "bei. Kama unataka kuwa mmoja wao, andika BEI.", P),
        Spacer(1, 14),
        rule(P),
        Spacer(1, 8),
        body("<font name='MonoBold'>Hii ni sura ya mfano, sio bidhaa iliyouzwa.</font> Hakuna mteja "
             "halisi, hakuna mapato, na namba zote ni za kubuni.", P, "small"),
        source_line("Mwandishi: Mwijay Davie, 21 Nov 2026. Namba zote za mfano ni za kubuni. "
                    "Hakuna madai ya mapato, wateja, au bei za soko.", P),
    ]
    return story
