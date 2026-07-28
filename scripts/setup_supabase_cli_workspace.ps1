param(
    [string]$ProjectRef = "pyvftzsodzwfqncjbmbc"
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false
$repoRoot = Split-Path -Parent $PSScriptRoot
$supabaseCliHome = Join-Path $repoRoot ".codex-supabase-home"

$token = $env:SUPABASE_ACCESS_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
    $token = [Environment]::GetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "User")
}
if ([string]::IsNullOrWhiteSpace($token)) {
    $token = [Environment]::GetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "Machine")
}
if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "SUPABASE_ACCESS_TOKEN is not visible to this process."
    Write-Host "Set it as a user or machine environment variable, then restart Codex or rerun this script from a fresh terminal."
    exit 1
}

$env:SUPABASE_ACCESS_TOKEN = $token
$env:SUPABASE_TELEMETRY_DISABLED = "1"
$env:USERPROFILE = $supabaseCliHome
$env:HOME = $supabaseCliHome
$env:APPDATA = Join-Path $supabaseCliHome "AppData\Roaming"
$env:LOCALAPPDATA = Join-Path $supabaseCliHome "AppData\Local"

New-Item -ItemType Directory -Force -Path $supabaseCliHome | Out-Null
New-Item -ItemType Directory -Force -Path $env:APPDATA | Out-Null
New-Item -ItemType Directory -Force -Path $env:LOCALAPPDATA | Out-Null

supabase projects list --output json | Out-Null
supabase link --project-ref $ProjectRef

powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "check_environment_readiness.ps1")
