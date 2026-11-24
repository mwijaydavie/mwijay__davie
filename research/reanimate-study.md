# reanimate — uchunguzi (study) kwa ajili ya animations za Noellyne

**Tarehe:** 2026-11-23 · **Chanzo:** https://github.com/NiazMorshed2007/reanimate · **Commit iliyosomwa:** `3f7a55a2986a84ca2173e86ee9127eefe31d046d` · **Leseni:** MIT (© 2026 Niaz Morshed) · **Ime-vendoriwa hapa repo:** `.agents/skills/reanimate/` (pamoja na `VENDORED.md` na `LICENSE`)

## Muhtasari (kwa Kiswahili)

**reanimate** ni "Claude Code Agent Skill" — si programu wala framework. Kazi yake moja tu: **kurekodi motion reference (tovuti hai / screen recording / mp4 / gif / Lottie), kuiandika upya kwenye stack yako (CSS · Framer Motion · GSAP · three.js), kisha kuithibitisha frame-by-frame** dhidi ya reference hadi idadi zilingane. Faili kuu: `skills/reanimate/SKILL.md` (workflow) + `references/` (kumi za capture/analysis/implementation/verify/webgl) + `scripts/` (bun TypeScript: capture, frames, easing, compare, sheet, gl). ~252 KB, hakuna API keys.

Si mchezo wa character rigging: **haiwezi kusimulizi uso/lipsync wa Noellyne** (hizo ni Flow/Veo + visemes yetu). Kieneo chake ni **motion ya web** — yale ambayo HTML/CSS/Remotion yetu hutengeneza: kinetic type, lower-thirds, counters, logo draw, page/hover/hero motion, end-cards, WebGL/three.js accents.

## Kazi (hatua 6)

0. **Scope** — `spec.md`: target (URL+selector au file+time range), destination (stack ya project — soma `package.json`, usilete library mpya bure), fidelity level.
1. **Fidelity levels** — `motion-faithful` (default: timing ±80 ms, easing family, stagger, distance; copy/colours za wewe) · `pixel-faithful` (+ fonts/colours/spacing; mean mismatch ≤ 2 %) · `mixed` (clone + additions zako, additions hazifanyiwa verification ya cloned region).
2. **Setup** — `bash scripts/setup.sh`: huhitaji Bun ≥ 1.1 (macOS/Linux); hupakua Playwright Chromium + ffmpeg-static (~250 MB mara ya kwanza).
3. **Capture** — `capture.ts --url … --selector … --trigger load|scroll|hover|leave|move|drag|click|none --duration … --track "…"`: inapata `video.webm`, `frames/`, `inspect.json` (CSS/WAAPI animations + keyframes + computed styles + fonts + libs — usoma mahesabu halisi: durations, delays, easings — **bora kuliko kukisia**), `track.json` (kila frame: x,y,w,h,opacity,transform ya vipengele vinavyofuatiliwa). Kwa canvas/WebGL: `--clock virtual --gl` (saa ya kubahatisha inayoendelea frame-by-frame, `Math.random` seeded 40 Hz rAF) → `gl/` (shaders, uniforms, scene graph three.js/Pixi/PlayCanvas/Babylon/OGL, draws.json) + `gl-track.json` (kila uniform/transform inayobadilika kama channel: clock | transition | there-and-back | oscillation | steps). `--assets` hupakua models/textures. Video: `frames.ts --in ref.mp4 --fps 25 --start … --end … --crop …`. Lottie: file ndio spec.
4. **Spec** — jedwali la kila element kwa kila property: trigger, start, duration, from→to, easing, stagger. Chanzo cha namba kwa mtiririko: `inspect.json` → `easing.ts` (kwenye track.json) → `gl.ts summary`/`easing.ts --channel` → kusoma frames. **Kila row = check ya mtiniho 5.**
5. **Build** — implementation.md ina jedwali la easing equivalents (e.g. easeOutExpo `cubic-bezier(0.16,1,0.3,1)` → Framer `[0.16,1,0.3,1]` → GSAP `"expo.out"`), spring fitting (overshoot → ζ=0.59@10 %; settle ≈ 4/(ζω)), marquee/text-reveal/hover-lift/clip-path/reduced-motion patterns.
6. **Verify, fix, repeat** — capture ya clone kwa amri ile ile, `compare.ts` (offset, mean mismatch, worst frames, motion window, timing error, activity curve, diff PNGs), `sheet.ts compare` (side-by-side), `easing.ts --compare-track`. Kesp criteria kwa motion-faithful: start/end/duration error ≤ 0.08 s, easing family sawa, stagger ≤ 0.04 s, distance ±10 %, hakuna vipengele vinavyotembea vya cloned/clones. Pixel: ≤ 2 % mean / ≤ 5 % worst / ≤ 0.5 % at rest. Canvas: channels same kind, ≤ 0.08 s, ≤ 5 % ya range. **Routini: 2–5 mizunguko; ikiisha mizunguko 5 au difference iko nje ya uwezo, ripoti row hiyo yenye namba — usipandishe threshold kimyakimya.**
7. **Report** — lazima ikasimama peke yake: fidelity, code paths, jedwali la last compare round (timing err, mismatch, easing), paths za sheets, residuals zenye sababu.

## Nini maana yake kwa animations za Noellyne

**Inatumika kwa (HTML/Remotion/CSS layer ya Noellyne):**
- Intro/outro slate sets, kinetic lower-thirds, counters (350K tick), end-card (logo draw + domain typeout + ANZA LEO stamp).
- Noellyne showcase/site hero motion, hover/tap states, pricing toggles — bila kuigiza trade dress ya mtu.
- Altraware site (altra.tanzaniareach.com): hero entrance, marquee ticker, stat counters — kwa motion kwenye stack yetu, kithibitisho kwa compare.
- **Video references:** tunavyoma video references tu kutoka mp4 (no website) — `frames.ts` + `sheet.ts` + kusoma frames → spec. Inatumika pia kwenye web animations za video credit/lower-third templates.
- **Verification discipline** karibu na ile ya `out/timeline.json` + frame-by-frame review tutunayo tayari kwenye `.agents/skills/tech-video-motion-graphics/` — reanimate inaongeza estimate→proof pipeline yenye namba.

**Haitumiki (usitarajie):**
- Uso/visemes/lipsync wa Noellyne (Flow/Veo + visemes pipeline yetu — tayari imethibitishwa).
- Timing ya klip za AI ya generative — hiyo haifuatiliwi.
- Video za YouTube/Loom/pages behind login — tunahitaji screen recording.

## Vikwazo vya environment

- Bun ≥ 1.1 + ~250 MB downloads (Chromium + FFmpeg) mara ya kwanza. Sandbox yetu ina network kwa github/codeload/npm/pypi pekee — **Playwright browser CDN huenda ikashindwa humu**; kwenye Mac ya mmiliki itakimbia kawaida.
- Windows haijajaribiwa. Sub-WebGL heavy scenes: `--clock virtual --gl` ndiyo njia safi (SwiftShader default; `--gpu hardware` kwenye macOS/Linux Vulkan untested ukilazimika).
- A/B variants & random content = noise floor — capture reference maradufu au seed; iframes hazichunguzwi (capture URL ya iframe).

## Uadilifu & sheria zake (kabla ya kuifikiria)

- **Reanimate nakili motion tu** — fonts/picha/code za tovuti nyingine zinabaki za wamiliki. Kwa Altraware/Noellyne: idadi (timing/easing) tunazinasa, assets ni zetu (cream/violet/ink, Inter/DejaVu, Altraware logo). Mafanikio = feel yao na identity yetu.
- Pixel-faithful ya tovuti ya mshindani haifai kwa Altraware kama trade dress; default ni motion-faithful + copy yetu.
- Leseni MIT: uhuru wa kutumia/kurekebisha likiwekwa na attribution — `VENDORED.md` imehifadhi taarifa.

## Pendekezo la kufuata (baada ya owner kuelekeza)

1. Lengo la kwanza: **end-card "ANZA LEO"** ya Altraware ad (logo draw + cursor typeout + stamp) — motion-faithful (au pixel-faithful ya ndani kabisa) dhidi ya reference huru au mp4 yetu ya kujipima. Au **Altraware site hero** (motion-faithful, copy yetu). Au package ya **lower-thirds za Noellyne** (inafaa ilhali!).
2. Andika spec.md kwanza (red rows kabisa), kisha build kwenye stack yetu (Remotion), kisha verify loop mpaka inapita — na uhifadhi sheets kwenye Drive kwa kuripoti.
3. Weka sheets + spec kwenye `production/noellyne-host/` au `production/altraware-ad/`; kila ripoti ionyeshe namba, si hisia.
