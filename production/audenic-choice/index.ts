import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Reel,type Props} from './Reel';

const defaultProps:Props={shots:[{shot:'hook',start:0,end:270},{shot:'scroll',start:270,end:552},{shot:'proof',start:552,end:849},{shot:'design',start:849,end:1266},{shot:'cta',start:1266,end:1560}],rows:[{x:.05,y:.70,w:.9,h:.13},{x:.05,y:.83,w:.9,h:.13}],cover:false};
registerRoot(()=>React.createElement(Composition as React.ComponentType<any>,{id:'AudenicChoice',component:Reel,width:1080,height:1920,fps:60,durationInFrames:1560,defaultProps}));
