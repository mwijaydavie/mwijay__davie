import React from 'react';
import {AbsoluteFill,Img,useCurrentFrame} from 'remotion';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import {Host,asset,type Rig} from '../Host';
import {ease} from '../motion.mjs';
import {amount,compareCart} from './checkout.mjs';
import layout from './layout.json';
import example from './example.json';
import './story.css';

type ShotName = 'hook'|'basket'|'unlock'|'compare'|'close';
export type Shot = {shot:ShotName;start:number;end:number};
export type Props = {shots:Shot[];rig:Rig;mouth:string;cover?:boolean};
const {before,after,delta,deliverySaved}=compareCart(example);
const {beats}=layout;
const num=amount;
const tsh=(x:number)=>`${example.currency} ${num(x)}`;
const chapter:Record<ShotName,string>={hook:'BUSINESS STORY / 03',basket:'01 / BILA ADD-ON',unlock:'02 / NA ADD-ON',compare:'03 / TOFAUTI',close:'BUSINESS STORY / 03'};

function Reveal({f,at,children,className='',rise=20,duration=16}:React.PropsWithChildren<{f:number;at:number;className?:string;rise?:number;duration?:number}>) {
 const p=ease(f,at,at+duration);
 return <div className={className} style={{opacity:p,transform:`translateY(${rise*(1-p)}px)`}}>{children}</div>;
}

function Mark({shot}:{shot:ShotName}){
 return <header className="ds-brand" data-safe>
  <div><Img src={asset('altraware.png')} alt=""/><b>ALTRAWARE</b></div>
  <span>{chapter[shot]}</span>
 </header>;
}

function Ground(){
 return <><div className="ds-grain"/><svg className="ds-cutmarks" viewBox="0 0 1080 1920" aria-hidden="true">
  <path d="M64 321v-30h30m864 0h30v30M64 1415v30h30m864 0h30v-30" fill="none" stroke="currentColor" strokeWidth="2"/>
  <path d="M87 1465H930" stroke="currentColor" strokeOpacity=".38" strokeDasharray="2 10" strokeWidth="3"/>
 </svg></>;
}

function Portrait({rig,f,abs,mouth,opening,still}:{rig:Rig;f:number;abs:number;mouth:string;opening:boolean;still:boolean}){
 const p=still?1:ease(f,opening?10:24,opening?94:118);
 const take=opening?{w:1034+40*p,x:298-17*p,y:419-8*p}:{w:971+36*p,x:344-17*p,y:510-7*p};
 return <div className="ds-portrait"><div className="ds-print-oval"/>
  <div className="ds-offset-ring"/>
  <Host rig={rig} pose={opening?'wave':'point'} frame={f} abs={abs} mouth={mouth} x={take.x} y={take.y} w={take.w}
    blinks={opening?[106,261]:[126,271,487]} targets={opening?[]:[beats.close.limit,beats.close.total,beats.close.cta]} still={still}/>
 </div>;
}

function Hook({rig,mouth,f,abs,cover}:{rig:Rig;mouth:string;f:number;abs:number;cover:boolean}){
 const b=beats.hook;const j=ease(f,0,22);
 return <>
  <Portrait rig={rig} f={f} abs={abs} mouth={mouth} opening still={cover}/>
  <div className="ds-hero-title" data-safe style={{transform:`translateY(${cover?0:13*(1-j)}px)`}}>
   <span>THE CHECKOUT EDIT</span><h1><em>Free</em><br/>delivery?</h1>
  </div>
  <div className="ds-price-tags" data-safe>
   <Reveal f={f} at={b.add} className="ds-tag-wrap">
    <div className="ds-price-tag add"><span>ONGEZA BIDHAA</span><strong>+{num(example.addOn)}<small> TSh</small></strong></div>
   </Reveal>
   <Reveal f={f} at={b.fee} className="ds-tag-wrap">
    <div className="ds-price-tag waive"><span>FEE YA DELIVERY</span><strong>−{num(deliverySaved)}<small> TSh</small></strong></div>
   </Reveal>
  </div>
  <Reveal f={f} at={b.total} className="ds-hero-end" rise={11}><b data-safe><i/>Angalia total.</b></Reveal>
 </>;
}

function Row({f,at,label,value,accent=false}:{f:number;at:number;label:string;value:number;accent?:boolean}){
 return <Reveal f={f} at={at} className={`ds-row${accent?' is-accent':''}`} rise={11}>
  <span>{label}</span><b>{num(value)}</b>
 </Reveal>;
}

function Receipt({f,unlock}:{f:number;unlock:boolean}){
 const b=beats[unlock?'unlock':'basket'];
 const current=unlock?after:before;
 const complete=unlock&&f>=beats.unlock.add+25;
 const pct=unlock?Math.min(1,(before.subtotal+(after.subtotal-before.subtotal)*ease(f,beats.unlock.add,beats.unlock.add+25))/example.freeAt):0;
 return <>
  <div className="ds-paper-field"/>
  <div className="ds-proof-head" data-safe>
   <span>{unlock?'FREE DELIVERY KUANZIA '+tsh(example.freeAt):'STAKABADHI A · TSh'}</span>
   <h1>{unlock?<>Ongeza <em>bidhaa.</em></>:<>Bila <em>kuongeza.</em></>}</h1>
  </div>
  {unlock?<Reveal f={f} at={beats.unlock.threshold} className="ds-threshold">
   <div className="ds-meter-label" data-safe><b>{complete?'KIWANGO KIMEFIKIWA':`IMEBAKI ${tsh(before.remaining)}`}</b><span>{tsh(complete?after.subtotal:before.subtotal)}</span></div>
   <div className="ds-meter"><div style={{width:`${pct*100}%`}}/></div>
  </Reveal>:<div className="ds-proof-deck" data-safe><i/>Delivery bado inalipwa.</div>}
  <svg className="ds-receipt-register" viewBox="0 0 850 620" aria-hidden="true"><path d="M12 74V16h52m760 0h21v51m-5 483v47h-57m-735 0H12v-46" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
  <div className="ds-receipt-shadow" style={{transform:`translateY(${(1-ease(f,0,21))*(unlock?9:31)}px)`}}>
   <article className="ds-receipt" data-safe>
    <div className="ds-receipt-top"><b>CHECKOUT {unlock?'B':'A'}</b><span>MFANO · TSh</span></div>
    <div className="ds-receipt-items">
     <Row f={f} at={unlock?0:beats.basket.basket} label="Basket ya mwanzo" value={before.subtotal}/>
     {unlock&&<Row f={f} at={beats.unlock.add} label="Bidhaa ya ziada" value={example.addOn} accent/>}
     <Row f={f} at={b.fee} label="Delivery" value={current.delivery} accent={unlock}/>
    </div>
    <div className="ds-receipt-total">
     <Reveal f={f} at={b.total} className="ds-total-content" rise={17}>
      <span>Jumla</span><b><small>{example.currency}</small> {num(current.total)}</b>
     </Reveal>
    </div>
    <div className="ds-receipt-foot" aria-hidden="true"><i/><span>ALTRAWARE / BUSINESS MATH</span></div>
   </article>
  </div>
 </>;
}

function Compare({f}:{f:number}){
 const b=beats.compare;const p=ease(f,b.delta,b.delta+26);
 return <>
  <div className="ds-night-shape"/>
  <div className="ds-proof-head" data-safe><span>MFANO · JUMLA ZA CHECKOUT</span><h1>Tofauti <em>ni nini?</em></h1></div>
  <div className="ds-two-totals" data-safe>
   {[[before.total,'A / BILA ADD-ON',b.a],[after.total,'B / NA ADD-ON',b.b]].map(([value,label,at],i)=><Reveal key={label} f={f} at={Number(at)} className={i?'ds-mini-total alternate':'ds-mini-total'}>
     <span>{label}</span><b><small>{example.currency}</small> {num(Number(value))}</b>
   </Reveal>)}
  </div>
  <svg className="ds-bridge" viewBox="0 0 848 87" aria-hidden="true"><path d="M208 0v36h432V0m-216 36v50" pathLength="1" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="1" strokeDashoffset={1-p}/></svg>
  <Reveal className="ds-verdict" f={f} at={b.delta} rise={18}>
   <b data-safe><small>{example.currency}</small> +{num(delta)}</b>
   <div data-safe>zaidi <Reveal f={f} at={b.item} rise={9}><span>+ bidhaa ya ziada</span></Reveal></div>
  </Reveal>
  <Reveal f={f} at={b.ask} className="ds-decision" rise={11}><em data-safe>Ulikuwa unaihitaji?</em></Reveal>
 </>;
}

function Close({rig,mouth,f,abs}:{rig:Rig;mouth:string;f:number;abs:number}){
 const b=beats.close;
 return <>
  <Portrait rig={rig} f={f} abs={abs} mouth={mouth} opening={false} still={false}/>
  <div className="ds-close-head" data-safe><span>TIP KWA MUUZAJI</span><h1>Unauza <em>online?</em></h1></div>
  <div className="ds-seller-notes" data-safe>
   <Reveal f={f} at={b.limit} className="ds-seller-note"><i>01</i><b>Onyesha limit ya<br/>free delivery.</b></Reveal>
   <Reveal f={f} at={b.total} className="ds-seller-note"><i>02</i><b>Onyesha total<br/>mapema.</b></Reveal>
  </div>
  <Reveal f={f} at={b.cta} duration={19} className="ds-cta" rise={26}>
   <div data-safe><span>COMMENT</span><strong>TOTAL</strong><b>Worksheet ya bure</b></div><i aria-hidden="true">↗</i>
  </Reveal>
 </>;
}

export function Story({shots,rig,mouth,cover=false}:Props){
 const abs=useCurrentFrame();
 const s=cover?shots[0]:shots.find(q=>q.start<=abs&&abs<q.end);
 if(!s)throw new Error(`No shot at frame ${abs}`);
 const f=cover?375:abs-s.start;
 return <AbsoluteFill className={`ds-root ds-${s.shot}`} lang="sw">
  <Ground/>
  {s.shot==='hook'?<Hook rig={rig} mouth={mouth} f={f} abs={abs} cover={cover}/>:null}
  {s.shot==='basket'||s.shot==='unlock'?<Receipt f={f} unlock={s.shot==='unlock'}/>:null}
  {s.shot==='compare'?<Compare f={f}/>:null}
  {s.shot==='close'?<Close rig={rig} mouth={mouth} f={f} abs={abs}/>:null}
  <Mark shot={s.shot}/>
 </AbsoluteFill>;
}
