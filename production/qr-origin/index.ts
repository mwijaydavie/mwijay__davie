import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Story,type Props} from './Story';
import layout from './layout.json';

const defaultProps:Props={shots:[{shot:'hook',start:0,end:258},{shot:'factory',start:258,end:648},{shot:'invention',start:648,end:1100},{shot:'finders',start:1100,end:1436},{shot:'test',start:1436,end:1752},{shot:'close',start:1752,end:2160}],proof:[0,90,180,270].map(angle=>({angle,file:`qr-${angle}.png`,decoded:'HABARI DAR',width:464})),cover:false};
registerRoot(()=>React.createElement(Composition as React.ComponentType<any>,{id:'QROrigin',component:Story,width:layout.width,height:layout.height,fps:layout.fps,durationInFrames:layout.frames,defaultProps}));
