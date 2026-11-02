-- Stage 3 additive draft. NOT EXECUTED: PostgreSQL backend is not implemented.
-- Apply after 0001 with backup/transaction review in the future backend environment.
BEGIN;
ALTER TABLE products ADD COLUMN ingredients text, ADD COLUMN storage_info text,
 ADD COLUMN source_record jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE product_variants ADD COLUMN variant_attributes jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE product_media ADD COLUMN variant_id uuid REFERENCES product_variants(id),
 ADD COLUMN source_url text,
 ADD COLUMN review_status text NOT NULL DEFAULT 'pending_review' CHECK (review_status IN ('pending_review','owner_reviewed','rejected')),
 ADD COLUMN reviewed_by uuid REFERENCES users(id), ADD COLUMN reviewed_at timestamptz,
 ADD COLUMN review_note text, ADD COLUMN thumbnail_key text,
 ADD COLUMN width_px integer CHECK (width_px > 0), ADD COLUMN height_px integer CHECK (height_px > 0),
 ADD CONSTRAINT product_media_review_evidence CHECK (review_status <> 'owner_reviewed' OR
  (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL AND length(trim(rights_record)) > 0 AND length(trim(review_note)) > 0));
CREATE INDEX categories_parent_active_idx ON categories(parent_id,active);
CREATE INDEX products_brand_active_idx ON products(brand_id,active);
CREATE INDEX variants_price_active_idx ON product_variants(selling_price_paise,id) WHERE active;
CREATE INDEX variants_attributes_idx ON product_variants USING gin(variant_attributes);
CREATE INDEX media_variant_review_idx ON product_media(variant_id,review_status);
CREATE TABLE catalogue_imports (
 id uuid PRIMARY KEY, source_name text NOT NULL, source_sha256 char(64) NOT NULL,
 source_kind text NOT NULL CHECK (source_kind IN ('product_pdf','classification_pdf','csv')),
 status text NOT NULL CHECK (status IN ('registered','extracted','review_required','validated','applied','failed')),
 source_count integer CHECK (source_count >= 0), imported_count integer CHECK (imported_count >= 0),
 report jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(), applied_at timestamptz,
 idempotency_key text NOT NULL UNIQUE
);
CREATE INDEX catalogue_imports_source_idx ON catalogue_imports(source_sha256,source_kind);
-- Server transactions must validate variant/product ownership, taxonomy cycles,
-- stock/currency/fiscal rules, image rights and complete count reconciliation.
-- No UPDATE, DELETE, customer/order rewrites, or fixture INSERTs.
COMMIT;
