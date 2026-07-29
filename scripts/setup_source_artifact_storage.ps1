$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$secretDir = Join-Path $repoRoot ".codex-secrets"
$secretPath = Join-Path $secretDir "supabase-service-role-key.txt"

Write-Host "Paste the Supabase Secret key (it begins with sb_secret_)." -ForegroundColor Cyan
Write-Host "The key will not appear while you paste or type it."
$secureKey = Read-Host "Secret key" -AsSecureString

$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
    $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
}

if ([string]::IsNullOrWhiteSpace($plainKey) -or
    -not $plainKey.StartsWith("sb_secret_")) {
    throw "That does not look like a Supabase Secret key. Nothing was saved."
}

New-Item -ItemType Directory -Force -Path $secretDir | Out-Null
[IO.File]::WriteAllText(
    $secretPath,
    $plainKey.Trim(),
    [Text.UTF8Encoding]::new($false)
)
$plainKey = $null

Write-Host "PASS  Source-artifact Storage secret saved locally." -ForegroundColor Green
Write-Host "It is stored in the ignored .codex-secrets folder and will not be committed."
