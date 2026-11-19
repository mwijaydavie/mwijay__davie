import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Story,type Props,type Shot} from './Story';
import layout from './layout.json';
import cues from './cues.json';
const defaults:Props={shots:cues.map((q,i)=>({shot:q.shot as Shot['shot'],start:i?cues[i-1].end:0,end:q.end})),rig:{poses:{}} as Props['rig'],mouth:''};
registerRoot(()=>React.createElement(Composition as React.ComponentType<any>,{id:'DeliveryStory',component:Story,width:layout.width,height:layout.height,fps:layout.fps,durationInFrames:layout.frames,defaultProps:defaults}));
