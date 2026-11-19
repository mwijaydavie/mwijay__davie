// Original geometry for Tech Tip 01. Die cuts, then animated ink, as studied in Motion Lab.
export const art={
  route:{paper:'#dbfb7a',ink:'#212435',outline:'M21 10Q54 4 79 10Q94 13 96 29L97 65Q96 82 76 93Q49 104 25 93Q7 85 5 64L5 31Q7 16 21 10Z',paths:[
    'M21 65h16q12 0 12-12V32q0-7 10-8l19-1m-10-9 12 9-11 11',
    'M49 53q0 12 12 12h20m-9-10 11 10-11 10','M23 42l8 1m-12-12 10 5']},
  scan:{paper:'#e9ecff',ink:'#2633a0',outline:'M21 8Q56 1 81 11Q95 19 95 39L94 67Q90 87 75 94Q51 102 24 91Q9 82 6 62L5 34Q8 15 21 8Z',paths:[
    'M22 36V23h13M65 23h13v13M78 64v13H65M35 77H22V64','M20 49h61','M36 38v22m8-23v25m9-19v17m9-22v25']},
  guide:{paper:'#f6ccad',ink:'#321e2b',outline:'M17 14Q36 3 61 6Q86 6 95 25L95 72Q91 87 70 94L28 95Q11 91 6 72L4 32Q7 22 17 14Z',paths:[
    'M25 27q15-5 25 6 11-11 25-6l1 45q-17-3-26 7-9-9-26-8l1-44M50 33v46','M33 44l9 2m-9 9 9 3m17-12 9-3m-9 14 9-3','M80 9v9m-5-5 10 0']},
};
export function stickerSvg(a){
  return `<svg viewBox="-6 -6 112 112" xmlns="http://www.w3.org/2000/svg"><path fill="${a.paper}" stroke="#fff" stroke-width="5" d="${a.outline}"/><g fill="none" stroke="${a.ink}" stroke-width="4.3" stroke-linecap="round" stroke-linejoin="round">${a.paths.map(d=>`<path d="${d}"/>`).join('')}</g></svg>\n`;
}
