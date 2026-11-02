@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
package com.grozo.rider
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.*
import com.grozo.core.*
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint class MainActivity:ComponentActivity(){
 private val model:GrozoViewModel by viewModels()
 override fun onCreate(savedInstanceState:Bundle?){super.onCreate(savedInstanceState);enableEdgeToEdge();setContent{GrozoTheme{RiderApp(model)}}}
}
@Composable fun RiderApp(vm:GrozoViewModel){
 val workspace by vm.workspace.collectAsStateWithLifecycle();val loading by vm.loading.collectAsStateWithLifecycle();val message by vm.message.collectAsStateWithLifecycle()
 val nav=rememberNavController();val back by nav.currentBackStackEntryAsState();val route=back?.destination?.route?:"welcome"
 val snackbar=remember{SnackbarHostState()};var preview by rememberSaveable{mutableStateOf("Ready")}
 val tabs=listOf(Triple("offers","Offers",Icons.Default.Notifications),Triple("active","Active",Icons.Default.DeliveryDining),Triple("history","History",Icons.Default.History),Triple("earnings","Earnings",Icons.Default.AccountBalanceWallet),Triple("account","Account",Icons.Default.Person))
 LaunchedEffect(message){message?.let{snackbar.showSnackbar(it);vm.dismissMessage()}}
 Scaffold(snackbarHost={SnackbarHost(snackbar)},topBar={Column{DevNotice();TopAppBar(title={Column{Text("grozo partner.",fontSize=24.sp,fontWeight=FontWeight.Black);Text("A little local. A better everyday.",fontSize=10.sp,color=MaterialTheme.colorScheme.secondary)}},navigationIcon={if(route.startsWith("delivery/"))IconButton(onClick={nav.popBackStack()}){Icon(Icons.AutoMirrored.Filled.ArrowBack,"Back")}},actions={if(com.grozo.core.BuildConfig.DEVELOPMENT_MODE)PreviewStates(preview){preview=it}})}},
 bottomBar={if(route !in listOf("welcome","register"))NavigationBar{tabs.forEach{(destination,label,icon)->NavigationBarItem(selected=route==destination,onClick={nav.navigate(destination){popUpTo("offers"){saveState=true};launchSingleTop=true;restoreState=true}},icon={Icon(icon,label)},label={Text(label,fontSize=10.sp)})}}}
 ){padding->Box(Modifier.fillMaxSize().padding(padding)){
  when(val load=loading){
   LoadState.Loading->StateGate("Loading",vm::reload){}
   is LoadState.Error->Page{item{EmptyState("Backend or workspace unavailable",load.message,"Retry",vm::reload)};item{IntegrationCard("Live authentication and assignments","Release mode does not load development fixtures.")}}
   LoadState.Ready->{val w=workspace;if(w!=null)StateGate(preview,{preview="Ready"}){
    NavHost(nav,startDestination="welcome"){
     composable("welcome"){Page{
      item{Eyebrow("MADE FOR YOUR NEIGHBOURHOOD");Text("Good deliveries.\nA better everyday.",style=MaterialTheme.typography.displaySmall,fontWeight=FontWeight.Bold)}
      item{SectionCard{Icon(Icons.Default.DeliveryDining,null,Modifier.size(80.dp),tint=MaterialTheme.colorScheme.primary);Text("A focused delivery workflow, from the first offer to the final doorstep.");Text("This development build uses fictional orders and addresses. It never tracks a real location or collects real money.");Button(onClick={nav.navigate(if(w.riderRegistered)"offers" else "register"){popUpTo("welcome"){inclusive=true}}},modifier=Modifier.fillMaxWidth()){Text(if(w.riderRegistered)"Open development workspace" else "Enter development rider session")}}}
      item{IntegrationCard("OTP / real partner approval")}
     }}
     composable("register"){
      var name by rememberSaveable{mutableStateOf("Demo partner A")}
      Page{item{Eyebrow("DEVELOPMENT REGISTRATION");Text("Your partner corner.",style=MaterialTheme.typography.headlineLarge,fontWeight=FontWeight.Bold);Text("Use a fictional name only. This is not real partner registration or approval.")};item{OutlinedTextField(name,{name=it},label={Text("Fictional partner name")},modifier=Modifier.fillMaxWidth(),singleLine=true)};item{IntegrationCard("Phone / OTP verification")};item{IntegrationCard("Staff approval","Only a synthetic approved role is used for this local workflow.")};item{Button(onClick={vm.act(onSuccess={nav.navigate("offers"){popUpTo("register"){inclusive=true}}}){riderRegister(name)}},modifier=Modifier.fillMaxWidth()){Text("Start development session")}}}
     }
     composable("offers"){
      val offers=w.orders.filter{it.status=="packed"&&!it.accepted&&it.id !in w.declined}
      Page{
       item{SectionCard("Hello, "+w.displayName){Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically){Column(Modifier.weight(1f)){Text(if(w.riderOnline)"You’re online in development" else "You’re offline",fontWeight=FontWeight.SemiBold);Text("No real delivery requests are received.",style=MaterialTheme.typography.bodySmall)};Switch(w.riderOnline,{value->if(w.riderRegistered)vm.act{online(value)}else nav.navigate("register")})};Text("Location sharing: OFF · provider not connected",style=MaterialTheme.typography.labelSmall,color=MaterialTheme.colorScheme.secondary)}}
       item{Eyebrow("DEVELOPMENT DELIVERY OFFERS");Text("A little queue of good things.",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.SemiBold)}
       if(!w.riderOnline)item{EmptyState("Take a moment. Then go online.","Enable development availability to view synthetic offers.")}
       else if(offers.isEmpty())item{EmptyState("All caught up","There are no remaining synthetic offers.")}
       else items(offers,key={it.id}){order->SectionCard(order.number){Text(order.items.joinToString{it.quantity.toString()+" × "+it.name});Text("Pickup: fictional GROZO store · Siyana");Text("Drop: "+order.address.house+", "+order.address.street);Text("No route, distance or arrival time is simulated.",style=MaterialTheme.typography.bodySmall);Row(horizontalArrangement=Arrangement.spacedBy(12.dp)){OutlinedButton(onClick={vm.act("Development offer declined."){decline(order.id)}},modifier=Modifier.weight(1f)){Text("Decline")};Button(onClick={vm.act("Development offer accepted.",onSuccess={nav.navigate("delivery/"+order.id)}){accept(order.id)}},modifier=Modifier.weight(1f)){Text("Accept")}}}}
       item{IntegrationCard("New-order notifications")}
      }
     }
     composable("active"){
      val active=w.orders.filter{it.accepted&&it.status in listOf("packed","out_for_delivery")}
      Page{item{Eyebrow("ONE STEP AT A TIME");Text("Active deliveries",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)};if(active.isEmpty())item{EmptyState("A clear delivery bag","Accept a development offer to start the pickup workflow.")};items(active,key={it.id}){order->OrderCard(order){nav.navigate("delivery/"+order.id)}};item{IntegrationCard("Active-task location","Location permissions and tracking are intentionally not requested in Stage 2.")}}
     }
     composable("delivery/{id}"){entry->
      val order=w.orders.firstOrNull{it.id==entry.arguments?.getString("id")}
      var collected by rememberSaveable(entry.arguments?.getString("id")){mutableStateOf(false)}
      if(order==null)EmptyState("Delivery unavailable","Return to the offers screen.")else Page{
       item{Eyebrow("DEVELOPMENT DELIVERY · NO REAL TASK");Text(order.number,style=MaterialTheme.typography.headlineLarge,fontWeight=FontWeight.Bold);Text("Status: "+order.status.replace('_',' '),color=MaterialTheme.colorScheme.primary)}
       item{SectionCard("The little delivery checklist"){listOf("Offer accepted" to order.accepted,"Picked up" to (order.status in listOf("out_for_delivery","delivered")),"Delivered" to (order.status=="delivered")).forEach{(label,done)->Row(horizontalArrangement=Arrangement.spacedBy(12.dp)){Icon(if(done)Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,null,tint=if(done)MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline);Text(label)}}}}
       item{SectionCard("Pickup details"){Text("Fictional GROZO development store");Text("Siyana · no real store coordinates supplied");order.items.forEach{Text(it.quantity.toString()+" × "+it.name)};if(order.status=="packed"&&order.accepted)Button(onClick={vm.act("Development pickup recorded."){pickup(order.id)}},modifier=Modifier.fillMaxWidth()){Text("Confirm development pickup")}}}
       item{SectionCard("Customer drop-off"){Text("Development shopper",fontWeight=FontWeight.SemiBold);Text(order.address.house+", "+order.address.street);Text(order.address.city+" "+order.address.pin);Text("Synthetic address. Do not attempt a real delivery.",style=MaterialTheme.typography.bodySmall);OutlinedButton(onClick={},enabled=false){Icon(Icons.Default.Call,null);Spacer(Modifier.width(8.dp));Text("Calling not connected")}}}
       item{IntegrationCard("Maps navigation / route","No route, live position or ETA is fabricated. The integration comes in Stage 4.")}
       if(order.status=="out_for_delivery"){
        item{SectionCard("Development completion"){Text("Synthetic order total: "+inr(order.totalPaise));Row(verticalAlignment=Alignment.CenterVertically){Checkbox(collected,{collected=it});Text("Record simulated cash collection. No real money.",style=MaterialTheme.typography.bodySmall,modifier=Modifier.weight(1f))};Button(onClick={vm.act("Development delivery completed. No real delivery or payment.",onSuccess={nav.navigate("history"){popUpTo("offers")}}){complete(order.id,collected)}},enabled=collected,modifier=Modifier.fillMaxWidth()){Text("Complete development delivery")}}}
       }
       if(order.status=="delivered")item{SectionCard("All done, locally."){Icon(Icons.Default.CheckCircle,null,tint=MaterialTheme.colorScheme.primary);Text("The development workflow is complete. No customer was contacted or charged.")}}
      }
     }
     composable("history"){
      val history=w.orders.filter{it.accepted&&it.status in listOf("delivered","cancelled")}
      Page{item{Text("Delivery history",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold);Text("Synthetic local assignments only.")};if(history.isEmpty())item{EmptyState("No completed deliveries","Completed development tasks appear here.")};items(history,key={it.id}){order->OrderCard(order){nav.navigate("delivery/"+order.id)}}}
     }
     composable("earnings"){
      val completed=w.orders.count{it.accepted&&it.status=="delivered"&&it.collected}
      val earnings=completed*2500L
      Page{item{Eyebrow("A CLEAR LITTLE PICTURE");Text("Development earnings",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)}
       item{SectionCard("Synthetic completed assignments"){Text(inr(earnings),style=MaterialTheme.typography.displayMedium,color=MaterialTheme.colorScheme.primary,fontWeight=FontWeight.Bold);Text(completed.toString()+" completed development deliveries");Text("Illustrative payout assumption: ₹25 per completed development task. Calculated from this app’s local records. No real income, payout or wallet is claimed.",style=MaterialTheme.typography.bodySmall)}}
       item{IntegrationCard("Daily payouts / financial reconciliation","Actual earning rules, dates, payment records and settlement require the Stage 3 backend.")}
      }
     }
     composable("account"){
      var name by rememberSaveable(w.displayName){mutableStateOf(w.displayName)}
      Page{item{Text("Your partner profile",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)};item{SectionCard("Development partner"){Text("Goodness, Delivered by the Bagful.");Text("GROZO · Siyana · Support: 7830838894 / Shivam989845@gmail.com");OutlinedButton(onClick={vm.act(success="Backend catalogue reachable. Rider assignments remain pending."){checkBackend()}}){Text("Check configured backend")};OutlinedTextField(name,{name=it},label={Text("Fictional name")},modifier=Modifier.fillMaxWidth());Button(onClick={vm.act{profile(name)}}){Text("Save local profile")};Text(if(w.riderRegistered)"Development session registered" else "No development session");OutlinedButton(onClick={nav.navigate("register")}){Text("Open development registration")};OutlinedButton(onClick={vm.act(onSuccess={nav.navigate("welcome"){popUpTo("offers"){inclusive=true}}}){riderLogout()}}){Text("Leave development session")}}};item{IntegrationCard("Notifications / OTP")};item{IntegrationCard("Location privacy","No background or foreground location permission is requested. Active-task-only tracking will be implemented and tested separately.")};item{SectionCard("Help and support"){Text("Contact and issue submission require the real backend. No third-party message is sent from this preview.")}}}
     }
    }
   }}
  }
 }}
}
