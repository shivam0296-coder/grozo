import json,pathlib,urllib.request,urllib.parse,time,re,sys,hashlib
sys.stdout.reconfigure(encoding="utf-8")
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT.parent/"GROZO_PRODUCT_IMAGE_LIBRARY"
DATA=json.loads((ROOT/"packages/catalogue/imported.json").read_text(encoding="utf-8"))
(OUT/"Reports/Commons_Research").mkdir(parents=True,exist_ok=True)
UA="GROZO-Product-Image-Research/1.0 (owner-authorized local catalogue review)"
stop=ROOT/"artifacts/image-library-stop"
def clean(s):return re.sub("<[^>]*>","",s)
entries=[p for p in DATA["products"] if p["category"] in ["Fruits","Vegetables"]]
for index,p in enumerate(entries):
 if stop.exists():print("Stopped by local cancellation flag",flush=True);break
 target=OUT/"Reports/Commons_Research"/(p["id"]+".json")
 if target.exists():continue
 name=p["name"]
 query=name.replace("/"," ").replace(" - "," ")
 params={"action":"query","format":"json","generator":"search","gsrsearch":query+" filetype:bitmap","gsrnamespace":6,"gsrlimit":8,"prop":"imageinfo","iiprop":"url|size|extmetadata","iiurlwidth":1000,"maxlag":5}
 url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(params)
 record={"productId":p["id"],"name":name,"query":query,"requestUrl":url,"date":"2026-10-31","candidates":[]}
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=35) as response:data=json.load(response)
  if "error" in data:raise ValueError(str(data["error"]))
  for page in data.get("query",{}).get("pages",{}).values():
   info=page.get("imageinfo",[{}])[0];m=info.get("extmetadata",{})
   record["candidates"].append({"title":page["title"],"pageId":page.get("pageid"),"sourcePage":info.get("descriptionurl"),"originalUrl":info.get("url"),"downloadUrl":info.get("thumburl") or info.get("url"),"width":info.get("width"),"height":info.get("height"),"thumbWidth":info.get("thumbwidth"),"thumbHeight":info.get("thumbheight"),"mime":info.get("mime"),"license":m.get("LicenseShortName",{}).get("value",""),"licenseUrl":m.get("LicenseUrl",{}).get("value",""),"artist":clean(m.get("Artist",{}).get("value","")),"description":clean(m.get("ImageDescription",{}).get("value",""))[:3000],"credit":clean(m.get("Credit",{}).get("value","")),"usageTerms":clean(m.get("UsageTerms",{}).get("value","")),"metadataRetrieved":True})
  record["status"]="SEARCHED"
 except urllib.error.HTTPError as e:
  record.update(status="SEARCH_BLOCKED" if e.code in [403,429] else "SEARCH_ERROR",error=str(e))
  target.write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding="utf-8")
  print(json.dumps({"index":index+1,"name":name,"status":record["status"],"http":e.code}),flush=True)
  if e.code in [403,429]:print("Host access/rate restriction respected; stopping Commons batch.",flush=True);break
 except Exception as e:record.update(status="SEARCH_ERROR",error=str(e))
 target.write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding="utf-8")
 print(json.dumps({"index":index+1,"total":len(entries),"name":name,"candidates":len(record["candidates"]),"status":record["status"]}),flush=True)
 time.sleep(1.1)
