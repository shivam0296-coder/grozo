# Completed and pending features

## Available for testing

- Existing customer and partner Android source, wrapper, pinned configuration, icons, internet permission and fresh signed debug APKs (0.4.0-development, code 5, Android 8+).
- 390 original source concepts, 52 hierarchy nodes, correct provenance and 104 approved photo mappings using 103 unique photographs. The two original Lemon rows intentionally share a matching image.
- Public pre-launch customer catalogue: home/categories/search/filter/pagination/details, reviewed photo credits, business contact links, policy drafts and explicit unavailable account/cart/order/profile/tracking routes.
- Existing labelled browser/native local demo checkout and delivery workflow, and admin management interfaces, retained for testing. They do not synchronize across apps/origins.
- Shared executable read-only catalogue API, input/CORS/error tests, optional browser data fetching and native HTTPS connection check.
- GitHub Pages workflow, installation/deployment/API/iOS guides and complete source/APK packaging.

## Required before real orders

| Area | Missing implementation or owner input |
| --- | --- |
| Merchant catalogue | Actual pack/variant, price/MRP/tax, stock and store details for 390 source concepts; split grouped aliases/alternatives only after merchant review |
| Images | 286 exact approved images, particularly branded packs; verify item/variant/pack/licence before publication |
| Persistent backend | Target NestJS/PostgreSQL modules, real migrations, database tests, backups and restore |
| Authentication | Verified provider/identity flow, sessions/refresh/revocation, browser CSRF and secure cookies, staff MFA, role/ownership tests |
| Commerce | Persisted carts, server quotes, inventory reservations, idempotent orders/cancellation/refunds/history and cross-app synchronization |
| Delivery | Genuine assignment, acceptance, pickup/completion, serviceability, active-task tracking freshness and verified payout rules |
| Maps | Restricted environment/platform keys, provider/billing approval when needed, permission/routing tests; no fabricated ETA |
| Payments | Owner sandbox credentials, amount/order/webhook replay/reconciliation/refund tests; COD policy |
| Notifications | Project/provider credentials, consent and actual device delivery tests |
| Release signing | Owner-controlled keystore/secure backup and completed release/backend validation; no release APK is delivered |
| Device/browser QA | Physical Android installation/launch/navigation/lifecycle/accessibility and actual iPhone Safari/tablet tests |
| Business readiness | Final policies, coverage/service hours, support ownership, security/accessibility/load/monitoring/rollback evidence |
| Hosting | Confirm successful Pages deployment separately from a pushed workflow; host a real commerce backend separately after implementation |

The APKs are actual installable-format development builds. They are not complete production commerce applications. No API key can fill missing merchant data or implement the backend. Next smallest action: install/test the APKs on a physical phone, provide merchant-reviewed SKUs, then complete persistent authenticated commerce.