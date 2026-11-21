# Track 1 · A1 Systems (English) · Comment-to-DM engine

**Niche:** AI workflows, tech tools, practical money systems kwa freelancer na mwenye biashara ndogo anayejenga mwenyewe.
**Lugha:** English (on-screen, caption, DM). Hakuna Kiswahili kwenye akaunti hii.
**Engine:** kila video ina keyword moja; comment inarudi kwa file halisi. ManyChat au any-comment tool.

## Kanuni saba za akaunti hii

1. **Hook = kazi inayorudia**, si habari. "You type the invoice twice" inashinda "AI is changing invoicing."
2. **Keyword moja** kwa video, herufi kubwa, neno ambalo mtu haandiki kwa bahati (`STACK`, `WIRE`, `FIELDS`). Usitumie `link`, `info`, `yes`.
3. **Caption haina swali.** Mwisho: value + keyword moja. Maswali ya caption yalipimwa yakipungua views; tuache.
4. **Follow gate: hapana mwanzo.** Toa file kwanza; gate inaua delivery rate ya wiki 1.
5. **Picha halisi mbele.** Screen recording wa build yako, au clip iliyoruhusiwa yenye `credit`. Bila hiyo, tumia `workflow`/`checklist`/`table` templates, si stock isiyohusiana.
6. **Claim moja inayopimika** kwa video. Hakuna "10x", hakuna mapato ya kubuni.
7. **File halisi kabla ya post.** Kama file haiko tayari, badilisha CTA; usiachie ahadi hewani.

## Formats zinazopangwa

| Template | Inatumika lini | Inahitaji |
| --- | --- | --- |
| `workflow` | Process ya hatua 3–4 | Hakuna footage |
| `checklist` | Test/guard list | Hakuna footage |
| `clip` | Onyesho la screen recording | Picha + credit |
| `stat` | Namba moja yenye source | Source yenye tarehe |
| `table` | Ulinganisho wa chaguo 2–3 | Hakuna footage |

## Posti 21 (wiki 1–3)

Kila post: hook, beats, cues (maneno ya kusoma), keyword, caption, file. Spec ya kwanza iko tayari; nyingine ziko kama brief ya kuandikia spec.

### 01 · You already wrote the invoice. Why type it twice? · `STACK`

- **File:** [`Invoice-Flow-Checklist.pdf`](files/Invoice-Flow-Checklist.pdf) — fields 6 za kukusanya kabla ya automation, flow ya hatua 3, jedwali la kujaza. **Tayari (kurasa 5).**
- **Beats:** hook → three-step flow (capture/draft/approve) → CTA.
- **Caption:** `Your invoice exists in WhatsApp before it reaches a PDF. Collect 6 fields once, and the second copy writes itself. Comment STACK and I'll send the checklist. No new software needed.`
- **Hali ya file:** tayari, imepimwa (`production/runway-kit`), iko kwenye repo. Haijatumwa kwa mtu.
- **Spec:** [`specs/t1-01-invoice-twice.spec.json`](specs/t1-01-invoice-twice.spec.json)

### 02 · API or MCP? One question decides · `WIRE`

- **File:** `API-vs-MCP-1page.pdf` (kutoka [Pilot 07](../pilots/07-api-tip.md), toleo la English).
- **Beats:** app inajua endpoint → API moja kwa moja; MCP ni njia ya kugundua tool; ruhusa zinabaki backend.
- **Proof:** fixture `GET /stock/BOX-DEMO-01 → 200 {units:12}`, missing → 404 si 0.
- **Caption:** `Two ways to wire a model to your data. One needs a contract; one needs a tool list. Pick by how often the data changes. Comment WIRE for the one-pager.`

### 03 · Automate the field, not the whole job · `FIELDS`

- **File:** `Fields-Before-Automation.pdf` — 8 fields, 3 zake ni lazima.
- **Beats:** form 12 fields → 8 used → 3 required; automation inaanzia hapo.
- **Caption:** `Most "automation" projects die in the form. Count the fields you actually use. Comment FIELDS for the 8-field audit sheet.`

### 04 · "0" is not the same as "I don't know" · `ZERO`

- **File:** `Missing-Data-Rules.pdf`
- **Beats:** item absent ≠ 0; timeout ≠ 0; error state kwenye mock.
- **Proof:** [Tech Tip 02](../tech-tip-series.md) test ya absent/timeout.
- **Caption:** `Your dashboard says zero. Your warehouse says the API timed out. Different answers, same screen. Comment ZERO for the missing-data rules I use.`

### 05 · One approval, logged · `LOG`

- **File:** `Approval-Log-Template.csv`
- **Beats:** actor → time → old/new value → reference. Demo ya mstari mmoja wa log.
- **Caption:** `If a price can change, someone approved it. If nobody can name who, you don't have a record. Comment LOG for the five columns.`

### 06 · Tools that talk: one bridge, not five rewrites · `BRIDGE`

- **File:** `Tool-Bridge-Map.pdf`
- **Beats:** sheet → queue → app; bridge moja inayoshirikiwa.
- **Caption:** `Two tools that don't share a database will always drift. Put one bridge between them and name whose record wins. Comment BRIDGE for the map.`

### 07 · The guard checklist before you give an agent keys · `GUARD`

- **File:** `Agent-Guard-Checklist.pdf` — 9 items (read-only scope, rate limit, kill switch, log, approval, error path, test data, rollback, owner).
- **Beats:** checklist animation, item moja kwa sekunde 2.
- **Caption:** `Before an agent touches your shop, it needs a leash: scope, log, kill switch. Comment GUARD for the 9-item checklist.`

### 08 · Start read-only · `READ`

- **File:** `Read-Only-First.pdf`
- **Beats:** write access → 3 risks; read-only pilot → measurable.
- **Caption:** `Week one, the agent only reads. Week two, you know whether it is right. Comment READ for the pilot plan.`

### 09 · Your catalogue is already a data source · `CATALOG`

- **File:** `WhatsApp-Catalogue-Cleanup.pdf`
- **Beats:** messy catalogue → 6 fields → app/agent inaweza kusoma.
- **Note:** usidai integration ya WhatsApp Business API bila uthibitisho; onyesha export ya mfano.
- **Caption:** `A catalogue is only useful to software if every row has the same six fields. Comment CATALOG for the cleanup sheet.`

### 10 · The 5-minute research stack · `RESEARCH`

- **File:** `Research-Stack.pdf` (primary sources + how to date a claim)
- **Beats:** question → primary source → dated note → decision.
- **Caption:** `Five minutes of primary sources beats an hour of threads. Comment RESEARCH for the stack I use.`

### 11 · What a prompt pack is actually worth · `PACK`

- **File:** `Prompt-Pack-Audit.pdf`
- **Beats:** prompt pekee haitoshi; inahitaji input, output, test, owner.
- **Caption:** `A prompt is a sentence. A system has inputs, a test and an owner. Comment PACK for the audit questions.`

### 12 · The margin sheet nobody opens · `MARGIN`

- **File:** `Margin-Sheet.xlsx` (blank, formulas visible)
- **Beats:** price → cost → fees → margin; column moja inayokosekana.
- **Caption:** `If your margin sheet lives in your head, discounting is guessing. Comment MARGIN for the blank sheet.`

### 13 · A reminder is not a relationship · `NUDGE`

- **File:** `Followup-Messages.docx` (5 messages, no spam)
- **Beats:** reminder → value → one question; opt-out.
- **Caption:** `Three reminders and a goodbye beat a broadcast every week. Comment NUDGE for the five messages.`

### 14 · Test without touching real orders · `SANDBOX`

- **File:** `Sandbox-Test-Plan.pdf`
- **Beats:** fake data → same code path → real orders untouched.
- **Caption:** `Testing on live orders is how you learn what a refund costs. Comment SANDBOX for the plan.`

### 15 · Six lines of a proposal · `BRIEF`

- **File:** `Six-Line-Proposal.docx`
- **Beats:** problem → what changes → what you deliver → what you don't → price → date.
- **Caption:** `Clients don't buy features. They buy the sentence that says what changes on Monday. Comment BRIEF for the template.`

### 16 · Export before you automate · `BACKUP`

- **File:** `Export-Checklist.pdf`
- **Beats:** export → verify → store; restore test.
- **Caption:** `Automation without an export is a hostage situation. Comment BACKUP for the checklist.`

### 17 · Agents on a 2G line · `OFFLINE`

- **File:** `Low-Bandwidth-Rules.pdf`
- **Beats:** payload size, retry, offline queue, sync conflict.
- **Caption:** `Half your users are on a connection you can't test from your desk. Comment OFFLINE for the rules.`

### 18 · Three logs that answer "who changed this?" · `AUDIT`

- **File:** `Audit-Trail-Minimum.pdf`
- **Beats:** who → what → when; plus why.
- **Caption:** `Three columns turn an argument into a record. Comment AUDIT for the minimum trail.`

### 19 · What to charge for setup · `RATE`

- **File:** `Setup-Pricing-Worksheet.pdf`
- **Beats:** hours → risk → support window → price range.
- **Caption:** `Setup price is hours plus the support window you just promised. Comment RATE for the worksheet.`

### 20 · The Sunday stock check · `SUNDAY`

- **File:** `Sunday-Stock-Check.pdf`
- **Beats:** count → reconcile → decide; one page.
- **Caption:** `One page, one hour, every Sunday. Comment SUNDAY for the sheet.`

### 21 · The whole stack, on one page · `MAP`

- **File:** `Stack-Map.pdf` (roundup ya files zote za wiki 3)
- **Beats:** 5 layers (capture, store, decide, act, log) + file moja kwa layer.
- **Caption:** `Three weeks of systems on one page. Comment MAP for the roundup; it links every earlier file.`

## Caption template

```
<one line: the repeated job>
<one line: what changes>
<one line: what the file contains>

Comment <KEYWORD> and I'll send <file>.
<optional: one caveat>
```

Bila swali. Bila "follow for more". Bila hashtag za 30; tatu tu zinazoeleza niche (`#smallbusinesstools` `#workflowdesign` `#buildinpublic`).

## DM copy (kwa ManyChat)

```
Thanks for commenting! Here's <file>: <link>
It covers <3 things>. If you want, reply with the tool you're using and I'll say what I'd keep.
```

Kanuni: link moja, faili moja, hakuna gate ya follow/email wiki 1–2. Jaribu follower na non-follower, na Message Requests, kabla ya kuwasha. Kama file haipatikani, badilisha CTA ya post; usiachie ahadi.

## Vipimo (siku 21)

- follows ÷ reach × 1000 (lengo ≥ 5)
- unique keyword commenters ÷ reach × 1000 (lengo ≥ 15)
- DM delivered ÷ eligible commenters (lengo ≥ 90%)
- average watch ÷ duration (si completion)
