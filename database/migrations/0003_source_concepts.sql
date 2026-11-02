-- Additive design draft only. NOT EXECUTED, no PostgreSQL service exists.
-- The owner PDFs list concepts/alternatives, not sellable merchant variants.
-- Do not insert zero-price drafts into product_variants or inventory.
BEGIN;
CREATE TABLE catalogue_source_entries (
 id uuid PRIMARY KEY,
 import_id uuid NOT NULL REFERENCES catalogue_imports(id),
 source_page integer NOT NULL CHECK (source_page > 0),
 source_ordinal integer NOT NULL CHECK (source_ordinal > 0),
 raw_text text NOT NULL,
 name text NOT NULL,
 category_id uuid NOT NULL REFERENCES categories(id),
 brand_id uuid REFERENCES brands(id),
 grouped_alternative boolean NOT NULL DEFAULT false,
 review_status text NOT NULL DEFAULT 'merchant_details_pending'
  CHECK (review_status IN ('merchant_details_pending','reviewed','rejected')),
 review_notes text,
 UNIQUE(import_id,source_ordinal)
);
CREATE INDEX source_entries_category_idx ON catalogue_source_entries(category_id,id);
CREATE INDEX source_entries_brand_idx ON catalogue_source_entries(brand_id,id);
CREATE INDEX source_entries_search_idx ON catalogue_source_entries
 USING gin(to_tsvector('simple',name || ' ' || raw_text));
CREATE TABLE catalogue_source_variant_links (
 source_entry_id uuid NOT NULL REFERENCES catalogue_source_entries(id),
 variant_id uuid NOT NULL REFERENCES product_variants(id),
 reviewed_by uuid NOT NULL REFERENCES users(id),
 reviewed_at timestamptz NOT NULL DEFAULT now(),
 review_note text NOT NULL CHECK (length(trim(review_note)) > 0),
 PRIMARY KEY(source_entry_id,variant_id)
);
-- Server promotion must validate taxonomy, exact pack, fiscal fields, prices,
-- stock evidence, image rights, identity and permissions transactionally.
-- A source entry may eventually map to several reviewed pack variants.
-- No source row is collapsed by name and no existing record is changed.
COMMIT;
