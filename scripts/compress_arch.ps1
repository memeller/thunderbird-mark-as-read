#could not get compress-7zip to pack only files from dist folder, so had to use this workaround
if(Get-Location | Select-String -Pattern "scripts") {
        Set-Location (Join-Path -Path (Split-Path $PWD -Parent) -ChildPath "dist")
}
else {
    Set-Location (Join-Path -Path $PWD -ChildPath "dist")<# Action when all if and elseif conditions are false #>
}
#get version from manifest.json
$manifest = Get-Content -Raw "..\public\manifest.json" | ConvertFrom-Json
$version = $manifest.version.replace('\.','_')
#cleanup old xpi folder and create new one
If ((Test-Path "..\xpi") -eq "True") {
Remove-Item -Recurse -Force ..\xpi
}
mkdir -p ..\xpi
if (Get-Command "Compress-7Zip" -ErrorAction SilentlyContinue) {
    Compress-7Zip -FullName "." -OutputFile "..\xpi\thunderbird-mark-as-read_v$version.xpi" -ArchiveType Zip 
}
    else {
        Write-Output "[ERROR] 7Zip4Powershell module is not installed or not found in PATH."
    }
If ((Test-Path "..\temp") -eq "True") {
Remove-Item -Recurse -Force ..\temp
}
mkdir -p ..\temp
#go to temp folder
Set-Location (Join-Path -Path (Split-Path $PWD -Parent) -ChildPath "temp")
Copy-Item -Path "..\public" -Destination ".\public" -Recurse
Copy-Item -Path "..\scripts" -Destination ".\scripts" -Recurse
Copy-Item -Path "..\src" -Destination ".\src" -Recurse
Copy-Item -Path "..\*.*" -Destination ".\" -Exclude @(".git",".github",".files_to_watch")
If ((Test-Path "..\source_code") -eq "True") {
Remove-Item -Recurse -Force ..\source_code
}
mkdir -p ..\source_code
if (Get-Command "Compress-7Zip" -ErrorAction SilentlyContinue) {
    Compress-7Zip -FullName "." -OutputFile "..\source_code\thunderbird-mark-as-read_source_v$version.zip" -ArchiveType Zip 
}
    else {
        Write-Output "[ERROR] 7Zip4Powershell module is not installed or not found in PATH."
}
Set-Location (Split-Path $PWD -Parent)
If ((Test-Path "temp") -eq "True") {
    Remove-Item -Recurse -Force .\temp
}