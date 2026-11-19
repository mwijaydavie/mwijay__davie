# Pilot 07 · Tech Tip 01 / MCP au API?

**Maboksi mangapi yamebaki stoo?** App iulizeje? Hii inaendeleza [AI isome stoo. Bei ibaki.](06-agent-access.md) kwa uamuzi mmoja: kuanzia API au kuongeza MCP. Kwa owner wa duka, engineer na vibe coder anayetengeneza assistant yake ya kwanza.

**Hali:** owner review. Hakuna Reel iliyopostiwa au kuschedule, hakuna Instagram DM iliyotumwa na hakuna automation iliyowashwa. Reference audio si sauti ya Mwijay. File/link ya audience iidhinishwe na ipite test kabla ya CTA ya `API` kwenda live.

## Jibu linalopimika

- App inayojua endpoint inaweza kuita API moja kwa moja. MCP (*Model Context Protocol*) ni itifaki ya pamoja: host ya AI ina client inayoweza kugundua zana za server (`tools/list`) na kuita iliyochaguliwa (`tools/call`). `read_stock` inaweza kutumia API ileile ya stoo. API haiondoki; ruhusa zinabaki jukumu la backend/host.
- Fixture ya Node: `GET /stock/BOX-DEMO-01` → `200 {"sku":"BOX-DEMO-01","units":12}`. MCP SDK client → `read_stock({sku:"BOX-DEMO-01"})` → rekodi ileile. Missing → `404`/tool error, si `0`; POST imekataliwa `405`. [Lab tests](../../production/api-tip/lab.test.mjs) na `qa/lab.json` ndani ya kit. `npm --prefix production/api-tip test` (5 tests).
- **Mipaka:** handler ya Request/Response na SDK in-memory, data ya kubuni. Hakuna model, API ya nje, live shop, credentials, approval flow au Faida integration iliyopimwa. Crop ya FaidaHQ ni preview iliyofichwa data; stock clips ni muktadha, si proof ya data au wateja.

## Cut · 30s · 9:16

| Sehemu | Kinachobadilika | Maneno ya kurekodi |
| --- | --- | --- |
| `0.00–4.70` | Full-bleed video ya boksi kwenye shelf; typographic hook + route sticker inayochorwa | Maboksi mangapi yamebaki stoo? App iulizeje? |
| `4.70–10.08` | Karatasi/grid nyepesi. GET inasafiri endpoint → 200/12, kisha FaidaHQ cameo yenye label | App ikijua pa kuuliza, itumie API moja kwa moja. |
| `10.08–18.25` | Cobalt tool explorer. `tools/list` → select `read_stock` → `tools/call` | Kwa MCP, app ya akili bandia inaweza kugundua na kuita zana. |
| `18.25–24.05` | Conveyor strip halisi, mishale miwili inakutana kwenye API ya stoo; 12 = 12; note ya ruhusa | Zana hiyo inaweza kuita API ileile. |
| `24.05–30.00` | Kurasa halisi za PDF, sticker ya booklet, comment **API** na preview ya episode 02 | Andika API. Mwongozo ni wa bure. |

**Voiceover yako:** tumia `Tech-Tip-01-Voiceover-Master.mp4` (picha tu, hakuna audio wala captions za mazungumzo) na `voiceover/Record-Your-Voiceover.txt`. Rekodi beats tano kwa kawaida, takes mbili kila beat kama inawezekana. Simu karibu umbali wa kiganja, chumba tulivu, acha ~0.5 s kila mwisho; tuma WAV/M4A original. Usibane maneno kuiga synthetic timing. Baada ya kupokea, panga scene holds na SW/EN SRT upya. TTS ya preview: acronym phonetics `ei-pi-ai`, `em-si-pi`; `akili bandia` inasomeka badala ya `AI` kwenye VO. Owner bado achague/ahakiki matamshi.

**Video credits:** Tima Miroshnichenko ([Pexels 6170331](https://www.pexels.com/video/man-placing-a-cardboard-box-on-a-shelf-6170331/)); Erkan Avanoğlu ([Pexels 5903898](https://www.pexels.com/video/packages-moving-on-a-conveyor-belt-5903898/)). Muted, cut, crop + graphics under [Pexels license](https://www.pexels.com/license/); no endorsement. Original route, scanner and guide vectors exported to `graphics/`; raw stock/capture not redistributed. See [sources, capture and cut provenance](../research/2026-11-18-api-tip.md).

## Guide na delivery

- `Mwongozo-Bure-API-na-MCP.pdf`: kurasa sita kwa Kiswahili. Ramani ya njia mbili, comparison, jaribio la ndani, jinsi ya kuchagua, rollout checklist, model/tool docs na worksheet. Ulinganisho si ranking ya providers. **Links zetu** za FaidaHQ preview na Altraware contact tofauti na docs za nje. PDF ni standalone; hakuna hatua ya sign-in ndani yake.
- `audience-page/`: toleo la kuhost baadaye (landing, PDF, cover preview na mark pekee), bila forms/cookies. Si deployment. Owner achague published HTTPS URL: Altraware landing inayosimamiwa au public link ya PDF moja tu. **Usiweke folder/ZIP ya review kwenye DM.** Verify from Instagram in-app browser and logged out on mobile; make sure the signed-off version downloads without request-access, email or login.
- [Copy ya IG/LinkedIn](07-api-tip-caption.txt) na [Manychat draft, DM na manual fallback](07-api-tip-manychat.md). Offer default **PDF kwanza**, no follow/email gate or second message; test a non-follower's Requests. [Tech Tip season + EAT slots + metrics](../tech-tip-series.md); [creative direction](../creative-direction.md).

## Review assets

- `Tech-Tip-01-MCP-au-API.mp4`: SW captioned reference cut (synthetic narration for pacing).
- `Tech-Tip-01-Voiceover-Master.mp4`: clean picture master for a human take.
- `Cover-Tech-Tip-01.png`: edit cover crop in Instagram before publishing.
- Private kit: those files + PDF, SW/EN SRT, read-aloud cue sheet, caption, DM, sources, proof, SVGs and audience-page files.
- Rebuild/verify: [production/api-tip](../../production/api-tip/README.md). Only the final PDF/approved download page is for public sharing; the handoff is private.

## QA · 18 Nov 2026

- Encoded output: **30.000 s**, **1080×1920**, **60 fps CFR / 1,800f**, H.264 yuv420p. Reference: mono AAC 48 kHz, −16.0 LUFS, −2.0 dBTP. The clean master has zero audio tracks. Both files fully decoded, frame timestamps checked; reviewed five caption frames and the final hold at phone scale. SW/EN text and time checked, 5 non-overlapping cues each. Synthetic pronunciation needs a human listen before release.
- PDF: tagged Swahili A5, six pages, five internal targets and nine distinct clickable HTTPS resources. No cropped text/overlaps in print. Mobile landing: no horizontal scroll at 320/390/860 px; a fresh local browser downloaded the exact verified PDF bytes without login/cookies. Not an external HTTPS or Instagram test.
- Private owner folder: use the **Tech Tip 01 review** link from the owner handoff, not this public source repo. **Do not reuse that link as the audience download.**
