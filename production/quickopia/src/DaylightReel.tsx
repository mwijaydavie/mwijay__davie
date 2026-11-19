import React from 'react';
import {AbsoluteFill, Html5Audio, Img, useCurrentFrame} from 'remotion';
import project from '../project.json';
import {asset, Draw, ease, Mark, type ReelProps} from './Quickopia';
import './daylight.css';

const chapters:Record<string,{label:string;title:[string,string];step:number}> = {
  hook:{label:'QUICKOPIA / MFUMO WA DUKA',title:['Kikapu','si oda.'],step:0},
  catalog:{label:'01 / KATEGORIA',title:['Chagua','kategoria.'],step:0},
  cart:{label:'02 / KIKAPU',title:['Badili','idadi.'],step:1},
  gate:{label:'03 / HALI YA CHECKOUT',title:['Checkout','imefungwa.'],step:2},
  cta:{label:'TAZAMA MFUMO',title:['Andika',project.keyword],step:2},
};

function Mast({p}:{p:number}) {
  return <header className="qd-mast">
    <div className="qd-brand"><div className="qd-app"><Mark p={p} id="daylight-mast"/></div><span>Quickopia</span></div>
    <div className="qd-maker"><Img src={asset('altraware.png')} alt=""/><span>Altraware</span></div>
  </header>;
}

function Thread({step,p}:{step:number;p:number}) {
  const nodes=[134,425,716];
  const cursor=step===0?nodes[0]:nodes[step-1]+(nodes[step]-nodes[step-1])*ease(p,.08,.60);
  return <div className="qd-thread" aria-hidden>
    <svg viewBox="0 0 850 36">
      <path d="M134 17H716" stroke="#C3CAD3" strokeWidth="3" strokeDasharray="5 8"/>
      <path d={`M134 17H${cursor}`} stroke="var(--qd-orange)" strokeWidth="5" strokeLinecap="round"/>
      {nodes.map((x,i)=><circle key={x} cx={x} cy="17" r={i===step?9:6.5} fill={i<=step?'#FF6B18':'#fff'} stroke={i<=step?'#963708':'#7E8A99'} strokeWidth="2"/>)}
      {step>0&&cursor<nodes[step]&&<circle cx={cursor} cy="17" r="6" fill="var(--qd-orange)"/>}
    </svg>
    <div>{['Kategoria','Kikapu','Checkout'].map((s,i)=><span className={step===i?'current':''} key={s}>{s}</span>)}</div>
  </div>;
}

function CatalogProof({p}:{p:number}) {
  return <div className="qd-card qd-catalog">
    <div className="qd-bar"><span className="qd-evidence"><i/>UI HALISI</span><b>Zote imechaguliwa</b></div>
    <div className="qd-catalog-photo">
      <Img src={asset('catalog.png')} alt="Screenshot ya kategoria za Quickopia. Zote imechaguliwa."/>
      <svg viewBox="0 0 851 316" aria-hidden>
        <Draw d="M19 66H267Q277 66 277 81V293Q277 308 262 308H18Q4 308 4 293V82Q4 66 19 66Z"
          length={1026} p={p} width={5} ink="var(--qd-orange)"/>
      </svg>
    </div>
  </div>;
}

function CartProof({p}:{p:number}) {
  const roll=ease(p,.44,.65);
  const press=ease(p,.34,.44)*(1-ease(p,.45,.70));
  return <div className="qd-card qd-cart">
    <div className="qd-bar"><span className="qd-evidence"><i/>KITUFE HALISI</span><Img src={asset('cart-nav.png')} alt="Kitufe cha Kikapu kwenye nav ya Quickopia."/></div>
    <div className="qd-example">
      <span className="qd-example-label">MFANO WA KIKAPU</span>
      <svg viewBox="0 0 784 125" role="img" aria-label={roll<.5?'Mfano wa idadi: moja':'Mfano wa idadi: mbili'}>
        <defs><clipPath id="qd-number"><rect x="265" y="8" width="254" height="108" rx="10"/></clipPath></defs>
        <rect x="2" y="4" width="780" height="116" rx="22" fill="#fff" stroke="#B6C3D4" strokeWidth="3"/>
        <path d="M257 5v114M527 5v114" stroke="#B6C3D4" strokeWidth="3"/>
        <rect x="533" y="10" width="242" height="104" rx="16" fill="#FFDECA" opacity={.42+.58*press}/>
        <circle cx="654" cy="62" r={23+28*press} fill="none" stroke="var(--qd-orange)" strokeWidth="3" opacity={press}/>
        <path d="M111 62h34m492 0h34m-17-17v34" stroke="var(--qd-navy)" strokeWidth="5.5" strokeLinecap="round"/>
        <g clipPath="url(#qd-number)" fill="var(--qd-navy)" fontFamily="Inter Variable" fontSize="70" fontWeight="800" textAnchor="middle">
          <text x="392" y={86-70*roll} opacity={1-roll}>1</text>
          <text x="392" y={86+70*(1-roll)} opacity={roll}>2</text>
        </g>
      </svg>
    </div>
  </div>;
}

function GateProof({p}:{p:number}) {
  return <div className="qd-card qd-gate">
    <div className="qd-gate-head">
      <div className="qd-lock" aria-hidden><svg viewBox="0 0 100 100">
        <rect x="22" y="44" width="56" height="42" rx="10" fill="#FFDEC7" stroke="var(--qd-navy)" strokeWidth="5"/>
        <Draw d="M34 44V32a16 16 0 0 1 32 0v12" length={75} p={ease(p,.05,.38)} ink="var(--qd-navy)" width={5}/>
        <path d="M50 59v12" stroke="var(--qd-navy)" strokeWidth="5" strokeLinecap="round"/>
      </svg></div>
      <div><span className="qd-evidence"><i/>HALI YA PREVIEW</span><strong>Oda haitumwi.</strong></div>
    </div>
    <div className="qd-notice">
      <Img src={asset('notice.png')} alt="Hili ni duka la majaribio; checkout bado haijafunguliwa."/>
      <svg viewBox="0 0 584 45" aria-hidden><Draw d="M278 36H549" length={271} p={ease(p,.27,.62)} width={2.7} ink="var(--qd-orange)"/></svg>
    </div>
  </div>;
}

function EndCard({p}:{p:number}) {
  return <div className="qd-card qd-end">
    <div className="qd-end-mark"><Mark id="daylight-end" p={p}/></div>
    <div><span className="qd-evidence"><i/>KWENYE MAONI</span><strong>Ona mfumo.</strong><p>Preview tu. Checkout imefungwa.</p></div>
    <svg className="qd-end-arrow" aria-hidden viewBox="0 0 92 45"><Draw d="M3 22h79m-15-15 15 15-15 15" length={122} p={ease(p,.23,.48)} width={4} ink="var(--qd-orange)"/></svg>
  </div>;
}

export function DaylightReel({cues,durationInFrames,cover=false}:ReelProps) {
  const frame=useCurrentFrame();
  const cuts=cues.map((_,i)=>i===0?0:cues[i-1].captionEnd!);
  const i=cuts.reduce((a,cut,i)=>frame>=cut?i:a,0);
  const cue=cues[i];
  const scene=chapters[cue.shot];
  const p=Math.min(1,Math.max(0,(frame-cue.start)/(cue.end-cue.start)));
  const intro=cover?1:Math.min(1,.12+frame/90);
  const select=cue.shot==='catalog'?1:.36+.64*ease(p,.08,.45);
  const showCaption=!cover&&frame>=cue.start&&frame<cue.captionEnd!;
  const line=cover?1:.22+.78*ease(frame-cuts[i],0,31);
  return <AbsoluteFill className={`qd qd-${cue.shot}`}>
    {!cover&&<Html5Audio src={asset('narration.wav')}/>}
    <svg className="qd-orbits" viewBox="0 0 1080 1920" aria-hidden>
      <path d="M828 169C715 327 825 447 1004 460C1183 473 1199 719 1024 803M857 207C754 345 850 416 1008 430C1200 446 1221 722 1055 810" stroke="#F4D7C2" strokeWidth="2.7" fill="none"/>
      <circle cx="1005" cy="459" r="10" fill="#FFD7BA"/>
      <path d="M-24 1540c230 64 190 239 390 280" fill="none" stroke="#E9EDF3" strokeWidth="3"/>
    </svg>
    <Mast p={intro}/>
    <section className="qd-title">
      <div className="qd-kicker"><i/>{scene.label}</div>
      <h1>{scene.title[0]}<br/><em>{scene.title[1]}<svg className="qd-underline" viewBox="0 0 280 16" preserveAspectRatio="none" aria-hidden><Draw d="M5 10Q142 1 275 7" length={271} p={line} width={6} ink="var(--qd-orange)"/></svg></em></h1>
    </section>
    <div className="qd-art">
      {cue.shot==='hook'||cue.shot==='catalog'?<CatalogProof p={select}/>:cue.shot==='cart'?<CartProof p={p}/>:cue.shot==='gate'?<GateProof p={p}/>:<EndCard p={.13+.87*p}/>}
    </div>
    {cue.shot!=='cta'&&<Thread step={scene.step} p={p}/>}
    {showCaption&&<aside className="qd-caption" lang="sw">{cue.sw.map((x)=><span key={x}>{x}</span>)}</aside>}
    {!cover&&<div className="qd-progress" aria-hidden><div style={{width:`${100*(frame+1)/durationInFrames}%`}}/></div>}
  </AbsoluteFill>;
}
