import React from 'react';
import {AbsoluteFill,Img,Sequence,staticFile,useCurrentFrame} from 'remotion';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import {TechHost,go,type Rig} from './TechHost';
import layout from './layout.json';
import './story.css';

type TraceEvent={event:string;id:number;forQuery:string;query:string;status:string;rows:string[];notice:string|null};
type Path={trace:TraceEvent[];final:{query:string;rows:string[];status:string}};
export type Proof={before:Path;after:Path;oldError:Path;successExcerpt:string[]};
export type Shot={shot:string;start:number;end:number};
export type Props={shots:Shot[];rig:Rig;proof:Proof;cover?:boolean};
const mark=staticFile('search-race/altraware.png');
function Brand({bright=false}:{bright?:boolean}){return <div className={`sr-brand ${bright?'bright':''}`}><Img src={mark} alt=""/><b>ALTRAWARE</b><i/> CODE STORY / 01</div>;}
function Head({tag,children,bright=false}:{tag:string;children:React.ReactNode;bright?:boolean}){return <header className={`sr-head ${bright?'bright':''}`}><div><i/>{tag}</div><h1>{children}</h1></header>;}
function Floor({floor,x=540,w=490}:{floor:number;x?:number;w?:number}){return <div className="sr-floor" style={{left:x,top:floor-42,width:w}}><i/><i/><i/><b/></div>;}
function Result({input,value,wrong=false,style,cls='',status}:{input:string;value?:string;wrong?:boolean;style?:React.CSSProperties;cls?:string;status?:string}){return <div className={`sr-result ${wrong?'wrong':''} ${cls}`} style={style}>
 <div className="sr-result-top"><i/>SEARCH · DEMO{status&&<span>{status}</span>}</div>
 <div className="sr-result-values"><div><small>QUERY</small><b>{input||'—'}</b></div><div><small>RESULT</small><b>{value||'—'}</b></div></div>
 </div>;}
function Hook({rig,proof,cover=false}:{rig:Rig;proof:Proof;cover?:boolean}){
 const f=useCurrentFrame();const swap=cover?1:go(f,99,119);const bug=cover?1:go(f,210,252);const intro=cover?1:go(f,5,28);
 return <AbsoluteFill className="sr-scene sr-hook"><div className="sr-side"/><div className="sr-ring"/><Brand/>
  <Head tag="SEARCH · MFANO WA MENU">Umeandika <em>chai.</em></Head>
  <div className="sr-question">Mbona pilau imerudi?</div>
  <Floor floor={1271}/><TechHost rig={rig} pose="hello" frame={f} x={555} floor={1271} width={454} blinks={[102,283]} still={cover}/>
  <Result input={proof.before.final.query} value={swap>.48?proof.before.final.rows[0]:proof.before.trace[2].rows[0]} wrong={swap>.48} style={{opacity:.8+.2*intro}}/>
  <div className="sr-bug-note" style={{opacity:bug}}>{cover?'TIMING BUG':'BUG YA TIMING · SI TYPO'}</div>
 </AbsoluteFill>;
}
function Lane({e,n,f,t}:{e:TraceEvent;n:number;f:number;t:number}){
 const p=go(f,t,t+16);const ignored=e.event.startsWith('ignored');
 const status=n<2?'IMETUMWA':n===2?'IMEJIBU KWANZA':e.event==='ignored-error'?'ERROR IMEPUUZWA':ignored?'IMEPUUZWA':'IMEFIKA LATE';
 return <div className={`sr-event ${n===3?(ignored?'drop':'late'):n===2?'good':''}`} style={{visibility:f<t?'hidden':undefined,opacity:.42+.58*p,transform:`translateX(${(1-p)*(-18)}px)`}}>
  <span>0{n+1}</span><b>#{e.id} {e.forQuery}</b><small>{status}</small>
 </div>;
}
function TraceWire({f,t,row,blocked,late}:{f:number;t:number;row:number;blocked:boolean;late:boolean}){
 const p=go(f,t,t+27),hold=1-go(f,t+48,t+88);if(p===0||hold===0)return null;
 const col=blocked?'#437d7c':late?'#b85361':'#398579';
 const d=`M 676 ${row===2?784:875} h 19 q 12 0 12 16 V 1052 q 0 11 -11 11 H ${blocked?641:605}`;
 return <svg className="sr-wire" viewBox="0 0 1080 1920" aria-hidden style={{opacity:hold}}>
  <path d={d} fill="none" stroke={col} strokeWidth="4" strokeLinecap="round" opacity=".22"/>
  <path d={d} pathLength="100" fill="none" stroke={col} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${Math.max(1,p*100)} 102`}/>
  {blocked&&<g opacity={go(f,t+22,t+36)}><circle cx="642" cy="1063" r="12" fill="#f6fff8" stroke={col} strokeWidth="3"/><path d="M 637 1058 l 10 10 m 0 -10 l -10 10" stroke={col} strokeWidth="3"/></g>}
 </svg>;
}
function Race({rig,proof,fixed=false}:{rig:Rig;proof:Proof;fixed?:boolean}){
 const f=useCurrentFrame();const data=fixed?proof.after:proof.before;const events=fixed?layout.repeat:layout.race;
 const n=events.reduce((v,t,i)=>f>=t?i:v, -1);
 const err=fixed&&f>=layout.oldError;const errLevel=err?go(f,layout.oldError-1,layout.oldError+20):0;
 const current=err?proof.oldError.trace[3]:data.trace[n];
 const after=go(f,events[3],events[3]+23);const win=fixed&&n===3;
 return <AbsoluteFill className={`sr-scene sr-race ${fixed?'fixed':''}`}><div className="sr-grid"/><Brand/>
  <Head tag={!fixed?'01 / BILA GUARD':err?'04 / TEST NYINGINE · ERROR':'03 / MPANGILIO ULEULE · GUARD ON'}>{win?<>Chai <em>imebaki.</em></>:fixed?<>Rudia <em>test.</em></>:<>Nani <em>kajibu?</em></>}</Head>
  <div className="sr-lanes">{data.trace.map((e,i)=><Lane e={err&&i===3?current:e} n={i} f={f} t={events[i]} key={i}/>)}</div>
  {n>=2&&<TraceWire f={f} t={err?layout.oldError:events[n]} row={n} blocked={win} late={!fixed&&n===3}/>}
  <Floor floor={1269} x={617} w={423}/><TechHost rig={rig} pose="point" frame={f} x={645} floor={1269} width={385} blinks={[94,313]} points={[events[1]+16,events[2]+18,events[3]+15,...(fixed?[layout.oldError+15]:[])]}/>
  <Result input={current?.query||''} value={current?.rows[0]} wrong={!fixed&&n===3} status={n===3?(fixed?'PASS':'FAIL'):undefined}/>
  <div className="sr-trace-note" style={{opacity:after}}>{err?'#1 ERROR · RESULT BADO CHAI':fixed?'#1 HAIJABADILI SCREEN':'QUERY BADO CHAI · RESULT PILAU'}</div>
  {err&&<div className="sr-old-error" style={{opacity:errLevel,transform:`translateY(${(1-errLevel)*12}px)`}}>TUMEBADILI JIBU LA #1 TU</div>}
 </AbsoluteFill>;
}
function Code({proof}:{proof:Proof}){
 const f=useCurrentFrame();const intro=go(f,8,48);const id=go(f,88,125);const guard=go(f,208,243);const note=go(f,392,423);
 return <AbsoluteFill className="sr-scene sr-fix"><div className="sr-grid"/><div className="sr-corner"/><Brand bright/>
  <Head bright tag="02 / LATEST REQUEST WINS">Request mpya.<br/><em>Jibu lake tu.</em></Head>
  <div className="sr-code" style={{opacity:.84+.16*intro,transform:`translateY(${(1-intro)*16}px)`}}><div><i/><i/><i/><b>SUCCESS PATH · EXCERPT</b></div>
   {proof.successExcerpt.map((line,i)=><div className="sr-code-line" key={i} style={{background:i===3?`rgba(91,228,204,${.22*guard})`:i===0?`rgba(136,169,255,${.23*id*(1-guard)})`:undefined,opacity:i===3?1:.57+.43*(i===0?id*(1-guard):i===1?1-guard:note)}}><small>{i+1}</small><code>{line.split(/(\b(?:const|await|if|return|latest|lookup|show)\b)/).map((part,j)=><span key={j} className={/^(const|await|if|return)$/.test(part)?'sr-kw':/^(latest|lookup|show)$/.test(part)?'sr-sym':undefined}>{part}</span>)}</code></div>)}
  </div>
  <div className="sr-block" style={{opacity:note}}><i>×</i><div><small>OLD REQUEST</small><b>Usi-update UI.</b></div></div>
 </AbsoluteFill>;
}
function End({rig}:{rig:Rig}){
 const f=useCurrentFrame();const enter=go(f,29,79);const hold=Math.min(f,206);const punch=go(f,20,29)-go(f,29,55);
 return <AbsoluteFill className="sr-scene sr-end"><div className="sr-side"/><div className="sr-ring"/><Brand/>
  <Head tag="MFANO WA CODE · DM">Comment<strong style={{transform:`scale(${1+.04*punch})`,transformOrigin:'left center'}}>SEARCH</strong></Head>
  <Floor floor={1268} x={527}/><TechHost rig={rig} pose="hello" frame={hold} x={544} floor={1268} width={468} blinks={[114]}/>
  <div className="sr-end-note" style={{opacity:.8+.2*enter}}>Nikutumie<br/>mfano wa code.</div>
  <div className="sr-resource" style={{opacity:enter,transform:`translateY(${(1-enter)*17}px)`}}><b>{'{ }'}</b><span>JAVASCRIPT EXAMPLE<br/>+ TESTS</span></div>
 </AbsoluteFill>;
}
export function Story({shots,rig,proof,cover=false}:Props){
 const f=useCurrentFrame();const i=cover?0:shots.findIndex(s=>s.start<=f&&f<s.end);const s=shots[Math.max(i,0)];
 const scene:Record<string,React.ReactNode>={hook:<Hook rig={rig} proof={proof} cover={cover}/>,race:<Race rig={rig} proof={proof}/>,fix:<Code proof={proof}/>,repeat:<Race rig={rig} proof={proof} fixed/>,cta:<End rig={rig}/>};
 return <AbsoluteFill className="sr-root"><Sequence from={s.start} durationInFrames={s.end-s.start} layout="none" key={s.shot}>{scene[s.shot]}</Sequence>
 {!cover&&<div className={`sr-track ${s.shot==='fix'?'bright':''}`}>{shots.map((a,j)=><i key={a.shot} style={{opacity:j===i?1:j<i?.51:.19}}/>)}</div>}
 </AbsoluteFill>;
}
