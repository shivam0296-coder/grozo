import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,sep,extname} from 'node:path';
const root=resolve('apps/web/dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
createServer((req,res)=>{const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/qa'){res.setHeader('Content-Type','text/html');return res.end(`<!doctype html><html><head><title>GROZO responsive QA</title></head><body style="margin:0;background:#e8e9e5;font:14px system-ui"><label style="display:block;padding:12px">Viewport width <select id="width" onchange="document.querySelector('iframe').style.width=this.value+'px'"><option>375</option><option>390</option><option>768</option><option>1440</option></select></label><iframe title="GROZO responsive viewport" src="/grozo/" style="width:375px;height:900px;border:0;background:white"></iframe></body></html>`);}
 if(!url.pathname.startsWith('/grozo/')){res.writeHead(404);return res.end();}
 let file=resolve(root,decodeURIComponent(url.pathname.slice(7)||'index.html'));if(!file.startsWith(root+sep)){res.writeHead(400);return res.end();}
 try{if(!statSync(file).isFile())throw Error();res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(readFileSync(file));}catch{res.writeHead(404);res.end();}
}).listen(4175,'127.0.0.1',()=>console.log('GROZO Pages-path QA: http://127.0.0.1:4175/grozo/ and /qa'));
