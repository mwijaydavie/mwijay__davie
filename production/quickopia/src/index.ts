import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Carousel, Reel, type ReelProps} from './Quickopia';
import {DaylightReel} from './DaylightReel';
import script from '../voice-cues.json';
import daylightScript from '../voice-cues-v2.json';
import project from '../project.json';
import './style.css';

const defaults:ReelProps={cues:script.map((c,i)=>({...c,start:i*250+8,end:(i+1)*250-9})),durationInFrames:script.length*250};
const daylight:ReelProps={cues:daylightScript.map((c,i)=>({...c,start:i*250+8,end:(i+1)*250-39,captionEnd:(i+1)*250})),durationInFrames:daylightScript.length*250};
function Root(){
  return React.createElement(React.Fragment,null,
    React.createElement(Composition,{id:'QuickopiaCarousel',component:Carousel,width:1080,height:1350,fps:60,durationInFrames:project.slideFiles.length}),
    React.createElement(Composition<ReelProps>,{id:'QuickopiaDaylight',component:DaylightReel,width:1080,height:1920,fps:60,durationInFrames:daylight.durationInFrames,defaultProps:daylight,calculateMetadata:({props})=>({durationInFrames:props.durationInFrames})}),
    React.createElement(Composition<ReelProps>,{id:'QuickopiaReel',component:Reel,width:1080,height:1920,fps:60,durationInFrames:defaults.durationInFrames,defaultProps:defaults,calculateMetadata:({props})=>({durationInFrames:props.durationInFrames})}));
}
registerRoot(Root);
