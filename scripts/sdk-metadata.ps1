#requires -Version 7.0
param([Parameter(Mandatory)][string]$Path)
[xml]$grozoRepository=Get-Content -LiteralPath $Path -Raw -Encoding utf8
$grozoPackages=foreach($grozoName in @('platforms;android-36','build-tools;35.0.0','platform-tools')){
 $grozoPackage=$grozoRepository.SelectSingleNode("//*[local-name()='remotePackage' and @path='$grozoName']")
 $grozoArchive=@($grozoPackage.archives.archive)|Where-Object {-not $_.'host-os' -or $_.'host-os' -eq 'windows'}|Select-Object -First 1
 [PSCustomObject]@{path=$grozoName;url=[string]$grozoArchive.complete.url;sha1=[string]$grozoArchive.complete.checksum;size=[long]$grozoArchive.complete.size}
}
$grozoPackages|ConvertTo-Json -Depth 4 -Compress
