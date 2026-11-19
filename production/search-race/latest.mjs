// A local, framework-independent search view. All requests in the lab are fake.
export const successExcerpt=[
  'const id = ++latest;',
  'const rows = await lookup(query);',
  '',
  'if (id !== latest) return;',
  'show(rows);',
];

export function createSearch(lookup, {guard=true}={}) {
  let latest=0;
  let state={query:'',status:'idle',rows:[],notice:null};
  const trace=[];
  const record=(event,id,forQuery)=>trace.push({event,id,forQuery,...structuredClone(state)});
  const old=id=>guard&&id!==latest;
  const show=(rows)=>{state={...state,status:'ready',rows,notice:null};};
  const run=async query=>{
    const id = ++latest;
    state={query,status:'loading',rows:[],notice:null};
    record('send',id,query);
    let rows;
    try {
      rows = await lookup(query,id);
    } catch {
      if (old(id)) {record('ignored-error',id,query);return;}
      state={...state,status:'error',rows:[],notice:'Haijapakia. Jaribu tena.'};
      record('error',id,query);return;
    }
    if (old(id)) {record('ignored-result',id,query);return;}
    show(rows);
    record('show',id,query);
  };
  const clear=()=>{
    const id=++latest;state={query:'',status:'idle',rows:[],notice:null};record('clear',id,'');
  };
  return {run,clear,state:()=>structuredClone(state),trace:()=>structuredClone(trace)};
}

export function queue(){
  const jobs=new Map();
  const lookup=(query,id)=>new Promise((resolve,reject)=>jobs.set(id,{query,resolve,reject}));
  const take=id=>{const job=jobs.get(id);if(!job)throw new Error(`No synthetic request ${id}`);jobs.delete(id);return job;};
  return {lookup,send:(id,sample)=>take(id).resolve([sample]),fail:id=>take(id).reject(new Error('Synthetic lookup failure'))};
}

export async function race({guard,oldError=false,newError=false}={}){
  const q=queue(), ui=createSearch(q.lookup,{guard});
  const a=ui.run('pilau'), b=ui.run('chai');
  if(newError)q.fail(2);else q.send(2,'Chai');
  await b;
  if(oldError)q.fail(1);else q.send(1,'Pilau');
  await a;
  return {trace:ui.trace(),final:ui.state()};
}
