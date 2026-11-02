# Numbered development roadmap

The owner authorized staged local development. Paid services, publication, real personal data and large downloads require bounded approval.

| Stage | Scope | Exit evidence | State |
| --- | --- | --- | --- |
| 1 — Planning and foundation | Architecture, stack, folders, DB design, contracts, branding, credential plan, executable commerce rules | Repeatable offline checks and documented limitations | Delivered, subject to validation record |
| 2 — UI/UX and workspaces | Pin dependencies/locks; React customer/admin; Android customer/rider Gradle/Compose projects | Web build, responsive/keyboard QA, Android compile/screen checks where SDK available | Development UI and APK delivery complete; native device UI checks pending |
| 3R — Owner-requested redesign/catalogue | Customer web/Compose redesign; admin catalogue/media tools; complete PDF/photo import when supplied | Dated builds/tests, complete source reconciliation, exact authorized assets | Partial development delivery; all PDF entries imported, merchant details/377 photos and device QA pending |
| 3A — Persistence and identity | NestJS, PostgreSQL migrations, OTP/session/role controls, catalogue, addresses/zones | Empty-DB migration, ownership/revocation tests, genuine OTP sandbox delivery | Pending |
| 3B — Commerce | Cart, settings admin, coupons, stock/reservations, transactional checkout/orders/cancellation | Last-unit/coupon races, request retries, price tampering, reservation release and transitions | Pending |
| 3C — Operations | Admin modules, suppliers, movements, rider assignment, reports, support/reviews, worker | DB-backed aggregates, permission matrix, retry/crash/cancellation and audit tests | Pending |
| 4A — Maps/delivery | Address search/pin, configurable zones, active-task location, genuine routes/ETA | Provider evidence, permission/revocation/stale checks and cross-user denial | Pending credentials/billing approval |
| 4B — Payments/notifications | Razorpay sandbox, verified webhooks/refunds, COD configuration, FCM/SMS | Replay/tampering/out-of-order/late-payment/refund tests; real device notifications | Pending credentials |
| 5 — QA/hardening | Complete customer/rider/admin journeys, devices, accessibility, security, load, restore/rollback | Dated evidence; critical defects closed; commercial policies reviewed | Pending |
| 6 — Final package/launch decision | Complete source, Android Studio import, APK/AAB instructions, deployment guides, ZIP | Clean-machine reproduction and named-environment release approval | Pending |

## Immediate next step

Stage 3 priority follows the owner’s redesign/catalogue brief. See stage-3-plan.md and stage-3-features.md. Next: obtain merchant-confirmed packs/prices/stock and remaining exact approved photographs; perform physical-device UI QA. All four PDFs and 11 references are reviewed. Earlier backend milestones remain deferred and NOT_IMPLEMENTED. Native device UI validation remains pending.

Festival campaigns retain editable dates. Wallet remains optional and would require a proper ledger and business decision. No Maps, payment, push, paid account or public deployment has been enabled.

## Production gate

Name the environment. Require verified integrations and user journeys, security/privacy checks, measured peak capacity, monitoring, backup restoration, rollback, support ownership, approved commercial policies and a recurring budget. Stage 1 does not satisfy these gates.

## Final testing update — 2026-11-01

Closeout 2026-11-02: complete source is published to shivam0296-coder/grozo with original history preserved. The static pre-launch customer catalogue is deployed at https://shivam0296-coder.github.io/grozo/ after successful Actions build/deploy and live browser checks. Stage 6 debug/source delivery is available; IDE sync and phone QA remain unverified by owner direction. Persistent commerce, admin/backend hosting and production launch remain pending. See FINAL-TEST-REPORT.md.

The owner advanced debug APK delivery, read-only catalogue/API testing and GitHub/static publication preparation under ADR 0005. Stages 3A–5 remain incomplete. Photo gap is now 286; target persistent/authenticated commerce remains pending. Use FINAL-TEST-REPORT.md and PENDING-INTEGRATIONS.md for current evidence.
