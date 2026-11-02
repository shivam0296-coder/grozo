import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../apps/android/',import.meta.url));
const read=file=>readFileSync(join(root,file),'utf8');
for(const module of ['customer','rider','core']){if(!read('settings.gradle.kts').includes(':'+module))throw Error('Missing module '+module);read(module+'/build.gradle.kts');}
const apps=['customer','rider'];
for(const app of apps){
 const manifest=read(app+'/src/main/AndroidManifest.xml');
 for(const text of ['android.permission.INTERNET','android:exported="true"','android:allowBackup="false"'])if(!manifest.includes(text))throw Error('Missing manifest control');
 if(/ACCESS_(FINE|COARSE|BACKGROUND)_LOCATION|com.google.android.geo.API_KEY|POST_NOTIFICATIONS/.test(manifest))throw Error('Premature integration permissions');
 const source=read(app+'/src/main/java/com/grozo/'+app+'/MainActivity.kt');
 for(const text of ['@AndroidEntryPoint','NavHost','collectAsStateWithLifecycle','StateGate'])if(!source.includes(text))throw Error('Missing Android UI configuration '+text);
}
for(const text of ['8.13.2','2.2.21','2.57.2'])if(!read('build.gradle.kts').includes(text))throw Error('Missing exact Android plugin pin');
if(!read('core/build.gradle.kts').includes('DEVELOPMENT_MODE", "false"'))throw Error('Release must disable development mode');
if(!read('core/src/main/java/com/grozo/core/WorkspaceRepository.kt').includes('if(!BuildConfig.DEVELOPMENT_MODE)'))throw Error('Missing release fixture guard');
console.log('PASS: Android module graph, pinned plugins, launch manifests, integration permission boundaries, navigation and release fixture guard.');
console.log('This structural check does not replace Gradle compilation or device testing.');
