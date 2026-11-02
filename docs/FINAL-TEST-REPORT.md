# Final testing report — completed checks through 2026-11-02

## Closeout decisions

The owner chose no phone testing and explicitly requested finishing without further Android Studio sync testing. **IDE sync remains unverified.** The project folder opened; known strict-verification failures for the Gradle source ZIP and 146 IDE source archives were addressed using official repository checksums. No successful subsequent sync was observed. Verification remains strict. See reports/final-build/ide-sync-outcome.json.

Measured local Android workspace plus new global IDE caches reached **6,245,275,062 bytes**, above the approved 6,000,000,000-byte disk limit. Further Android downloads stopped. The owner approved deleting 405,153,071 bytes of identified new caches, but automatic approval review rejected cleanup commands under session command policy. **No cache files were removed by the agent.** Source, older caches and APKs were preserved. A manual cleanup helper remains separately available; it is not required to install these APKs. There is no complete historical download counter, so compliance with the original download cap is not inferred. See resource-summary.json.

Five final browser screenshots are saved, including final-demo-cancelled-order.jpg. The development basket enforced the minimum, accepted quantity 3 and FRESH20, calculated 386 rupees, created a clearly labelled local order and cancelled it. This was a synthetic workflow with no payment/delivery. Source mode was restored. See development-browser-workflow.json. Node tests (70), TypeScript, source and Android configuration checks were rerun successfully on 2026-11-02. The APK hashes and seven protected Stage 1 files were rechecked; see final-delivery-audit.json. These checks do not validate real commerce.

Consult reports/final-build/publication.json for confirmed GitHub and hosting outcomes. A prepared workflow alone is not deployment evidence. Historical details below remain as the evidence from the build cycle.

Final admin production-build browser checks on 2026-11-02 passed navigation for Overview, Orders and all 13 other management pages. The confirmed filter showed one matching synthetic order; the cancelled filter showed the empty state. The labelled development error state and Retry recovery worked, then Overview/Ready was restored. No saved records were changed. See admin-browser-closeout.json and final-admin-overview.jpg. These checks cover local development interfaces, not authenticated backend management.

Active objective: preserve the existing GROZO project, produce verified installable-format Android debug APKs, integrate approved catalogue images, test the customer/admin interfaces and read-only API, prepare GitHub/hosting and package complete source plus APKs. See ADR 0005. **No PRODUCTION_READY claim.**

## Passed

- Original source backup before changes: GROZO-Before-Final-Build-2026-11-01.zip; 275 verified source files, 3,278,132 bytes, SHA-256 CAE0EF5BF6B5F5BC7F791D0BD2ABE273BB0444FE863A7F5B3D9018FA38FC9131.
- Android offline Gradle build: :core:testDebugUnitTest :customer:assembleDebug :rider:assembleDebug. BUILD SUCCESSFUL (5m48s). 21 core JUnit tests, zero failures. Launch manifests, exact plugin/module graph, release fixture guard and premature provider-permission boundaries checked.
- Customer APK: 37,393,057 bytes; SHA-256 C8DAAC1A336FF6EA50BAFB97F4886ADB3F33F9DD322EAC513929F27AD0D6B59F.
- Delivery APK: 37,294,757 bytes; SHA-256 B9766E71467C866544E8D373F602DF232BC82FC3BE51B7D665A5FC88AFF53F36.
- Both APKs: apksigner verify --verbose --print-certs passed; aapt badging verifies code 5, min 26, target 36, launch activity, application ID and internet permission. Embedded catalogue = 390 concepts; 104 media mappings; all 208 mapped detail/thumbnail file hashes checked in EACH APK. Debug identity retained, no release signing key included.
- Node test suite: 70 passed, zero failed/skipped, including 5 actual HTTP API tests. See node-tests.xml. Tests cover pricing/order rules, catalogue preservation/guards, store behaviour, actual category/product fetching, HTTP search/pagination/errors, CORS/media integrity and explicit unavailable auth/cart/order handling.
- TypeScript no-emit check passed. Both React production builds passed. A separate configured-API catalogue build also passed.
- Source syntax/JSON/structure checks and Android source configuration checks passed. Seven protected Stage 1 domain/contract/migration/test files remain unchanged (verify against docs/stage-1-preservation.json).
- Browser: production catalogue served successfully at the simulated GitHub Pages /grozo/ path. All 15 checked routes rendered headings/main content: categories, shop, search, cart, checkout, login, signup, orders, tracking, account, support, contact, privacy, terms, about. Commerce routes clearly identify unavailable service; this is not a passed real-order journey.
- Browser search Royal Gala → one matching Royal Gala Apple → correct photo/credit/CC BY-SA 4.0/source provenance. No broken visible images on observed home/detail screens.
- Responsive browser frames at requested widths 375/390/768/1440 px: root client/scroll widths respectively 360/375/753/1425 px (15 px browser scrollbar), equal in each case: no horizontal overflow. Native browser viewport override did not apply reliably, so real-size same-origin iframe frames were measured instead; these are Chromium layout checks, not physical devices or Safari.
- Configured local API website initially showed Loading, then Connected catalogue API · loaded · ordering disabled. Stopping the actual API produced Catalogue could not be loaded and Retry, with no substituted fixture success. The API also reports database NOT_CONFIGURED and ordering false.
- Four actual browser screenshots saved in reports/screenshots: final-catalogue-desktop.jpg, final-catalogue-phone-frame.jpg, final-api-catalogue.jpg, final-api-error.jpg. The mobile image is explicitly a browser frame, not a phone screenshot.

## Failed attempts resolved or bounded

- First Android attempt failed on java.net.URI because the Gradle Java extension shadowed the package name. Fixed using explicit URI import; final build passed. android-first-attempt.txt retained.
- Git's credential-manager shell failed with a Windows named-object access error. Connected GitHub write tools are the publication path; only a confirmed remote ref proves success. See the final publication record.
- Initial full-page screenshot/navigation attempts timed out; bounded screenshots subsequently saved. These tool failures do not prove a product failure.
- One bulk documentation command was rejected by automatic approval review because it included file deletions. Existing scripts were retained and safer additive guides/backup-preserving documentation changes used.

## Not performed / pending

- Phone install, launch, native navigation, lifecycle, accessibility or device camera/location/push tests: owner chose proceed without phone; adb listed no device. No emulator installed.
- Android Studio folder opened successfully (apps/android containing settings.gradle.kts). IDE Gradle sync outcome is recorded separately after configuration checks; command-line build success is not automatically IDE sync success. The terminal initially had no JAVA_HOME even though a JDK exists.
- Real iPhone/Safari/Android browser/tablet checks, screen-reader audit, load/security penetration and production operational tests.
- PostgreSQL connection/migration/backup/restore tests: no running persistent DB/backend implementation. Authentication/OTP, real cart/quotes/orders/history/assignment/payments/maps/notifications tests: integrations are not implemented/configured. Unit simulations and 503 tests do not satisfy these tests.
- Release APK: omitted because owner release signing credentials are unavailable and live commerce release gates remain incomplete.

## Data, licences and resources

All 390 source concepts, source hierarchy and original names retained. Sales pack/price/MRP/stock absent in source, so no real salable variant is fabricated. 103 reviewed existing local photo sets cover 104 IDs; 286 exact photos remain unresolved. Credits, licences, source links and transformations accompany the assets. No new product-image downloads or external AI generation in this cycle. Repository licence unchanged.

Existing approved Android toolchain reused offline. No new emulator, paid account/provider, GPU run or commercial order. Approved-photo/source uploads and package downloads are ordinary GitHub/hosting traffic; no paid service was purchased. Exact local working-file storage is in resource-summary.json when measured. Build products, cache/dependencies, SDK/JDK, private debug keys and populated environments are excluded from Git/source inventory. APKs are included only in the final deliverable ZIP, outside Git source. Owner-supplied business contact details are intentionally used for support; no real shopper/rider personal data is collected.

## Next smallest action

Install the delivered customer APK on a physical Android phone, record device/OS and check the source catalogue/help/error states. Then provide merchant-reviewed SKU details and implement the persistent authenticated backend before enabling real ordering. See PENDING-INTEGRATIONS.md for the complete gate list. GitHub commit and hosting deployment require separate confirmed evidence; this report does not infer either from a workflow file.
