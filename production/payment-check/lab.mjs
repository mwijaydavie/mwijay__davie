// Offline teaching model only. Every event below is a trusted test fixture, not a provider request.
// This deliberately does not implement API auth, real concurrency, refunds, storage or settlement.
export const order=Object.freeze({ref:'ODA-DEMO-01',amount:10000,currency:'TZS'});
export const accepted=Object.freeze({type:'accepted'});
export const timeout=Object.freeze({type:'timeout'});
export const paid=Object.freeze({type:'verified',orderRef:order.ref,paymentRef:'PAY-DEMO-01',amount:order.amount,currency:order.currency});
export const mismatch=Object.freeze({...paid,amount:9000});

export function simulate(events){
  let status='NEW', timeoutChecks=0, confirmations=0, payment=null;
  const receipts=[];
  for(const e of events){
    if(e.type==='accepted'){
      if(status==='NEW') status='WAIT';
    }else if(e.type==='timeout'){
      timeoutChecks++;
      if(status==='NEW')status='WAIT';
    }else if(e.type==='verified'){
      confirmations++;
      const matches=e.paymentRef&&e.orderRef===order.ref&&e.amount===order.amount&&e.currency===order.currency;
      if(!matches||payment&&payment!==e.paymentRef){ status='REVIEW'; continue; }
      if(payment===e.paymentRef) continue;
      payment=e.paymentRef;
      receipts.push('RISITI-DEMO-01');
      status='PAID';
    }else{throw new Error(`Unrecognized fixture type: ${e.type}`);}
  }
  return {status, confirmations, timeoutChecks, payments:payment?1:0, receipts:receipts.length, receiptRefs:receipts};
}
export const cases=Object.freeze({
  accepted:[accepted], timeout:[accepted,timeout], paid:[accepted,paid],
  repeat:[accepted,paid,paid], mismatch:[accepted,mismatch],
});
