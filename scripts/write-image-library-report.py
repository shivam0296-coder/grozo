import json,pathlib,collections,re,hashlib,datetime
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT.parent/"GROZO_PRODUCT_IMAGE_LIBRARY";TMP=ROOT/"artifacts/image-library-review"
summary=json.loads((OUT/"Reports/verification-summary.json").read_text(encoding="utf-8"))
manifest=json.loads((OUT/"Reports/product-image-manifest.json").read_text(encoding="utf-8"))
data=json.loads((ROOT/"packages/catalogue/imported.json").read_text(encoding="utf-8"))
downloads=json.loads((TMP/"downloads.json").read_text(encoding="utf-8"))
decisions=json.loads((TMP/"review-decisions.json").read_text(encoding="utf-8"))
usage=json.loads((TMP/"download-usage.json").read_text(encoding="utf-8"))
(OUT/"Reports/download-usage.json").write_text(json.dumps(usage,ensure_ascii=False,indent=2),encoding="utf-8")
mapping=manifest["productMappings"]
for path in (OUT/"Reports/Selected_Source_Metadata").glob("*.json"):
 m=json.loads(path.read_text(encoding="utf-8"));m.setdefault("intakeStatus",m.get("status"));m["status"]="INCLUDED_AFTER_REVIEW" if m["productId"] in mapping else "NOT_INCLUDED"
 m["description"]=m.get("description","").split(".mw-parser-output")[0][:600]
 path.write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding="utf-8")
catalogue={c["id"]:c for c in data["categories"]}
folders=[]
for c in data["categories"]:
 parts=[];ident=c["id"]
 while ident:
  n=catalogue[ident];parts.insert(0,n["name"]);ident=n.get("parentId")
 safe=lambda s:re.sub(r'[<>:"/\\|?*\x00-\x1f]',"_",s).strip(" ._")[:48].rstrip(" ._") or "Unspecified"
 folders.append({"categoryId":c["id"],"sourceName":c["name"],"fullTaxonomyPath":" / ".join(parts),"folderPath":"/".join(safe(s) for s in parts)})
(OUT/"Reports/folder-index.json").write_text(json.dumps(folders,ensure_ascii=False,indent=2),encoding="utf-8")
assert len({f["folderPath"] for f in folders})==52 and all((OUT/f["folderPath"]).is_dir() for f in folders)
validation=json.loads((OUT/"Reports/automated-validation.json").read_text(encoding="utf-8"))
text=f"""# GROZO Product Image Library

Research date: 2026-10-31. All 390 catalogue entries have been accounted for and searched individually. Image acquisition is partial, with every exception listed.

## Results

| Measure | Total |
| --- | ---: |
| Catalogue entries / mapping rows | 390 |
| Individual entry searches | 390 |
| Search batches | 98 |
| Actual taxonomy folders | 52 |
| Unique approved photographs | {summary["uniqueAcceptedPhotographs"]} |
| Catalogue entries with an approved photo | {summary["entriesWithAcceptedImages"]} |
| Entries without a secured suitable photo | {summary["entriesWithoutAcceptedImages"]} |
| Manual follow-up entries | {summary["manualFollowUpEntries"]} |
| Unverified photos included | 0 |

The manual queue overlaps the missing report; these totals are not additive. The two source entries named Lemon share one canonical photograph and both product IDs remain in the mapping. No image is shared between differently named entries.

There are 309 media files: 103 untouched downloaded files, 103 optimized WebP details and 103 WebP thumbnails. These are three file roles for 103 photographs, not 309 distinct product images.

## Files to use

- GROZO_PRODUCT_IMAGE_MAPPING.csv: all 390 IDs, names, brands, categories/subcategories, supplied pack fields, image paths, source URLs, verification/download/reuse states and notes.
- GROZO_MISSING_PRODUCT_IMAGES.csv: all 286 unresolved entries, specific reasons, queries and source-page suggestions.
- GROZO_MANUAL_VERIFICATION_AND_LICENSING.csv: the same unresolved population with required next actions.
- GROZO_MASTER_PRODUCT_LIST.csv: all source entries, exact names, empty unsupplied pack/weight/quantity fields, variants, raw source text and PDF/page provenance.
- LICENSE_AND_ATTRIBUTION.md: author, source and image licence records that must travel with the photos.
- Reports/product-image-manifest.json: canonical asset paths, original/retrieved source URLs, dimensions, hashes, licence and review evidence.
- Reports/verification-summary.json, automated-validation.json and duplicate-image-report.json: counts and verification results.
- Reports/Search_Batches: query/source evidence for every catalogue ID.
- Reports/folder-index.json: all 52 original category names and their filesystem paths.

The four top-level product folders follow the actual PDFs: Household Grocery, Personal Care & Home Protection, Vegetables and Fruits. Subfolders retain the source hierarchy. Long or filesystem-invalid heading characters are normalized in directory names; the full source names remain in the master list and folder index. Empty folders correspond to unresolved entries, not skipped research.

## What the image verification means

Accepted photographs depict the listed loose-produce type or a cultivar explicitly identified by the source. They have been visually checked, with reusable public-domain/CC0/CC BY/CC BY-SA terms recorded. This is not manufacturer verification of a merchant SKU, lot or pack. The PDFs supply no merchant pack sizes/weights, so filenames explicitly say PackUnspecified. No pack size, packaging, barcode, stock or price was invented.

No branded pack photographs were accepted: exact merchant packs and reusable rights were not established from public manufacturer/retailer search hits. Do not turn a public product listing into a claim of redistribution permission.

IMAGE_NOT_FOUND means no suitable exact reusable image was secured during this review. It does not assert that no image exists anywhere. Reasons include missing merchant identity, licence uncertainty, source restrictions, wrong plant part/species/variety, generated/illustrated content, watermarks, insufficient resolution and unsuitable presentation.

All downloaded candidates were reviewed. The working review records include 150 visual decisions, including replaced historical candidates, with 46 rejections. Only approved files are in this library. Rejected candidates and review contact sheets remain outside it.

## Integration and image quality

Use Product ID as the join key. For an approved row, combine Image Folder Path and Image Filename. Thumbnail paths are in the JSON manifest. Preserve separate source IDs and variants; do not join by approximate name. Do not substitute a missing photo with another fruit, cultivar, brand or logo.

Details are at most 1200 px on the longest side; thumbnails at most 360 px. Existing source resolution is never upscaled. Aspect ratio is preserved. No crop, AI generation, distortion, label replacement or invented packaging was used. Original_Downloads retains the exact retrieved bytes, which may be a source-permitted cached thumbnail rather than a full camera original.

Carry the attribution/licence records into the consuming website/app or asset distribution. Individual image licences do not change GROZO source-code ownership. No photographer endorsement is claimed.

The GROZO application, website, admin layouts, APKs, catalogue source and existing bundled photos were not modified by this dedicated task. The new library has not been automatically integrated or deployed.

## Research access and validation

Source restrictions were respected. Where the original-download endpoint returned a pause and directed clients to standard thumbnails, subsequent retrieval used the official imageinfo API and the published preset sizes. No proxy, credential bypass, header rotation or anti-bot bypass was used.

Counted image-response budget: {usage["countedBytes"]:,} bytes of a 100,000,000-byte cap, including a 1,000,000-byte conservative reserve for earlier failed responses. No paid service, API key, new toolchain, external AI or application redesign was used.

Automated validation: {validation["passed"]} passed, {validation["failed"]} failed. This covers all mapping IDs/headers/partitions, source PDF hashes, licences/creator credits, approved decisions, every file hash, format, dimensions/aspect ratio, duplicate checks and unchanged existing source. Four CSV reports were authored and inspected through the bundled spreadsheet tool. No unrequested XLSX was delivered.

The final ZIP is verified against every file in this folder. Its SHA-256 and full archive manifest are delivered as adjacent sidecars. The next step is item-specific merchant/rights/quality follow-up from the exception reports; photo coverage is not being described as complete.
"""
(OUT/"README.md").write_text(text,encoding="utf-8")
(OUT/"Reports/IMAGE_VERIFICATION_REPORT.md").write_text(text,encoding="utf-8")
(OUT/"Reports/DUPLICATE_IMAGE_REPORT.md").write_text("# Duplicate image review\n\n103 unique canonical photo files were checked by SHA-256. No unexpected byte duplicates or near-identical perceptual pairs were found. The two identical source names Lemon share one canonical photo without making a duplicate file. No image is shared between differently named source entries. Original/detail/thumbnail derivatives are intentional roles. Both catalogue IDs remain present.\n",encoding="utf-8")
stats={"date":"2026-10-31","countedImageDownloadBytes":usage["countedBytes"],"imageDownloadCapBytes":100000000,"priorFailedResponseReserveBytes":usage["priorFailedResponseReserveBytes"],"localLibraryBytes":sum(p.stat().st_size for p in OUT.rglob("*") if p.is_file()),"reviewWorkingFilesBytes":sum(p.stat().st_size for p in TMP.rglob("*") if p.is_file()),"paidServices":0,"externalAi":False,"newToolchainDownloads":0}
(OUT/"Reports/resource-usage.json").write_text(json.dumps(stats,indent=2),encoding="utf-8")
print(json.dumps(stats,indent=2))
