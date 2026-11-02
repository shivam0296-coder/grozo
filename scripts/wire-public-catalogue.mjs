import {readFileSync,writeFileSync} from 'node:fs';
const f='apps/web/src/main.tsx';let s=readFileSync(f,'utf8');s="import {PublicCatalogue} from './public-catalogue.tsx';\n"+s;s=s.replace("MODE==='live'?<LiveGate/>","MODE==='catalogue'?<PublicCatalogue/>:MODE==='live'?<LiveGate/>");writeFileSync(f,s);
