"""Track 3 · KIT → Kipimo-cha-App-5-Tests.pdf (Kiswahili)

Five tests someone can run on any app before paying for it. The tests are the product;
no app is ranked, and there is no affiliate link inside the file.
"""
from reportlab.platypus import NextPageTemplate, PageBreak, Spacer

from kit import (COL_W, TRACK3, body, bullets, callout, checkbox_row, cover_block, h1, h2,
                 kicker, numbered_steps, panel, rule, source_line, table, write_lines)

P = TRACK3
TITLE = "Kipimo cha app tano"
FILENAME = "Kipimo-cha-App-5-Tests.pdf"
KEYWORD = "KIT"


def build() -> list:
    story: list = [NextPageTemplate("inner")]

    # ---------------------------------------------------------------- cover
    story += cover_block(
        P,
        brand="Mwijay Tools · ulinganisho wa Kiswahili",
        title="Kabla ya kulipia app yoyote, pima vitu vitano.",
        standfirst=("Video za matangazo zinaonyesha features. Hazikuambii app inafungua kwa sekunde ngapi, "
                    "au notes zako zinafungukaje nje ya app. Hii ni checklist ya tests tano nilizotumia "
                    "kupima app za notes."),
        meta=[
            ("Kwa nani", "Mtu anayelipia app ya kazi kwa mara ya kwanza, au anayebadilisha app"),
            ("Unachopata", "Tests 5, jinsi ya kuzipima, na jedwali la kujaza"),
            ("Muda", "Dakika 20 kwa app moja. Hakuna usajili, hakuna malipo."),
            ("Lugha", "Kiswahili · maneno ya kiufundi yameachwa kama yalivyo"),
        ],
        chip_text="BURE · HAKUNA USAJILI",
        toc=[("02", "Kwa nini tests hizi tano"), ("03", "Jinsi ya kupima kila test"),
             ("04", "Jedwali la kujaza kwa app yako"), ("05", "Checklist ya mwezi wa kwanza")],
        note=("Sijapanga app yoyote kwenye faili hili, na hakuna link ya affiliate. Kipimo ni chako; "
              "namba zako zitatofautiana na zangu kwa sababu simu na mtandao ni tofauti."),
    )
    story.append(PageBreak())

    # ---------------------------------------------------------------- page 2
    story += [
        kicker("Kwa nini hizi tano", P),
        h1("Features zinafanana. Muda na njia ya kutoka ndio tofauti.", P),
        body("App nyingi za notes zina folders, tags, search na sync. Tofauti iko kwenye fungua haraka, "
             "hifadhi bila mtandao, na pakua notes zako ukitoka.", P, "body"),
        Spacer(1, 6),
        table(
            ["Test", "Kinachopimwa", "Kwa nini"],
            [
                ["01 · Cold start", "Sekunde hadi note ya kwanza ifunguke", "Sekunde 8 × mara 20 kwa siku = dakika 4"],
                ["02 · Offline save", "Kuandika na kuhifadhi bila mtandao", "Note isipotee mtandao ukianguka"],
                ["03 · Export", "Kupakua notes zote nje ya app", "Bila export, notes si zako"],
                ["04 · Search", "Kupata note ya zamani kwa neno moja", "Notes 300 ni archive, si memory"],
                ["05 · Restore", "Kurudisha backup kwenye simu nyingine", "Simu ikipotea, backup ni rekodi"],
            ],
            P,
            widths=[COL_W * 0.28, COL_W * 0.36, COL_W * 0.36],
        ),
        Spacer(1, 12),
        callout("Kanuni", "Test moja inayoshindikana ni sababu ya kutosubiri. Test tatu ni ishara ya "
                          "kutafuta app nyingine.", P),
        Spacer(1, 12),
        h2("Kabla ya kuanza", P),
    ]
    story += bullets([
        "Tumia simu yako ya kila siku, sio simu ya duka.",
        "Weka notes 5 za mfano (mf. &ldquo;bei ya mchele&rdquo;).",
        "Airplane mode kwa test 02 na 05.",
        "Andika namba: &ldquo;sekunde 3&rdquo; ni kipimo, &ldquo;haraka&rdquo; ni maoni.",
    ], P, size=8.6)
    story.append(PageBreak())

    # ---------------------------------------------------------------- page 3
    story += [
        kicker("Tests 5", P),
        h1("Jinsi ya kupima kila test.", P),
        Spacer(1, 4),
        numbered_steps([
            ("01", "Cold start",
             "Funga app kabisa (ondoa kwenye recent apps). Fungua, hesabu sekunde hadi note ya mwisho "
             "ionekane. Rudia mara 3, tumia wastani. Weka simu kwenye hali ileile kila mara."),
            ("02", "Offline save",
             "Airplane mode. Andika note mpya ya sentensi 3. Funga app. Fungua tena. Kama note ipo, "
             "imehifadhiwa. Kama inasema &ldquo;saving&rdquo; milele, hiyo ni jibu."),
            ("03", "Export",
             "Tafuta export/download kwenye settings. Pakua notes zote. Fungua faili kwenye kompyuta au "
             "app nyingine. Kama huwezi kufungua bila app ileile, export yako ni mateka."),
            ("04", "Search",
             "Tafuta neno lililopo kwenye note ya tatu. Hesabu sekunde hadi ionekane, na angalia kama "
             "search inatafuta ndani ya maandishi au majina ya notes pekee."),
            ("05", "Restore",
             "Weka backup kwenye simu ya pili au ufute app kisha uirudishe. Weka backup ileile. "
             "Hesabu muda na angalia kama notes zote zimerudi, sio nusu."),
        ], P),
        Spacer(1, 10),
        panel([
            body("Tahadhari moja", P, "bodytight"),
            Spacer(1, 3),
            body("Usifute app yenye notes halisi kwa test 05. Tumia notes za mfano, au simu ya pili. "
                 "Backup ambayo haijajaribiwa ni matumaini, si rekodi.", P, "small"),
        ], P),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 4
    story += [
        kicker("Jedwali la kujaza", P),
        h1("App unayofikiria kununua leo.", P),
        body("Andika jina la app na namba ulizopima. Ukimaliza, linganisha na app unayotumia sasa — "
             "si kwa hisia, kwa namba.", P, "body"),
        Spacer(1, 8),
        checkbox_row("Jina la app na toleo", "Toleo na tarehe uliyopima", P, "App / version"),
        checkbox_row("Cold start", "Sekunde hadi note ya kwanza (wastani wa mara 3)", P, "___ s"),
        checkbox_row("Offline save", "Imehifadhiwa bila mtandao?", P, "Ndiyo / Hapana"),
        checkbox_row("Export", "Faili gani, na inafungukaje nje ya app?", P, "Format"),
        checkbox_row("Search", "Sekunde hadi note ya zamani, na inatafuta ndani ya maandishi?", P, "___ s"),
        checkbox_row("Restore", "Backup imejaribiwa kwenye simu nyingine?", P, "Ndiyo / Hapana"),
        checkbox_row("Bei", "Bei ya mwezi au mwaka, kwa tarehe ya leo", P, "TSh / mwezi"),
        Spacer(1, 8),
        h2("Uamuzi", P),
        body("App inashinda ikiwa inashinda tests 4 kati ya 5, na test 03 (export) ni lazima iwe ndiyo. "
             "Export inayokosekana ni sababu ya kutosha kuacha, hata kama app ni nzuri.", P, "bodytight"),
        Spacer(1, 6),
        write_lines(3, P, height=16),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 5
    story += [
        kicker("Baada ya kununua", P),
        h1("Checklist ya mwezi wa kwanza.", P),
        body("App mpya ina muda wa &ldquo;honeymoon&rdquo; wa wiki mbili. Vitu hivi vinaamua kama utaendelea "
             "kulipia au utarudi kwenye ile ya zamani.", P, "lead"),
        Spacer(1, 4),
        table(
            ["Wiki", "Kazi moja", "Ishara ya kwenda vizuri"],
            [
                ["1", "Hamisha notes 20 za mwanzo", "Umehamisha bila kuandika upya"],
                ["2", "Tumia app pekee, bila backup ya zamani", "Hukuhitaji app ya zamani siku 3 mfululizo"],
                ["3", "Jaribu export tena", "Faili linafunguka nje ya app, bila kupoteza format"],
                ["4", "Pima tena cold start na search", "Namba ni ileile au bora; app haijazidi kuwa nzito"],
            ],
            P,
            widths=[COL_W * 0.1, COL_W * 0.46, COL_W * 0.44],
        ),
        Spacer(1, 10),
        callout("Uamuzi wa mwezi", "Kama hukufungua app mara 3 kwa wiki ya nne, usilipie mwaka. "
                                   "Lipia mwezi mmoja, au rudi kwenye bure.", P),
        Spacer(1, 14),
        rule(P),
        Spacer(1, 8),
        body(f"<font name='MonoBold'>Andika {KEYWORD}</font> kwenye Reel kupata faili hili tena. "
             "Hakuna kitu cha kununua mwishoni.", P, "small"),
        source_line("Tests na maelezo: Mwijay Davie, 21 Nov 2026. App yoyote iliyotajwa kwenye Reel "
                    "ilipimwa kwenye simu moja; hakuna ranking ya soko, hakuna affiliate.", P),
    ]
    return story
