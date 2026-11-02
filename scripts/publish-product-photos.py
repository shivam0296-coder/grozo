import json,pathlib,hashlib,re,sys
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')
root=pathlib.Path(__file__).resolve().parents[1]
catalogue=json.loads((root/'packages/catalogue/imported.json').read_text(encoding='utf-8'))
download=json.loads((root/'artifacts/image-review/downloaded.json').read_text(encoding='utf-8'))
out=root/'assets/products';out.mkdir(parents=True,exist_ok=True)
images=[];rejected=[]
for record in download['images']:
    if record.get('status')!='awaiting_visual_review':continue
    if record['name']=='Carrot':
        rejected.append({'name':'Carrot','sourcePage':record['sourcePage'],'reason':'Photo orientation/composition unsuitable for a clear shopping card; retain pending.'});continue
    matches=[p for p in catalogue['products'] if p['name']==record['name']]
    if len(matches)!=1:raise ValueError('Image mapping must match exactly one source record: '+record['name'])
    p=matches[0];slug=re.sub('[^a-z0-9]+','-',record['name'].lower()).strip('-')
    image=Image.open(record['localFile']).convert('RGB')
    files={}
    for suffix,maxside in [('',1000),('.thumb',360)]:
        resized=image.copy();resized.thumbnail((maxside,maxside))
        path=out/(slug+suffix+'.webp');resized.save(path,'WEBP',quality=86,method=6)
        files['thumbnail' if suffix else 'file']=path.name
    images.append({'productId':p['id'],**files,'sourcePage':record['sourcePage'],'license':record['license'],'licenseUrl':record.get('licenseUrl') or 'https://creativecommons.org/publicdomain/mark/1.0/','artist':record['artist'],'reviewedAt':'2026-10-31','reviewNote':'Source license metadata and photograph visually checked for this generic produce entry. Not assigned to named cultivars, branded packs or a claimed merchant pack size.','sourceSha256':record['downloadSha256'],'fileSha256':hashlib.sha256((out/files['file']).read_bytes()).hexdigest(),'thumbnailSha256':hashlib.sha256((out/files['thumbnail']).read_bytes()).hexdigest()})
manifest={'version':'2026-10-31','images':images,'rejected':rejected,'downloadBytes':download['downloadBytes'],'notes':['Public-domain/CC0 photographs only. Original contributor/source links retained.','No competitor screenshot assets, generated packaging, or substitute photos for specific cultivars/brands.']}
(root/'packages/catalogue/media.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
notice='# Product photo sources\n\nReviewed 2026-10-31. Optimized WebP copies, resized/compressed without replacing product content. Original project license is unchanged.\n\n'
for im in images:notice+='- '+next(p['name'] for p in catalogue['products'] if p['id']==im['productId'])+': '+im['artist']+'; '+im['license']+'; '+im['sourcePage']+'\n'
(root/'docs/licenses/product-photography.txt').write_text(notice,encoding='utf-8')
print(json.dumps({'published':len(images),'pending':len(catalogue['products'])-len(images),'optimizedBytes':sum(p.stat().st_size for p in out.glob('*.webp')),'downloadBytes':download['downloadBytes'],'rejected':rejected},ensure_ascii=False,indent=2))
