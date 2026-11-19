import React from 'react';
import {Easing,interpolate,spring} from 'remotion';
import {stickers} from './sticker-art.mjs';

export function ease(frame:number,from:number,to:number){
  return interpolate(frame,[from,to],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.22,1,.36,1)});
}

export function ContourField({frame,scene}:{frame:number;scene:number}){
  // Analytic ripples, not a copied shader or real geographic data. Ink is inset behind reading areas.
  const spots=[[584,1127],[800,964],[572,964],[432,1004],[742,1071]];
  const [cx,cy]=spots[scene];
  const t=frame/170;
  const rails=Array.from({length:22},(_,i)=>{
    const r=110+i*41;
    const points=Array.from({length:68},(_,j)=>{
      const a=j/68*Math.PI*2;
      const folded=1+.107*Math.sin(a*3+scene+t*.63+i*.116)+.076*Math.cos(a*5-t*.37+i*.101);
      const x=cx+r*.94*folded*Math.cos(a)+48*Math.sin(t*.71+i*.143);
      const y=cy+r*1.20*folded*Math.sin(a)+55*Math.cos(t*.73+i*.11)+r*.08*Math.cos(a);
      return `${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return <path key={i} d={`M${points.join('L')}Z`} opacity={i%4===0?.68:.37} strokeWidth={i%4===0?2.4:1.4}/>;
  });
  return <svg className="contour-field" viewBox="0 0 1080 1920" aria-hidden="true">
    <defs><linearGradient id="contour-ink" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#9578dc"/><stop offset="1" stopColor="#5834a8"/></linearGradient>
    <linearGradient id="chart-mask" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#fff" stopOpacity=".12"/><stop offset=".28" stopColor="#fff" stopOpacity=".34"/><stop offset=".54" stopColor="#fff" stopOpacity=".82"/><stop offset=".89" stopColor="#fff" stopOpacity=".65"/><stop offset="1" stopColor="#fff" stopOpacity=".08"/></linearGradient>
    <mask id="contour-soft"><rect width="1080" height="1920" fill="url(#chart-mask)"/></mask></defs>
    <g mask="url(#contour-soft)" stroke="url(#contour-ink)" fill="none">{rails}</g>
  </svg>;
}

export function Sticker({name,left,top,size,frame,fps,delay=0,turn=0,depth=12,already=false}:{
  name:keyof typeof stickers;left:number;top:number;size:number;frame:number;fps:number;delay?:number;turn?:number;depth?:number;already?:boolean;
}){
  const art=stickers[name];
  const n=frame-delay;
  const show=already?1:spring({frame:n,fps,config:{damping:13,stiffness:155,mass:.74},durationInFrames:43});
  const drift=Math.sin((frame+left*.15)/101)*depth;
  return <div data-art={name} className="die-cut" aria-hidden="true" style={{left,top,width:size,height:size,transform:`rotate(${turn}deg)`,opacity:already?1:ease(n,0,9)}}>
    <div className="die-cut-drift" style={{transform:`translateY(${drift}px) rotate(${Math.sin(frame/113)*2.7}deg)`}}>
      <svg className="die-cut-body" style={{transform:`scale(${.66+.34*show}) rotate(${(1-show)*-8}deg)`}} viewBox="-6 -6 112 112">
        <path d={art.backing} fill={art.paper} stroke="white" strokeWidth="5.8" strokeLinejoin="round"/>
        <g fill="none" stroke={art.ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          {art.paths.map((d:string,i:number)=><path key={d} d={d} pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-(already?1:ease(n,4+i*3,38+i*3)))}/>)}
        </g>
      </svg>
    </div>
  </div>;
}

export function Underline({progress,width=650,top=635,left=82}:{progress:number;width?:number;top?:number;left?:number}){
  return <svg className="hand-line" aria-hidden="true" style={{top,left,width}} viewBox="0 0 650 38"><path d="M7 28C131 10 338 4 483 9c68 2 109 10 156 11" pathLength="100" strokeDasharray="100 102" strokeDashoffset={100*(1-progress)} stroke="#8a61db" strokeWidth="8" strokeLinecap="round" fill="none"/></svg>;
}

export function Glyph({name,size=37}:{name:'bookmark'|'check'|'block'|'arrow'|'join';size?:number}){
  const path={bookmark:'M12 6h24v38l-12-8-12 8z',check:'M7 24l11 11L42 12',block:'M8 8l32 32M40 8L8 40',arrow:'M6 24h35m-13-13 13 13-13 13',join:'M6 13h18v22h17m-10-10 10 10-10 10'}[name];
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path}/></svg>;
}
