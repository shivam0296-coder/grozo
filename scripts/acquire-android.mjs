// Owner-approved local toolchain download; 3 GB network / 6 GB disk ceilings.
import {mkdir,readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),tools=join(root,'.toolchains'),downloads=join(tools,'downloads');
await mkdir(downloads,{recursive:true});await writeFile(join(tools,'acquire.pid'),String(process.pid));
let downloaded=0;const cap=3_000_000_000;
function getText(url){const r=spawnSync('curl.exe',['-fsSL','--connect-timeout','20','--max-time','60',url],{encoding:'utf8',maxBuffer:5_000_000});if(r.status!==0)throw Error('Metadata download failed '+r.stderr);return r.stdout;}
async function hash(file,algorithm='sha256'){const h=createHash(algorithm);for await(const chunk of createReadStream(file))h.update(chunk);return h.digest('hex');}
async function download(url,name,sha,algorithm='sha256'){
 const file=join(downloads,name);
 try{if(sha&&await hash(file,algorithm)===sha.toLowerCase()){console.log('Verified cached '+name);return file;}}catch{}
 const headers=spawnSync('curl.exe',['-fsSLI','--connect-timeout','20','--max-time','60',url],{encoding:'utf8',maxBuffer:5000000});
 if(headers.status!==0)throw Error('Cannot inspect download '+name);
 const lengths=[...headers.stdout.matchAll(/^content-length:\s*(\d+)/gmi)].map(m=>Number(m[1]));const total=lengths.at(-1);
 if(!total||downloaded+total>cap)throw Error('Missing size or download cap exceeded');
 const parts=join(downloads,name+'.parts');await mkdir(parts,{recursive:true});
 const {open}=await import('node:fs/promises');const output=await open(file,'w');const {spawn}=await import('node:child_process');
 let index=0;const chunk=8388608,count=Math.ceil(total/chunk);
 async function worker(){while(index<count){const i=index++,start=i*chunk,end=Math.min(total-1,start+chunk-1),part=join(parts,String(i)+'.part');
  let exists=false;try{exists=(await stat(part)).size===end-start+1;}catch{}
  if(!exists){await new Promise((resolve,reject)=>{const child=spawn('curl.exe',['-fsSL','--connect-timeout','20','--max-time','300','--retry','2','--retry-delay','2','--range',start+'-'+end,'-o',part,url],{stdio:['ignore','ignore','pipe']});let error='';child.stderr.on('data',d=>error+=d);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(error||'Chunk download failed')));});downloaded+=(await stat(part)).size;}
  const bytes=await readFile(part);if(bytes.length!==end-start+1)throw Error('Unexpected range length '+name);if(downloaded>cap)throw Error('Network cap exceeded');await output.write(bytes,0,bytes.length,start);console.log(name+': part '+(i+1)+'/'+count);
 }}
 try{await Promise.all([worker(),worker(),worker()]);}finally{await output.close();}
 if(sha&&await hash(file,algorithm)!==sha.toLowerCase())throw Error('Checksum mismatch '+name);
 console.log('Verified '+name+' ('+(await stat(file)).size+' bytes)');return file;
}
function unzip(file,target){const r=spawnSync('pwsh',['-NoProfile','-File',join(root,'scripts','extract-zip.ps1'),'-Archive',file,'-Destination',target],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);}
export {download,unzip,tools,getText};
if(process.argv[1] && resolve(process.argv[1])===resolve(fileURLToPath(import.meta.url))){
const metadata=JSON.parse(getText('https://api.adoptium.net/v3/assets/latest/21/hotspot?architecture=x64&image_type=jdk&os=windows&vendor=eclipse'));
const jdk=metadata[0].binary.package;
const jdkZip=await download(jdk.link,jdk.name,jdk.checksum);
const javaDir=join(tools,'java');await mkdir(javaDir,{recursive:true});unzip(jdkZip,javaDir);
const javaHome=join(javaDir,(await readdir(javaDir)).find(n=>n.startsWith('jdk-')));
const sdk=join(tools,'android-sdk');
const sdkZip=await download('https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip','commandlinetools.zip','90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a');
await mkdir(join(sdk,'cmdline-tools','latest'),{recursive:true});
const sdkTemp=join(tools,'sdk-unpacked');unzip(sdkZip,sdkTemp);
const {cp}=await import('node:fs/promises');await cp(join(sdkTemp,'cmdline-tools'),join(sdk,'cmdline-tools','latest'),{recursive:true});
const gradleSha=getText('https://services.gradle.org/distributions/gradle-8.13-bin.zip.sha256').trim();
const gradleZip=await download('https://services.gradle.org/distributions/gradle-8.13-bin.zip','gradle-8.13-bin.zip',gradleSha);unzip(gradleZip,tools);
await writeFile(join(tools,'environment.json'),JSON.stringify({javaHome,sdk,gradle:join(tools,'gradle-8.13'),gradleSha,jdkVersion:metadata[0].release_name,downloadedBytes:downloaded,downloadLimitBytes:cap,storageLimitBytes:6_000_000_000},null,2));
console.log('Base toolchain ready. No emulator installed. SDK build packages are the next bounded step.');

}
