#requires -Version 7.0
$ErrorActionPreference='Stop'
$grozoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$grozoTools=Get-Content (Join-Path $grozoRoot '.toolchains/environment.json') -Raw|ConvertFrom-Json
$env:JAVA_HOME=$grozoTools.javaHome
$grozoSdkTools=Join-Path $grozoTools.sdk 'build-tools/35.0.0'
$grozoOutput=[IO.Directory]::GetParent($grozoRoot).FullName
$grozoReports=@()
foreach($grozoApp in @('customer','rider')){
 $grozoPath=Join-Path $grozoRoot "apps/android/$grozoApp/build/outputs/apk/debug/$grozoApp-debug.apk"
 $grozoSignature=@(& (Join-Path $grozoSdkTools 'apksigner.bat') verify --verbose --print-certs $grozoPath 2>&1|ForEach-Object{"$_"})
 if($LASTEXITCODE -ne 0){throw 'APK signature verification failed'}
 $grozoBadge=@(& (Join-Path $grozoSdkTools 'aapt.exe') dump badging $grozoPath)
 if($LASTEXITCODE -ne 0){throw 'APK manifest read failed'}
 if(-not ($grozoBadge[0] -match "versionCode='4'")){throw 'Unexpected APK version'}
 $grozoZip=[IO.Compression.ZipFile]::OpenRead($grozoPath)
 try{
  $grozoEntry=$grozoZip.GetEntry('assets/imported.json')
  if(-not $grozoEntry){throw 'Missing bundled catalogue'}
  $grozoReader=[IO.StreamReader]::new($grozoEntry.Open())
  try{$grozoCatalogue=$grozoReader.ReadToEnd()|ConvertFrom-Json -Depth 30}finally{$grozoReader.Dispose()}
  if($grozoCatalogue.products.Count -ne 390){throw 'Bundled catalogue entry count mismatch'}
  $grozoPhotoCount=@($grozoZip.Entries|Where-Object{$_.FullName -like 'assets/*.webp'}).Count
  if($grozoPhotoCount -ne 26){throw 'Bundled product photo count mismatch'}
 }finally{$grozoZip.Dispose()}
 $grozoFileName=if($grozoApp -eq 'customer'){'GROZO-Customer-Stage3-0.3.1-debug.apk'}else{'GROZO-Partner-Stage3-0.3.1-debug.apk'}
 $grozoTarget=Join-Path $grozoOutput $grozoFileName
 if(Test-Path -LiteralPath $grozoTarget){throw 'Preserve existing deliverable; choose a new artifact filename'}
 Copy-Item -LiteralPath $grozoPath -Destination $grozoTarget
 $grozoHash=(Get-FileHash -LiteralPath $grozoTarget -Algorithm SHA256).Hash
 [IO.File]::WriteAllText($grozoTarget+'.sha256.txt',$grozoHash+'  '+$grozoFileName+[Environment]::NewLine)
 $grozoReports+=[PSCustomObject]@{module=$grozoApp;artifact=$grozoFileName;bytes=(Get-Item $grozoTarget).Length;sha256=$grozoHash;signatureVerified=$true;signature=$grozoSignature;badging=@($grozoBadge|Where-Object{$_ -match '^(package:|sdkVersion:|targetSdkVersion:|uses-permission:|launchable-activity:|native-code:)'});bundledSourceEntries=390;bundledPhotoFiles=$grozoPhotoCount;deviceInstallation='NOT_TESTED_NO_DEVICE'}
}
[IO.File]::WriteAllText((Join-Path $grozoRoot 'reports/catalogue-update-apk-verification.json'),($grozoReports|ConvertTo-Json -Depth 6))
$grozoUnitFiles=Get-ChildItem (Join-Path $grozoRoot 'apps/android/core/build/test-results/testDebugUnitTest/TEST-*.xml')
$grozoSuites=[xml]::new();$grozoRootXml=$grozoSuites.CreateElement('testsuites');$grozoSuites.AppendChild($grozoRootXml)|Out-Null
foreach($grozoFile in $grozoUnitFiles){[xml]$grozoUnit=Get-Content $grozoFile.FullName;$grozoRootXml.AppendChild($grozoSuites.ImportNode($grozoUnit.testsuite,$true))|Out-Null}
$grozoSuites.Save((Join-Path $grozoRoot 'reports/catalogue-update-android-unit-tests.xml'))
$grozoReports|Select-Object artifact,bytes,sha256,signatureVerified,bundledSourceEntries,bundledPhotoFiles|ConvertTo-Json
