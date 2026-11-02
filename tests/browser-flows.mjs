// Shared automation flows. Cua adapters and Playwright use the same visible UI operations.
const origins={customer:'http://127.0.0.1:5173',admin:'http://127.0.0.1:5174'};
const assert=async(results,name,locator)=>{await locator.waitFor({state:'visible'});if(!await locator.isVisible())throw Error(name);results.push({test:name,result:'passed'});};
async function fits(results,page,name,expectedWidth){const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));if(expectedWidth && (size.width>expectedWidth || size.width<expectedWidth-20))throw Error(name+': viewport override was not applied '+JSON.stringify(size));if(size.content>size.width)throw Error(name+': horizontal page overflow '+JSON.stringify(size));results.push({test:name,result:'passed',viewport:size});}
export async function customerFlows({customer:p,setViewport,saveScreenshot}){
 const results=[];await setViewport({width:1440,height:1000});await p.goto(origins.customer+'/');await p.getByRole('combobox',{name:'Catalogue view',exact:true}).selectOption('demo');
 await assert(results,'Customer home navigation',p.getByRole('heading',{name:'Your list. Our neighbourhood.',exact:true}));
 await fits(results,p,'Customer desktop page fits viewport',1440);await saveScreenshot(p,'customer-desktop.png');
 await p.getByRole('textbox',{name:'Search products',exact:true}).fill('Whole wheat atta');
 await assert(results,'Instant product search',p.getByRole('button',{name:'View Whole wheat atta',exact:true}));
 await p.getByRole('button',{name:'Add Whole wheat atta',exact:true}).click();
 await p.getByRole('button',{name:'Add one Whole wheat atta',exact:true}).click();
 await p.locator('.basket-button').click();
 await assert(results,'Basket navigation and editable quantities',p.getByRole('heading',{name:'A basket of good things.',exact:true}));
 await p.getByRole('textbox',{name:'Development coupon',exact:true}).fill('FRESH20');await p.getByRole('button',{name:'Apply',exact:true}).click();
 await assert(results,'Coupon and free delivery calculate ₹470',p.getByText('₹470.00',{exact:true}));
 await p.getByRole('button',{name:'Continue to checkout',exact:true}).click();
 const login=p.getByRole('button',{name:'Enter development session',exact:true});if(await login.isVisible())await login.click();
 await p.getByRole('button',{name:'Create development order',exact:true}).click();
 await assert(results,'Development order confirmation',p.getByRole('heading',{name:/^DEV-/}));
 await p.getByRole('button',{name:'Cancel development order',exact:true}).click();
 await assert(results,'Placed order can be cancelled locally',p.getByText('cancelled',{exact:true}));
 for(const [value,title]of [['error','Something needs a second try'],['empty','A fresh start']]){
  await p.getByLabel('Preview state',{exact:true}).selectOption(value);await assert(results,'Customer '+value+' state',p.getByRole('heading',{name:title,exact:true}));
 }
 await p.getByLabel('Preview state',{exact:true}).selectOption('loading');await assert(results,'Customer loading state',p.getByLabel('Loading',{exact:true}));
 await p.getByLabel('Preview state',{exact:true}).selectOption('ready');
 await p.goto(origins.customer+'/');await setViewport({width:390,height:844});await fits(results,p,'Customer mobile page fits viewport',390);await saveScreenshot(p,'customer-mobile.png');
 await p.getByRole('textbox',{name:'Search products',exact:true}).fill('nonexistent-development-item');
 await assert(results,'Search empty results',p.getByRole('heading',{name:'No matching essentials',exact:true}));
 await p.getByRole('button',{name:'Clear filters',exact:true}).click();
 await assert(results,'Search filter recovery',p.getByRole('heading',{name:'Everyday essentials',exact:true}));
 return results;
}
export async function adminNavigation({admin:p,setViewport,saveScreenshot}){
 const results=[];await setViewport({width:1440,height:1000});await p.goto(origins.admin+'/');
 const entries=[['Products','Products'],['Inventory','Inventory'],['Customers','Customers'],['Delivery partners','Delivery partners'],['Service zones','Service zones'],['Campaigns','Campaigns'],['Coupons','Coupons'],['Reports','Reports'],['Support inbox','Support inbox'],['Settings','Settings'],['Activity log','Activity log'],['Integrations','Integrations'],['Overview','A fresh look at your day.']];
 for(const [link,title]of entries){await p.getByRole('link',{name:link,exact:true}).click();await assert(results,'Admin navigation: '+link,p.getByRole('heading',{name:title,exact:true}));}
 await fits(results,p,'Admin desktop page fits viewport',1440);await saveScreenshot(p,'admin-desktop.png');
 await setViewport({width:390,height:844});await fits(results,p,'Admin mobile page fits viewport',390);await saveScreenshot(p,'admin-mobile.png');
 await p.getByRole('button',{name:'Toggle admin navigation',exact:true}).click();await p.getByRole('link',{name:'Products',exact:true}).click();await assert(results,'Mobile admin drawer navigation',p.getByRole('heading',{name:'Products',exact:true}));
 await setViewport({width:1440,height:1000});return results;
}
export async function adminManagement({admin:p,setViewport,saveScreenshot}){
 const results=[];await setViewport({width:1440,height:1000});await p.goto(origins.admin+'/#/products');
 await p.getByRole('button',{name:'Add product',exact:true}).click();
 const name='Synthetic UI pulses '+Date.now();
 await p.getByLabel('Product name',{exact:true}).fill(name);await p.getByRole('combobox',{name:'Category',exact:true}).selectOption('Staples');
 await p.getByLabel('Pack / quantity',{exact:true}).fill('1 kg');await p.getByLabel('Selling price · INR',{exact:true}).fill('99');await p.getByLabel('MRP · INR',{exact:true}).fill('90');
 await p.getByRole('button',{name:'Save product',exact:true}).click();await assert(results,'Admin rejects selling price above MRP',p.getByRole('alert'));
 await p.getByLabel('MRP · INR',{exact:true}).fill('120');await p.getByRole('button',{name:'Save product',exact:true}).click();
 await p.getByRole('textbox',{name:'Search workspace',exact:true}).fill(name);await assert(results,'Admin creates and filters a development product',p.getByRole('button',{name:'Edit '+name,exact:true}));
 await p.getByRole('button',{name:'Edit '+name,exact:true}).click();await p.getByLabel('Stock units',{exact:true}).fill('18');await p.getByRole('button',{name:'Save product',exact:true}).click();await assert(results,'Admin product update',p.getByText('18 units',{exact:true}));
 await p.goto(origins.admin+'/#/orders');await p.getByRole('button',{name:'Open DEV-101',exact:true}).click();await p.getByRole('dialog').waitFor({state:'visible'});
 if(await p.getByRole('button',{name:'Confirm order',exact:true}).isVisible()){await p.getByRole('button',{name:'Confirm order',exact:true}).click();await p.getByRole('button',{name:'Mark packed',exact:true}).waitFor({state:'visible'});}
 if(await p.getByRole('button',{name:'Mark packed',exact:true}).isVisible()){await p.getByRole('button',{name:'Mark packed',exact:true}).click();await p.getByRole('button',{name:'Dispatch development order',exact:true}).waitFor({state:'visible'});}
 const assign=p.getByRole('combobox',{name:'Development delivery partner',exact:true});if(await assign.isEnabled())await assign.selectOption('demo-rider-a');
 if(await p.getByRole('button',{name:'Dispatch development order',exact:true}).isVisible()){await p.getByRole('button',{name:'Dispatch development order',exact:true}).click();await p.getByRole('button',{name:'Simulate collection & delivery',exact:true}).waitFor({state:'visible'});}
 if(await p.getByRole('button',{name:'Simulate collection & delivery',exact:true}).isVisible())await p.getByRole('button',{name:'Simulate collection & delivery',exact:true}).click();
 await assert(results,'Admin confirm, pack, assign, dispatch and simulated delivery',p.getByRole('dialog').getByText('delivered',{exact:true}));await p.getByRole('button',{name:'Close dialog',exact:true}).click();
 await p.goto(origins.admin+'/#/support');await p.getByRole('button',{name:'Add development ticket',exact:true}).click();await p.getByRole('button',{name:'Resolve',exact:true}).first().click();await assert(results,'Admin support resolution',p.getByText('resolved',{exact:true}).first());
 await p.goto(origins.admin+'/#/campaigns');await p.getByRole('button',{name:'Create campaign',exact:true}).click();
 const campaignName='Synthetic seasonal UI test '+Date.now();await p.getByLabel('Campaign name',{exact:true}).fill(campaignName);await p.getByLabel('Start date',{exact:true}).fill('2026-11-01');await p.getByLabel('End date',{exact:true}).fill('2026-11-30');await p.getByRole('button',{name:'Save campaign',exact:true}).click();await assert(results,'Admin campaign date form',p.getByRole('heading',{name:campaignName,exact:true}));
 await p.getByLabel('Preview state',{exact:true}).selectOption('error');await assert(results,'Admin error state',p.getByRole('heading',{name:'Something needs a second try',exact:true}));await p.getByRole('button',{name:'Retry',exact:true}).click();
 await p.getByRole('button',{name:'Notifications',exact:true}).click();await assert(results,'Notifications remain an explicit placeholder',p.getByRole('heading',{name:'Workspace notifications',exact:true}));await p.getByRole('button',{name:'Close dialog',exact:true}).click();
 await p.goto(origins.admin+'/#/overview');await saveScreenshot(p,'admin-desktop.png');return results;
}
