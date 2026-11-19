import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Providers,type Props} from './Reel';
import script from './cues.json';
const defaults:Props={scenes:script.map((s,i)=>({shot:s.shot,start:i?script[i-1].end:0,end:s.end,voiceStart:0,voiceEnd:0})),demo:{first:{status:200,t:0},limited:{status:429,t:1000},recovered:{status:200,t:3000},policy:{action:'wait',after:2,notBefore:3000}}};
function Root(){return React.createElement(Composition<Props>,{id:'ModelProviders',component:Providers,width:1080,height:1920,fps:60,durationInFrames:3600,defaultProps:defaults});}
registerRoot(Root);
