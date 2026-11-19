// Local fictional policy: one successful request every 3 seconds. No network, credentials or model inference.
export function demoProvider(gapMs=3000){
 let readyAt=0, last=-1;
 return now=>{
  if(!Number.isInteger(now)||now<0||now<last) throw new Error('Use a nondecreasing mock clock.');
  last=now;
  if(now<readyAt)return Response.json({error:'mock burst limit'},{status:429,headers:{'Retry-After':String(Math.ceil((readyAt-now)/1000))}});
  readyAt=now+gapMs;
  return Response.json({model:'DEMO-ONLY',output:'ready'});
 };
}
export function decide(response,now,attempt){
 if(response.ok)return {action:'accept'};
 // Only retry a shallow burst limit in this demo. Real APIs may use 429 for exhausted daily quotas.
 const header=response.headers.get('Retry-After');
 if(response.status!==429||attempt>=1||header===null||!/^\d+$/.test(header))return {action:'stop'};
 const seconds=Number(header);
 if(seconds<1||seconds>5)return {action:'stop'};
 return {action:'wait',after:seconds,notBefore:now+1000*seconds};
}
export function proof(){
 const mock=demoProvider();
 let calls=0;
 const send=t=>{calls++; const r=mock(t);return {t,status:r.status,after:r.headers.get('Retry-After')};};
 const first=send(0),limited=send(1000);
 const policy=decide(new Response(null,{status:limited.status,headers:{'Retry-After':limited.after}}),limited.t,0);
 if(policy.action!=='wait')throw new Error('Expected short wait');
 const blocked=2200<policy.notBefore;
 if(!blocked)throw new Error('Expected UI to prevent retries during cooldown');
 const again=send(policy.notBefore);
 return {first,limited,policy,blockedAtMs:2200,recovered:again,calls,kind:'mock · no model, credentials or network'};
}
