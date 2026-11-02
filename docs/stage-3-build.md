# Build and installation — 0.3.1 catalogue update

Date: 2026-10-31. Development debug APKs; Stage 3 merchant/photo completion and native device testing remain pending.

## Android

Both apps built with the existing pinned toolchain, Gradle --offline. Final build: BUILD SUCCESSFUL in 2m 14s, 119 actionable tasks, 16 executed and 103 up-to-date. Core JUnit: 21 tests, zero failures/errors/skips (12 commerce, 4 catalogue queries, 5 source import).

| APK | Application ID | Bytes |
| --- | --- | --- |
| GROZO-Customer-Stage3-0.3.1-debug.apk | com.grozo.customer.dev | 21,739,650 |
| GROZO-Partner-Stage3-0.3.1-debug.apk | com.grozo.rider.dev | 21,546,446 |

VersionCode 4, versionName 0.3.1-development, minimum API 26, target API 36. Signature verification passes and the debug certificate matches the previous development certificate. Both packages contain all 390 entries, media metadata and 26 WebP photo files. No signing key is packaged. Only INTERNET plus the AndroidX signature receiver permission appears; no Maps/location/push permission was added.

[APK hashes, signatures and manifests](../reports/catalogue-update-apk-verification.json) · [Android unit results](../reports/catalogue-update-android-unit-tests.xml).

Open apps/android in Android Studio, choose customer or rider. Use JDK 21 (tested Temurin 21.0.13+9), Gradle 8.13, AGP 8.13.2, Kotlin 2.2.21, SDK 36/build tools 35.0.0. Source ZIP includes wrapper/pins/locks/verification metadata; local.properties and installed toolchains are excluded.

~~~powershell
cd apps/android
.\gradlew.bat :core:testDebugUnitTest :customer:assembleDebug :rider:assembleDebug
~~~

From project root, the previously installed local toolchain supports:

~~~powershell
pwsh -NoProfile -File scripts/build-android.ps1 -Offline
~~~

Copy the APK to an Android 8.0+ test phone and open it through the normal package installer. With an already configured adb connection:

~~~powershell
adb install -r GROZO-Customer-Stage3-0.3.1-debug.apk
adb install -r GROZO-Partner-Stage3-0.3.1-debug.apk
~~~

Both apps can coexist and update their earlier debug versions when signatures match. No device installation or UI execution was available here. Use fictional development details. Each Room/browser workspace is independent; merchant/admin edits and orders do not sync across apps.

## Website and admin

Root README has run/install commands. `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm check` and `pnpm check:android` provide repeatable checks. The final web build emits a non-fatal Tailwind sourcemap warning; runtime builds succeed. Catalogue data is bundled locally, so code bundles are larger than the earlier 18-item preview; future authenticated server pagination is pending.

The supplied `pnpm test:ui` runner uses an already installed Chrome/Edge (or GROZO_BROWSER_PATH), with both Vite servers running. Its common UI flows were exercised through Cua: 86 assertions pass. The standalone Playwright CLI was not separately run.

## Deliverables and limits

The new source ZIP contains customer/rider Android modules, website/admin sources, shared packages, catalogue/photo data, additive database/API drafts, docs/tests/reports/screenshots and notices. APKs are delivered separately. Previous Stage 2/Stage 3 deliverables remain untouched.

No emulator, release signing, Play/AAB publication, production hosting, real identity, live order, payment, Maps or notification integration. Physical-device interaction/accessibility/performance QA and clean-machine reproduction remain pending.
