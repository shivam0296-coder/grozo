import json,csv,pathlib,hashlib,re,zipfile,collections,sys
from PIL import Image,ImageOps
sys.stdout.reconfigure(encoding="utf-8")
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT.parent/"GROZO_PRODUCT_IMAGE_LIBRARY"
data=json.loads((ROOT/"packages/catalogue/imported.json").read_text(encoding="utf-8"))
manifest=json.loads((OUT/"Reports/product-image-manifest.json").read_text(encoding="utf-8"))
images=manifest["images"];summary=json.loads((OUT/"Reports/verification-summary.json").read_text(encoding="utf-8"))
checks=[]
def check(name,value):
 checks.append({"test":name,"result":"PASS" if value else "FAIL"})
 if not value:raise ValueError(name)
def readcsv(name):
 with (OUT/name).open(encoding="utf-8-sig",newline="") as f:return list(csv.DictReader(f))
mapping=readcsv("GROZO_PRODUCT_IMAGE_MAPPING.csv");missing=readcsv("GROZO_MISSING_PRODUCT_IMAGES.csv");manual=readcsv("GROZO_MANUAL_VERIFICATION_AND_LICENSING.csv");master=readcsv("GROZO_MASTER_PRODUCT_LIST.csv")
ids={p["id"] for p in data["products"]};mm={r["Product ID"]:r for r in mapping}
check("All 390 catalogue IDs occur exactly once in mapping",len(mapping)==390 and len(mm)==390 and set(mm)==ids)
check("Master catalogue retains every entry",len(master)==390 and {r["Product ID"] for r in master}==ids)
check("Required mapping columns preserved",list(mapping[0])==["Product ID","Product Name","Brand","Category","Subcategory","Pack Size","Image Filename","Image Folder Path","Original Image Source URL","Image Verification Status","Download Status","Reuse Permission Status","Notes"])
check("Names, brands and unsupplied pack sizes preserved",all(mm[p["id"]]["Product Name"]==p["name"] and mm[p["id"]]["Brand"]==p["brand"] and mm[p["id"]]["Pack Size"]==p["quantityLabel"] for p in data["products"]))
accepted={r["Product ID"] for r in mapping if r["Image Verification Status"]=="VERIFIED_LISTED_LOOSE_PRODUCE"}
unresolved=ids-accepted
check("Accepted plus missing reconcile to catalogue",len(accepted)+len(unresolved)==390 and len(accepted)==summary["entriesWithAcceptedImages"])
check("Missing report contains every unresolved entry",len(missing)==len(unresolved) and {r["Product ID"] for r in missing}==unresolved)
check("Manual queue explicitly overlaps missing report",len(manual)==len(unresolved) and {r["Product ID"] for r in manual}==unresolved)
check("Unresolved records have no unverified image filename",all(not mm[i]["Image Filename"] and mm[i]["Image Verification Status"]=="IMAGE_NOT_FOUND" for i in unresolved))
batches=[json.loads(f.read_text(encoding="utf-8")) for f in (OUT/"Reports/Search_Batches").glob("*.json")]
searched=[i for b in batches for i in b["products"]]
check("Individual search evidence covers all entries",len(searched)==390 and set(searched)==ids and sum(len(b["queries"]) for b in batches)==390)
for d in data["documents"]:
 path=pathlib.Path.home()/"Downloads"/d["file"];check("PDF hash unchanged: "+d["file"],hashlib.sha256(path.read_bytes()).hexdigest()==d["sha256"])
decisions=json.loads((OUT/"Reports/visual-review-decisions.json").read_text(encoding="utf-8"))
reviewed={(d["productId"],d["sourceSha256"]):d for d in decisions}
expected=set();original_hashes=[];perceptual=[]
for entry in images:
 key=(entry["productId"],entry["originalDownload"]["sha256"])
 check("Approved visual decision: "+entry["name"],key in reviewed and reviewed[key]["decision"]=="APPROVED")
 check("Explicit reusable licence: "+entry["name"],bool(entry["licenseUrl"].startswith("https://")) and (entry["license"] in ["Public domain","CC0"] or bool(re.fullmatch(r"CC BY(?:-SA)? (?:2.0|2.5|3.0|4.0)",entry["license"]))))
 if entry["license"].startswith("CC BY"):check("Required creator attribution: "+entry["name"],bool(entry["artist"].strip() or entry["credit"].strip()))
 source=ImageOps.exif_transpose(Image.open(OUT/entry["originalDownload"]["path"]));source_ratio=source.width/source.height
 for role in ["originalDownload","detail","thumbnail"]:
  asset=entry[role];path=OUT/asset["path"];expected.add(asset["path"])
  check("Asset hash: "+entry["name"]+" / "+role,path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest()==asset["sha256"])
  picture=Image.open(path);picture.verify()
  if role!="originalDownload":
   picture=Image.open(path);limit=360 if role=="thumbnail" else 1200
   check("Bounded WebP and preserved proportions: "+entry["name"]+" / "+role,picture.format=="WEBP" and max(picture.size)<=limit and abs(picture.width/picture.height-source_ratio)<0.03)
 original_hashes.append(entry["originalDownload"]["sha256"])
 gray=Image.open(OUT/entry["detail"]["path"]).convert("L").resize((9,8));pixels=[gray.getpixel((x,y)) for y in range(8) for x in range(9)];fingerprint=0
 for y in range(8):
  for x in range(8):fingerprint=(fingerprint<<1)|int(pixels[y*9+x]>pixels[y*9+x+1])
 perceptual.append((entry["productId"],entry["name"],fingerprint))
check("Unique canonical original bytes",len(set(original_hashes))==len(original_hashes)==summary["uniqueAcceptedPhotographs"])
actual={p.relative_to(OUT).as_posix() for p in OUT.rglob("*") if p.is_file() and p.suffix.lower() in [".jpg",".jpeg",".png",".webp"] and not p.relative_to(OUT).as_posix().startswith("Reports/")}
check("Only approved media files included",actual==expected)
check("Mapping files resolve to approved assets",all((r["Image Folder Path"].rstrip("/")+"/"+r["Image Filename"]) in expected for r in mapping if r["Product ID"] in accepted))
check("No application source or original assets changed",True)
preserved=0
with zipfile.ZipFile(ROOT.parent/"GROZO-Stage-3-Catalogue-Update-Source.zip") as baseline:
 for name in baseline.namelist():
  relative=name.removeprefix("grozo/")
  if not (relative.startswith(("apps/","packages/","services/","database/","assets/")) or relative=="LICENSE"):continue
  path=ROOT/relative
  if not path.is_file() or hashlib.sha256(path.read_bytes()).digest()!=hashlib.sha256(baseline.read(name)).digest():raise ValueError("Existing app/project file changed: "+relative)
  preserved+=1
checks[-1]["details"]={"protectedProjectFilesCompared":preserved}
pairs=[]
for i,a in enumerate(perceptual):
 for b in perceptual[i+1:]:
  distance=(a[2]^b[2]).bit_count()
  if distance<=2:pairs.append({"leftProductId":a[0],"leftName":a[1],"rightProductId":b[0],"rightName":b[1],"differenceHashDistance":distance,"status":"NEEDS_PAIR_REVIEW"})
report={"checks":checks,"passed":sum(c["result"]=="PASS" for c in checks),"failed":sum(c["result"]=="FAIL" for c in checks),"mediaFiles":len(actual),"canonicalPhotos":len(images),"entryMappings":len(mapping),"possiblePerceptualPairs":pairs,"scope":"Data, source integrity, reuse metadata, binary files, dimensions, review decisions, mapping and existing-source preservation. No Android/web rebuild required or claimed."}
(OUT/"Reports/automated-validation.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
dup=json.loads((OUT/"Reports/duplicate-image-report.json").read_text(encoding="utf-8"));dup["canonicalOriginalSha256Unique"]=True;dup["canonicalOriginalsChecked"]=len(images);dup["possiblePerceptualPairs"]=pairs
(OUT/"Reports/duplicate-image-report.json").write_text(json.dumps(dup,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"passed":report["passed"],"failed":report["failed"],"canonicalPhotos":len(images),"mediaFiles":len(actual),"preservedSourceFiles":preserved,"possiblePerceptualPairs":pairs},ensure_ascii=False,indent=2))
