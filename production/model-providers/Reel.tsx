import React from 'react';
import {AbsoluteFill,Easing,Img,Sequence,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/jetbrains-mono';
import './reel.css';

export type Shot={shot:string;start:number;end:number;voiceStart:number;voiceEnd:number};
export type Proof={first:{status:number;t:number};limited:{status:number;t:number};recovered:{status:number;t:number};policy:{action:string;after:number;notBefore:number}};
export type Props={scenes:Shot[];demo:Proof;cover?:boolean};
const src=(file:string)=>staticFile(`models/${file}`);
const map=(n:number,a:number,b:number)=>interpolate(n,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.19,1,.22,1)});
const tagShape='M16 12Q45-1 81 9L98 14Q108 22 108 41L109 69Q105 94 84 100Q56 111 27 102Q9 97 6 77L6 38Q7 21 16 12Z';
const markNames={deepseek:'DeepSeek',claude:'Claude',zai:'Z.AI / GLM',qwen:'Qwen',gemini:'Gemini',openrouter:'OpenRouter',ollama:'Ollama'};
export type BrandKey=keyof typeof markNames;
function Logo({id,size,at=0,tilt=0,seal=true,style}:{id:BrandKey;size:number;at?:number;tilt?:number;seal?:boolean;style?:React.CSSProperties}){
 const f=useCurrentFrame();const {fps}=useVideoConfig();const n=f-at;
 const s=spring({frame:n,fps,durationInFrames:38,config:{mass:.69,damping:15,stiffness:175}});
 return <span className={`mp-logo ${seal?'mp-die':''}`} style={{width:size,height:size,opacity:map(n,0,11),transform:`translateY(${(1-s)*15}px) rotate(${tilt-(1-s)*14}deg) scale(${.73+.27*s})`,...style}}>
  {seal&&<svg viewBox="0 0 114 114" aria-hidden="true"><path d={tagShape} fill="#fffaf4" stroke="#fff" strokeWidth="4" strokeLinejoin="round"/></svg>}
  <Img src={src(`${id}.svg`)} alt={markNames[id]}/>
 </span>;
}
const icons={
 key:['M35 62a22 22 0 1 1 17-19l26 26-9 9-5-5-7 7-7-7-7 7-7-7-6-6z','M31 39a5 5 0 1 0-.1-10 5 5 0 0 0 .1 10z'],
 radar:['M16 74a35 35 0 0 1 70 0z','M50 69l22-24','M27 61l4 4m19-21v7m22 10-5 5','M50 70v4'],
 code:['M37 32 16 50l21 18m26-36 21 18-21 18M56 24 44 76'],
 lock:['M32 44V33a18 18 0 0 1 36 0v11M24 44h52v37H24z','M50 59v10'],
 doc:['M26 17h34l16 16v50H26zM60 17v16h16','M38 48h25M38 59h25M38 70h16'],
};
function Ink({name,n,at=0,className='',style}:{name:keyof typeof icons;n:number;at?:number;className?:string;style?:React.CSSProperties}){
 return <svg viewBox="0 0 100 100" aria-hidden="true" className={className} style={style}><path d="M32 4Q69-4 88 19Q102 33 95 67Q92 88 69 96Q37 105 15 87Q0 72 5 40Q8 15 32 4Z" fill="var(--sticker,#f9dda1)" stroke="#fffdf8" strokeWidth="3"/><g fill="none" stroke="var(--line,#222042)" strokeWidth="4.3" strokeLinecap="round" strokeLinejoin="round">{icons[name].map((d,i)=><path key={d} d={d} pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-map(n-at,4*i,35+6*i))}/>)}</g></svg>;
}
function Brand({light=false}:{light?:boolean}){return <div className={`mp-brand ${light?'light':''}`}><Img src={src('altraware.png')} alt=""/><strong>ALTRAWARE</strong><span>TECH TIP / MODELS</span></div>;}
const Kicker=({children}:{children:React.ReactNode})=><div className="mp-kicker"><i/>{children}</div>;
function Heading({label,children,sub}:{label:string;children:React.ReactNode;sub?:string}){return <header className="mp-heading"><Kicker>{label}</Kicker><h1>{children}</h1>{sub&&<p>{sub}</p>}</header>;}
function Reveal({at=0,children,className='',style}:{at?:number;children:React.ReactNode;className?:string;style?:React.CSSProperties}){
 const f=useCurrentFrame();const t=map(f,at,at+24);
 return <div className={className} style={{opacity:t,transform:`translateY(${(1-t)*26}px)`,...style}}>{children}</div>;
}
function Hook({cover=false}:{cover?:boolean}){
 const f=useCurrentFrame();const line=cover?1:map(f,138,189);const verdict=cover?1:map(f,209,247);
 return <AbsoluteFill className="mp-stage mp-hook">
  <Img src={src('key-desk.jpg')} className="mp-key-photo" alt="Illustrative brass key on drafting paper" style={{transform:`scale(${1.015+.06*map(f,0,400)})`}}/>
  <div className="mp-key-grade"/>
  <Brand light/>
  <Heading label="MODEL PROVIDERS">Free AI<br/><em>API key?</em></Heading>
  <div className="mp-round-line" style={{opacity:line}}><svg viewBox="0 0 282 180" aria-hidden="true"><path d="M81 11c-75 21-105 92-48 132 64 44 173 24 215-20 41-42 29-82-12-106C187-12 124 10 98 18" pathLength="100" strokeDasharray="100 103" strokeDashoffset={100*(1-line)} fill="none" stroke="#ffdf93" strokeWidth="5" strokeLinecap="round"/></svg><span>KEY ≠ USAGE</span></div>
  <div className="mp-hook-claim" style={{opacity:verdict,transform:`rotate(-3deg) translateY(${(1-verdict)*16}px)`}}>Unlimited? <strong>Check usage.</strong></div>
  <div className="mp-hook-brands">{(['deepseek','claude','zai','qwen'] as BrandKey[]).map((id,i)=><div key={id}><Logo id={id} size={94} at={cover?0:46+i*20} tilt={i%2?7:-9}/><b>{markNames[id]}</b></div>)}</div>
  {cover&&<div className="mp-cover-blurb">16 routes · PDF ya bure</div>}
 </AbsoluteFill>;
}
function Checks(){
 const f=useCurrentFrame();
 const tabs=[{name:'Model ID',text:'Variant ipi hasa?',at:66,rotate:-2},{name:'Rate limit',text:'RPM / tokens / daily cap',at:195,rotate:1.8},{name:'Billing',text:'Provider gani? Nani analipa?',at:302,rotate:-1.3}];
 return <AbsoluteFill className="mp-stage mp-checks"><div className="mp-check-grid"/><div className="mp-yellow-rip"/>
  <Brand/><Heading label="01 / KABLA YA KU-CONNECT">Check hizi<br/><em>tatu.</em></Heading>
  <Reveal at={21} className="mp-call-chain"><b>App / tool</b><span>→</span><b>Provider API</b><span>→</span><b>Model</b></Reveal>
  <div className="mp-tags">{tabs.map((x,i)=>{const p=map(f,x.at,x.at+32);return <div key={x.name} className={'mp-tag '+(p>.7?'tag-on':'')} style={{transform:`translateX(${(p-1)*65}px) rotate(${x.rotate}deg)`}}><span>0{i+1}</span><div><b>{x.name}</b><small>{x.text}</small></div><i>{p>.68?'✓':'·'}</i></div>;})}</div>
  <Ink name="key" n={f} at={65} className="mp-check-icon"/>
 </AbsoluteFill>;
}
function Pricing(){
 const f=useCurrentFrame(); const meter=map(f,180,271);
 return <AbsoluteFill className="mp-stage mp-pricing"><div className="mp-receipt-grid"/>
  <Brand light/><Heading label="02 / OFFICIAL API PRICING">Free chat<br/><em>si free API.</em></Heading>
  <div className="mp-receipts">{(['deepseek','claude'] as BrandKey[]).map((id,i)=><Reveal className={`mp-receipt r${i}`} key={id} at={i?82:22}><div className="mp-receipt-head"><Logo id={id} size={85} at={i?84:24} tilt={i?10:-10}/><b>{markNames[id]}</b></div><div className="mp-dash"/><b className="mp-meter-tag">DIRECT API</b><p>Input tokens<br/>Output tokens</p><div className="mp-meter-lines"><span style={{width:`${24+meter*(i?65:60)}%`}}/><span style={{width:`${20+meter*(i?45:58)}%`}}/></div></Reveal>)}</div>
  <Reveal className="mp-priced-note" at={293}>TOKEN PRICING · CHECK STARTER CREDITS</Reveal>
 </AbsoluteFill>;
}
function Glm(){
 const f=useCurrentFrame();const p=map(f,185,215);
 return <AbsoluteFill className="mp-stage mp-glm"><div className="mp-glm-flash"/><Brand/>
  <Heading label="03 / Z.AI · EXACT MODEL ID" sub="Check variant, si jina tu.">Flash <em>≠</em><br/>Flash.</Heading>
  <Logo id="zai" size={178} at={31} tilt={13} style={{position:'absolute',left:670,top:494}}/>
  <Reveal className="mp-model-row model-free" at={42}><small>DOCS: FREE</small><b>GLM-4.7-Flash</b><span>01</span></Reveal>
  <Reveal className="mp-model-row model-metered" at={148}><small>DOCS: TOKEN PRICING</small><b>GLM-5.3-Flash</b><span>02</span></Reveal>
  <div className="mp-glm-date" style={{opacity:p}}>PRICING DOCS · 18 NOV 2026</div>
 </AbsoluteFill>;
}
function Local(){
 const f=useCurrentFrame();
 return <AbsoluteFill className="mp-stage mp-local">
  <Img src={src('local-desk.jpg')} className="mp-laptop-photo" alt="Illustrative laptop on a workbench" style={{transform:`scale(${1.025+.05*map(f,0,450)})`}}/>
  <div className="mp-local-grade"/>
  <Brand/><Heading label="04 / QWEN">Hosted<br/><em>au local?</em></Heading>
  <Logo id="qwen" size={153} at={27} tilt={12} style={{position:'absolute',left:660,top:585}}/>
  <div className="mp-branches"><svg viewBox="0 0 765 74" aria-hidden="true"><path d="M382 2v18q0 16-17 16H102q-22 0-22 33M382 20q0 16 17 16h263q22 0 22 33" fill="none" stroke="#442c7b" strokeWidth="4.5" pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-map(f,95,154))} strokeLinecap="round"/></svg>
   <div><Reveal at={86} className="mp-branch-hosted"><Ink name="code" n={f} at={100} className="mp-branch-icon"/><b>Hosted API</b><span>PLAN + QUOTA</span></Reveal>
   <Reveal at={183} className="mp-branch-local"><Logo id="ollama" size={69} at={189} tilt={5} seal={false}/><b>Local · Ollama</b><span>RAM + STORAGE</span></Reveal></div>
  </div>
  <Reveal className="mp-local-proof" at={273}>ILLUSTRATION · CHECK MODEL SIZE</Reveal>
 </AbsoluteFill>;
}
function Start(){
 const f=useCurrentFrame();
 return <AbsoluteFill className="mp-stage mp-start"><div className="mp-start-curve" style={{transform:`rotate(${5+7*Math.sin(f/190)}deg)`}}/><Brand/>
  <Heading label="05 / PICK A TEST ROUTE">Demo?<br/><em>Anza hapa.</em></Heading>
  <div className="mp-start-options">
   <Reveal at={50} className="mp-option"><Logo id="gemini" size={98} at={51} tilt={-8}/><div><b>Gemini API</b><span>Selected models · free tier</span></div></Reveal>
   <Reveal at={132} className="mp-option"><Logo id="openrouter" size={98} at={133} tilt={7}/><div><b>OpenRouter</b><span><code>:free</code> variants · capped</span></div></Reveal>
  </div>
  <Reveal at={241} className="mp-start-nudge"><b>Dummy data</b> kwanza <i/> Check data policy</Reveal>
 </AbsoluteFill>;
}
function Demo({demo}:{demo:Proof}){
 const f=useCurrentFrame();const countdown=Math.max(0,demo.policy.after-Math.floor((f-209)/60));
 return <AbsoluteFill className="mp-stage mp-demo"><div className="mp-demo-grid"/><Brand light/>
  <Heading label="06 / LOCAL MOCK · NO LIVE API">429?<br/><em>Wait.</em></Heading>
  <div className="mp-terminal"><div className="mp-term-title"><b>RATE LIMIT DEMO</b><span>LOCAL</span></div>
   <Reveal at={45} className="mp-term-row"><span>Request 01</span><b>{demo.first.status} OK</b></Reveal>
   <Reveal at={135} className="mp-term-row limited"><span>Request 02</span><b>{demo.limited.status} LIMIT</b></Reveal>
   <Reveal at={205} className="mp-term-wait"><code>Retry-After: {demo.policy.after}</code><span>{f<329?`WAIT ${Math.min(demo.policy.after,countdown)}s`:'DONE'}</span></Reveal>
   <Reveal at={329} className="mp-term-row"><span>One retry</span><b>{demo.recovered.status} OK</b></Reveal>
  </div>
  <Reveal at={362} className="mp-demo-secret"><Ink name="lock" n={f} at={362}/><b>Key ibaki server-side.</b></Reveal>
 </AbsoluteFill>;
}
function Cta(){
 const f=useCurrentFrame();const p=map(f,26,76);
 return <AbsoluteFill className="mp-stage mp-cta"><div className="mp-cta-rip"/><Brand/>
  <Heading label="FREE PDF · 16 ROUTES">Comment<br/><em>MODEL</em></Heading>
  <div className="mp-pdf-pile" style={{opacity:p,transform:`rotate(${5+8*(1-p)}deg) translate(${(1-p)*47}px,${(1-p)*32}px)`}}><Img className="mp-pdf-back" src={src('guide-en.png')} alt="English guide cover"/><Img className="mp-pdf-front" src={src('guide-sw.png')} alt="Swanglish guide cover"/></div>
  <div className="mp-cta-lede">Free <strong>provider</strong><br/>guide.</div>
  <Reveal className="mp-cta-language" at={95}>SWANGLISH + ENGLISH</Reveal>
  <Reveal className="mp-cta-extra" at={181}>Official links <i/> Setup <i/> Checklist</Reveal>
  <Ink name="doc" n={f} at={74} style={{position:'absolute',left:725,top:1083,width:133,transform:'rotate(8deg)'}}/>
 </AbsoluteFill>;
}
const shots={hook:Hook,checks:Checks,pricing:Pricing,glm:Glm,local:Local,start:Start,demo:Demo,cta:Cta};
export function Providers({scenes,demo,cover}:Props){
 const f=useCurrentFrame(); const index=cover?0:scenes.findIndex(s=>f>=s.start&&f<s.end);
 const shot=scenes[Math.max(0,index)];const Comp=shots[shot.shot as keyof typeof shots];
 return <AbsoluteFill className="mp-root">
   <Sequence key={shot.shot} from={shot.start} durationInFrames={shot.end-shot.start} layout="none"><Comp demo={demo} cover={cover}/></Sequence>
   {!cover&&<div className={`mp-progress ${['hook','pricing','demo'].includes(shot.shot)?'on-dark':''}`} aria-hidden="true">{scenes.map((s,i)=><i key={s.shot} style={{opacity:i===index?1:i<index?.38:.19}}/>)}</div>}
 </AbsoluteFill>;
}
