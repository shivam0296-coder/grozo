import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {sourceFiles,root} from './source-inventory.mjs';
const sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const protectedFiles=JSON.parse(readFileSync(resolve(root,'docs/stage-1-preservation.json'),'utf8'));
for(const [path,expected] of Object.entries(protectedFiles))if(sha(resolve(root,path))!==expected)throw Error('Protected source changed: '+path);
const apkExpected={
 'GROZO-Customer-debug.apk':'c8daac1a336ff6ea50bafb97f4886adb3f33f9dd322eac513929f27ad0d6b59f',
 'GROZO-Delivery-debug.apk':'b9766e71467c866544e8d373f602df232bc82fc3be51b7d665a5fc88aff53f36'
};
for(const [name,expected] of Object.entries(apkExpected))if(sha(resolve(root,'..',name))!==expected)throw Error('APK changed: '+name);
const files=sourceFiles();
for(const path of files){
 if(/(?:^|\/)(?:node_modules|\.git|\.gradle|\.cache|\.toolchains|build|dist)\//.test(path)||/\.(?:apk|aab|keystore|jks)$/.test(path))throw Error('Excluded file: '+path);
 if(!/\.(?:webp|jar|png|jpg)$/.test(path)){
  const data=readFileSync(resolve(root,path),'utf8');
  if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}/.test(data))throw Error('Possible credential in '+path);
 }
}
const result={date:'2026-11-02',sourceFiles:files.length,protectedStage1Files:Object.keys(protectedFiles).length,protectedStage1Hashes:'PASS',apkHashes:'PASS',sourceExclusions:'PASS',credentialPatternCheck:'PASS_LIMITED_PATTERN_SCAN',screenshots:files.filter(x=>x.startsWith('reports/screenshots/final-')),physicalDevice:'NOT_TESTED_OWNER_CHOSE_NO_PHONE',ideSync:'UNVERIFIED_OWNER_REQUESTED_NO_FURTHER_TESTING',cleanupExecuted:existsSync(resolve(root,'reports/final-build/approved-cache-cleanup.json'))};
writeFileSync(resolve(root,'reports/final-build/final-delivery-audit.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
