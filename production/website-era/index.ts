import React from 'react';
import {Composition,registerRoot} from 'remotion';
import layout from './layout.json';
import {Story,type Props} from './Story';
const defaultProps:Props={shots:[{shot:'search',start:0,end:360},{shot:'link',start:360,end:708},{shot:'own',start:708,end:1176},{shot:'work',start:1176,end:1656},{shot:'offer',start:1656,end:2256},{shot:'close',start:2256,end:2700}],rig:{poses:{}} as Props['rig'],mouth:''};
registerRoot(()=>React.createElement(Composition as React.ComponentType<any>,{id:'WebsiteEra',component:Story,width:layout.width,height:layout.height,fps:layout.fps,durationInFrames:layout.frames,defaultProps}));
