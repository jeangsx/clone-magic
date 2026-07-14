# Build de producción (rutas relativas por defecto: ./assets/...)
# Subcarpeta en el bucket: $env:VITE_BASE_PATH="/trspace/"; npm run build
#
# Prerequisites:
#   1. AWS CLI installed: https://aws.amazon.com/cli/
#   2. Spaces access keys from DigitalOcean → API → Spaces Keys
#
# PowerShell:
#   $env:AWS_ACCESS_KEY_ID = "TU_SPACES_KEY"
#   $env:AWS_SECRET_ACCESS_KEY = "TU_SPACES_SECRET"
#   npm run build
#   npm run deploy:spaces
#
# Bash:
#   export AWS_ACCESS_KEY_ID="TU_SPACES_KEY"
#   export AWS_SECRET_ACCESS_KEY="TU_SPACES_SECRET"
#   npm run build && npm run deploy:spaces

$ErrorActionPreference = "Stop"

$Bucket = if ($env:SPACES_BUCKET) { $env:SPACES_BUCKET } else { "trspace" }
$Region = if ($env:SPACES_REGION) { $env:SPACES_REGION } else { "nyc3" }
$Endpoint = "https://$Region.digitaloceanspaces.com"
$Dist = Join-Path $PSScriptRoot "..\dist"

if (-not (Test-Path $Dist)) {
  Write-Error "No existe dist/. Ejecuta primero: npm run build"
}

if (-not $env:AWS_ACCESS_KEY_ID -or -not $env:AWS_SECRET_ACCESS_KEY) {
  Write-Error "Define AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY con tus credenciales de Spaces."
}

Write-Host "Subiendo $Dist -> s3://$Bucket ($Endpoint) con ACL public-read..."

aws s3 sync $Dist "s3://$Bucket/" `
  --endpoint-url $Endpoint `
  --acl public-read `
  --delete `
  --cache-control "public, max-age=31536000, immutable" `
  --exclude "index.html" `
  --exclude "404.html" `
  --exclude "200.html" `
  --exclude "clone/*"

aws s3 sync $Dist "s3://$Bucket/" `
  --endpoint-url $Endpoint `
  --acl public-read `
  --cache-control "public, max-age=0, must-revalidate" `
  --exclude "*" `
  --include "index.html" `
  --include "404.html" `
  --include "200.html" `
  --include "clone/*"

Write-Host ""
Write-Host "Deploy completado."
Write-Host "URL CDN:    https://$Bucket.$Region.cdn.digitaloceanspaces.com/clone/index.html"
Write-Host "URL sitio:  https://$Bucket.$Region.cdn.digitaloceanspaces.com/index.html"
Write-Host ""
Write-Host "En DigitalOcean Spaces -> trspace -> Settings:"
Write-Host "  - Static Site: ON"
Write-Host "  - Index document: index.html"
Write-Host "  - Error document: index.html"
