@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
package com.grozo.core
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.*
import coil3.compose.AsyncImage

@Composable fun DevNotice(){Surface(color=Color(0xFF173B2C)){Text("DEVELOPMENT · PDF CATALOGUE + DEMO · NO LIVE ORDERS",color=Color(0xFFE2EFDC),fontSize=9.sp,fontWeight=FontWeight.SemiBold,modifier=Modifier.fillMaxWidth().padding(horizontal=16.dp,vertical=9.dp))}}
@Composable fun Page(content:LazyListScope.()->Unit){LazyColumn(modifier=Modifier.fillMaxSize(),contentPadding=PaddingValues(18.dp),verticalArrangement=Arrangement.spacedBy(16.dp),content=content)}
@Composable fun SectionCard(title:String="",content:@Composable ColumnScope.()->Unit){Card(modifier=Modifier.fillMaxWidth(),shape=RoundedCornerShape(18.dp),colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surface)){Column(Modifier.padding(19.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){if(title.isNotBlank())Text(title,style=MaterialTheme.typography.titleMedium,fontWeight=FontWeight.SemiBold);content()}}}
@Composable fun Eyebrow(text:String){Text(text.uppercase(),style=MaterialTheme.typography.labelSmall,color=MaterialTheme.colorScheme.secondary,letterSpacing=1.3.sp)}
@Composable fun EmptyState(title:String,text:String,action:String?=null,onAction:()->Unit={}){Column(Modifier.fillMaxWidth().padding(22.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(14.dp)){Icon(Icons.Default.ShoppingBag,null,Modifier.size(46.dp),tint=MaterialTheme.colorScheme.primary);Text(title,style=MaterialTheme.typography.titleLarge);Text(text,style=MaterialTheme.typography.bodyMedium);if(action!=null)Button(onClick=onAction){Text(action)}}}
@Composable fun IntegrationCard(name:String,text:String="Not connected in Stage 2. No API key is needed."){Surface(shape=RoundedCornerShape(13.dp),color=MaterialTheme.colorScheme.surfaceVariant,modifier=Modifier.fillMaxWidth()){Row(Modifier.padding(16.dp),horizontalArrangement=Arrangement.spacedBy(12.dp)){Icon(Icons.Default.LinkOff,null,tint=MaterialTheme.colorScheme.secondary);Column(verticalArrangement=Arrangement.spacedBy(5.dp)){Text(name+" · pending",style=MaterialTheme.typography.labelLarge);Text(text,style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)}}}}
@Composable fun PreviewStates(selected:String,onSelected:(String)->Unit){var open by remember{mutableStateOf(false)};Box{TextButton(onClick={open=true}){Text("UI state: "+selected)};DropdownMenu(expanded=open,onDismissRequest={open=false}){listOf("Ready","Loading","Empty","Error").forEach{value->DropdownMenuItem(text={Text(value)},onClick={onSelected(value);open=false})}}}}
@Composable fun StateGate(state:String,retry:()->Unit,content:@Composable ()->Unit){when(state){"Loading"->Column(Modifier.fillMaxSize().padding(22.dp),verticalArrangement=Arrangement.spacedBy(20.dp)){LinearProgressIndicator(Modifier.fillMaxWidth());repeat(4){Surface(Modifier.fillMaxWidth().height(100.dp),shape=RoundedCornerShape(18.dp),color=MaterialTheme.colorScheme.surfaceVariant){}}};"Empty"->EmptyState("A fresh start","Development empty-state preview.","Show records",retry);"Error"->EmptyState("A second try?","Development error-state preview. Saved records are preserved.","Retry",retry);else->content()}}
@Composable fun ProductVisual(kind:String,modifier:Modifier=Modifier){
 val base=when(kind){"banana"->Color(0xFFFFF1CC);"tomato","apple"->Color(0xFFFCE7DB);"milk"->Color(0xFFE5EFED);"leaf"->Color(0xFFE3EEDC);else->Color(0xFFF4EBD9)}
 Canvas(modifier.background(base,RoundedCornerShape(18.dp)).padding(13.dp)){
  val w=size.width;val h=size.height
  drawOval(Color(0x17173528),topLeft=androidx.compose.ui.geometry.Offset(w*.15f,h*.85f),size=androidx.compose.ui.geometry.Size(w*.7f,h*.1f))
  when(kind){
   "tomato","apple"->{drawCircle(Color(0xFFE65A3A),w*.28f,androidx.compose.ui.geometry.Offset(w*.47f,h*.6f));drawCircle(Color(0xFFEF7350),w*.18f,androidx.compose.ui.geometry.Offset(w*.78f,h*.72f));val leaf=Path().apply{moveTo(w*.45f,h*.39f);lineTo(w*.3f,h*.2f);lineTo(w*.47f,h*.25f);lineTo(w*.59f,h*.1f);lineTo(w*.56f,h*.35f);close()};drawPath(leaf,Color(0xFF3E7746))}
   "banana"->{drawArc(Color(0xFFF6C548),15f,150f,false,topLeft=androidx.compose.ui.geometry.Offset(w*.08f,-h*.1f),size=androidx.compose.ui.geometry.Size(w*.8f,h*.95f),style=Stroke(w*.18f));drawArc(Color(0xFFFFDA65),8f,145f,false,topLeft=androidx.compose.ui.geometry.Offset(w*.28f,-h*.16f),size=androidx.compose.ui.geometry.Size(w*.6f,h*.86f),style=Stroke(w*.16f))}
   "leaf","carrot"->{drawOval(Color(0xFF568C4C),topLeft=androidx.compose.ui.geometry.Offset(w*.26f,h*.16f),size=androidx.compose.ui.geometry.Size(w*.45f,h*.67f));drawLine(Color(0xFFBBD59B),androidx.compose.ui.geometry.Offset(w*.5f,h*.3f),androidx.compose.ui.geometry.Offset(w*.44f,h*.98f),w*.025f)}
   else->{drawRoundRect(if(kind=="milk")Color.White else Color(0xFFD4B079),topLeft=androidx.compose.ui.geometry.Offset(w*.23f,h*.12f),size=androidx.compose.ui.geometry.Size(w*.55f,h*.76f),cornerRadius=androidx.compose.ui.geometry.CornerRadius(10f,10f));drawRect(Color(0xFF497C57),topLeft=androidx.compose.ui.geometry.Offset(w*.23f,h*.4f),size=androidx.compose.ui.geometry.Size(w*.55f,h*.26f));drawCircle(Color(0xFFE7EFD7),w*.07f,androidx.compose.ui.geometry.Offset(w*.5f,h*.53f))}
  }
 }
}
@Composable fun RemoteProductImage(url:String?,kind:String,modifier:Modifier){if(url.isNullOrBlank())ProductVisual(kind,modifier)else AsyncImage(model=url,contentDescription="Catalogue product",modifier=modifier)}
@Composable fun ProductTile(product:Product,quantity:Int,onOpen:()->Unit,onQuantity:(Int)->Unit,modifier:Modifier=Modifier){
 val pending=product.pricingStatus=="pending"
 Card(onClick=onOpen,modifier=modifier,shape=RoundedCornerShape(12.dp),colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surface)){
  Column(Modifier.padding(11.dp),verticalArrangement=Arrangement.spacedBy(7.dp)){
   CataloguePhoto(product,Modifier.fillMaxWidth().height(125.dp))
   Text(product.brand.ifBlank{"Brand not specified"},style=MaterialTheme.typography.labelSmall,maxLines=1,overflow=TextOverflow.Ellipsis,color=MaterialTheme.colorScheme.secondary)
   Text(product.name,maxLines=2,minLines=2,overflow=TextOverflow.Ellipsis,fontWeight=FontWeight.SemiBold,style=MaterialTheme.typography.bodyMedium)
   Text(product.quantityLabel.ifBlank{"Pack size not supplied"},style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.secondary)
   Text(if(pending)"Availability pending" else if(product.stock>0)"In stock · development" else "Out of stock",style=MaterialTheme.typography.labelSmall,color=MaterialTheme.colorScheme.secondary)
   if(!pending&&product.mrpPaise>0)Text(((1-product.pricePaise.toDouble()/product.mrpPaise)*100).toInt().toString()+"% off · MRP "+inr(product.mrpPaise),style=MaterialTheme.typography.labelSmall,color=MaterialTheme.colorScheme.outline)
   Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.SpaceBetween){
    Text(if(pending)"Price pending" else inr(product.pricePaise),fontSize=12.sp,fontWeight=FontWeight.Bold)
    if(pending||product.stock==0||!product.active)OutlinedButton(onClick={},enabled=false,contentPadding=PaddingValues(horizontal=8.dp),modifier=Modifier.height(35.dp)){Text("ADD",fontSize=10.sp)}
    else if(quantity==0)OutlinedButton(onClick={onQuantity(1)},contentPadding=PaddingValues(horizontal=9.dp),modifier=Modifier.height(35.dp)){Text("ADD",fontSize=10.sp)}
    else Row(verticalAlignment=Alignment.CenterVertically){IconButton(onClick={onQuantity(quantity-1)},modifier=Modifier.size(27.dp)){Icon(Icons.Default.Remove,"Remove one")};Text(quantity.toString(),fontSize=11.sp);IconButton(onClick={onQuantity(quantity+1)},enabled=quantity<minOf(99,product.stock),modifier=Modifier.size(27.dp)){Icon(Icons.Default.Add,"Add one")}}
   }
  }
 }
}
@Composable fun OrderCard(order:LocalOrder,onOpen:()->Unit){Card(onClick=onOpen,modifier=Modifier.fillMaxWidth(),shape=RoundedCornerShape(16.dp)){Row(Modifier.padding(18.dp),horizontalArrangement=Arrangement.spacedBy(14.dp),verticalAlignment=Alignment.CenterVertically){Icon(Icons.Default.Inventory2,null,tint=MaterialTheme.colorScheme.primary);Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(5.dp)){Text(order.number,fontWeight=FontWeight.SemiBold);Text(order.items.joinToString{it.name},maxLines=1,overflow=TextOverflow.Ellipsis,style=MaterialTheme.typography.bodySmall);Text(order.status.replace('_',' '),style=MaterialTheme.typography.labelSmall,color=MaterialTheme.colorScheme.primary)};Text(inr(order.totalPaise),fontWeight=FontWeight.SemiBold,fontSize=13.sp)}}}
@Composable fun QuoteCard(quote:Quote?,error:String?,subtotal:Long){SectionCard("Basket summary"){Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween){Text("Item subtotal");Text(inr(subtotal))};if(quote!=null){Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween){Text("Coupon");Text("−"+inr(quote.couponPaise))};Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween){Text("Delivery");Text(if(quote.deliveryPaise==0L)"FREE" else inr(quote.deliveryPaise))};HorizontalDivider();Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween){Text("Estimated total",fontWeight=FontWeight.Bold);Text(inr(quote.totalPaise),fontWeight=FontWeight.Bold)}};if(error!=null)Text(error,color=MaterialTheme.colorScheme.error);Text("Development estimate. No charge or real delivery.",style=MaterialTheme.typography.bodySmall)}}

@Composable fun CataloguePhoto(product:Product,modifier:Modifier=Modifier){
 val model=product.publishedImage?.let{"file:///android_asset/"+it.thumbnail}?:product.imageUrl?.takeIf{product.imageReviewStatus=="owner_reviewed"&&it.startsWith("https://")}
 var failed by remember(model){mutableStateOf(false)}
 if(model!=null&&!failed)AsyncImage(model=model,contentDescription=product.name,modifier=modifier,contentScale=androidx.compose.ui.layout.ContentScale.Fit,onError={failed=true})
 else Surface(modifier,shape=RoundedCornerShape(12.dp),color=MaterialTheme.colorScheme.surfaceVariant){Column(Modifier.padding(12.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.Center){Icon(Icons.Default.HideImage,null,tint=MaterialTheme.colorScheme.outline);Spacer(Modifier.height(8.dp));Text("Photo pending",style=MaterialTheme.typography.labelSmall,color=MaterialTheme.colorScheme.outline)}}
}
