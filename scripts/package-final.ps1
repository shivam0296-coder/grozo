#requires -Version 7.0
param([string]$OutputPath)
$ErrorActionPreference='Stop'
$grozoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$grozoParent=[IO.Directory]::GetParent($grozoRoot).FullName
if(-not $OutputPath){$OutputPath=Join-Path $grozoParent 'GROZO-Final-Testing-Package.zip'}
$grozoOutput=[IO.Path]::GetFullPath($OutputPath)
if(Test-Path -LiteralPath $grozoOutput){throw 'Package exists; choose a new name to preserve prior deliverables.'}
$grozoFiles=@(node (Join-Path $grozoRoot 'scripts/source-inventory.mjs')|ConvertFrom-Json)
if($LASTEXITCODE -ne 0 -or $grozoFiles.Count -lt 450){throw 'Complete source inventory failed'}
$grozoRequired=@('apps/android/settings.gradle.kts','apps/android/gradlew.bat','apps/android/gradle/wrapper/gradle-wrapper.jar','services/api/server.mjs','.github/workflows/pages.yml','reports/final-build/apk-verification.json','reports/final-build/node-tests.xml','reports/final-build/android-unit-tests.xml','docs/INSTALL-ANDROID.md','docs/DEPLOY-WEBSITE.md','docs/FINAL-TEST-REPORT.md','docs/PENDING-INTEGRATIONS.md')
foreach($grozoName in $grozoRequired){if($grozoFiles -notcontains $grozoName){throw ('Missing package requirement: '+$grozoName)}}
$grozoEntries=@($grozoFiles|ForEach-Object{[PSCustomObject]@{path='grozo/'+$_;source=Join-Path $grozoRoot $_}})
foreach($grozoApp in @('GROZO-Customer-debug.apk','GROZO-Delivery-debug.apk')){$grozoEntries+=[PSCustomObject]@{path='installers/'+$grozoApp;source=Join-Path $grozoParent $grozoApp};$grozoEntries+=[PSCustomObject]@{path='installers/'+$grozoApp+'.sha256.txt';source=Join-Path $grozoParent ($grozoApp+'.sha256.txt')}}
$grozoEntries+=[PSCustomObject]@{path='START-HERE.md';source=Join-Path $grozoRoot 'docs/INSTALL-ANDROID.md'}
$grozoZip=[IO.Compression.ZipFile]::Open($grozoOutput,[IO.Compression.ZipArchiveMode]::Create)
try{foreach($grozoEntry in $grozoEntries){[IO.Compression.ZipFileExtensions]::CreateEntryFromFile($grozoZip,$grozoEntry.source,$grozoEntry.path,[IO.Compression.CompressionLevel]::Optimal)|Out-Null}}finally{$grozoZip.Dispose()}
$grozoManifest=@();$grozoZip=[IO.Compression.ZipFile]::OpenRead($grozoOutput)
try{
 if($grozoZip.Entries.Count -ne $grozoEntries.Count){throw 'ZIP entry count mismatch'}
 foreach($grozoEntry in $grozoZip.Entries){
  $grozoSource=($grozoEntries|Where-Object path -eq $grozoEntry.FullName).source
  if(-not $grozoSource){throw 'Unexpected ZIP entry'}
  $grozoStream=$grozoEntry.Open();try{$grozoHash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($grozoStream))}finally{$grozoStream.Dispose()}
  if($grozoHash -ne (Get-FileHash -LiteralPath $grozoSource -Algorithm SHA256).Hash){throw ('ZIP hash mismatch: '+$grozoEntry.FullName)}
  $grozoManifest+=[PSCustomObject]@{path=$grozoEntry.FullName;bytes=$grozoEntry.Length;sha256=$grozoHash}
 }
}finally{$grozoZip.Dispose()}
$grozoHash=(Get-FileHash -LiteralPath $grozoOutput -Algorithm SHA256).Hash
[IO.File]::WriteAllText($grozoOutput+'.manifest.json',($grozoManifest|ConvertTo-Json -Depth 4))
[IO.File]::WriteAllText($grozoOutput+'.sha256.txt',$grozoHash+'  '+[IO.Path]::GetFileName($grozoOutput)+[Environment]::NewLine)
[PSCustomObject]@{archive=$grozoOutput;sourceFiles=$grozoFiles.Count;verifiedEntries=$grozoEntries.Count;bytes=(Get-Item $grozoOutput).Length;sha256=$grozoHash}|ConvertTo-Json
