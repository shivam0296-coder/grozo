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
 if($LASTEXITCODE -ne 0 -or -not ($grozoBadge[0] -match "versionCode='5'")){throw 'Unexpected APK manifest/version'}
 $grozoZip=[IO.Compression.ZipFile]::OpenRead($grozoPath)
 try{
  $grozoReader=[IO.StreamReader]::new($grozoZip.GetEntry('assets/imported.json').Open())
  try{$grozoCatalogue=$grozoReader.ReadToEnd()|ConvertFrom-Json -Depth 30}finally{$grozoReader.Dispose()}
  if($grozoCatalogue.products.Count -ne 390){throw 'Bundled catalogue mismatch'}
  $grozoReader=[IO.StreamReader]::new($grozoZip.GetEntry('assets/media.json').Open())
  try{$grozoMedia=$grozoReader.ReadToEnd()|ConvertFrom-Json -Depth 15}finally{$grozoReader.Dispose()}
  if($grozoMedia.images.Count -ne 104){throw 'Bundled photo mapping mismatch'}
  foreach($grozoPhoto in $grozoMedia.images){foreach($grozoKind in @('file','thumbnail')){
   $grozoEntry=$grozoZip.GetEntry('assets/'+$grozoPhoto.$grozoKind)
   if(-not $grozoEntry){throw 'Mapped image absent in APK'}
   $grozoStream=$grozoEntry.Open();try{$grozoHash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($grozoStream)).ToLowerInvariant()}finally{$grozoStream.Dispose()}
   $grozoExpected=if($grozoKind -eq 'file'){$grozoPhoto.fileSha256}else{$grozoPhoto.thumbnailSha256}
   if($grozoHash -ne $grozoExpected){throw 'APK image hash mismatch'}
  }}
 }finally{$grozoZip.Dispose()}
 $grozoFileName=if($grozoApp -eq 'customer'){'GROZO-Customer-debug.apk'}else{'GROZO-Delivery-debug.apk'}
 $grozoTarget=Join-Path $grozoOutput $grozoFileName
 if(Test-Path -LiteralPath $grozoTarget){if((Get-FileHash $grozoTarget).Hash -ne (Get-FileHash $grozoPath).Hash){throw 'Preserve existing deliverable; rename it before replacing'}}else{Copy-Item -LiteralPath $grozoPath -Destination $grozoTarget}
 $grozoHash=(Get-FileHash -LiteralPath $grozoTarget -Algorithm SHA256).Hash
 [IO.File]::WriteAllText($grozoTarget+'.sha256.txt',$grozoHash+'  '+$grozoFileName+[Environment]::NewLine)
 $grozoReports+=[PSCustomObject]@{module=$grozoApp;artifact=$grozoFileName;bytes=(Get-Item $grozoTarget).Length;sha256=$grozoHash;signatureVerified=$true;signature=$grozoSignature;badging=@($grozoBadge|Where-Object{$_ -match '^(package:|sdkVersion:|targetSdkVersion:|uses-permission:|launchable-activity:|application-label:)'});bundledSourceEntries=390;verifiedPhotoMappings=104;photoHashesChecked=208;deviceInstallation='NOT_TESTED_OWNER_PROCEED_WITHOUT_PHONE'}
}
[IO.File]::WriteAllText((Join-Path $grozoRoot 'reports/final-build/apk-verification.json'),($grozoReports|ConvertTo-Json -Depth 6))
$grozoSuites=[xml]::new();$grozoRootXml=$grozoSuites.CreateElement('testsuites');$grozoSuites.AppendChild($grozoRootXml)|Out-Null
foreach($grozoFile in Get-ChildItem (Join-Path $grozoRoot 'apps/android/core/build/test-results/testDebugUnitTest/TEST-*.xml')){[xml]$grozoUnit=Get-Content $grozoFile.FullName;$grozoRootXml.AppendChild($grozoSuites.ImportNode($grozoUnit.testsuite,$true))|Out-Null}
$grozoSuites.Save((Join-Path $grozoRoot 'reports/final-build/android-unit-tests.xml'))
$grozoReports|Select-Object artifact,bytes,sha256,signatureVerified|ConvertTo-Json
