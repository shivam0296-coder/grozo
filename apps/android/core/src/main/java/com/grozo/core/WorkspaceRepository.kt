package com.grozo.core
import android.content.Context
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton class WorkspaceRepository @Inject constructor(@param:ApplicationContext private val context:Context,private val dao:WorkspaceDao,private val gson:Gson,private val api:GrozoApi){
 private val lock=Mutex()
 private val mutable=MutableStateFlow<Workspace?>(null)
 val state:StateFlow<Workspace?> = mutable.asStateFlow()
 private val loading=MutableStateFlow<LoadState>(LoadState.Loading)
 val loadState:StateFlow<LoadState> = loading.asStateFlow()
 suspend fun load(){
  loading.value=LoadState.Loading
  try {
   if(!BuildConfig.DEVELOPMENT_MODE){check(BuildConfig.API_CONFIGURED){"Configure grozoApiBaseUrl for the target HTTPS backend before a release."};withContext(Dispatchers.IO){api.categories()};error("Backend responded. Production auth and data mapping remain pending; no fixtures are loaded in release mode.")}
   val workspace=withContext(Dispatchers.IO){val saved=dao.load();if(saved!=null)runCatching{gson.fromJson(saved,Workspace::class.java)}.getOrNull() else null}
   mutable.value=withContext(Dispatchers.IO){val owner=context.assets.open("imported.json").bufferedReader().use{gson.fromJson(it,OwnerCatalogue::class.java)};val photos=context.assets.open("media.json").bufferedReader().use{gson.fromJson(it,PhotoCatalogue::class.java)};CatalogueImport.merge(workspace?:initial(),owner,photos)}
   loading.value=LoadState.Ready
  }catch(error:Exception){loading.value=LoadState.Error(error.message?:"Cannot load this workspace.")}
 }
 suspend fun checkBackend(){
  check(BuildConfig.API_CONFIGURED){"No backend URL configured. This build uses the bundled catalogue. Set grozoApiBaseUrl in local Gradle properties for an HTTPS test server."}
  val remote=withContext(Dispatchers.IO){api.catalogue()}
  check(remote.products.isNotEmpty() && remote.categories.isNotEmpty()) {"Backend catalogue is empty."}
 }
 private fun initial():Workspace {
  val catalogue=context.assets.open("catalog.json").bufferedReader().use{gson.fromJson(it,Catalogue::class.java)}
  check(catalogue.source=="SYNTHETIC_DEVELOPMENT_ONLY")
  val address=LocalAddress("demo-home","Demo home","Sample House 12","Fictional Market Lane","Siyana","203412")
  val p=catalogue.products.first{it.name=="Basmati rice"}
  val q=Commerce.quote(catalogue.products,mapOf(p.variantId to 2))
  return Workspace(catalogue.products,catalogue.categories,addresses=listOf(address),orders=listOf(
   LocalOrder("native-demo-offer","DEV-201","packed",listOf(LocalItem(p.variantId,p.name,2,p.pricePaise)),q.totalPaise,address,subtotalPaise=q.subtotalPaise,deliveryPaise=q.deliveryPaise),
   LocalOrder("native-demo-history","DEV-200","delivered",listOf(LocalItem(p.variantId,p.name,2,p.pricePaise)),q.totalPaise,address,true,true,subtotalPaise=q.subtotalPaise,deliveryPaise=q.deliveryPaise)))
 }
 private suspend fun mutate(block:(Workspace)->Workspace)=lock.withLock{
  check(BuildConfig.DEVELOPMENT_MODE){"Development writes are disabled in release mode."}
  val current=mutable.value?:error("Workspace not loaded.")
  val next=block(current)
  withContext(Dispatchers.IO){dao.save(WorkspaceEntity(json=gson.toJson(next)))}
  mutable.value=next
 }
 suspend fun quantity(id:String,quantity:Int)=mutate { w ->
  val p=w.products.first{it.variantId==id};require(p.active&&p.pricingStatus!="pending"&&p.pricePaise>0&&quantity in 0..minOf(99,p.stock)){"Choose an available quantity."}
  w.copy(cart=w.cart.toMutableMap().apply{if(quantity==0)remove(id) else put(id,quantity)})
 }
 suspend fun catalogueMode(mode:String)=mutate{w->require(mode in listOf("source","demo"));w.copy(catalogueMode=mode)}
 suspend fun selectAddress(id:String)=mutate{w->require(w.addresses.any{it.id==id}){"Choose a saved address."};w.copy(selectedAddressId=id)}
 suspend fun viewed(id:String)=mutate{w->w.copy(recentProductIds=(listOf(id)+w.recentProductIds.orEmpty().filterNot{it==id}).take(12))}
 suspend fun session(active:Boolean)=mutate{it.copy(developmentSession=active)}
 suspend fun profile(name:String)=mutate{require(name.isNotBlank()&&name.length<=80){"Enter a fictional name up to 80 characters."};it.copy(displayName=name)}
 suspend fun address(label:String,house:String,street:String,city:String,pin:String)=mutate{
  require(label.isNotBlank()&&house.isNotBlank()&&street.isNotBlank()&&city.isNotBlank()&&Regex("[0-9]{6}").matches(pin)){"Complete the fictional address and six-digit PIN."}
  it.copy(addresses=it.addresses+LocalAddress(UUID.randomUUID().toString(),label,house,street,city,pin))
 }
 suspend fun removeAddress(id:String)=mutate{it.copy(addresses=it.addresses.filterNot{a->a.id==id})}
 suspend fun checkout(addressId:String,coupon:String):String {
  val id=UUID.randomUUID().toString()
  mutate{w->
   check(w.developmentSession){"Enter the development session first."}
   val address=w.addresses.firstOrNull{it.id==addressId}?:error("Select a saved address.")
   val quote=Commerce.quote(w.products,w.cart,coupon)
   val items=w.cart.map{(variant,quantity)->val p=w.products.first{it.variantId==variant};LocalItem(variant,p.name,quantity,p.pricePaise)}
   val order=LocalOrder(id,"DEV-"+System.currentTimeMillis().toString().takeLast(7),"placed",items,quote.totalPaise,address,subtotalPaise=quote.subtotalPaise,couponPaise=quote.couponPaise,deliveryPaise=quote.deliveryPaise)
   w.copy(cart=emptyMap(),orders=listOf(order)+w.orders,products=w.products.map{p->p.copy(stock=p.stock-(w.cart[p.variantId]?:0))})
  }
  return id
 }
 suspend fun cancel(id:String)=mutate{w->val order=w.orders.firstOrNull{it.id==id}?:error("Order unavailable.");Commerce.transition(order.status,"cancelled","customer");w.copy(orders=w.orders.map{if(it.id==id)it.copy(status="cancelled")else it},products=w.products.map{p->p.copy(stock=p.stock+(order.items.firstOrNull{it.variantId==p.variantId}?.quantity?:0))})}
 suspend fun riderRegister(name:String)=mutate{require(name.isNotBlank()){"Enter a fictional rider name."};it.copy(riderRegistered=true,displayName=name)}
 suspend fun riderLogout()=mutate{it.copy(riderRegistered=false,riderOnline=false)}
 suspend fun online(value:Boolean)=mutate{require(it.riderRegistered){"Enter the development rider session first."};it.copy(riderOnline=value)}
 suspend fun accept(id:String)=mutate{w->require(w.riderRegistered&&w.riderOnline){"Go online in the development session."};w.copy(orders=w.orders.map{if(it.id==id){require(it.status=="packed"&&!it.accepted){"Offer is unavailable."};it.copy(accepted=true)}else it})}
 suspend fun decline(id:String)=mutate{it.copy(declined=it.declined+id)}
 suspend fun pickup(id:String)=mutate{w->w.copy(orders=w.orders.map{o->if(o.id!=id)o else {Commerce.transition(o.status,"out_for_delivery","rider",o.accepted);o.copy(status="out_for_delivery")}})}
 suspend fun complete(id:String,collected:Boolean)=mutate{w->w.copy(orders=w.orders.map{o->if(o.id!=id)o else {Commerce.transition(o.status,"delivered","rider",o.accepted,collected);o.copy(status="delivered",collected=true)}})}
 suspend fun rememberSearch(query:String)=mutate{val value=query.trim().take(120);it.copy(searchHistory=if(value.isBlank())it.searchHistory else (listOf(value)+it.searchHistory.filterNot{q->q==value}).take(5))}
 suspend fun preference(value:Boolean)=mutate{it.copy(promotionalPreference=value)}
 suspend fun support(message:String)=mutate{require(message.isNotBlank()){"Describe the development issue."};it.copy(support=it.support+message.take(2000))}
}
