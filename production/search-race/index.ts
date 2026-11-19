import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Story,type Props} from './Story';
import layout from './layout.json';
const defaultProps:Props={shots:[{shot:'hook',start:0,end:378},{shot:'race',start:378,end:906},{shot:'fix',start:906,end:1398},{shot:'repeat',start:1398,end:1848},{shot:'cta',start:1848,end:2220}],rig:{poses:{}} as Props['rig'],proof:{before:{trace:[{rows:[]},{rows:[]},{rows:['Chai']}],final:{query:'chai',rows:['Pilau']}}} as Props['proof']};
registerRoot(()=>React.createElement(Composition as React.ComponentType<any>,{id:'SearchRace',component:Story,width:layout.width,height:layout.height,fps:layout.fps,durationInFrames:layout.frames,defaultProps}));
