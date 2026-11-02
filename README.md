# GROZO · Final testing delivery

**Published catalogue:** https://shivam0296-coder.github.io/grozo/ · **Source:** https://github.com/shivam0296-coder/grozo. GitHub Actions build/deploy succeeded on 2026-11-02; live home/search/detail were checked. The complete initial publication's 498 source files matched local bytes. This is a pre-launch catalogue with ordering disabled. See [publication evidence](reports/final-build/publication.json).

**Goodness, Delivered by the Bagful.**

Start with [Android installation](docs/INSTALL-ANDROID.md), [website/GitHub hosting](docs/DEPLOY-WEBSITE.md), [actual tests](docs/FINAL-TEST-REPORT.md), [implemented API](docs/final-api.md) and [pending integrations](docs/PENDING-INTEGRATIONS.md). The customer and partner debug APKs are built and verified. Physical-device testing remains pending. The public website is a pre-launch catalogue; real orders/authentication/providers are not connected.

Closeout 2026-11-02: 70 Node tests and 21 Android core tests passed. Android Studio sync remains unverified; the owner requested no further IDE testing. The measured build workspace and new IDE caches exceeded the original disk cap; approved cleanup commands were blocked and no cache files were removed. See the final test report. Confirmed publication is recorded in [publication.json](reports/final-build/publication.json). The final ZIP includes both APKs in **installers/** and the complete source in **grozo/**. SDKs, caches and private signing keys are excluded.

The dated latest-delivery section below supersedes the preserved historical stage narrative. Existing source is retained; Android Studio opens **apps/android**, which contains **settings.gradle.kts**.

---

# GROZO — Stage 3 catalogue update

Daily Needs. Delivered Faster. Version 0.3.1 development build, 2026-10-31. This continues the existing Stage 1/2 architecture, original branding and commerce/delivery workflows.

All four supplied PDFs and all 11 reference screenshots were reviewed. **390 source entries** are imported with stable IDs, source page/text and the complete **52-node hierarchy** (4 roots, 48 subordinate nodes, up to 3 levels). There are 77 identified brand labels. The lists provide no merchant pack sizes, selling prices, MRP or stock. Those fields remain pending; imported entries cannot enter checkout until supplied and checked. Fifty grouped alternative/alias entries and two exact duplicate groups are preserved, without guessing individual SKUs.

**13 authentic, source-reviewed public-domain/CC0 produce photos** are bundled as optimized thumbnails/details. **377 images remain pending**, including brand packs and named cultivars. The remaining exact-image search is not exhaustive. No competitor assets, new logo, promotional artwork or AI packaging were generated. Stage 3 remains a partial development delivery.

## Open and run

Use Node 24.12+ in the Node 24 line and pnpm 11.25.0. Dependencies are pinned.

~~~powershell
pnpm install --frozen-lockfile --ignore-scripts --store-dir .cache/pnpm --node-linker hoisted --package-import-method copy
pnpm dev:web
# In another terminal:
pnpm dev:admin
~~~

Customer: http://127.0.0.1:5173 · Admin: http://127.0.0.1:5174.

The customer defaults to **From your PDFs**. Choose **Demo shopping** to test basket quantities, FRESH20, checkout, order status and cancellation with the separate 18 synthetic products. Imported unknown prices never appear as free. Admin → **Catalogue studio** manages the complete catalogue, nested categories, brands, variants, pricing/stock, activation, CSV preview/export and image upload/replacement.

Open **apps/android** in Android Studio. Customer and rider are separate installable modules in the shared project. Tested JDK 21, Gradle 8.13, AGP 8.13.2, Kotlin 2.2.21, SDK 36/build tools 35.0.0; minimum API 26. See the [build/install guide](docs/stage-3-build.md).

~~~powershell
pnpm check
pnpm typecheck
pnpm test
pnpm build
pnpm check:android
# Existing approved local Android toolchain:
pwsh -NoProfile -File scripts/build-android.ps1 -Offline
~~~

The current check results are **65 Node tests, 21 Android core unit tests and 86 browser assertions passed**. Both debug APKs compile and signatures verify; bundled catalogue/photo contents were checked. No native device/emulator installation, interaction tests or native screenshots were performed.

## Source and evidence

- [Catalogue data](packages/catalogue/imported.json), [photo metadata](packages/catalogue/media.json), [CSV audit](reports/catalogue-update-products.csv), [hierarchy](reports/catalogue-update-hierarchy.json).
- [PDF reconciliation](reports/catalogue-update-import-report.json), [duplicates](reports/catalogue-update-duplicates.json), [missing/reviewed images](reports/catalogue-update-image-manifest.json), [mapping review](reports/catalogue-update-mapping-review.json).
- [Completed/pending features](docs/stage-3-features.md), [catalogue/admin guide](docs/stage-3-catalogue.md), [validation](docs/validation.md), [screenshots](docs/screenshots.md), [status](docs/status.md).

The JSON/CSV catalogue is structured local source data, not an initialized PostgreSQL database. SQL/API extensions are additive **unexecuted drafts**; original Stage 1 contracts/migration and pricing/order rules remain intact. Browser origins and native apps have independent local persistence. Admin edits are not synchronized to customer/rider apps. Authentication, persistent backend, actual inventory, Maps, OTP, payments and push remain unimplemented. No provider key is required for this build.

New deliverables are named GROZO-Stage-3-Catalogue-Update-Source.zip and GROZO-Customer/Partner-Stage3-0.3.1-debug.apk. Earlier ZIPs/APKs are preserved. Repackage to a new path with `pwsh -NoProfile -File scripts/package.ps1 -OutputPath <new-absolute-path>`; it checks the full entry set and every archived file hash. Toolchains, caches, originals from Downloads, reference screenshots, private keys, build outputs and machine configuration are excluded. APKs are separate.

GROZO is not a Git repository. No publication, paid service, external AI, emulator or real customer/rider data was used. Original project ownership/license terms remain; photo attribution and license records are included under assets/products and docs/licenses.

## Dedicated image library (2026-10-31)

A separate image-only task researched all 390 entries and delivered 103 approved loose-produce photos covering 104 source records, plus itemized missing/manual reports for 286 entries. See [image library report](docs/product-image-library.md). This does not change the 13 photos currently bundled in the apps. The website, app layouts and APKs are unchanged.

## Latest delivery (2026-11-01)

**Goodness, Delivered by the Bagful.** The existing GROZO source now provides code-5 customer/partner debug builds, the complete 390-entry source catalogue and 104 reviewed image mappings (103 unique sets). Prices, packs and stock remain unconfirmed; real ordering is unavailable. A shared read-only catalogue API is implemented for testing; persistent commerce/auth/providers remain pending. Earlier stage counts above are historical.

Start with [Android installation and exact Android Studio folder](docs/INSTALL-ANDROID.md), [website/GitHub deployment](docs/DEPLOY-WEBSITE.md), [current API](docs/final-api.md), [completed/pending](docs/PENDING-INTEGRATIONS.md), [test report](docs/FINAL-TEST-REPORT.md) and [future iOS guide](docs/IOS-INTEGRATION.md). Android Studio opens the extracted **apps/android** folder containing **settings.gradle.kts**, not a ZIP or individual module. Keep the complete source together so catalogue/image paths resolve.

`pnpm --filter @grozo/web build` defaults to the pre-launch public catalogue. `pnpm dev:web` retains labelled synthetic local shopping, and `pnpm dev:admin` the local admin. Node 24.12+ (24.x), pnpm 11.25.0. Run the read-only API with `node services/api/server.mjs`; no provider key is required. Use a real HTTPS VITE_API_BASE_URL only after hosting an API; otherwise the public catalogue explicitly uses bundled source data. Native debug builds accept an optional HTTPS grozoApiBaseUrl property for an explicit connectivity check. Full live commerce mode remains closed.

Owner/business support: Shivam Kumar · GROZO, Siyana, Bulandshahr, Uttar Pradesh · 7830838894 · Shivam989845@gmail.com. No release signing key or release APK is invented. Phone installation/UI testing remains pending by owner choice. Original source backed up as GROZO-Before-Final-Build-2026-11-01.zip, SHA-256 CAE0EF5BF6B5F5BC7F791D0BD2ABE273BB0444FE863A7F5B3D9018FA38FC9131. A copy of this README before the final documentation update is in docs/history/pre-final-readme.md.txt.
