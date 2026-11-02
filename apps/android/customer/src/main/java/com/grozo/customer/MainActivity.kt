@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
package com.grozo.customer
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.*
import com.grozo.core.*
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay

@AndroidEntryPoint class MainActivity:ComponentActivity(){
 private val model:GrozoViewModel by viewModels()
 override fun onCreate(savedInstanceState:Bundle?){super.onCreate(savedInstanceState);enableEdgeToEdge();setContent{GrozoTheme{CustomerApp(model)}}}
}
@Composable fun CustomerApp(vm:GrozoViewModel){
 val workspace by vm.workspace.collectAsStateWithLifecycle()
 val loading by vm.loading.collectAsStateWithLifecycle()
 val message by vm.message.collectAsStateWithLifecycle()
 val nav=rememberNavController()
 val back by nav.currentBackStackEntryAsState()
 val route=back?.destination?.route?:"splash"
 val snackbar=remember{SnackbarHostState()}
 var preview by rememberSaveable{mutableStateOf("Ready")}
 var query by rememberSaveable{mutableStateOf("")}
 val tabs=listOf(Triple("home","Home",Icons.Default.Home),Triple("categories","Categories",Icons.Default.GridView),Triple("cart","Basket",Icons.Default.ShoppingBag),Triple("orders","Orders",Icons.Default.Inventory2),Triple("account","Account",Icons.Default.Person))
 LaunchedEffect(message){message?.let{snackbar.showSnackbar(it);vm.dismissMessage()}}
 Scaffold(
  snackbarHost={SnackbarHost(snackbar)},
  topBar={Column{DevNotice();TopAppBar(title={Column{Text("grozo.",fontWeight=FontWeight.Black,fontSize=28.sp);Text(workspace?.let{w->w.addresses.firstOrNull{it.id==w.selectedAddressId}?.let{it.label+" · "+it.city}}?:"Siyana · select saved address",fontSize=9.sp,color=MaterialTheme.colorScheme.secondary)}},navigationIcon={if(route !in tabs.map{it.first}&&route!="splash")IconButton(onClick={nav.popBackStack()}){Icon(Icons.AutoMirrored.Filled.ArrowBack,"Back")}},actions={if(com.grozo.core.BuildConfig.DEVELOPMENT_MODE)PreviewStates(preview){preview=it};IconButton(onClick={nav.navigate("addresses")}){Icon(Icons.Default.LocationOn,"Saved addresses")}})}},
  bottomBar={if(route !in listOf("splash","onboarding","login"))NavigationBar{tabs.forEach{(destination,label,icon)->NavigationBarItem(selected=route==destination,onClick={nav.navigate(destination){popUpTo("home"){saveState=true};launchSingleTop=true;restoreState=true}},icon={BadgedBox(badge={if(destination=="cart"&&!workspace?.cart.isNullOrEmpty())Badge{Text(workspace!!.cart.values.sum().toString())}}){Icon(icon,label)}},label={Text(label,fontSize=10.sp)})}}}
 ){padding->
  Box(Modifier.fillMaxSize().padding(padding)){
   when(val load=loading){
    LoadState.Loading->StateGate("Loading",vm::reload){}
    is LoadState.Error->Page{item{EmptyState("Backend or workspace unavailable",load.message,"Retry",vm::reload)};item{IntegrationCard("Live backend","Release mode never loads development fixtures. Stage 3 services are required.")}}
    LoadState.Ready->{val w=workspace;if(w!=null)StateGate(preview,{preview="Ready"}){
     NavHost(navController=nav,startDestination="splash"){
      composable("splash"){
       val context=LocalContext.current
       LaunchedEffect(Unit){delay(650);val seen=context.getSharedPreferences("grozo-ui",0).getBoolean("onboarded",false);nav.navigate(if(seen)"home" else "onboarding"){popUpTo("splash"){inclusive=true}}}
       Column(Modifier.fillMaxSize(),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.Center){Icon(Icons.Default.ShoppingBag,null,Modifier.size(70.dp),tint=MaterialTheme.colorScheme.primary);Text("GROZO",fontSize=42.sp,fontWeight=FontWeight.Black);Text("Goodness, Delivered by the Bagful.");Spacer(Modifier.height(25.dp));CircularProgressIndicator()}
      }
      composable("onboarding"){
       val context=LocalContext.current
       Page{item{Eyebrow("ROOTED IN SIYANA");Text("Your everyday,\na little fresher.",style=MaterialTheme.typography.displaySmall,fontWeight=FontWeight.Bold)}
        item{SectionCard("Your list. Our neighbourhood."){Text("Groceries, daily essentials and little extras, together in one place.")}}
        item{SectionCard("Good things, closer to home."){Text("Browse groceries, plan your basket and explore a thoughtfully designed neighbourhood shop.");Text("This build uses synthetic development data. No real orders, payments or location services are active.");Button(onClick={context.getSharedPreferences("grozo-ui",0).edit().putBoolean("onboarded",true).apply();nav.navigate("home"){popUpTo("onboarding"){inclusive=true}}},modifier=Modifier.fillMaxWidth()){Text("Explore development store")}}}
       }
      }
      composable("home"){CataloguePage(w,vm,query,{query=it},"All",{nav.navigate("product/"+it)},{nav.navigate("catalogue/"+android.net.Uri.encode(it))},true)}
      composable("search"){CataloguePage(w,vm,query,{query=it},"All",{nav.navigate("product/"+it)},{nav.navigate("catalogue/"+android.net.Uri.encode(it))},false)}
      composable("catalogue/{category}"){entry->CataloguePage(w,vm,query,{query=it},entry.arguments?.getString("category")?:"All",{nav.navigate("product/"+it)},{nav.navigate("catalogue/"+android.net.Uri.encode(it))},false)}
      composable("categories"){CatalogueCategoryPage(w){category->query="";nav.navigate("catalogue/"+android.net.Uri.encode(category))}}
      composable("product/{id}"){entry->
       val p=w.products.firstOrNull{it.id==entry.arguments?.getString("id")}
       LaunchedEffect(p?.id){p?.let{vm.viewed(it.id)}}
       if(p==null)EmptyState("Product unavailable","Return to the catalogue.")else Page{
        item{CataloguePhoto(p,Modifier.fillMaxWidth().height(280.dp))}
        item{Eyebrow(p.category);Text(p.name,style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold);Text(p.quantityLabel.ifBlank{"Pack size not supplied"}+" · "+p.brand.ifBlank{"Brand not specified"});Text(if(p.pricingStatus=="pending")"Price pending" else inr(p.pricePaise),style=MaterialTheme.typography.headlineSmall,color=MaterialTheme.colorScheme.primary)}
        item{Text(p.description.ifBlank{"Only the source product name is supplied. Merchant details await review."});p.sourceRow?.let{source->Text(source.file+" · page "+source.page+" · entry "+source.entry,style=MaterialTheme.typography.labelSmall);Text(source.rawText,style=MaterialTheme.typography.bodySmall)};SectionCard("Product information"){Text("Ingredients / specifications");Text(p.ingredients?:"Not supplied. Check the actual product label.");Text("Storage");Text(p.storageInfo?:"Not supplied. Follow the manufacturer label.");Text(p.publishedImage?.let{it.artist+" · "+it.license+" · "+it.sourcePage+"\n"+(it.licenseUrl?:"")+"\n"+(it.modifications?:"")}?:"Exact product photo pending until approved assets are provided.",style=MaterialTheme.typography.labelSmall)};ProductTile(p,w.cart[p.variantId]?:0,{}, {n->vm.act{quantity(p.variantId,n)}})}
        item{SectionCard("Related development picks"){w.products.filter{it.category==p.category&&it.id!=p.id}.forEach{related->TextButton(onClick={nav.navigate("product/"+related.id)}){Text(related.name)}}}}
       }
      }
      composable("cart"){CartPage(w,vm){nav.navigate("checkout")}}
      composable("checkout"){
       var selected by rememberSaveable{mutableStateOf(w.selectedAddressId?:w.addresses.firstOrNull()?.id?:"")}
       var coupon by rememberSaveable{mutableStateOf("")}
       val q=runCatching{Commerce.quote(w.products,w.cart,coupon)}
       val subtotal=w.cart.entries.sumOf{(id,n)->(w.products.firstOrNull{it.variantId==id}?.pricePaise?:0)*n}
       Page{item{Eyebrow("THE LAST LITTLE DETAILS");Text("Your development checkout",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)}
        item{SectionCard("1. Development session"){Text("OTP is not connected. No real login or payment is performed.");Button(onClick={vm.act{session(true)}},enabled=!w.developmentSession){Text(if(w.developmentSession)"Session active" else "Enter development session")}}}
        item{SectionCard("2. Delivery address"){w.addresses.forEach{a->Row(Modifier.fillMaxWidth().clickable{selected=a.id},verticalAlignment=Alignment.CenterVertically){RadioButton(selected==a.id,onClick={selected=a.id});Column{Text(a.label,fontWeight=FontWeight.SemiBold);Text(a.house+", "+a.street+", "+a.city,style=MaterialTheme.typography.bodySmall)}}};OutlinedButton(onClick={nav.navigate("address/new")}){Text("Add fictional address")}}}
        item{OutlinedTextField(value=coupon,onValueChange={coupon=it.uppercase()},label={Text("Development coupon")},placeholder={Text("FRESH20 above ₹299")},modifier=Modifier.fillMaxWidth(),singleLine=true)}
        item{QuoteCard(q.getOrNull(),q.exceptionOrNull()?.message,subtotal)}
        item{IntegrationCard("Payments / UPI","No payment is collected. This checkout creates only a local development order.")}
        item{IntegrationCard("Google Maps","No location, serviceability, route or ETA is fabricated.")}
        item{Button(onClick={vm.checkout(selected,coupon){id->nav.navigate("confirmation/"+id){popUpTo("home")}}},enabled=w.developmentSession&&q.isSuccess&&selected.isNotBlank(),modifier=Modifier.fillMaxWidth()){Text("Create development order")}}
       }
      }
      composable("confirmation/{id}"){entry->Page{item{SectionCard("Development order created"){Icon(Icons.Default.CheckCircle,null,Modifier.size(60.dp),tint=MaterialTheme.colorScheme.primary);Text("No payment or real delivery.");Button(onClick={nav.navigate("order/"+entry.arguments?.getString("id"))}){Text("View development order")}}}}}
      composable("orders"){Page{item{Eyebrow("YOUR LITTLE DELIVERIES");Text("Order history",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold);Text("Synthetic local records only.")};if(w.orders.isEmpty())item{EmptyState("No orders yet","Your development orders will appear here.")};items(w.orders,key={it.id}){order->OrderCard(order){nav.navigate("order/"+order.id)}}}}
      composable("order/{id}"){entry->OrderDetail(w.orders.firstOrNull{it.id==entry.arguments?.getString("id")},vm)}
      composable("tracking/{id}"){entry->OrderDetail(w.orders.firstOrNull{it.id==entry.arguments?.getString("id")},vm)}
      composable("login"){Page{item{Eyebrow("WELCOME TO YOUR EVERYDAY");Text("A fresher day\nstarts here.",style=MaterialTheme.typography.displaySmall,fontWeight=FontWeight.Bold)};item{IntegrationCard("Phone login / OTP","Backend authentication is not implemented. Do not enter real phone numbers or OTPs in this development build.")};item{Button(onClick={vm.act(onSuccess={nav.navigate("account"){popUpTo("login"){inclusive=true}}}){session(true)}},modifier=Modifier.fillMaxWidth()){Text("Enter development session")}}}}
      composable("account"){
       var name by rememberSaveable(w.displayName){mutableStateOf(w.displayName)}
       Page{item{Eyebrow("YOUR GROZO CORNER");Text("Hello, "+w.displayName+".",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)}
        item{SectionCard("Development profile"){OutlinedTextField(name,{name=it},label={Text("Fictional display name")},modifier=Modifier.fillMaxWidth());Button(onClick={vm.act{profile(name)}}){Text("Save profile")};Text(if(w.developmentSession)"Development session active" else "Guest preview");OutlinedButton(onClick={if(w.developmentSession)vm.act{session(false)}else nav.navigate("login")}){Text(if(w.developmentSession)"Leave development session" else "Enter development session")}}}
        item{SectionCard("Made for your everyday"){listOf("Saved addresses" to "addresses","Coupons" to "coupons","Notifications & privacy" to "privacy","Help & support" to "support","Order history" to "orders").forEach{(label,destination)->TextButton(onClick={nav.navigate(destination)},modifier=Modifier.fillMaxWidth()){Text(label);Spacer(Modifier.weight(1f));Icon(Icons.Default.ChevronRight,null)}}}}
       }
      }
      composable("addresses"){Page{item{Text("Saved addresses",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold);Text("Fictional development details only.")};items(w.addresses,key={it.id}){a->SectionCard(a.label){Text(a.house+", "+a.street+", "+a.city+" "+a.pin);OutlinedButton(onClick={vm.act{selectAddress(a.id)}}){Text(if(w.selectedAddressId==a.id)"Selected delivery address" else "Use this address")};TextButton(onClick={vm.act{removeAddress(a.id)}}){Text("Remove development address")}}};item{Button(onClick={nav.navigate("address/new")},modifier=Modifier.fillMaxWidth()){Text("Add fictional address")}};item{IntegrationCard("Google Maps address selection")}}}
      composable("address/new"){
       var label by rememberSaveable{mutableStateOf("Demo home")};var house by rememberSaveable{mutableStateOf("Sample House 12")};var street by rememberSaveable{mutableStateOf("Fictional Market Lane")};var city by rememberSaveable{mutableStateOf("Siyana")};var pin by rememberSaveable{mutableStateOf("203412")}
       Page{item{Text("A little place to call home",style=MaterialTheme.typography.headlineMedium);Text("Use fictional details. This is not a validated delivery location.")};item{OutlinedTextField(label,{label=it},label={Text("Label")},modifier=Modifier.fillMaxWidth())};item{OutlinedTextField(house,{house=it},label={Text("House / flat")},modifier=Modifier.fillMaxWidth())};item{OutlinedTextField(street,{street=it},label={Text("Street / landmark")},modifier=Modifier.fillMaxWidth())};item{OutlinedTextField(city,{city=it},label={Text("City")},modifier=Modifier.fillMaxWidth())};item{OutlinedTextField(pin,{pin=it},label={Text("Six-digit PIN")},modifier=Modifier.fillMaxWidth(),singleLine=true)};item{IntegrationCard("Map pin / address lookup")};item{Button(onClick={vm.act(onSuccess={nav.popBackStack()}){address(label,house,street,city,pin)}},modifier=Modifier.fillMaxWidth()){Text("Save development address")}}}
      }
      composable("coupons"){Page{item{Text("A little extra value",style=MaterialTheme.typography.headlineMedium)};item{SectionCard("FRESH20"){Text("Save ₹20 on a development basket of ₹299 or more.");Text("Synthetic local coupon. No promotion has been published.");Button(onClick={nav.navigate("cart")}){Text("See your basket")}}}}}
      composable("privacy"){Page{item{Text("Notifications & privacy",style=MaterialTheme.typography.headlineMedium)};item{SectionCard("Local preferences"){Row(verticalAlignment=Alignment.CenterVertically){Text("Promotional preference",Modifier.weight(1f));Switch(w.promotionalPreference,{value->vm.act{preference(value)}})};Text("This toggle only stores a local preference. No push messages are sent.")}};item{IntegrationCard("Firebase notifications")};item{IntegrationCard("Data export / deletion","Real-account privacy controls require the authenticated backend.")};item{Text("Policy draft: synthetic records remain in this app’s private development database. No real payments or precise locations are collected. Production policy and retention require review.")}}}
      composable("support"){var text by rememberSaveable{mutableStateOf("")};Page{item{Text("A helping hand",style=MaterialTheme.typography.headlineMedium);Text("Shivam Kumar · GROZO, Siyana, Bulandshahr, Uttar Pradesh");Text("7830838894 · Shivam989845@gmail.com");Text("Fictional development issue only. Real orders are not active.");OutlinedButton(onClick={vm.act(success="Backend catalogue reachable. Authentication and ordering remain pending."){checkBackend()}}){Text("Check configured backend")}};item{OutlinedTextField(text,{text=it},label={Text("Describe the development issue")},modifier=Modifier.fillMaxWidth().height(140.dp))};item{Button(onClick={vm.act(onSuccess={text=""}){support(text)}},modifier=Modifier.fillMaxWidth()){Text("Save local support note")}};if(w.support.isEmpty())item{EmptyState("A quiet inbox","Your local support notes will appear here.")};items(w.support){note->SectionCard("Development support note"){Text(note)}}}}
     }
    }}
   }
  }
 }
}
@Composable private fun CartPage(w:Workspace,vm:GrozoViewModel,onCheckout:()->Unit){
 val result=runCatching{Commerce.quote(w.products,w.cart)}
 val subtotal=w.cart.entries.sumOf{(id,n)->(w.products.firstOrNull{it.variantId==id}?.pricePaise?:0)*n}
 Page{item{Eyebrow("YOUR EVERYDAY, TOGETHER");Text("A basket of good things.",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)}
  if(w.cart.isEmpty())item{EmptyState("Your basket is waiting","Add some everyday favourites from the shop.")}
  items(w.cart.entries.toList(),key={it.key}){(id,n)->val p=w.products.first{it.variantId==id};SectionCard(p.name){Row(verticalAlignment=Alignment.CenterVertically){CataloguePhoto(p,Modifier.size(68.dp));Column(Modifier.weight(1f).padding(start=15.dp)){Text(p.quantityLabel);Text(inr(p.pricePaise*n),fontWeight=FontWeight.SemiBold)};IconButton(onClick={vm.act{quantity(id,n-1)}}){Icon(Icons.Default.Remove,"Remove one")};Text(n.toString());IconButton(onClick={vm.act{quantity(id,n+1)}},enabled=n<minOf(99,p.stock)){Icon(Icons.Default.Add,"Add one")}}}}
  if(w.cart.isNotEmpty()){item{QuoteCard(result.getOrNull(),result.exceptionOrNull()?.message,subtotal)};item{Button(onClick=onCheckout,enabled=result.isSuccess,modifier=Modifier.fillMaxWidth()){Text("Continue to checkout")}}}
 }
}
@Composable private fun OrderDetail(order:LocalOrder?,vm:GrozoViewModel){if(order==null){EmptyState("Order unavailable","Return to your order history.");return};Page{item{Eyebrow("DEVELOPMENT ORDER · NO REAL DELIVERY");Text(order.number,style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)};item{SectionCard("Order progress"){if(order.status=="cancelled")Text("Cancelled",color=MaterialTheme.colorScheme.error)else listOf("placed","confirmed","packed","out_for_delivery","delivered").forEachIndexed{i,status->val current=listOf("placed","confirmed","packed","out_for_delivery","delivered").indexOf(order.status);Row(horizontalArrangement=Arrangement.spacedBy(12.dp)){Icon(if(i<=current)Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,null,tint=if(i<=current)MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline);Text(status.replace('_',' '))}}}};item{SectionCard("Your basket"){order.items.forEach{Text(it.quantity.toString()+" × "+it.name+" · "+inr(it.pricePaise*it.quantity))};Text("Coupon savings −"+inr(order.couponPaise));Text("Delivery "+inr(order.deliveryPaise));HorizontalDivider();Text("Total "+inr(order.totalPaise),fontWeight=FontWeight.Bold);Text(order.address.house+", "+order.address.street);if(order.status=="placed")OutlinedButton(onClick={vm.act{cancel(order.id)}}){Text("Cancel development order")}}};item{IntegrationCard("Live tracking / Google Maps","No map position, route or ETA is simulated.")};item{IntegrationCard("Delivery partner contact")};item{IntegrationCard("Payment / refund status","No payment was collected. Provider integration is pending.")}}}
