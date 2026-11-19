export function ease(f,a,b){const x=Math.min(1,Math.max(0,(f-a)/(b-a)));return x*x*(3-2*x);}

// Deterministic normalization: overlapping recognizer spans prefer latest start;
// at the same start keep a stronger vowel or closure rather than default B.
export function mouthFrames(input,length,fps,hasVoice,start,end){
 const priority={X:0,B:1,C:2,D:2,E:2,F:2,G:2,H:2,A:3};
 const cues=input.filter(c=>Number.isFinite(c.start)&&Number.isFinite(c.end)&&c.end>c.start&&c.value in priority)
  .sort((a,b)=>b.start-a.start||priority[b.value]-priority[a.value]);
 let out=Array.from({length},(_,i)=>{
  if(i<start||i>=end||!hasVoice(i))return 'X';
  const t=(i+.35)/fps;
  return cues.find(c=>c.start<=t&&t<c.end)?.value||'B';
 });
 // Skip a one-frame recognition spike between the same shape; don't fill silence.
 out=out.map((value,i)=>i>0&&i<out.length-1&&value!=='X'&&value!=='A'&&out[i-1]===out[i+1]&&out[i-1]!=='X'?out[i-1]:value);
 return out;
}

// A short spatially aligned crossfade, not a looping open/closed flap.
export function mouthWeights(sequence,f){
 const c=sequence[f]||'X';let age=0;
 while(age<3&&sequence[f-age-1]===c)age++;
 const prev=sequence[f-age-1]||'X';
 if(age>=2||c===prev)return c==='X'?{}:{[c]:1};
 const p=(age+1)/3;
 return {...(prev==='X'?{}:{[prev]:1-p}),...(c==='X'?{}:{[c]:p})};
}
