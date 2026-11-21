"""Track 1 · STACK → Invoice-Flow-Checklist.pdf

Six fields, three steps, and the questions to answer before automating anything.
Everything here is a design pattern, not a claim about a client or a system.
"""
from reportlab.platypus import NextPageTemplate, PageBreak, Spacer, KeepTogether

from kit import (COL_W, TRACK1, body, bullets, callout, checkbox_row, chip, cover_block,
                 h1, h2, kicker, numbered_steps, panel, rule, source_line, table, write_lines)

P = TRACK1
TITLE = "Invoice flow checklist"
FILENAME = "Invoice-Flow-Checklist.pdf"
KEYWORD = "STACK"


def build() -> list:
    story: list = [NextPageTemplate("inner")]

    # ---------------------------------------------------------------- cover
    story += cover_block(
        P,
        brand="Mwijay Systems · AI workflows",
        title="Collect six fields once. Every invoice after that writes itself.",
        standfirst=("Most small businesses retype the same invoice three times: in the chat, "
                    "in the notebook, then in the PDF. This is the field list and the three-step "
                    "flow I use before any tool gets involved."),
        meta=[
            ("Who it is for", "A shop, freelancer or studio that sends 10+ invoices a month"),
            ("What you get", "Six required fields, a three-step flow, and the questions to ask first"),
            ("Time to use it", "One afternoon. No new software, no sign-up."),
            ("Language", "English · Swahili notes inside the fields"),
        ],
        chip_text="FREE · NO SIGN-UP · NO CTA IN THE FILE",
        note=("Prices and field names are examples. Replace them with the ones you actually use. "
              "Nothing in this file is a client record or a measured result."),
    )
    story.append(PageBreak())

    # ---------------------------------------------------------------- page 2
    story += [
        kicker("Part 1 · the fields", P),
        h1("Six fields. Not twelve.", P),
        body("A form with twelve fields gets filled halfway. These six are the minimum that lets "
             "the same invoice exist twice without anyone typing it twice.", P, "lead"),
        Spacer(1, 4),
        table(
            ["Field", "What goes in it", "What it unlocks"],
            [
                ["Who is paying", "Registered name + phone number", "A legal name on the PDF, not a chat nickname"],
                ["What and how many", "Item, unit, quantity — one line per item", "Line items without a second conversation"],
                ["Amount agreed", "Unit price × quantity", "The number you said out loud, in writing"],
                ["Date agreed", "The day the price was agreed", "A payment reminder that is not an argument"],
                ["Paid or not", "Paid / partial / unpaid + method", "A receipt you can find three weeks later"],
                ["Who sent it", "The person who confirmed the order", "One name to ask when two records disagree"],
            ],
            P,
            widths=[COL_W * 0.27, COL_W * 0.38, COL_W * 0.35],
        ),
        Spacer(1, 10),
        callout("The rule", "If you cannot name the person who confirmed the order, you do not have a "
                            "record yet — you have a message.", P),
        Spacer(1, 10),
        body("<font name='MonoBold'>Where they normally live:</font> the chat where the order arrived, the "
             "notebook where you wrote the price, and the receipt that says paid. All three usually exist — "
             "no single place holds all six for the same order, so you rebuild them by hand at invoice time.",
             P, "small"),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 3
    story += [
        kicker("Part 2 · the flow", P),
        h1("Three steps, one afternoon.", P),
        body("Each step is small on purpose. Nothing in this flow sends an invoice without a person "
             "pressing a button.", P, "lead"),
        Spacer(1, 6),
        numbered_steps([
            ("01", "Capture once, in one sheet",
             "One sheet, one row per order, the six columns from page 2. A form can feed it later — paper is "
             "fine for week one. If the order came in a chat, copy the six fields while the chat is still open."),
            ("02", "Draft from the fields",
             "The invoice template reads the row: name, items, quantity, price, date. You are checking a draft, "
             "not typing one. Keep the template in the same tool you already use (Sheets, Excel, Docs)."),
            ("03", "Approve, then send",
             "You read the draft against the chat, then send. Record the date it went out and the method. "
             "No automatic send in week one, even if the tool offers it."),
        ], P),
        Spacer(1, 14),
        panel([
            body("What this does not do", P, "bodytight"),
            Spacer(1, 3),
            body("It does not chase payments, does not reconcile M-Pesa, and does not file tax. Those are "
                 "separate jobs; adding them to step one is how the sheet gets abandoned.", P, "small"),
        ], P),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 4
    story += [
        kicker("Part 3 · your six fields", P),
        h1("Fill this in for one product you sell this week.", P),
        body("Not for your whole catalogue. One product, one order, written out fully. If you can do it once, "
             "the template can do it again.", P, "body"),
        Spacer(1, 6),
    ]
    for label, detail, hint in [
        ("Who is paying", "Registered name, plus the phone number you would call", "Name / phone"),
        ("What and how many", "One line per item, with the unit you sell in", "Item · unit · qty"),
        ("Amount agreed", "Unit price × quantity, and whether VAT is included", "TSh"),
        ("Date agreed", "The day the price was agreed, not the day you invoiced", "DD / MM"),
        ("Paid or not", "Paid, partial, or unpaid — plus the method", "Method"),
        ("Who sent it", "The person who confirmed the order", "Name"),
    ]:
        story.append(checkbox_row(label, detail, P, hint))
        story.append(Spacer(1, 1))
    story += [
        Spacer(1, 6),
        h2("Then answer these three before you automate", P),
    ]
    for i, q in enumerate([
        "Which tool already holds most of these six fields today?",
        "Who is allowed to change a price, and where is that recorded?",
        "What happens to the draft if the internet drops mid-invoice?",
    ], start=1):
        story.append(body(f"<font name='MonoBold' color='{P.accent}'>{i:02d}</font> &nbsp; {q}", P,
                          "bodytight"))
        story.append(write_lines(1, P, height=12))
    story += [
        PageBreak(),
    ]

    # ---------------------------------------------------------------- page 5
    story += [
        kicker("Part 4 · keep it working", P),
        h1("The flow dies at week three. Plan for that.", P),
        body("In my experience the first version of any sheet survives two weeks. The fixes below are the ones "
             "that keep it alive after the novelty is gone.", P, "lead"),
        Spacer(1, 4),
        table(
            ["What breaks", "Why", "The cheap fix"],
            [
                ["Two people, two versions", "A copy gets shared and edited", "One owner; everyone else views"],
                ["Fields go empty", "A form adds rows nobody fills", "Make 3 fields required; drop the rest"],
                ["Invoice and chat disagree", "The chat changed after the row was written", "Edit the row, not the chat"],
                ["No idea if it was paid", "Payment arrives in a different app", "One column: paid + method + date"],
                ["The sheet is in someone's phone", "No handover", "Export monthly; keep the file in one place"],
            ],
            P,
            widths=[COL_W * 0.3, COL_W * 0.36, COL_W * 0.34],
        ),
        Spacer(1, 12),
        callout("Next step", "Run the six fields for five real invoices before you add a tool. If the sheet "
                            "still feels wrong after five, the problem is the fields — not the software.", P),
        Spacer(1, 14),
        rule(P),
        Spacer(1, 8),
        body(f"<font name='MonoBold'>Comment {KEYWORD}</font> on the Reel to get this file again. "
             "There is nothing to buy at the end of it.", P, "small"),
        source_line("Field list and flow: Mwijay Davie, 21 Nov 2026. Examples are illustrative; "
                    "no client data, prices or volumes are claimed.", P),
    ]
    return story
