import json,hashlib,pathlib,pdfplumber,subprocess,shutil,sys
sys.stdout.reconfigure(encoding="utf-8")
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'artifacts'/'pdf-review'
out.mkdir(parents=True,exist_ok=True)
sources=[]
for name in ['household_grocery_list.pdf','personal_care_and_protectors.pdf','vegetables_list.pdf','fruits_list.pdf']:
    path=pathlib.Path.home()/'Downloads'/name
    data=path.read_bytes()
    with pdfplumber.open(path) as pdf:
        pages=[{'page':i+1,'text':p.extract_text(layout=False) or '', 'width':p.width,'height':p.height,'images':len(p.images)} for i,p in enumerate(pdf.pages)]
    record={'file':name,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'pages':pages}
    sources.append(record)
    (out/(path.stem+'.txt')).write_text('\n\n'.join('--- PAGE '+str(p['page'])+' ---\n'+p['text'] for p in pages),encoding='utf-8')
    result=subprocess.run([shutil.which('pdftoppm'),'-r','90','-png',str(path),str(out/path.stem)],capture_output=True,text=True)
    if result.returncode: raise RuntimeError(result.stderr)
(out/'extraction.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(sources,ensure_ascii=False,indent=2))
