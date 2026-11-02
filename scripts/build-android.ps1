#requires -Version 7.0
param([switch]$Offline,[string[]]$Tasks = @(':core:testDebugUnitTest',':customer:assembleDebug',':rider:assembleDebug'))
$ErrorActionPreference = 'Stop'
$grozoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$grozoTools = Get-Content -LiteralPath (Join-Path $grozoRoot '.toolchains/environment.json') -Raw | ConvertFrom-Json
$env:JAVA_HOME = $grozoTools.javaHome
$env:ANDROID_HOME = $grozoTools.sdk
$env:ANDROID_SDK_ROOT = $grozoTools.sdk
$env:ANDROID_USER_HOME = Join-Path $grozoRoot '.cache/android'
$env:GRADLE_USER_HOME = Join-Path $grozoRoot '.cache/gradle'
$grozoAndroid = Join-Path $grozoRoot 'apps/android'
$grozoTemporary = Join-Path $grozoRoot '.cache/android-tmp'
[IO.Directory]::CreateDirectory($grozoTemporary) | Out-Null
$grozoTemporaryOption = '-Djava.io.tmpdir=' + $grozoTemporary
$grozoReport = Join-Path $grozoRoot 'artifacts/build'
[IO.Directory]::CreateDirectory($grozoReport) | Out-Null
[IO.Directory]::CreateDirectory($env:ANDROID_USER_HOME) | Out-Null
$grozoGradle = Join-Path $grozoTools.gradle 'bin/gradle.bat'
$grozoWrapperProject = Join-Path $grozoRoot '.toolchains/wrapper-project'
if (-not (Test-Path -LiteralPath (Join-Path $grozoAndroid 'gradle/wrapper/gradle-wrapper.jar'))) {
 [IO.Directory]::CreateDirectory($grozoWrapperProject) | Out-Null
 [IO.File]::WriteAllText((Join-Path $grozoWrapperProject 'settings.gradle.kts'),'rootProject.name = "grozo-wrapper-bootstrap"')
 & $grozoGradle -p $grozoWrapperProject wrapper --gradle-version 8.13 --distribution-type bin --no-validate-url --gradle-distribution-sha256-sum $grozoTools.gradleSha --no-daemon
 if ($LASTEXITCODE -ne 0) { throw 'Official Gradle wrapper generation failed' }
 [IO.Directory]::CreateDirectory((Join-Path $grozoAndroid 'gradle/wrapper')) | Out-Null
 foreach ($grozoFile in @('gradlew','gradlew.bat','gradle/wrapper/gradle-wrapper.jar','gradle/wrapper/gradle-wrapper.properties')) {
  Copy-Item -LiteralPath (Join-Path $grozoWrapperProject $grozoFile) -Destination (Join-Path $grozoAndroid $grozoFile)
 }
}
[IO.File]::WriteAllText((Join-Path $grozoAndroid 'local.properties'),'sdk.dir=' + $grozoTools.sdk.Replace('\','/') + [Environment]::NewLine)
$grozoDiskBefore = (Get-ChildItem -LiteralPath (Join-Path $grozoRoot '.toolchains') -File -Recurse | Measure-Object Length -Sum).Sum
if ($grozoDiskBefore -gt 5500000000) { throw 'Toolchain disk cap too close to limit; build stopped' }
& $grozoGradle $grozoTemporaryOption -p $grozoAndroid @(if($Offline){"--offline"}) --no-daemon --max-workers=2 --console=plain --stacktrace --write-locks --write-verification-metadata sha256 @Tasks 2>&1 | Tee-Object -FilePath (Join-Path $grozoReport 'android-build.log')
$grozoExit = $LASTEXITCODE
if ($grozoExit -ne 0) { throw "Android Gradle build failed (exit $grozoExit). See artifacts/build/android-build.log." }
foreach ($grozoApp in @('customer','rider')) {
 $grozoApk = Join-Path $grozoAndroid "$grozoApp/build/outputs/apk/debug/$grozoApp-debug.apk"
 if (Test-Path -LiteralPath $grozoApk) { Get-Item -LiteralPath $grozoApk | Select-Object FullName,Length; Get-FileHash -LiteralPath $grozoApk -Algorithm SHA256 }
}
