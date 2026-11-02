import {existsSync,readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {root,sourceFiles} from './source-inventory.mjs';
let count=0;
for(const name of sourceFiles().filter(p=>p.endsWith('.md'))){
 const file=resolve(root,name),text=readFileSync(file,'utf8');
 for(const match of text.matchAll(/!?\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))\)/g)){
  const link=match[1]||match[2];if(/^[a-z][a-z+.-]*:/i.test(link)||link.startsWith('#'))continue;
  const path=decodeURIComponent(link.split('#')[0]);if(path&&!existsSync(resolve(dirname(file),path)))throw Error(name+': missing '+link);count++;
 }
}
console.log('PASS: '+count+' local Markdown targets exist.');
