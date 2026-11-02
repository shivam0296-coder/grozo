package com.grozo.core
import androidx.room.*
@Entity(tableName="development_workspace")
data class WorkspaceEntity(@PrimaryKey val key:String="stage2",val json:String)
@Dao interface WorkspaceDao {
 @Query("SELECT json FROM development_workspace WHERE key='stage2' LIMIT 1") suspend fun load():String?
 @Insert(onConflict=OnConflictStrategy.REPLACE) suspend fun save(value:WorkspaceEntity)
}
@Database(entities=[WorkspaceEntity::class],version=1,exportSchema=false)
abstract class GrozoDatabase:RoomDatabase(){abstract fun workspaceDao():WorkspaceDao}
