# API contract and endpoint inventory

Target base: /api/v1 over HTTPS in deployment. Stage 1 ships no HTTP server.

packages/contracts/openapi.json defines 30 core operations and 34 schemas. Every operation is explicitly NOT_IMPLEMENTED. It is a contract baseline, not a generated client or evidence that endpoints respond. Additional module operations below require detailed schemas and implementation in Stage 3.

## Shared behavior

Use UUID resource IDs, UTC ISO-8601 timestamps, integer paise, INR currency and cursor pagination (default 20, maximum 100). JSON request bodies reject undeclared fields. Enforce content type, byte/depth/array bounds, valid finite coordinates, text lengths and server-side schema validation. Clients must safely render strings, not interpolate HTML.

Errors contain code, message and requestId. Use 400 for malformed input, 401 unauthenticated, 403 forbidden, 404 missing/inaccessible resources under a consistent enumeration policy, 409 conflict/version/idempotency mismatch, 422 business rejection, 429 throttling and 503 unavailable integration. Never return provider secrets or stack traces.

JWT access tokens are for native clients. The browser same-origin proxy converts session tokens to secure HttpOnly cookies; tokens must not be exposed in browser JSON or localStorage. Revoked sessions, token family reuse and staff MFA are implementation gates. OpenAPI role metadata does not enforce authentication or authorization.

Customer queries are scoped to the authenticated user. Rider operations require approved account and matching active assignment. Operator actions are store-scoped. Administrator permissions are explicit and audited; customer contact/addresses and finance reports are restricted. No client-supplied role is trusted.

## Core operations in OpenAPI

- Authentication: request/verify OTP, refresh, logout, profile.
- Catalogue: list categories, paginated search/products, product detail.
- Addresses: owned list/create/update/delete.
- Cart: get/replace items by store.
- Checkout: authoritative quote and idempotent order creation.
- Orders: owned history/detail/cancellation/tracking.
- Payments: idempotent provider session, server verification, signed raw-byte webhook.
- Admin: order transitions, versioned business settings, idempotent stock adjustment/refund.
- Rider: location update tied to an active assignment.
- Operations: process/dependency health.

Order creation accepts a quote ID and payment method, never a price. A quote must be persisted with owner/store/address/line/settings versions, expire promptly and be revalidated during checkout. Stage 3 must add quote persistence through a reviewed migration or a reviewed signed-quote design; the initial schema intentionally does not pretend this is implemented.

## Additional module route design

| Area | Planned routes | Access |
| --- | --- | --- |
| User/profile | PATCH /me; DELETE /me; GET /me/export | Owner; deletion/export policy reviewed before use |
| Search | GET /search/suggestions; GET/DELETE /me/search-history | Public suggestions; owned history |
| Serviceability | POST /serviceability/check; GET /stores | Public, rate-limited |
| Product CRUD | POST/PATCH/DELETE /admin/products; variants/media under product | Catalogue permission; deletion becomes deactivation when referenced |
| Categories/brands | GET/POST/PATCH/DELETE /admin/categories and /admin/brands | Catalogue permission |
| Inventory/suppliers | GET /admin/inventory and /admin/inventory/movements; CRUD /admin/suppliers | Scoped operator/admin |
| Customers | GET /admin/customers and /admin/customers/:id; PATCH account status | Restricted support/admin |
| Orders | GET /admin/orders and /admin/orders/:id | Scoped operator/admin |
| Assignment | POST /admin/orders/:id/assignments; GET /admin/active-deliveries | Dispatcher permission |
| Riders | POST /rider/applications; GET/PATCH /rider/profile; PUT /rider/availability | Verified user/approved rider |
| Delivery offers | GET /rider/offers; POST /rider/offers/:id/accept or /reject | Offered rider; atomic accept |
| Delivery workflow | GET /rider/assignments; POST /rider/assignments/:id/pickup or /complete | Assigned rider; proof/collection rules |
| Earnings/history | GET /rider/earnings and /rider/history | Owned, database-derived |
| Rider admin | GET/PATCH /admin/riders/:id; GET /admin/riders | Restricted operator/admin |
| Zones | GET/POST/PATCH /admin/service-zones; POST /admin/service-zones/:id/disable | Explicit zone permission |
| Coupons | GET /me/coupons; CRUD /admin/coupons; POST coupon/validate | Eligibility scoped to user; admin writes |
| Campaigns | GET /campaigns; CRUD /admin/campaigns; product/coupon membership | Active public campaigns; marketing writes |
| Notifications | GET /me/notifications; PATCH read state; PUT preferences; register/revoke push device | Owner |
| Push marketing | POST /admin/campaigns/:id/notifications | Opted-in users; audited and throttled |
| Reviews | GET /products/:id/reviews; POST /orders/:id/reviews; moderation endpoint | Verified delivered-order owner; moderator |
| Support | GET/POST /me/support-tickets; GET/POST messages; staff ticket updates | Owner or support permission |
| Financial reports | GET /admin/reports/summary, /sales, /payments, /refunds, /earnings | Finance permission; actual database rows |
| Refund status | GET /me/orders/:id/refunds; GET /admin/refunds | Owner or finance |
| Audit/settings | GET /admin/audit-logs; versioned application settings | Restricted administrator |

## Retry and event semantics

Idempotency-Key (16–128 characters) is mandatory on order creation, payment-session creation, stock adjustment and refunds; cancellation is likewise retry-safe. Persist body fingerprint and outcome by authenticated principal. Requests with conflicting bodies return 409. Concurrent duplicates have a bounded wait or explicit in-progress result, never a second order.

Status updates carry expectedVersion. A version mismatch returns 409. Provider webhooks use signature and event identity, not customer JWT. Verify raw bytes before parsing and compare provider amount/currency/reference to local records. Acknowledgement only follows durable receipt/processing under an explicit retry policy.

Polling returns actual status and location freshness. No fake map route/ETA. An unavailable Maps/payment/OTP provider returns an explicit unavailable result; there is no success fallback.

## Remaining design gates

Full schema validation with a maintained OpenAPI validator, generated clients and static TypeScript checking are pending dependency adoption. Stage 1 tests check local references, request closure, role metadata and anti-tampering contract shape only. Route presence is not an end-to-end test.
