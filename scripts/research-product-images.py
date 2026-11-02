import json,urllib.request,urllib.parse,concurrent.futures,re,pathlib,sys
sys.stdout.reconfigure(encoding='utf-8')
root=pathlib.Path(__file__).resolve().parents[1]
queries=['Mango','Banana','Apple','Pomegranate','Papaya','Guava','Orange','Watermelon','Pineapple','Coconut','Lemon','Grapes','Strawberry','Kiwi','Avocado','Potato','Carrot','Radish','Beetroot','Spinach','Cabbage','Cauliflower','Broccoli','Tomato','Onion','Garlic','Cucumber','Peas','Almonds','Cashews','Walnuts','Dates','Rice','Milk','Eggs']
def fetch(q):
    params={'action':'query','format':'json','generator':'search','gsrsearch':'intitle:"'+q+'" filetype:bitmap','gsrnamespace':6,'gsrlimit':15,'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':800}
    url='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params)
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'GROZO-Catalogue-Review/0.3 (local educational development; contact owner before production)'})
        with urllib.request.urlopen(req,timeout=30) as r: data=json.load(r)
        candidates=[]
        for p in data.get('query',{}).get('pages',{}).values():
            info=p.get('imageinfo',[{}])[0]; m=info.get('extmetadata',{})
            lic=m.get('LicenseShortName',{}).get('value','')
            if lic not in ['Public domain','CC0']: continue
            if not info.get('url','').split('?')[0].lower().endswith(('.jpg','.jpeg','.png')): continue
            if re.search(r'drawing|illustration|painting|engraving|logo|map|graph|diagram|watercolour',p['title']+' '+m.get('ImageDescription',{}).get('value',''),re.I): continue
            candidates.append({'title':p['title'],'url':info.get('thumburl') or info.get('url'),'sourcePage':info.get('descriptionurl'),'license':lic,'artist':m.get('Artist',{}).get('value',''),'description':m.get('ImageDescription',{}).get('value',''),'credit':m.get('Credit',{}).get('value',''),'licenseUrl':m.get('LicenseUrl',{}).get('value',''),'metadata':m})
        return q,candidates
    except Exception as e: return q,{'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: results=dict(pool.map(fetch,queries))
out=root/'artifacts'/'image-review';out.mkdir(parents=True,exist_ok=True)
(out/'candidates.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({q:[x['title'] for x in c] if isinstance(c,list) else c for q,c in results.items()},ensure_ascii=False,indent=2))
