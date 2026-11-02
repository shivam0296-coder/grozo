# Deployment and operations blueprint

No infrastructure is provisioned or deployed. Exact host, region, domains, recurring budget and service accounts remain undecided. This guide records the required sequence; deployment configuration is delivered with the implemented services.

1. Inventory release versions, licenses, migrations, environment schemas, secrets and build artifacts. Produce reproducible web builds and signed Android outputs using private signing material outside source/ZIP.
2. Select approved regional hosting, PostgreSQL, media storage, TLS termination and worker execution. Review personal-data flows, backup destinations, costs and egress.
3. Provision least-privilege application, worker, migration and reporting identities. Keep frontend-visible configuration separate from private keys.
4. Restore a staging database, run migrations, verify readiness and integration sandbox paths. Seed real catalogue/store data only with rights and owner approval.
5. Run functional/permission/security/accessibility/device checks; measure peak ordering and queue delay. Capacity targets require measured evidence.
6. Configure alarms for errors, checkout/payment failures, webhook backlog, stock mismatch, stale location, outbox retries, database/storage health and cost anomalies.
7. Exercise backup restoration and rollback. Apply backwards-compatible migrations before app rollout. A database rollback may need restore/forward repair, not an automatic DROP script.
8. Approve the named production environment, commercial/legal policies, support procedures, recurring cost and launch. Then deploy gradually and observe.

## Background job limits

Jobs have dedupe keys, bounded payloads, leases, attempt ceilings, cancellation and dead-letter handling. Separate transient from permanent errors. Avoid logging personal payloads. Verify cancellation before/after provider calls where safe; external side effects may need reconciliation rather than reversal.

## Android release APK/AAB workflow, pending release validation

Stage 2 debug APKs already compile; see stage-2-build.md. For later release work, open the apps/android Gradle workspace, synchronize exact dependencies, build debug APKs for both customer/rider apps, run device tests, then configure private release keystores and generate signed APK/AAB through Android Studio or verified Gradle tasks. Record checksum, app ID, version, signing certificate and Maps restrictions. Do not commit keystores/passwords or claim a build before a successful build log.

## Measurements still needed

Peak concurrent checkouts, catalogue size, p95 latency, provider failure handling, location ingestion rate, storage growth, worker throughput, restore time and recovery objectives. Daily customer/order targets and the ₹450 AOV are planning assumptions, not observed results or profit forecasts.
