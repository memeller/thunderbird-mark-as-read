
if (Get-Command "vite" -ErrorAction SilentlyContinue) {
    if(Get-Location | Select-String -Pattern "scripts") {
        Set-Location (Split-Path $PWD -Parent)
    }
    # Clean and set up
    If ((Test-Path "dist") -eq "True") {
        Remove-Item -Recurse -Force dist/*
    }
    else {
        Write-Output "[INFO] No dist directory found, skipping cleanup."
    }
    mkdir -p dist/assets
    # Build the vue app
    vite build
    # The config for the vue app outputs to `dist/extension`.
    # Copy files to correct location and clean up.
    If ((Test-Path "dist/extension/assets") -eq "True") {
        Copy-Item -Recurse dist/extension/assets/* dist/assets/
    }
    else {
        Write-Output "[INFO] No dist/extension/assets directory found, skipping copy."
    }
    If ((Test-Path "dist/extension/") -eq "True") {
        Copy-Item -Recurse dist/extension/*.* dist/
        Remove-Item -Recurse -Force dist/extension
    }
    else {
        Write-Output "[INFO] No dist/extension/ directory found, skipping copy and cleanup."
    }
    # Build `background.js` as a library
    vite build --config vite.config.background.js
    vite build --config vite.config.options.js

    If ((Test-Path "dist/background/") -eq "True") {
        Copy-Item -Recurse -Force dist/background/* dist/
        Remove-Item -Recurse -Force dist/background
    }
    else {
        Write-Output "[INFO] No dist/background/ directory found, skipping copy and cleanup."
    }
     If ((Test-Path "dist/options/") -eq "True") {
        Copy-Item -Recurse -Force dist/options/* dist/
        Remove-Item -Recurse -Force dist/options
    }
    else {
        Write-Output "[INFO] No dist/options/ directory found, skipping copy and cleanup."
    }
}
else {
    Write-Error "Vite is not installed or not found in PATH."
}
# Copy contents of `public` dir
If ((Test-Path "public") -eq "True") {
    Copy-Item -Recurse -Force public/* dist/
}
else {
    Write-Output "[INFO] No public directory found, skipping copy and cleanup."
}
