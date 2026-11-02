#requires -Version 7.0
$ErrorActionPreference='Stop'
$grozoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$grozoReport=Get-ChildItem (Join-Path $grozoRoot 'apps/android/build/reports/dependency-verification') -Filter dependency-verification-report.html -Recurse -File|Sort-Object LastWriteTime -Descending|Select-Object -First 1
$grozoHtml=Get-Content -LiteralPath $grozoReport.FullName -Raw
$grozoPattern='<td class="uk-text-nowrap">([^<]+)</td>\s*<td class="uk-text-nowrap"><div uk-tooltip="title: From repository ''([^'']+)''"><a href="(file:[^"]+)">([^<]+)</a>'
$grozoMetadataPath=Join-Path $grozoRoot 'apps/android/gradle/verification-metadata.xml'
[xml]$grozoMetadata=Get-Content -LiteralPath $grozoMetadataPath -Raw
$grozoArtifacts=@([regex]::Matches($grozoHtml,$grozoPattern)|ForEach-Object{
 $grozoParts=$_.Groups[1].Value.Split(':');$grozoFile=$_.Groups[4].Value;$grozoRepo=$_.Groups[2].Value
 if($grozoParts.Count -ne 3 -or -not $grozoFile.EndsWith('-sources.jar') -or $grozoRepo -notin @('Google','MavenRepo')){throw 'Unexpected artifact in IDE source verification report'}
 if(-not($grozoMetadata.'verification-metadata'.components.component|Where-Object{$_.group -eq $grozoParts[0] -and $_.name -eq $grozoParts[1] -and $_.version -eq $grozoParts[2]})){throw ('Source component is not already pinned: '+$_.Groups[1].Value)}
 [PSCustomObject]@{group=$grozoParts[0];name=$grozoParts[1];version=$grozoParts[2];file=$grozoFile;path=([Uri]$_.Groups[3].Value).LocalPath;repository=$grozoRepo}
})
if($grozoArtifacts.Count -gt 200){throw 'Source metadata verification exceeds bounded run'}
$grozoResults=@($grozoArtifacts|ForEach-Object -Parallel {
 $grozoEntry=$_;$grozoBase=if($grozoEntry.repository -eq 'Google'){'https://dl.google.com/dl/android/maven2/'}else{'https://repo.maven.apache.org/maven2/'}
 $grozoUrl=$grozoBase+$grozoEntry.group.Replace('.','/')+'/'+$grozoEntry.name+'/'+$grozoEntry.version+'/'+$grozoEntry.file
 $grozoHash256=(Get-FileHash -LiteralPath $grozoEntry.path -Algorithm SHA256).Hash.ToLowerInvariant()
 $grozoHash1=(Get-FileHash -LiteralPath $grozoEntry.path -Algorithm SHA1).Hash.ToLowerInvariant()
 $grozoVendorHash=(Invoke-RestMethod -Uri ($grozoUrl+'.sha1') -TimeoutSec 30).ToString().Trim()
 if($grozoVendorHash -notmatch '^([a-fA-F0-9]{40})(\s|$)' -or $Matches[1].ToLowerInvariant() -ne $grozoHash1){throw ('Official repository source digest mismatch: '+$grozoEntry.file)}
 [PSCustomObject]@{group=$grozoEntry.group;name=$grozoEntry.name;version=$grozoEntry.version;file=$grozoEntry.file;sha256=$grozoHash256;vendorSha1=$grozoHash1;vendorDigestUrl=$grozoUrl+'.sha1';verified=$true}
} -ThrottleLimit 6)
if($grozoResults.Count -ne $grozoArtifacts.Count){throw 'Incomplete IDE source verification; metadata not changed'}
$grozoNamespace=$grozoMetadata.DocumentElement.NamespaceURI
foreach($grozoEntry in $grozoResults){
 $grozoComponent=$grozoMetadata.'verification-metadata'.components.component|Where-Object{$_.group -eq $grozoEntry.group -and $_.name -eq $grozoEntry.name -and $_.version -eq $grozoEntry.version}
 if($grozoComponent.artifact|Where-Object name -eq $grozoEntry.file){continue}
 $grozoArtifact=$grozoMetadata.CreateElement('artifact',$grozoNamespace);$grozoArtifact.SetAttribute('name',$grozoEntry.file)
 $grozoDigest=$grozoMetadata.CreateElement('sha256',$grozoNamespace);$grozoDigest.SetAttribute('value',$grozoEntry.sha256);$grozoDigest.SetAttribute('origin','Cached IDE source compared with official HTTPS repository SHA-1; exact SHA-256 pinned 2026-11-01')
 $grozoArtifact.AppendChild($grozoDigest)|Out-Null;$grozoComponent.AppendChild($grozoArtifact)|Out-Null
}
$grozoMetadata.Save($grozoMetadataPath)
$grozoResults|ConvertTo-Json -Depth 4|Set-Content -LiteralPath (Join-Path $grozoRoot 'reports/final-build/ide-dependency-source-verification.json')
'Verified official repository digests and pinned SHA256 for '+$grozoResults.Count+' IDE source artifacts. Strict verification remains enabled.'
