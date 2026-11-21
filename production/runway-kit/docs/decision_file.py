"""Track 2 · FILE → The-Decision-File-Sources.pdf

A source dossier for episodes 01–03. It does not retell the stories; it records what can
be defended, what is disputed, and where to check. Written so a viewer can audit the
Reels instead of trusting them.
"""
from reportlab.platypus import NextPageTemplate, PageBreak, Paragraph, Spacer

from kit import (COL_W, TRACK2, body, bullets, callout, cover_block, h1, h2, kicker, panel,
                 rule, source_line, table)

P = TRACK2
TITLE = "The Decision File · sources 01–03"
FILENAME = "The-Decision-File-Sources.pdf"
KEYWORD = "FILE"


def episode(num: str, title: str, claim: str, timeline: list[list[str]], differ: str,
            sources: list[list[str]], story: list) -> None:
    from reportlab.lib.styles import ParagraphStyle
    from kit import styles
    st = styles(P)
    story += [
        kicker(f"Episode {num} · source dossier", P),
        Paragraph(title, ParagraphStyle("eph", fontName="Display", fontSize=23, leading=23.6,
                                        textColor=P.c("ink"), tracking=-0.7)),
        Spacer(1, 7),
        panel([Paragraph(claim, ParagraphStyle("cl", fontName="BodyMed", fontSize=8.6, leading=12.2,
                                               textColor=P.c("ink")))], P, bar="accent", pad=9),
        Spacer(1, 8),
        Paragraph("TIMELINE", ParagraphStyle("t", parent=st["monosmall"], textColor=P.c("accent"))),
        Spacer(1, 3),
        table(["When", "What happened", "Status"], timeline, P,
              widths=[COL_W * 0.15, COL_W * 0.57, COL_W * 0.28], size=7.6, pad=3.6),
        Spacer(1, 8),
        panel([
            Paragraph("WHERE THE ACCOUNTS DIFFER", ParagraphStyle("d", fontName="MonoBold", fontSize=6.8,
                                                                  leading=9, textColor=P.c("muted"))),
            Spacer(1, 2),
            Paragraph(differ, ParagraphStyle("dd", fontName="Body", fontSize=7.9, leading=11.1,
                                             textColor=P.c("soft"))),
        ], P, bg="panel", pad=9),
        Spacer(1, 8),
        Paragraph("SOURCES", ParagraphStyle("s", parent=st["monosmall"], textColor=P.c("accent"))),
        Spacer(1, 3),
        table(["Source", "Use it for", "Type"], sources, P,
              widths=[COL_W * 0.42, COL_W * 0.38, COL_W * 0.2], size=7.4, pad=3.4, zebra=False),
        source_line("Full URLs on page 6.", P),
        PageBreak(),
    ]


def build() -> list:
    story: list = [NextPageTemplate("inner")]

    # ---------------------------------------------------------------- cover
    story += cover_block(
        P,
        brand="The Decision File · business stories",
        title="What I can defend, and what I cannot.",
        standfirst=("Episodes 01–03, with the primary and secondary sources behind each one, the "
                    "sentences I will not say, and the dates those limits were checked."),
        meta=[
            ("Covers", "Ep 01 Blockbuster/Netflix · Ep 02 Kodak · Ep 03 Nokia/Microsoft"),
            ("How to use it", "Read the claim line before you quote an episode"),
            ("Checked", "21 November 2026 — links and figures re-checked by hand"),
            ("Standard", "Named outlet + date, or the claim is labelled reported"),
        ],
        chip_text="FREE · SOURCES · NO AFFILIATE LINKS",
        toc=[("02", "The standard this file uses"), ("03", "Ep 01 · the $50M offer"),
             ("04", "Ep 02 · the camera Kodak built"), ("05", "Ep 03 · the €5.44bn exit"),
             ("06", "All links, and how to correct me")],
        note=("I am not a participant in any of these stories. Everything below is published "
              "reporting or company disclosure. Where two accounts conflict, both are shown."),
    )
    story.append(PageBreak())

    # ---------------------------------------------------------------- page 2
    story += [
        kicker("How to read this", P),
        h2("Three labels, used on screen and in every caption", P),
        table(
            ["Label", "Means", "Example from these episodes"],
            [
                ["Confirmed", "Two independent sources, or the company itself, agree", "The Microsoft–Nokia price and closing date"],
                ["Reported", "One credible outlet or a participant's account; others may disagree", "The 2000 Netflix offer price"],
                ["Disputed", "Named participants contradict each other", "Whether the Blockbuster talks were serious"],
            ],
            P,
            widths=[COL_W * 0.22, COL_W * 0.42, COL_W * 0.36],
        ),
        Spacer(1, 12),
        h2("The four rules I hold myself to", P),
    ]
    story += bullets([
        "<b>No number without a date.</b> A price, a headcount or a valuation changes; the month it was "
        "published travels with it.",
        "<b>Quote people, not vibes.</b> If a CEO is reported to have laughed, the episode says who reported it.",
        "<b>Say what a figure is not.</b> A market cap is not a company's health; a writedown is not a cash loss.",
        "<b>Correction beats confidence.</b> If a viewer posts a better source, the episode is re-cut and this "
        "file is updated with the date.",
    ], P, size=8.8)
    story += [
        Spacer(1, 10),
        callout("Why this exists", "A Reel can say almost anything in 45 seconds. This page is what makes the "
                                   "difference between a story and a claim.", P, fill="highlight"),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 3 · Ep 01
    episode(
        "01",
        "They offered Netflix for $50 million. The answer was no.",
        "In 2000, Netflix's co-founders offered to sell the company to Blockbuster for $50 million. "
        "Blockbuster did not buy it. Blockbuster's then-CEO disputes that the talks were serious.",
        [
            ["1985", "Blockbuster founded; grows into the dominant US video rental chain", "Confirmed"],
            ["2000", "Netflix, unprofitable, approaches Blockbuster with a $50M offer", "Reported"],
            ["2010", "Blockbuster files for bankruptcy protection", "Confirmed"],
            ["2011", "Dish Network buys the Blockbuster brand at auction", "Confirmed"],
        ],
        "Reed Hastings and Marc Randolph both describe the $50M offer in their books and interviews. "
        "John Antioco, Blockbuster's CEO at the time, says he was not in the meeting and that no serious "
        "talks took place. The episode says both, and does not claim to know what was in the room.",
        [
            ["Newsweek fact check, 11 Mar 2021", "Both sides of the offer claim", "Secondary"],
            ["Hastings, 'No Rules Rules' (2020); Randolph, 'That Will Never Work' (2019)", "The offer, from the sellers", "Participant"],
            ["Antioco statement, reported 2021", "The denial", "Participant"],
        ],
        story,
    )

    # ---------------------------------------------------------------- page 4 · Ep 02
    episode(
        "02",
        "Kodak built the first digital camera. Then it stayed quiet.",
        "In December 1975, Kodak engineer Steven Sasson built a working digital camera prototype: "
        "0.01 megapixels, about 23 seconds per image, recorded to cassette tape. Kodak did not turn it "
        "into a consumer product.",
        [
            ["Dec 1975", "Sasson's prototype records a black-and-white image to cassette", "Confirmed"],
            ["1975–76", "Internal presentations; the project is not commercialised", "Reported"],
            ["1981", "Sony's Mavica shows a consumer electronic camera is possible", "Confirmed"],
            ["2012", "Eastman Kodak files for Chapter 11 protection", "Confirmed"],
        ],
        "The popular version — 'they buried it and went bankrupt because of that' — is too tidy. The "
        "defensible version: Kodak's film business made the digital transition unattractive to fund, and "
        "Sasson himself estimated a commercially viable camera was 15–20 years away. The bankruptcy came "
        "37 years later, after many other decisions. The episode does not claim a single cause.",
        [
            ["Kodak's own account of the Sasson prototype (company history)", "Specs, date, resolution", "Primary"],
            ["2015 profile citing Kodak photography and Sasson interviews", "Sasson's 15–20 year estimate", "Secondary"],
            ["Eastman Kodak Chapter 11 filing, Jan 2012", "The bankruptcy date", "Primary"],
        ],
        story,
    )

    # ---------------------------------------------------------------- page 5 · Ep 03
    episode(
        "03",
        "Nokia sold its phone business for €5.44bn. The phones were not the whole problem.",
        "Microsoft announced the acquisition of Nokia's Devices & Services business on 2 September 2013 "
        "and completed it on 25 April 2014 for €5.44bn. Nokia kept its networks, mapping and patent "
        "licensing businesses.",
        [
            ["2 Sep 2013", "Microsoft announces the deal: €3.79bn for devices + €1.65bn patent licence", "Confirmed"],
            ["19 Nov 2013", "Nokia shareholders approve; regulatory approvals follow", "Confirmed"],
            ["25 Apr 2014", "Deal closes at €5.44bn; Microsoft Mobile Oy formed in Finland", "Confirmed"],
            ["2016", "Microsoft sells the feature-phone business; Lumia winds down", "Confirmed"],
        ],
        "Commentary often calls the deal a pure failure. The closing price and structure are documented; "
        "the strategic verdict is an opinion. The episode states the numbers, then separates 'what "
        "Microsoft said it was buying' from 'what happened to the phone business afterwards'.",
        [
            ["BBC News, 25 Apr 2014", "Completion, price, what Nokia kept", "Secondary"],
            ["Microsoft/Nokia joint announcement, 2 Sep 2013", "Deal structure", "Primary"],
            ["Nokia annual report 2013–14", "Segment accounting", "Primary"],
        ],
        story,
    )

    # ---------------------------------------------------------------- page 6
    story += [
        kicker("Appendix", P),
        h2("Every link in this file", P),
        body("Printed in full so you can check them without a QR code. If one is dead, the date and "
             "outlet below are enough to find an archived copy.", P, "small"),
        Spacer(1, 6),
    ]
    links = [
        ("Newsweek fact check — $50M offer", "newsweek.com/fact-check-did-blockbuster-turn-down-chance-buy-netflix-50-million-1575557", "11 Mar 2021"),
        ("Reuters — Nakumatt administration (ep 06)", "reuters.com/article/kenya-nakumatt/kenyas-nakumatt-once-east-africas-top-retailer-files-for-administration-idUSL8N1N613B/", "31 Oct 2017"),
        ("BBC News — Microsoft/Nokia completion", "bbc.com/news/business-27163667", "25 Apr 2014"),
        ("Kodak history & Sasson prototype", "kodak.com (company history) + 2015 profile citing Kodak", "checked 21 Nov 2026"),
    ]
    rows = [[str(i + 1), name, url, date] for i, (name, url, date) in enumerate(links)]
    from reportlab.lib.styles import ParagraphStyle
    from kit import styles
    st = styles(P)
    story.append(table(["#", "Source", "URL", "Date"], rows, P,
                       widths=[COL_W * 0.06, COL_W * 0.3, COL_W * 0.44, COL_W * 0.2]))
    story += [
        Spacer(1, 12),
        panel([
            body("If I got something wrong", P, "h3"), Spacer(1, 3),
            body("Comment on the episode with the source. If it holds, the Reel is re-cut, the correction "
                 "goes in the next episode's description, and this file is updated with today's date. "
                 "The old version is not quietly deleted.", P, "small"),
        ], P),
        Spacer(1, 12),
        rule(P),
        Spacer(1, 8),
        body(f"<font name='MonoBold'>Comment {KEYWORD}</font> on episode 21 for the roundup of all "
             "episodes with their sources.", P, "small"),
        source_line("Compiled by Mwijay Davie, 21 Nov 2026. No affiliation with any company named. "
                    "Links checked by hand on the date shown; prices and figures are as published, not "
                    "recalculated.", P),
    ]
    return story
