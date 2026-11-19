import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {AccessReel,type Props} from './Reel';
import cueText from './voice-cues.json';

const defaults:Props={
  cues:cueText.map((c,i)=>({...c,sceneStart:i*360,sceneEnd:(i+1)*360,start:i*360+9,end:(i+1)*360-22,captionEnd:(i+1)*360-6})),
  durationInFrames:1800,
  proof:{env:'fictional local demo',offered:['read_stock'],read:{tool:'read_stock',ok:true,sku:'BOX-DEMO-01',stock:12},
    rejected:{tool:'change_price',attemptedPriceTsh:4000,denied:true,message:'Preview defaults only'},book:{before:5000,after:5000,currency:'TZS'}},
};
function Root(){
  return React.createElement(Composition<Props>,{id:'AgentAccess30',component:AccessReel,width:1080,height:1920,fps:60,
    durationInFrames:1800,defaultProps:defaults});
}
registerRoot(Root);
