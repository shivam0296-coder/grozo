package com.grozo.core
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val GrozoGreen=Color(0xFF147D46)
private val Light=lightColorScheme(primary=GrozoGreen,onPrimary=Color.White,secondary=Color(0xFF6A8048),tertiary=Color(0xFFD98F33),background=Color(0xFFF8FAF5),surface=Color.White,onSurface=Color(0xFF173B2C),surfaceVariant=Color(0xFFEDF3E6))
private val Dark=darkColorScheme(primary=Color(0xFF93D5A6),secondary=Color(0xFFC4D7AB),background=Color(0xFF10251A),surface=Color(0xFF183323),onSurface=Color(0xFFF2F7F1),surfaceVariant=Color(0xFF2B4734))
@Composable fun GrozoTheme(content:@Composable ()->Unit){MaterialTheme(colorScheme=if(isSystemInDarkTheme())Dark else Light,content=content)}
