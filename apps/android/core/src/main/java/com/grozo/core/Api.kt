package com.grozo.core
import retrofit2.http.*
interface GrozoApi {
 @GET("catalogue") suspend fun catalogue():OwnerCatalogue
 @GET("categories") suspend fun categories():List<CategoryDto>
 @GET("products") suspend fun products(@Query("storeId") storeId:String,@Query("q") query:String?=null):ProductPageDto
 @PUT("cart") suspend fun replaceCart(@Body body:CartWriteDto):Map<String,Any>
 @POST("checkout/quotes") suspend fun quote(@Body body:QuoteRequestDto):Map<String,Any>
 @POST("orders") suspend fun order(@Header("Idempotency-Key") key:String,@Body body:OrderCreateDto):OrderSummaryDto
 @GET("orders") suspend fun orders():Map<String,Any>
 @GET("orders/{orderId}/tracking") suspend fun tracking(@Path("orderId") id:String):Map<String,Any>
}
