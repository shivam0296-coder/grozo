package com.grozo.core
import java.util.Locale

fun inr(paise:Long):String = "₹" + String.format(Locale.forLanguageTag("en-IN"),"%,.2f",paise/100.0)
/** Development estimate mirrors Stage 1 thresholds. Live quotes must be server-owned. */
object Commerce {
 fun quote(products:List<Product>,cart:Map<String,Int>,coupon:String=""):Quote {
  require(cart.isNotEmpty()) { "Your basket is empty." }
  var subtotal=0L
  cart.forEach { (variant,quantity) ->
   val p=products.firstOrNull{it.variantId==variant} ?: error("Product is unavailable.")
   require(p.active&&quantity in 1..99&&quantity<=p.stock) { "Update unavailable quantities in your basket." }
   require(p.pricePaise>0&&p.pricePaise<=p.mrpPaise) { "Invalid development price." }
   subtotal=Math.addExact(subtotal,Math.multiplyExact(p.pricePaise,quantity.toLong()))
  }
  require(subtotal>=19900) { "Minimum development basket is ₹199." }
  require(subtotal<=500000) { "Above ₹5,000: manual or B2B handling is required." }
  require(coupon.isBlank()||coupon=="FRESH20") { "Development coupon is unavailable." }
  require(coupon.isBlank()||subtotal>=29900) { "FRESH20 needs a basket of at least ₹299." }
  val discount=if(coupon=="FRESH20")2000L else 0L
  val delivery=if(subtotal>=39900)0L else 1900L
  return Quote(subtotal,discount,delivery,subtotal-discount+delivery)
 }
 fun transition(from:String,to:String,actor:String,accepted:Boolean=false,collected:Boolean=false){
  val allowed=mapOf("placed" to setOf("confirmed","cancelled"),"confirmed" to setOf("packed","cancelled"),"packed" to setOf("out_for_delivery","cancelled"),"out_for_delivery" to setOf("delivered"),"delivered" to emptySet(),"cancelled" to emptySet())
  require(to in (allowed[from]?:emptySet())) { "This order transition is unavailable." }
  when(actor){
   "customer" -> require(from=="placed"&&to=="cancelled") { "Only a placed development order can be cancelled." }
   "rider" -> {require(accepted) { "Accept this delivery first." }; require((from=="packed"&&to=="out_for_delivery")||(from=="out_for_delivery"&&to=="delivered")) { "This rider action is unavailable." }}
   "operator" -> Unit
   else -> error("Unknown role.")
  }
  if(to=="delivered")require(collected){"Record simulated cash collection before completion."}
 }
}
