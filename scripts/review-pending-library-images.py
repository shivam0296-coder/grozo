import json,pathlib,sys,math
from PIL import Image,ImageOps,ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1];TMP=ROOT/"artifacts/image-library-review"
round_name=sys.argv[1] if len(sys.argv)>1 else "pending"
downloads=json.loads((TMP/"downloads.json").read_text(encoding="utf-8"))
decisions=json.loads((TMP/"review-decisions.json").read_text(encoding="utf-8"))
done={(d["productId"],d["sourceSha256"]) for d in decisions}
items=[r for r in downloads if r.get("status")=="AWAITING_VISUAL_REVIEW" and (r["productId"],r["downloadSha256"]) not in done]
(TMP/(round_name+".json")).write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding="utf-8")
for start in range(0,len(items),16):
 group=items[start:start+16];sheet=Image.new("RGB",(1280,math.ceil(len(group)/4)*310),"#e0e0e0");d=ImageDraw.Draw(sheet)
 for j,r in enumerate(group):
  im=ImageOps.exif_transpose(Image.open(r["localFile"])).convert("RGB");im.thumbnail((300,240));x=(j%4)*320;y=(j//4)*310
  sheet.paste(Image.new("RGB",(312,302),"white"),(x+4,y+4));sheet.paste(im,(x+(320-im.width)//2,y+30+(240-im.height)//2))
  d.text((x+10,y+10),str(start+j+1)+". "+r["name"][:42],fill="black");d.text((x+10,y+277),r["license"]+" / "+r["downloadSha256"][:8],fill="black")
 sheet.save(TMP/(round_name+"-"+str(start//16+1)+".jpg"),quality=93)
print(json.dumps({"round":round_name,"pendingImages":len(items),"sheets":math.ceil(len(items)/16)}))
