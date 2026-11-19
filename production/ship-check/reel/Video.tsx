import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {keyword} from '../guide.mjs';

export type Cue = {shot: string; sw: string[]; en: string[]; start: number; end: number};
export type ReelProps = {cues: Cue[]; durationInFrames: number; cover?: boolean};
const range = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const ease = (p:number,a:number,b:number) => interpolate(p,[a,b],[0,1],{...range,easing:Easing.inOut(Easing.cubic)});
const show = (p:number,a:number,b:number):React.CSSProperties => {
  const t=ease(p,a,b);
  return {opacity:t,transform:`translateY(${(1-t)*22}px)`};
};
const image = (name:string) => staticFile(`ship-check/${name}`);
const chapter:Record<string,{label:string;title:[string,string];sub:string;light?:boolean}> = {
  hook:{label:'VIBE CODING · LOCAL LAB',title:['App inasema','“Saved”.'],sub:'Ukirefresh, note ipo?'},
  before:{label:'BROWSER TEST · KABLA',title:['Zote zilisema','“Saved”.'],sub:'Build A na Build B · note ileile.'},
  proof:{label:'BROWSER TEST · BAADA',title:['Tulirefresh.','Ipi ilibaki?'],sub:'Picha za test kwenye browser hiyohiyo.'},
  why:{label:'KWA NINI? · LOCAL LAB',title:['Toast sawa.','Storage tofauti.'],sub:'Ujumbe wa Save si uthibitisho wa rekodi.',light:true},
  save:{label:'TEST 01 · REKODI',title:['Save. Refresh.','Kagua rekodi.'],sub:'Kagua data yenyewe, si toast pekee.',light:true},
  net:{label:'TEST 02 · CONNECTION',title:['Kata net','katikati.'],sub:'Jaribu kwenye staging, si kwa data halisi.'},
  retry:{label:'TEST 03 · DUPLICATE',title:['Bonyeza','mara mbili.'],sub:'Tap mbili zisitengeneze rekodi mbili.',light:true},
  cta:{label:'SHIP CHECK · CHECKLIST',title:['Comment',keyword],sub:'Nikutumie PDF kabla ya kukabidhi app.'},
};

function Refresh({turn=0,size=58}:{turn?:number;size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="refresh" aria-hidden style={{transform:`rotate(${turn}deg)`}}>
    <path d="M9 19a16 16 0 1 1 .6 13M6 10l2 11 11-2" stroke="currentColor" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function Pointer({p}:{p:number}) {
  const reach=ease(p,.07,.28);
  const ring=1-ease(p,.28,.40);
  return <svg className="pointer" style={{left:76+(1-reach)*49,top:175+(1-reach)*38,opacity:ease(p,.03,.11)*(1-ease(p,.37,.47))}}
    viewBox="0 0 68 68" width="65" height="65" aria-hidden>
    <circle cx="16" cy="12" r={10+(1-ring)*25} opacity={p<.28?0:ring} fill="none" stroke="#d9fd92" strokeWidth="2.8"/>
    <path d="M15 6v35l10-8 7.8 12.5 6.9-4-7.3-12 13-1.5z" fill="#fff" stroke="#111429" strokeWidth="3"/>
  </svg>;
}
function Hero({p}:{p:number}) {
  return <div className="panel hero">
    <div className="panel-bar mono"><i/><i/><i/> <span>NOTE QA-01 / BUILD A</span></div>
    <div className="hero-form">
      <Img src={image(p<.28?'A-form-ready.png':'A-form-saved.png')} alt="Browser capture of the local QA-01 note form"/>
      <Pointer p={p}/>
    </div>
    <div className="loop" style={{transform:`rotate(${145*ease(p,.52,.92)}deg)`}}><Refresh size={184}/></div>
    <strong className="loop-question">?</strong>
    <div className="panel-foot mono"><span>PICHA YA LOCAL LAB</span><strong>{p<.28?'01 / SAVE':p<.56?'02 / SAVED':'03 / REFRESH?'}</strong></div>
  </div>;
}
function Before({p}:{p:number}) {
  return <div className="compare">
    <div className="pair">{['A','B'].map((b,i)=><div key={b} className="scan-card" style={{...show(p,i*.19,.19+i*.22)}}>
      <header className="mono">BUILD {b}<b>✓ Saved</b></header>
      <Img src={image(`${b}-form-saved.png`)} alt={`Browser capture of Build ${b} saying Saved`}/>
    </div>)}</div>
    <div className="reload-bar mono" style={show(p,.37,.64)}><span><Refresh turn={220*ease(p,.58,.93)}/> JARIBU REFRESH</span><b>QA-01</b>
      <i style={{width:`${100*ease(p,.57,.99)}%`}}/></div>
  </div>;
}
function Proof({p}:{p:number}) {
  const swipe=ease(p,0,.11);
  return <div className="compare">
    <div className="pair">{['A','B'].map((b,i)=><div key={b} className="scan-card receipt" style={show(p,i*.20,.19+i*.22)}>
      <header className="mono">BUILD {b}<b className={i===0?'fail':''}>{i===0?'FAIL':'PASS'}</b></header>
      <Img src={image(`${b}.png`)} alt={`Actual saved-note list after refresh in Build ${b}`}/>
      <strong>{i===0?'Note haikubaki.':'QA-01 ilibaki.'}</strong>
    </div>)}</div>
    <div className="proof-source mono" style={show(p,.43,.61)}>PICHA ZA BROWSER TEST · DATA YA MFANO</div>
    {swipe<1 && <div className="scan-swipe" style={{opacity:.8*(1-swipe),transform:`translateY(${275*swipe}px)`}}/>}
  </div>;
}
function Why({p}:{p:number}) {
  return <div className="evidence-path">
    <div className="path-row" style={show(p,.02,.20)}><samp>A</samp><div><strong>Memory ya muda</strong><span>Haikudumu baada ya refresh.</span></div><b className="mono">0</b></div>
    <div className="path-row kept" style={show(p,.36,.56)}><samp>B</samp><div><strong>Storage ya browser</strong><span>Note ileile ilisalia.</span></div><b className="mono">1</b></div>
    <p className="path-foot" style={show(p,.55,.7)}>Hii haithibitishi cloud sync.</p>
  </div>;
}
function Save({p}:{p:number}) {
  return <div className="save-check">
    <div className="step-row">{[['01','SAVE','Andika QA-01'],['02','REFRESH','Pakia tena'],['03','HAKIKI','Tafuta note']].map(([num,lab,act],i)=>
      <div key={num} className="action-tile" style={show(p,.14*i,.2+.14*i)}><small className="mono">{num} / {lab}</small><span>{i===1?<Refresh size={56}/>:i===0?'+':'✓'}</span><strong>{act}</strong></div>)}</div>
    <div className="expected" style={show(p,.50,.7)}><b className="mono">PASS</b> Rekodi moja. Data ileile.</div>
  </div>;
}
function Net({p}:{p:number}) {
  const drop=ease(p,.13,.37);
  return <div className="panel connection">
    <div className="offline"><svg viewBox="0 0 176 158" width="162" height="146" aria-hidden fill="none">
      <path d="M9 50C55 6 121 6 167 50M32 75c31-32 81-32 112 0M55 102a45 45 0 0 1 66 0" stroke="#b8a5ff" strokeWidth="10" strokeLinecap="round"/>
      <circle cx="88" cy="130" r="6" fill="#b8a5ff"/>
      <path d="M32 147 145 16" stroke="#1d2140" strokeWidth="22" strokeLinecap="round" opacity={drop}/>
      <path d="M32 147 145 16" stroke="#d9fd92" strokeWidth="8" strokeLinecap="round" opacity={drop}/>
    </svg></div>
    <div className="connection-body">
      <span className="mono">MFANO · RECONNECT + RETRY</span>
      <div className="connection-states mono"><b>Pending</b><span>→</span><b className="synced" style={{opacity:.42+.58*ease(p,.49,.72)}}>Synced</b></div>
      <strong style={show(p,.42,.62)}>Baada ya uthibitisho tu.</strong>
    </div>
  </div>;
}
function Retry({p}:{p:number}) {
  return <div className="retry-panel">
    <div>{[.19,.32].map((f,i)=><div key={f} className="tap-row mono" style={{...show(p,f-.16,f+.06),borderColor:'#8263ee',borderWidth:2+Math.round(3*Math.max(0,1-Math.abs(p-f)/.075))}}><b>0{i+1}</b> Submit</div>)}</div>
    <b className="toward" style={show(p,.30,.51)}>→</b>
    <div className="once" style={show(p,.39,.57)}><small className="mono">PASS</small><strong className="mono">01</strong><p>rekodi, si mbili.</p></div>
    <p className="retry-foot">DATA YA MFANO · HAKUNA MALIPO HALISI</p>
  </div>;
}
function End({p}:{p:number}) {
  return <div className="panel end-guide">
    <div className="end-list">
      <span className="mono">NDANI YA PDF</span>
      {['Test 7 za app','Jinsi ya kujua PASS','Rekodi ya matokeo'].map((x,i)=><div key={x} style={show(p,.07+i*.095,.24+i*.095)}><b>✓</b>{x}</div>)}
      <small className="mono">KISWAHILI / ENGLISH</small>
    </div>
    <Img src={image('guide-sw-01.png')} alt="The actual Ship Check PDF cover" style={{transform:`rotate(${4+4*ease(p,.05,.42)}deg) translateY(${24*(1-ease(p,.05,.42))}px)`}}/>
  </div>;
}

export function Reel({cues,durationInFrames,cover=false}:ReelProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cuts=cues.map((c,i)=>i===0?0:Math.max(cues[i-1].end,c.start-5));
  const index=cuts.reduce((last,t,i)=>frame>=t?i:last,0);
  const cue=cues[index], shot=chapter[cue.shot];
  const local=frame-cuts[index];
  const p=Math.max(0,Math.min(1,(frame-cue.start)/(cue.end-cue.start)));
  const end=cue.shot==='cta';
  const enter=Math.max(0,Math.min(1,spring({frame:local,fps,config:{damping:18,stiffness:150,mass:.68}})));
  const showCaption=frame>=cue.start && (frame<cue.end || end) && !cover;
  const art = {hook:<Hero p={p}/>,before:<Before p={p}/>,proof:<Proof p={p}/>,why:<Why p={p}/>,save:<Save p={p}/>,net:<Net p={p}/>,retry:<Retry p={p}/>,cta:<End p={p}/>}[cue.shot];

  return <AbsoluteFill className={`ship-reel ${shot.light?'ship-light':''} shot-${cue.shot}`}>
    {!cover && <Html5Audio src={image('narration.wav')}/>}
    <div className="ship-grid" aria-hidden style={{transform:`translateY(${(-32*p).toFixed(2)}px)`}}/>
    <div className="ship-corner" aria-hidden/>
    <header className="ship-brand"><span><Img src={image('mark.png')} alt=""/>Altraware Technology</span><small className="mono">BUILD NOTES / 02</small></header>
    <section className="ship-title" style={{transform:`translateY(${(1-enter)*23}px)`,opacity:.68+.32*enter}}>
      <div className="reel-kicker mono"><i/>{shot.label}</div>
      <h1>{shot.title[0]}<br/><em>{shot.title[1]}</em></h1>
      <p>{shot.sub}</p>
    </section>
    <div className="ship-art" style={{transform:`translateY(${(1-enter)*26}px)`,opacity:.7+.3*enter}}>{art}</div>
    {showCaption && <aside className="ship-caption" lang="sw">{cue.sw.map((t,i)=><span key={i}>{t}</span>)}</aside>}
    {!cover && <footer className="ship-footer mono"><span>SHIP CHECK</span><div className="ship-ticks">{cues.map(({shot},i)=><i key={shot} className={i<=index?'seen':''}/>)}</div><span>{String(index+1).padStart(2,'0')} / 08</span>
      <div className="ship-time"><i style={{width:`${100*(frame+1)/durationInFrames}%`}}/></div></footer>}
  </AbsoluteFill>;
}
