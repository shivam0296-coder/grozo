import pathlib,json,hashlib,zipfile,sys,datetime
ROOT=pathlib.Path(__file__).resolve().parents[1];LIB=ROOT.parent/"GROZO_PRODUCT_IMAGE_LIBRARY"
target=LIB.parent/"GROZO_PRODUCT_IMAGE_LIBRARY.zip"
if target.exists():raise FileExistsError("Existing ZIP preserved; choose a new output path before packaging.")
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
manifest_path=LIB/"Reports/library-file-manifest.json"
records=[]
for p in sorted(LIB.rglob("*")):
 if p.is_symlink():raise ValueError("Unexpected symlink")
 if p.is_file() and p!=manifest_path:records.append({"path":p.relative_to(LIB).as_posix(),"bytes":p.stat().st_size,"sha256":sha(p)})
manifest_path.write_text(json.dumps({"scope":"All library files except this self-describing manifest; the external ZIP manifest includes it as well.","files":records},ensure_ascii=False,indent=2),encoding="utf-8")
files=sorted(p for p in LIB.rglob("*") if p.is_file())
dirs=sorted(p for p in LIB.rglob("*") if p.is_dir())
with zipfile.ZipFile(target,"x",compression=zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
 archive.writestr(LIB.name+"/","")
 for folder in dirs:archive.writestr(LIB.name+"/"+folder.relative_to(LIB).as_posix()+"/","")
 for p in files:archive.write(p,LIB.name+"/"+p.relative_to(LIB).as_posix())
verified=[]
with zipfile.ZipFile(target) as archive:
 expected={LIB.name+"/"+p.relative_to(LIB).as_posix() for p in files}
 actual={e.filename for e in archive.infolist() if not e.is_dir()}
 if actual!=expected:raise ValueError("Archive file set mismatch")
 for entry in archive.infolist():
  if entry.is_dir():continue
  name=entry.filename.removeprefix(LIB.name+"/");source=LIB/name
  checksum=hashlib.sha256(archive.read(entry)).hexdigest()
  if checksum!=sha(source):raise ValueError("Archive hash mismatch: "+name)
  verified.append({"path":name,"bytes":entry.file_size,"sha256":checksum})
 bad=archive.testzip()
 if bad:raise ValueError("ZIP CRC failed: "+bad)
digest=sha(target)
pathlib.Path(str(target)+".sha256.txt").write_text(digest+"  "+target.name+"\n",encoding="ascii")
pathlib.Path(str(target)+".manifest.json").write_text(json.dumps({"date":"2026-10-31","zip":target.name,"bytes":target.stat().st_size,"sha256":digest,"verifiedFiles":len(verified),"verifiedDirectories":len(dirs)+1,"files":verified},ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"path":str(target),"bytes":target.stat().st_size,"sha256":digest,"verifiedFiles":len(verified),"verifiedDirectories":len(dirs)+1},indent=2))
