# Catalogue and image workflow

The four owner PDFs and 11 UI references supplied on 2026-10-31 are reviewed. This supersedes the earlier missing-input state. The screenshots guide spacing, category/photo grids, shelves, search and Add controls; their competitor assets/promotions were not copied. GROZO branding is retained.

## Source records

The source JSON is packages/catalogue/imported.json. Its 390 products are complete **concept entries**, not priced merchant SKUs: 100 household, 88 personal care/home protection, 102 vegetables and 100 fruits. Every entry has stable UUIDs, PDF file/page/ordinal/raw text, source section and review flags. All 52 taxonomy nodes and 77 identified brand labels are retained.

Two exact duplicate groups and 50 slash alternatives/aliases remain separate whole entries. Grouped entries such as Bournvita / Horlicks / Complan are searchable as written, not guessed as three pack variants. Raw bilingual text is retained; Hindi spacing from embedded fonts needs review against the original PDF page. Unusual source terms are flagged in the mapping review. No silent botanical/category correction was made.

No PDF supplies selling price, MRP, pack size, stock or fiscal classification. Internal numeric zero sentinels are guarded drafts, never free prices or actual zero inventory. Displays say Price pending, Pack size not supplied and Availability pending. Drafts cannot enter the basket. Structured source records belong in the separate source-concept SQL draft, not zero-price product_variants.

Customer defaults to From your PDFs; Demo shopping uses the preserved 18 synthetic Stage 2 products for checkout testing. Source/demo views remain distinct. Browser storage version 2, cart/orders/addresses and owner edits survive additive loading; stable IDs prevent repeated import. Native Room workspaces merge the same data without resets.

## Admin management

Catalogue studio → Products shows both source and retained development records. Edit names/brand mapping, root/subcategory, pack, variant, descriptions/specifications/storage, integer-paise price/MRP, stock and active state. Pending source metadata can be saved without guessing prices. Checking merchant details supplied requires a non-empty pack, positive selling price and MRP at least the price. Discount is derived. These confirmations are local, not verification of real inventory.

Categories supports nested parents with cycle detection and linked-product validation. Brands supports editing/deactivation. Source reports shows all four document counts, image pending count and downloads. The separate legacy Products/Inventory screens retain the demo workflow; use Catalogue studio for imported records.

CSV requires name, registered brand/category, pack, integer-paise selling price/MRP and non-negative stock. Optional ID columns categoryId/subcategoryId/brandId disambiguate repeated names and deep paths. CSV adds reviewed priced variants atomically; it is not a PDF concept importer. Existing records are edited separately. Unknown columns, bad relationships, IDs and prices block the batch. Duplicate-looking rows are reported and retained only after acknowledgement. Limits: 5 MB, 25,000 rows per reviewed batch. No 100/200 product cap.

CSV export escapes multiline/quoted fields and prefixes formula-like cells with an apostrophe. The audit CSV under reports leaves unknown merchant fields blank and includes provenance; it is intentionally distinct from the priced-variant import template. Product CSV does not include image blobs.

## Product photography

13 unique generic produce photos are bundled in assets/products as maximum 360 px thumbnails and 1000 px details, WebP, approximately 1.10 MB total. Wikimedia Commons source pages/license metadata and photographs were reviewed: public domain/CC0 only. Exact original URLs, source hashes, output hashes, artist, review notes and product mapping are in packages/catalogue/media.json and the image manifest.

These photos match generic source entries only. Mango is not reused for Alphonso; Apple is not reused for Royal Gala. Branded packs and 377 other entries remain Photo pending. One carrot candidate was rejected after visual review. Official Surf Excel/Colgate brand-family pages were checked, but an exact pack/redistribution basis was not supplied; no packshots were copied. Remaining photo research is not exhaustive.

Admin uploads/replaces JPEG/PNG/WebP up to 10 MB/40 MP, at least 100 px per side. It creates 360 px/1200 px WebP variants and bounds the pair to 2 MB, recording source/rights/review notes. IndexedDB stores blobs separately from localStorage metadata. New uploads stay pending_review. Owner-reviewed requires explicit attestation, evidence notes and timestamp; it does not become manufacturer verification. Failed/unreviewed assets return to the pending placeholder. QA screenshot uploads stay synthetic and unreviewed.

Local media export preserves metadata and WebP data URLs before browser storage clearing. No authenticated server media hosting, malware service, media restore UI or browser/native/admin sync exists. Native uses bundled reviewed assets through Coil; reference screenshots and downloaded original candidates are not packaged.

## Reproduce and inspect

Source PDFs stay in the owner's Downloads folder and are excluded from the source ZIP. Extraction needs Python with pdfplumber and Poppler pdftoppm on PATH. Run scripts/extract-catalogue-pdfs.py, visually review all rendered pages, then scripts/import-owner-catalogue.py. The normalized JSON and per-entry raw provenance are included, so normal app builds do not need Python, originals or network.

`node scripts/reconcile-owner-catalogue.mjs` generates the current reports from normalized data and hashes the 11 reference screenshots in their supplied local paths. Re-running reference verification needs those originals; their recorded hashes remain in the archive. Image research/publishing scripts document this batch, not an automatic general-purpose licence verifier.

Web/admin use bounded pages and lazy thumbnails; native uses lazy rows and 24-item increments. Search covers normalized names/brands/packs/category/description/raw source text. The existing 5,000-item correctness test is not production throughput evidence.

See [import](../reports/catalogue-update-import-report.json), [duplicates](../reports/catalogue-update-duplicates.json), [mapping](../reports/catalogue-update-mapping-review.json), [hierarchy](../reports/catalogue-update-hierarchy.json), [photos](../reports/catalogue-update-image-manifest.json), [photo notices](licenses/product-photography.txt).
