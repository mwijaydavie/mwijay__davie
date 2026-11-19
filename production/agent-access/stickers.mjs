import {mkdir,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {stickers} from './sticker-art.mjs';

export async function writeStickers(folder){
  await mkdir(folder,{recursive:true});
  for(const [name,art] of Object.entries(stickers)){
    await writeFile(join(folder,`${name}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 110 110" role="img" aria-label="${name} sticker by Altraware"><path d="${art.backing}" fill="${art.paper}" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><g fill="none" stroke="${art.ink}" stroke-width="3.9" stroke-linecap="round" stroke-linejoin="round">${art.paths.map(d=>`<path d="${d}"/>`).join('')}</g></svg>\n`);
  }
  console.log(`Exported ${Object.keys(stickers).length} original SVG stickers to ${folder}`);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
  await writeStickers(resolve(process.env.AGENT_ACCESS_OUT||join(root,'out/agent-access'),'stickers'));
}
