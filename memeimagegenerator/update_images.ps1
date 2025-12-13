# Script to update stock_images.js with Base64 encoded images
# This allows the meme generator to work without a web server (file:// protocol compatibility)

$memeDir = Join-Path $PSScriptRoot "meme"
$outputFile = Join-Path $PSScriptRoot "stock_images.js"

# Get all images
$patterns = @("*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp")
$files = Get-ChildItem -Path $memeDir -File -Include $patterns -Recurse

$jsContent = "const STOCK_IMAGES = [" + [Environment]::NewLine

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $b64 = [Convert]::ToBase64String($bytes)
    
    # Determine MIME type
    $ext = $file.Extension.ToLower().TrimStart('.')
    $mime = "image/$ext"
    if ($ext -eq "jpg") { $mime = "image/jpeg" }
    if ($ext -eq "svg") { $mime = "image/svg+xml" }
    
    $dataUri = "data:$mime;base64,$b64"
    $name = $file.Name
    
    Write-Host "Processing $name..."
    $jsContent += "    { name: `"$name`", data: `"$dataUri`" }," + [Environment]::NewLine
}

$jsContent += "];" + [Environment]::NewLine

# Write to file
Set-Content -Path $outputFile -Value $jsContent

Write-Host "Updated stock_images.js with $($files.Count) images (embedded as Base64)."
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
