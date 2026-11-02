plugins { id("com.android.application"); id("org.jetbrains.kotlin.android"); id("org.jetbrains.kotlin.plugin.compose"); id("com.google.devtools.ksp"); id("com.google.dagger.hilt.android") }
android {
 namespace = "com.grozo.customer"; compileSdk = 36
 defaultConfig { applicationId = "com.grozo.customer"; minSdk = 26; targetSdk = 36; versionCode = 5; versionName = "0.4.0"; testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" }
 buildFeatures { compose = true; buildConfig = true }
 buildTypes { debug { applicationIdSuffix = ".dev"; versionNameSuffix = "-development" }; release { isMinifyEnabled = false } }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }
dependencies {
 implementation(project(":core"))
 implementation("com.google.dagger:hilt-android:2.57.2"); ksp("com.google.dagger:hilt-compiler:2.57.2")
 debugImplementation("androidx.compose.ui:ui-tooling")
 testImplementation("junit:junit:4.13.2")
}
