package com.grozo.core
import org.junit.Assert.*
import org.junit.Test
class CatalogueImportTest {
 private val original=Product("legacy","v-legacy","Synthetic demo","1 kg","Demo",10000,12000,"","Demo brand",5,true,0,"Development")
 private val draft=original.copy(id="source",variantId="v-source",name="Source entry",quantityLabel="",category="Source",pricePaise=0,mrpPaise=0,stock=0,brand="",dataSource="owner-pdf",pricingStatus="pending",sourceRow=SourceRow("test.pdf",1,1,"Source entry"),categoryId="root",subcategoryId="leaf")
 private val categories=listOf(SourceCategory("root","Source",null),SourceCategory("section","Section","root"),SourceCategory("leaf","Leaf","section"))
 private fun workspace()=Workspace(listOf(original),listOf("Demo"),mapOf("v-legacy" to 1),emptyList(),emptyList())
 @Test fun mergePreservesBasketAndExistingRecords(){val w=workspace();val merged=CatalogueImport.merge(w,OwnerCatalogue("test",listOf(draft),categories),PhotoCatalogue(emptyList()));assertEquals(2,merged.products.size);assertEquals(w.cart,merged.cart);assertEquals(original,merged.products.first());assertEquals("Source / Section / Leaf",merged.products.last().subcategory)}
 @Test fun mergingTwiceDoesNotDuplicateOrOverwriteEdits(){val owner=OwnerCatalogue("test",listOf(draft),categories);val first=CatalogueImport.merge(workspace(),owner,PhotoCatalogue(emptyList()));val edited=first.copy(products=first.products.map{if(it.id=="source")it.copy(description="Owner note")else it});val again=CatalogueImport.merge(edited,owner,PhotoCatalogue(emptyList()));assertEquals(2,again.products.size);assertEquals("Owner note",again.products.last().description)}
 @Test fun nestedTaxonomyIsBoundedAndCorrect(){assertEquals(setOf("root","section","leaf"),CatalogueImport.descendants(categories,"root"));assertEquals(setOf("leaf"),CatalogueImport.descendants(categories,"leaf"))}
 @Test fun pendingSourceCannotProduceAPayableQuote(){assertTrue(runCatching{Commerce.quote(listOf(draft),mapOf("v-source" to 1))}.isFailure)}
 @Test fun photosOnlyAttachToMatchingSourceEntry(){val photo=PublishedImage("source","a.webp","a.thumb.webp","https://example.invalid/source","Public domain","Test");val merged=CatalogueImport.merge(workspace(),OwnerCatalogue("test",listOf(draft),categories),PhotoCatalogue(listOf(photo)));assertNull(merged.products.first().publishedImage);assertEquals(photo,merged.products.last().publishedImage)}
}
