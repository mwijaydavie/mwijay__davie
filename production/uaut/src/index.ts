import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Carousel,Reel,type StoryProps} from './Story';
import voice from '../voice-cues.json';
import project from '../project.json';
import './style.css';

const defaults:StoryProps={cues:voice.map((v,i)=>({...v,start:i*300+8,end:(i+1)*300-40,captionEnd:(i+1)*300})),durationInFrames:1200};
function Root(){
  return React.createElement(React.Fragment,null,
    React.createElement(Composition,{id:'UautCarousel',component:Carousel,width:1080,height:1350,fps:60,durationInFrames:project.slides.length}),
    React.createElement(Composition<StoryProps>,{id:'UautReel',component:Reel,width:1080,height:1920,fps:60,durationInFrames:defaults.durationInFrames,defaultProps:defaults,calculateMetadata:({props})=>({durationInFrames:props.durationInFrames})}));
}
registerRoot(Root);
