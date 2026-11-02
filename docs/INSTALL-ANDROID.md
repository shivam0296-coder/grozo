# Install and test GROZO on Android

## Method A — direct APK installation

1. Use **GROZO-Customer-debug.apk** or **GROZO-Delivery-debug.apk**. Both are in the final ZIP's **installers** folder and supplied separately. Extract the ZIP first.
2. Transfer the APK to your Android phone by USB or your usual trusted file-transfer method. Android 8.0/API 26 or newer is required.
3. Open Files / My Files → Downloads (or your transfer folder), then tap the APK.
4. If Android blocks installation from this source, use the offered Settings screen and permit **Install unknown apps** for the specific Files/browser app. Return to the APK and choose **Install**. Do not bypass a harmful-file warning; verify the supplied file and SHA-256 sidecar.
5. Tap **Open**. Launcher names: **GROZO** and **GROZO Partner**. These are signed testing builds with development labels inside.
6. Customer: continue through welcome, browse the 390-entry source catalogue, search Royal Gala Apple, inspect photo attribution and open Help. Source entries have no confirmed merchant pack/price/stock, so they cannot enter checkout. The separate labelled demo catalogue exercises local quantities, coupon and simulated checkout.
7. Partner: use only a fictional development identity, go online, accept the labelled synthetic offer, confirm pickup and simulate completion. This does not dispatch a real delivery or synchronize with the customer application.

Version code 5 is newer than the previous code 4 and retains this machine's debug certificate. A build made elsewhere may use a different debug certificate. If Android reports a signature conflict, keep the existing installation and back up its test data before considering removal. Uninstalling removes private local data; do not uninstall a real production application.

## Method B — Android Studio

Verification limit: this folder was opened and both APKs compiled from the command line. A successful IDE Gradle sync was not observed. Known checksum-verification errors were addressed; the owner requested no further IDE sync testing. Follow the steps below on your machine and report any remaining sync error without disabling strict dependency verification.

1. Right-click the final ZIP → **Extract All**. Keep the complete extracted **grozo** source together because shared catalogue/photo files sit outside the Android subfolder.
2. Start Android Studio → **Open**.
3. Select **<extracted-location>\grozo\apps\android**. On this computer: **C:\Users\shiva\Documents\Codex\grozo\apps\android**. This exact folder contains **settings.gradle.kts**, **gradlew.bat**, **build.gradle.kts**, **customer**, **rider** and **core**. Open this folder, not the ZIP, repository root or a single app module.
4. Use JDK 21 for Gradle: Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK. Use the included Gradle Wrapper. Install SDK Platform 36 and Build Tools 35.0.0 if missing; no emulator is needed.
5. Wait for Gradle Sync. On this machine select **Use Project's SDK** if prompted to reuse the existing verified toolchain. A fresh extraction excludes local.properties; choose your own installed SDK. The first sync on a new machine downloads pinned dependencies.
6. On the phone: Settings → About phone → Software information if present → tap **Build number** seven times. Enter the device unlock code on the phone if asked.
7. Settings → Developer options → enable **USB debugging**. Connect a data-capable USB cable and accept **Allow USB debugging** for your own computer. Some manufacturers need a USB driver.
8. Android Studio: choose **customer** or **rider** in the run selector, select your connected phone, click the green **Run** triangle.

Clearly described steps are supplied; no screenshot of your particular phone or successful phone installation is claimed. Official device guidance: https://developer.android.com/studio/run/device.html

## Build command

From apps/android, with JDK 21 and SDK 36/build-tools 35.0.0:

```powershell
.\gradlew.bat :core:testDebugUnitTest :customer:assembleDebug :rider:assembleDebug
```

The ignored machine-specific toolchain is not part of the ZIP. scripts/build-android.ps1 -Offline is an optional helper only for this machine's existing .toolchains/environment.json. No source modifications are required for the bundled-data debug builds in Android Studio.

## API and release signing

The supplied APKs have no public backend configured. They browse bundled source data and store development changes locally. To check the included read-only service from a phone, host it behind valid HTTPS accessible by the phone. Set **grozoApiBaseUrl=https://YOUR_TEST_HOST/api/v1/** in ignored Gradle user properties or pass **-PgrozoApiBaseUrl=...**, then rebuild. The URL must end in / and cannot contain credentials/query/fragment. Help/Profile → **Check configured backend** verifies catalogue reachability only. Authentication, real orders and rider assignment are still pending. Cleartext traffic is disabled.

No release APK or keystore was invented. After release/backend gates pass, Android Studio → Build → Generate Signed App Bundle or APK. Create an owner-controlled signing key, strong password and secure offline backup; keep keys/passwords outside source control and use ignored configuration or CI secrets. Never use the disposable debug identity for a commercial release.

Physical installation, launch, native navigation, process recreation and accessibility are **pending**: the owner explicitly chose to proceed without a phone. adb devices returned no connected device.
