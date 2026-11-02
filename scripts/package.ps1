#requires -Version 7.0
param([string]$OutputPath)
$ErrorActionPreference='Stop'
$grozoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if(-not $OutputPath){$OutputPath=Join-Path ([IO.Directory]::GetParent($grozoRoot).FullName) 'GROZO-Stage-3-Catalogue-Update-Source.zip'}
$grozoOutput=[IO.Path]::GetFullPath($OutputPath)
if(Test-Path -LiteralPath $grozoOutput){throw 'Archive exists. Choose a new output path; existing artifacts are preserved.'}
$grozoFiles=@(node (Join-Path $grozoRoot 'scripts/source-inventory.mjs') | ConvertFrom-Json)
if($LASTEXITCODE -ne 0 -or $grozoFiles.Count -lt 50){throw 'Complete source inventory failed'}
$grozoExpectedReports=@('reports/catalogue-update-browser-results.json','reports/catalogue-update-apk-verification.json','reports/catalogue-update-node-tests.xml','reports/catalogue-update-android-unit-tests.xml','reports/catalogue-update-import-report.json','reports/catalogue-update-image-manifest.json','reports/catalogue-update-products.csv')
foreach($grozoRequired in $grozoExpectedReports){if($grozoFiles -notcontains $grozoRequired){throw "Missing verification artifact: $grozoRequired"}}
$grozoZip=[IO.Compression.ZipFile]::Open($grozoOutput,[IO.Compression.ZipArchiveMode]::Create)
try {
 foreach($grozoName in $grozoFiles){
  $grozoSource=[IO.Path]::GetFullPath([IO.Path]::Combine($grozoRoot,$grozoName))
  if(-not $grozoSource.StartsWith($grozoRoot+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Source escapes project'}
  [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($grozoZip,$grozoSource,'grozo/'+$grozoName,[IO.Compression.CompressionLevel]::Optimal)|Out-Null
 }
}finally{$grozoZip.Dispose()}
$grozoVerified=[IO.Compression.ZipFile]::OpenRead($grozoOutput)
$grozoManifest=@()
try {
 if($grozoVerified.Entries.Count -ne $grozoFiles.Count){throw 'ZIP entry count mismatch'}
 foreach($grozoEntry in $grozoVerified.Entries){
  if(-not $grozoEntry.FullName.StartsWith('grozo/')){throw 'Invalid ZIP root'}
  $grozoRelative=$grozoEntry.FullName.Substring(6)
  if($grozoFiles -notcontains $grozoRelative){throw 'Unexpected ZIP entry'}
  $grozoStream=$grozoEntry.Open()
  try{$grozoHash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($grozoStream))}finally{$grozoStream.Dispose()}
  $grozoSourceHash=(Get-FileHash -LiteralPath ([IO.Path]::Combine($grozoRoot,$grozoRelative)) -Algorithm SHA256).Hash
  if($grozoHash -ne $grozoSourceHash){throw "ZIP content mismatch: $grozoRelative"}
  $grozoManifest+=[PSCustomObject]@{path=$grozoRelative;bytes=$grozoEntry.Length;sha256=$grozoHash}
 }
}finally{$grozoVerified.Dispose()}
$grozoArchiveHash=(Get-FileHash -LiteralPath $grozoOutput -Algorithm SHA256).Hash
[IO.File]::WriteAllText($grozoOutput+'.sha256.txt',$grozoArchiveHash+'  '+[IO.Path]::GetFileName($grozoOutput)+[Environment]::NewLine)
[IO.File]::WriteAllText($grozoOutput+'.manifest.json',($grozoManifest|ConvertTo-Json -Depth 4),[Text.UTF8Encoding]::new($false))
[PSCustomObject]@{Path=$grozoOutput;VerifiedSourceFiles=$grozoFiles.Count;Bytes=(Get-Item -LiteralPath $grozoOutput).Length;SHA256=$grozoArchiveHash}|ConvertTo-Json
