// Pure data-to-frame model for an illustrative search opening. No requests or timers.
const ORDER=['typing','typed','submit','ready','hover','click','open','end'];
const LABELS=new Set(['MFANO WA SEARCH','SEARCH DEMO']);

export function validateOpening(plan){
 if(!plan||!LABELS.has(plan.label)||typeof plan.query!=='string'||!plan.query.trim()||Array.from(plan.query).length>46)throw new Error('Provide a short query and visible MFANO WA SEARCH or SEARCH DEMO label.');
 if(plan.resultKind!=='fictional'||typeof plan.domain!=='string'||!/^([a-z0-9-]+\.)+example$/i.test(plan.domain))throw new Error('Label synthetic results and use a .example domain. Real pages belong in the proof section.');
 let last=-1;
 for(const key of ORDER){const n=plan.beats?.[key];if(!Number.isInteger(n)||n<=last)throw new Error(`Opening beats out of order: ${key}`);last=n;}
 return plan;
}

export function searchAt(plan,frame){
 const {query,label,domain,beats:t}=plan;
 const parts=Array.from(query);
 const entered=Math.floor(Math.max(0,Math.min(1,(frame-t.typing)/(t.typed-t.typing)))*parts.length);
 const phase=frame>=t.open?'open':frame>=t.click?'click':frame>=t.hover?'hover':frame>=t.ready?'result':frame>=t.submit?'waiting':'type';
 return {label,domain,query:parts.slice(0,entered).join(''),phase,canShowResult:frame>=t.ready,pressed:frame>=t.click&&frame<t.open};
}
