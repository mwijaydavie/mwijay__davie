# Pilot 05 · Payment Check: Muamala mmoja, risiti moja

**Hook:** “Ujumbe mara mbili. Risiti ngapi?” **Audience:** teams and businesses building mobile-money checkout, retail or POS. **Deliverable:** a white-first Kiswahili carousel, a separate A4 workbook and a short supporting Reel for Mwijay. **CTA:** Comment **MALIPO** for five test cases and a print-ready results sheet.

## Dated evidence

- **National data:** Bank of Tanzania, [National Payment Systems Annual Report 2025](https://www.bot.go.tz/Publications/Regular/Annual%20Report/en/2026060211494565.pdf), executive summary (PDF p. 4); verified 18 Nov 2026. Merchants accepting digital payments rose from **1.33 million in 2024 to 2.79 million in 2025**. Not a count of customers, a measure of failures or a performance claim for Altraware. The [TCRA September quarter report listing](https://www.tcra.go.tz/publications/statistics/2026/q1) is dated 18 Nov 2026, but numeric tables were not verified; no September quantities used.
- **Implementation example, not affiliation:** [ClickPesa Payment Statuses](https://docs.clickpesa.com/home/payment-status) distinguishes pending/processing, received (`SUCCESS`) and settled (`SETTLED`), and documents status retrieval by webhook or query. Map the actual provider contract, including reversals/refunds, before release. No provider was contacted by the lab.
- **Proof:** from the [local simulation](../../production/payment-check/README.md), with synthetic references and no external calls. One matched confirmation repeated twice gives one recorded payment and one receipt. Pending, timeout and mismatch cases issue no receipt in the model. It is not Faida POS, a sandbox run of a payment provider, a real system limitation test or a fiscal receipt.

**Carousel sequence:** same notification twice → primary BoT context → received request ≠ paid → timeout and status lookup → measured duplicate result → mismatched amount → MALIPO workbook. Use original maker mark, dark ink on white, and explicit status labels in addition to accent colors. No fake screenshots. PDF adds repeatable setup, five tests with checks and a blank worksheet. It is printable, not a certified payment or tax process.

[Caption, alt text and reply copy](05-payment-check-caption.txt) · [Research and next two posts](../research/2026-11-18-content-runway.md).

**Reel:** animate the original notice, receipt, and repeat; do not swap in a second receipt. Guide preview swaps to the actual worksheet on the CTA. Use the same keyword, separate Reel caption, and SW/EN subtitle files.

**Release gate:** private owner handoff only. Before advertising the keyword, publish or share **only the guide** through an approved audience link and test it signed out. Do not DM the owner folder, send a message, change visibility, deploy or schedule without a separate instruction.

## Render and handoff status · 18 Nov 2026

- Five offline fixture tests passed. Seven 1080×1350 PNGs were inspected, with phone-size checks. The three-page tagged PDF parses as A4 and contains a test table, print worksheet, and both source hyperlinks.
- Delivered Reel rebuilt with the same male voice and cues at 0.92×: **22.600 s** (**1,356 frames**, 60 fps, 1080 × 1920, H.264/yuv420p + AAC/48 kHz). Four SW captions are burned in; four cues each in SW/EN SRT. Full-file decode passed, −16.15 LUFS/−4.49 dBTP; decoded proof/CTA checked at 360 px. No music. MP4 MD5 `8e65273e7ff60535044fb84b707cbb38`.
- `out/payment-check/MALIPO-Payment-Check-Pack.zip` contains all 13 posting files, with CRC validation. `out/payment-check/Ukaguzi-wa-Malipo-Majaribio-5-Kiswahili.pdf` is also a standalone resource. Source rebuild in [production README](../../production/payment-check/README.md). Keep `out/`, `.cache/` and raw voice out of Git.
- **Private Drive handoff complete.** `Altraware · Payment Check · MALIPO` contains the 458,951-byte standalone PDF and 2,655,493-byte complete ZIP. Upload checksums matched and the owner can download both; the PDF was parsed from Drive. Use the ZIP for all seven slides (the earlier carousel subfolder contains only slides 05 and 06). No audience download link, permission change, scheduling, posting or DM.
