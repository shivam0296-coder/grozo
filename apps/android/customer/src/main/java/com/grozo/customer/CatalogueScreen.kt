@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
package com.grozo.customer
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import com.grozo.core.*
@Composable internal fun CataloguePage(w:Workspace,vm:GrozoViewModel,query:String,onQuery:(String)->Unit,category:String,onProduct:(String)->Unit,onCategory:(String)->Unit,hero:Boolean){
 val rootCategory=category.substringBefore("|")
 val source=w.catalogueMode!="demo"
 val catalogue=w.products.filter{(it.sourceRow!=null)==source}
 val categories=catalogue.map{it.category}.distinct()
 var maxPrice by rememberSaveable{mutableStateOf(Long.MAX_VALUE)};var brand by rememberSaveable{mutableStateOf("")};var sub by rememberSaveable(category,source){mutableStateOf(if(category.contains("|"))CatalogueImport.path(w.sourceCategories.orEmpty(),category.substringAfter("|")) else "")};var inStock by rememberSaveable{mutableStateOf(false)};var sort by rememberSaveable{mutableStateOf("Relevance")};var limit by rememberSaveable{mutableStateOf(24)}
 val columns=if(LocalConfiguration.current.screenWidthDp>=700)4 else 2
 val index=remember(catalogue){CatalogueQuery.index(catalogue)}
 val popular=remember(w.orders){w.orders.filter{it.status=="delivered"}.flatMap{it.items}.groupBy{it.variantId}.mapValues{(_,items)->items.sumOf{it.quantity}}}
 val filtered=remember(catalogue,index,query,category,brand,sub,maxPrice,inStock,sort,popular){CatalogueQuery.filter(catalogue,index,query,rootCategory,brand,sub,maxPrice,inStock,sort,popular).filter{maxPrice==Long.MAX_VALUE||it.pricingStatus!="pending"}}
 LaunchedEffect(query,category,brand,sub,maxPrice,inStock,sort,source){limit=24}
 val showHome=hero&&query.isBlank()
 fun LazyListScope.collection(title:String,caption:String,rows:List<Product>){
  item{Column(verticalArrangement=Arrangement.spacedBy(5.dp)){Text(title,fontWeight=FontWeight.Bold,style=MaterialTheme.typography.titleLarge);Text(caption,style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.secondary)}}
  if(rows.isEmpty())item{Text("No items in this collection yet.",style=MaterialTheme.typography.bodySmall)}
  else item{LazyRow(horizontalArrangement=Arrangement.spacedBy(12.dp)){items(rows.take(12),key={it.id}){p->ProductTile(p,w.cart[p.variantId]?:0,{onProduct(p.id)},{n->vm.act{quantity(p.variantId,n)}},Modifier.width(169.dp))}}}
 }
 Page{
  item{CatalogueMode(source){mode->vm.act(onSuccess={brand="";sub="";maxPrice=Long.MAX_VALUE;inStock=false;onQuery("");onCategory("All")}){catalogueMode(mode)}}}
  item{OutlinedTextField(query,onQuery,label={Text("Search products, brands & sizes")},leadingIcon={Icon(Icons.Default.Search,null)},singleLine=true,modifier=Modifier.fillMaxWidth(),shape=RoundedCornerShape(12.dp))}
  if(showHome){
   item{Surface(color=Color(0xFFDCECAF),shape=RoundedCornerShape(15.dp)){Column(Modifier.padding(22.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){Text("YOUR NEIGHBOURHOOD GROCER",color=Color(0xFF48613B),style=MaterialTheme.typography.labelSmall);Text(if(source)"Everyday essentials.\nAisle by aisle." else "Your list.\nOur neighbourhood.",color=Color(0xFF21432A),style=MaterialTheme.typography.headlineLarge,fontWeight=FontWeight.Bold);Text(if(source)"Fresh produce, household and personal care, organised from your complete lists." else "Groceries, daily essentials and little extras, together in one place.",color=Color(0xFF48613B),style=MaterialTheme.typography.bodySmall);Button(onClick={onCategory("All")}){Text("Explore the catalogue")}}}}
   item{Text("Shop by category",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)}
   items(categories.chunked(2)){row->Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(12.dp)){row.forEach{name->CategoryTile(name,Modifier.weight(1f),catalogue.firstOrNull{it.category==name&&it.publishedImage!=null}){onCategory(name)}};repeat(2-row.size){Spacer(Modifier.weight(1f))}}}
   if(source){
    collection("Fresh fruit picks","Item photos where reviewed; named varieties stay distinct.",catalogue.filter{it.category=="Fruits"}.sortedByDescending{it.publishedImage!=null})
    collection("The vegetable aisle","102 source entries, with every heading retained.",catalogue.filter{it.category=="Vegetables"}.sortedByDescending{it.publishedImage!=null})
    collection("Household grocery","100 source entries; merchant details pending.",catalogue.filter{it.category=="Household Grocery"})
    collection("Personal care & home protection","88 source entries; exact pack photography pending.",catalogue.filter{it.category=="Personal Care & Home Protection"})
   }else{
    collection("Popular in your neighbourhood","Synthetic delivered-order units.",catalogue.filter{it.active}.sortedByDescending{popular[it.variantId]?:0})
    collection("Fresh fruits & vegetables","Development catalogue.",catalogue.filter{it.active&&it.category in listOf("Fruits","Vegetables")})
    collection("Daily essentials","Your kitchen cupboard, restocked.",catalogue.filter{it.active&&it.category=="Staples"})
    collection("Dairy & bakery","The breakfast and tea-time shelf.",catalogue.filter{it.active&&it.category in listOf("Dairy","Bakery")})
   }
   collection("Recently viewed","Saved only in this app.",w.recentProductIds.orEmpty().mapNotNull{id->catalogue.firstOrNull{it.id==id&&it.active}})
  }else{
   item{Text(if(query.isBlank())if(rootCategory=="All")"Everyday essentials" else rootCategory else "Results for “"+query+"”",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold);Text(filtered.size.toString()+if(source)" source entries · merchant details pending" else " development products",style=MaterialTheme.typography.bodySmall)}
   item{LazyRow(horizontalArrangement=Arrangement.spacedBy(8.dp)){items(listOf("All")+categories){name->FilterChip(selected=rootCategory==name,onClick={onCategory(name)},label={Text(name)})}}}
   val subs=catalogue.filter{rootCategory=="All"||it.category==rootCategory}.mapNotNull{it.subcategory}.filter{it.isNotBlank()}.distinct()
   if(subs.isNotEmpty())item{Choice("Subcategory",listOf("")+subs,sub){sub=it}}
   item{Choice("Brand",listOf("")+catalogue.map{it.brand}.filter{it.isNotBlank()}.distinct(),brand){brand=it}}
   item{Choice("Sort by",listOf("Relevance","Price: low to high","Price: high to low","Popularity"),sort){sort=it}}
   item{LazyRow(horizontalArrangement=Arrangement.spacedBy(8.dp)){items(listOf("All prices" to Long.MAX_VALUE,"Up to ₹50" to 5000L,"Up to ₹100" to 10000L,"Up to ₹200" to 20000L)){(label,value)->FilterChip(selected=maxPrice==value,onClick={maxPrice=value},label={Text(label)})}}}
   item{Row(verticalAlignment=Alignment.CenterVertically){Text("In stock only",Modifier.weight(1f));Switch(inStock,{inStock=it})};if(sort=="Popularity")Text("Popularity uses synthetic local delivered orders.",style=MaterialTheme.typography.labelSmall)}
   if(filtered.isEmpty())item{EmptyState("No matching essentials","Try a different brand, price or search.","Clear filters"){brand="";sub="";maxPrice=Long.MAX_VALUE;inStock=false;onQuery("")}}
   items(filtered.take(limit).chunked(columns)){row->Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(12.dp)){row.forEach{p->ProductTile(p,w.cart[p.variantId]?:0,{onProduct(p.id)},{n->vm.act{quantity(p.variantId,n)}},Modifier.weight(1f))};repeat(columns-row.size){Spacer(Modifier.weight(1f))}}}
   if(filtered.size>limit)item{OutlinedButton(onClick={limit+=24},modifier=Modifier.fillMaxWidth()){Text("Load next 24 products")}}
  }
 }
}
@Composable private fun CatalogueMode(source:Boolean,onMode:(String)->Unit){Surface(color=MaterialTheme.colorScheme.surfaceVariant,shape=RoundedCornerShape(10.dp)){Column(Modifier.padding(12.dp),verticalArrangement=Arrangement.spacedBy(5.dp)){Text(if(source)"FROM YOUR PDFs · 390 ENTRIES" else "DEMO SHOPPING",style=MaterialTheme.typography.labelLarge,fontWeight=FontWeight.Bold);Text(if(source)"Pack, price and availability await merchant details." else "Synthetic prices and stock; no real orders.",style=MaterialTheme.typography.bodySmall);TextButton(onClick={onMode(if(source)"demo" else "source")}){Text(if(source)"Try demo shopping" else "Browse PDF catalogue")}}}}
@Composable private fun Choice(label:String,values:List<String>,selected:String,onSelect:(String)->Unit){var expanded by remember{mutableStateOf(false)};ExposedDropdownMenuBox(expanded=expanded,onExpandedChange={expanded=it}){OutlinedTextField(value=selected.ifBlank{"All"},onValueChange={},readOnly=true,label={Text(label)},trailingIcon={ExposedDropdownMenuDefaults.TrailingIcon(expanded)},modifier=Modifier.fillMaxWidth().menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable));ExposedDropdownMenu(expanded=expanded,onDismissRequest={expanded=false}){values.forEach{value->DropdownMenuItem(text={Text(value.ifBlank{"All"})},onClick={onSelect(value);expanded=false})}}}}
@Composable internal fun CategoryTile(name:String,modifier:Modifier=Modifier,image:Product?=null,onClick:()->Unit){Column(modifier.clickable(onClick=onClick),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(8.dp)){if(image!=null)CataloguePhoto(image,Modifier.fillMaxWidth().height(90.dp))else Surface(shape=RoundedCornerShape(12.dp),color=MaterialTheme.colorScheme.surfaceVariant,modifier=Modifier.fillMaxWidth().height(90.dp)){Box(contentAlignment=Alignment.Center){Text("Photo pending",style=MaterialTheme.typography.labelSmall,color=MaterialTheme.colorScheme.outline)}};Text(name,style=MaterialTheme.typography.labelMedium,fontWeight=FontWeight.SemiBold)}}
@Composable internal fun CatalogueCategoryPage(w:Workspace,onSelect:(String)->Unit){val source=w.catalogueMode!="demo";val products=w.products.filter{(it.sourceRow!=null)==source};val names=products.map{it.category}.distinct();Page{item{Text("Shop by category",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold);Text(if(source)"Complete PDF hierarchy; 52 source nodes." else "Development catalogue",style=MaterialTheme.typography.bodySmall)};items(names.chunked(2)){row->Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(12.dp)){row.forEach{name->CategoryTile(name,Modifier.weight(1f),products.firstOrNull{it.category==name&&it.publishedImage!=null}){onSelect(name)}};repeat(2-row.size){Spacer(Modifier.weight(1f))}}};if(source)items(w.sourceCategories.orEmpty().filter{it.parentId!=null}){c->TextButton(onClick={val root=w.sourceCategories.orEmpty().firstOrNull{it.parentId==null&&c.id in CatalogueImport.descendants(w.sourceCategories.orEmpty(),it.id)};onSelect((root?.name?:"All")+"|"+c.id)}){Text(CatalogueImport.path(w.sourceCategories.orEmpty(),c.id))}}}}
