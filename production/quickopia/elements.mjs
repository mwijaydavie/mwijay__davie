// Original editorial vectors, not Quickopia UI, stock, or its brand logo.
// Normalized time in, deterministic SVG geometry out.
export const FPS = 60;
export const DURATION = 6;
export const palette = {ground:'#f4f2e8',ink:'#192628',quiet:'#5b6462',line:'#bdc5b9',paper:'#fffefa',signal:'#a93b26',active:'#365354',tile:'#eaf0e2',pause:'#f6e3dc'};
const clamp = x => Math.max(0,Math.min(1,x));
const phase = (t,a,b) => {const p=clamp((t-a)/(b-a));return p*p*(3-2*p);};
const fixed = x => Number(x.toFixed(4));
// Dash lengths are in user-space units (measured for these paths), not pathLength
// fractions, because the preview and browser renderers don't normalize them alike.
const paint = (d,length,amount,ink,width=4) => {
  const p=fixed(clamp(amount));
  const dash=p>=1?'':` stroke-dasharray="${length} ${length}" stroke-dashoffset="${fixed((1-p)*length)}"`;
  return p===0?'':`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`;
};

export function altrawareReveal({t, imageUri, x=90, y=492, size=370}) {
  // Two reveal lanes follow the ORIGINAL PNG. They mask pixels; they do not redraw the mark.
  const first=phase(t,.06,.91), second=phase(t,.34,1.36), seal=phase(t,1.27,1.54);
  const frame=phase(t,0,.44), lift=fixed((1-frame)*15);
  return `<g transform="translate(${x} ${y+lift}) scale(${size/256})" opacity="${fixed(.4+.6*frame)}">
    <defs><mask id="original-mark" maskUnits="userSpaceOnUse" x="-10" y="-10" width="276" height="276">
      ${paint('M79 130C61 107 61 80 79 60 93 44 111 40 129 40 166 40 194 67 195 109',239.0073,first,'#fff',37)}
      ${paint('M123 113C105 92 88 82 66 82 35 82 12 105 12 138 12 169 35 192 71 192 97 192 106 177 125 158L164 121C174 112 186 109 200 109 225 109 244 129 244 153 244 178 226 195 199 195H135',605.4048,second,'#fff',37)}
      <rect x="-1" y="-1" width="258" height="258" fill="#fff" opacity="${fixed(seal)}"/>
    </mask></defs>
    <image href="${imageUri}" width="256" height="256" mask="url(#original-mark)"/>
  </g>`;
}

export function catalogGlyph(t) {
  const a=phase(t,1.3,2.08), b=phase(t,1.87,2.26);
  return `<g stroke="currentColor" stroke-width="4" fill="none" stroke-linejoin="round">
    <rect x="8" y="10" width="96" height="69" rx="9" opacity="${.36+.64*a}"/>
    <path d="M8 26h96" opacity="${a}"/>
    <path d="M17 18h12" stroke-linecap="round" opacity="${a}"/>
    <rect x="20" y="39" width="31" height="27" rx="4" fill="currentColor" opacity="${.25+.72*b}"/>
    <rect x="64" y="39" width="28" height="27" rx="4" opacity="${.19+.38*a}"/>
    <path d="M28 52l6 6 9-11" stroke="#fffefa" stroke-linecap="round" opacity="${b}"/>
  </g>`;
}

export function quantityGlyph(t) {
  const a=phase(t,2.42,3.08), b=phase(t,3.10,3.55), pulse=phase(t,3.07,3.3)*(1-phase(t,3.28,3.65));
  return `<g stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round">
    <rect x="5" y="18" width="102" height="52" rx="10" opacity="${.36+.64*a}"/>
    <path d="M36 18v52m40-52v52" opacity="${.22+.78*a}"/>
    <path d="M15 44h11m58 0h13m-6.5-6.5v13" opacity="${a}"/>
    <rect x="78" y="20" width="27" height="48" rx="7" fill="currentColor" stroke="none" opacity="${.24*pulse}"/>
    <g transform="translate(46 31)" stroke-width="3.5">
      <path d="M6 4l5-4v24m-6 0h11" opacity="${a*(1-b)}" transform="translate(0 ${-7*b})"/>
      <path d="M3 5c1-7 16-8 16 0 0 6-16 12-16 19h16" opacity="${b}" transform="translate(0 ${6*(1-b)})"/>
    </g>
  </g>`;
}

export function gateGlyph(t) {
  const a=phase(t,3.75,4.34), b=phase(t,4.10,4.68);
  return `<g stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="8" width="100" height="72" rx="10" opacity="${.36+.64*a}"/>
    <path d="M6 25h100M17 17h9" opacity="${a}"/>
    <g opacity="${b}" transform="translate(0 ${6*(1-b)})"><path d="M46 53v-6a10 10 0 0 1 20 0v6"/><rect x="41" y="53" width="30" height="18" rx="4"/><path d="M56 59v5"/></g>
  </g>`;
}

export function workflowTrace(t) {
  const steps=[['01','Catalog',catalogGlyph,1.42],['02','Cart',quantityGlyph,2.53],['03','Checkout',gateGlyph,3.90]];
  const point=phase(t,1.19,2.2)*234 + phase(t,2.69,3.86)*234;
  const pause=phase(t,4.13,4.66);
  return `<g transform="translate(70 771)">
    <path d="M82 168H550" stroke="${palette.line}" stroke-width="3" stroke-dasharray="4 9"/>
    <path d="M82 168H${fixed(82+point)}" stroke="${palette.active}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="${fixed(82+point)}" cy="168" r="9" fill="${palette.signal}" opacity="${phase(t,1.1,1.3)}"/>
    ${steps.map(([n,label,glyph,start],i)=>{
      const live=phase(t,start,start+.32), x=i*234;
      const color = i===2 && pause>.75 ? palette.signal : palette.active;
      return `<g transform="translate(${x} 0)">
        <rect width="164" height="139" rx="17" fill="${i===2&&pause>.75?palette.pause:palette.paper}" stroke="${color}" stroke-width="${fixed(1.4+1.1*live)}" stroke-opacity="${fixed(.53+.47*live)}"/>
        <g transform="translate(26 11)" color="${color}">${glyph(t)}</g>
        <text x="82" y="119" text-anchor="middle" class="tile-label" fill="${palette.ink}">${label}</text>
        <circle cx="82" cy="168" r="6" fill="${phase(t,start,start+.17)>.5?color:palette.line}"/>
        <text x="82" y="203" text-anchor="middle" class="micro" fill="${color}">${i===2&&pause>.75?'IMEFUNGWA':n}</text>
      </g>`;
    }).join('')}
  </g>`;
}

export function frameSvg(frame,imageUri) {
  if(!Number.isInteger(frame)||frame<0||frame>=FPS*DURATION) throw new RangeError('Frame outside motion proof');
  const t=frame/FPS;
  const link = phase(t,1.24,2.1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1365" viewBox="0 0 768 1365">
    <style>
      text{font-family:Geist,Inter,'DejaVu Sans',sans-serif} .micro{font-size:15px;font-weight:600;letter-spacing:1.8px}
      .tile-label{font-size:24px;font-weight:700}.deck{font-size:27px;font-weight:510}.head{font-weight:760;letter-spacing:-4px}
    </style>
    <defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.45" fill="${palette.line}"/></pattern></defs>
    <rect width="768" height="1365" fill="${palette.ground}"/>
    <path d="M54 60H714V1300H54Z" stroke="${palette.line}" stroke-width="1.3" fill="none"/>
    <path d="M447 478H697V727H447Z" fill="url(#dots)" opacity=".62"/>
    <path d="M70 191H698M70 1143H698" stroke="${palette.line}" stroke-width="1.6"/>
    <text x="70" y="157" class="micro" fill="${palette.ink}">ALTRAWARE TECHNOLOGY</text>
    <text x="698" y="157" text-anchor="end" class="micro" fill="${palette.active}">MOTION STUDY / 01</text>
    <text x="70" y="248" class="micro" fill="${palette.signal}">QUICKOPIA / SOFTWARE FLOW</text>
    <text x="70" y="345" class="head" font-size="82" fill="${palette.ink}">Cart si oda.</text>
    <text x="71" y="400" class="deck" fill="${palette.quiet}">Hatua tatu. Hali tatu tofauti.</text>
    <rect x="70" y="456" width="628" height="267" rx="25" fill="${palette.paper}" stroke="${palette.line}" stroke-width="1.6"/>
    <g transform="translate(-7 -23)">${altrawareReveal({t,imageUri,x:92,y:463,size:330})}</g>
    <circle cx="576" cy="587" r="71" stroke="${palette.line}" stroke-width="2" stroke-dasharray="2 7" fill="none"/>
    ${paint('M467 586H574C642 586 659 654 650 690L644 714V743H153V774',831.6212,link,palette.active,3.2)}
    <circle cx="576" cy="587" r="18" stroke="${palette.active}" stroke-width="2.4" fill="${palette.ground}"/>
    <circle cx="576" cy="587" r="6" fill="${palette.signal}"/>
    ${workflowTrace(t)}
    <text x="70" y="1058" class="micro" fill="${palette.signal}">MCHORO WA WORKFLOW · SI SCREENSHOT</text>
    <text x="70" y="1102" class="deck" fill="${palette.quiet}">Checkout ya website bado imefungwa.</text>
    <text x="70" y="1186" class="micro" fill="${palette.quiet}">SVG ASSETS · DRAFT MOTION</text>
    <path d="M530 1178H698" stroke="${palette.line}" stroke-width="4" stroke-linecap="round"/>
    <path d="M530 1178H${fixed(530+168*frame/(FPS*DURATION-1))}" stroke="${palette.active}" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}
