# GROZO — Stage 2 development builds

**Daily Needs. Delivered Faster.** Starting in Siyana, Bulandshahr, Uttar Pradesh.

Stage 2 continues the existing Stage 1 foundation. It now contains a runnable React customer website, React admin workspace, Kotlin/Compose customer application and Kotlin/Compose delivery partner application. Both Android debug APKs were compiled and signature-verified.

**Maturity: development PROTOTYPE.** All interfaces clearly label synthetic records. OTP/authentication, the persistent NestJS/PostgreSQL backend, Maps, payment/refunds, push notifications, real rider locations and AI remain NOT_IMPLEMENTED. No commercial order, real delivery or payment is created.

## Start the website and admin

Prerequisites: Node 24.12+ within Node 24 and pnpm 11.25.0.

```powershell
cd C:\Users\shiva\Documents\Codex\grozo
pnpm install --frozen-lockfile --ignore-scripts --store-dir .cache/pnpm --node-linker hoisted --package-import-method copy
pnpm dev:web
```

Open http://127.0.0.1:5173. In a second terminal, run `pnpm dev:admin` and open http://127.0.0.1:5174. Each development origin/app has its own local workspace; there is no cross-device synchronization yet.

No API key is required. See [installation and build instructions](docs/setup.md) and [development-mode boundaries](docs/decisions/0002-stage-2-development-interfaces.md).

## Android Studio and APKs

Open **apps/android** in Android Studio. It is one complete Gradle project with independently installable **customer** and **rider** applications and a shared **core** library. Select the corresponding app module to run/build.

```powershell
cd apps/android
.\gradlew.bat :core:testDebugUnitTest :customer:assembleDebug :rider:assembleDebug
```

Use JDK 17+ compatible with Gradle 8.13, Android SDK platform 36 and build tools 35.0.0. The verified build used Temurin 21.0.13+9. The local approved toolchain can also be used through `pwsh -NoProfile -File scripts/build-android.ps1`.

APK IDs: `com.grozo.customer.dev` and `com.grozo.rider.dev`. Minimum Android version: 8.0 / API 26. These are debug-signed development builds, not Play Store releases. No emulator was installed, and physical-device UI execution has not been performed. See [build evidence](docs/stage-2-build.md).

## Implemented development features

- Customer: onboarding, catalogue/categories, search and filters, detail/related picks, basket, coupon/bill calculation, local checkout/order history/cancellation, saved addresses, profile, support and explicit integration placeholders.
- Rider: development registration, availability, accept/decline, pickup, simulated collection/completion, history, derived development earnings, profile and privacy/integration states.
- Website: customer shopping/account/support flows plus about/contact and clearly marked draft legal pages.
- Admin: responsive navigation; local product/stock editing, order confirmation/assignment/progression, rider/zone controls, campaign/coupon forms, derived reports/CSV, support resolution, commerce settings and activity records.
- Shared: original GROZO branding/illustrations, loading/error/empty/success states, typed contract adapters, source fixtures isolated from production data.

The [feature checklist](docs/stage-2-features.md) distinguishes complete local interactions from pending backend/integration features.

## Verification

```powershell
pnpm check
pnpm typecheck
pnpm test
pnpm build
pnpm check:android
```

Browser automation can be repeated with both preview servers running using `pnpm test:ui`. It uses an already installed Chrome/Edge; no browser download is performed. The shared flows were executed through Codex browser automation for this delivery.

Verified: **42 Node tests, 12 Android unit tests, 38 browser assertions**, web type checks/builds, both APK builds/signatures and source-preservation checks. See [validation](docs/validation.md), [browser results](reports/browser-results.json) and [APK verification](reports/apk-verification.json).

## Source map

- `apps/android/{customer,rider,core}`: Android project sources.
- `apps/{web,admin}`: React applications.
- `packages/{domain,client,ui,fixtures}`: unchanged Stage 1 domain rules, client state/adapters, shared UI and synthetic fixtures.
- `database/`, `packages/contracts/`: preserved Stage 1 database draft and API design.
- `reports/screenshots/`: actual browser captures at desktop/phone sizes.
- `docs/`: architecture, setup, decisions, status, feature and validation records.

The [architecture](docs/architecture.md), [folder structure](docs/project-structure.md) and [roadmap](docs/roadmap.md) remain the continuing plan. GROZO is not yet a Git repository; no remote or publication was created.

## Ownership and notices

Original GROZO material remains all rights reserved under LICENSE. Third-party licenses/notices are recorded in docs/licenses, web public notice files and Android assets. No real customer/rider data, unrestricted API keys, externally trained models or competitor images are included. See [third-party notices](docs/third-party-notices.md).

Rebuild the complete source ZIP with `pwsh -NoProfile -File scripts/package.ps1 -OutputPath <new-absolute-zip-path>`. Toolchains, caches, private signing keys and build outputs are excluded; the verified APKs are delivered separately.
