Get-ChildItem -Recurse -Filter "*.css" -Path src | ForEach-Object { $_.FullName } > .files_to_watch
Get-ChildItem -Recurse -Filter "*.vue" -Path src | ForEach-Object { $_.FullName } >> .files_to_watch
Get-ChildItem -Recurse -Filter "*.json" -Path src | ForEach-Object { $_.FullName } >> .files_to_watch
Get-ChildItem -Recurse -Filter "*.ts" -Path src | ForEach-Object { $_.FullName } >> .files_to_watch
Get-ChildItem -Recurse -Filter "*.js" -Path src | ForEach-Object { $_.FullName } >> .files_to_watch
Get-Content .files_to_watch | tsc-watch --onSuccess 'npm run build-windows'
#Get-Content .files_to_watch | entr -c pnpm run build
Remove-Item .files_to_watch
