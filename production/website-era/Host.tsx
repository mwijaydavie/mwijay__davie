import React from 'react';
import {Img,staticFile} from 'remotion';
import {ease,mouthWeights} from './motion.mjs';

type Layer={file:string;x:number;y:number;width:number;height:number};
export type Pose='wave'|'point';
export type Rig={width:number;height:number;poses:Record<Pose,{base:{file:string};lids:Layer;hand:Layer&{pivot:number[]};mouth:Record<string,Layer>;mark:number[]}>};
export const asset=(file:string)=>staticFile(`website-era/${file}`);
const accent=(f:number,k:number)=>ease(f,k-18,k)*(1-ease(f,k+8,k+29));
export function Host({rig,pose,frame,abs,mouth,x,y,w,blinks=[],targets=[],still=false}:{rig:Rig;pose:Pose;frame:number;abs:number;mouth:string;x:number;y:number;w:number;blinks?:number[];targets?:number[];still?:boolean}){
 const p=rig.poses[pose];if(!p)return null;const s=w/rig.width;
 const b=still?0:Math.max(0,...blinks.map(k=>ease(frame,k-5,k-1)*(1-ease(frame,k+1,k+8))));
 const wave=still?0:12*ease(frame,10,36)*(1-ease(frame,92,157))*Math.sin((frame-14)*Math.PI/23);
 const pointing=still?0:7.5*Math.max(0,...targets.map(k=>accent(frame,k)));
 const angle=pose==='wave'?wave:pointing;
 const tilt=still?0:Math.sin(frame/57)*.68+wave*.035-pointing*.11;
 const weights=still?{}:mouthWeights(mouth,abs);
 const coords=(a:Layer)=>({left:a.x*s,top:a.y*s,width:a.width*s,height:a.height*s});
 return <div className="we-host" data-pose={pose} style={{width:w,height:rig.height*s,left:x,top:y,transformOrigin:`${w*.55}px ${w*.73}px`,transform:`rotate(${tilt}deg)`}}>
   <Img className="we-host-base" src={asset(p.base.file)} alt="Altraware Business host"/>
   <Img className="we-host-part" src={asset(p.hand.file)} alt="" style={{...coords(p.hand),transformOrigin:`${p.hand.pivot[0]*s}px ${p.hand.pivot[1]*s}px`,transform:`rotate(${angle}deg)`}}/>
   {Object.entries(p.mouth).map(([k,a])=><Img key={k} className="we-host-part" src={asset(a.file)} alt="" style={{...coords(a),opacity:weights[k]||0}}/>)}
   <Img className="we-host-part" src={asset(p.lids.file)} alt="" style={{...coords(p.lids),opacity:b}}/>
   <Img className="we-host-part we-embroidered" src={asset('altraware.png')} alt="" style={{left:p.mark[0]*s,top:p.mark[1]*s,width:p.mark[2]*s,height:p.mark[3]*s}}/>
 </div>;
}
