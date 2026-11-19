import React,{useId} from 'react';
import {AbsoluteFill,Img,Sequence,staticFile,useCurrentFrame} from 'remotion';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import {Host,type Rig} from './Host';
import {compare,ease} from './logic.mjs';
import example from './example.json';
import './price.css';

export type Shot={shot:string;start:number;end:number};
export type Props={shots:Shot[];rig:Rig;cover?:boolean};
const {rows,samePrice,sameMl,from,to}=compare(example);
const digits=(a:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(a);
const mark=staticFile('price-story/altraware.png');
const money=(price:number)=>`TSh ${digits(price)}`;
function Brand(){return <div className="ps-brand"><Img src={mark} alt=""/><b>ALTRAWARE</b><i/> BUSINESS STORY / 01</div>;}
function Head({note,children}:{note:string;children:React.ReactNode}){return <header className="ps-head"><div className="ps-kicker"><i/>{note}</div><h1>{children}</h1></header>;}
function Bottle({tier=1,height=92}:{tier?:number;height?:number}){
 const id=useId().replace(/[^a-zA-Z0-9]/g,'');
 return <svg className="ps-bottle" style={{height}} viewBox="0 0 86 142" aria-hidden="true">
  <defs><linearGradient id={`j${id}`}><stop offset="0%" stopColor="#d7642c"/><stop offset="42%" stopColor="#ffaf46"/><stop offset="76%" stopColor="#f6982b"/><stop offset="100%" stopColor="#d27528"/></linearGradient></defs>
  <path d="M28 18h30v10c0 12 13 13 13 27v62c0 9-5 15-13 15H28c-8 0-13-6-13-15V55c0-14 13-15 13-27z" fill="#fff4dc" stroke="#633044" strokeWidth="3"/>
  <path d="M18 60c12 3 18-2 27-1 8 1 16 2 23-1v57c0 10-3 14-12 14H30c-9 0-12-5-12-14z" fill={`url(#j${id})`}/>
  <rect x="24" y="11" width="38" height="15" rx="5" fill={['#a995d5','#6551af','#3a2b68'][tier]} stroke="#633044" strokeWidth="2"/>
  <path d="M23 69v37" stroke="#ffe1a1" strokeWidth="4" strokeLinecap="round" opacity=".7"/>
  <path d="M27 77h32v27H27z" fill="#fff6d9" stroke="#c77855" strokeWidth="1.5"/>
  <path d="M49 82c4 6 5 9 3 13-3 5-13 4-13-2 0-5 4-6 10-11z" fill="#e66737"/><path d="M44 84c-1-3 0-5 5-6" stroke="#693d56" strokeWidth="1.4" fill="none"/>
 </svg>;
}
function Hook({rig,cover=false}:{rig:Rig;cover?:boolean}){
 const f=useCurrentFrame();const pop=cover?1:ease(f,68,113);const n=cover?1:ease(f,199,246);
 return <AbsoluteFill className="ps-scene ps-hook">
  <div className="ps-hook-dots"/><div className="ps-sun"/><div className="ps-counter"/>
  <Brand/><Head note={cover?'JUICE · MFANO WA PRICING':'BIASHARA · PRICING'}>Bei ileile<span>.</span></Head>
  <div className="ps-hook-tag" style={{opacity:cover?1:.6+.4*pop}}>{cover?'CHAGUO JIPYA':'Mbona sasa ni ya kati?'}</div>
  <div className="ps-actor-window"><Host rig={rig} pose="wave" frame={f} x={246} y={539} width={797} blinks={[132,304]} still={cover}/></div>
  <div className="ps-price-sticker" style={{transform:`rotate(${-5-3*(1-pop)}deg) translateY(${(1-pop)*22}px)`}}>
   <span>{sameMl} mL · MFANO</span><b>{money(samePrice)}</b><sup>↔</sup>
  </div>
  <div className="ps-hook-bottle" style={{transform:`rotate(${7-(1-pop)*5}deg)`}}><Bottle height={216}/></div>
  <div className="ps-hello" style={{opacity:cover?1:n}}><i/>ALTRAWARE HOST</div>
 </AbsoluteFill>;
}
function OfferRow({i,reveal=1,active=false}:{i:number;reveal?:number;active?:boolean}){
 const d=rows[i];
 return <div className={`ps-offer-row ${active?'selected':''}`} style={{opacity:.25+.75*reveal,transform:`translateX(${(1-reveal)*(-17)}px)`}}>
  <Bottle tier={i} height={[74,92,108][i]}/><b>{d.size}</b><div><small>TSh</small><strong>{digits(d.price)}</strong></div>
 </div>;
}
function Offers({rig,switchFrame}:{rig:Rig;switchFrame:number}){
 const f=useCurrentFrame();const added=ease(f,switchFrame+31,switchFrame+90);const after=f>=switchFrame+69;
 const r0=ease(f,87,132);const r1=ease(f,224,268);const appear=ease(f,223,258);
 const showRole=ease(f,390,440);const reflect=ease(f,switchFrame+298,switchFrame+350);
 return <AbsoluteFill className="ps-scene ps-menu"><div className="ps-menu-slice"/><Brand/>
  <Head note={after?'02 / ONGEZA SIZE MOJA':'01 / ANZA NA MBILI'}>Chaguo <em>{after?'tatu.':'mbili.'}</em></Head>
  <div className="ps-offers">
   <div className="ps-offer-head"><b>JUICE · MFANO</b><span>{after?'03':'02'}</span></div>
   <OfferRow i={0} reveal={r0}/><OfferRow i={1} reveal={r1} active={r1>.94}/>
   <div className="ps-new-tier" style={{height:132*added,opacity:added}}><OfferRow i={2}/></div>
  </div>
  <div className="ps-actor-window"><Host rig={rig} pose="point" frame={f} x={557+36*(1-appear)} y={519} width={620} targets={[287,430,switchFrame+241,switchFrame+351]} blinks={[316,switchFrame+171,switchFrame+388]} alpha={appear} lean={-0.7}/></div>
  <div className="ps-role" style={{opacity:showRole}}><div><span>{money(samePrice)} · {sameMl} mL</span><b>{after?'Iko katikati.':'Bei ya juu.'}</b></div>
   <span className="ps-rank">{after?to.join(' / '):from.join(' / ')}</span>
  </div>
  <div className="ps-unmoved" style={{opacity:reflect}}>Bei na kiasi havijabadilika.</div>
 </AbsoluteFill>;
}
function Steps({after}:{after:boolean}){
 return <div className={`ps-steps ${after?'after':''}`}>
  <small>{after?'BAADA · CHAGUO 3':'KABLA · CHAGUO 2'}</small>
  <div>{rows.slice(0,after?3:2).map((d,i)=><span className={i===1?'focus':''} key={d.id}>{digits(d.price)}</span>)}</div>
 </div>;
}
function Why({rig}:{rig:Rig}){
 const f=useCurrentFrame();const then=ease(f,94,146);const name=ease(f,304,344);const end=ease(f,345,401);
 return <AbsoluteFill className="ps-scene ps-why"><div className="ps-why-circles"/><Brand/>
  <Head note="03 / JINSI TUNAVYOCHAGUA">Kwa nini <em>kati?</em></Head>
  <div className="ps-actor-window"><Host rig={rig} pose="think" frame={f} x={520} y={522} width={563} blinks={[96,281]} lean={-1.5}/></div>
  <div className="ps-step-board"><Steps after={false}/><div className="ps-connector" style={{opacity:then}}>↓</div>
   <div style={{opacity:then,transform:`translateY(${22*(1-then)}px)`}}><Steps after/></div>
   <span>MPANGILIO · BEI TSh</span>
  </div>
  <div className="ps-compromise" style={{opacity:name,transform:`translateX(${-24*(1-name)}px)`}}><i/>COMPROMISE EFFECT</div>
  <div className="ps-why-note" style={{opacity:end}}>Inaweza kuvutia. Si lazima iwe bora.</div>
 </AbsoluteFill>;
}
function Use(){
 const f=useCurrentFrame();const unit=ease(f,341,390);
 return <AbsoluteFill className="ps-scene ps-use"><div className="ps-use-strip"/><Brand/>
  <Head note="04 / PRACTICAL TAKEAWAY">Ipe kila size <em>kazi.</em></Head>
  <div className="ps-unit-label" style={{opacity:unit}}><i/> LINGANISHA TSh KWA {example.unitMl} mL</div>
  <div className="ps-uses">{rows.map((d,i)=>{
   const ready=ease(f,[163,266,380][i],[208,312,418][i]);
   return <section className="ps-use-option" key={d.id}>
    <span className="ps-use-size">{d.size}</span><div className="ps-bottle-stage"><Bottle tier={i} height={[137,166,202][i]}/></div>
    <div className="ps-use-need" style={{opacity:ready,transform:`translateY(${(1-ready)*10}px)`}}>{d.for}</div>
    <div className="ps-unit-price" style={{opacity:unit}}><b>{digits(d.per100)}</b><small>/ {example.unitMl} mL</small></div>
   </section>;
  })}</div>
  <div className="ps-unit-note" style={{opacity:ease(f,424,460)}}>Bei ndogo kwa 100 mL ≠ gharama ndogo kwa chupa.</div>
 </AbsoluteFill>;
}
function Close({rig}:{rig:Rig}){
 const f=useCurrentFrame();const next=ease(f,152,197);const ask=ease(f,237,282);const wave=f>=182;const stable=Math.min(f,390);
 return <AbsoluteFill className="ps-scene ps-close"><div className="ps-close-slice"/><div className="ps-sun"/><Brand/>
  <Head note="TAKEAWAY · BEI & VALUE">Si mtego.<br/><em style={{opacity:next}}>Ipe kazi.</em></Head>
  <div className="ps-actor-window"><Host rig={rig} pose={wave?'wave':'think'} frame={wave?stable-182:stable} x={294} y={570} width={716} blinks={wave?[113]:[91]} lean={wave?-.2:-.8}/></div>
  <div className="ps-close-question" style={{opacity:ask,transform:`translateY(${(1-ask)*23}px)`}}>Size yako<br/>ya tatu inamfaa<br/>nani?</div>
 </AbsoluteFill>;
}
export function Reel({shots,rig,cover=false}:Props){
 const f=useCurrentFrame();const i=cover?0:shots.findIndex(s=>s.start<=f&&f<s.end);const s=shots[Math.max(0,i)];
 const isOffer=s.shot==='two'||s.shot==='three';const a=shots[1];const b=shots[2];
 const visual=({hook:<Hook rig={rig} cover={cover}/>,why:<Why rig={rig}/>,use:<Use/>,close:<Close rig={rig}/>})[s.shot];
 return <AbsoluteFill className="ps-root">
  {isOffer?<Sequence key="offers" from={a.start} durationInFrames={b.end-a.start} layout="none"><Offers rig={rig} switchFrame={b.start-a.start}/></Sequence>:
    <Sequence key={s.shot} from={s.start} durationInFrames={s.end-s.start} layout="none">{visual}</Sequence>}
  {!cover&&<div className="ps-track" aria-hidden="true">{shots.map((o,k)=><i key={o.shot} style={{opacity:k===i?1:k<i?.55:.18}}/>)}</div>}
 </AbsoluteFill>;
}
