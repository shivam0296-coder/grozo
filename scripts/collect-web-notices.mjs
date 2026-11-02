import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),modules=join(root,'node_modules');
const packages=[];
for(const item of await readdir(modules,{withFileTypes:true})){
 if(item.name.startsWith('.'))continue;
 if(item.name.startsWith('@')){for(const sub of await readdir(join(modules,item.name)))packages.push(join(modules,item.name,sub));}
 else packages.push(join(modules,item.name));
}
let output='GROZO Stage 2 — third-party web dependency notices\nOriginal GROZO material remains all rights reserved.\n\n';
const inventory=[];
for(const path of packages){
 try{const pkg=JSON.parse(await readFile(join(path,'package.json'),'utf8'));if(pkg.name?.startsWith('@grozo/'))continue;
  const files=(await readdir(path)).filter(n=>/^(licen[sc]e|notice|copyright)(\.|$)/i.test(n));
  inventory.push({name:pkg.name,version:pkg.version,license:pkg.license||'See upstream notice'});
  for(const file of files){try{const text=await readFile(join(path,file),'utf8');output+='\n===== '+pkg.name+' '+pkg.version+' / '+file+' =====\n'+text+'\n';}catch{}}
 }catch{}
}
await mkdir(join(root,'docs','licenses'),{recursive:true});
await writeFile(join(root,'docs','licenses','web-dependencies.json'),JSON.stringify(inventory,null,2)+'\n');
await writeFile(join(root,'docs','licenses','web-notices.txt'),output);
for(const app of ['web','admin']){await mkdir(join(root,'apps',app,'public'),{recursive:true});await writeFile(join(root,'apps',app,'public','third-party-notices.txt'),output);}
console.log('Collected installed package metadata and shipped notices for '+inventory.length+' web dependencies.');
