package com.grozo.core
import org.junit.Assert.*
import org.junit.Test
class CatalogueQueryTest {
 private val rows=listOf(Product("a","v-a","Synthetic rice","1 kg","Staples",10000,12000,"","Test brand",3,true,0,"Test-only description"),Product("b","v-b","Synthetic rice","500 g","Staples",5000,6000,"","Other brand",0,true,0,"Test-only description"))
 @Test fun searchMatchesBrandAndPack(){val index=CatalogueQuery.index(rows);assertEquals(1,CatalogueQuery.filter(rows,index,query="other 500").size)}
 @Test fun priceStockAndBrandFiltersCompose(){val index=CatalogueQuery.index(rows);assertEquals(listOf(rows[0]),CatalogueQuery.filter(rows,index,inStock=true,brand="Test brand"));assertEquals(0,CatalogueQuery.filter(rows,index,maxPrice=100).size)}
 @Test fun priceAndPopularitySort(){val index=CatalogueQuery.index(rows);assertEquals("b",CatalogueQuery.filter(rows,index,sort="Price: low to high").first().id);assertEquals("a",CatalogueQuery.filter(rows,index,sort="Popularity",popularity=mapOf("v-a" to 3)).first().id)}
 @Test fun thousandsOfTestRowsAreNotTruncated(){val many=(0 until 5000).map{rows[0].copy(id="test-$it",variantId="v-$it")};assertEquals(5000,CatalogueQuery.filter(many,CatalogueQuery.index(many),query="rice").size)}
}
