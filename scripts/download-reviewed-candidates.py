import json,urllib.request,urllib.parse,pathlib,re,sys,io,hashlib
from PIL import Image,ImageOps,ImageDraw
sys.stdout.reconfigure(encoding='utf-8')
root=pathlib.Path(__file__).resolve().parents[1]
mapping={'Mango':'Mango (1).jpg','Banana':'Banana (1).jpg','Apple':'Apple (1).jpg','Orange':'Orange (1).jpg','Watermelon':'Watermelon (1).jpg','Pineapple':'Pineapple.jpg','Muskmelon / Cantaloupe':'Cantaloupe.jpg','Carrot':'Carrot vegetable on white background.jpg','Tomato':'Tomato (1).jpg','Celery':'Celery (1).jpg','Red Bell Pepper':'RedBellPepper.jpg','Strawberry':'A strawberry with achene.jpg','Guava':'Fruit Guava.jpg','Green Peas':'Peas in pods 2016 G1.jpg'}
titles='|'.join('File:'+x for x in mapping.values())
params={'action':'query','format':'json','titles':titles,'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':1000}
req=urllib.request.Request('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params),headers={'User-Agent':'GROZO-Catalogue-Review/0.3 (licensed local product image research)'})
with urllib.request.urlopen(req,timeout=40) as response:data=json.load(response)
metadata={p['title'].removeprefix('File:'):p.get('imageinfo',[{}])[0] for p in data['query']['pages'].values()}
out=root/'artifacts/image-review';out.mkdir(parents=True,exist_ok=True)
records=[];total=0
for name,title in mapping.items():
    info=metadata.get(title,{});m=info.get('extmetadata',{});lic=m.get('LicenseShortName',{}).get('value','')
    if lic not in ['Public domain','CC0']:
        records.append({'name':name,'title':title,'status':'not_downloaded_license','license':lic});continue
    url=info.get('thumburl') or info.get('url')
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'GROZO-Catalogue-Review/0.3'})
        with urllib.request.urlopen(req,timeout=35) as response:
            raw=response.read(5_000_001)
        if len(raw)>5_000_000 or total+len(raw)>100_000_000:raise ValueError('Download cap reached')
        total+=len(raw)
        slug=re.sub('[^a-z0-9]+','-',name.lower()).strip('-')
        path=out/(slug+'.jpg')
        im=Image.open(io.BytesIO(raw)).convert('RGB');im.save(path,quality=95)
        records.append({'name':name,'title':title,'status':'awaiting_visual_review','localFile':str(path),'downloadBytes':len(raw),'downloadSha256':hashlib.sha256(raw).hexdigest(),'sourcePage':info.get('descriptionurl'),'license':lic,'artist':re.sub('<[^>]+>','',m.get('Artist',{}).get('value','')),'description':re.sub('<[^>]+>','',m.get('ImageDescription',{}).get('value','')),'credit':re.sub('<[^>]+>','',m.get('Credit',{}).get('value','')),'licenseUrl':m.get('LicenseUrl',{}).get('value',''),'metadata':m})
    except Exception as e:records.append({'name':name,'title':title,'status':'download_failed','error':str(e)})
(out/'downloaded.json').write_text(json.dumps({'images':records,'downloadBytes':total},ensure_ascii=False,indent=2),encoding='utf-8')
cards=[]
for r in records:
    if r['status']!='awaiting_visual_review':continue
    im=Image.open(r['localFile']);im.thumbnail((300,230))
    card=Image.new('RGB',(330,300),'white');card.paste(im,((330-im.width)//2,30));d=ImageDraw.Draw(card);d.text((10,8),r['name'],fill='black');d.text((10,270),r['license'],fill='black');cards.append(card)
sheet=Image.new('RGB',(4*330,((len(cards)+3)//4)*300),'#dddddd')
for i,card in enumerate(cards):sheet.paste(card,((i%4)*330,(i//4)*300))
if cards:sheet.save(out/'photo-review.jpg')
print(json.dumps({'downloadBytes':total,'results':[{k:r.get(k) for k in ['name','status','license','error']} for r in records]},ensure_ascii=False,indent=2))
