import React from 'react';
import {Img,staticFile} from 'remotion';
import {eyelid,wrist,ease} from './logic.mjs';
import './host.css';
export type Name='wave'|'point'|'think';
type Layer={file:string;x:number;y:number;width:number;height:number};
export type Rig={width:number;height:number;poses:Record<Name,{base:{file:string};lids:Layer;hand:(Layer&{pivot:[number,number]})|null;mark:number[]}>};
const art=(file:string)=>staticFile(`price-story/${file}`);
export function Host({rig,pose,frame,x,y,width,blinks=[],targets=[],still=false,alpha=1,lean=0}:{rig:Rig;pose:Name;frame:number;x:number;y:number;width:number;blinks?:number[];targets?:number[];still?:boolean;alpha?:number;lean?:number}){
 if(!rig.poses[pose])return null;
 const s=width/rig.width;const p=rig.poses[pose];const b=still?0:eyelid(frame,blinks);
 const tilt=still?0:Math.sin(frame/62)*.8+lean*ease(frame,4,36);
 const hand=still?0:wrist(pose,frame,targets);const bob=still?0:Math.sin(frame/36)*3;
 const layer=(a:Layer):React.CSSProperties=>({left:a.x*s,top:a.y*s,width:a.width*s,height:a.height*s});
 return <div className="ps-actor" data-pose={pose} style={{width,height:rig.height*s,left:x,top:y,opacity:alpha,transform:`translateY(${bob}px) rotate(${tilt}deg)`}}>
  <Img className="ps-actor-base" src={art(p.base.file)} alt={{wave:'Altraware host with a friendly wave and smile',point:'Altraware host pointing toward the example price',think:'Altraware host looking sideways with arms folded'}[pose]}/>
  {p.hand&&<Img className="ps-part" src={art(p.hand.file)} alt="" style={{...layer(p.hand),transformOrigin:`${p.hand.pivot[0]*s}px ${p.hand.pivot[1]*s}px`,transform:`rotate(${hand}deg)`}}/>}
  <Img className="ps-part" alt="" src={art(p.lids.file)} style={{...layer(p.lids),opacity:b}}/>
  <Img className="ps-part ps-actor-mark" src={art('altraware.png')} alt="" style={{left:p.mark[0]*s,top:p.mark[1]*s,width:p.mark[2]*s,height:p.mark[3]*s}}/>
 </div>;
}
