package com.grozo.core
import android.content.Context
import androidx.room.Room
import com.google.gson.Gson
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module @InstallIn(SingletonComponent::class)
object Dependencies {
 @Provides @Singleton fun db(@ApplicationContext context:Context):GrozoDatabase =
  Room.databaseBuilder(context,GrozoDatabase::class.java,"grozo-stage2-development.db").build()
 @Provides fun dao(db:GrozoDatabase):WorkspaceDao = db.workspaceDao()
 @Provides @Singleton fun gson():Gson = Gson()
 @Provides @Singleton fun api():GrozoApi = Retrofit.Builder()
  .baseUrl(BuildConfig.API_BASE_URL)
  .client(OkHttpClient.Builder().connectTimeout(10,TimeUnit.SECONDS).readTimeout(10,TimeUnit.SECONDS).callTimeout(15,TimeUnit.SECONDS).build())
  .addConverterFactory(GsonConverterFactory.create()).build().create(GrozoApi::class.java)
}
