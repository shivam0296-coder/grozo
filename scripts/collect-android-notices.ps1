#requires -Version 7.0
$ErrorActionPreference='Stop'
$grozoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$grozoCache=Join-Path $grozoRoot '.cache/gradle/caches/modules-2/files-2.1'
$grozoOutput=[Text.StringBuilder]::new()
[void]$grozoOutput.AppendLine('GROZO Stage 2 — Android dependency notices')
[void]$grozoOutput.AppendLine('Original GROZO material remains all rights reserved. These notices apply to their respective third-party components.')
$grozoSeen=[Collections.Generic.HashSet[string]]::new()
$grozoInventory=@()
foreach($grozoPom in Get-ChildItem -LiteralPath $grozoCache -Filter '*.pom' -Recurse -File){
 try {
  [xml]$grozoXml=Get-Content -LiteralPath $grozoPom.FullName -Raw
  $grozoRelative=[IO.Path]::GetRelativePath($grozoCache,$grozoPom.FullName)
  $grozoLicenses=@($grozoXml.SelectNodes("//*[local-name()='licenses']/*[local-name()='license']")|ForEach-Object{[PSCustomObject]@{name=[string]$_.name;url=[string]$_.url}})
  $grozoInventory+=[PSCustomObject]@{artifact=$grozoRelative.Replace('\','/');licenses=$grozoLicenses}
 }catch{}
}
foreach($grozoArchiveFile in Get-ChildItem -LiteralPath $grozoCache -Recurse -File | Where-Object {$_.Extension -in @('.jar','.aar')}){
 $grozoArchive=$null
 try {
  $grozoArchive=[IO.Compression.ZipFile]::OpenRead($grozoArchiveFile.FullName)
  foreach($grozoEntry in $grozoArchive.Entries | Where-Object {$_.Name -match '^(LICENSE|NOTICE|COPYING|COPYRIGHT)(\.|$)' -and $_.Length -lt 300000}){
   $grozoReader=[IO.StreamReader]::new($grozoEntry.Open())
   try {$grozoText=$grozoReader.ReadToEnd()}finally{$grozoReader.Dispose()}
   $grozoHash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($grozoText)))
   if($grozoSeen.Add($grozoHash)){[void]$grozoOutput.AppendLine('');[void]$grozoOutput.AppendLine("===== $($grozoArchiveFile.Name) / $($grozoEntry.FullName) =====");[void]$grozoOutput.AppendLine($grozoText)}
  }
 }catch{}finally{if($grozoArchive){$grozoArchive.Dispose()}}
}
$grozoGradleLicense=Join-Path $grozoRoot '.toolchains/gradle-8.13/LICENSE'
if(Test-Path -LiteralPath $grozoGradleLicense){[void]$grozoOutput.AppendLine('');[void]$grozoOutput.AppendLine('===== Gradle wrapper / distribution license =====');[void]$grozoOutput.AppendLine([IO.File]::ReadAllText($grozoGradleLicense));Copy-Item -LiteralPath $grozoGradleLicense -Destination (Join-Path $grozoRoot 'apps/android/gradle/wrapper/LICENSE')}
[void]$grozoOutput.AppendLine('');[void]$grozoOutput.AppendLine('===== Resolved artifact license declarations =====')
[void]$grozoOutput.AppendLine(($grozoInventory|ConvertTo-Json -Depth 5))
$grozoAssets=Join-Path $grozoRoot 'apps/android/core/src/main/assets'
[IO.Directory]::CreateDirectory($grozoAssets)|Out-Null
[IO.Directory]::CreateDirectory((Join-Path $grozoRoot 'docs/licenses'))|Out-Null
[IO.File]::WriteAllText((Join-Path $grozoAssets 'third-party-notices.txt'),$grozoOutput.ToString(),[Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $grozoRoot 'docs/licenses/android-dependencies.json'),($grozoInventory|ConvertTo-Json -Depth 5),[Text.UTF8Encoding]::new($false))
"Collected $($grozoSeen.Count) distinct provided license/notice texts and $($grozoInventory.Count) POM declarations. This is a provenance record, not a full legal certification."
