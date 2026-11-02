import json,pathlib,urllib.request,urllib.parse,time,sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT.parent/"GROZO_PRODUCT_IMAGE_LIBRARY";TMP=ROOT/"artifacts/image-library-review";META=OUT/"Reports/Selected_Source_Metadata"
downloads={r["productId"]:r for r in json.loads((TMP/"downloads.json").read_text(encoding="utf-8"))}
holds=json.loads((TMP/"pre-download-holds.json").read_text(encoding="utf-8"))
groups={}
for file in META.glob("*.json"):
 m=json.loads(file.read_text(encoding="utf-8"));d=downloads.get(m["productId"],{})
 if d.get("status") in ["AWAITING_VISUAL_REVIEW","NOT_DOWNLOADED_LICENSE_OR_SOURCE","NOT_DOWNLOADED_IDENTITY_OR_CONTENT"]:continue
 if m["name"] in holds or not m.get("exists"):continue
 width=m.get("width") or 0;height=m.get("height") or 0
 if min(width,height)<200 or width<=250:continue
 size=960 if width>960 else 500 if width>500 else 330 if width>330 else 250
 groups.setdefault(size,[]).append(m)
for size,records in groups.items():
 for start in range(0,len(records),25):
  chunk=records[start:start+25]
  params={"action":"query","format":"json","titles":"|".join("File:"+m["title"] for m in chunk),"prop":"imageinfo","iiprop":"url","iiurlwidth":size,"maxlag":5}
  try:
   with urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(params),headers={"User-Agent":"GROZO-Product-Image-Research/1.0 (standard thumbnail review)"}),timeout=45) as response:data=json.load(response)
   if "error" in data:raise ValueError(str(data["error"]))
   infos={p["title"].removeprefix("File:"):p.get("imageinfo",[{}])[0] for p in data.get("query",{}).get("pages",{}).values()}
   normal={n.get("from","").removeprefix("File:"):n.get("to","").removeprefix("File:") for n in data.get("query",{}).get("normalized",[])}
   for m in chunk:
    info=infos.get(normal.get(m["title"],m["title"]),{})
    if info.get("thumburl"):
     m["downloadUrl"]=info["thumburl"];m["thumbnailWidth"]=info.get("thumbwidth");m["thumbnailHeight"]=info.get("thumbheight");m["downloadStrategy"]="Official imageinfo API standard "+str(size)+"px thumbnail; no URL construction or access bypass."
     (META/(m["productId"]+".json")).write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding="utf-8")
   print(json.dumps({"size":size,"metadataUpdated":len(chunk)}),flush=True)
  except Exception as e:print(str(e),flush=True);sys.exit(1)
  time.sleep(10)
