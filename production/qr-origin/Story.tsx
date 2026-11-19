import React from 'react';
import {AbsoluteFill,Easing,Img,Sequence,interpolate,staticFile,useCurrentFrame} from 'remotion';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import layout from './layout.json';
import './story.css';

export type Shot={shot:string;start:number;end:number};
export type Evidence={angle:number;file:string;decoded:string;width:number};
export type Props={shots:Shot[];proof:Evidence[];cover?:boolean};
const art=(name:string)=>staticFile(`qr-origin/${name}`);
const cue=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.24,.83,.22,1)});
const [qrX,qrY,qrW]=layout.board;
function Brand({onBlue=false}:{onBlue?:boolean}){return <div className={`story-mast ${onBlue?'on-blue':''}`}><Img src={art('altraware.png')} alt=""/><b>ALTRAWARE</b><i/>TECH STORY / 01</div>;}
function Head({label,children,cls=''}:{label:string;children:React.ReactNode;cls?:string}){
 return <header className={`story-head ${cls}`}><div className="story-kicker"><i/>{label}</div><h1>{children}</h1></header>;
}
function Corners({p=1,cls=''}:{p?:number;cls?:string}){
 return <svg className={`story-corners ${cls}`} viewBox="0 0 164 164" aria-hidden="true"><path d="M59 12H12v47m93-47h47v47M12 105v47h47" pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-p)} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="square"/></svg>;
}
function QR({row,style,cls=''}:{row:Evidence;style?:React.CSSProperties;cls?:string}){
 return <Img className={`story-qr ${cls}`} src={art(row.file)} alt={`Demo QR code, ${row.angle} degrees, plain text ${row.decoded}`} style={style}/>;
}
function Hook({cover=false,proof}:{cover?:boolean;proof:Evidence[]}){
 const f=useCurrentFrame();const slide=cover?1:cue(f,108,166);const camera=cue(f,0,220);const trace=cover?1:cue(f,26,102);
 return <AbsoluteFill className="story-scene story-hook">
  <div className="story-hook-ink"/><Brand/>
  <Head label={cover?'FACTORY → PHONE':'MWANZO WA QR CODE'}>QR ilianzia<br/><em>wapi?</em></Head>
  <div className="story-hook-photo"><Img src={art('cafe.jpg')} alt="AI illustration of a phone and blank paper card on a cafe table" style={{transform:`scale(${1.03+camera*.06}) translateY(${-11*camera}px)`}}/><div className="story-photo-shade"/></div>
  <div className="story-figure qr-sticker" style={{transform:`translateY(${28*(1-trace)}px) rotate(-7deg)`,opacity:trace}}>
   <QR row={proof[0]}/><span>DEMO · TEXT</span>
  </div>
  <Corners p={trace}/>
  <div className="story-hook-note" style={{opacity:slide,transform:`translateY(${(1-slide)*26}px)`}}>{cover?'Kutoka kiwandani.':'Si kwenye simu.'}</div>
  <span className="story-illustration hook-credit">PICHA YA MFANO · AI</span>
 </AbsoluteFill>;
}
function Barcode({n=0}:{n?:number}){
 const p=[3,2,1,4,1,2,3,1,5,2,4,1,2,1,4,3,2,2,4,1,2,3,1];let x=0;
 return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 111 39" aria-hidden="true">{p.map((_,i)=>{const w=p[(n*5+i)%p.length],left=x;x+=w+2;return <rect key={i} x={left} y="0" width={w} height={i%8===0?39:33} fill="currentColor"/>;})}</svg>;
}
function Factory(){
 const f=useCurrentFrame();const move=cue(f,0,330);
 return <AbsoluteFill className="story-scene story-factory">
  <div className="story-film-edge"/><Brand/>
  <Head label="01 / JAPAN · MIAKA YA 90">Barcode moja<br/><em>haikutosha.</em></Head>
  <div className="story-factory-photo"><Img src={art('factory.jpg')} alt="AI reconstruction of scanning several labels on an early-1990s automotive parts line" style={{transform:`scale(${1.065+.065*move}) translateY(${6+19*move}px)`}}/><span className="story-illustration">MCHORO WA AI · SI PICHA YA ZAMANI</span></div>
  <div className="story-scan-label">HATUA ZA SCAN · MFANO</div>
  <div className="story-barcodes">{[0,1,2].map((i)=>{
   const onset=[75,159,243][i];const p=cue(f,onset,onset+35);const go=cue(f,onset+29,onset+68);
   return <div className="story-bar-ticket" key={i} style={{opacity:.26+.74*p,transform:`translateY(${(1-p)*16}px)`}}>
    <b>SCAN {i+1}</b><Barcode n={i}/><i style={{opacity:go>0?1-go:0,left:`${9+82*go}%`}}/>
   </div>;
  })}</div>
 </AbsoluteFill>;
}
function Axis({p=1,vertical=false}:{p?:number;vertical?:boolean}){
 return <svg className={vertical?'axis-v':'axis-h'} viewBox="0 0 222 36" aria-hidden="true"><path d="M5 18h213m-18-14 18 14-18 14M24 4 5 18l19 14" fill="none" stroke="currentColor" strokeWidth="4" pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-p)} strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Invention({proof}:{proof:Evidence[]}){
 const f=useCurrentFrame();const label=cue(f,42,96);const shape=cue(f,111,180);const across=cue(f,270,323);const down=cue(f,334,389);
 return <AbsoluteFill className="story-scene story-invention">
  <div className="story-blue-grid"/><Brand onBlue/>
  <Head label="02 / UVUMBUZI">1994<span>.</span></Head>
  <div className="year-label" style={{opacity:label,transform:`translateX(${(1-label)*(-37)}px)`}}><b>DENSO</b><span>INATOA</span><strong>QR Code</strong></div>
  <div className="story-axis-board" style={{opacity:shape,transform:`translateY(${(1-shape)*38}px)`}}>
   <div className="story-compare"><div><small>01 · BARCODE</small><Barcode/><Axis p={across}/><b>Mwelekeo mmoja</b></div>
    <i className="story-rule"/>
    <div className="story-2d"><small>02 · QR CODE</small><QR row={proof[0]}/><Axis p={across}/><Axis p={down} vertical/><b>Pande mbili</b></div></div>
   <div className="story-axis-note"><i/>UPANA <i/>UREFU</div>
  </div>
 </AbsoluteFill>;
}
function Finders({proof}:{proof:Evidence[]}){
 const f=useCurrentFrame();const p=cue(f,145,201);
 return <AbsoluteFill className="story-scene story-finders">
  <div className="story-dotfield"/><Brand/>
  <Head label="03 / FINDER PATTERNS">Square tatu.</Head>
  <div className="finder-field" style={{left:qrX,top:qrY,width:qrW,height:qrW}}>
   <QR row={proof[0]}/>
   {[[0,0],[14,0],[0,14]].map(([x,y],i)=>{const q=cue(f,18+i*31,44+i*31);
    return <div className="finder-square" key={i} style={{left:(4+x)*16-8,top:(4+y)*16-8,width:128,height:128,opacity:q,transform:`scale(${1.18-.18*q})`}}><b>{i+1}</b></div>;
   })}
  </div>
  <div className="finder-margin">ALAMA ZA<br/>KONA</div>
  <div className="finder-note" style={{opacity:p,transform:`translateY(${(1-p)*20}px)`}}>Scanner inajua<br/><b>code imekaaje.</b></div>
 </AbsoluteFill>;
}
function Test({proof}:{proof:Evidence[]}){
 const f=useCurrentFrame();const tilt=cue(f,37,100);const isTurn=f>=100;const assess=f<37||isTurn;
 const sample=proof.find(row=>row.angle===(isTurn?90:0))!;
 const conf=cue(f,100,127);const glow=cue(f,203,230);
 return <AbsoluteFill className="story-scene story-test">
  <div className="story-test-split"/><Brand/>
  <Head label="04 / DEMO YA DECODER">Izungushe<em>.</em></Head>
  <div className="test-degree"><small>ANGLE</small><b>{Math.round(90*tilt)}°</b><i/> </div>
  <div className="test-symbol" style={{left:qrX,top:qrY,width:qrW,height:qrW,transform:isTurn?'none':`rotate(${tilt*90}deg)`}}><QR row={sample}/></div>
  <div className="test-read"><span>{assess?'✓':'···'}</span><b>{assess?'IMESOMWA':'PINDUA'}</b><small>LOCAL<br/>DECODER</small></div>
  <div className="test-result" style={{borderColor:`rgba(31,55,203,${.28+.72*glow})`}}>
   <small>{assess?'UJUMBE ULIOPATIKANA':'INAZUNGUKA…'}</small>
   <strong style={{opacity:isTurn?.72+.28*conf:1}}>{assess?sample.decoded:'—'}</strong>
   <div className="test-plain">TEXT<br/>TU</div>
  </div>
 </AbsoluteFill>;
}
function Close(){
 const f=useCurrentFrame();const photo=cue(f,2,52);const second=cue(f,83,127);const end=cue(f,163,218);
 return <AbsoluteFill className="story-scene story-close">
  <div className="story-close-slope"/><Brand/>
  <Head label="1994 → SASA">Kutoka kiwandani<br/><em>hadi mfukoni.</em></Head>
  <div className="story-close-pair">
   <figure style={{opacity:photo,transform:`translateX(${(1-photo)*(-40)}px)`}}><Img src={art('factory.jpg')} alt="AI illustration of a parts factory"/><figcaption>KIWANDANI</figcaption></figure>
   <svg viewBox="0 0 92 24" aria-hidden="true"><path d="M3 12h83m-14-9 14 9-14 9" stroke="currentColor" strokeWidth="3" fill="none" pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-second)}/></svg>
   <figure style={{opacity:second,transform:`translateX(${(1-second)*44}px)`}}><Img src={art('cafe.jpg')} alt="AI illustration of a modern phone"/><figcaption>SIMUNI</figcaption></figure>
  </div>
  <span className="story-illustration close-credit">PICHA ZA MFANO · AI</span>
  <div className="story-question" style={{opacity:end,transform:`translateY(${(1-end)*28}px)`}}>QR ya mwisho uliyoscan<br/>ilikuwa ya nini?</div>
 </AbsoluteFill>;
}
const scenes={hook:Hook,factory:Factory,invention:Invention,finders:Finders,test:Test,close:Close};
export function Story({shots,proof,cover=false}:Props){
 const f=useCurrentFrame();const i=cover?0:shots.findIndex(s=>s.start<=f&&f<s.end);const s=shots[Math.max(0,i)];const Scene=scenes[s.shot as keyof typeof scenes];
 return <AbsoluteFill className="story-root"><Sequence from={s.start} durationInFrames={s.end-s.start} key={s.shot} layout="none"><Scene proof={proof} cover={cover}/></Sequence>
  {!cover&&<div className={`story-pips ${s.shot==='invention'?'on-blue':''}`} aria-hidden="true">{shots.map((o,k)=><i key={o.shot} style={{opacity:k===i?1:k<i?.52:.20}}/>)}</div>}
 </AbsoluteFill>;
}
