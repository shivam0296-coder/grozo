# Stage 2 build and installation report

Date: 2026-10-30. Source version: 0.2.0. Debug Android version: 0.2.0-development.

## Verified toolchain

| Component | Tested pin |
| --- | --- |
| Node / pnpm | 24.22.1 / 11.25.0 |
| React / React DOM | 19.3.1 |
| Vite / React plugin | 8.3.5 / 6.1.2 |
| TypeScript / Tailwind | 5.9.3 / 4.3.3 |
| Java | Eclipse Temurin 21.0.13+9 |
| Gradle / Android Gradle plugin | 8.13 / 8.13.2 |
| Kotlin / Compose compiler plugin | 2.2.21 / 2.2.21 |
| KSP / Hilt | 2.2.21-2.0.4 / 2.57.2 |
| Android platform / build tools | API 36 / 35.0.0 |
| Minimum / target Android API | 26 / 36 |

Compose BOM 2025.10.01; Room 2.8.3; Navigation 2.9.5; lifecycle 2.9.4; Retrofit 3.0.0; OkHttp 4.12.0; Coroutines 1.10.2; Coil 3.3.0; Gson 2.13.2. Resolved transitive versions and hashes are in Gradle lock/verification files.

## Android results

Both :customer:assembleDebug and :rider:assembleDebug succeeded. First uncached full build: 24m 44s. Updated source/notices build: 4m 13s. Final configuration verification reused current outputs successfully.

12 core Android unit tests passed with zero failures/errors/skips. Both APK signatures verify using v2. Both packages include arm64-v8a, armeabi-v7a, x86 and x86_64 native support. Only INTERNET and the AndroidX signature-level receiver permission are present; no Maps/location/notification runtime permission is requested.

- Customer: com.grozo.customer.dev — 20,451,973 bytes.
- Rider: com.grozo.rider.dev — 20,356,886 bytes.

See ../reports/apk-verification.json for exact SHA-256 and manifest evidence. Actual signatures are debug signatures. No emulator was installed and no physical-device UI execution was performed.

## Import and build in Android Studio

1. Extract the complete source ZIP.
2. Open its apps/android folder, not an individual module folder.
3. Select a compatible JDK (the tested JDK is 21; AGP requires at least 17).
4. Install SDK platform 36 and build tools 35.0.0. No emulator is required to compile.
5. Let Android Studio sync the included Gradle wrapper and locked dependencies.
6. Select customer or rider as the app module and build a debug APK, or run the Gradle command in README.

local.properties and private signing material are intentionally excluded. Android Studio creates machine-specific SDK configuration. The optional scripts/build-android.ps1 helper uses the approved local .toolchains/environment.json when available; a normal Android Studio installation can use gradlew.bat directly.

## Install the provided debug APKs

Copy the selected APK to an Android 8.0+ test phone and open it with the phone's normal package installer, or use an already configured adb connection:

```powershell
adb install -r GROZO-Customer-Stage2-debug.apk
adb install -r GROZO-Partner-Stage2-debug.apk
```

Use fictional development details. Customer and rider databases are separate and do not exchange new orders without the future backend. A fresh rider installation includes a synthetic offer and completed history record so its workflow can be explored independently. No real payment, message or delivery is performed.

Release signing/Play publication are not configured or authorized. If a different debug signing key is used later, Android may reject an in-place update; resolve that on the test device while preserving any development data you need.

## Setup problems resolved

Windows workspace symlink creation was unavailable; root hoisted/copied dependencies and relative imports work without it. A too-recent icon-package release failed the package manager's age policy; an older pinned release was used without relaxing the policy.

Large tool downloads were resumed in bounded ranges and verified against official checksums. Gradle wrapper URL availability probing timed out; the official distribution was independently downloaded/hash-verified and the wrapper generated with the same pinned checksum. SDK platform directories were corrected to match their package identities.

A reused Kotlin daemon referred to a removed temporary folder. The build succeeded using its fallback; the final configuration selects in-process Kotlin compilation and a persistent project-local temporary folder. SDK analytics-settings writes outside the workspace were denied; this is a non-fatal build-tool warning and no app analytics service is included. A native path library could not be stripped without extra tooling and is packaged unmodified in these debug builds.

## Resource budget

The owner approved at most 3 GB download and 6 GB disk, with no emulator or paid service. Official JDK, command tools, Gradle and initial SDK package archives total roughly 0.63 GB; Maven dependencies, retries and the corrected platform add overhead. Artifact/cache measurements and a conservative transfer estimate are recorded in validation.md. Toolchains/caches are local and excluded from the source ZIP. No GPU or paid API/cloud service was used.
