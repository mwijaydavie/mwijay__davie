# Comment API → mwongozo wa bure · Draft ya Manychat (haijawekwa live)

## Kwa nini baadhi ya flows zinaomba follow?

Manychat ina **Ask to follow before sending the link**, chaguo la kukuza followers. **Si sharti la Meta** la private reply. Kwa anayekufuata reply inaenda Inbox; kwa asiye-follow inaweza kuingia **Message Requests**. Kuomba follow mapema kunaweza kuongeza friction. Toleo la kwanza: **toa PDF kwanza bila gate, bila email na bila reminder.** Baada ya kuipata, mtu anaweza kuchagua kufollow kwa episodes zijazo. Mfano wa prompt isiyo gate (kwenye caption au landing, si DM ya pili): “Mwongozo umekusaidia? Tufuate kwa Tech Tip inayofuata.” Usifanye follow kuwa ruhusa ya kutuma DM zaidi.

## Setup ya owner baada ya kuidhinisha audience URL

1. Thibitisha typo-free **public HTTPS URL ya PDF moja tu** au landing nyepesi yenye `Pakua PDF ya bure`. Ifungue kwa simu ukiwa logged out; hakuna sign-in, access request, email gate au redirect isiyoelezwa. **Usitumie link ya private review folder.** PDF iliyotolewa kwenye handoff ni ya kukagua tu mpaka mwenye akaunti aamue wapi kuiweka. Hakuna link ya umma iliyobuniwa.
2. Manychat → *New Automation → Auto-DM links from comments* (au *Post/Reel Comment*). Chagua **Reel hii pekee**, keyword **API**; jaribu `API`, `api`, punctuation, na neno `rapid` lisipate offer. Tumia whole-word matching inapopatikana. Kagua overlaps na flows za zamani; usitumie `Any comment`.
3. Zima **Opening DM**, **Ask to follow**, **Ask for email** na **Follow-up** kwa pilot hii. Private reply moja ndiyo delivery. Ikiwa account/plan hutaka tap ya confirming button kabla ya link, tumia template iliyoidhinishwa `Nipe mwongozo`, kisha link kwenye response inayoruhusiwa; usiliite follow requirement. Hakikisha settings up-to-date.
4. **Private reply:** “Asante kwa kuandika API. Huu ndio mwongozo wa bure: njia ya API, njia ya MCP, jaribio la stoo na links za kuanza. Bonyeza hapa chini.”
   - Button pekee: **Pakua mwongozo (PDF)** → URL ya audience iliyokaguliwa.
   - Public reply ya hiari, *baada ya kujua delivery inafanya kazi:* “Angalia DM au Message Requests kwa mwongozo wa API na MCP.”
   - Manual fallback kwa mtu aliyeandika keyword lakini anasema hajapata: waombe aangalie Requests au akuanze DM `API`, kisha tuma files/link mara moja ndani ya window inayoruhusiwa, si private reply ya pili kwa comment ileile. Usiache audience ikikwama kwenye gate.
5. Preview kwa test accounts zilizoidhinishwa: follower na non-follower, `API`/case test, no keyword, repeat, and open button logged-out. Thibitisha reply moja, PDF sahihi mobile, no automation ya pili (hasa ikiwa kuna trigger ya any post). Disable if not delivering. Mtu anayejibu kwa swali la mfumo apewe mtu, si campaign isiyohusiana.

**Meta:** private reply moja kwa comment inayostahili ndani ya siku 7 kwa Reel/post. Follow-up tu baada ya recipient kujibu na ndani ya masaa 24 tangu jibu. Website-link click peke yake si reply/messaging opt-in. Hutakiwi kuunganisha/kuwasha au kumpa mtu password ndani ya chat. [Meta · Private Replies](https://developers.facebook.com/documentation/instagram-platform/private-replies) · [Manychat · Quick Automation](https://help.manychat.com/en/articles/17742037-quick-automation-auto-dm-links-from-comments) · [Manychat · Comment trigger](https://help.manychat.com/en/articles/17741897-instagram-post-and-reel-comments-trigger), checked 18 Nov 2026.

## Links ndani ya mwongozo

- **Zetu:** `Ona preview ya FaidaHQ` (muktadha wa sekta, si MCP), `Ongea na Altraware` (kwa aliye na mradi). Si lazima mtu abofye hizi ili asome guide.
- **Zingine useful:** MCP Architecture + Tools rasmi, OpenAI, Claude, Gemini, na Ollama kwa local tool calling. Hizi ni docs, si links za kuuza/referral au ahadi za access ya bure. Button kuu ya DM ibaki PDF moja tu.
