import React, {useId} from 'react';

// Original editorial vectors, not illustrations of any real orchard or inventory.
const peel = 'M156 35C187 22 219 49 233 93C245 131 258 149 280 185C314 237 304 303 268 335C226 371 153 378 104 345C57 314 48 263 60 216C70 176 100 142 118 104C134 71 132 45 156 35Z';
const leaf = 'M219 103C244 43 290 23 342 34C338 81 282 126 219 103Z';

export function Avocados({style}: {style?: React.CSSProperties}) {
  const id = useId();
  return <svg className="avocado-art" style={style} viewBox="0 0 405 405" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-flesh`} x1="105" y1="79" x2="239" y2="332" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fbefae"/><stop offset="1" stopColor="#b7d76a"/>
      </linearGradient>
      <linearGradient id={`${id}-pit`} x1="131" y1="194" x2="228" y2="303" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f8c969"/><stop offset=".56" stopColor="#c5892e"/><stop offset="1" stopColor="#89490f"/>
      </linearGradient>
    </defs>
    <path d="M59 342C105 368 216 368 317 330" stroke="#1b7a36" opacity=".32" strokeWidth="3" strokeLinecap="round"/>
    <g transform="translate(105 64) rotate(21 157 170) scale(.76)">
      <path d={peel} fill="#236539" stroke="#9dc86c" strokeWidth="4"/>
      <path d="M153 67C179 60 198 89 208 116M218 159C239 186 258 216 259 243" stroke="#add07e" opacity=".66" strokeWidth="4" strokeLinecap="round"/>
      <path d="M212 175L221 184M230 220L236 229M224 285L215 294M247 270L243 282M194 91L200 104" stroke="#cee2a1" opacity=".52" strokeWidth="3" strokeLinecap="round"/>
      <path d={leaf} fill="#91bd59" transform="translate(-42 29) rotate(-21 218 103)"/>
    </g>
    <g transform="translate(-12 15) rotate(-20 183 202)">
      <path d={peel} fill="#124c29" stroke="#d5eb9c" strokeWidth="3.2"/>
      <path d={peel} fill="#8bb84b" transform="translate(9 11) scale(.95)"/>
      <path d={peel} fill={`url(#${id}-flesh)`} transform="translate(21 24) scale(.88)"/>
      <path d="M81 271C81 221 103 188 127 153C141 132 152 96 162 76" stroke="#fff5c9" strokeWidth="4" strokeLinecap="round" opacity=".72"/>
      <ellipse cx="181" cy="246" rx="66" ry="67" transform="rotate(-8 181 246)" fill="#99b145" opacity=".41"/>
      <path d="M182 178C211 176 241 202 242 234C242 272 217 302 178 302C139 301 119 275 121 240C123 208 145 180 182 178Z" fill={`url(#${id}-pit)`} stroke="#955d26" strokeWidth="2.4"/>
      <path d="M143 233C150 211 167 200 185 200" stroke="#ffe6a2" opacity=".68" strokeWidth="5" strokeLinecap="round"/>
      <path d="M200 280C219 271 225 256 226 244" stroke="#925317" strokeWidth="3.5" strokeLinecap="round" opacity=".65"/>
      <path d="M165 78C165 57 179 42 192 35" stroke="#635322" strokeWidth="5" strokeLinecap="round"/>
      <path d={leaf} fill="#428e45" transform="translate(-32 -25) scale(.88)"/>
      <path d="M163 67C178 42 206 21 245 11" stroke="#b7d270" strokeWidth="2.5" strokeLinecap="round" opacity=".8"/>
    </g>
    <g stroke="#d9b000" strokeWidth="3" strokeLinecap="round" opacity=".95">
      <path d="M340 135l25-13M346 152l23 1M341 119l9-17M59 104l-15-13M42 121l-19-3"/>
      <circle cx="386" cy="167" r="3" fill="#d9b000" stroke="none"/>
      <circle cx="47" cy="70" r="4" fill="#d9b000" stroke="none"/>
    </g>
  </svg>;
}

export function FieldRows({style}: {style?: React.CSSProperties}) {
  return <svg className="field-rows" style={style} viewBox="0 0 1080 560" fill="none" aria-hidden="true">
    {Array.from({length: 13}, (_, i) => <path key={i}
      d={`M-30 ${337+i*21} C${220+i*7} ${199+i*17} ${479+i*17} ${331+i*13} ${658+i*13} ${186+i*13} S${927+i*18} ${39+i*4} 1110 ${92+i*20}`}
      stroke="currentColor" strokeWidth={i % 4 === 0 ? '2' : '1.2'}/>) }
  </svg>;
}
