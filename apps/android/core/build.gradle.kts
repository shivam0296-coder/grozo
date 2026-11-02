import java.net.URI
plugins {
 id("com.android.library"); id("org.jetbrains.kotlin.android"); id("org.jetbrains.kotlin.plugin.compose")
 id("com.google.devtools.ksp"); id("com.google.dagger.hilt.android")
}
val grozoEndpoint = providers.gradleProperty("grozoApiBaseUrl").orNull?.trim()?.takeIf { it.isNotEmpty() }
if (grozoEndpoint != null) {
 val uri = URI(grozoEndpoint)
 require(uri.scheme == "https" && uri.host != null && uri.userInfo == null && uri.query == null && uri.fragment == null && grozoEndpoint.endsWith("/")) { "grozoApiBaseUrl must be an HTTPS URL ending in /, without credentials, query or fragment." }
}
android {
 namespace = "com.grozo.core"; compileSdk = 36
 defaultConfig {
  buildConfigField("String", "API_BASE_URL", "\"" + (grozoEndpoint ?: "https://localhost/api/v1/") + "\"")
  buildConfigField("boolean", "API_CONFIGURED", (grozoEndpoint != null).toString())
  minSdk = 26; testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" }
 buildFeatures { compose = true; buildConfig = true }
 buildTypes {
  debug { buildConfigField("boolean", "DEVELOPMENT_MODE", "true") }
  release { buildConfigField("boolean", "DEVELOPMENT_MODE", "false") }
 }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
 sourceSets["main"].assets.srcDir("../../../packages/fixtures")
 sourceSets["main"].assets.srcDir("../../../packages/catalogue")
 sourceSets["main"].assets.srcDir("../../../assets/products")
}
kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }
dependencies {
 api(platform("androidx.compose:compose-bom:2025.10.01"))
 api("androidx.compose.ui:ui"); api("androidx.compose.ui:ui-tooling-preview")
 api("androidx.compose.material3:material3"); api("androidx.compose.material:material-icons-extended")
 api("androidx.activity:activity-compose:1.11.0")
 api("androidx.lifecycle:lifecycle-runtime-compose:2.9.4"); api("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.4")
 api("androidx.navigation:navigation-compose:2.9.5")
 api("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
 api("com.google.dagger:hilt-android:2.57.2"); ksp("com.google.dagger:hilt-compiler:2.57.2")
 implementation("androidx.room:room-runtime:2.8.3"); implementation("androidx.room:room-ktx:2.8.3"); ksp("androidx.room:room-compiler:2.8.3")
 implementation("com.squareup.retrofit2:retrofit:3.0.0"); implementation("com.squareup.retrofit2:converter-gson:3.0.0")
 implementation("com.squareup.okhttp3:okhttp:4.12.0")
 api("io.coil-kt.coil3:coil-compose:3.3.0")
 implementation("io.coil-kt.coil3:coil-network-okhttp:3.3.0")
 implementation("com.google.code.gson:gson:2.13.2")
 debugImplementation("androidx.compose.ui:ui-tooling")
 testImplementation("junit:junit:4.13.2")
}
