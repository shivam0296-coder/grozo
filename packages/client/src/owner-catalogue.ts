import imported from '../../catalogue/imported.json' with {type:'json'};
import media from '../../catalogue/media.json' with {type:'json'};
import type {Product,CategoryRecord,Workspace} from './types.ts';
export const OWNER_CATALOGUE_VERSION=imported.version;
export const ownerCatalogue=imported;
export function descendants(categories:CategoryRecord[],parent:string):Set<string>{const result=new Set([parent]);let changed=true;while(changed){changed=false;for(const c of categories)if(c.parentId&&result.has(c.parentId)&&!result.has(c.id)){result.add(c.id);changed=true;}}return result;}
export function categoryPath(categories:CategoryRecord[],id?:string):string{const parts:string[]=[],seen=new Set<string>();while(id&&!seen.has(id)){seen.add(id);const c=categories.find(c=>c.id===id);if(!c)break;parts.unshift(c.name);id=c.parentId||undefined;}return parts.join(' / ');}
export function mergeOwnerCatalogue(state:Workspace):Workspace{
 const next=structuredClone(state);
 for(const p of imported.products){if(!next.products.some(x=>x.id===p.id)){const photo=media.images.find(x=>x.productId===p.id);next.products.push({...p,brandId:p.brandId||undefined,...(photo?{publishedImage:photo}: {})} as Product);}else{const existing=next.products.find(x=>x.id===p.id)!;const photo=media.images.find(x=>x.productId===p.id);if(photo&&!existing.image)existing.publishedImage=photo;}}
 for(const c of imported.categories)if(!next.categoryRecords.some(x=>x.id===c.id))next.categoryRecords.push(c as CategoryRecord);
 for(const b of imported.brands)if(!next.brandRecords.some(x=>x.id===b.id))next.brandRecords.push(b);
 next.catalogueVersion=OWNER_CATALOGUE_VERSION;return next;
}
