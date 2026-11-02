#requires -Version 7.0
param([Parameter(Mandatory)][string]$Archive,[Parameter(Mandatory)][string]$Destination)
$ErrorActionPreference='Stop'
$grozoTarget=[IO.Path]::GetFullPath($Destination)
$grozoZip=[IO.Compression.ZipFile]::OpenRead($Archive)
try { foreach($grozoEntry in $grozoZip.Entries){$grozoResolved=[IO.Path]::GetFullPath([IO.Path]::Combine($grozoTarget,$grozoEntry.FullName));if(-not ($grozoResolved.StartsWith($grozoTarget+[IO.Path]::DirectorySeparatorChar) -or $grozoResolved -eq $grozoTarget)){throw 'Archive path escapes destination'}} } finally {$grozoZip.Dispose()}
[IO.Directory]::CreateDirectory($grozoTarget)|Out-Null
[IO.Compression.ZipFile]::ExtractToDirectory($Archive,$grozoTarget,$true)
