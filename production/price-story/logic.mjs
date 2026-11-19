export function compare(example){
 const ordered=[...example.tiers].sort((a,b)=>a.price-b.price);
 const two=ordered.filter(t=>t.id!=='large');
 const middle=two.find(t=>t.id==='half');
 if(!middle||ordered.length!==3||two.length!==2||new Set(ordered.map(t=>t.ml)).size!==3||
    ordered.some((t,i)=>!Number.isSafeInteger(t.price)||t.price<=0||!Number.isSafeInteger(t.ml)||t.ml<=0||
      (i&&(t.price<=ordered[i-1].price||t.ml<=ordered[i-1].ml)))||example.unitMl!==100||example.currency!=='TSh'){
  throw new TypeError('Use three distinct, increasing price/volume tiers so each has a real trade-off.');
 }
 const before=two.findIndex(t=>t.id==='half');const after=ordered.findIndex(t=>t.id==='half');
 if(before!==1||after!==1)throw new TypeError('The same half-litre must go from top-price to middle.');
 const rows=ordered.map(t=>({...t,per100:t.price*example.unitMl/t.ml}));
 return {rows,from:[before+1,two.length],to:[after+1,ordered.length],samePrice:middle.price,sameMl:middle.ml};
}

export const clamp=x=>Math.max(0,Math.min(1,x));
export const ease=(f,a,b)=>{const x=clamp((f-a)/(b-a));return x*x*(3-2*x);};
// Close quickly, hold one frame, reopen a little slower. These are not lip sync.
export const eyelid=(f,centers)=>Math.max(0,...centers.map(c=>ease(f,c-5,c-1)*(1-ease(f,c+1,c+6))));
export function wrist(pose,frame,targets=[]){
 if(pose==='wave')return 13*ease(frame,12,34)*(1-ease(frame,114,154))*Math.sin((frame-21)*Math.PI/24);
 if(pose==='point')return Math.max(0,...targets.map(c=>ease(frame,c-19,c+2)*(1-ease(frame,c+30,c+78))))*7.2;
 return 0;
}
