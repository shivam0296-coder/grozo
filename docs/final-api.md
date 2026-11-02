# Shared read-only API

The original target commerce contract remains packages/contracts/openapi.json. The implemented **testing adapter** is services/api/server.mjs (Node 24, built-in HTTP; no dependencies, auth or database).

| Method/path | Actual response |
| --- | --- |
| GET /health | Catalogue health; database NOT_CONFIGURED; ordering false |
| GET /api/v1/capabilities | Explicit catalogue/auth/cart/order/tracking/database boolean flags |
| GET /api/v1/catalogue | Versioned source catalogue: 390 concepts, 52 category nodes, reviewed publishedImage metadata and provenance |
| GET /api/v1/categories | Source nodes, including id/name/slug/parentId |
| GET /api/v1/products | items/nextCursor/total; pending pricing, orderingEnabled false, empty variants |
| GET /api/v1/media/:filename | Only reviewed allowlisted WebP files; correct media type, hash ETag and conditional 304 |
| Auth/cart/address/checkout/order/rider/admin/payment/notification endpoints | HTTP 503 NOT_IMPLEMENTED, no synthetic success |

Products support q (max 120 characters), categoryId, cursor (nonnegative integer offset), limit (1..100, default 24). Category filtering matches the source root or exact subcategory ID; /catalogue exposes the hierarchy for descendant filtering. The original client carries storeId, but this adapter has no store inventory. Empty variants mean no merchant-confirmed pack/price/stock is available.

Catalogue products preserve source names, UUIDs, raw rows and source metadata. Matching publishedImage entries retain filenames, sourcePage, artist, licence/licence URL, review note, modifications and hashes. Browser assets bundle the same reviewed files. Future clients can resolve /media URLs against the HTTPS API host. Native builds currently use bundled source data and an explicit configured catalogue connectivity check; full server-owned commerce workspace mapping is pending.

Default bind: http://127.0.0.1:4000. Remote deployment requires valid HTTPS. API_HOST, API_PORT and exact CORS origins are validated; unapproved origins receive 403. Query bounds/timeouts/connection counts are enforced. Unknown paths return 404; unsupported methods return 405. Errors are JSON **{code,message}**. No real body/account/order is persisted.

The target NestJS/PostgreSQL monolith remains the architecture. This bounded read-only testing adapter does not replace transactional commerce. Actual identity, owned addresses/carts/orders, authoritative integer-paise pricing, idempotency, inventory reservations, rider assignment and tested migrations are pending. Tests asserting 503 verify unavailable handling, not real authentication/order quality.