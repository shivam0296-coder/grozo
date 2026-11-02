// Official SDK packages only. No emulator, system image or paid component.
import {download,unzip,tools,getText} from './acquire-android.mjs';
import {mkdir,readdir,cp,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const xml=getText('https://dl.google.com/android/repository/repository2-3.xml');
await writeFile(join(tools,'repository.xml'),xml);
const parsed=spawnSync('pwsh',['-NoProfile','-File',join(tools,'..','scripts','sdk-metadata.ps1'),'-Path',join(tools,'repository.xml')],{encoding:'utf8'});
if(parsed.status!==0)throw Error(parsed.stderr);
const packages=JSON.parse(parsed.stdout),sdk=join(tools,'android-sdk');
for(const pkg of packages){
 const zip=await download('https://dl.google.com/android/repository/'+pkg.url,pkg.url,pkg.sha1,'sha1');
 const unpack=join(tools,'sdk-package-temps',pkg.path.replaceAll(';','-'));
 await mkdir(unpack,{recursive:true});unzip(zip,unpack);
 const entries=await readdir(unpack,{withFileTypes:true});
 const folder=entries.find(e=>e.isDirectory());if(!folder)throw Error('Unexpected SDK archive layout');
 const destination=join(sdk,...pkg.path.split(';'));
 await mkdir(destination,{recursive:true});await cp(join(unpack,folder.name),destination,{recursive:true});
 console.log('Installed official '+pkg.path);
}
await writeFile(join(tools,'sdk-packages.json'),JSON.stringify({packages,archiveBytes:packages.reduce((n,p)=>n+p.size,0),emulatorInstalled:false,license:'https://developer.android.com/studio/terms'},null,2));
console.log('SDK platform, build tools and platform-tools ready. Complete SDK license review with sdkmanager before build.');
