import React,{useEffect,useState} from 'react';
import {ImageOff} from 'lucide-react';
import type {Product,ProductImage} from '../../client/src/types.ts';
const bundledPhotos=import.meta.glob('../../../assets/products/*.webp',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const photoUrl=(name:string)=>Object.entries(bundledPhotos).find(([path])=>path.endsWith('/'+name))?.[1]||'';
type MediaAsset={key:string;thumbnail:Blob;detail:Blob};
function openMedia():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open('grozo-catalogue-media',1);request.onupgradeneeded=()=>request.result.createObjectStore('images',{keyPath:'key'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Image storage is unavailable.'));});}
export async function readMedia(key:string):Promise<MediaAsset|undefined>{const db=await openMedia();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const r=tx.objectStore('images').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}}
async function storeMedia(record:MediaAsset){const db=await openMedia();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put(record);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(Error('Image storage quota exceeded. The product was not changed.'));tx.onabort=()=>reject(Error('Image storage aborted.'));});}finally{db.close();}}
export async function prepareImage(file:File,sourceUrl:string,rights:string):Promise<ProductImage>{
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10_000_000)throw Error('Choose a PNG, JPEG or WebP up to 10 MB.');
 if(!rights.trim()||(!sourceUrl.startsWith('https://')&&sourceUrl!=='owner-upload'))throw Error('Record an HTTPS source or owner-upload and the permission/license basis.');
 const image=await createImageBitmap(file);
 try{
 if(image.width*image.height>40_000_000||Math.min(image.width,image.height)<100)throw Error('Image must be at least 100 px per side and at most 40 megapixels.');
 const resize=async(max:number,quality:number)=>{const scale=Math.min(1,max/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image conversion unavailable.');ctx.drawImage(image,0,0,canvas.width,canvas.height);return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Image conversion failed.')),'image/webp',quality));};
 const thumbnail=await resize(360,.8),detail=await resize(1200,.85);
 if(thumbnail.size+detail.size>2_000_000)throw Error('Optimized image exceeds 2 MB. Use a smaller photograph.');
 const key=crypto.randomUUID();await storeMedia({key,thumbnail,detail});
 return {key,sourceUrl,rights: rights.trim(),status:'pending_review',originalName:file.name,width:image.width,height:image.height};
 }finally{image.close();}
}
export function ProductPhoto({product,large=false,className=''}:{product:Product;large?:boolean;className?:string}){
 const [url,setUrl]=useState('');const [failed,setFailed]=useState(false);
 useEffect(()=>{let disposed=false,objectUrl='';setUrl('');setFailed(false);
 if(product.publishedImage&&!product.image){setUrl(photoUrl(large?product.publishedImage.file:product.publishedImage.thumbnail));}
 else if(product.image?.status==='owner_reviewed')readMedia(product.image.key).then(asset=>{if(!disposed&&asset){objectUrl=URL.createObjectURL(large?asset.detail:asset.thumbnail);setUrl(objectUrl);}}).catch(()=>setFailed(true));
 return()=>{disposed=true;if(objectUrl)URL.revokeObjectURL(objectUrl);};
 },[product.image?.key,product.image?.status,product.publishedImage?.file,large]);
 return <span className={'catalogue-photo '+className}>{url&&!failed?<img src={url} alt={[product.name,product.brand,product.quantityLabel].filter(Boolean).join(' · ')} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<span className="photo-pending"><ImageOff size={large?34:23}/><span>Photo pending</span><small>{product.image?.status==='pending_review'?'Awaiting pack/source review':'Exact product image required'}</small></span>}</span>;
}
export async function downloadMediaArchive(products:Product[]){
 const images=[];for(const p of products)if(p.image){const media=await readMedia(p.image.key);if(media){const toBase64=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob);});images.push({productId:p.id,metadata:p.image,thumbnail:await toBase64(media.thumbnail),detail:await toBase64(media.detail)});}}
 return {format:'grozo-local-media-v1',developmentOnly:true,images};
}
