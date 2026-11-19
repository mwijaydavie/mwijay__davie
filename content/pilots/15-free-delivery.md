# Business Story 03 · Free delivery? Angalia total.

**Owner review · Swanglish, 0:39.** For online sellers and shoppers comparing baskets, using the same Altraware female Business host. One claim: in this example, a waived fee still leaves a higher final total. One action: compare the two receipts. One CTA: **Comment `TOTAL`** for the A5 worksheet. No actual shop, transaction, conversion, margin or savings claim.

## Proof and edit

The local [checkout fixture](../../production/website-era/delivery-story/example.json) sets the free-delivery threshold on the **merchandise subtotal**, inclusive at TSh 30,000. Delivery is TSh 5,000 below it. Same initial basket and one optional add-on, no other fees in this example. The type on both receipts and on the worksheet is generated from the same [calculation](../../production/website-era/delivery-story/checkout.mjs); the [tests](../../production/website-era/delivery-story/checkout.test.mjs) cover both sides of the threshold.

| Beat | Read | Direction / visible change |
| --- | --- | --- |
| 00.00–06.10 · hook | “Uongeze elfu sita ili usilipe delivery ya elfu tano? Angalia total.” | Large head/shoulder cutout on an offset ink oval, paper amount tags enter on the words. |
| 06.10–13.50 · A | Basket 24,000 + delivery 5,000 = **29,000**. | Warm paper, close receipt crop; basket, fee and total appear separately. |
| 13.50–22.20 · B | Add 6,000 → reach 30,000 → delivery 0 → **30,000**. | Cooler stock, same receipt anchor; bar fills on the add-on, delivery drops on its own line. `MFANO · TSh` stays legible. |
| 22.20–29.00 · decision | **+TSh 1,000** and one extra item. “Ulikuwa unaihitaji?” | Dark-violet contrast cut. Both totals stay visible above the delta. No host over the proof. |
| 29.00–39.00 · seller | Show the free-delivery threshold and total early. `Comment TOTAL`. | Closer point pose, two short instructions, then the worksheet ticket and final hold. |

**Direction from the two supplied references, reviewed 18 Nov 2026:** A (19.07s), around 00:03/00:09, uses light–violet cuts and changes the scale of keywords; translate that into the paper-to-ink comparison and rising amount tags. B (104.33s), around 00:15/00:25/00:55, keeps the step name in one place and gives each UI state time to read; use the fixed A/B labels and keep both totals up for the decision. No frames, voices, effects, logos or text from either reference in the render or handoff.

**Asset/voice notes:** Restored original Business pose and mouth layers plus the maker mark. All diagrams, receipts and foley are original. Preview uses the previously selected Swanglish scratch voice at native speed, with approximate phonetic mouth timing in the two speaking crops. Master has resting mouth, no captions or audio. English SRT is a translation matched to this timing, not a dub.

## Caption and delivery gate

- [Post copy](15-free-delivery-caption.txt). Deliver only the **TOTAL-Checkout-Worksheet.pdf** to viewers. Suggested reply: “Asante! Hii hapa worksheet ya kulinganisha total kabla ya checkout. Jaribu kuweka jumla zako mbili, halafu angalia tofauti.”
- No routing, public upload, schedule or post here. Before release, listen on a phone for natural Kiswahili, ensure the app UI does not cover the receipts or CTA, and approve the public audience PDF separately. Verify the correct resource in the logged-out in-app browser and from follower/non-follower accounts. Use manual replies if per-post routing is unavailable. Do not change other series' keywords or share the private owner bundle.
