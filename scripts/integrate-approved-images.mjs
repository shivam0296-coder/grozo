import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const library=resolve(process.argv[2]||'../GROZO_PRODUCT_IMAGE_LIBRARY');
const manifest=JSON.parse(readFileSync(resolve(library,'Reports/product-image-manifest.json'),'utf8'));
const catalogue=JSON.parse(readFileSync(resolve(root,'packages/catalogue/imported.json'),'utf8'));
const photos=new Map(manifest.images.map(x=>[x.productId,x]));
const images=[];
for(const [id,canonical] of Object.entries(manifest.productMappings)){
 const p=catalogue.products.find(p=>p.id===id),photo=photos.get(canonical);
 if(!p||!photo||photo.verificationStatus!=='VERIFIED_LISTED_LOOSE_PRODUCE')throw Error('Unverified or unknown mapping: '+id);
 const files={};
 for(const [kind,suffix] of [['detail','.webp'],['thumbnail','.thumb.webp']]){
  const source=resolve(library,photo[kind].path);
  if(!source.startsWith(library+sep))throw Error('Image path escapes library');
  const hash=createHash('sha256').update(readFileSync(source)).digest('hex');
  if(hash!==photo[kind].sha256)throw Error('Image integrity failed: '+source);
  const name='approved-'+canonical+suffix;copyFileSync(source,resolve(root,'assets/products',name));files[kind]=name;
 }
 if(/CC BY/.test(photo.license)&&!photo.artist)throw Error('Attribution missing: '+photo.name);
 images.push({productId:id,canonicalProductId:canonical,file:files.detail,thumbnail:files.thumbnail,sourcePage:photo.sourcePage,license:photo.license,licenseUrl:photo.licenseUrl,artist:photo.artist||'Creator not supplied (public-domain source)',credit:photo.credit,reviewedAt:photo.reviewedAt,reviewNote:photo.reviewNote,modifications:photo.modifications,sourceSha256:photo.originalDownload.sha256,fileSha256:photo.detail.sha256,thumbnailSha256:photo.thumbnail.sha256});
}
if(images.length!==104||new Set(images.map(x=>x.file)).size!==103)throw Error('Unexpected approved image coverage');
writeFileSync(resolve(root,'packages/catalogue/media.json'),JSON.stringify({version:'2026-11-01',images},null,2)+'\n');
mkdirSync(resolve(root,'reports/final-build'),{recursive:true});
for(const file of ['GROZO_PRODUCT_IMAGE_MAPPING.csv','GROZO_MISSING_PRODUCT_IMAGES.csv','GROZO_MANUAL_VERIFICATION_AND_LICENSING.csv','GROZO_MASTER_PRODUCT_LIST.csv'])copyFileSync(resolve(library,file),resolve(root,'reports/final-build',file));
copyFileSync(resolve(library,'LICENSE_AND_ATTRIBUTION.md'),resolve(root,'assets/products/APPROVED_LIBRARY_ATTRIBUTION.md'));
writeFileSync(resolve(root,'reports/final-build/image-integration.json'),JSON.stringify({date:'2026-11-01',catalogueEntries:390,mappedEntries:104,uniquePhotoSets:103,missingEntries:286,sharedMappings:manifest.intentionalSharedMappings,checkedSourceHashes:true,source:'GROZO_PRODUCT_IMAGE_LIBRARY/Reports/product-image-manifest.json'},null,2)+'\n');
console.log('Integrated 104 mappings / 103 photo sets; hashes checked; 286 remain pending.');
