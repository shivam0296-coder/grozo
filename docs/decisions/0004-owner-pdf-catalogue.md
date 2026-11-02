# ADR 0004 — Owner PDF catalogue and reference reconciliation

Date: 2026-10-31. Continues Stage 3; no rebuild from scratch.

All 13 pages of four supplied PDFs were extracted and visually checked. They contain 390 source entries (household 100, personal/home protection 88, vegetables 102, fruits 100), with heading hierarchy. They are product/concept lists rather than merchant SKU feeds: pack sizes, sales prices and stock are absent. Several entries combine alternatives or aliases; preserve each complete source entry and report them rather than inventing independently priced SKUs.

Import all 390 entries with stable UUIDs and document SHA-256/page/ordinal/heading provenance. Preserve grouped alternatives, unclear names, duplicate-looking records and source classification, even where a heading appears questionable. Missing commerce fields remain explicitly pending; zero internal price/stock fields are unavailable sentinels, never displayed as free products or trusted by checkout. Source entries are browseable; the original demo catalogue and checkout remain separate and available.

The source hierarchy reaches three levels. Generalize local category validation to preserve this hierarchy with cycle checks. Do not rewrite the original SQL/API contract; extend metadata additively. Keep browser/native state and orders when adding the new source version.

The screenshots guide compact category tiles, consistent photography frames, product shelf rails, sorting and prominent Add controls. Keep GROZO's logo/green palette; do not crop competitor promotional/product assets into the app, copy ratings/discounts, or repeat their delivery promises.

Use only images whose source/license and visible item can be checked. Generic produce photography may represent the matching generic entry only; do not reuse it for named cultivars, brands or packs. Branded pack photos remain pending when exact variant/pack and redistribution rights are unknown. Retain a per-record missing-image reason and source review evidence.
