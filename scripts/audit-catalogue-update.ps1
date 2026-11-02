#requires -Version 7.0
$ErrorActionPreference='Stop'
$grozoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$grozoPrevious=Join-Path ([IO.Directory]::GetParent($grozoRoot).FullName) 'GROZO-Stage-3-Source.zip'
$grozoFiles=@(node (Join-Path $grozoRoot 'scripts/source-inventory.mjs')|ConvertFrom-Json)
if($LASTEXITCODE -ne 0){throw 'Source inventory failed'}
$grozoZip=[IO.Compression.ZipFile]::OpenRead($grozoPrevious)
$grozoChanged=@();$grozoAdded=@();$grozoUnchanged=@()
try{
 foreach($grozoName in $grozoFiles){
  $grozoOld=$grozoZip.GetEntry('grozo/'+$grozoName)
  if(-not $grozoOld){$grozoAdded+=$grozoName;continue}
  $grozoStream=$grozoOld.Open()
  try{$grozoHash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($grozoStream))}finally{$grozoStream.Dispose()}
  if($grozoHash -eq (Get-FileHash -LiteralPath (Join-Path $grozoRoot $grozoName)).Hash){$grozoUnchanged+=$grozoName}else{$grozoChanged+=$grozoName}
 }
 $grozoMissing=@($grozoZip.Entries|Where-Object{$_.FullName.StartsWith('grozo/') -and $grozoFiles -notcontains $_.FullName.Substring(6)}|ForEach-Object{$_.FullName.Substring(6)})
 $grozoBrand=@('assets/brand/logo.svg','assets/brand/tokens.json')
 $grozoBrandResults=@()
 foreach($grozoName in $grozoBrand){if($grozoChanged -contains $grozoName -or $grozoAdded -contains $grozoName){throw 'Original brand asset changed'};$grozoBrandResults+=[PSCustomObject]@{path=$grozoName;sha256=(Get-FileHash -LiteralPath (Join-Path $grozoRoot $grozoName)).Hash;unchanged=$true}}
}finally{$grozoZip.Dispose()}
$grozoProtected=Get-Content (Join-Path $grozoRoot 'docs/stage-1-preservation.json') -Raw|ConvertFrom-Json
foreach($grozoProp in $grozoProtected.PSObject.Properties){if((Get-FileHash -LiteralPath (Join-Path $grozoRoot $grozoProp.Name)).Hash.ToLowerInvariant() -ne $grozoProp.Value){throw 'Protected Stage 1 file changed'}}
$grozoAudit=[PSCustomObject]@{date='2026-10-31';baseline='GROZO-Stage-3-Source.zip';baselineSha256=(Get-FileHash -LiteralPath $grozoPrevious).Hash;changed=$grozoChanged;added=$grozoAdded;removed=$grozoMissing;unchangedCount=$grozoUnchanged.Count;protectedStage1FilesVerified=7;brandAssets=$grozoBrandResults;gitRepository=(Test-Path -LiteralPath (Join-Path $grozoRoot '.git'))}
if($grozoMissing.Count){throw 'A previous source entry is missing; inspect before packaging'}
[IO.File]::WriteAllText((Join-Path $grozoRoot 'reports/catalogue-update-changes.json'),($grozoAudit|ConvertTo-Json -Depth 6))
[PSCustomObject]@{changed=$grozoChanged.Count;added=$grozoAdded.Count;removed=$grozoMissing.Count;protectedStage1FilesVerified=7;brandAssetsVerified=$grozoBrandResults.Count;gitRepository=$grozoAudit.gitRepository}|ConvertTo-Json
