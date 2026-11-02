const visible=async(results,name,locator)=>{await locator.waitFor({state:'visible'});if(!await locator.isVisible())throw Error(name);results.push({test:name,result:'passed'});};
const check=(results,name,value)=>{if(!value)throw Error(name);results.push({test:name,result:'passed'});};
export async function catalogueManagement({admin:p,setViewport,saveScreenshot,uploadCsv,uploadImage}){
 const results=[],suffix=Date.now(),root='Synthetic QA root '+suffix,child='Synthetic QA child '+suffix,brand='Synthetic QA brand '+suffix,product='Synthetic QA catalogue item '+suffix;
 await setViewport({width:1440,height:1000});await p.goto('http://127.0.0.1:5174/#/catalogue');
 await visible(results,'Catalogue studio navigation',p.getByRole('heading',{name:'Catalogue workspace',exact:true}));
 await p.getByRole('tab',{name:'Categories',exact:true}).click();await p.getByRole('button',{name:'Add category',exact:true}).click();await p.getByLabel('Category name',{exact:true}).fill(root);await p.getByRole('button',{name:'Save category',exact:true}).click();
 await visible(results,'Create root category',p.getByRole('button',{name:'Edit category '+root,exact:true}));
 await p.getByRole('button',{name:'Add category',exact:true}).click();await p.getByLabel('Category name',{exact:true}).fill(child);await p.getByRole('combobox',{name:'Parent category',exact:true}).selectOption({label:root});await p.getByRole('button',{name:'Save category',exact:true}).click();
 await visible(results,'Create mapped subcategory',p.getByRole('button',{name:'Edit category '+child,exact:true}));
 await p.getByRole('tab',{name:'Brands',exact:true}).click();await p.getByRole('button',{name:'Add brand',exact:true}).click();await p.getByLabel('Brand name',{exact:true}).fill(brand);await p.getByRole('button',{name:'Save brand',exact:true}).click();
 await visible(results,'Create brand',p.getByText(brand,{exact:true}));
 await p.getByRole('tab',{name:'Bulk import',exact:true}).click();
 const header='name,brand,category,subcategory,quantityLabel,pricePaise,mrpPaise,stock\n',row=product+','+brand+','+root+','+child+',1 kg,10000,12000,5';
 await uploadCsv(p,header+row+'\n'+row.replace('10000,12000','15000,12000'));
 await visible(results,'CSV invalid row blocks complete batch',p.getByText('Row 3: Selling price must be positive and at most MRP.',{exact:true}));check(results,'Invalid CSV import button disabled',!await p.getByRole('button',{name:'Import all 1 rows',exact:true}).isEnabled());
 await uploadCsv(p,header+row+'\n'+row.replace('1 kg,10000,12000','500 g,5000,6000')+'\n'+row);
 await visible(results,'CSV preview preserves duplicate-looking rows',p.getByText('3 source rows · 3 valid rows · 0 errors · 1 duplicate-looking rows',{exact:true}));
 check(results,'Duplicate import requires explicit retention',!await p.getByRole('button',{name:'Import all 3 rows',exact:true}).isEnabled());
 await p.getByRole('checkbox',{name:'Retain every duplicate-looking row as a separate record',exact:true}).check();await p.getByRole('button',{name:'Import all 3 rows',exact:true}).click();
 await p.getByRole('tab',{name:'Products',exact:true}).click();await p.getByLabel('Search catalogue',{exact:true}).fill(product);
 await visible(results,'Bulk import adds searchable variants',p.getByRole('button',{name:'Manage '+product,exact:true}).first());
 check(results,'All imported pack variants retained',await p.getByRole('button',{name:'Manage '+product,exact:true}).count()===3);
 await p.getByRole('button',{name:'Manage '+product,exact:true}).first().click();await p.getByLabel('Selling price · paise',{exact:true}).fill('9000');await p.getByLabel('Variant',{exact:true}).fill('QA edited');await p.getByRole('button',{name:'Save catalogue product',exact:true}).click();await visible(results,'Variant and price edit persists',p.getByText('₹90.00',{exact:true}).first());
 await p.getByRole('tab',{name:'Images',exact:true}).click();await p.getByRole('button',{name:'Manage image for '+product,exact:true}).first().click();
 await uploadImage(p,'stage3-customer-desktop.png');await p.getByLabel('Permission / license basis',{exact:true}).fill('Original GROZO UI screenshot, solely an upload test. Not a product photograph.');await p.getByRole('button',{name:'Save image metadata',exact:true}).click();
 await visible(results,'Image upload remains pending review',p.getByText('pending_review',{exact:true}).first());
 await p.getByRole('button',{name:'Manage image for '+product,exact:true}).first().click();await visible(results,'Image source metadata persists',p.getByText(/stage3-customer-desktop.png/));await uploadImage(p,'stage3-customer-mobile.png');await p.getByRole('button',{name:'Save image metadata',exact:true}).click();
 await p.getByRole('button',{name:'Manage image for '+product,exact:true}).first().click();await visible(results,'Image replacement persists',p.getByText(/stage3-customer-mobile.png/));await p.getByRole('button',{name:'Close dialog',exact:true}).click();
 await p.getByRole('tab',{name:'Source reports',exact:true}).click();await visible(results,'Completed PDF reconciliation visible',p.getByText('4 PDF sources · 13 pages reviewed',{exact:true}));
 await p.getByRole('tab',{name:'Products',exact:true}).click();await saveScreenshot(p,'catalogue-admin-desktop.png');
 await setViewport({width:390,height:844});const size=await p.evaluate(()=>({width:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));check(results,'Catalogue admin mobile fits viewport',size.content<=size.width&&size.width<=390&&size.width>=370);await saveScreenshot(p,'catalogue-admin-mobile.png');
 await setViewport({width:1440,height:1000});return results;
}
export async function catalogueShopping({customer:p,setViewport,saveScreenshot}){
 const results=[];await setViewport({width:1440,height:1000});await p.goto('http://127.0.0.1:5173/#/shop');await p.getByRole('combobox',{name:'Catalogue view',exact:true}).selectOption('demo');
 await p.getByRole('combobox',{name:'Sort products',exact:true}).selectOption('price-asc');
 await p.getByRole('checkbox',{name:'In stock',exact:true}).check();
 await visible(results,'Catalogue sorting and stock filter',p.getByRole('button',{name:'View Tender spinach',exact:true}));
 const prices=await p.evaluate(()=>Array.from(document.querySelectorAll('.market-grid .market-buy strong')).map(n=>Number(n.textContent.replace(/[^0-9.]/g,''))));
 check(results,'Visible catalogue price order is ascending',prices.length>1&&prices.every((p,i)=>!i||p>=prices[i-1]));
 await p.getByRole('button',{name:'Switch to list',exact:true}).click();await visible(results,'List view toggle',p.locator('.market-list'));
 await p.getByRole('button',{name:'View Basmati rice',exact:true}).click();await visible(results,'Detailed product information',p.getByText('Ingredients / specifications',{exact:true}));await visible(results,'Missing exact photograph disclosed',p.getByText('Exact product photograph pending. No substitute image is displayed.',{exact:true}));await saveScreenshot(p,'product-detail.png');
 await p.getByRole('link',{name:'Discover',exact:true}).click();await visible(results,'Recently viewed section',p.getByRole('heading',{name:'Recently viewed',exact:true}));check(results,'Recently viewed contains opened item',await p.locator('.market-section').filter({has:p.getByRole('heading',{name:'Recently viewed',exact:true})}).getByRole('button',{name:'View Basmati rice',exact:true}).isVisible());
 await setViewport({width:768,height:1024});const size=await p.evaluate(()=>({width:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));check(results,'Customer tablet fits viewport',size.content<=size.width&&size.width<=768&&size.width>=748);await saveScreenshot(p,'customer-tablet.png');await setViewport({width:1440,height:1000});return results;
}
