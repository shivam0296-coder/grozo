import json,re,uuid,hashlib,pathlib,sys,unicodedata
sys.stdout.reconfigure(encoding='utf-8')
ROOT=pathlib.Path(__file__).resolve().parents[1]
sources=json.loads((ROOT/'artifacts/pdf-review/extraction.json').read_text(encoding='utf-8'))
NS=uuid.UUID('49b05025-6379-4e42-831b-530ca98a57c1')
uid=lambda key:str(uuid.uuid5(NS,key))
ROOT_NAMES={'household_grocery_list.pdf':'Household Grocery','personal_care_and_protectors.pdf':'Personal Care & Home Protection','vegetables_list.pdf':'Vegetables','fruits_list.pdf':'Fruits'}
brands=['Scalpe Pro','Head & Shoulders','Clinic Plus','Wow Skin Science',"L'Oreal Paris",'Clean & Clear','Godrej No.1','Godrej Aer','Godrej Protekt','Nivea Men','Old Spice','Oral-B','Surf Excel','Good Knight','All Out','Air Wick','Ambi Pur','Big Blue','Mee Mee','Set Wet','Pudin Hara','Dettol','Lifebuoy','Dove','Pears','Fiama','Lux','Santoor','Cinthol','Himalaya','Pantene','Sunsilk','Tresemme','Biotique','Garnier','Palmolive','Colgate','Sensodyne','Close-Up','Pepsodent','Dabur','Ariel','Tide','Rin','Wheel','Genteel','Comfort','Vanish','Ala','Lizol','Harpic','Domex','Nimyle','Vim','Pril','Exo','Colin','Hit','Mortein','Odomos','Baygon','Laxmanrekha','Odonil','Origami','Selpak','Gillette','Beardo','Volini','Moov','Iodex','Zandu','Vicks','Eno','Pampers',"Johnson's",'Duracell','Portronics']
categories=[]; rows=[]; products=[]; document_reports=[]
def english(value):
    # Preserve original English wording; raw bilingual extraction remains in sourceRow.
    return re.sub(r'\([^)]*\)','',value).strip()
def split_items(value):
    return [x.strip() for x in re.split(r',(?![^()]*\))',value) if x.strip()]
def add_category(name,parent,doc,page,raw):
    ident=uid('category|'+doc+'|'+str(parent)+'|'+name)
    if not any(c['id']==ident for c in categories):categories.append({'id':ident,'name':name,'parentId':parent,'active':True,'sourceDocument':doc,'sourcePage':page,'rawHeading':raw})
    return ident
def emit(raw,doc,page,rootid,sectionid,leafid,path,ordinal,lines):
    name=english(raw)
    brand=next((b for b in brands if name==b or name.startswith(b+' ')), '')
    # Slash alternatives are retained as written, not guessed as separate purchasable packs.
    if '/' in name:brand=''
    ident=uid('entry|'+doc+'|'+str(ordinal))
    source={'file':doc,'page':page,'entry':ordinal,'sectionPath':path,'rawText':raw,'lineRange':lines}
    row={'id':ident,'name':name,'source':source,'groupedAlternative':'/' in name}
    rows.append(row)
    products.append({'id':ident,'variantId':uid('draft-variant|'+ident),'name':name,'quantityLabel':'','category':ROOT_NAMES[doc],'categoryId':rootid,'subcategoryId':leafid,'brand':brand,'brandId':uid('brand|'+brand) if brand else None,'variant':'','pricePaise':0,'mrpPaise':0,'stock':0,'active':True,'taxRateBps':0,'art':'','description':'','dataSource':'owner-pdf','pricingStatus':'pending','sourceRow':source,'sourceSectionId':sectionid,'reviewFlags':(['grouped_alternatives_or_aliases'] if '/' in name else [])+['pack_price_stock_not_supplied']})
for source in sources:
    doc=source['file']; rootid=add_category(ROOT_NAMES[doc],None,doc,1,source['pages'][0]['text'].splitlines()[0])
    section=None;sectionid=None;leafid=None; group=None; buffer=[];first_page=1;startline=0;ordinal=0
    isnumbered=doc in ['fruits_list.pdf','vegetables_list.pdf']
    def flush():
        global buffer,ordinal
        if not buffer:return
        text=' '.join(x[2] for x in buffer)
        for raw in split_items(text):
            ordinal+=1;emit(raw,doc,buffer[0][0],rootid,sectionid,leafid,[ROOT_NAMES[doc],section]+([group] if group else []),ordinal,[buffer[0][1],buffer[-1][1]])
        buffer=[]
    for page in source['pages']:
        lines=page['text'].splitlines();i=0
        while i<len(lines):
            line=lines[i].strip();line_no=i+1
            if line.startswith('*') or line.startswith('मिलने वाले') or line.startswith('मिलने वाले फलों'):i+=1;continue
            numbered=re.match(r'^(\d+)\.\s+(.*)',line)
            if numbered:
                number=int(numbered[1]);body=numbered[2]
                isheading=bool(re.match(r'[\u0900-\u097F]',body))
                if isheading:
                    flush();heading=body
                    while heading.count('(')>heading.count(')') and i+1<len(lines):i+=1;heading+=' '+lines[i].strip()
                    # The source gives two Hindi-only headings in vegetables and one in fruits.
                    en=re.findall(r'\(([^()]*)\)',heading)
                    section=next((x for x in reversed(en) if re.search(r'[A-Za-z]',x)),None) or heading
                    sectionid=add_category(section,rootid,doc,page['page'],heading);leafid=sectionid;group=None
                elif isnumbered:
                    ordinal+=1;emit(body,doc,page['page'],rootid,sectionid,leafid,[ROOT_NAMES[doc],section],ordinal,[line_no,line_no])
                else:buffer.append((page['page'],line_no,line))
            elif section:
                if not isnumbered and ':' in line and re.match(r'^[A-Za-z]',line):
                    flush();group,rest=line.split(':',1);group=group.strip();leafid=add_category(group,sectionid,doc,page['page'],group);buffer=[(page['page'],line_no,rest.strip())]
                elif not isnumbered and line:buffer.append((page['page'],line_no,line))
            i+=1
    flush()
    document_reports.append({k:source[k] for k in ['file','sha256','bytes']}|{'pages':len(source['pages']),'sourceEntries':ordinal,'importedEntries':ordinal,'pageEntryCounts':{str(p['page']):sum(r['source']['file']==doc and r['source']['page']==p['page'] for r in rows) for p in source['pages']}})
result={'source':'OWNER_SUPPLIED_PDF_CATALOGUE','version':'2026-10-31-v1','documents':document_reports,'categories':categories,'brands':[{'id':uid('brand|'+b),'name':b,'active':True} for b in sorted(set(p['brand'] for p in products if p['brand']))],'sourceRows':rows,'products':products}
assert sum(d['sourceEntries'] for d in document_reports)==len(products)==len(rows)
assert len({p['id'] for p in products})==len(products)
out=ROOT/'packages/catalogue';out.mkdir(parents=True,exist_ok=True)
(out/'imported.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'documents':document_reports,'total':len(products),'categories':len(categories),'maxDepth':3,'brands':len(result['brands']),'groupedAlternatives':sum(r['groupedAlternative'] for r in rows)},ensure_ascii=False,indent=2))
