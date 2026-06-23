$lines = Get-Content 'index.html'
$out = @()
$out += $lines[11..1150]
$out += ''
$out += $lines[1153..1452]
$out | Set-Content -Encoding utf8 'style.css'
Write-Host 'Done creating style.css'
