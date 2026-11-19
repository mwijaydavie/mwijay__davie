import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Reel,type Props} from './Reel';
import voice from './voice-cues.json';

const defaults:Props={cues:voice.map((cue,i)=>({...cue,start:i*324+7,end:(i+1)*324-25,captionEnd:(i+1)*324})),durationInFrames:1296};
function Root(){
  return React.createElement(Composition<Props>,{id:'PaymentCheck',component:Reel,width:1080,height:1920,fps:60,
    durationInFrames:defaults.durationInFrames,defaultProps:defaults,calculateMetadata:({props})=>({durationInFrames:props.durationInFrames})});
}
registerRoot(Root);
