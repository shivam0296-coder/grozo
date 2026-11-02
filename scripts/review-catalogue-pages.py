from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
root=Path(__file__).resolve().parents[1]/'artifacts'/'pdf-review'
for prefix in ['household_grocery_list','personal_care_and_protectors','vegetables_list','fruits_list']:
    pages=sorted(root.glob(prefix+'-*.png'))
    thumbs=[]
    for p in pages:
        im=Image.open(p).convert('RGB')
        im.thumbnail((700,1000))
        page=Image.new('RGB',(720,1030),'#dddddd')
        page.paste(im,((720-im.width)//2,25))
        ImageDraw.Draw(page).text((10,8),p.name,fill='black')
        thumbs.append(page)
    cols=2; rows=(len(thumbs)+cols-1)//cols
    sheet=Image.new('RGB',(cols*720,rows*1030),'#aaaaaa')
    for i,im in enumerate(thumbs): sheet.paste(im,((i%cols)*720,(i//cols)*1030))
    sheet.save(root/(prefix+'-review.png'))
