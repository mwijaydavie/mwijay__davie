import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import project from '../project.json';

export type Cue = {shot:string; sw:string[]; en:string[]; start:number; end:number; captionEnd:number};
export type StoryProps = {cues:Cue[]; durationInFrames:number; cover?:boolean};
const copy:Record<string,{eyebrow:string;title:[string,string];sub:string}> = {
  fursa:{eyebrow:'UAUT CONNECT / FURSA',title:['Tulipata','nafasi.'],sub:'Kujenga tovuti inayowaunganisha wanafunzi na chuo.'},
  lengo:{eyebrow:'LENGO LETU',title:['Mwanafunzi','aanzie wapi?'],sub:'Ajue anachoweza kusoma na hatua inayofuata.'},
  masomo:{eyebrow:'01 / KUCHAGUA',title:['Programu za','masomo.'],sub:'Orodha inampa mwanafunzi mahali pa kuanzia.'},
  hatua:{eyebrow:'02 / KUELEKEA CHUONI',title:['Hatua za','maombi.'],sub:'Tovuti inaeleza vigezo na njia ya kuanza maombi.'},
  live:{eyebrow:'MATOKEO YA KAZI',title:['UAUT Connect','iko hewani.'],sub:'Wazo limekuwa tovuti ambayo mwanafunzi anaweza kutembelea.'},
};
const asset=(name:string)=>staticFile(`uaut/${name}`);
const ease=(p:number,a:number,b:number)=>interpolate(p,[a,b],[0,1],{easing:Easing.inOut(Easing.cubic),extrapolateLeft:'clamp',extrapolateRight:'clamp'});

function Draw({d,len,p,stroke='var(--u-blue)',width=5}:{d:string;len:number;p:number;stroke?:string;width?:number}) {
  if(p<=0)return null;
  return <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray={p>=1?undefined:`${len} ${len}`} strokeDashoffset={len*(1-p)}/>;
}
function Icon({icon,size=58}:{icon:string;size?:number}) {
  const d:Record<string,string>={
    book:'M8 11c8-5 15-4 22 2 7-6 14-7 22-2v34c-8-5-15-4-22 2-7-6-14-7-22-2zM30 13v34',
    campus:'M5 22l25-13 25 13M8 23h44M11 48h38M6 53h48M15 26v21M25 26v21M35 26v21M45 26v21',
    list:'M15 8h31v44H15zM23 19h14M23 28h14M23 37h14',
    arrow:'M9 30h41M36 16l14 14-14 14',
    search:'M36 37l15 15M41 26a15 15 0 1 1-30 0 15 15 0 0 1 30 0z',
    check:'M13 31l11 11 23-25',
  };
  return <svg aria-hidden width={size} height={size} viewBox="0 0 60 60"><path d={d[icon]} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>;
}
function Maker() {
  return <header className="u-mast">
    <span className="u-maker"><Img src={asset('altraware.png')} alt=""/>Altraware Technology</span>
    <span className="u-project">KAZI YETU <b>/ 04</b></span>
  </header>;
}
function Bridge({p}:{p:number}) {
  const d='M94 52H220C292 52 294 20 358 20H492C556 20 558 52 630 52H756';
  const flight=ease(p,.13,.69);
  return <div className="u-bridge" aria-label="Mchoro unaounganisha mwanafunzi na chuo">
    <svg className="u-wire" viewBox="0 0 850 108" aria-hidden>
      <path d={d} stroke="#A6BAD7" strokeWidth="3" fill="none" strokeDasharray="6 8"/>
      <Draw d={d} len={682} p={flight}/>
      <circle cx="425" cy="20" r="7.5" fill={flight>.5?'#DBA72B':'#fff'} stroke="#AD7912" strokeWidth="2"/>
    </svg>
    <div className="u-bridge-node"><div><Icon icon="book" size={51}/></div><strong>Mwanafunzi</strong></div>
    <div className="u-bridge-node"><div><Icon icon="campus" size={52}/></div><strong>UAUT</strong></div>
  </div>;
}
function SourceLabel({children}:{children:React.ReactNode}) {
  return <span className="u-label"><i/>{children}</span>;
}
function IntroProof({p}:{p:number}) {
  return <>
    <div className="u-card u-nav">
      <div className="u-card-head"><SourceLabel>SCREENSHOT YA TOVUTI</SourceLabel><span>UAUT Connect</span></div>
      <div className="u-nav-shot"><Img src={asset('nav.png')} alt="UAUT Connect and Programs navigation in the owner's screenshot"/>
        <div className="u-focus" style={{opacity:.38+.62*ease(p,.08,.29)}}/>
      </div>
    </div>
    <Bridge p={p}/>
  </>;
}
function Question({p}:{p:number}) {
  const line=ease(p,.11,.64);
  return <div className="u-question">
    <div className="u-questions">
      <div><Icon icon="search" size={55}/><strong>Nisome nini?</strong><p>Programu za masomo</p></div>
      <div><Icon icon="list" size={55}/><strong>Nianzie wapi<br/>kuomba?</strong><p>Hatua za kujiunga</p></div>
    </div>
    <svg viewBox="0 0 850 56" className="u-question-line" aria-hidden>
      <path d="M210 0v9c0 12 9 20 20 20h390c11 0 20-8 20-20V0M425 29v25" fill="none" stroke="#C0CBDD" strokeWidth="3"/>
      <Draw d="M210 0v9c0 12 9 20 20 20h390c11 0 20-8 20-20V0M425 29v25" len={512} width={3} p={line}/>
      <circle cx="425" cy="29" r="7" fill="#DBA72B" opacity={ease(p,.24,.54)}/>
    </svg>
    <div className="u-start"><span><Icon icon="arrow" size={33}/>Pa kuanzia</span><Img src={asset('programs.png')} alt="Programs nav in the UAUT Connect screenshot"/></div>
  </div>;
}
function Programs() {
  return <div className="u-card u-programs">
    <div className="u-card-head"><SourceLabel>MAUDHUI YA UKURASA</SourceLabel><Img src={asset('programs.png')} alt="Programs nav crop"/></div>
    <div className="u-program-list">{project.programs.map((program,i)=><div key={program}><b>{`0${i+1}`}</b><span>{program}</span></div>)}</div>
  </div>;
}
function Steps({p}:{p:number}) {
  const stroke=ease(p,.13,.72);
  const check=ease(p,.40,.74);
  return <>
    <div className="u-card u-actions">
      <div className="u-card-head"><SourceLabel>SCREENSHOT YA VITUFE</SourceLabel><span>UAUT Connect</span></div>
      <Img src={asset('home-actions.png')} alt="Apply for Admission and Explore Degrees on the supplied UAUT Connect homepage screenshot"/>
    </div>
    <div className="u-steps">
      <span>MCHORO WA NJIA</span>
      <div className="u-step-wire">
        <svg viewBox="0 0 850 58" aria-hidden>
          <path d="M142 29h566" stroke="#b2c6e5" strokeWidth="4" strokeDasharray="6 8"/>
          <Draw d="M142 29h566" len={566} p={stroke} width={5}/>
          {[142,425,708].map((x,i)=><circle key={x} cx={x} cy="29" r="10" fill={stroke>=i*.48?'var(--u-blue)':'#fff'} stroke="var(--u-blue)" strokeWidth="3"/>)}
          <circle cx="708" cy="29" r={14+9*check} fill="none" stroke="#DBA72B" strokeWidth="3" opacity={check}/>
        </svg>
      </div>
      <div className="u-step-labels"><strong>Programu</strong><strong>Vigezo</strong><strong>Maombi</strong></div>
    </div>
  </>;
}
function Live({p}:{p:number}) {
  const reveal=.22+.78*ease(p,.04,.40);
  return <div className="u-card u-live">
    <div className="u-live-top"><span><Icon icon="check" size={33}/>Tovuti ya umma</span><Img src={asset('mark.png')} alt="Original UAUT Connect logo crop" style={{clipPath:`inset(0 ${100*(1-reveal)}% 0 0 round 10px)`}}/></div>
    <strong>uautconnect.com</strong>
    <div className="u-live-bottom"><span>Tazama tulichojenga</span><Icon icon="arrow" size={49}/></div>
    <svg className="u-live-ribbon" viewBox="0 0 250 180" aria-hidden>
      <path d="M265 158c-66 12-109-10-128-43C116 79 119 32 8 40" fill="none" stroke="#CFDDF3" strokeWidth="3"/>
      <Draw d="M265 158c-66 12-109-10-128-43C116 79 119 32 8 40" len={304} p={ease(p,.22,.55)} stroke="#D6AA3A" width={3}/>
    </svg>
  </div>;
}
function Art({shot,p}:{shot:string;p:number}) {
  if(shot==='fursa')return <IntroProof p={p}/>;
  if(shot==='lengo')return <Question p={p}/>;
  if(shot==='masomo')return <Programs/>;
  if(shot==='hatua')return <Steps p={p}/>;
  return <Live p={p}/>;
}
function Canvas({shot,p,reel,phase,caption,progress,cover=false,index}:{shot:string;p:number;reel:boolean;phase:number;caption?:string[];progress:number;cover?:boolean;index:number}) {
  const s=copy[shot];
  return <AbsoluteFill className={`u-root ${reel?'u-reel':'u-slide'} u-shot-${shot}`}>
    <svg className="u-paper" viewBox={reel?'0 0 1080 1920':'0 0 1080 1350'} preserveAspectRatio="none" aria-hidden>
      <path d="M1123 155C869 130 819 360 962 411C1112 464 1190 491 1143 661" fill="none" stroke="#EDF3FF" strokeWidth="68"/>
      <path d="M1121 155C867 130 818 360 961 411C1111 464 1190 491 1142 661" fill="none" stroke="#C9DDF8" strokeWidth="2.5"/>
      <path d={reel?'M-54 1656c127-41 240 7 282 77 33 56 44 154 170 172':'M-65 1005c127-41 240 7 282 77 33 56 44 154 170 172'} fill="none" stroke="#E9EFFA" strokeWidth="3"/>
      <circle cx="962" cy="411" r="9" fill="#E8C974"/>
    </svg>
    <Maker/>
    <section className="u-title">
      <div className="u-eyebrow"><i/>{s.eyebrow}</div>
      <h1>{reel&&shot==='hatua'?'Masomo hadi':s.title[0]}<br/><em>{s.title[1]}</em></h1>
      {reel?<svg viewBox="0 0 256 15" className="u-title-stroke" aria-hidden><Draw d="M4 9H247" len={243} p={cover?1:.27+.73*phase} stroke="#DBA72B" width={5}/></svg>:<p>{s.sub}</p>}
    </section>
    <div className="u-art"><Art shot={shot} p={p}/></div>
    {caption&&!cover&&<aside className="u-caption" lang="sw">{caption.map(line=><span key={line}>{line}</span>)}</aside>}
    {!cover&&<footer className="u-footer">
      <div className="u-progress" aria-hidden><div style={{width:`${100*progress}%`}}/></div>
      {!reel&&<><span>UAUT CONNECT</span><span>{`0${index+1} / 0${project.slides.length}`}</span></>}
    </footer>}
  </AbsoluteFill>;
}
export function Carousel(){
  const index=useCurrentFrame();
  return <Canvas index={index} shot={project.slides[index].shot} p={1} reel={false} phase={1} progress={(index+1)/project.slides.length}/>;
}
export function Reel({cues,durationInFrames,cover=false}:StoryProps){
  const frame=useCurrentFrame();
  const cuts=cues.map((_,i)=>i===0?0:cues[i-1].captionEnd);
  const index=cuts.reduce((a,v,i)=>frame>=v?i:a,0), c=cues[index];
  const p=cover?1:Math.max(0,Math.min(1,(frame-c.start)/(c.end-c.start)));
  const caption=frame>=c.start&&frame<c.captionEnd?c.sw:undefined;
  return <>
    {!cover&&<Html5Audio src={asset('narration.wav')}/>}
    <Canvas index={index} shot={c.shot} p={p} reel phase={ease(frame-cuts[index],0,35)} caption={caption} progress={(frame+1)/durationInFrames} cover={cover}/>
  </>;
}
