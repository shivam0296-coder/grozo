# ADR 0002 — Stage 2 development interfaces

Date: 2026-10-30. Accepted under the owner's explicit Stage 2 implementation request and subsequent approval of the minimal Android toolchain.

## Boundary

Continue Stage 1 source; do not replace the project or implement an unapproved intelligence service. Stage 1 HTTP endpoints and database execution are absent, so no client can truthfully claim a live connection. Preserve domain/contracts/database/test hashes in stage-1-preservation.json.

## Decisions

1. Use the selected React/TypeScript/Vite/Tailwind stack. Browser state is an explicit development repository, shared UI components and a separate typed HTTP adapter. Root dependency installation uses copied/hoisted packages and relative source imports to avoid unavailable Windows symlink privileges.
2. Put synthetic catalogue records only in packages/fixtures. Development browser storage is versioned and separate from production. Records and metrics are visibly labelled; totals/charts derive from local records. No dataset or real customer/rider information is imported.
3. A normal Stage 2 build is a development preview. VITE_DATA_MODE=live selects an unavailable-backend gate and never substitutes fixtures. Native release builds similarly disable fixture loading. Complete authenticated live data mapping belongs to Stage 3; the adapters are not evidence of implemented server routes.
4. Use one Android Gradle workspace with two app modules and shared Hilt, Room, Retrofit, Coroutines/StateFlow, Coil and Compose code. Private app databases persist development state; each app is independent until the backend exists.
5. Development checkout/assignment/cash collection are explicitly simulated. No fake OTP, payment success, location, route or ETA is generated. Maps/payment/FCM/phone actions stay labelled unavailable.
6. Keep Kotlin compilation in the Gradle process and use a project-local temporary folder for the local build helper. This avoids a compiler daemon referring to a removed per-command temporary folder.
7. The owner authorized up to 3 GB download and 6 GB disk for the minimal build toolchain, debug APK generation and no emulator/paid services. Download official vendor artifacts and verify archive checksums. Accept only the necessary Android SDK license; skip unrelated package licenses.
8. Include dependency locks, Gradle verification metadata and provided license notices. Do not change the original project license or include private debug/release signing keys in the source package.
9. Use an installed Chromium browser for QA, actual screenshots, desktop/phone viewport measurements and repeatable visible-UI flows. No native device UI success is inferred from compilation.

## Consequences

Local browser origins and Android apps do not exchange orders or data. Browser multi-tab conflict resolution is not implemented; use one development tab per origin. Fixtures can be manipulated locally and have no production trust. Real identity, transactions, provider verification, authorization, secure media, operational capacity and legal/commercial policies remain release gates.

Exact pins are in package.json, pnpm-lock.yaml and Android Gradle/lock/verification files. Tested versions and remaining warnings are in stage-2-build.md and validation.md.
