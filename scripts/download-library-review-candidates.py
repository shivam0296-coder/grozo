import json,pathlib,urllib.request,urllib.parse,hashlib,io,time,re,sys,math
from PIL import Image,ImageOps,ImageDraw
sys.stdout.reconfigure(encoding="utf-8")
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT.parent/"GROZO_PRODUCT_IMAGE_LIBRARY";TMP=ROOT/"artifacts/image-library-review"
META=OUT/"Reports/Selected_Source_Metadata";TMP.mkdir(parents=True,exist_ok=True)
holds=json.loads((TMP/"pre-download-holds.json").read_text(encoding="utf-8")) if (TMP/"pre-download-holds.json").exists() else {}
existing=json.loads((TMP/"downloads.json").read_text(encoding="utf-8")) if (TMP/"downloads.json").exists() else []
records={r["productId"]:r for r in existing}
usage_path=TMP/"download-usage.json"
if usage_path.exists():usage=json.loads(usage_path.read_text(encoding="utf-8"))
else:
 raw_bytes=sum(f.stat().st_size for f in TMP.iterdir() if re.fullmatch(r"[0-9a-f-]{36}(?:-[0-9a-f]{8})?\.(?:jpg|png|webp)",f.name))
 usage={"confirmedSavedResponseBytesAtCheckpoint":raw_bytes,"priorFailedResponseReserveBytes":1000000,"budgetBytes":100000000,"countedBytes":raw_bytes+1000000,"newResponses":[]}
total=usage["countedBytes"]
allowed=lambda s:s in ["Public domain","CC0"] or bool(re.fullmatch(r"CC BY(?:-SA)? (?:2.0|2.5|3.0|4.0)",s))
for file in sorted(META.glob("*.json")):
 m=json.loads(file.read_text(encoding="utf-8"));ident=m["productId"]
 if ident in records and records[ident].get("error")=="Insufficient card resolution":continue
 if ident in records and records[ident].get("title")==m["title"] and records[ident].get("status") in ["AWAITING_VISUAL_REVIEW","NOT_DOWNLOADED_LICENSE_OR_SOURCE"]:continue
 if ident in records and records[ident].get("title")!=m["title"]:
  history=TMP/"download-history";history.mkdir(exist_ok=True)
  (history/(ident+".json")).write_text(json.dumps(records[ident],ensure_ascii=False,indent=2),encoding="utf-8")
 if m["name"] in holds or re.search(r"AI.generated|AI generated|generated image|illustration|writing chart|文字表|cooked.*dish|juice|stir.fried|dried.*after boiling|keyboard",m.get("description","")+" "+m.get("title",""),re.I):
  records[ident]={**m,"status":"NOT_DOWNLOADED_IDENTITY_OR_CONTENT","reason":holds.get(m["name"],"Metadata identifies generated, illustrated, prepared or unrelated content.")};continue
 if not m.get("exists") or not allowed(m.get("license","")):
  records[ident]={**m,"status":"NOT_DOWNLOADED_LICENSE_OR_SOURCE"};continue
 url=m.get("downloadUrl","")
 if urllib.parse.urlsplit(url).hostname not in ["upload.wikimedia.org","thumb.wikimedia.org"]:
  records[ident]={**m,"status":"NOT_DOWNLOADED_UNEXPECTED_HOST"};continue
 if total+4_000_001>100_000_000:print("Download budget stop",flush=True);break
 try:
  for attempt in range(3):
   try:
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"GROZO-Product-Image-Research/1.0 (owner-authorized local review)"}),timeout=35) as response:
     raw=response.read(4_000_001);ctype=response.headers.get("Content-Type","")
    break
   except urllib.error.HTTPError as retry_error:
    retry=retry_error.headers.get("Retry-After","")
    if retry_error.code!=429 or not retry.isdigit() or int(retry)>60 or attempt==2:raise
    print(json.dumps({"name":m["name"],"http":429,"retryAfter":int(retry),"action":"respect_retry_after"}),flush=True)
    time.sleep(max(5,int(retry)))
  total+=len(raw);usage["countedBytes"]=total;usage["newResponses"].append({"productId":ident,"bytes":len(raw),"url":url});usage_path.write_text(json.dumps(usage,indent=2),encoding="utf-8")
  if len(raw)>4_000_000 or total>100_000_000:raise ValueError("Download limit reached")
  im=Image.open(io.BytesIO(raw))
  if im.format not in ["JPEG","PNG","WEBP"] or im.width*im.height>20_000_000:raise ValueError("Unsupported or excessive image")
  if min(im.width,im.height)<200:raise ValueError("Insufficient card resolution")
  ext={"JPEG":".jpg","PNG":".png","WEBP":".webp"}[im.format]
  path=TMP/(ident+"-"+hashlib.sha256(raw).hexdigest()[:8]+ext);path.write_bytes(raw)
  records[ident]={**m,"status":"AWAITING_VISUAL_REVIEW","localFile":str(path),"downloadBytes":len(raw),"downloadSha256":hashlib.sha256(raw).hexdigest(),"downloadWidth":im.width,"downloadHeight":im.height,"contentType":ctype}
 except urllib.error.HTTPError as e:
  records[ident]={**m,"status":"DOWNLOAD_BLOCKED" if e.code in [403,429] else "DOWNLOAD_FAILED","error":str(e),"retryAfter":e.headers.get("Retry-After")}
  if e.code in [403,429]:
   (TMP/"downloads.json").write_text(json.dumps(list(records.values()),ensure_ascii=False,indent=2),encoding="utf-8")
   print(json.dumps({"name":m["name"],"http":e.code,"stopped":True}),flush=True);break
 except Exception as e:records[ident]={**m,"status":"DOWNLOAD_FAILED","error":str(e)}
 (TMP/"downloads.json").write_text(json.dumps(list(records.values()),ensure_ascii=False,indent=2),encoding="utf-8")
 print(json.dumps({"name":m["name"],"status":records[ident]["status"],"totalDownloadBytes":total}),flush=True)
 time.sleep(5)
items=[r for r in records.values() if r.get("status")=="AWAITING_VISUAL_REVIEW"]
for start in range(0,len(items),16):
 group=items[start:start+16];sheet=Image.new("RGB",(1280,math.ceil(len(group)/4)*310),"#e0e0e0");d=ImageDraw.Draw(sheet)
 for j,r in enumerate(group):
  im=ImageOps.exif_transpose(Image.open(r["localFile"])).convert("RGB");im.thumbnail((300,240))
  x=(j%4)*320;y=(j//4)*310
  sheet.paste(Image.new("RGB",(312,302),"white"),(x+4,y+4));sheet.paste(im,(x+(320-im.width)//2,y+30+(240-im.height)//2))
  d.text((x+10,y+10),str(start+j+1)+". "+r["name"][:40],fill="black")
  d.text((x+10,y+277),r["license"],fill="black")
  r["reviewSheet"]=(start//16)+1;r["reviewNumber"]=start+j+1
 sheet.save(TMP/("review-"+str(start//16+1)+".jpg"),quality=92)
(TMP/"downloads.json").write_text(json.dumps(list(records.values()),ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"downloadedCandidates":len(items),"downloadBytes":total,"reviewSheets":math.ceil(len(items)/16)}),flush=True)
