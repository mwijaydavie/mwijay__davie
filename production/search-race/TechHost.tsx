import React from 'react';
import {Img,staticFile} from 'remotion';
import './host.css';

type Layer={file:string;x:number;y:number;width:number;height:number};
export type Rig={width:number;height:number;sole:number;footX:number[];hip:number[];legs:Layer;poses:Record<string,{torso:Layer;hand:Layer&{pivot:number[]};blink:Layer;mark:number[]}>};
const art=(file:string)=>staticFile(`search-race/${file}`);
export function go(f:number,a:number,b:number){const z=Math.max(0,Math.min(1,(f-a)/(b-a)));return z*z*(3-2*z);}
const bump=(f:number,c:number,a=16,b=19)=>go(f,c-a,c)*(1-go(f,c+12,c+b+12));
export function TechHost({rig,pose,frame,x,floor,width,blinks=[],points=[],still=false,opacity=1}:{rig:Rig;pose:'hello'|'point';frame:number;x:number;floor:number;width:number;blinks?:number[];points?:number[];still?:boolean;opacity?:number}){
 const p=rig.poses[pose];if(!p)return null;
 const s=width/rig.width;const h=frame;const point=Math.max(0,...points.map(c=>bump(h,c)));
 const wave=h<161?10.8*go(h,12,37)*(1-go(h,117,161))*Math.sin((h-21)*Math.PI/24):0;
 const angle=still?0:pose==='hello'?wave:7.6*point;
 const blink=still?0:Math.max(0,...blinks.map(c=>go(h,c-5,c-1)*(1-go(h,c+1,c+7))));
 const lean=still?0:Math.sin(h/71)*.52+point*(-1.25)+wave*.064;
 const sxy=(r:Layer)=>({left:r.x*s,top:r.y*s,width:r.width*s,height:r.height*s});
 return <div className="th-person" style={{width,height:rig.height*s,left:x,top:floor-s*rig.sole,opacity}}>
  <div className="th-cast" style={{left:169*s,top:(rig.sole-12)*s,width:455*s,height:53*s}}/>
  {rig.footX.map(q=><i className="th-contact" key={q} style={{left:(q-65)*s,top:(rig.sole-4)*s,width:130*s,height:14*s}}/>)}
  <Img className="th-layer" src={art(rig.legs.file)} alt="Both shoes planted on the floor" style={sxy(rig.legs)}/>
  <div className="th-torso" style={{width,height:p.torso.height*s,transformOrigin:`${rig.hip[0]*s}px ${rig.hip[1]*s}px`,transform:`rotate(${lean}deg)`}}>
   <Img className="th-layer" src={art(p.torso.file)} alt={pose==='hello'?'Altraware tech host waving':'Altraware tech host pointing at the demo'} style={sxy(p.torso)}/>
   <Img className="th-layer" src={art(p.hand.file)} alt="" style={{...sxy(p.hand),transformOrigin:`${p.hand.pivot[0]*s}px ${p.hand.pivot[1]*s}px`,transform:`rotate(${angle}deg)`}}/>
   <Img className="th-layer" src={art(p.blink.file)} alt="" style={{...sxy(p.blink),opacity:blink}}/>
   <Img className="th-layer th-mark" src={art('altraware.png')} alt="" style={{left:p.mark[0]*s,top:p.mark[1]*s,width:p.mark[2]*s,height:p.mark[3]*s}}/>
  </div>
 </div>;
}
