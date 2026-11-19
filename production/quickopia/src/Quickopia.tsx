import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import project from '../project.json';

export type Cue = {shot:string; sw:string[]; en:string[]; start:number; end:number; captionEnd?:number};
export type ReelProps = {cues:Cue[]; durationInFrames:number; cover?:boolean};
export const names = ['hook','catalog','locale','cart','gate','help','cta'];
const copy:Record<string,{tag:string;title:[string,string];sub:string;light?:boolean}> = {
  hook:{tag:'QUICKOPIA / SOFTWARE WALKTHROUGH',title:['Cart si','oda.'],sub:'Tazama tofauti kwenye mfumo wa Quickopia.'},
  catalog:{tag:'01 / CATALOG',title:['Chagua','kategoria.'],sub:'Kwenye preview hii, “Zote” imechaguliwa.',light:true},
  locale:{tag:'UI / LUGHA',title:['EN na SW','kwenye nav.'],sub:'Hapa, preview inaonyesha Kiswahili.',light:true},
  cart:{tag:'02 / KIKAPU',title:['Kikapu cha','chaguo.'],sub:'Idadi kwenye cart haimaanishi oda imetumwa.'},
  gate:{tag:'03 / HALI YA CHECKOUT',title:['Checkout','imefungwa.'],sub:'Preview inasema wazi kabla ya kuagiza.',light:true},
  help:{tag:'UI / MSAADA',title:['Msaada','ndani ya UI.'],sub:'Mada za kuchagua, si chatbot ya AI.',light:true},
  cta:{tag:'QUICKOPIA / SOFTWARE PREVIEW',title:['Comment',project.keyword],sub:'Nikutumie link ya kuangalia mfumo.'},
};
const options = {extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)} as const;
export const ease = (p:number,a:number,b:number) => interpolate(p,[a,b],[0,1],options);
export const asset = (name:string) => staticFile(`quickopia/${name}`);
const lift = (p:number,a:number,b:number):React.CSSProperties => {
  const k=ease(p,a,b);
  return {opacity:k,transform:`translateY(${(1-k)*18}px)`};
};

export function Draw({d,length,p,width=7,ink='currentColor'}:{d:string;length:number;p:number;width?:number;ink?:string}) {
  if(p<=0)return null;
  return <path d={d} fill="none" stroke={ink} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray={p>=1?undefined:`${length} ${length}`} strokeDashoffset={length*(1-p)}/>;
}
export function Mark({p,id}:{p:number;id:string}) {
  // Reveal lanes follow the owner's logo crop; the visible pixels remain the original logo.
  const mask=`q-mark-${id}`;
  const strokes=ease(p,.025,.41), wheels=ease(p,.31,.48), box=ease(p,.11,.37);
  return <svg viewBox="0 0 104 86" aria-label="Quickopia logo from the website preview" className="quick-mark">
    <defs><mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="104" height="86">
      <Draw d="M11 23h13l11 35h33" length={91} p={strokes} width={10} ink="#fff"/>
      <Draw d="M30 38h45" length={45} p={ease(p,.09,.31)} width={8} ink="#fff"/>
      <Draw d="M35 48h38" length={38} p={ease(p,.14,.34)} width={8} ink="#fff"/>
      <rect x="31" y={37-33*box} width="43" height={33*box} fill="#fff"/>
      {[38,62].map(x=><circle key={x} cx={x} cy="74" r={10*wheels} fill="#fff"/>)}
      {[0,1,2].map(i=><Draw key={i} d={`M${84-i*4} ${38+i*10}h13`} length={13} p={ease(p,.22+.05*i,.39+.05*i)} width={9} ink="#fff"/>)}
      <rect width="104" height="86" fill="#fff" opacity={ease(p,.46,.58)}/>
    </mask></defs>
    <image href={asset('quickopia-icon.png')} width="104" height="86" mask={`url(#${mask})`}/>
  </svg>;
}
function Glyph({name,size=54,p=1}:{name:string;size?:number;p?:number}) {
  const paths:Record<string,string> = {
    catalog:'M7 10h42v36H7zM7 19h42M15 26h10v11H15zM32 26h10v11H32z',
    cart:'M6 13h44v30H6zM20 13v30m16-30v30M10 28h6m24 0h6m-3-3v6',
    help:'M7 9h42v32H23L13 50v-9H7zM15 20h24M15 28h17',
  };
  return <svg aria-hidden width={size} height={size} viewBox="0 0 56 56" fill="none">
    {name==='gate'?<><rect x="12" y="25" width="32" height="24" rx="5" stroke="currentColor" strokeWidth="3.4"/>
      <Draw d="M19 25V17a9 9 0 0 1 18 0v8" length={44.3} p={p} width={3.4}/><path d="M28 34v7" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round"/></>:<path d={paths[name]} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>}
  </svg>;
}
function Signal({p}:{p:number}) {
  const x=134+260*ease(p,.21,.48)+262*ease(p,.49,.81);
  return <svg className="signal" viewBox="0 0 790 54" aria-hidden>
    <path d="M134 29H656" stroke="currentColor" strokeOpacity=".34" strokeDasharray="5 9" strokeWidth="2.7"/>
    <path d={`M134 29H${x}`} stroke="var(--orange)" strokeWidth="3.6"/>
    {[134,394,656].map(v=><circle key={v} cx={v} cy="29" r="6" fill={v<=x?'var(--orange)':'currentColor'}/>)}
    <circle cx={x} cy="29" r={9+6*(1-ease(p,.33,.45))} fill="none" stroke="var(--orange)" strokeWidth="2" opacity={ease(p,.2,.4)}/>
  </svg>;
}
function Hero({p}:{p:number}) {
  return <div className="hero-art">
    <div className="logo-panel">
      <div className="mark-tile"><Mark p={p} id="hero"/></div>
      <div className="brand-reveal" style={lift(p,.19,.48)}><Img src={asset('quickopia-wordmark.png')} alt="Quickopia"/>
        <span className="mono">SOFTWARE / PREVIEW</span></div>
      <svg viewBox="0 0 220 104" className="lead-vector" aria-hidden>
        <path d="M0 28h104c38 0 39 53 75 53h31" stroke="currentColor" strokeOpacity=".24" fill="none" strokeDasharray="5 5" strokeWidth="2"/>
        <Draw d="M0 28h104c38 0 39 53 75 53h31" length={229} p={ease(p,.23,.71)} ink="var(--orange)" width={3}/>
        <circle cx="212" cy="81" r="7" fill="var(--orange)" opacity={ease(p,.54,.73)}/>
      </svg>
    </div>
    <div className="route-row">{[['catalog','Catalog'],['cart','Kikapu'],['gate','Checkout']].map(([name,label],i)=><div key={name} className={i===2?'closed':''} style={{opacity:.48+.52*ease(p,.22+.13*i,.44+.13*i)}}>
      <Glyph name={name} size={49} p={ease(p,.55,.79)}/><span>{label}</span>
    </div>)}</div>
    <Signal p={p}/>
    <div className="proof-tag mono">MCHORO WA WORKFLOW <b>CHECKOUT IMEFUNGWA</b></div>
  </div>;
}
function ReceiptTag({children}:{children:React.ReactNode}) {
  return <div className="receipt-tag mono"><i/>{children}</div>;
}
function Catalog({p,reel}:{p:number;reel:boolean}) {
  const f=ease(p,.31,.49), sweep=ease(p,.10,.34);
  return <div className="catalog-wrap">
    <div className="browser-panel">
      <ReceiptTag>SCREENSHOT / CATALOG YA PREVIEW</ReceiptTag>
      <div className="catalog-img">
        <Img src={asset('catalog.png')} alt="Quickopia category grid with Zote selected" style={{clipPath:`inset(0 ${reel?100*(1-sweep):0}% 0 0)`}}/>
        <div className="focus-box" style={{opacity:f,boxShadow:`0 0 0 ${Math.round((1-ease(p,.48,.64))*9)}px #ff6b1848`}}/>
      </div>
    </div>
    <div className="hint mono" style={lift(p,.57,.77)}><span className="hint-dot"/> ZOTE · HALI ILIYOCHAGULIWA</div>
  </div>;
}
function Locale({p}:{p:number}) {
  const focus=ease(p,.36,.55);
  return <div className="locale-art">
    <div className="locale-shot">
      <ReceiptTag>SCREENSHOT / NAVIGATION</ReceiptTag>
      <div className="locale-zoom" style={{transform:`translateY(${(1-ease(p,.08,.35))*17}px) scale(${.943+.057*ease(p,.10,.46)})`}}>
        <Img src={asset('locale.png')} alt="Original EN and SW controls with SW selected"/>
        <div className="locale-ring" style={{opacity:focus}}/>
      </div>
    </div>
    <div className="locale-label" style={lift(p,.42,.7)}><span className="mono">HALI YA PREVIEW</span><strong>SW</strong><p>Kiswahili</p></div>
  </div>;
}
function Cart({p}:{p:number}) {
  const step=ease(p,.44,.61), flash=ease(p,.37,.47)*(1-ease(p,.50,.67));
  return <div className="cart-art">
    <div className="nav-proof"><Img src={asset('cart-nav.png')} alt="Kikapu navigation button from the preview"/><span className="mono">KITUFE HALISI<span>KWENYE NAV</span></span></div>
    <div className="cart-arrow"><svg viewBox="0 0 61 38" width="61" height="38" fill="none" aria-hidden><Draw d="M3 19h49m-14-13 14 13-14 13" length={88} p={ease(p,.19,.44)} ink="var(--orange)" width={3.5}/></svg></div>
    <div className="sample-qty" style={lift(p,.09,.33)}>
      <span className="mono">MFANO WA CART</span>
      <div className="stepper mono"><i>−</i><b><span style={{opacity:1-step,transform:`translateY(${-35*step}px)`}}>1</span><span style={{opacity:step,transform:`translateY(${36*(1-step)}px)`}}>2</span></b><i style={{background:flash>.40?'#ff6b18':undefined}}>+</i></div>
      <p>Badili idadi.</p>
    </div>
    <p className="cart-note">Mchoro tu; si screenshot ya ndani ya cart.</p>
  </div>;
}
function Gate({p}:{p:number}) {
  return <div className="gate-art">
    <div className="browser-panel notice-panel">
      <ReceiptTag>SCREENSHOT / UJUMBE WA PREVIEW</ReceiptTag>
      <Img src={asset('notice.png')} alt="Original notice: Hili ni duka la majaribio; checkout bado haijafunguliwa."/>
      <div className="notice-line" style={{width:`${45*ease(p,.15,.45)}%`}}/>
    </div>
    <div className="gate-state" style={lift(p,.27,.54)}><Glyph name="gate" p={ease(p,.28,.66)}/><div><strong>Checkout ya website</strong><span>Haipokei oda kwa sasa.</span></div><b className="mono">IMEFUNGWA</b></div>
  </div>;
}
function Help({p}:{p:number}) {
  return <div className="help-art">
    <div className="help-shot" style={{clipPath:`inset(0 ${100*(1-ease(p,.05,.37))}% 0 0)`}}><Img src={asset('help.png')} alt="Quickopia help panel, topic chips and the notice that this is not AI"/></div>
    <div className="help-notes" style={lift(p,.32,.57)}><Glyph name="help" size={55}/><span className="mono">SCREENSHOT</span><strong>Mada za<br/>kuchagua.</strong><b className="mono" style={lift(p,.52,.70)}>SI AI BADO</b></div>
  </div>;
}
function Cta({p}:{p:number}) {
  return <div className="end-art">
    <div className="end-mark"><Mark p={p+.13} id="cta"/></div>
    <div className="end-caption" style={lift(p,.14,.44)}><span className="mono">UTAPATA LINK YA</span><strong>Walkthrough<br/>ya software.</strong><p>Preview tu.<br/>Checkout imefungwa.</p></div>
    <svg viewBox="0 0 102 49" className="cta-arrow" aria-hidden>
      <Draw d="M4 24h88M76 9l16 15-16 15" length={132} p={ease(p,.23,.59)} width={4} ink="var(--orange)"/>
    </svg>
  </div>;
}
function Art({name,p,reel}:{name:string;p:number;reel:boolean}) {
  switch(name){
    case 'hook':return <Hero p={p}/>;
    case 'catalog':return <Catalog p={p} reel={reel}/>;
    case 'locale':return <Locale p={p}/>;
    case 'cart':return <Cart p={p}/>;
    case 'gate':return <Gate p={p}/>;
    case 'help':return <Help p={p}/>;
    default:return <Cta p={p}/>;
  }
}
function Canvas({index,p,reel,settle,caption,progress,cover=false}:{index:number;p:number;reel:boolean;settle:number;caption?:string[];progress:number;cover?:boolean}) {
  const name=names[index], s=copy[name];
  return <AbsoluteFill className={`quick-canvas ${reel?'quick-reel':'quick-slide'} ${s.light?'is-light':'is-dark'} shot-${name}`}>
    <div className="layout-grid" aria-hidden style={{transform:`translateY(${-23*p}px)`}}/>
    <header className="q-mast"><div><Img src={asset('altraware.png')} alt=""/>Altraware Technology</div><span className="mono">BUILD NOTES / 03</span></header>
    <section className="q-title" style={{transform:`translateY(${(1-settle)*21}px)`,opacity:.71+.29*settle}}>
      <div className="q-kicker mono"><i/>{s.tag}</div><h1>{s.title[0]}<br/><em>{s.title[1]}</em></h1><p>{s.sub}</p>
    </section>
    <div className="q-art" style={{transform:`translateY(${(1-settle)*23}px)`}}><Art name={name} p={p} reel={reel}/></div>
    {caption&&!cover&&<aside className="q-caption" lang="sw">{caption.map((x,i)=><span key={i}>{x}</span>)}</aside>}
    {!cover&&<footer className="q-foot mono"><span>QUICKOPIA / UI WALKTHROUGH</span><div className="q-ticks">{names.map((x,i)=><i key={x} className={i<=index?'seen':''}/>)}</div><span>{String(index+1).padStart(2,'0')} / 07</span><div className="q-progress"><i style={{width:`${100*progress}%`}}/></div></footer>}
  </AbsoluteFill>;
}
export function Carousel(){
  const frame=useCurrentFrame();
  return <Canvas index={frame} p={1} reel={false} settle={1} progress={(frame+1)/names.length}/>;
}
export function Reel({cues,durationInFrames,cover=false}:ReelProps){
  const frame=useCurrentFrame(), {fps}=useVideoConfig();
  const starts=cues.map((c,i)=>i===0?0:Math.max(cues[i-1].end,c.start-5));
  const index=starts.reduce((a,t,i)=>frame>=t?i:a,0);
  const cue=cues[index];
  const p=Math.max(0,Math.min(1,(frame-cue.start)/(cue.end-cue.start)));
  const settle=Math.max(0,Math.min(1,spring({frame:frame-starts[index],fps,config:{damping:17,mass:.7,stiffness:136}})));
  const show=frame>=cue.start&&(frame<cue.end||index===names.length-1);
  return <>
    {!cover&&<Html5Audio src={asset('narration.wav')}/>}
    <Canvas index={index} p={p} reel settle={settle} progress={(frame+1)/durationInFrames} caption={show?cue.sw:undefined} cover={cover}/>
  </>;
}
