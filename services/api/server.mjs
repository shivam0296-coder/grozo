import {createServer} from 'node:http';
import {readFileSync,createReadStream,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../../',import.meta.url));
const catalogue=JSON.parse(readFileSync(resolve(root,'packages/catalogue/imported.json'),'utf8'));
const media=JSON.parse(readFileSync(resolve(root,'packages/catalogue/media.json'),'utf8'));
const mapped=new Map(media.images.map(x=>[x.productId,x]));
export const publicCatalogue={...catalogue,products:catalogue.products.map(p=>({...p,...(mapped.has(p.id)?{publishedImage:mapped.get(p.id)}:{})})),capabilities:{catalogue:true,authentication:false,cart:false,orders:false,tracking:false,database:false},maturity:'READ_ONLY_CATALOGUE_TESTING'};
const photoFiles=new Set(media.images.flatMap(x=>[x.file,x.thumbnail]));
export function configFromEnv(env=process.env){
 const port=Number(env.API_PORT||4000),host=env.API_HOST||'127.0.0.1';
 if(!Number.isSafeInteger(port)||port<1||port>65535)throw Error('API_PORT must be 1..65535');
 if(!['127.0.0.1','0.0.0.0','::1'].includes(host))throw Error('API_HOST must be a literal supported bind address');
 const origins=(env.CUSTOMER_WEB_ORIGIN||'http://localhost:5173,http://localhost:4173').split(',').map(x=>x.trim()).filter(Boolean);
 for(const origin of origins){const u=new URL(origin);if(u.origin!==origin||!['https:','http:'].includes(u.protocol))throw Error('CORS origins must be exact HTTP(S) origins');if(u.protocol==='http:'&&!['localhost','127.0.0.1'].includes(u.hostname))throw Error('Remote CORS origins require HTTPS');}
 return {host,port,origins};
}
export function createCatalogueServer({origins=['http://localhost:5173','http://localhost:4173']}={}){
 const server=createServer((req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));};
  if(req.headers.origin){if(!origins.includes(req.headers.origin))return json(403,{code:'ORIGIN_DENIED',message:'Origin is not configured.'});res.setHeader('Access-Control-Allow-Origin',req.headers.origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Credentials','true');}
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Methods':'GET, HEAD, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'});return res.end();}
  let url;try{url=new URL(req.url,'http://localhost');}catch{return json(400,{code:'INVALID_REQUEST',message:'Invalid URL'});}
  const path=url.pathname;
  if(/^\/api\/v1\/(auth|cart|addresses|checkout|orders|riders|admin|payments|notifications)(\/|$)/.test(path))return json(503,{code:'NOT_IMPLEMENTED',message:'Persistent authenticated commerce is not implemented. No synthetic success response is substituted.'});
  if(!['GET','HEAD'].includes(req.method))return json(405,{code:'METHOD_NOT_ALLOWED',message:'This service exposes read-only catalogue endpoints.'});
  if(path==='/health')return json(200,{status:'ok',service:'grozo-catalogue',maturity:'READ_ONLY_CATALOGUE_TESTING',database:'NOT_CONFIGURED',ordering:false});
  if(path==='/api/v1/capabilities')return json(200,publicCatalogue.capabilities);
  if(path==='/api/v1/catalogue')return json(200,publicCatalogue);
  if(path==='/api/v1/categories')return json(200,catalogue.categories.map(c=>({...c,slug:c.id})));
  if(path==='/api/v1/products'){
   const cursor=Number(url.searchParams.get('cursor')||0),limit=Number(url.searchParams.get('limit')||24),q=(url.searchParams.get('q')||'').trim().toLowerCase(),category=url.searchParams.get('categoryId');
   if(!Number.isSafeInteger(cursor)||cursor<0||!Number.isSafeInteger(limit)||limit<1||limit>100||q.length>120)return json(400,{code:'INVALID_QUERY',message:'Use a non-negative cursor, limit 1..100 and query up to 120 characters.'});
   const rows=publicCatalogue.products.filter(p=>(!q||(p.name+' '+p.brand+' '+p.category).toLowerCase().includes(q))&&(!category||p.categoryId===category||p.subcategoryId===category));
   return json(200,{items:rows.slice(cursor,cursor+limit).map(p=>({...p,brandName:p.brand||null,imageUrl:p.publishedImage?'/api/v1/media/'+p.publishedImage.thumbnail:null,variants:[]})),nextCursor:cursor+limit<rows.length?String(cursor+limit):null,total:rows.length,pricingStatus:'pending',orderingEnabled:false});
  }
  if(path.startsWith('/api/v1/media/')){
   const file=path.slice('/api/v1/media/'.length);if(!photoFiles.has(file))return json(404,{code:'NOT_FOUND',message:'Approved image not found'});
   const imagePath=resolve(root,'assets/products',file),hash='"'+createHash('sha256').update(readFileSync(imagePath)).digest('hex')+'"';
   res.setHeader('ETag',hash);res.setHeader('Cache-Control','public, max-age=3600');
   if(req.headers['if-none-match']===hash){res.writeHead(304);return res.end();}
   res.writeHead(200,{'Content-Type':'image/webp','Content-Length':statSync(imagePath).size});if(req.method==='HEAD')return res.end();return createReadStream(imagePath).pipe(res);
  }
  return json(404,{code:'NOT_FOUND',message:'Unknown API endpoint'});
 });
 server.requestTimeout=15000;server.headersTimeout=10000;server.keepAliveTimeout=5000;server.maxConnections=100;
 return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const config=configFromEnv(),server=createCatalogueServer(config);server.listen(config.port,config.host,()=>console.log(`GROZO read-only catalogue API http://${config.host}:${config.port} — no authentication, database or ordering.`));
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),5000).unref();});
}
