# Stage 3 setup note

Use the existing setup below, plus [current build/install evidence](stage-3-build.md) and [catalogue workflow](stage-3-catalogue.md). No extra runtime dependency or API key is required. PDF/source images remain pending.

# Build and installation instructions

## Web and admin

Use Node 24.12+ (tested 24.22.1) and pnpm 11.25.0.

```powershell
cd C:\Users\shiva\Documents\Codex\grozo
pnpm install --frozen-lockfile --ignore-scripts --store-dir .cache/pnpm --node-linker hoisted --package-import-method copy
pnpm dev:web
```

Customer preview: http://127.0.0.1:5173. In another terminal run pnpm dev:admin; admin preview: http://127.0.0.1:5174.

Build both: pnpm build. Run checks: pnpm check; pnpm typecheck; pnpm test; pnpm check:android. With both servers running, pnpm test:ui replays the shared browser flows using an existing Chrome/Edge. Set GROZO_BROWSER_PATH only if your installed browser is elsewhere. No browser binary is downloaded.

Each origin stores only its synthetic development workspace in localStorage. Use one development tab per origin; there is no live synchronization or multi-tab conflict resolution. The development-state selector exposes loading/empty/error/retry states. All displayed business statistics are labelled and derived from local records.

VITE_DATA_MODE defaults to development. Setting it to live deliberately shows a backend connection gate; it does not silently substitute fixture records. VITE_API_BASE_URL defaults to /api/v1 and must point to a real authenticated backend later. No Stage 1 endpoint has been implemented.

## Android Studio

Open apps/android as the project. Select customer or rider. Sync the included Gradle wrapper with a compatible JDK and SDK platform 36/build tools 35.0.0.

```powershell
cd apps/android
.\gradlew.bat :core:testDebugUnitTest :customer:assembleDebug :rider:assembleDebug
```

Outputs: customer/build/outputs/apk/debug/customer-debug.apk and rider/build/outputs/apk/debug/rider-debug.apk. Both are development builds, Android API 26+, with separate application IDs/databases. See stage-2-build.md for tested versions, installation, verification and limitations.

The approved local toolchain also supports pwsh -NoProfile -File scripts/build-android.ps1 from the project root. Optional acquisition helpers use official HTTPS sources and checksums; downloading/installing a toolchain on another machine requires its owner's approval and budget. They do not install an emulator.

Native debug builds load synthetic catalogue/Room data. Native release builds disable that path and fail closed at the unconfigured HTTPS backend boundary. Real API auth/data mapping, release signing and integration tests belong to later stages.

## Credentials

No Maps, payment, notification, OTP or AI key is needed in Stage 2. Integrations remain labelled unavailable. .env.example contains names only; do not put production credentials into browser builds, source archives or chat. Follow integrations.md in Stage 4.

## Source ZIP

Use PowerShell 7:

```powershell
pwsh -NoProfile -File scripts/package.ps1 -OutputPath C:\path\GROZO-Stage-2-Source.zip
```

Choose a new output path. Packaging refuses to overwrite an existing archive. It includes sources, fixtures, locks, wrapper, notices, reports and screenshots while excluding toolchains, caches, builds, secrets and private signing keys. APKs are delivered separately. The archive is checked against the complete allowed source inventory.

## Troubleshooting

- Install/symlink failure: use the documented copied/hoisted command and project-local store.
- Missing Java/SDK: follow Android Studio setup; web checks remain independently runnable.
- Kotlin stale temporary-folder failure: the supplied project selects in-process compilation; use the local helper's persistent temporary folder when building in restricted command sessions.
- Signature mismatch when updating a debug APK: see stage-2-build.md; do not overwrite a production app.
- Missing backend/provider: expected in this stage. Never interpret a development success message as a commercial order, OTP, route, payment or push receipt.
