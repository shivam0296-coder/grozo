import json,pathlib,re,hashlib,shutil,html,collections,datetime,sys,urllib.parse,math
from PIL import Image,ImageOps,ImageDraw
sys.stdout.reconfigure(encoding="utf-8")
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT.parent/"GROZO_PRODUCT_IMAGE_LIBRARY";TMP=ROOT/"artifacts/image-library-review"
credit_file=OUT/"Reports/creator-credit-verification.json"
credit_overrides={r["productId"]:r for r in json.loads(credit_file.read_text(encoding="utf-8"))} if credit_file.exists() else {}
data=json.loads((ROOT/"packages/catalogue/imported.json").read_text(encoding="utf-8"))
master=json.loads((OUT/"Reports/master-products.json").read_text(encoding="utf-8"))
masters={r["Product ID"]:r for r in master};products={p["id"]:p for p in data["products"]}
downloads=json.loads((TMP/"downloads.json").read_text(encoding="utf-8"));download_map={r["productId"]:r for r in downloads}
decisions=json.loads((TMP/"review-decisions.json").read_text(encoding="utf-8"));decision_map={(d["productId"],d["sourceSha256"]):d for d in decisions}
batches=[json.loads(f.read_text(encoding="utf-8")) for f in sorted((OUT/"Reports/Search_Batches").glob("*.json"))]
assert set(products)==set(masters) and len(products)==390
assert set(products)=={p for b in batches for p in b["products"]}
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def licurl(r):
 if r.get("licenseUrl"):return r["licenseUrl"].replace("http://creativecommons.org/","https://creativecommons.org/")
 if r["license"]=="Public domain":return "https://creativecommons.org/publicdomain/mark/1.0/"
 if r["license"]=="CC0":return "https://creativecommons.org/publicdomain/zero/1.0/"
 m=re.fullmatch(r"CC BY(-SA)? ([0-9.]+)",r["license"])
 if not m:raise ValueError("Unapproved licence")
 return "https://creativecommons.org/licenses/"+("by-sa" if m[1] else "by")+"/"+m[2]+"/"
def search_info(p):
 b=next(b for b in batches if p["id"] in b["products"]);query=b["queries"][b["products"].index(p["id"])]
 tokens=set(re.findall("[a-z0-9]+",p["name"].lower()));brand=set(re.findall("[a-z0-9]+",p["brand"].lower()))
 ranked=[]
 for source in b["sources"]:
  words=set(re.findall("[a-z0-9]+",urllib.parse.unquote(source["title"]+" "+source["url"]).lower()))
  score=len(tokens & words)
  if brand and not brand.issubset(words):continue
  if score<max(1,math.ceil(len(tokens)*0.5)):continue
  ranked.append((score,source))
 ranked.sort(key=lambda item:item[0],reverse=True)
 urls=list(dict.fromkeys(s["url"] for score,s in ranked[:3]))
 return query,urls,b["batch"]
def rel(path):return path.relative_to(OUT).as_posix()
published=[];by_product={};raw_canonical={};shared=[];duplicate_conflicts=[]
for p in data["products"]:
 r=download_map.get(p["id"]);d=decision_map.get((p["id"],r.get("downloadSha256"))) if r else None
 if not r or not d or d["decision"]!="APPROVED":continue
 source=pathlib.Path(r["localFile"])
 if not source.is_file() or sha(source)!=r["downloadSha256"]:raise ValueError("Approved input hash mismatch")
 if r["downloadSha256"] in raw_canonical:
  existing=raw_canonical[r["downloadSha256"]]
  if existing["name"]!=p["name"]:
   duplicate_conflicts.append({"productId":p["id"],"name":p["name"],"otherProductId":existing["productId"],"reason":"Same source bytes for differently named entries; second mapping withheld."});continue
  by_product[p["id"]]=existing;shared.append({"productId":p["id"],"canonicalProductId":existing["productId"],"name":p["name"],"reason":"Identical source product name listed in two source records; one canonical image, no duplicate file."});continue
 m=masters[p["id"]];folder=OUT/m["Image Folder Path"];folder.mkdir(parents=True,exist_ok=True);stem=m["Expected Image Stem"]
 original_folder=OUT/"Original_Downloads"/m["Image Folder Path"];original_folder.mkdir(parents=True,exist_ok=True)
 original=original_folder/(stem+source.suffix.lower());shutil.copyfile(source,original)
 im=ImageOps.exif_transpose(Image.open(source))
 if im.mode in ["RGBA","LA"] or "transparency" in im.info:
  rgba=im.convert("RGBA");background=Image.new("RGBA",rgba.size,"white");background.alpha_composite(rgba);im=background.convert("RGB")
 else:im=im.convert("RGB")
 outputs={}
 for suffix,size in [("",1200),("_Thumbnail",360)]:
  picture=im.copy();picture.thumbnail((size,size))
  target=folder/(stem+suffix+".webp");picture.save(target,"WEBP",quality=86,method=6)
  outputs["thumbnail" if suffix else "detail"]={"path":rel(target),"sha256":sha(target),"width":picture.width,"height":picture.height,"bytes":target.stat().st_size}
 entry={"productId":p["id"],"name":p["name"],"brand":p["brand"],"packSize":p["quantityLabel"],"category":p["category"],"subcategory":m["Subcategory"],"verificationStatus":"VERIFIED_LISTED_LOOSE_PRODUCE","reviewedAt":"2026-10-31","reviewNote":d["note"],"artist":html.unescape(r.get("artist","") or credit_overrides.get(p["id"],{}).get("artist","")),"credit":html.unescape(r.get("credit","")),"license":r["license"],"licenseUrl":licurl(r),"sourcePage":r["sourcePage"],"originalSourceUrl":r["originalUrl"],"retrievedUrl":r["downloadUrl"],"downloadStrategy":r.get("downloadStrategy","Source-provided original or preview URL"),"originalDownload":{"path":rel(original),"sha256":sha(original),"bytes":original.stat().st_size,"width":r["downloadWidth"],"height":r["downloadHeight"]},**outputs,"modifications":"EXIF orientation respected; proportional resize and WebP compression; alpha flattened to white only if present. No labels replaced, no AI generation, no stretching, no crop."}
 published.append(entry);by_product[p["id"]]=entry;raw_canonical[r["downloadSha256"]]=entry
mapping=[];missing=[];manual=[]
for p in data["products"]:
 m=masters[p["id"]];entry=by_product.get(p["id"]);query,candidates,batch=search_info(p);r=download_map.get(p["id"],{});d=decision_map.get((p["id"],r.get("downloadSha256")))
 if entry:
  note="Loose-produce name/cultivar photo checked against source metadata and visually reviewed. No merchant lot, pack size, stock or brand-pack verification is claimed."
  if any(s["productId"]==p["id"] for s in shared):note+=" Same-named duplicate source record shares the canonical photo; both catalogue IDs are retained."
  row={"Product ID":p["id"],"Product Name":p["name"],"Brand":p["brand"],"Category":p["category"],"Subcategory":m["Subcategory"],"Pack Size":p["quantityLabel"],"Image Filename":pathlib.PurePosixPath(entry["detail"]["path"]).name,"Image Folder Path":str(pathlib.PurePosixPath(entry["detail"]["path"]).parent),"Original Image Source URL":entry["originalSourceUrl"],"Image Verification Status":"VERIFIED_LISTED_LOOSE_PRODUCE","Download Status":"DOWNLOADED" if p["id"]==entry["productId"] else "SHARED_CANONICAL_DOWNLOAD","Reuse Permission Status":entry["license"]+"; attribution/licence record included","Notes":note}
 else:
  if p["category"] not in ["Fruits","Vegetables"]:reason="MERCHANT_SKU_AND_REUSE_PERMISSION_REQUIRED";note="Source lists a name/group only, without merchant pack/weight/variant confirmation. Search hits do not establish reusable exact-pack rights."
  elif d and d["decision"]=="REJECTED":reason="VISUAL_REVIEW_REJECTED";note=d["note"]
  elif r.get("status")=="NOT_DOWNLOADED_IDENTITY_OR_CONTENT":reason="IDENTITY_OR_CONTENT_NOT_VERIFIED";note=r.get("reason","Candidate does not match the intended raw product.")
  elif r.get("status")=="NOT_DOWNLOADED_LICENSE_OR_SOURCE":reason="EXACT_SOURCE_OR_REUSE_PERMISSION_NOT_SECURED";note="Source missing or reuse terms outside the accepted clear permission set; no rights inferred."
  elif r.get("status")=="DOWNLOAD_BLOCKED":reason="SOURCE_DOWNLOAD_RESTRICTED";note="Source rate/access restriction respected. "+r.get("error","")
  elif r.get("status")=="DOWNLOAD_FAILED":reason="DOWNLOAD_OR_QUALITY_FAILURE";note=r.get("error","Download failed.")
  elif r.get("status")=="AWAITING_VISUAL_REVIEW":reason="VISUAL_REVIEW_PENDING";note="Candidate has not passed a recorded visual decision; no asset included."
  else:reason="NO_SUITABLE_EXACT_REUSABLE_IMAGE_SECURED";note="Individual search completed; no suitable rights-checked exact-name product photo was secured in this research."
  if any(c["productId"]==p["id"] for c in duplicate_conflicts):reason="DUPLICATE_SOURCE_CONFLICT";note="Candidate repeats source bytes for a different named product; second image mapping withheld."
  if r.get("sourcePage"):candidates=list(dict.fromkeys([r["sourcePage"]]+candidates))[:3]
  row={"Product ID":p["id"],"Product Name":p["name"],"Brand":p["brand"],"Category":p["category"],"Subcategory":m["Subcategory"],"Pack Size":p["quantityLabel"],"Image Filename":"","Image Folder Path":m["Image Folder Path"],"Original Image Source URL":"","Image Verification Status":"IMAGE_NOT_FOUND","Download Status":"NOT_INCLUDED","Reuse Permission Status":"NOT_ESTABLISHED_FOR_EXACT_PRODUCT","Notes":reason+": "+note}
  missing.append({**row,"Reason Code":reason,"Search Performed":query,"Candidate Source Pages":" ; ".join(candidates),"Search Evidence Batch":str(batch)})
  manual.append({"Product ID":p["id"],"Product Name":p["name"],"Brand":p["brand"],"Pack Size":p["quantityLabel"],"Reason":reason,"Required Action":"Confirm intended item/pack, obtain the exact photo and explicit reusable licence, then record a visual review.","Candidate Source Pages":" ; ".join(candidates),"Search Performed":query,"Review Status":"MANUAL_FOLLOW_UP_REQUIRED","Notes":note})
 mapping.append(row)
tables=[{"filename":"GROZO_PRODUCT_IMAGE_MAPPING.csv","sheet":"Mapping","rows":mapping},{"filename":"GROZO_MISSING_PRODUCT_IMAGES.csv","sheet":"Missing","rows":missing},{"filename":"GROZO_MANUAL_VERIFICATION_AND_LICENSING.csv","sheet":"Manual review","rows":manual},{"filename":"GROZO_MASTER_PRODUCT_LIST.csv","sheet":"Master list","rows":master}]
(TMP/"report-tables.json").write_text(json.dumps(tables,ensure_ascii=False,indent=2),encoding="utf-8")
(OUT/"Reports/product-image-manifest.json").write_text(json.dumps({"images":published,"productMappings":{p:e["productId"] for p,e in by_product.items()},"intentionalSharedMappings":shared},ensure_ascii=False,indent=2),encoding="utf-8")
(OUT/"Reports/visual-review-decisions.json").write_text(json.dumps(decisions,ensure_ascii=False,indent=2),encoding="utf-8")
bycat=[]
for cat in dict.fromkeys(p["category"] for p in data["products"]):
 group=[p for p in data["products"] if p["category"]==cat];count=sum(p["id"] in by_product for p in group);bycat.append({"category":cat,"entries":len(group),"withImages":count,"withoutImages":len(group)-count})
summary={"date":"2026-10-31","catalogueEntries":390,"individualEntriesSearched":390,"searchQueryBatches":len(batches),"taxonomyNodes":len(data["categories"]),"uniqueAcceptedPhotographs":len(published),"entriesWithAcceptedImages":len(by_product),"entriesWithoutAcceptedImages":len(missing),"manualFollowUpEntries":len(manual),"manualQueueOverlapsMissing":True,"unverifiedImagesIncluded":0,"visualDecisions":len(decisions),"rejectedCandidates":sum(d["decision"]=="REJECTED" for d in decisions),"byCategory":bycat,"exactPackPhotographs":0,"scope":"All entries accounted for. Accepted photographs match the source-named loose produce/cultivar, not a merchant SKU/lot. Missing means no suitable exact reusable photo secured in this research, not proof no photo exists anywhere.","applicationOrWebsiteChanges":False}
(OUT/"Reports/verification-summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
(OUT/"Reports/progress.json").write_text(json.dumps({**summary,"researchCoverage":"COMPLETE_FOR_ALL_390_ENTRIES","imageAcquisition":"PARTIAL_WITH_ITEMIZED_EXCEPTIONS"},ensure_ascii=False,indent=2),encoding="utf-8")
(OUT/"Reports/duplicate-image-report.json").write_text(json.dumps({"sameBytesForDifferentNamedEntriesWithheld":duplicate_conflicts,"intentionalSharedSourceRecords":shared,"originalByteDuplicateGroups":[],"note":"Proportional detail/thumbnail derivatives and original downloaded bytes are intentional file roles, not additional products. All source catalogue IDs remain present."},ensure_ascii=False,indent=2),encoding="utf-8")
notice="# Photo attribution and reuse\n\nKeep this file and each image's source/licence data with redistribution. Individual image licences do not change GROZO source-code ownership. Original_Downloads preserves the exact bytes retrieved at the source-provided permitted size, which may be a thumbnail rather than the full camera original. Optimized files are resized/compressed without replacing labels or product content.\n\n"
for e in published:notice+="## "+e["name"]+"\n\nAuthor: "+(e["artist"] or "See original source")+".\n\nLicence: "+e["license"]+" — "+e["licenseUrl"]+"\n\nSource: "+e["sourcePage"]+"\n\nFiles: "+e["detail"]["path"]+" and thumbnail/original listed in product-image-manifest.json.\n\nChanges: proportional resize, orientation correction where required, WebP compression; no crop or generated content. CC BY-SA derivatives retain their stated image licence.\n\n"
(OUT/"LICENSE_AND_ATTRIBUTION.md").write_text(notice,encoding="utf-8")
print(json.dumps(summary,ensure_ascii=False,indent=2))
