import {readdirSync} from 'node:fs';
import {join,relative,extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const root=fileURLToPath(new URL('../',import.meta.url));
const roots=new Set(['README.md','AGENTS.md','LICENSE','.gitignore','.env.example','.npmrc','package.json','pnpm-workspace.yaml','pnpm-lock.yaml','tsconfig.json']);
const dirs=new Set(['apps','services','packages','database','assets','docs','examples','tests','scripts','infra','reports','.github']);
const excluded=new Set(['node_modules','.git','.idea','.cache','.toolchains','.gradle','.kotlin','build','dist','coverage','uploads','backups','artifacts']);
const extensions=new Set(['.md','.json','.ts','.tsx','.mjs','.css','.html','.sql','.svg','.kt','.kts','.xml','.properties','.yaml','.yml','.ps1','.txt','.bat','.lockfile','.py','.csv']);
export function sourceFiles(){
 const files=[];
 function walk(folder,level=0){
  for(const entry of readdirSync(folder,{withFileTypes:true})){
   if(excluded.has(entry.name))continue;
   const path=join(folder,entry.name),name=relative(root,path).replaceAll('\\','/');
   if(level===0 && entry.isDirectory()&&!dirs.has(entry.name))continue;
   if(entry.isSymbolicLink())throw Error('Unexpected source symlink: '+name);
   if(entry.isDirectory()){walk(path,level+1);continue;}
   if(entry.name==='local.properties'||/\.(jks|keystore|apk|aab|log|zip)$/.test(entry.name)||(/^\.env/.test(entry.name)&&name!=='.env.example'))continue;
   if(level===0){if(roots.has(name))files.push(name);else throw Error('Unclassified root source file: '+name);continue;}
   if(extensions.has(extname(name))||['gradlew','LICENSE','NOTICE','COPYING'].includes(entry.name)||name==='apps/android/gradle/wrapper/gradle-wrapper.jar'||(name.startsWith('reports/screenshots/')&&/\.(png|jpg)$/.test(name))||(name.startsWith('assets/products/')&&name.endsWith('.webp')))files.push(name);
   else throw Error('Unclassified source file: '+name);
  }
 }
 walk(root);return files.sort();
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(fileURLToPath(import.meta.url)))process.stdout.write(JSON.stringify(sourceFiles()));
