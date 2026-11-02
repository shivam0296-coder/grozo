package com.grozo.core
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

@HiltViewModel class GrozoViewModel @Inject constructor(private val repository:WorkspaceRepository):ViewModel(){
 val workspace=repository.state
 val loading=repository.loadState
 private val notification=MutableStateFlow<String?>(null)
 val message=notification.asStateFlow()
 init { reload() }
 fun reload(){viewModelScope.launch{repository.load()}}
 fun viewed(id:String){viewModelScope.launch{runCatching{repository.viewed(id)}}}
 fun dismissMessage(){notification.value=null}
 fun act(success:String="Saved in this development workspace.",onSuccess:()->Unit={},block:suspend WorkspaceRepository.()->Unit){
  viewModelScope.launch{try{repository.block();notification.value=success;onSuccess()}catch(error:Exception){notification.value=error.message?:"Please try again."}}
 }
 fun checkout(address:String,coupon:String,onSuccess:(String)->Unit){
  viewModelScope.launch{try{val id=repository.checkout(address,coupon);notification.value="Development order created. No charge or real delivery.";onSuccess(id)}catch(error:Exception){notification.value=error.message?:"Check your basket."}}
 }
}
