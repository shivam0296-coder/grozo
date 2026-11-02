import pathlib,json,urllib.parse,urllib.request,time,re,sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT.parent/"GROZO_PRODUCT_IMAGE_LIBRARY";TMP=ROOT/"artifacts/image-library-review"
plan=json.loads((TMP/"selections.json").read_text(encoding="utf-8"))
target=OUT/"Reports/Selected_Source_Metadata";target.mkdir(parents=True,exist_ok=True)
def needs(r):
 file=target/(r["productId"]+".json")
 if not file.exists():return True
 old=json.loads(file.read_text(encoding="utf-8"))
 if old.get("title")==r["title"]:return False
 archive=OUT/"Reports/Candidate_History";archive.mkdir(parents=True,exist_ok=True)
 (archive/(r["productId"]+"-"+str(abs(hash(old.get("title",""))))+".json")).write_text(json.dumps(old,ensure_ascii=False,indent=2),encoding="utf-8")
 return True
titles=list(dict.fromkeys(r["title"] for r in plan if needs(r)))
for index in range(0,len(titles),25):
 chunk=titles[index:index+25]
 params={"action":"query","format":"json","titles":"|".join("File:"+t.removeprefix("File:") for t in chunk),"prop":"imageinfo","iiprop":"url|size|extmetadata","iiurlwidth":1200,"maxlag":5}
 try:
  req=urllib.request.Request("https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(params),headers={"User-Agent":"GROZO-Product-Image-Research/1.0 (owner-authorized local photo review)"})
  with urllib.request.urlopen(req,timeout=45) as response:data=json.load(response)
  if "error" in data:raise ValueError(str(data["error"]))
  infos={p["title"].removeprefix("File:"):p.get("imageinfo",[{}])[0] for p in data.get("query",{}).get("pages",{}).values()}
  normal={n.get("from","").removeprefix("File:"):n.get("to","").removeprefix("File:") for n in data.get("query",{}).get("normalized",[])}
  for r in plan:
   if r["title"] not in chunk:continue
   info=infos.get(normal.get(r["title"],r["title"]),{});m=info.get("extmetadata",{});clean=lambda s:re.sub("<[^>]*>","",s)
   entry={**r,"metadataRetrievedAt":"2026-10-31","exists":bool(info),"sourcePage":info.get("descriptionurl"),"originalUrl":info.get("url"),"downloadUrl":info.get("thumburl") or info.get("url"),"width":info.get("width"),"height":info.get("height"),"thumbnailWidth":info.get("thumbwidth"),"thumbnailHeight":info.get("thumbheight"),"license":m.get("LicenseShortName",{}).get("value",""),"licenseUrl":m.get("LicenseUrl",{}).get("value",""),"artist":clean(m.get("Artist",{}).get("value","")),"description":clean(m.get("ImageDescription",{}).get("value",""))[:4000],"credit":clean(m.get("Credit",{}).get("value","")),"usageTerms":clean(m.get("UsageTerms",{}).get("value","")),"attributionRequired":m.get("AttributionRequired",{}).get("value",""),"restrictions":m.get("Restrictions",{}).get("value",""),"status":"AWAITING_VISUAL_REVIEW" if info else "FILE_NOT_FOUND"}
   (target/(r["productId"]+".json")).write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding="utf-8")
  print(json.dumps({"batch":index//25+1,"requested":len(chunk),"found":sum(bool(x) for x in infos.values())}),flush=True)
 except urllib.error.HTTPError as e:
  print(json.dumps({"http":e.code,"retryAfter":e.headers.get("Retry-After"),"stopped":True}),flush=True);break
 except Exception as e:print(str(e),flush=True);break
 if index+25<len(titles):time.sleep(10)
