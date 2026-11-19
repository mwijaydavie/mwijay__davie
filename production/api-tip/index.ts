import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {APITip,type Props} from './Reel';
import script from './cues.json';
const defaults: Props = {
  cues:script.map((c,i)=>({...c,sceneStart:i*360,start:i*360+7,end:i*360+278,captionEnd:i*360+300,sceneEnd:(i+1)*360})),
  proof:{direct:{endpoint:'/stock/BOX-DEMO-01',status:200,body:{sku:'BOX-DEMO-01',units:12}},mcp:{listed:['read_stock'],tool:'read_stock',body:{sku:'BOX-DEMO-01',units:12}},missing:{direct:404,mcpError:true},writeMethod:405},
};
function Root(){return React.createElement(Composition<Props>,{id:'APITip01',component:APITip,width:1080,height:1920,fps:60,durationInFrames:1800,defaultProps:defaults});}
registerRoot(Root);
