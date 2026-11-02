package com.grozo.core
import java.util.Locale
object CatalogueQuery {
 fun index(products:List<Product>):Map<String,String> = products.associate{it.id to listOf(it.name,it.brand,it.category,it.quantityLabel,it.variant.orEmpty(),it.description).joinToString(" ").lowercase(Locale.ROOT)}
 fun filter(products:List<Product>,index:Map<String,String>,query:String="",category:String="All",brand:String="",subcategory:String="",maxPrice:Long=Long.MAX_VALUE,inStock:Boolean=false,sort:String="Relevance",popularity:Map<String,Int> = emptyMap()):List<Product>{
  val tokens=query.lowercase(Locale.ROOT).trim().split(Regex("\\s+")).filter{it.isNotBlank()}
  val filtered=products.filter{p->p.active&&(category=="All"||p.category==category)&&(brand.isEmpty()||p.brand==brand)&&(subcategory.isEmpty()||p.subcategory==subcategory)&&p.pricePaise<=maxPrice&&(!inStock||p.stock>0)&&tokens.all{index[p.id]?.contains(it)==true}}
  return when(sort){"Price: low to high"->filtered.sortedBy{it.pricePaise};"Price: high to low"->filtered.sortedByDescending{it.pricePaise};"Popularity"->filtered.sortedByDescending{popularity[it.variantId]?:0};else->filtered.sortedByDescending{it.name.startsWith(query,true)}}
 }
}
