import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {cases, order, paid, simulate} from './lab.mjs';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/jetbrains-mono';
import './reel.css';

type Cue={shot:string;sw:string[];en:string[];start:number;end:number;captionEnd:number};
export type Props={cues:Cue[];durationInFrames:number;cover?:boolean};
const first=simulate(cases.paid), repeated=simulate(cases.repeat);
const wait = (n:number,start:number,end:number) => interpolate(n,[start,end],[0,1],{
  extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:t=>1-(1-t)**3,
});
const icon=(name:'receipt'|'inbox'|'check'|'loop',size=40)=>{
  const path={receipt:'M12 5h26v39l-6-4-7 4-7-4-6 4zM19 16h12m-12 7h12m-12 7h9',inbox:'M6 11h36v26H6zM7 13l17 14 17-14',
    check:'M9 25l10 10 24-22',loop:'M41 19a17 17 0 0 0-29-6l-4 4m0-9v10h10M7 29a17 17 0 0 0 29 6l4-4m0 9V30H30'}[name];
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d={path} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
};

function Trace({shot,local}:{shot:number;local:number}){
  const hook=shot===0, repeat=shot===2;
  const replay=repeat&&local>=92;
  const second=hook ? local>=104 : replay;
  const run=hook ? wait(local,104,175) : repeat ? wait(local,92,163) : wait(local,14,88);
  const stamp=shot===1 ? wait(local,64,102) : 1;
  const receipt=repeat?repeated:first;
  const status=hook ? (local<200?'Je, mfumo utatoa risiti ngapi?':'Marejeo ya malipo ni yale yale.')
    : repeat ? (local<166?'Marejeo ni yale yale.':`Taarifa ${repeated.confirmations} · risiti ${repeated.receipts}`)
    : local<90?'Mfumo unakagua oda na kiasi.':local<198?`Taarifa ${first.confirmations} · risiti ${first.receipts}`:`Imelingana na ${order.ref}`;
  return <div className="r-trace">
    <div className="r-trace-head"><span><i/> SIMULATION YA MALIPO</span><span>SI MUAMALA HALISI</span></div>
    <div className="r-flow">
      <div className="r-messages">
        <div className={'r-message '+(second?'soft':'')}>{icon('inbox',36)}<div><span>TAARIFA 01</span><b>{paid.paymentRef}</b></div></div>
        {second ? <div className="r-message duplicate" style={{transform:`translateY(${(1-run)*10}px)`}}>{icon('loop',36)}<div><span>TAARIFA 02</span><b>{paid.paymentRef}</b></div></div>
          : <div className="r-message empty" aria-hidden="true"><span>––</span></div>}
      </div>
      <svg className="r-path" viewBox="0 0 114 201" aria-hidden="true">
        <path d="M0 46h27q22 0 33 26t32 27h20M0 155h27q22 0 33-26t32-30h20" fill="none" stroke="#b8cec7" strokeWidth="3" strokeLinecap="round"/>
        {(shot!==0||second)&&<path d={second?'M0 155h27q22 0 33-26t32-30h20':'M0 46h27q22 0 33 26t32 27h20'} pathLength="1" fill="none" stroke="#176249" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${Math.max(.001,run)} 1`}/>}
        <path d="m98 88 14 11-14 11" fill="none" stroke={run>.81?'#176249':'#88aba0'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className={'r-receipt '+(hook?'question':'')}>
        {hook ? <>{icon('receipt',50)}<strong>?</strong><span>RISITI</span></>
          : <>{icon('receipt',47)}<div style={{opacity:stamp,transform:`translateY(${(1-stamp)*10}px)`}}><strong>{receipt.receipts}</strong><span>{receipt.receiptRefs[0]}</span></div>{shot===1&&stamp<.99?<small>Inakagua…</small>:<small>{repeat&&local>=166?'Risiti ileile':`TSh ${order.amount.toLocaleString('en-TZ')}`}</small>}</>}
      </div>
    </div>
    <div className={'r-result '+((!hook&&local>=90)?'verified':'')}>{!hook&&local>=90?icon('check',33):null}<span>{status}</span></div>
  </div>;
}

const titles=[['Ujumbe mara mbili.','Risiti ngapi?'],['Imethibitishwa.','Risiti moja.'],['Taarifa imerudi.','Risiti ileile.'],['Comment','MALIPO']];
export function Reel({cues,cover}:Props){
  const frame=useCurrentFrame();
  const shot=cover?0:cues.reduce((i,c,j)=>frame>=c.start-5?j:i,0);
  const cue=cues[shot];
  const local=cover ? 210 : frame - Math.max(0,cue.start-5);
  const reveal=shot===0?1:wait(local,0,20);
  const progress=cover?0:frame/Math.max(1,cues.at(-1)!.captionEnd-1);
  const sheet=wait(local,126,171);
  return <AbsoluteFill className="r-page">
    {!cover&&<Audio src={staticFile('payment-check/narration.wav')}/>}
    <div className="r-ribbon"/>
    <div className="r-grid" aria-hidden="true"/>
    <div className="r-central">
      <header className="r-brand">
        <div><Img src={staticFile('payment-check/mark.png')} alt=""/>Altraware <span>Technology</span></div>
        <b>PAYMENT CHECK</b>
      </header>
      <div className="r-story" style={{opacity:.86+.14*reveal,transform:`translateY(${(1-reveal)*12}px)`}}>
        <p className="r-kicker"><i/>{['MIFUMO YA BIASHARA / 05','01 / UTHIBITISHO','02 / TAARIFA IMERUDIWA','03 / PDF YA KISWAHILI'][shot]}</p>
        <h1><span>{titles[shot][0]}</span><em>{titles[shot][1]}</em></h1>
        {shot<3 ? <Trace shot={shot} local={local}/>
          : <div className="r-resource">
            <div className="r-paper" style={{transform:`translateY(${(1-wait(local,4,44))*18}px) rotate(-2deg)`}}><Img src={staticFile('payment-check/guide-cover.png')} alt="Mwongozo wa ukaguzi wa malipo"/>
              <Img style={{opacity:sheet}} src={staticFile('payment-check/guide-worksheet.png')} alt=""/></div>
            <div><span>UKAGUZI WA MALIPO</span><strong>Majaribio 5.<br/>Karatasi ya matokeo.</strong><p>{local<230?'Pima kwa data ya mfano.':'Andika kilichotokea.'}</p></div>
          </div>}
      </div>
      <div className="r-captions" aria-label="Manukuu">
        {cover ? <div>Muamala uleule ukithibitishwa tena.</div>
          : frame>=cue.start&&frame<cue.captionEnd&&<div>{cue.sw.map(line=><span key={line}>{line}</span>)}</div>}
      </div>
      <div className="r-progress" aria-hidden="true"><i style={{transform:`scaleX(${progress})`}}/></div>
    </div>
  </AbsoluteFill>;
}
