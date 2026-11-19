import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Reel, type ReelProps} from './Video';
import script from '../reel-cues.json';
import './styles.css';

const defaults:ReelProps={
  cues:script.map((cue,i)=>({...cue,start:i*240+8,end:(i+1)*240-10})),
  durationInFrames:1920,
};
function Root(){
  return React.createElement(Composition<ReelProps>,{
    id:'ShipCheckReel',component:Reel,width:1080,height:1920,fps:60,
    durationInFrames:defaults.durationInFrames,defaultProps:defaults,
    calculateMetadata:({props})=>({durationInFrames:props.durationInFrames}),
  });
}
registerRoot(Root);
