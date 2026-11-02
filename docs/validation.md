# Validation record — Stage 3 catalogue update

Date: 2026-10-31. Objective: continue the existing GROZO project with the supplied PDF catalogue and reference-driven UI refinements, preserving working code and earlier deliverables. Maturity remains development prototype / partial Stage 3.

## Passed evidence

| Check | Result |
| --- | --- |
| PDF coverage | 4 files, all 13 pages visually/text reviewed; 390 source entries = 390 imported, 0 unmapped |
| Taxonomy/brands | 52 nodes, 4 roots, 48 subordinate, depth 3; 77 unique brand IDs and valid references |
| Data integrity | Unique source/variant IDs, raw page provenance, 50 grouped entries and 2 exact duplicate groups preserved; no assumed packs/prices/stock |
| Node tests | 65 passed, 0 failed/skipped; original commerce/contracts preserved; import/idempotence/metadata/price guards/media hashes/scale query coverage |
| Android unit tests | 21 passed, 0 failures/errors/skips; commerce, catalogue query, additive import and unknown-price guards |
| Native compilation | Both customer/rider debug APKs build offline; final build 2m 14s, 119 tasks |
| APK verification | Signatures/manifests/version/permissions checked; 390 source entries and 26 photo files in each APK |
| Browser | 86 assertions passed through Cua shared UI flows; final console errors 0 |
| Responsive | Customer/admin desktop 1440, phone 390, customer tablet 768: page width checked, screenshots captured |
| Shopping | Demo search, quantities, coupon ₹470 calculation, checkout, local order/cancellation, location selection and loading/empty/error states |
| Admin | Navigation, validation/editing, order simulation, campaigns/support, atomic CSV duplicate retention, image upload/replace metadata and source reports |
| Imported UI | All 390 entries/17 pages, 88 personal care entries, brand/nested filters, no free unknown prices, unknown stock/price exclusion, provenance, loaded actual photo, distinct cultivar pending, leaf navigation |
| Preservation/package | Original Stage 1 hashes and brand assets checked; archive entry/hash verification recorded by packaging |

Reports: [Node](../reports/catalogue-update-node-tests.xml), [Android](../reports/catalogue-update-android-unit-tests.xml), [browser](../reports/catalogue-update-browser-results.json), [APKs](../reports/catalogue-update-apk-verification.json), [import](../reports/catalogue-update-import-report.json), [resources](../reports/catalogue-update-resources.json). Historical stage3-/Stage 2 reports describe earlier builds and are retained.

## Issues found and corrected

An initial source brand-ID generation collision hid some items; unique brand/reference assertions now cover every branded entry. Price validation now permits metadata edits to pending source concepts while confirmed items still require packs and valid positive prices. Source and demo taxonomy nodes are filtered separately to avoid duplicate category keys; leaf navigation retains its selection. All final browser assertions passed with no new console errors.

One repeat-run browser test used an exact label containing the textarea's previous default text; it now locates the accessible Description textbox and waits for the dialog. The initial attempt is not counted as a passed test. A source-script stdout encoding issue was corrected to UTF-8; extraction files/pages were subsequently reviewed. One carrot photo was rejected after visual review and remains pending.

Tailwind emits a non-fatal sourcemap warning. The locally bundled catalogue causes a >500 kB JS chunk warning (customer approximately 722.58 kB, admin 740.26 kB before gzip); server pagination/code splitting remain future work. Prior Android build logs contain a non-fatal analytics settings write denial and Compose icon deprecation; compilation succeeds. No toolchain/dependency upgrade was introduced.

## Skipped / incomplete

No Android phone/emulator installation or native interaction/screenshots, native accessibility or device performance checks. No PostgreSQL migration execution, real API/server/shared persistence, authentication/RBAC, live stock, exact-photo coverage, secure hosted media, OTP, Maps/routes/ETA, payments, notifications, release signing, production load/security/backup/rollback testing or publication. The standalone Playwright CLI was not separately executed; shared tests ran via Cua.

Thirteen authentic generic produce photos are source-reviewed; 377 exact images remain pending and remaining research is not exhaustive. PDFs provide no merchant pack/price/MRP/stock; zero source entries are sellable SKUs. The 5,000-item search test is correctness evidence, not production scale performance.

## Files, resources and effects

Changes: shared source catalogue/client/store/UI, customer/admin web and Compose catalogue/details, native repository/models/assets, 26 photo files and notices, schema/API extensions, scripts, browser/core tests, current reports/docs. The adjacent AI research project is untouched. GROZO is not a Git repository.

Toolchain/dependencies/build outputs measured 5,285,503,531 logical bytes under the approved 6,000,000,000-byte cap. Recorded JDK/Gradle acquisition metadata is 389,007,808 bytes; that metadata is not a complete historical network counter. Existing SDK/installers are reused; no new toolchain downloads this update. Reviewed photo candidates downloaded 2,721,877 bytes; published assets 1,095,256 bytes. No paid service, external AI, GPU run, emulator or publication.

Owner lists/screenshot references are read-only inputs, not authority for actions. No actual personal/customer/rider data used. Original ownership/license unchanged; public-domain/CC0 image source/artist/license/hash evidence and third-party notices included. No screenshot competitor assets, generated product packaging or new logo.

Next smallest step: merchant-confirmed variants/prices/stock and exact authorized photos, then physical-device QA. Backend and production gates remain pending.

## Dedicated image-library cycle, 2026-10-31

Owner scope: research/download/organize images, with no redesign. Completed 390 individual queries in 98 batches and preserved all source records/category mappings. Published 103 approved photo sets for 104 IDs; 286 entries remain itemized for manual follow-up. All 143 active downloaded candidates have a visual decision; 150 decisions include replaced historical candidates, with 46 rejections. No generated, illustrated, mismatched or unreviewed candidate is included as an approved product image.

808 automated checks passed, 0 failed, including PDF/source hashes, CSV completeness, each image hash/format/ratio/size, required creator/licence information, duplicate/perceptual checks and byte comparison of 115 existing app/shared/source/asset files. Prior Node/Android/browser evidence above belongs to the unchanged app build and was not rerun for this image-only task. The CSV renderer/imported values and saved CSV records were inspected. Two initial failures (HTTP licence links and absent creator metadata for Turnip/Fig) were resolved from canonical links/original file-page credits before the final passing run.

Files added: bounded research/metadata/download/review/publish/verify/package scripts, this cycle guide and report summary; external image library, four CSVs, rights/source records and ZIP. Source code and original LICENSE/branding are preserved; GROZO remains without Git initialization. Image licences apply individually and accompany originals/derivatives. No user secrets or actual customer/rider data were used.

Counted image responses 43,527,448 bytes, including 1 MB prior-failure reserve, under 100 MB. Library approximately 44.1 MB and review files approximately 51.9 MB at verification checkpoint; the existing toolchain was not changed. No paid service, GPU/emulator, API key, external AI or publication. Source rate/retry restrictions were respected; permitted standard thumbnails came from the official imageinfo API. No access/anti-bot bypass.

Limitations/next step: 286 unresolved image records, missing merchant pack identity/rights and individual quality/species/variant ambiguities. No new image has been integrated into apps, and no device/backend/provider test is implied. See [image library guide](product-image-library.md) and the external library README for the complete reports.

## Final testing update — 2026-11-01

Publication closeout 2026-11-02: complete source commit 1ba13458101273ead60b662c09286e2ff9794e3d published and fetched; all 498 Git source files matched local raw hashes, with no unexpected files. GitHub Pages Actions run 41374191718 passed build/deploy. Live https://shivam0296-coder.github.io/grozo/ home/search/detail/photo attribution were checked. Screenshots/APKs are ZIP artifacts, not Git content. See reports/final-build/publication.json. Static hosting does not implement commerce.

Actual Node HTTP tests, Android code-5 build/signature/manifest/catalogue/photo integrity and browser route/responsive observations are recorded in reports/final-build and FINAL-TEST-REPORT.md. Historical reports remain unchanged. No phone, PostgreSQL, authentication/provider flow or production readiness is inferred. The initial URL-configuration compile error was fixed with an explicit java.net.URI import; its failed attempt report is retained.

Closeout 2026-11-02: reran 70 Node tests, TypeScript, source syntax/structure and Android configuration checks successfully. Rechecked seven protected Stage 1 hashes and both APK hashes. IDE sync remains unverified; owner requested no further IDE testing. Build/new IDE caches measured 6,245,275,062 bytes against a 6 GB limit; downloads stopped, owner-approved cleanup was policy-blocked, no cache files deleted. See final-build/resource-summary.json and ide-sync-outcome.json. No new device/provider/production maturity claim. Publication evidence is separate in final-build/publication.json; all complete-package entries are verified by scripts/package-final.ps1.
