# Altraware · Playbook ya content kwa kila project

**Tunauza uwezo wa kujenga software. Sekta ndiyo inatoa mfano wa tatizo; si bidhaa tunayouza.** Kwa Njombe, parachichi ndiyo muktadha, na Avocado Farmers Njombe ndiyo software demo. Vilevile, POS si duka na CareTrack si kliniki.

## 1 · Anza na software na tatizo la biashara

- Fungua kwa **“Tumejenga [mfumo] kwa [watu] ili waweza [kazi halisi].”** Mtazamaji ajue mapema ni build ya Altraware, nani anaitumia, na anapata msaada gani.
- Taja tatizo kwa mfano mahsusi, si takwimu au madai ya jumla yasiyo na ushahidi. Njombe: mnunuzi akikusanya aina, eneo na hali ya mavuno kwenye chat tofauti, inakuwa vigumu kuandaa ombi.
- **Onyesha tatizo → kitendo kwenye UI → faida yake.** Rekodi pamoja → kuchuja kwa aina/wilaya na kuona hali → ombi lenye kilo, bei ya ofa na mji. Hiyo inaonyesha kazi ya software, si tangazo la matunda. Toa CTA moja kwenye mwisho.
- Tumia screenshot au action uliyoithibitisha. Andika **DEMO**, **MFANO**, au **IN DEVELOPMENT** inapohusika. Usichanganye ombi, transaction, na matokeo yaliyothibitishwa. Hakikisha hakuna data binafsi au inventory halisi kwenye mfano wa UI.

## 2 · Chukua visual identity kutoka kwenye product

- Tumia screenshot ya build au theme tokens kuthibitisha **primary, accent, neutral**, halafu chagua tint/ink za contrast. Hifadhi palette na chanzo kwenye brief. Usitumie theme moja ya Altraware kwa kila product.
- Badili mpangilio na mtindo wa motion kulingana na story. Tumia captures zilizotolewa na owner, art mpya ya sekta, na [mbinu za stickers/contours za Motion Lab](https://github.com/mwijay12/motion-lab/tree/main/motion-lab) pale zinapoeleza kitendo; template ileile si lazima. Angalia [direction ya picha, footage na voice](creative-direction.md) kabla ya kila Reel.
- Hifadhi logo halisi ya Altraware kama maker signature. Product iwe na palette yake; isiige rangi za logo ya studio. Njombe: button green `#1B7A36`, highlight yellow `#D9B000`, white `#FFFFFF` kutoka homepage capture; forest na off-white ni supporting tones.
- Tengeneza **SVG zinazohusiana na sekta**: parachichi, jani na mistari ya shamba kwa Njombe; risiti au barcode kwa POS; motion ya notebook kwa note app. SVG ni illustration, si ushahidi. Onyesha UI mapema kuliko decoration, na hakiki text kwenye ukubwa wa simu.

## 3 · Keyword, localizations na delivery

- Weka **keyword moja iliyoidhinishwa** kwa post. Itumie kwa tahajia ileile kwenye creative, captions na DM. Taja zawadi halisi unayoitoa na iwe tayari kabla ya post: kwa Njombe, `PARACHICHI` → demo; kwa Ship Check, `TEST` → PDF yenye test 7 na release log. Toa jibu la hook kwenye carousel; resource iongeze hatua za kutumia, si irudie slide. Tuma link ya resource moja tu, si folda ya creative; kagua access kabla ya kupost.
- IG: Kiswahili kwanza; toa English slide/caption copy, LinkedIn adaptation, na SRT tofauti inapofaa. Tumia [motion skill](../.agents/skills/tech-video-motion-graphics/SKILL.md) kwa frame-driven motion na 60 fps. Recapture edits kwenye output zote, si source pekee.
- Kabla ya handoff: hakikisha format zote kwenye brief zime-exportiwa (mfano, carousel **na** Reel). Kagua mpangilio, spelling, UI proof, contrast, safe area, audio/subtitle timing, captions na DM link. Tuma link ya kudumu kutoka cloud storage ya owner; workspace preview si link ya delivery. Hakiki access na contents, na weka matoleo ya zamani kwenye archive. Hakuna autopost, DM, deploy au kubadili ruhusa za creative bila ombi.

## 4 · Reel inayosomeka nje kwenye jua

- **Nyeupe itawale** kwenye video na cover. Rangi za product zibaki kwenye maandishi yenye contrast, mistari, vitufe na screenshots, si paneli kubwa za giza. Tumia maandishi makubwa yenye uzito, caption fupi, na UI halisi mapema. Pitia frame kwa upana wa simu na video ikiwa mute.
- **Lenga chini ya sekunde 25 kwa Reel fupi, isipokuwa brief imeomba muda tofauti.** Punguza sentensi na chagua kitendo kimoja badala ya kuongeza kasi ya TTS. Acha nafasi kati ya mawazo na muda wa kusoma CTA. Kwa mtindo huu jaribu sauti ya kiume ya Kiswahili na hakiki matamshi kabla ya ku-export.
- Andika kiasi kwa maneno kwenye script ya sauti; usisome herufi `TSh`/`TZS`. Mfano: `TSh 5,000` → “shilingi elfu tano”; `TSh 350,000` → “shilingi laki tatu na nusu”; `TSh 800,000` → “shilingi laki nane.” Namba zinaweza kubaki kwenye screen inapofaa. Usibuni bei kwa Reel ya demo.
- Badala ya **scope**, sema **“kazi zitakazofanywa”** kwenye ofa, **“kinachojumuishwa”** kwenye kifurushi, au **“mipaka ya kazi”** unapofafanua kisichohusika.

## Brief ya kunakili kwa project inayofuata

| Field | Jaza kabla ya production |
| --- | --- |
| Product / builder / audience | Jina la build, Altraware, na mhusika atakayefanya action |
| Business problem | Hali moja mahsusi; evidence/source na tarehe |
| Software action → value | Feature 1–3 zenye proof; kilicho demo, live, au in development |
| Palette and proof image | HEX kutoka build; screenshot iliyoidhinishwa; nyepesi/nzito kwa contrast |
| Sector SVGs | Motif mbili zinazosaidia kuonyesha workflow |
| Copy and CTA | SW hook, EN adaptation, keyword moja, destination na manual reply |
| Release | Carousel PNGs, Reel MP4/SRT, source, Drive folder, owner review |
