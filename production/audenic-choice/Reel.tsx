import React from 'react';
import {AbsoluteFill,Easing,Img,Sequence,interpolate,staticFile,useCurrentFrame} from 'remotion';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import './reel.css';

type Rect={x:number;y:number;w:number;h:number};
export type Shot={shot:string;start:number;end:number};
export type Props={shots:Shot[];rows:Rect[];cover?:boolean};
const art=(n:string)=>staticFile(`audenic/${n}`);
const ease=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.23,.9,.23,1)});
function Brand({dark=false}:{dark?:boolean}){return <div className={`au-brand ${dark?'dark':''}`}><Img src={art('altraware.png')} alt=""/><b>ALTRAWARE</b><i/> WEBSITE BUILD</div>;}
function Header({label,children}:{label:string;children:React.ReactNode}){return <header className="au-head"><span className="au-kicker"><i/>{label}</span><h1>{children}</h1></header>;}
function Pulse({p,style,color='#ff764f'}:{p:number;style:React.CSSProperties;color?:string}){
 return <svg style={style} className="au-svg" viewBox="0 0 544 80" aria-hidden="true"><path d="M4 42H196l24-9 14 20 17-42 15 62 17-49 12 31 14-13h231" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-p)}/></svg>;
}
function Hook({cover=false}:{cover?:boolean}){
 const f=useCurrentFrame();const p=ease(f,0,145);const stamp=cover?1:ease(f,126,164);
 return <AbsoluteFill className="au-scene au-hook">
  <Img className="au-photo" src={art('hero.jpg')} alt="Illustrative unbranded headphones in an audio studio" style={{transform:`scale(${1.002+.057*p})`}}/>
  <div className="au-hook-shade"/><div className="au-accent-rail" style={{transform:`scaleY(${.45+.55*ease(f,0,41)})`}}/>
  <Brand dark/>
  <Header label={cover?'AUDENIC · SHOP DEMO':'AUDENIC / PRODUCT UX'}>Battery<span>inakaa muda gani?</span></Header>
  <Pulse p={cover?1:ease(f,36,111)} style={{top:737,left:91,width:368}}/>
  <div className="au-hook-strip" style={{opacity:stamp,transform:`translateX(${(1-stamp)*(-25)}px)`}}>{cover?'PICHA + SPECS':'Picha pekee haitoshi.'}</div>
  <div className="au-art-note">HEADPHONES · PICHA YA MFANO</div>
 </AbsoluteFill>;
}
function Scroll(){
 const f=useCurrentFrame();const tap=ease(f,40,73);const open=ease(f,75,100);const down=ease(f,166,215);
 return <AbsoluteFill className="au-scene au-scroll">
  <div className="au-scroll-flag"/><Brand/>
  <Header label="01 / AUDENIC · LOCAL CAPTURE">Fungua <em>product.</em></Header>
  <div className="au-shop-frame" style={{transform:`translateX(${-24*open}px)`,opacity:1-open}}>
   <div className="au-chrome"><i/><i/><i/><span>/SHOP · EXCERPTS</span></div>
   <Img className="au-catalogue" src={art('catalogue.png')} alt="The full catalogue, at Audenic's shop"/>
   <div className="au-shop-choice" style={{backgroundColor:`rgba(255,77,26,${tap*.1})`}}><Img src={art('select.png')} alt="Audenic Classic link in the catalogue"/>
    <div className="au-tap" aria-hidden="true" style={{opacity:tap,transform:`scale(${1.6-.6*tap})`}}>↗</div>
   </div>
  </div>
  <div className="au-name-frame" style={{transform:`translate(${(1-open)*66}px,${-down*41}px)`,opacity:open}}>
   <div className="au-chrome"><i/><i/><i/><span>PRODUCT PAGE · EXCERPT</span></div><Img src={art('name.png')} alt="Audenic Classic product page title"/>
  </div>
  <svg className="au-scroll-arrow" viewBox="0 0 55 178" aria-hidden="true"><path d="M28 8v154m-19-21 19 21 19-21" stroke="#c54624" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength="100" strokeDasharray="100 101" strokeDashoffset={100*(1-down)}/></svg>
  <div className="au-spec-head-fragment" style={{opacity:down,transform:`translateY(${(1-down)*44}px)`}}><Img src={art('specs.png')} alt="Technical specifications heading on the product page"/></div>
  <div className="au-lower" style={{opacity:ease(f,197,224)}}>↓ SHUKA KWENYE PAGE</div>
 </AbsoluteFill>;
}
function Proof({rows}:{rows:Rect[]}){
 const f=useCurrentFrame();const pop=ease(f,0,28);const w=742,h=w*932/780,y=rows[0].y*h-10;
 const isIn=ease(f,21,53);
 return <AbsoluteFill className="au-scene au-proof"><div className="au-proof-line"/><Brand dark/>
  <Header label="02 / AUDENIC CLASSIC · EXCERPTS">Specs <em>ziko wazi.</em></Header>
  <div className="au-proof-art" style={{width:w,opacity:.79+.21*pop,transform:`translateY(${(1-pop)*22}px)`}}>
   <div className="au-proof-heading"><Img src={art('specs.png')} alt="Actual Technical specifications heading"/></div>
   <div className="au-row-label">DETAILS · SAMPLE DATA</div>
   <div className="au-rows" style={{height:(rows[1].y+rows[1].h)*h-y+17,opacity:isIn}}>
    <Img src={art('specs.png')} alt="Actual demo values: Battery 60h playback and Weight 248g; not measured" style={{width:w,height:h,transform:`translateY(${-y+(1-isIn)*21}px)`}}/>
    {rows.map((r,i)=>{const q=ease(f,[38,105][i],[69,137][i]);return <div className="au-focus" key={i} style={{opacity:q,left:r.x*w-10,top:r.y*h-y+1,width:r.w*w+20,height:r.h*h-5}}/>;})}
   </div>
  </div>
  <div className="au-proof-label"><b>DATA YA DEMO</b><span>SI TEST YA HARDWARE</span></div>
 </AbsoluteFill>;
}
function Design(){
 const f=useCurrentFrame();const artIn=ease(f,23,90);const second=ease(f,186,223);const link=ease(f,241,307);
 return <AbsoluteFill className="au-scene au-design"><div className="au-design-grid"/><Brand/>
  <Header label="03 / JINSI TUNAVYO-DESIGN">Picha <em>ivutie.</em></Header>
  <div className="au-slice" style={{transform:`translate(${(1-artIn)*72}px,${(1-artIn)*55}px) rotate(${9-5*artIn}deg)`,opacity:artIn}}><Img src={art('hero.jpg')} alt="Headphones concept image, not product photography"/></div>
  <div className="au-demo-tape">MFANO · NOT PRODUCT PHOTO</div>
  <div className="au-method"><div className="au-method-first" style={{opacity:artIn}}><small>01 · TAZAMA</small><b>Pata interest.</b></div>
   <i aria-hidden="true" style={{transform:`scaleY(${link})`}}/>
   <div className="au-method-second" style={{opacity:second,transform:`translateY(${(1-second)*26}px)`}}><small>02 · SOMA</small><b>Fanya<br/>decision.</b></div>
  </div>
  <div className="au-takeaway" style={{opacity:ease(f,254,295)}}>Specs zikusaidie kuchagua.</div>
 </AbsoluteFill>;
}
function CTA(){
 const f=useCurrentFrame();const p=ease(f,27,85);
 return <AbsoluteFill className="au-scene au-cta"><div className="au-scarf"/><Brand dark/>
  <Header label="AUDENIC · PRODUCT PAGE">Comment <strong>SPECS</strong></Header>
  <Pulse p={ease(f,50,133)} color="#ffb195" style={{top:798,left:93,width:515}}/>
  <div className="au-cta-note" style={{opacity:p,transform:`translateY(${(1-p)*22}px)`}}>Nikutumie link<br/>ya demo kwa DM.</div>
  <div className="au-cta-fragment" style={{opacity:p,transform:`translateX(${(1-p)*61}px) rotate(${7+5*(1-p)}deg)`}}>
   <span>AUDENIC · WEB DEMO</span><Img src={art('name.png')} alt="Audenic Classic product title crop"/>
  </div>
 </AbsoluteFill>;
}
const scene={hook:Hook,scroll:Scroll,proof:Proof,design:Design,cta:CTA};
export function Reel({shots,rows,cover=false}:Props){
 const f=useCurrentFrame();const i=cover?0:shots.findIndex(s=>s.start<=f&&f<s.end);const s=shots[Math.max(0,i)];const Scene=scene[s.shot as keyof typeof scene];
 return <AbsoluteFill className="au-root"><Sequence from={s.start} durationInFrames={s.end-s.start} key={s.shot} layout="none"><Scene rows={rows} cover={cover}/></Sequence>
  {!cover&&<div className={`au-progress ${['hook','proof','cta'].includes(s.shot)?'dark':''}`} aria-hidden="true">{shots.map((o,k)=><i key={o.shot} style={{opacity:k===i?1:k<i?.52:.22}}/>)}</div>}
 </AbsoluteFill>;
}
