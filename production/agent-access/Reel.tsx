import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import {ContourField, Glyph, Sticker, Underline, ease} from './graphics';
import './reel.css';

export type Cue={scene:string;spoken:string;sw:string[];en:string[];sceneStart:number;sceneEnd:number;start:number;end:number;captionEnd:number};
export type ReadProof={env:string;offered:string[];read:{tool:string;ok:boolean;sku:string;stock:number};rejected:{tool:string;attemptedPriceTsh:number;denied:boolean;message:string|null};book:{before:number;after:number;currency:string}};
export type Props={cues:Cue[];durationInFrames:number;proof:ReadProof;cover?:boolean};
const art=(name:string)=>staticFile(`agent-access/${name}`);
const tagLines=['SWALI LA BIASHARA','AI AGENTS / NOV 2026','01 / SOMA','02 / BADILI','KANUNI YA KUANZA'];
const headings=[['AI isome stoo.','Bei ibaki.'],['MCP ni daraja.','Si ruhusa.'],['Soma stoo.'],['Badili bei?'],['Soma tu.','Badili kwa idhini.']];
const format=(value:number)=>new Intl.NumberFormat('en-TZ').format(value);

function Hero({local,fps,cover}:{local:number;fps:number;cover:boolean}){
  const drop=cover?1:ease(local,7,44);
  const focus=cover?1:ease(local,123,163);
  return <>
    <div className="hero-photo" aria-hidden="true" style={{transform:`translate(${9*Math.sin(local/96)}px,${8*Math.cos(local/105)}px) scale(${1+.045*ease(local,2,290)})`}}>
      <Img src={art('desk-hero.webp')} alt=""/>
    </div>
    <div className="preview-tag"><Img src={art('faida-brand.webp')} alt="FaidaHQ"/><span>PREVIEW YA TOVUTI</span></div>
    <div className="faida-floater" style={{transform:`translate(${(1-drop)*-19}px,${(1-drop)*28}px) rotate(${-5+drop*.9+focus*1.45}deg) scale(${.977+.023*drop+.015*focus})`}}>
      <Img className="faida-ui" src={art('faida-preview.webp')} alt="Picha ya preview ya FaidaHQ, namba za mfano zimefichwa"/>
      <svg viewBox="0 0 675 451" className="preview-scribble" aria-hidden="true">
        <path d="M43 325C12 329 18 390 65 395c87 6 230-3 239-36 9-31-104-44-188-39-36 2-57 3-73 5Z" fill="none" stroke="#743adc" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-focus)}/>
      </svg>
    </div>
    <Sticker name="tag" left={685} top={694} size={208} frame={local} fps={fps} delay={36} turn={11} already={cover}/>
    <span className="hero-photo-credit">PICHA YA KIELELEZO</span>
  </>;
}

function News({local,fps}:{local:number;fps:number}){
  const one=ease(local,3,32);
  const next=ease(local,91,127);
  const bridge=ease(local,166,205);
  const scopes=ease(local,224,252);
  return <>
    <Underline progress={ease(local,37,76)} width={385} top={645}/>
    <section className="news-sheet">
      <div className="dispatch">KWA NINI SASA? <span>NOVEMBA 2026</span></div>
      <div className="news-line" style={{opacity:one,transform:`translateX(${(1-one)*-17}px)`}}>
        <time dateTime="2026-11-18"><b>18</b> NOV</time><div><strong>Proof yazindua MCP</strong><p>Inalenga kuthibitisha idhini ya mtu.</p></div>
      </div>
      <div className="news-line" style={{opacity:next,transform:`translateX(${(1-next)*-17}px)`}}>
        <time dateTime="2026-11-21"><b>21</b> NOV</time><div><strong>APICon · Dar es Salaam</strong><p>AI Agents &amp; MCP kwenye ajenda.</p></div>
      </div>
    </section>
    <div className="news-route" style={{opacity:bridge,transform:`translateY(${(1-bridge)*14}px)`}}>
      <b>AI</b><Glyph name="arrow" size={33}/><b>MCP</b><Glyph name="arrow" size={33}/><b>Zana za mfumo</b>
      <small style={{opacity:scopes}}>Ruhusa ni uamuzi wako.</small>
    </div>
    <Sticker name="link" left={772} top={647} size={127} frame={local} fps={fps} delay={63} turn={14} depth={10}/>
  </>;
}

function LabLabel(){
  return <div className="lab-label"><i/><b>JARIBIO LA NDANI</b><span>MCP / DATA YA MFANO</span></div>;
}

function StockRead({local,fps,proof}:{local:number;fps:number;proof:ReadProof}){
  const travel=Math.max(0,Math.min(1,(local-28)/84));
  const reveal=ease(local,113,153);
  const callout=ease(local,204,234);
  const pos=31+674*travel;
  return <>
    <LabLabel/>
    <div className="read-track">
      <div className="message-label" style={{transform:`translateX(${(1-ease(local,0,28))*-18}px)`}}><span>OMBI</span><strong>{proof.read.tool}</strong></div>
      <svg viewBox="0 0 736 104" aria-hidden="true">
        <path d="M31 49H705" stroke="#94b7a9" strokeWidth="7" strokeLinecap="round" fill="none" strokeDasharray="3 16"/>
        <path d={`M31 49H${pos}`} stroke="#285e50" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <circle cx={pos} cy="49" r={21+6*Math.sin(local/13)**2} fill="#a8e4ce" opacity=".8"/>
        <circle cx={pos} cy="49" r="12" fill="#19513c" stroke="#fff" strokeWidth="4"/>
      </svg>
    </div>
    <div className="stock-slip" style={{opacity:reveal,transform:`translate(${(1-reveal)*28}px,${(1-reveal)*21}px) rotate(${-3.25+(1-reveal)*4}deg)`}}>
      <div className="result-mark"><Glyph name="check" size={30}/><b>IMERUHUSIWA</b></div>
      <div className="stock-line"><strong>{proof.read.stock}</strong><span>vipande<br/>vipo stoo</span></div>
      <div className="slip-end"><span>{proof.read.sku}</span><div className="barcode" aria-hidden="true"/></div>
    </div>
    <Sticker name="box" left={668} top={868} size={204} frame={local} fps={fps} delay={100} turn={9} depth={10}/>
    <div className="one-tool" style={{opacity:callout,transform:`translateY(${(1-callout)*13}px)`}}>Agent amepewa zana ya kusoma tu.</div>
  </>;
}

function PriceGate({local,fps,proof}:{local:number;fps:number;proof:ReadProof}){
  const impact=130;
  const travel=Math.max(0,Math.min(1,(local-32)/(impact-32)));
  const denied=ease(local,impact+1,impact+31);
  const price=ease(local,187,224);
  const ring=Math.max(0,Math.min(1,(local-impact)/34));
  const recoil=local>=impact?Math.sin((local-impact)/4)*Math.exp(-(local-impact)/11)*15:0;
  const pos=30+494*travel-recoil;
  return <>
    <LabLabel/>
    <div className="gate-bay">
      <div className="message-label" style={{transform:`translateX(${(1-ease(local,0,28))*-18}px)`}}><span>OMBI</span><strong>{proof.rejected.tool}</strong></div>
      <div className="requested-value">Ombi: TSh {format(proof.rejected.attemptedPriceTsh)}</div>
      <svg viewBox="0 0 752 132" aria-hidden="true">
        <path d="M30 77H728" stroke="#756690" strokeWidth="7" strokeLinecap="round" fill="none" strokeDasharray="3 16"/>
        <path d={`M30 77H${pos}`} stroke="#ffe0b9" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M551 24V121m13-97v97m-33-17 53-54m-53 30 53-54" stroke="#f3ad87" strokeWidth="5" strokeLinecap="round" transform={`translate(${recoil*.6},0)`}/>
        <circle cx={pos} cy="77" r="13" fill="#ffc89f" stroke="#231739" strokeWidth="4"/>
        <circle cx="530" cy="77" r={20+57*ring} fill="none" stroke="#ffc89f" strokeWidth="4" opacity={local>=impact?1-ring:0}/>
      </svg>
    </div>
    <div className="price-state" style={{opacity:denied,transform:`translateY(${(1-denied)*16}px)`}}>
      <div className="result-mark"><Glyph name="block" size={31}/><b>IMEZUIWA</b></div>
      <div className="price-state-main" style={{opacity:.35+.65*price}}>
        <strong><small>TSh</small> {format(proof.book.before)} <i>→</i> {format(proof.book.after)}</strong>
        <div className="price-meta"><span>BEI YA MFANO · KABLA / BAADA</span><b>Haijabadilika.</b></div>
      </div>
    </div>
    <Sticker name="lock" left={668} top={749} size={190} frame={local} fps={fps} delay={112} turn={11} depth={8}/>
  </>;
}

function Approval({local,fps}:{local:number;fps:number}){
  const spread=ease(local,0,38);
  const rev=ease(local,75,113);
  const show=ease(local,151,180);
  return <>
    <div className="approval-shot" style={{transform:`translate(${(1-spread)*33}px,${(1-spread)*20}px) rotate(${3.1+1.05*Math.sin(local/145)}deg)`}}>
      <Img src={art('desk-approval.webp')} alt="Kielelezo: mkono unashika beji, mfano wa idhini ya mtu"/>
    </div>
    <div className="decision-docket" style={{transform:`translateY(${(1-spread)*24}px) rotate(-3deg)`}}>
      <div className="docket-label">WEKA RUHUSA</div>
      <div><span>AI</span><strong>Isome stoo</strong></div>
      <div className="docket-second" style={{opacity:.15+.85*rev}}><span>MTU</span><strong>Aidhinishe<br/>mabadiliko</strong></div>
    </div>
    <Sticker name="stamp" left={698} top={679} size={169} frame={local} fps={fps} delay={93} turn={12} depth={10}/>
    <span className="approval-photo-credit">PICHA YA KIELELEZO</span>
    <div className="save-line" style={{opacity:show,transform:`translateY(${(1-show)*15}px)`}}><Glyph name="bookmark" size={38}/><b>Hifadhi kabla ya kuunganisha AI.</b></div>
  </>;
}

export function AccessReel({cues,proof,cover}:Props){
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const idx=cover?0:cues.findIndex(c=>frame>=c.sceneStart&&frame<c.sceneEnd);
  const cue=cues[Math.max(0,idx)];
  const local=cover?171:frame-cue.sceneStart;
  const shot=Math.max(0,idx);
  const title=headings[shot];
  const inCaption=!cover&&frame>=cue.start&&frame<cue.captionEnd;
  const pageSwitch=shot===0||cover?1:ease(local,0,22);
  return <AbsoluteFill className={`access-stage access-${cue.scene}${cover?' access-cover':''}`}>
    {!cover&&<Audio src={art('mix.wav')}/>}
    <div className="paper-wash"/>
    <ContourField frame={frame} scene={shot}/>
    <div className="folio" aria-hidden="true"><span>06 / ALTRAWARE</span><span>DAR ES SALAAM</span></div>
    <div className="corner-fold" aria-hidden="true" style={{transform:`translate(${Math.cos(frame/104)*7}px,${Math.sin(frame/121)*9}px)`}}/>
    {shot===0&&<Hero local={local} fps={fps} cover={!!cover}/>}
    {shot===1&&<News local={local} fps={fps}/>}
    {shot===2&&<StockRead local={local} fps={fps} proof={proof}/>}
    {shot===3&&<PriceGate local={local} fps={fps} proof={proof}/>}
    {shot===4&&<Approval local={local} fps={fps}/>}
    <header className="studio" aria-label="Altraware Technology"><Img src={art('altraware.png')} alt=""/><div>Altraware<span> / FIELD NOTES</span></div></header>
    <div className="main-type" style={{transform:`translateY(${(1-pageSwitch)*17}px)`,opacity:.84+.16*pageSwitch}}>
      <div className="tagline"><i/>{tagLines[shot]}</div>
      <h1><span>{title[0]}</span>{title[1]&&<em>{title[1]}</em>}</h1>
    </div>
    {inCaption&&<div className="reel-captions" aria-label="Manukuu ya Kiswahili">{cue.sw.map(line=><span key={line}>{line}</span>)}</div>}
    {cover&&<div className="cover-sub">Zana za AI na ruhusa za biashara.</div>}
    <div className="spine" aria-hidden="true"><i style={{transform:`scaleX(${cover?1:frame/1799})`}}/></div>
  </AbsoluteFill>;
}
