# ADR 0001 — Architecture and Stage 1 boundary

Date: 2026-10-30. Accepted for reversible local development under the owner's master brief.

## Context

The brief asks for staged implementation beginning with architecture, stack, folders and roadmap. GROZO lives in a separate sibling directory. The existing research project retains its own phase limits and files. Stage 1 delivers architecture and executable business rules. App directories, SQL and API designs do not constitute running services.

## Decisions

1. Use a modular NestJS monolith, PostgreSQL and a separate worker. Transactions remain in one database. Begin with one fulfilment store; carry store identity for expansion.
2. Use separate React/Vite/TypeScript/Tailwind customer and admin apps. SEO rendering can follow a concrete requirement.
3. Use two Android apps in a shared Gradle workspace. Room caches and local cart drafts never override authoritative server prices, inventory or orders.
4. Use reviewed SQL migrations and parameterized queries. The initial SQL draft requires real PostgreSQL validation before integration.
5. Represent money as integer paise. Product and delivery prices are tax-inclusive. Tax classifications and delivery tax must be verified business configuration; no tax advice is implied.
6. Minimum/free-delivery/maximum rules apply to selling subtotal before coupon and delivery: ₹199 / ₹399 / ₹5,000. Delivery is ₹19 below the threshold. Equality is allowed. These are explicit configurable assumptions; ₹5,000 is not a cap on final payable.
7. Customers may cancel while placed; staff may cancel before dispatch. Payment/refund state stays separate. Owner review of commercial cancellation policy is a release requirement.
8. Plan short-lived JWT access tokens, rotated hashed refresh sessions, OTP challenge controls and staff MFA. OTP provider selection and authentication implementation are pending.
9. Integrate Maps, Razorpay sandbox, FCM and OTP behind external trust boundaries. No paid calls, production keys or external account creation are part of Stage 1.
10. The AI-powered vision does not select a model. Start search with PostgreSQL text search and recommendations with genuine catalogue/sales rules. Model features remain deferred pending a bounded use case, evaluation, cost and privacy approval.
11. No third-party packages/media are acquired and no open-source license is granted in this delivery.

## Consequences

Microservices, Redis and distributed infrastructure are deferred until measurements justify them. Native iOS is outside scope; responsive web covers iPhones. Android needs its own compile/device evidence. Native Node execution of erasable TypeScript does not replace static type checking. Pin exact compatible toolchain/dependency versions at Stage 2 rather than guessing patch versions in a plan.
