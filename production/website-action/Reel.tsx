import React from 'react';
import {AbsoluteFill,Easing,Img,Sequence,interpolate,spring,staticFile,useCurrentFrame} from 'remotion';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './reel.css';

type Box={x:number;y:number;w:number;h:number};
export type Cut={shot:string;start:number;end:number};
export type Props={shots:Cut[];button:Box;input:Box;cover?:boolean};
const asset=(name:string)=>staticFile(`website-action/${name}`);
const ease=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.2,.9,.25,1)});
const push=(f:number,at:number)=>spring({frame:f-at,fps:60,durationInFrames:37,config:{mass:.72,damping:17,stiffness:157}});

const plate='M548 192C733 185 888 261 942 385C1000 516 965 641 864 738C754 837 599 884 439 842C299 818 190 747 135 635L75 738Q64 749 43 738Q33 734 39 717L116 578C83 470 133 359 218 290C306 220 424 192 548 192Z';
function Plate({id,style}:{id:string;style:React.CSSProperties}){
 return <svg className="wa-plate" viewBox="25 172 970 712" aria-hidden="true" style={style}><defs><clipPath id={`wa-${id}`}><path d={plate}/></clipPath></defs>
 <path d={plate} fill="#efe1cb" stroke="#fff0d8" strokeWidth="16" strokeLinejoin="round"/><image href={asset('pilau-art.png')} width="1024" height="1024" clipPath={`url(#wa-${id})`}/></svg>;
}
function Maker({light=false}:{light?:boolean}){return <div className={`wa-maker ${light?'on-dark':''}`}><Img src={asset('altraware.png')} alt=""/><b>ALTRAWARE</b><i/>WEBSITE BUILD</div>;}
function Title({label,children}:{label:string;children:React.ReactNode}){return <header className="wa-heading"><span className="wa-kicker"><i/>{label}</span><h1>{children}</h1></header>;}
function Draw({path,box,amount,stroke='#f26522',style,width=6}:{path:string;box:string;amount:number;stroke?:string;style:React.CSSProperties;width?:number}){
 return <svg className="wa-draw" viewBox={box} aria-hidden="true" style={style}><path d={path} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-amount)}/></svg>;
}
function Hook({cover=false}:{cover?:boolean}){
 const f=useCurrentFrame();const plateIn=cover?1:ease(f,0,56);const underline=cover?1:ease(f,75,148);const payoff=cover?1:ease(f,184,218);
 return <AbsoluteFill className="wa-scene wa-hook">
  <div className="wa-grain"/>
  <div className="wa-spokes"/>
  <Plate id="hook" style={{left:240,top:708,width:960,opacity:.67+.33*plateIn,transform:`translate(${(1-plateIn)*65}px,${(1-plateIn)*50}px) rotate(${12-18*plateIn}deg) scale(${.94+.08*plateIn+.02*ease(f,120,355)})`}}/>
  <div className="wa-hook-vignette"/>
  <Maker light/>
  <Title label={cover?'BONGO FOODIE · WEB DEMO':'MTEJA / SWALI LA MFANO'}>Menu iko<br/><em>wapi?</em></Title>
  <Draw path="M7 36 Q122 1 266 19 Q284 21 298 26" box="0 0 315 58" stroke="#ffb347" amount={underline} style={{left:95,top:714,width:315,transform:'rotate(-3deg)'}}/>
  <div className="wa-hook-tag" style={{opacity:payoff,transform:`rotate(-6deg) translateY(${(1-payoff)*20}px)`}}>{cover?'Mfano wa website ya biashara':'Website yako ijibu.'}</div>
  <div className="wa-food-note">PILAU · BONGO FOODIE ART</div>
 </AbsoluteFill>;
}
function Open({button}:{button:Box}){
 const f=useCurrentFrame();const lift=ease(f,0,39);const tap=ease(f,280,326);const w=545;const ih=w*834/668;
 const a={x:button.x*w,y:button.y*ih,w:button.w*w,h:button.h*ih};
 return <AbsoluteFill className="wa-scene wa-open">
  <div className="wa-side-tab"/>
  <Maker/><Title label="01 / BONGO FOODIE · WEB DEMO">Gusa <em>menu.</em></Title>
  <div className="wa-browser" style={{transform:`translateY(${(1-lift)*38}px) rotate(${(1-lift)*(-4)}deg)`}}>
   <div className="wa-toolbar"><Img src={asset('bongo-icon.png')} alt=""/><span>BONGO FOODIE</span><i/><small>HOME</small></div>
   <div className="wa-home-image" style={{width:w,height:ih}}><Img src={asset('home.png')} alt="Captured Bongo Foodie homepage: Karibu. Chakula kizuri. Explore the menu."/>
    <div className="wa-tap-target" style={{left:a.x-7,top:a.y-7,width:a.w+14,height:a.h+14,opacity:tap,transform:`scale(${1+(1-tap)*.09})`}}/>
   </div>
  </div>
  <aside className="wa-open-note"><b>01</b><span>LOCAL<br/>CAPTURE</span></aside>
  <Draw box="0 0 240 160" path="M233 13C188 15 163 38 148 72C129 112 88 137 12 123M12 123L40 105M12 123L43 142" width={7} amount={tap} style={{left:414,top:1070,width:265}}/>
  <span className="wa-tap-label" style={{opacity:ease(f,292,326)}}>GUSA HAPA</span>
 </AbsoluteFill>;
}
function Search({input}:{input:Box}){
 const f=useCurrentFrame();const match=f>=93;const lift=push(f,107);const price=ease(f,232,266);const viewW=724;
 const scale=viewW/(780*input.w), offset=input.y*448*scale;
 return <AbsoluteFill className="wa-scene wa-search">
  <div className="wa-search-angle"/>
  <Maker/><Title label="02 / MENYU · LOCAL DEMO">Tafuta <em>pilau.</em></Title>
  <div className="wa-finder" style={{width:viewW,height:448*input.h*scale+6}}><Img src={asset(match?'menu-pilau.png':'menu-before.png')} alt={match?'Menu search: pilau':'Menu search field'} style={{left:-input.x*780*scale,top:3-offset,width:780*scale,height:448*scale}}/></div>
  <div className="wa-result" style={{opacity:ease(f,107,129),transform:`translateY(${(1-lift)*60}px) rotate(${(1-lift)*-4}deg)`}}>
   <Img src={asset('pilau-result.png')} alt="Showcase search result: photo of Pilau ya Kuku and an example price of TSh 10,000"/>
   <Draw path="M9 24Q81 18 145 20" box="0 0 154 33" amount={price} width={5} stroke="#b04a05" style={{left:16,top:558,width:152}}/>
  </div>
  <div className="wa-result-tags">
   {['Picha','Jina','Bei'].map((l,i)=><span key={l} style={{opacity:ease(f,[121,171,231][i],[144,195,256][i]),transform:`translateX(${18*(1-ease(f,[121,171,231][i],[144,195,256][i]))}px)`}}><i/>{l}</span>)}
   <small style={{opacity:price}}>BEI YA<br/>MFANO</small>
  </div>
 </AbsoluteFill>;
}
function Design(){
 const f=useCurrentFrame();const after=ease(f,222,255);
 const tasks=[['MTEJA','Anataka kuona menu.',43],['BUTTON','Explore the menu',167],['PALE ANAPOFIKA','Picha, jina na bei.',272]] as const;
 return <AbsoluteFill className="wa-scene wa-design"><div className="wa-plan-grid"/><Maker light/>
  <Title label="03 / JINSI TUNAVYO-BUILD">Action <em>kwanza.</em></Title>
  <div className="wa-design-sub" style={{opacity:.58+.42*after}}>Design inafuata.</div>
  <div className="wa-receipt"><div className="wa-receipt-title"><b>WEB BRIEF</b><span>MFANO / BONGO FOODIE</span></div>
   <div className="wa-plan-rail"/><div className="wa-plan-fill" style={{transform:`scaleY(${ease(f,60,314)})`}}/>
   {tasks.map(([a,b,t],i)=><div key={a} className="wa-receipt-row" style={{opacity:.28+.72*ease(f,t,t+32)}}><span>{String(i+1).padStart(2,'0')}</span><div><small>{a}</small><b>{b}</b></div></div>)}
  </div>
 </AbsoluteFill>;
}
function CTA(){
 const f=useCurrentFrame();const p=ease(f,19,74);
 return <AbsoluteFill className="wa-scene wa-cta"><div className="wa-grain"/><div className="wa-cta-scarf"/>
  <Plate id="finish" style={{left:495,top:766,width:709,opacity:p,transform:`rotate(${13-7*p}deg) translateX(${(1-p)*100}px)`}}/>
  <Maker light/>
  <Title label="ANGALIA WEBSITE DEMO">Comment<br/><em>LINK</em></Title>
  <Draw box="0 0 420 80" path="M11 47Q197 14 408 34M21 61Q196 44 347 52" amount={ease(f,55,139)} stroke="#ffb347" width={7} style={{left:98,top:731,width:415}}/>
  <div className="wa-end-tag" style={{opacity:p,transform:`translateY(${(1-p)*20}px)`}}><Img src={asset('bongo-icon.png')} alt=""/><div><b>Bongo Foodie</b><span>WEB DEMO</span></div></div>
  <p className="wa-end-send" style={{opacity:ease(f,95,121)}}>Nakutumia<br/>demo kwa DM.</p>
 </AbsoluteFill>;
}
const scenes={hook:Hook,open:Open,search:Search,design:Design,cta:CTA};
export function Reel({shots,button,input,cover=false}:Props){
 const f=useCurrentFrame();const idx=cover?0:shots.findIndex(x=>x.start<=f&&f<x.end);const s=shots[Math.max(0,idx)];const Scene=scenes[s.shot as keyof typeof scenes];
 return <AbsoluteFill className="wa-root"><Sequence from={s.start} durationInFrames={s.end-s.start} layout="none" key={s.shot}><Scene button={button} input={input} cover={cover}/></Sequence>
 {!cover&&<div className={`wa-progress ${['hook','design','cta'].includes(s.shot)?'on-dark':''}`} aria-hidden="true">{shots.map((x,i)=><span key={x.shot} style={{opacity:i===idx?1:i<idx?.52:.22}}/>)}</div>}</AbsoluteFill>;
}
