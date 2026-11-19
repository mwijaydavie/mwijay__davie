// Decode actual rotated bitmaps; no URLs, camera, network or transactions.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {PNG} from 'pngjs';

export const here=dirname(fileURLToPath(import.meta.url));
export const output=resolve(process.env.QR_ORIGIN_OUT||join(here,'../../out/qr-origin'));
export const sha=data=>createHash('sha256').update(data).digest('hex');
export const decode=(p)=>jsQR(new Uint8ClampedArray(p.data),p.width,p.height,{inversionAttempts:'dontInvert'});
const payload='HABARI DAR';
const options={version:1,errorCorrectionLevel:'M',margin:4,scale:16};
const qr=QRCode.create([{data:payload,mode:'alphanumeric'}],options);
const normal=PNG.sync.read(await QRCode.toBuffer([{data:payload,mode:'alphanumeric'}],{...options,type:'png'}));
const n=(qr.modules.size+2*options.margin)*options.scale;
assert.equal(normal.width,n);assert.equal(normal.height,n);
const rotate=(image,q)=>{
 const png=new PNG({width:n,height:n});
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const [a,b]=[[x,y],[y,n-1-x],[n-1-x,n-1-y],[n-1-y,x]][q];
  const from=4*(b*n+a),to=4*(y*n+x);image.data.copy(png.data,to,from,from+4);
 }
 return png;
};
const art=join(output,'assets'),qa=join(output,'qa');
await mkdir(art,{recursive:true});await mkdir(qa,{recursive:true});
const rows=[];
for(let q=0;q<4;q++){
 const p=rotate(normal,q);const d=decode(p);
 assert.equal(d?.data,payload,`${q*90} degrees`);assert.equal(d?.version,1);
 const f=`qr-${q*90}.png`,b=PNG.sync.write(p);await writeFile(join(art,f),b);
 rows.push({angle:q*90,decoded:d.data,file:f,width:n,height:n,sha256:sha(b),finderCenters:[d.location.topLeftFinderPattern,d.location.topRightFinderPattern,d.location.bottomLeftFinderPattern]});
}
const blank=new PNG({width:n,height:n});blank.data.fill(255);assert.equal(decode(blank),null);
const tests={scope:'Generated plain-text symbol on unoccluded, clean images. Tested four quarter-turn rotations with jsQR, not a phone or variable-lighting/damage test.',encoder:'qrcode@1.5.4',decoder:'jsqr@1.4.0',version:options.version,quietZone:options.margin,modules:qr.modules.size,scale:options.scale,errorCorrectionLevel:options.errorCorrectionLevel,rows,blankControl:null};
await writeFile(join(qa,'rotation-proof.json'),JSON.stringify(tests,null,2)+'\n');
console.log(rows.map(x=>`${x.angle}° → ${x.decoded}`).join('\n')+'\nBlank control → no code. 5/5 checks passed.');
