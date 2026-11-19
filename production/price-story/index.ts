import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Reel,type Props} from './Reel';
import layout from './layout.json';
const defaultProps:Props={shots:[{shot:'hook',start:0,end:438},{shot:'two',start:438,end:966},{shot:'three',start:966,end:1422},{shot:'why',start:1422,end:1884},{shot:'use',start:1884,end:2382},{shot:'close',start:2382,end:2820}],rig:{width:939,height:1136,poses:{} as Props['rig']['poses']},cover:false};
registerRoot(()=>React.createElement(Composition as React.ComponentType<any>,{id:'PriceStory',component:Reel,width:layout.width,height:layout.height,fps:layout.fps,durationInFrames:layout.frames,defaultProps}));
