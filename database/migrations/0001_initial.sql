-- GROZO Stage 1 DATABASE DESIGN DRAFT. Not executed against PostgreSQL yet.
-- Apply only to a new, owner-selected local database after Stage 3 validation.
-- UUIDs are supplied by the application. No extension or external service required.
BEGIN;

CREATE TABLE users (
 id uuid PRIMARY KEY, phone_e164 varchar(16) NOT NULL UNIQUE CHECK (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
 display_name varchar(120), email varchar(254), status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
 password_hash text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE roles (name text PRIMARY KEY CHECK (name IN ('customer','operator','rider','admin')));
CREATE TABLE user_roles (
 user_id uuid NOT NULL REFERENCES users(id), role_name text NOT NULL REFERENCES roles(name),
 PRIMARY KEY(user_id,role_name)
);
CREATE TABLE auth_sessions (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), token_hash text NOT NULL UNIQUE,
 family_id uuid NOT NULL, expires_at timestamptz NOT NULL, revoked_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), CHECK (expires_at > created_at)
);
CREATE INDEX auth_sessions_user_idx ON auth_sessions(user_id);
CREATE TABLE otp_challenges (
 id uuid PRIMARY KEY, phone_e164 varchar(16) NOT NULL, otp_hash text NOT NULL, purpose text NOT NULL,
 attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 10),
 expires_at timestamptz NOT NULL, consumed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (expires_at > created_at)
);
CREATE INDEX otp_phone_expiry_idx ON otp_challenges(phone_e164,expires_at);
CREATE TABLE stores (
 id uuid PRIMARY KEY, name varchar(160) NOT NULL, address_text text NOT NULL,
 latitude numeric(10,7) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
 longitude numeric(10,7) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
 active boolean NOT NULL DEFAULT false
);
CREATE TABLE service_zones (
 id uuid PRIMARY KEY, store_id uuid NOT NULL REFERENCES stores(id), name varchar(120) NOT NULL,
 tier char(1) NOT NULL CHECK (tier IN ('A','B','C')), boundary_geojson jsonb NOT NULL,
 active boolean NOT NULL DEFAULT false, version integer NOT NULL DEFAULT 1 CHECK (version > 0),
 min_estimate_minutes integer CHECK (min_estimate_minutes > 0),
 max_estimate_minutes integer CHECK (max_estimate_minutes >= min_estimate_minutes),
 CHECK (jsonb_typeof(boundary_geojson) = 'object'), UNIQUE(id,store_id)
);
CREATE TABLE addresses (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), label varchar(60) NOT NULL,
 house_details varchar(200) NOT NULL, street varchar(250) NOT NULL, landmark varchar(200),
 city varchar(100) NOT NULL, postal_code varchar(12) NOT NULL,
 latitude numeric(10,7) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
 longitude numeric(10,7) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX addresses_user_idx ON addresses(user_id);
CREATE TABLE categories (
 id uuid PRIMARY KEY, name varchar(100) NOT NULL, slug varchar(100) NOT NULL UNIQUE,
 parent_id uuid REFERENCES categories(id), active boolean NOT NULL DEFAULT true, CHECK (parent_id IS DISTINCT FROM id)
);
CREATE TABLE brands (id uuid PRIMARY KEY, name varchar(120) NOT NULL UNIQUE, active boolean NOT NULL DEFAULT true);
CREATE TABLE products (
 id uuid PRIMARY KEY, name varchar(200) NOT NULL, description text NOT NULL,
 category_id uuid NOT NULL REFERENCES categories(id), brand_id uuid REFERENCES brands(id),
 active boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON products(category_id,active);
CREATE INDEX products_name_search_idx ON products USING gin(to_tsvector('simple',name));
CREATE TABLE product_variants (
 id uuid PRIMARY KEY, product_id uuid NOT NULL REFERENCES products(id), sku varchar(80) NOT NULL UNIQUE,
 quantity_label varchar(80) NOT NULL, mrp_paise integer NOT NULL CHECK (mrp_paise > 0),
 selling_price_paise integer NOT NULL CHECK (selling_price_paise > 0 AND selling_price_paise <= mrp_paise),
 tax_rate_bps integer NOT NULL CHECK (tax_rate_bps BETWEEN 0 AND 10000),
 fiscal_classification varchar(40), active boolean NOT NULL DEFAULT false, version integer NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE INDEX variants_product_idx ON product_variants(product_id);
CREATE TABLE product_media (
 id uuid PRIMARY KEY, product_id uuid NOT NULL REFERENCES products(id), storage_key text NOT NULL UNIQUE,
 mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp')),
 alt_text varchar(250) NOT NULL, rights_record text NOT NULL, position integer NOT NULL DEFAULT 0 CHECK (position >= 0)
);
CREATE TABLE suppliers (
 id uuid PRIMARY KEY, name varchar(180) NOT NULL, contact_details jsonb NOT NULL DEFAULT '{}',
 active boolean NOT NULL DEFAULT true
);
CREATE TABLE inventory (
 store_id uuid NOT NULL REFERENCES stores(id), variant_id uuid NOT NULL REFERENCES product_variants(id),
 on_hand integer NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
 reserved integer NOT NULL DEFAULT 0 CHECK (reserved >= 0 AND reserved <= on_hand),
 low_stock_threshold integer NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
 version integer NOT NULL DEFAULT 1 CHECK (version > 0), PRIMARY KEY(store_id,variant_id)
);
CREATE TABLE carts (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), store_id uuid NOT NULL REFERENCES stores(id),
 updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,store_id)
);
CREATE TABLE cart_items (
 cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
 variant_id uuid NOT NULL REFERENCES product_variants(id), quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 99),
 PRIMARY KEY(cart_id,variant_id)
);
CREATE TABLE business_settings (
 singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
 minimum_order_paise integer NOT NULL CHECK (minimum_order_paise > 0),
 free_delivery_threshold_paise integer NOT NULL CHECK (free_delivery_threshold_paise >= minimum_order_paise),
 delivery_charge_paise integer NOT NULL CHECK (delivery_charge_paise >= 0),
 maximum_basket_paise integer NOT NULL CHECK (maximum_basket_paise >= free_delivery_threshold_paise),
 delivery_tax_rate_bps integer CHECK (delivery_tax_rate_bps BETWEEN 0 AND 10000),
 cod_enabled boolean NOT NULL DEFAULT false,
 version integer NOT NULL DEFAULT 1 CHECK (version > 0), updated_by uuid REFERENCES users(id),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE application_settings (
 key text PRIMARY KEY, value jsonb NOT NULL, schema_version integer NOT NULL CHECK (schema_version > 0),
 updated_by uuid REFERENCES users(id), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE coupons (
 id uuid PRIMARY KEY, code varchar(40) NOT NULL UNIQUE CHECK (code = upper(code)),
 kind text NOT NULL CHECK (kind IN ('fixed','percentage')), value integer NOT NULL CHECK (value > 0),
 maximum_discount_paise integer CHECK (maximum_discount_paise >= 0),
 minimum_subtotal_paise integer NOT NULL DEFAULT 0 CHECK (minimum_subtotal_paise >= 0),
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
 total_limit integer CHECK (total_limit > 0), per_user_limit integer NOT NULL DEFAULT 1 CHECK (per_user_limit > 0),
 active boolean NOT NULL DEFAULT false,
 CHECK (ends_at > starts_at), CHECK (kind <> 'percentage' OR value <= 10000)
);
CREATE TABLE coupon_categories (
 coupon_id uuid NOT NULL REFERENCES coupons(id), category_id uuid NOT NULL REFERENCES categories(id),
 PRIMARY KEY(coupon_id,category_id)
);
CREATE TABLE campaigns (
 id uuid PRIMARY KEY, name varchar(160) NOT NULL, occasion varchar(80), banner_storage_key text,
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, active boolean NOT NULL DEFAULT false,
 CHECK (ends_at > starts_at)
);
CREATE TABLE campaign_products (
 campaign_id uuid NOT NULL REFERENCES campaigns(id), product_id uuid NOT NULL REFERENCES products(id),
 PRIMARY KEY(campaign_id,product_id)
);
CREATE TABLE campaign_coupons (
 campaign_id uuid NOT NULL REFERENCES campaigns(id), coupon_id uuid NOT NULL REFERENCES coupons(id),
 PRIMARY KEY(campaign_id,coupon_id)
);
CREATE TABLE orders (
 id uuid PRIMARY KEY, order_number varchar(40) NOT NULL UNIQUE, user_id uuid NOT NULL REFERENCES users(id),
 store_id uuid NOT NULL REFERENCES stores(id), zone_id uuid NOT NULL,
 address_snapshot jsonb NOT NULL CHECK (jsonb_typeof(address_snapshot) = 'object'),
 status text NOT NULL DEFAULT 'placed' CHECK (status IN ('placed','confirmed','packed','out_for_delivery','delivered','cancelled')),
 payment_method text NOT NULL CHECK (payment_method IN ('cod','online')),
 currency char(3) NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
 subtotal_paise integer NOT NULL CHECK (subtotal_paise >= 0),
 product_discount_paise integer NOT NULL CHECK (product_discount_paise >= 0),
 coupon_discount_paise integer NOT NULL DEFAULT 0 CHECK (coupon_discount_paise BETWEEN 0 AND subtotal_paise),
 delivery_charge_paise integer NOT NULL CHECK (delivery_charge_paise >= 0),
 tax_included_paise integer NOT NULL CHECK (tax_included_paise >= 0),
 total_paise integer NOT NULL CHECK (total_paise >= 0),
 rules_version integer NOT NULL CHECK (rules_version > 0),
 version integer NOT NULL DEFAULT 1 CHECK (version > 0), cancellation_reason text,
 expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,store_id),
 FOREIGN KEY(zone_id,store_id) REFERENCES service_zones(id,store_id),
 CHECK (total_paise = subtotal_paise - coupon_discount_paise + delivery_charge_paise),
 CHECK (tax_included_paise <= total_paise)
);
CREATE INDEX orders_user_created_idx ON orders(user_id,created_at DESC);
CREATE INDEX orders_store_status_idx ON orders(store_id,status,created_at DESC);
CREATE TABLE order_items (
 id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders(id),
 variant_id uuid NOT NULL REFERENCES product_variants(id), product_name_snapshot varchar(200) NOT NULL,
 quantity_label_snapshot varchar(80) NOT NULL, quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 99),
 unit_mrp_paise integer NOT NULL CHECK (unit_mrp_paise > 0),
 unit_price_paise integer NOT NULL CHECK (unit_price_paise > 0 AND unit_price_paise <= unit_mrp_paise),
 tax_rate_bps integer NOT NULL CHECK (tax_rate_bps BETWEEN 0 AND 10000),
 coupon_discount_paise integer NOT NULL CHECK (coupon_discount_paise >= 0),
 tax_paise integer NOT NULL CHECK (tax_paise >= 0),
 payable_paise integer NOT NULL CHECK (payable_paise >= 0),
 UNIQUE(order_id,variant_id),
 CHECK (payable_paise = unit_price_paise * quantity - coupon_discount_paise),
 CHECK (tax_paise <= payable_paise)
);
CREATE TABLE order_status_history (
 id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders(id),
 from_status text, to_status text NOT NULL, actor_id uuid REFERENCES users(id),
 reason text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_history_order_idx ON order_status_history(order_id,created_at);
CREATE TABLE stock_reservations (
 id uuid PRIMARY KEY, order_id uuid NOT NULL, store_id uuid NOT NULL, variant_id uuid NOT NULL,
 quantity integer NOT NULL CHECK (quantity > 0),
 status text NOT NULL CHECK (status IN ('held','consumed','released')),
 expires_at timestamptz NOT NULL, UNIQUE(order_id,variant_id),
 FOREIGN KEY(order_id,store_id) REFERENCES orders(id,store_id),
 FOREIGN KEY(store_id,variant_id) REFERENCES inventory(store_id,variant_id)
);
CREATE INDEX reservations_expiry_idx ON stock_reservations(expires_at) WHERE status = 'held';
CREATE TABLE inventory_movements (
 id uuid PRIMARY KEY, store_id uuid NOT NULL, variant_id uuid NOT NULL,
 quantity_delta integer NOT NULL CHECK (quantity_delta <> 0), reason text NOT NULL,
 order_id uuid REFERENCES orders(id), supplier_id uuid REFERENCES suppliers(id),
 actor_id uuid REFERENCES users(id), dedupe_key text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(store_id,variant_id) REFERENCES inventory(store_id,variant_id)
);
CREATE TABLE coupon_redemptions (
 id uuid PRIMARY KEY, coupon_id uuid NOT NULL REFERENCES coupons(id),
 user_id uuid NOT NULL REFERENCES users(id), order_id uuid NOT NULL UNIQUE REFERENCES orders(id),
 status text NOT NULL CHECK (status IN ('reserved','redeemed','released')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX coupon_redemption_limit_idx ON coupon_redemptions(coupon_id,user_id,status);
CREATE TABLE payments (
 id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders(id),
 provider text NOT NULL CHECK (provider IN ('razorpay','cod')),
 provider_order_id text UNIQUE, provider_payment_id text UNIQUE,
 amount_paise integer NOT NULL CHECK (amount_paise >= 0),
 currency char(3) NOT NULL CHECK (currency = 'INR'),
 status text NOT NULL CHECK (status IN ('pending','verified','failed','collected')),
 verified_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (provider <> 'razorpay' OR amount_paise > 0)
);
CREATE INDEX payments_order_idx ON payments(order_id);
CREATE UNIQUE INDEX one_successful_payment_idx ON payments(order_id) WHERE status IN ('verified','collected');
CREATE TABLE refunds (
 id uuid PRIMARY KEY, payment_id uuid NOT NULL REFERENCES payments(id),
 amount_paise integer NOT NULL CHECK (amount_paise > 0), reason text NOT NULL,
 status text NOT NULL CHECK (status IN ('requested','processing','succeeded','failed')),
 provider_refund_id text UNIQUE, idempotency_key text NOT NULL UNIQUE,
 requested_by uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refunds_payment_idx ON refunds(payment_id);
CREATE TABLE webhook_events (
 provider text NOT NULL, event_id text NOT NULL, payload_sha256 char(64) NOT NULL,
 processing_status text NOT NULL CHECK (processing_status IN ('received','processed','failed')),
 received_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz,
 PRIMARY KEY(provider,event_id)
);
CREATE TABLE delivery_partners (
 user_id uuid PRIMARY KEY REFERENCES users(id), approval_status text NOT NULL DEFAULT 'pending'
 CHECK (approval_status IN ('pending','approved','suspended')), online boolean NOT NULL DEFAULT false,
 CHECK (NOT online OR approval_status = 'approved')
);
CREATE TABLE delivery_offers (
 id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders(id),
 rider_id uuid NOT NULL REFERENCES delivery_partners(user_id),
 status text NOT NULL CHECK (status IN ('offered','accepted','rejected','expired')),
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE delivery_assignments (
 id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders(id),
 rider_id uuid NOT NULL REFERENCES delivery_partners(user_id),
 status text NOT NULL CHECK (status IN ('assigned','picked_up','completed','cancelled')),
 assigned_at timestamptz NOT NULL DEFAULT now(), picked_up_at timestamptz, completed_at timestamptz
);
CREATE UNIQUE INDEX one_active_assignment_idx ON delivery_assignments(order_id)
 WHERE status IN ('assigned','picked_up');
CREATE INDEX assignments_rider_status_idx ON delivery_assignments(rider_id,status);
CREATE TABLE rider_locations (
 assignment_id uuid NOT NULL REFERENCES delivery_assignments(id), recorded_at timestamptz NOT NULL,
 latitude numeric(10,7) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
 longitude numeric(10,7) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
 accuracy_meters numeric(8,2) NOT NULL CHECK (accuracy_meters BETWEEN 0 AND 10000),
 received_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(assignment_id,recorded_at)
);
CREATE TABLE rider_earnings (
 id uuid PRIMARY KEY, assignment_id uuid NOT NULL UNIQUE REFERENCES delivery_assignments(id),
 amount_paise integer NOT NULL CHECK (amount_paise >= 0), rule_version integer NOT NULL CHECK (rule_version > 0),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE notification_preferences (
 user_id uuid PRIMARY KEY REFERENCES users(id), promotional_push boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE push_devices (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), token_ciphertext text NOT NULL,
 token_fingerprint text NOT NULL UNIQUE, platform text NOT NULL CHECK (platform IN ('android','web')),
 revoked_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE notifications (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), type text NOT NULL,
 content jsonb NOT NULL, status text NOT NULL CHECK (status IN ('pending','sent','failed')),
 dedupe_key text NOT NULL UNIQUE, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON notifications(user_id,created_at DESC);
CREATE TABLE reviews (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), order_id uuid NOT NULL,
 variant_id uuid NOT NULL, rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
 body varchar(2000), moderation_status text NOT NULL DEFAULT 'pending'
 CHECK (moderation_status IN ('pending','visible','hidden')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,order_id,variant_id),
 FOREIGN KEY(order_id,variant_id) REFERENCES order_items(order_id,variant_id)
);
CREATE TABLE support_tickets (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), order_id uuid REFERENCES orders(id),
 subject varchar(200) NOT NULL, status text NOT NULL CHECK (status IN ('open','in_progress','resolved','closed')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX support_user_idx ON support_tickets(user_id,created_at DESC);
CREATE TABLE support_messages (
 id uuid PRIMARY KEY, ticket_id uuid NOT NULL REFERENCES support_tickets(id),
 author_id uuid NOT NULL REFERENCES users(id), body varchar(5000) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE admin_logs (
 id uuid PRIMARY KEY, actor_id uuid NOT NULL REFERENCES users(id), action text NOT NULL,
 entity_type text NOT NULL, entity_id text NOT NULL, reason text,
 safe_changes jsonb NOT NULL, request_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_logs_actor_idx ON admin_logs(actor_id,created_at DESC);
CREATE TABLE idempotency_keys (
 user_id uuid NOT NULL REFERENCES users(id), key varchar(128) NOT NULL,
 request_sha256 char(64) NOT NULL, status text NOT NULL CHECK (status IN ('processing','completed')),
 order_id uuid REFERENCES orders(id), response_status integer CHECK (response_status BETWEEN 200 AND 599),
 response_body jsonb, expires_at timestamptz NOT NULL, PRIMARY KEY(user_id,key)
);
CREATE TABLE outbox_jobs (
 id uuid PRIMARY KEY, type text NOT NULL, payload jsonb NOT NULL, dedupe_key text NOT NULL UNIQUE,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','leased','done','cancelled','dead')),
 attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
 available_at timestamptz NOT NULL DEFAULT now(), lease_expires_at timestamptz,
 last_error_code text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX outbox_claim_idx ON outbox_jobs(status,available_at);
COMMIT;
