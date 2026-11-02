/** Contract adapter for Stage 3 services. No fixture fallback in live mode. */
export class ApiError extends Error {status:number;code:string;constructor(message:string,status:number,code:string){super(message);this.status=status;this.code=code;}}
export class GrozoApi {
 private base:string;
 constructor(base='/api/v1'){this.base=base;}
 async request<T>(path:string,options:RequestInit={}):Promise<T>{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
  try {const response=await fetch(this.base+path,{...options,credentials:'include',signal:controller.signal,headers:{'Content-Type':'application/json',...options.headers}});
   if(!response.ok){let data:{message?:string;code?:string}={};try{data=await response.json();}catch{}throw new ApiError(data.message||'GROZO service is unavailable.',response.status,data.code||'UNAVAILABLE');}
   if(response.status===204)return undefined as T;
   const contentType=response.headers.get('content-type')||'';if(!contentType.includes('application/json'))throw new ApiError('The configured API did not return JSON. Connect the Stage 3 backend.',503,'UNAVAILABLE');
   return await response.json() as T;
  }catch(error){if(error instanceof ApiError)throw error;throw new ApiError('Cannot reach the GROZO backend. No development data is substituted in live mode.',503,'UNAVAILABLE');}
  finally{clearTimeout(timeout);}
 }
 products(storeId:string){return this.request<{items:unknown[];nextCursor:string|null}>('/products?storeId='+encodeURIComponent(storeId));}
 categories(){return this.request<unknown[]>('/categories');}
 cart(storeId:string){return this.request('/cart?storeId='+encodeURIComponent(storeId));}
 replaceCart(body:unknown){return this.request('/cart',{method:'PUT',body:JSON.stringify(body)});}
 addresses(){return this.request('/addresses');}
 quote(body:unknown){return this.request('/checkout/quotes',{method:'POST',body:JSON.stringify(body)});}
 createOrder(body:unknown,key:string){return this.request('/orders',{method:'POST',headers:{'Idempotency-Key':key},body:JSON.stringify(body)});}
 orders(){return this.request('/orders');}
 tracking(orderId:string){return this.request('/orders/'+encodeURIComponent(orderId)+'/tracking');}
}
