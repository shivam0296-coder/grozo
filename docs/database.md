# Database design and integrity

Target: PostgreSQL 18. Files in database/migrations and database/seeds are a Stage 1 design draft. No PostgreSQL server is installed, initialized or migrated. Stage 2 Android Room persistence is separate local development state and does not validate this PostgreSQL design. SQL has not been parsed/executed by PostgreSQL.

## Relationship map

users → addresses, sessions, roles, carts, orders, notifications, reviews, support.
stores → zones, inventory and orders.
categories/brands → products → variants/media.
cart → items; order → immutable item/address/price snapshots, history, reservations, payment attempts and assignment history.
coupon → eligibility categories and reservation/redemption records.
campaign → product collections and coupons.
inventory → reservation records and append-only stock movements.
payment → refunds; verified webhook identities deduplicate processing.
delivery_partner → offers/assignments → recorded locations and earnings.
outbox_jobs carry committed side effects; idempotency_keys preserve checkout retry results.

## Tables and indexing

The migration defines the requested entities plus operational session, variant, reservation, movement, offer, device and job tables. Primary keys are UUIDs except natural composite keys/settings/roles. Amounts are integer paise, times are timestamptz (UTC), and clients display Asia/Kolkata. Core numeric/foreign-key/unique checks are in SQL. Product search starts with a GIN index and simple text configuration; real Hindi/Hinglish search quality remains to be tested.

Inventory uses (store_id,variant_id), with reserved <= on_hand. Orders reference a zone belonging to the same store. Reservations reference that same order/store and stock row. Partial unique indexes limit active order assignment and successful payment records. Preserve old catalogue rows through deactivation; immutable order snapshots retain what was purchased.

## Required application invariants

SQL constraints alone do not establish business correctness. Stage 3 must enforce:

- Address ownership and zone geometry validity/serviceability; reject non-finite/out-of-range coordinates, oversized polygons and self-intersections. GeoJSON does not itself validate spatial containment.
- Order item totals/tax sum to order amounts, and settings/tax/quote versions are recorded.
- Stock reservation counter and reservation rows change atomically; movements/reservation release are idempotent.
- Coupon limits count held plus redeemed usage while holding the relevant lock; expiry/release semantics are defined.
- Payment amounts equal order totals; refunds in all pending/successful states cannot exceed captured funds. A unique successful payment index is a guard, not external double-charge prevention.
- Review/support order ownership, verified delivered-order eligibility, assignment ownership and rider approval.
- State transitions and optimistic versions; admin activity audit in the same transaction.
- Session rotation/reuse detection, OTP attempt/expiry bounds, location timestamp freshness and task-bounded access.
- Schema validation for every JSON field; encrypted sensitive storage where appropriate; logs/outbox payloads avoid unnecessary personal data.

## Migration workflow

Stage 3 adds an explicit migration runner with migration checksums, an advisory lock, a recorded version table and fail-fast configuration. Test migration on an empty local database, reference-seed idempotency, rollback of failed transactions and a backup/restore before touching existing records. Do not point manual commands at an unknown or production database. Never automatically execute destructive down-migrations.

Reference seed supplies four roles, twelve categories and the requested money rules. It creates no admin account, store coordinates, product inventory or sample business statistics. Delivery tax remains NULL until reviewed; future checkout must fail closed when fiscal settings are incomplete.

## Retention proposal

Minimize OTP/session/location and raw provider payload retention. Proposed precise-location retention is 24 hours after task end, subject to the owner's operational/legal review before real data use. Order/invoice/audit retention needs an appropriate business/legal decision; no duration is asserted as law here. Backups and deletion workflows must honor the final retention policy.

## Owner source concepts (2026-10-31)

The 390 PDF entries are local normalized concepts with no merchant price/pack/stock. Migration draft 0003_source_concepts.sql separates raw source entries and reviewed variant links from strict positive-price product_variants. Draft 0002 adds category/media/import metadata. Neither has been executed. No existing customer/order/inventory row is altered. JSON/CSV source data is included; it is not an initialized production database.
