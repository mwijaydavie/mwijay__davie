import React,{createContext,useContext} from 'react';
import {AbsoluteFill,Img,Sequence,useCurrentFrame} from 'remotion';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import {asset,Host,type Rig} from './Host';
import {ease} from './motion.mjs';
import {searchAt} from '../../.agents/skills/altraware-search-reels/scripts/search-opening.mjs';
import swPlan from '../../.agents/skills/altraware-search-reels/examples/opening.plan.json';
import enPlan from '../../.agents/skills/altraware-search-reels/examples/opening-en.plan.json';
import {copy,type Locale} from './story-copy';
import layout from './layout.json';
import './story.css';

export type Shot={shot:string;start:number;end:number};
export type Props={shots:Shot[];rig:Rig;mouth:string;cover?:boolean;labelsOnly?:boolean;locale?:Locale};
type A={abs:number;rig:Rig;mouth:string;cover?:boolean};
const LocaleContext=createContext<Locale>('sw');
const englishLayout={...layout,...layout.english};
function useEdition(){
 const locale=useContext(LocaleContext),english=locale==='en';
 return {locale,english,strings:copy[locale],motion:english?englishLayout:layout,plan:english?enPlan:swPlan};
}
function Brand({dark=false,chapter}:{dark?:boolean;chapter:number}){return <div className={`we-brand ${dark?'night':''}`}><Img src={asset('altraware.png')} alt=""/><b>ALTRAWARE</b><i/> <span>BUSINESS STORY / 02</span><small>{String(chapter).padStart(2,'0')}</small></div>;}
function Title({eyebrow,children,className=''}:{eyebrow:string;children:React.ReactNode;className?:string}){return <header className={`we-head ${className}`}><p><i/>{eyebrow}</p><h1>{children}</h1></header>;}
function Pointer({x,y,accent,press}:{x:number;y:number;accent?:string;press?:number}){return <svg className="we-pointer" style={{left:x,top:y,transform:`scale(${1-.12*(press||0)})`}} width="42" height="55" viewBox="0 0 42 55" aria-hidden="true"><path d="M 5,3 38,34 25,35 30,46 22,51 16,38 6,47 Z" stroke="#fffaf5" strokeLinejoin="round" strokeWidth="4" fill={accent||'#2c2352'}/></svg>;}
function ShortMarks({labelsOnly}:{labelsOnly:boolean}){const {strings}=useEdition();return <div className="we-marks"><span>{strings.tools}</span><b>{!labelsOnly&&<Img src={asset('chatgpt-mark.svg')} alt=""/>}ChatGPT</b><b>{!labelsOnly&&<Img src={asset('gemini-mark.svg')} alt=""/>}Gemini</b></div>;}
function Opening({labelsOnly=false}:{labelsOnly?:boolean}){
 const {strings,plan}=useEdition();
 const f=useCurrentFrame(),s=searchAt(plan,f),t=plan.beats;
 const reveal=ease(f,t.ready,t.ready+24),hover=ease(f,t.hover,t.hover+22),press=ease(f,t.click-1,t.click+5)*(1-ease(f,t.click+8,t.open));
 const send=ease(f,t.submit-2,t.submit+3)*(1-ease(f,t.submit+4,t.submit+12)),open=s.phase==='open';
 const enter=ease(f,t.open,t.end-8),shift=ease(f,210,t.hover+24);
 return <AbsoluteFill className="we-scene we-search"><div className="we-search-orbit"/><div className="we-grid"/><Brand chapter={1}/>
  <Title eyebrow={`${s.label} · ${strings.searchEyebrow}`}>{strings.searchTitle[0]} <em>{strings.searchTitle[1]}</em></Title>
  <ShortMarks labelsOnly={labelsOnly}/>
  <div className="we-search-app" style={{transform:`translateY(${enter*(-15)}px) scale(${1+enter*.015})`}}>
   <div className="we-bar"><i/><i/><i/><b>{open?s.domain:strings.searchBar}</b><span>{open?strings.demo:'01'}</span></div>
   {open?<div className="we-open-page" style={{opacity:.66+.34*enter}}><small>{strings.openedLabel}</small><b>{strings.openedTitle}</b><span>{strings.openedNote}</span></div>:
    <><div className="we-query"><svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><circle cx="13" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M19 19l9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg><b>{s.query||strings.type}</b><i style={{opacity:s.phase==='type'&&(Math.floor(f/17)%2===0)?1:0}}/><strong style={{transform:`scale(${1-send*.15})`}}>↵</strong></div>
   <div className="we-result-slot">
    {s.phase==='waiting'&&<div className="we-search-wait"><div style={{width:108+ease(f,t.submit,t.ready)*449}}/> <small>{strings.wait}</small></div>}
    {s.canShowResult&&<div className="we-result" style={{opacity:reveal,background:hover>.5?'#fff8eb':undefined,transform:`translateY(${18*(1-reveal)+3*press}px)`}}><small>{s.domain} · {strings.demoLink}</small><div>{strings.result}</div><span>↗</span></div>}
   </div></>}
   <p className="we-sim-note">{strings.simNote}</p>
  </div>
  {f>210&&!open&&<Pointer x={909-(90*shift)} y={1108-208*shift} press={press}/>}
 </AbsoluteFill>;
}
function Desk(){return <div className="we-desk"><div/><i/></div>;}
function LinkShot({abs,rig,mouth,cover=false}:A){
 const {strings,plan}=useEdition();
 const f=useCurrentFrame(),p=cover?1:ease(f,106,156),q=cover?1:ease(f,204,253),focus=cover?1:ease(f,259,291);
 return <AbsoluteFill className={`we-scene we-link ${cover?'we-cover':''}`}><div className="we-wall"/><div className="we-lit-window"/><Brand chapter={2}/>
  {cover?<Title eyebrow={strings.coverEyebrow}>{strings.coverTitle[0]}<br/><em>{strings.coverTitle[1]}</em></Title>:<Title eyebrow={strings.linkEyebrow}>{strings.linkTitle[0]}<br/><em>{strings.linkTitle[1]}</em></Title>}
  <div className="we-portrait-window"><Host rig={rig} pose="wave" frame={f} abs={abs} mouth={mouth} x={160} y={-25} w={1042} blinks={[118,278]} still={cover}/></div>
  <div className="we-check-window" style={{transform:`translateY(${(1-p)*12}px)`}}>
   <div className="we-check-url"><i/> {plan.domain} <span>{strings.demo}</span></div>
   <div className="we-check-content"><b>{strings.linkTop}</b><p style={{opacity:.38+.62*q}}>{strings.linkNote}</p><div className="we-badge" style={{opacity:focus}}>{strings.linkBadge}</div></div>
  </div>
  <Desk/>
 </AbsoluteFill>;
}
function Own({abs,rig,mouth}:A){
 const {strings,motion}=useEdition();
 const f=useCurrentFrame(),p=ease(f,12,48);
 return <AbsoluteFill className="we-scene we-own"><div className="we-own-arch"/><Brand chapter={3}/>
  <Title eyebrow={strings.ownEyebrow}>{strings.ownTitle[0]} <em>{strings.ownTitle[1]}</em></Title>
  <div className="we-own-sub" style={{opacity:p}}>{strings.ownNote}</div>
  <div className="we-portrait-window"><Host rig={rig} pose="point" frame={f} abs={abs} mouth={mouth} x={218} y={-25} w={1005} blinks={[110,316]} targets={motion.ownRows.map(n=>n+9)}/></div>
  <div className="we-own-list">{strings.ownRows.map((x,i)=>{const t=motion.ownRows[i],wait=ease(f,t,t+23);return <div className="we-row" key={x} style={{opacity:.20+.80*wait,transform:`translateX(${(1-wait)*(-13)}px)`}}><span>0{i+1}</span><b>{x}</b><i>{wait>=.4?'✓':'—'}</i></div>})}</div>
  <Desk/>
 </AbsoluteFill>;
}
function Bongo({f}:{f:number}){
 const {strings,motion,english}=useEdition();
 const u=ease(f,motion.workBongoChange,motion.workBongoChange+20);
 return <div className="we-proof-body bongo">
  <div className="we-proof-copy"><div className="we-proof-index">{strings.bongoIndex}</div><b>{strings.bongoWord}<br/> → <em>pilau</em></b><p>{strings.bongoBody}</p><span className="we-proof-answer" style={{opacity:u}}>{strings.bongoBadge}</span></div>
  <div className="we-site-window"><div className="we-site-path">bongofoodie.vercel.app/search</div>
   {english&&<div className="we-bongo-excerpt">MENU SEARCH / EXCERPT</div>}
   <div className="we-bongo-input"><Img src={asset(u>.28?'bongo-menu-pilau.png':'bongo-menu-before.png')} alt="Bongo Foodie menu search" style={{transform:`translateY(${english?0:-130*u}px)`}}/></div>
   <div className="we-bongo-res" style={{opacity:u,transform:`translateY(${(1-u)*26}px)`}}><Img src={asset('bongo-pilau-result.png')} alt="Pilau ya Kuku, example menu item"/></div>
  </div>
  <div className="we-proof-source">{strings.bongoProof}</div>
 </div>;
}
function Audenic({f}:{f:number}){
 const {strings,motion}=useEdition();
 const scroll=ease(f,motion.workSpecsChange-32,motion.workSpecsChange+18);
 return <div className="we-proof-body audenic">
  <div className="we-proof-copy"><div className="we-proof-index">{strings.audIndex}</div><b>{strings.audWord}<br/> → <em>specs</em></b><p>{strings.audBody}</p><span className="we-proof-answer" style={{opacity:scroll}}>{strings.audBadge}</span></div>
  <div className="we-site-window"><div className="we-site-path">audenic.vercel.app/shop/…</div><div className="we-spec-scroll" style={{transform:`translateY(${scroll*(-225)}px)`}}>
    <Img src={asset('audenic-name.png')} alt="Audenic Classic product title"/>
    <Img src={asset('audenic-specs.png')} alt="Technical specifications on the Audenic Classic product page"/>
  </div></div>
  <div className="we-proof-source">{strings.audProof}</div>
 </div>;
}
function Work(){const {strings,motion}=useEdition();const f=useCurrentFrame(),b=f>=motion.workSwap;const i=b?f-motion.workSwap:f;const p=ease(i,0,22);
 return <AbsoluteFill className={`we-scene we-work ${b?'aud':'bg'}`}><div className="we-work-grid"/><Brand chapter={4}/>
  <Title eyebrow={strings.workEyebrow}>{b?'Audenic':'Bongo Foodie'}<em>.</em></Title>
  <div className="we-proof-stage" style={{transform:`translateY(${(1-p)*18}px)`,opacity:.70+.30*p}}>{b?<Audenic f={i}/>:<Bongo f={i}/>}</div>
 </AbsoluteFill>;
}
function Offer(){const {strings,motion}=useEdition();const f=useCurrentFrame(),d=motion.offerNotes;const a=ease(f,d[0],d[0]+20),b=ease(f,d[1],d[1]+25),c=ease(f,d[2],d[2]+30),note=ease(f,d[3]-4,d[3]+22);
 return <AbsoluteFill className="we-scene we-offer"><div className="we-grid"/><Brand chapter={5} dark/>
  <Title eyebrow={strings.offerEyebrow}>{strings.offerTitle[0]}<br/><em>{strings.offerTitle[1]}</em></Title>
  <div className="we-prep" style={{opacity:.68+.32*a}}><div className="we-prep-label">{strings.page}</div><div className="we-metric"><i>01</i><b>Mobile-first</b><span style={{opacity:a}}>⚡</span></div><div className="we-metric" style={{opacity:.38+.62*b}}><i>02</i><b>{strings.content}</b><span>✓</span></div></div>
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="we-map" aria-hidden="true"><path d="M 496 952 v 54 H 283 v 52 M 496 1006 H 722 v 52" stroke="#8ee3d8" fill="none" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray={`${Math.max(0,c*100)} 102`}/></svg>
  <div className="we-surfaces" style={{opacity:.26+.74*c}}><div><small>{strings.surface}</small><b>{strings.surfaceTargets[0]}</b></div><div><small>{strings.surface}</small><b>{strings.surfaceTargets[1]}</b></div></div>
  <p className="we-qualifier" style={{opacity:note}}>{strings.offerNote}</p>
 </AbsoluteFill>;
}
function Close({abs,rig,mouth}:A){const {strings,motion}=useEdition();const f=useCurrentFrame(),hold=Math.min(f,motion.closeHold),p=ease(f,37,69),a=ease(f,163,210);
 return <AbsoluteFill className="we-scene we-close"><div className="we-wall"/><div className="we-lit-window"/><Brand chapter={6}/>
  <Title eyebrow={strings.closeEyebrow}>Comment <strong style={{transform:`scale(${1+.028*(ease(f,24,37)-ease(f,37,61))})`}}>WEB</strong></Title>
  <div className="we-portrait-window"><Host rig={rig} pose="wave" frame={hold} abs={abs} mouth={mouth} x={182} y={-25} w={1030} blinks={[134,259]}/></div>
  <div className="we-end-copy">{strings.closeCopy[0]}<br/>{strings.closeCopy[1]}</div>
  <div className="we-free" style={{opacity:p,transform:`translateY(${(1-p)*15}px)`}}><i>✓</i><div><b>{strings.closeTile}</b><span>{strings.closeMeta}</span></div></div>
  <div className="we-dm-mark" style={{opacity:a}}>{strings.free}</div><Desk/>
 </AbsoluteFill>;
}
export function Story({shots,rig,mouth,cover=false,labelsOnly=false,locale='sw'}:Props){
 const f=useCurrentFrame();if(cover)return <LocaleContext.Provider value={locale}><AbsoluteFill className="we-root" lang={locale}><LinkShot abs={0} rig={rig} mouth="" cover/></AbsoluteFill></LocaleContext.Provider>;
 const s=shots.find(a=>a.start<=f&&f<a.end)||shots[0];const p={abs:f,rig,mouth};
 const scenes:Record<string,React.ReactNode>={search:<Opening labelsOnly={labelsOnly}/>,link:<LinkShot {...p}/>,own:<Own {...p}/>,work:<Work/>,offer:<Offer/>,close:<Close {...p}/>};
 return <LocaleContext.Provider value={locale}><AbsoluteFill className="we-root" lang={locale}><Sequence from={s.start} durationInFrames={s.end-s.start} layout="none" key={s.shot}>{scenes[s.shot]}</Sequence>
  <div className={`we-chapters ${s.shot==='offer'?'night':''}`}>{shots.map(q=><i key={q.shot} style={{opacity:s.shot===q.shot?1:s.start>q.start ? .58 : .19}}/>)}</div>
 </AbsoluteFill></LocaleContext.Provider>;
}
