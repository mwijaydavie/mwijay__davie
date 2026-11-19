import React from 'react';
import {AbsoluteFill,Easing,Img,OffthreadVideo,Sequence,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import {art} from './art.mjs';
import './reel.css';

export type Cue={shot:string;sw:string[];en:string[];tts:string;sceneStart:number;sceneEnd:number;start:number;end:number;captionEnd:number};
export type ReadProof={direct:{endpoint:string;status:number;body:{sku:string;units:number}};mcp:{listed:string[];tool:string;body:{sku:string;units:number}};missing:{direct:number;mcpError:boolean};writeMethod:number};
export type Props={cues:Cue[];proof:ReadProof;cover?:boolean};
const media=(name:string)=>staticFile(`api-tip/${name}`);
const unit=(v:number)=>Math.min(1,Math.max(0,v));
const draw=(frame:number,a:number,b:number)=>interpolate(frame,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.22,1,.36,1)});
const approach=(frame:number,a:number,b:number)=>unit((frame-a)/(b-a));

function Stamp({kind,left,top,width,at=0,rotate=0}:{kind:keyof typeof art;left:number;top:number;width:number;at?:number;rotate?:number}){
  const n=useCurrentFrame()-at;
  const {fps}=useVideoConfig();
  const a=art[kind];
  const kick=spring({fps,frame:n,durationInFrames:39,config:{stiffness:156,damping:14,mass:.7}});
  return <svg className="tip-stamp" style={{left,top,width,height:width,opacity:draw(n,0,9),transform:`translateY(${5*Math.sin(n/55)}px) rotate(${rotate-(1-kick)*13}deg) scale(${.67+kick*.33})`}} viewBox="-6 -6 112 112" aria-hidden="true">
    <path fill={a.paper} stroke="#fff" strokeWidth="5" d={a.outline}/><g fill="none" stroke={a.ink} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.3">
      {a.paths.map((d,j)=><path key={d} d={d} pathLength={100} strokeDasharray="100 102" strokeDashoffset={100*(1-draw(n,5+4*j,34+5*j))}/>)}
    </g></svg>;
}
function Brand({tone}:{tone:'dark'|'light'}){
  return <div className={`tip-brand tip-brand-${tone}`}><Img src={media('altraware.png')} alt=""/><strong>ALTRAWARE</strong><span>TECH TIP / 01</span></div>;
}
function Note({children}:{children:React.ReactNode}){return <div className="tip-note"><i/>{children}</div>;}

function Hook({cover}:{cover:boolean}){
  const f=useCurrentFrame();
  const tag=cover?1:draw(f,99,129);
  return <AbsoluteFill className="hook-stage">
    <OffthreadVideo src={media('packing.mp4')} className="pack-film" trimBefore={24} muted style={{transform:`scale(${1.02+.07*approach(f,0,285)})`}}/>
    <div className="film-grade"/>
    <Brand tone="light"/>
    <div className="hook-type"><Note>MABOKSI MANGAPI YAMEBAKI?</Note><h1>MCP au <em>API?</em></h1><p>Unahitaji ipi?</p></div>
    <div className="packing-focus" style={{opacity:tag,transform:`translateY(${(1-tag)*11}px)`}}>
      <svg viewBox="0 0 570 218" aria-hidden="true"><path d="M53 170V63q0-24 24-24h334m98 27v87q0 26-25 26H196" stroke="#d8fa77" strokeWidth="4" strokeLinecap="round" fill="none" strokeDasharray="9 14"/><circle cx="509" cy="66" r="7" fill="#d8fa77"/></svg>
      <span>SWALI LA MFANO</span>
    </div>
    <Stamp kind="route" left={680} top={765} width={187} at={40} rotate={10}/>
    <small className="stock-label hook-stock">B-ROLL · PICHA YA STOO</small>
    {cover&&<div className="cover-ticket">Mwongozo wa bure ndani ya episode.</div>}
  </AbsoluteFill>;
}

function Direct({proof}:{proof:ReadProof}){
  const f=useCurrentFrame();
  const move=approach(f,30,125);
  const show=draw(f,124,165);
  const crop=draw(f,186,233);
  return <AbsoluteFill className="direct-stage">
    <div className="direct-grid" aria-hidden="true" style={{transform:`translate(${f*.10}px,${f*.07}px)`}}/>
    <div className="direct-label" aria-hidden="true">GET</div>
    <Brand tone="dark"/>
    <header className="tip-head direct-head"><Note>01 / NJIA YA MOJA KWA MOJA</Note><h1>App iite <em>API.</em></h1><p>Endpoint inajulikana.</p></header>
    <div className="direct-line">
      <div className="direct-names"><span>App ya stoo</span><span>API ya stoo</span></div>
      <svg viewBox="0 0 750 46" aria-hidden="true"><path d="M27 25h696" stroke="#b6bdcf" strokeWidth="5" strokeDasharray="7 10" fill="none"/>
        <path d={`M27 25H${27+696*move}`} stroke="#3547cc" strokeWidth="5" strokeLinecap="round"/>
        <circle cx={27+696*move} cy="25" r="14" fill="#3547cc" stroke="#fff" strokeWidth="4"/></svg>
      <div className="get-line"><b>GET</b><code>{proof.direct.endpoint}</code></div>
    </div>
    <div className="api-reply" style={{opacity:show,transform:`translateY(${(1-show)*19}px)`}}><b>{proof.direct.status} OK</b><strong>{proof.direct.body.units}</strong><span>vipande · data ya mfano</span></div>
    <div className="owner-crop" style={{opacity:crop,transform:`translate(${(1-crop)*34}px,0) rotate(-5deg)`}}><Img src={media('faida-context.webp')} alt="FaidaHQ preview, taarifa ya stoo yenye data iliyofichwa"/><span>PREVIEW · SI JARIBIO</span></div>
    <Stamp kind="scan" left={710} top={611} width={147} at={113} rotate={12}/>
  </AbsoluteFill>;
}

function MCP({proof}:{proof:ReadProof}){
  const f=useCurrentFrame();
  const list=draw(f,95,132);
  const pick=draw(f,200,234);
  const call=draw(f,281,324);
  return <AbsoluteFill className="mcp-stage">
    <div className="mcp-slit" aria-hidden="true" style={{transform:`translateX(${Math.sin(f/115)*36}px) rotate(-14deg)`}}/>
    <div className="mcp-outline" aria-hidden="true">MCP</div>
    <Brand tone="light"/>
    <header className="tip-head mcp-head"><Note>02 / MCP · ITIFAKI YA PAMOJA</Note><h1>App ya AI<br/><em>igundue zana.</em></h1></header>
    <section className="tool-explorer">
      <div className="explorer-title"><b>APP YA AI</b><span>CLIENT → MCP SERVER</span></div>
      <div className="explorer-list"><em>01</em><code>tools/list</code><span>Orodhesha zana</span></div>
      <div className="explorer-tool" style={{opacity:list,transform:`translateX(${(1-list)*25}px)`,backgroundColor:pick>.45?'#ddfa79':'#f6f9ff'}}><span className="tool-icon" aria-hidden="true">⌘</span><b>{proof.mcp.tool}</b><span>{pick>.45?'IMECHAGULIWA':'ZANA ILIYOPO'}</span></div>
      <div className="explorer-call" style={{opacity:call,transform:`translateY(${(1-call)*14}px)`}}><em>02</em><code>tools/call</code><span>Iite zana hiyo</span></div>
    </section>
    <div className="lab-tag mcp-tag">JARIBIO LA NDANI · DATA YA MFANO</div>
  </AbsoluteFill>;
}

function Merge({proof}:{proof:ReadProof}){
  const f=useCurrentFrame();
  const left=draw(f,10,131),right=draw(f,71,150),shown=draw(f,154,193),permission=draw(f,207,237);
  return <AbsoluteFill className="merge-stage">
    <div className="merge-band"><OffthreadVideo src={media('dispatch.mp4')} muted trimBefore={24} className="belt-film"/>
      <div className="belt-grade"/>
    </div>
    <Brand tone="dark"/>
    <header className="tip-head merge-head"><Note>03 / JIBU LILELILE</Note><h1>Njia mbili.<br/><em>API ileile.</em></h1></header>
    <div className="merge-lines">
      <svg className="belts" viewBox="0 0 790 256" aria-hidden="true">
        <path d="M45 63H277c129 0 131 66 212 66H739" fill="none" stroke="#e4e3ff" opacity=".65" strokeWidth="4" strokeLinecap="round"/>
        <path d="M45 194h234c129 0 131-65 210-65h250" fill="none" stroke="#e5f2b6" opacity=".65" strokeWidth="4" strokeLinecap="round"/>
        <path d="M45 63H277c129 0 131 66 212 66H739" fill="none" stroke="#eef0ff" strokeWidth="8" pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-left)} strokeLinecap="round"/>
        <path d="M45 194h234c129 0 131-65 210-65h250" fill="none" stroke="#ddfb7c" strokeWidth="8" pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-right)} strokeLinecap="round"/>
        <circle cx="738" cy="129" r={13+8*(1-shown)} fill="#e5fcaa" opacity={shown}/>
      </svg>
      <div className="merge-from">DIRECT</div><div className="merge-from mcp-from">MCP</div><div className="merge-to">API YA STOO</div>
    </div>
    <div className="equal" style={{opacity:shown,transform:`translateY(${(1-shown)*17}px)`}}>
      <strong>{proof.direct.body.units} <i>=</i> {proof.mcp.body.units}</strong><div><b>Vipande, rekodi ileile.</b><span>JARIBIO LA NDANI · DATA YA MFANO</span></div>
    </div>
    <div className="merge-auth" style={{opacity:permission}}>Ruhusa huamuliwa na backend.</div>
    <small className="stock-label belt-stock">B-ROLL · CONVEYOR</small>
  </AbsoluteFill>;
}

function CTA(){
  const f=useCurrentFrame();
  const pages=draw(f,6,47);
  const note=draw(f,96,134);
  const next=draw(f,181,210);
  return <AbsoluteFill className="cta-stage">
    <svg className="cta-ribbon" viewBox="0 0 1080 1920" aria-hidden="true" style={{transform:`translateY(${24*Math.sin(f/120)}px)`}}><path d="M966-60v474q0 171-180 224l-419 122Q126 830 126 1068v879" stroke="#c1e553" strokeWidth="14" fill="none"/><path d="M1033-50v482q0 189-189 247l-443 136q-224 65-224 284v849" stroke="#e0f6a0" strokeWidth="110" fill="none"/></svg>
    <Brand tone="dark"/>
    <div className="cta-content"><Note>TECH TIP / GUIDE YA BURE</Note><h1>Comment<br/><em>API</em></h1><p>Mwongozo<br/>wa bure.</p></div>
    <div className="book-stack" style={{opacity:pages,transform:`translate(${(1-pages)*51}px,${(1-pages)*29}px) rotate(${4+(1-pages)*-13}deg)`}}>
      <Img className="book-inside" src={media('guide-proof.png')} alt="Ukurasa wa jaribio katika PDF"/>
      <Img className="book-front" src={media('guide-cover.png')} alt="Jalada la PDF: API na MCP"/>
    </div>
    <Stamp kind="guide" left={675} top={595} width={163} at={62} rotate={11}/>
    <div className="book-benefits" style={{opacity:note,transform:`translateY(${(1-note)*14}px)`}}>Mifano ya API/MCP <i/> Checklist <i/> Model docs</div>
    <div className="episode-next" style={{opacity:next}}>IJAYO <b>Stoo ikikosa jibu, AI iseme sifuri?</b></div>
  </AbsoluteFill>;
}

export function APITip({cues,proof,cover}:Props){
  const frame=useCurrentFrame();
  const shot=cover?0:cues.findIndex(c=>frame>=c.sceneStart&&frame<c.sceneEnd);
  const c=cues[Math.max(0,shot)];
  return <AbsoluteFill className="api-tip">
    <Sequence from={c.sceneStart} durationInFrames={c.sceneEnd-c.sceneStart} layout="none" key={c.shot}>
      {shot===0&&<Hook cover={!!cover}/>}
      {shot===1&&<Direct proof={proof}/>}
      {shot===2&&<MCP proof={proof}/>}
      {shot===3&&<Merge proof={proof}/>}
      {shot===4&&<CTA/>}
    </Sequence>
    {!cover&&<div className={`tip-spine s${shot}`} aria-hidden="true">{cues.map((x,i)=><i key={x.shot} style={{opacity:i===shot?1:.43,transform:`scaleX(${i===shot?(.45+.55*approach(frame,c.sceneStart,c.sceneEnd-1)):1})`}}/>)}</div>}
  </AbsoluteFill>;
}
