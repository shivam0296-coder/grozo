package com.grozo.core
import org.junit.Assert.*
import org.junit.Test
class CommerceTest {
 private fun product(price:Long,stock:Int=100)=Product("p","v","Fixture","1 unit","Staples",price,price,"rice","Fixture",stock,true,0,"Synthetic")
 @Test fun minimumInclusive(){assertEquals(21800L,Commerce.quote(listOf(product(19900)),mapOf("v" to 1)).totalPaise)}
 @Test(expected=IllegalArgumentException::class) fun minimumReject(){Commerce.quote(listOf(product(19899)),mapOf("v" to 1))}
 @Test fun freeBoundary(){assertEquals(1900L,Commerce.quote(listOf(product(39899)),mapOf("v" to 1)).deliveryPaise);assertEquals(0L,Commerce.quote(listOf(product(39900)),mapOf("v" to 1)).deliveryPaise)}
 @Test fun maximumInclusive(){assertEquals(500000L,Commerce.quote(listOf(product(500000)),mapOf("v" to 1)).totalPaise)}
 @Test(expected=IllegalArgumentException::class) fun maximumReject(){Commerce.quote(listOf(product(500001)),mapOf("v" to 1))}
 @Test(expected=IllegalArgumentException::class) fun stockReject(){Commerce.quote(listOf(product(20000,1)),mapOf("v" to 2))}
 @Test fun couponThresholdBeforeDiscount(){val q=Commerce.quote(listOf(product(39900)),mapOf("v" to 1),"FRESH20");assertEquals(37900L,q.totalPaise);assertEquals(0L,q.deliveryPaise)}
 @Test(expected=IllegalArgumentException::class) fun badCoupon(){Commerce.quote(listOf(product(39900)),mapOf("v" to 1),"UNKNOWN")}
 @Test(expected=IllegalArgumentException::class) fun customerCannotSkip(){Commerce.transition("placed","delivered","customer")}
 @Test(expected=IllegalArgumentException::class) fun unassignedRiderDenied(){Commerce.transition("packed","out_for_delivery","rider")}
 @Test(expected=IllegalArgumentException::class) fun cashRequired(){Commerce.transition("out_for_delivery","delivered","rider",true,false)}
 @Test fun deliveryFlow(){Commerce.transition("packed","out_for_delivery","rider",true);Commerce.transition("out_for_delivery","delivered","rider",true,true)}
}
