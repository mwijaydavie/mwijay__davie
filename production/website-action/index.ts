import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Reel,type Props} from './Reel';

const defaultProps:Props={shots:[{shot:'hook',start:0,end:366},{shot:'open',start:366,end:766},{shot:'search',start:766,end:1176},{shot:'design',start:1176,end:1632},{shot:'cta',start:1632,end:1920}],button:{x:.05,y:.84,w:.56,h:.12},input:{x:.04,y:.71,w:.92,h:.24}};
registerRoot(()=>React.createElement(Composition as React.ComponentType<any>,{id:'WebsiteAction',component:Reel,width:1080,height:1920,fps:60,durationInFrames:1920,defaultProps}));
