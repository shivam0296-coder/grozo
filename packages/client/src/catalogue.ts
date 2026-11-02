import {descendants,categoryPath,ownerCatalogue} from './owner-catalogue.ts';
import type {Product,CategoryRecord,BrandRecord} from './types.ts';
export const fold=(value:string)=>value.normalize('NFKC').toLocaleLowerCase('en-IN').trim().replace(/\s+/g,' ');
export const categoryId=(name:string)=>'cat-'+fold(name).replace(/[^a-z0-9]+/g,'-');
export function catalogueDefaults(products:Product[],names:string[]){
 return {categoryRecords:names.map(name=>({id:categoryId(name),name,parentId:null,active:true} as CategoryRecord)),
 brandRecords:[...new Set(products.map(p=>p.brand))].map((name,i)=>({id:'brand-legacy-'+i,name,active:true} as BrandRecord))};
}
export type ImportPreview={products:Product[];errors:{row:number;message:string}[];duplicates:{row:number;matches:string[]}[];rowCount:number};
export const CSV_COLUMNS=['id','variantId','name','brand','category','subcategory','quantityLabel','variant','pricePaise','mrpPaise','stock','categoryId','subcategoryId','brandId','active','description','ingredients','storageInfo'] as const;
export function parseCsv(text:string):string[][]{
 if(text.length>5_000_000)throw Error('CSV exceeds the 5 MB development import limit.');
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false;
 const input=text.replace(/^\uFEFF/,'');
 for(let i=0;i<input.length;i++){const c=input[i];
  if(quoted){if(c==='"'){if(input[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;}
  else if(c==='"'){if(cell||closed)throw Error('Unexpected quote in CSV.');quoted=true;}
  else if(c===','){row.push(cell);cell='';closed=false;}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&input[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v!==''))rows.push(row);row=[];cell='';closed=false;}
  else {if(closed)throw Error('Unexpected text after quoted CSV field.');cell+=c;}
  if(rows.length>25001)throw Error('Split CSV files into at most 25,000 rows per batch.');
 }
 if(quoted)throw Error('Unclosed quoted CSV field.');row.push(cell);if(row.some(v=>v!==''))rows.push(row);if(rows.length>25001)throw Error('Split CSV files into at most 25,000 rows per batch.');return rows;
}
const fingerprint=(p:Pick<Product,'name'|'brand'|'quantityLabel'|'variant'>)=>[p.name,p.brand,p.quantityLabel,p.variant||''].map(fold).join('|');
export function previewCsv(text:string,existing:Product[],categories:CategoryRecord[],brands:BrandRecord[]):ImportPreview{
 const rows=parseCsv(text);if(rows.length<2)throw Error('CSV needs a header and at least one product.');
 const header=rows.shift()!.map(v=>v.trim());if(new Set(header).size!==header.length)throw Error('Duplicate CSV headers.');
 const required=['name','brand','category','quantityLabel','pricePaise','mrpPaise','stock'];
 for(const key of required)if(!header.includes(key))throw Error('Missing CSV column: '+key);
 for(const key of header)if(!(CSV_COLUMNS as readonly string[]).includes(key))throw Error('Unknown CSV column: '+key);
 const out:ImportPreview={products:[],errors:[],duplicates:[],rowCount:rows.length};
 const ids=new Set(existing.map(p=>p.id)),variants=new Set(existing.map(p=>p.variantId));
 const seen=new Map<string,string[]>();for(const p of existing)seen.set(fingerprint(p),[...(seen.get(fingerprint(p))||[]),p.id]);
 rows.forEach((cells,index)=>{const row=index+2;
  try{
   if(cells.length!==header.length)throw Error('Column count differs from header.');
   const r=Object.fromEntries(header.map((key,i)=>[key,cells[i].trim()]));
   for(const key of required)if(!r[key])throw Error('Missing '+key);
   for(const key of ['pricePaise','mrpPaise','stock'])if(!/^\d+$/.test(r[key])||!Number.isSafeInteger(Number(r[key])))throw Error(key+' must be a non-negative whole number.');
   if(Number(r.pricePaise)<=0||Number(r.mrpPaise)<Number(r.pricePaise))throw Error('Selling price must be positive and at most MRP.');
   if(r.active && !['true','false'].includes(r.active))throw Error('active must be true or false.');
   const categoryMatches=categories.filter(c=>!c.parentId&&c.active&&fold(c.name)===fold(r.category));if(!r.categoryId&&categoryMatches.length>1)throw Error('Category name is ambiguous; provide categoryId.');const cat=r.categoryId?categories.find(c=>c.id===r.categoryId&&!c.parentId&&c.active):categoryMatches[0];if(!cat)throw Error('Unknown or inactive root category: '+r.category);
   const branch=descendants(categories,cat.id);const sub=r.subcategoryId?categories.find(c=>c.id===r.subcategoryId&&branch.has(c.id)&&c.active):r.subcategory?categories.find(c=>c.id!==cat.id&&branch.has(c.id)&&c.active&&(fold(c.name)===fold(r.subcategory)||fold(categoryPath(categories,c.id))===fold(r.subcategory))):undefined;
   if((r.subcategory||r.subcategoryId)&&!sub)throw Error('Subcategory does not belong to selected category.');
   const brand=brands.find(b=>b.active&&(r.brandId?b.id===r.brandId:fold(b.name)===fold(r.brand)));if(!brand)throw Error('Unknown or inactive brand: '+r.brand);
   const id=r.id||crypto.randomUUID(),variantId=r.variantId||crypto.randomUUID();
   if(ids.has(id)||variants.has(variantId))throw Error('ID already exists; bulk import only adds records. Edit existing products separately.');
   ids.add(id);variants.add(variantId);
   const p:Product={id,variantId,name:r.name,brand:brand.name,brandId:brand.id,category:cat.name,categoryId:cat.id,subcategoryId:sub?.id,quantityLabel:r.quantityLabel,variant:r.variant||'',pricePaise:Number(r.pricePaise),mrpPaise:Number(r.mrpPaise),stock:Number(r.stock),active:r.active!=='false',description:r.description||'',ingredients:r.ingredients||'',storageInfo:r.storageInfo||'',art:'',taxRateBps:0,dataSource:'owner-csv'};
   const key=fingerprint(p),matches=seen.get(key);if(matches?.length)out.duplicates.push({row,matches:[...matches]});seen.set(key,[...(matches||[]),id]);out.products.push(p);
  }catch(e){out.errors.push({row,message:(e as Error).message});}
 });return out;
}
export function csvExport(products:Product[],categories:CategoryRecord[]):string{
 const protect=(value:string)=>/^[=+@\-\t\r]/.test(value)?"'"+value:value;
 const lines=[CSV_COLUMNS.join(',')];
 for(const p of products){const r={...p,subcategory:categories.find(c=>c.id===p.subcategoryId)?.name||''};lines.push(CSV_COLUMNS.map(k=>'"'+protect(String(r[k as keyof typeof r]??'')).replaceAll('"','""')+'"').join(','));}
 return '\uFEFF'+lines.join('\r\n');
}
export function catalogueReport(products:Product[],categories:CategoryRecord[]){
 const duplicates:{ids:string[];key:string}[]=[];const seen=new Map<string,string[]>();
 for(const p of products){const key=fingerprint(p);seen.set(key,[...(seen.get(key)||[]),p.id]);}
 for(const [key,ids]of seen)if(ids.length>1)duplicates.push({ids,key});
 const owner=products.filter(p=>p.sourceRow);return {sourceStatus:owner.length?'IMPORTED_WITH_PENDING_MERCHANT_DETAILS':'DEMO_WORKSPACE_ONLY',pdfProducts:owner.length?ownerCatalogue.products.length:null,importedFromPdf:owner.length,developmentProducts:products.filter(p=>!p.sourceRow).length,categoryCount:categories.filter(c=>!c.parentId).length,subcategoryCount:categories.filter(c=>c.parentId).length,duplicates,
 missingImages:products.filter(p=>!p.publishedImage&&(!p.image||p.image.status!=='owner_reviewed')).map(p=>({id:p.id,name:p.name,pack:p.quantityLabel,status:p.image?.status||'pending'})),
 mappingErrors:products.filter(p=>p.categoryId&&!categories.some(c=>c.id===p.categoryId)).map(p=>p.id)};
}
export type CatalogueSort='relevance'|'price-asc'|'price-desc'|'popularity';
export function searchIndex(products:Product[]){return new Map(products.map(p=>[p.id,fold([p.name,p.brand,p.category,p.quantityLabel,p.variant||'',p.description,p.sourceRow?.rawText||''].join(' '))]));}
export function filterCatalogue(products:Product[],index:Map<string,string>,options:{query:string;category:string;subcategory:string;brand:string;maxPrice:number;inStock:boolean;sort:CatalogueSort;popularity:Map<string,number>}){
 const tokens=fold(options.query).split(' ').filter(Boolean);
 return products.filter(p=>p.active&&(options.category==='All'||p.category===options.category)&&(!options.subcategory||p.subcategoryId===options.subcategory)&&(!options.brand||p.brand===options.brand)&&(options.maxPrice>=100000000||p.pricingStatus!=='pending')&&p.pricePaise<=options.maxPrice&&(!options.inStock||p.stock>0)&&tokens.every(t=>index.get(p.id)?.includes(t))).sort((a,b)=>options.sort==='price-asc'?a.pricePaise-b.pricePaise:options.sort==='price-desc'?b.pricePaise-a.pricePaise:options.sort==='popularity'?(options.popularity.get(b.variantId)||0)-(options.popularity.get(a.variantId)||0):Number(fold(b.name).startsWith(fold(options.query)))-Number(fold(a.name).startsWith(fold(options.query))));
}
