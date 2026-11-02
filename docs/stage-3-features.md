# Completed and pending features

Date: 2026-10-31. Stage 3 remains a partial development delivery.

| Area | Completed | Pending / boundary |
| --- | --- | --- |
| Existing project | Architecture, logo, integer-paise pricing, order/account/support/delivery flows retained; previous deliverables preserved | Shared live backend |
| PDF catalogue | All 13 pages of 4 PDFs reviewed; 100 household + 88 care + 102 vegetables + 100 fruits = 390 complete entries; stable IDs/page/raw-text provenance | Merchant confirmation of grouped alternatives and unusual source wording |
| Hierarchy | 4 roots, 48 subordinate nodes, 52 total, up to 3 levels; all entries mapped | Semantic owner confirmation where source wording is unclear |
| Brands/variants | 77 literal brand prefixes; slash alternatives retained; editable variant/pack fields | Actual merchant pack variants, fiscal fields and availability |
| Customer website | Search, category dropdown/tiles/shelves, nested navigation, photo frames, detail provenance, filters/sorting, grid/list, 24-item pages, responsive layouts | Complete exact-photo coverage and commercial content |
| Customer Android | Matching Compose source/demo catalogue, categories, filters/search, incremental lists, real local photos/details, preserved checkout/account | Device/emulator UI, accessibility, performance and installation QA |
| Photography | 13 visually checked public-domain/CC0 generic produce photos; 26 optimized WebP files; sources, rights and hashes | 377 exact images; remaining research is not exhaustive |
| Merchant details | Unknown fields labelled pending, Add/checkout blocked; admin can save draft metadata and validate confirmed fields | No pack, price, MRP or stock was supplied for any source entry |
| Demo shopping | Separate 18 synthetic products, quantities, FRESH20, checkout, local order confirmation/cancellation/status | No real sale, payment, delivery or shared orders |
| Admin | Products/brands/categories, deep taxonomy, pack/variant, price/MRP/stock/active state; CSV import preview/export, duplicate retention; image upload/replace/review | PDF uploads register metadata only; no automatic PDF extraction service; secure server media/RBAC |
| Delivery partner | Existing local offer/pickup/delivery workflow retained, shared catalogue/assets updated, new APK compiled | Actual routing/tracking/ETA, payouts and device UI QA |
| Database/API | Backward-compatible extension drafts; separate source concepts prevent zero-price variants entering strict commerce tables | PostgreSQL execution, migration runner, data import/promotion, endpoints and shared persistence |
| Tests/package | 65 Node + 21 Android core + 86 browser assertions passed; typecheck/web builds; signed debug APKs and complete source archive | Native interaction tests, release signing/Play, security/load/backup/production review |

There is no fake best-seller ranking, customer rating, sale discount, stock or ETA for the imported source catalogue. Popularity/offers in the separate demo derive only from labelled synthetic records. Recommendations beyond same-aisle/recent browsing remain pending real evidence.

[Full test evidence](validation.md) · [Import report](../reports/catalogue-update-import-report.json) · [Image manifest](../reports/catalogue-update-image-manifest.json).
