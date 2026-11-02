import {readFileSync,writeFileSync} from 'node:fs';
const edit=(f,fn)=>writeFileSync(f,fn(readFileSync(f,'utf8')));
edit('apps/android/core/build.gradle.kts',s=>s.replace('android {',`val grozoEndpoint = providers.gradleProperty("grozoApiBaseUrl").orNull?.trim()?.takeIf { it.isNotEmpty() }
if (grozoEndpoint != null) {
 val uri = java.net.URI(grozoEndpoint)
 require(uri.scheme == "https" && uri.host != null && uri.userInfo == null && uri.query == null && uri.fragment == null && grozoEndpoint.endsWith("/")) { "grozoApiBaseUrl must be an HTTPS URL ending in /, without credentials, query or fragment." }
}
android {`).replace('defaultConfig { minSdk = 26;',`defaultConfig {
  buildConfigField("String", "API_BASE_URL", "\\\"" + (grozoEndpoint ?: "https://localhost/api/v1/") + "\\\"")
  buildConfigField("boolean", "API_CONFIGURED", (grozoEndpoint != null).toString())
  minSdk = 26;`));
edit('apps/android/core/src/main/java/com/grozo/core/Dependencies.kt',s=>s.replace('"https://backend-not-configured.invalid/api/v1/"','BuildConfig.API_BASE_URL'));
edit('apps/android/core/src/main/java/com/grozo/core/WorkspaceRepository.kt',s=>s.replace('if(!BuildConfig.DEVELOPMENT_MODE){withContext','if(!BuildConfig.DEVELOPMENT_MODE){check(BuildConfig.API_CONFIGURED){"Configure grozoApiBaseUrl for the target HTTPS backend before a release."};withContext').replace(' private fun initial():Workspace {',` suspend fun checkBackend(){
  check(BuildConfig.API_CONFIGURED){"No backend URL configured. This build uses the bundled catalogue. Set grozoApiBaseUrl in local Gradle properties for an HTTPS test server."}
  val remote=withContext(Dispatchers.IO){api.catalogue()}
  check(remote.products.isNotEmpty() && remote.categories.isNotEmpty()) {"Backend catalogue is empty."}
 }
 private fun initial():Workspace {`));
edit('apps/android/core/src/main/java/com/grozo/core/Api.kt',s=>s.replace('interface GrozoApi {','interface GrozoApi {\n @GET("catalogue") suspend fun catalogue():OwnerCatalogue'));
edit('apps/android/customer/src/main/java/com/grozo/customer/MainActivity.kt',s=>s.replace('Text("Fictional development issue only.")','Text("Shivam Kumar · GROZO, Siyana, Bulandshahr, Uttar Pradesh");Text("7830838894 · Shivam989845@gmail.com");Text("Fictional development issue only. Real orders are not active.");OutlinedButton(onClick={vm.act(success="Backend catalogue reachable. Authentication and ordering remain pending."){checkBackend()}}){Text("Check configured backend")}').replace('it.artist+" · "+it.license+" · "+it.sourcePage','it.artist+" · "+it.license+" · "+it.sourcePage+"\\n"+(it.licenseUrl?:"")+"\\n"+(it.modifications?:"")'));
edit('apps/android/rider/src/main/java/com/grozo/rider/MainActivity.kt',s=>s.replace('SectionCard("Development partner"){','SectionCard("Development partner"){Text("Goodness, Delivered by the Bagful.");Text("GROZO · Siyana · Support: 7830838894 / Shivam989845@gmail.com");OutlinedButton(onClick={vm.act(success="Backend catalogue reachable. Rider assignments remain pending."){checkBackend()}}){Text("Check configured backend")};'));
edit('packages/ui/src/index.tsx',s=>s.replace("import.meta.env.VITE_DATA_MODE||'development'","import.meta.env.VITE_DATA_MODE||(import.meta.env.MODE==='catalogue'?'catalogue':'development')").replace("['development','live'].includes(MODE)","['development','catalogue','live'].includes(MODE)").replace('must be development or live','must be development, catalogue or live'));
edit('apps/web/package.json',s=>s.replace('vite build"','vite build --mode catalogue"'));
