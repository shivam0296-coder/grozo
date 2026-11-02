# Security and privacy plan

This is a design and release checklist, not a claim that platform security is implemented.

## Trust boundaries

Treat browser/app input, provider payloads, uploads, product descriptions and admin input as untrusted. Authenticate at the API; authorize every resource/action with ownership, store and role context. Derive user/rider IDs from the verified session, never from an untrusted body. Enforce assignments inside the transaction.

Threats include OTP abuse, session theft, cross-customer order/address access, admin privilege escalation, price tampering, coupon races, overselling, double payment/refund, forged location, malicious images, webhook replay and personal-data leakage.

## Controls required before launch

- Schema validation and bounded payloads; parameterized SQL and safe output rendering.
- Short-lived JWTs with issuer/audience/algorithm checks; key rotation; hashed rotated refresh tokens and reuse detection; admin MFA.
- Slow password hashing through a reviewed implementation if password login is introduced. Never store plaintext passwords or OTPs.
- Rate limits by route/principal/phone/IP, explicit CORS allowlists, secure cookies, CSRF protection, TLS and security headers.
- Server-owned prices, fiscal settings and availability; idempotency, row locks, version checks and a transactional audit.
- Signed raw-body webhooks, provider reconciliation and refund bounds; no card/UPI credentials stored.
- Upload type/size/dimension verification and safe re-encoding; private storage, scoped URLs and rights records.
- Active-task location access only; freshness checks, access audit and deletion under an approved retention policy.
- Restricted secrets per environment; no credentials in frontend bundles/logs/ZIPs; least-privilege database/service roles.
- Redacted structured logs, restricted report exports, monitoring, encrypted transport/storage, backup and restore exercises.

## Data inventory

Phone/name/email, delivery addresses/landmarks, order history, support content, push tokens and rider location are personal or operationally sensitive. Collect only needed fields with clear notices, access controls, purpose and retention. No real customer/rider data was used in Stage 1. The owner's brief is not copied into product fixtures or public pages.

Notifications avoid unnecessary private content; marketing needs appropriate preferences. Proposed deletion/retention controls need operational/legal review before deployment. Do not publish placeholder legal policies as final legal advice.

## Mandatory negative tests

Cross-user reads/updates, rider assignment substitution, staff store-scope bypass, token misuse, expired/replayed OTP, CSRF, SQL/script injection, multipart/image abuse, invalid signatures, amount/currency mismatch, concurrent coupon/stock/refund races, stale/forged location and secrets in logs/build artifacts.

Stage 1 verifies only the pure commerce rules and structural contract intent. It does not establish authentication, network security, database isolation, legal compliance or production readiness.
