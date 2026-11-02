import json,csv,pathlib,re,hashlib,sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT.parent/"GROZO_PRODUCT_IMAGE_LIBRARY"
DATA=json.loads((ROOT/"packages/catalogue/imported.json").read_text(encoding="utf-8"))
CATS={c["id"]:c for c in DATA["categories"]}
def components(ident):
 result=[];seen=set()
 while ident and ident not in seen:
  seen.add(ident);c=CATS[ident];result.insert(0,c);ident=c.get("parentId")
 return result
def safe(text,limit=48):
 text=re.sub(r'[<>:"/\\|?*\x00-\x1f]',"_",text).strip(" ._")
 return text[:limit].rstrip(" ._") or "Unspecified"
def folder(p):return "/".join(safe(c["name"]) for c in components(p["subcategoryId"]))
def stem(p):
 text=p["name"]
 if p["brand"] and text.startswith(p["brand"]):text=text[len(p["brand"]):].strip()
 return safe("_".join(filter(None,[p["brand"],text,"PackUnspecified"])),90).replace(" ","_")+"_"+p["id"][:8]
for d in DATA["documents"]:
 path=pathlib.Path.home()/"Downloads"/d["file"]
 if hashlib.sha256(path.read_bytes()).hexdigest()!=d["sha256"]:raise ValueError("Source PDF changed: "+d["file"])
for c in DATA["categories"]:(OUT/pathlib.Path(*[safe(n["name"]) for n in components(c["id"])] )).mkdir(parents=True,exist_ok=True)
(OUT/"Reports/Search_Batches").mkdir(parents=True,exist_ok=True)
master=[]
for p in DATA["products"]:
 master.append({"Product ID":p["id"],"Product Name":p["name"],"Brand":p["brand"],"Category":p["category"],"Subcategory":" / ".join(c["name"] for c in components(p["subcategoryId"])[1:]),"Pack Size":p["quantityLabel"],"Weight":"","Quantity":"","Variant":p.get("variant",""),"Source PDF":p["sourceRow"]["file"],"Source Page":p["sourceRow"]["page"],"Source Entry":p["sourceRow"]["entry"],"Raw Source Text":p["sourceRow"]["rawText"],"Image Folder Path":folder(p),"Expected Image Stem":stem(p),"Notes":"Merchant pack, weight and quantity were not supplied; no size inferred."})
with (OUT/"GROZO_MASTER_PRODUCT_LIST.csv").open("w",encoding="utf-8-sig",newline="") as f:
 w=csv.DictWriter(f,fieldnames=list(master[0]));w.writeheader();w.writerows(master)
(OUT/"Reports/master-products.json").write_text(json.dumps(master,ensure_ascii=False,indent=2),encoding="utf-8")
(OUT/"Reports/catalogue-source-manifest.json").write_text(json.dumps({"date":"2026-10-31","sourceVersion":DATA["version"],"sourceDocuments":DATA["documents"],"productCount":len(master),"taxonomy":DATA["categories"],"scope":"Every source entry retained; no invented pack sizes, quantities or individual SKUs from alternatives."},ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"masterRecords":len(master),"categoryFolders":len(DATA["categories"]),"pdfHashesVerified":len(DATA["documents"])}))
