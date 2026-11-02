import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {sourceFiles,root} from './source-inventory.mjs';

const commit=process.argv[2]||'refs/remotes/origin/main';
if(!/^(?:[a-f0-9]{40}|refs\/remotes\/origin\/main)$/.test(commit))throw Error('Supply a full commit SHA or refs/remotes/origin/main');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
const sha=git('rev-parse',commit).trim();
const tree=new Map(git('ls-tree','-r','-z',sha).split('\0').filter(Boolean).map(row=>{
 const [metadata,path]=row.split('\t');const [mode,type,blob]=metadata.split(' ');return [path,{mode,type,blob}];
}));
const expected=sourceFiles().filter(path=>!path.startsWith('reports/screenshots/'));
const differences=[];
for(const path of expected){
 const bytes=readFileSync(resolve(root,path));
 const blob=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
 const remote=tree.get(path);
 if(!remote)differences.push({path,reason:'MISSING'});
 else if(remote.type!=='blob'||remote.blob!==blob)differences.push({path,reason:'CONTENT_MISMATCH'});
 else if(path==='apps/android/gradlew'&&remote.mode!=='100755')differences.push({path,reason:'WRAPPER_NOT_EXECUTABLE'});
}
for(const path of tree.keys())if(!expected.includes(path))differences.push({path,reason:'UNEXPECTED_REMOTE_FILE'});
console.log(JSON.stringify({commit:sha,expectedSourceFiles:expected.length,remoteFiles:tree.size,matchedFiles:expected.length-differences.filter(x=>x.reason!=='UNEXPECTED_REMOTE_FILE').length,screenshots:'ZIP_ONLY_EXCLUDED_FROM_GIT',differences,result:differences.length?'FAIL':'PASS'},null,2));
if(differences.length)process.exitCode=1;
