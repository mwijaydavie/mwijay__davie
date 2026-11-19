# Code Story 01 · Mbona pilau imerudi?

**Altraware owner review · 18 Nov 2026 · 37s · selected male Swanglish voice**

For people building a search or filter box: **the latest request sent may not be the last response to arrive.** Only the response matching the latest issued ID can commit to the screen. This is a local menu simulation, not Bongo Foodie footage or a network benchmark.

| Time (s) | Picture / proof | Performance cue |
| --- | --- | --- |
| 0.00–6.30 | Hook: query `chai`, then `Chai` changes to `Pilau` | Full-body greeting, blink on the mismatch. Scratch line: “Umeandika chai. Mbona pilau imerudi?” |
| 6.30–15.10 | `send #1 pilau → send #2 chai → #2 Chai → #1 Pilau`. The last arrival overwrites the result with guard off. | Host turns toward the trace and points, not toward the camera; red path reaches the result UI. |
| 15.10–23.30 | Focus on `++latest`, then `if (id !== latest) return;` in the success-path excerpt. | Remove host for a code close-up; hold on “usi-update UI.” The guide includes the matching error guard. |
| 23.30–30.80 | Same order with guard on. `#1` stops before the result. Separate `#1` error case has the same earlier steps; the fourth row switches to **ERROR IMEPUUZWA**, result still **Chai**. | Point on the reply beats. Use a quieter stop rather than the overwrite cue. |
| 30.80–37.00 | **Comment SEARCH** → JavaScript example + tests. | Open pose and wave, keyword emphasized, then still hold for reading. |

**Proof:** controlled Promises settle #2 before #1 in each run. No fake live performance data. Seven Node tests cover the control, stale success, stale error in ready/loading states, latest error, clear and the same query twice. The frame timing is editorial; compare event order, not the lengths of the cuts. The PDF's shorter standalone example handles old success and old failure; the kit also includes the full seven lab tests. Read [the lab and rebuild notes](../../production/search-race/README.md).

**Source checked 18 Nov 2026:** [React — Fetching data with Effects](https://react.dev/reference/react/useEffect#fetching-data-with-effects) explains out-of-order responses and illustrates effect cleanup. This episode is framework-independent. A monotonic ID is an update guard, not cancellation, deduplication or a replacement for debounce. Guard error or loading-state writes from old requests too.

**Public-facing close on review cut:** “Comment SEARCH, nikutumie mfano wa code ya kuzuia hii.” `SEARCH` is suggested copy, not a new keyword-only trigger. Use the existing comment → DM setup. Only the approved commenter PDF or code kit goes into the DM after testing. [DM and release notes](13-search-race-dm.md). No post, automation change or public hosting done.

**English caption adaptation:** You typed chai. Why did pilau come back? In this demo the older request finishes last and replaces the newer result. Give each search request an ID. If the response is not from the newest request, don't change the UI—even if the old one returns an error. **Comment SEARCH** for the JavaScript example and tests.
