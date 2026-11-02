package com.grozo.core
object CatalogueImport {
 fun descendants(categories:List<SourceCategory>,root:String):Set<String>{val ids=mutableSetOf(root);var changed=true;while(changed){changed=false;categories.forEach{c->if(c.parentId in ids&&ids.add(c.id))changed=true}};return ids}
 fun path(categories:List<SourceCategory>,id:String?):String{var current=id;val parts=mutableListOf<String>();val seen=mutableSetOf<String>();while(current!=null&&seen.add(current)){val c=categories.firstOrNull{it.id==current}?:break;parts.add(0,c.name);current=c.parentId};return parts.joinToString(" / ")}
 fun merge(workspace:Workspace,owner:OwnerCatalogue,photos:PhotoCatalogue):Workspace{
  val existing=workspace.products.associateBy{it.id}
  val additions=owner.products.filterNot{existing.containsKey(it.id)}.map{p->p.copy(publishedImage=photos.images.firstOrNull{it.productId==p.id},subcategory=path(owner.categories,p.subcategoryId))}
  val preserved=workspace.products.map{p->if(p.sourceRow!=null&&p.imageUrl==null)p.copy(publishedImage=photos.images.firstOrNull{it.productId==p.id}?:p.publishedImage,subcategory=path(owner.categories,p.subcategoryId))else p}
  return workspace.copy(products=preserved+additions,sourceCategories=owner.categories,catalogueVersion=owner.version)
 }
}
