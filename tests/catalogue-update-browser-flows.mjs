const visible=async(r,name,l)=>{await l.waitFor({state:'visible'});if(!await l.isVisible())throw Error(name);r.push({test:name,result:'passed'});};
const check=(r,name,value)=>{if(!value)throw Error(name);r.push({test:name,result:'passed'});};
export async function sourceCatalogueFlows({customer:p,setViewport,saveScreenshot}){
 const r=[];await setViewport({width:1440,height:1000});await p.goto('http://127.0.0.1:5173/#/shop');
 await p.getByRole('combobox',{name:'Catalogue view',exact:true}).selectOption('source');
 await visible(r,'All 390 PDF entries are browseable',p.getByText('390 source entries · missing sales details are labelled',{exact:true}));
 check(r,'Only four source root categories shown',await p.locator('.market-aisles button').count()===5);
 await visible(r,'Catalogue paginated into 17 pages',p.getByText('Page 1 of 17',{exact:true}));
 check(r,'Unknown merchant fields cannot add to basket',!await p.locator('.pending-add').first().isEnabled());
 check(r,'Unknown price does not appear as free',!(await p.locator('.market-grid').innerText()).includes('₹0.00'));
 await p.getByRole('button',{name:'Personal Care & Home Protection',exact:true}).click();
 await visible(r,'All 88 personal care entries retained',p.getByText('88 source entries · missing sales details are labelled',{exact:true}));
 await p.getByRole('combobox',{name:'Brand',exact:true}).selectOption('Dove');
 await visible(r,'Source brand filter returns both Dove entries',p.getByText('2 source entries · missing sales details are labelled',{exact:true}));
 await p.getByRole('combobox',{name:'Subcategory',exact:true}).selectOption({label:'Personal Hygiene & Bathing / Bathing Soaps'});
 await visible(r,'Three-level source hierarchy filters correctly',p.getByText('1 source entries · missing sales details are labelled',{exact:true}));
 await p.getByRole('combobox',{name:'Maximum price',exact:true}).selectOption('10000');
 await visible(r,'Unpriced source entries excluded from price filter',p.getByRole('heading',{name:'No matching essentials',exact:true}));
 await p.getByRole('button',{name:'Clear filters',exact:true}).click();
 await p.getByRole('checkbox',{name:'In stock',exact:true}).check();
 await visible(r,'Unknown source stock excluded from in-stock filter',p.getByRole('heading',{name:'No matching essentials',exact:true}));
 await p.getByRole('button',{name:'Clear filters',exact:true}).click();
 await p.getByRole('textbox',{name:'Search products',exact:true}).fill('Mango');
 await visible(r,'All matching source names remain searchable',p.getByText('9 source entries · missing sales details are labelled',{exact:true}));
 await p.getByRole('button',{name:'View Mango',exact:true}).click();
 await visible(r,'Real photograph with visible item identity',p.getByRole('img',{name:'Mango',exact:true}).first());
 await visible(r,'PDF page provenance visible in details',p.getByText(/fruits_list.pdf · page 1 · entry 1/));
 const img=await p.evaluate(()=>{const n=document.querySelector('.market-detail-grid img');return n&&{loaded:n.complete&&n.naturalWidth>0,source:n.getAttribute('src')};});
 check(r,'Reviewed local product photograph loads',Boolean(img?.loaded&&img?.source?.includes('.webp')));
 await saveScreenshot(p,'source-product-detail.png');
 await p.getByRole('textbox',{name:'Search products',exact:true}).fill('Royal Gala Apple');
 await p.getByRole('button',{name:'View Royal Gala Apple',exact:true}).click();
 await visible(r,'Named cultivar does not borrow generic Apple photograph',p.getByText('Exact product photograph pending. No substitute image is displayed.',{exact:true}));
 await p.getByRole('link',{name:'Discover',exact:true}).click();
 await p.getByRole('textbox',{name:'Search products',exact:true}).fill('');
 await saveScreenshot(p,'source-home-desktop.png');
 const photos=await p.evaluate(()=>Array.from(document.querySelectorAll('img')).filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>({alt:i.alt,loaded:i.complete&&i.naturalWidth>0})));
 check(r,'Visible source homepage photos load',photos.length>0&&photos.every(i=>i.loaded));
 await p.getByRole('button',{name:/Green Peas Pods and Beans 10 entries/}).click();
 await visible(r,'Category tile retains selected leaf on navigation',p.getByText('10 source entries · missing sales details are labelled',{exact:true}));
 for(const [width,height,label] of [[768,1024,'tablet'],[390,844,'phone']]){
  await setViewport({width,height});const size=await p.evaluate(()=>({width:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
  check(r,'Imported catalogue fits '+label,size.content<=size.width&&size.width<=width&&size.width>=width-20);
  await saveScreenshot(p,'source-catalogue-'+label+'.png');
 }
 await p.getByRole('link',{name:'Discover',exact:true}).click();await saveScreenshot(p,'source-home-phone.png');await setViewport({width:1440,height:1000});return r;
}

export {sourceAdminFlows} from './catalogue-source-admin-flows.mjs';
