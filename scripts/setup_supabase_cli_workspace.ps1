param(
    [string]$ProjectRef = "pyvftzsodzwfqncjbmbc",
    [string]$DatabaseUrl
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false
$repoRoot = Split-Path -Parent $PSScriptRoot
$supabaseCliHome = Join-Path $repoRoot ".codex-supabase-home"
$secretDir = Join-Path $repoRoot ".codex-secrets"
$dbUrlPath = Join-Path $secretDir "supabase-db-url.txt"

if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    $DatabaseUrl = $env:SUPABASE_DB_URL
}
if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    $DatabaseUrl = [Environment]::GetEnvironmentVariable("SUPABASE_DB_URL", "User")
}
if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    $DatabaseUrl = [Environment]::GetEnvironmentVariable("SUPABASE_DB_URL", "Machine")
}
if (-not [string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    if ($DatabaseUrl -notmatch '^postgres(ql)?://[^:\s]+:[^@\s]+@[^/\s]+/.+') {
        Write-Host "SUPABASE_DB_URL is visible, but it is not a real Postgres connection string."
        Write-Host "Replace placeholder text like <postgres-connection-url> with the actual Supabase Postgres connection URL."
        exit 1
    }
    $env:SUPABASE_TELEMETRY_DISABLED = "1"
    $env:DO_NOT_TRACK = "1"
    New-Item -ItemType Directory -Force -Path $secretDir | Out-Null
    Set-Content -Path $dbUrlPath -Value $DatabaseUrl -NoNewline -Encoding UTF8
    powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "check_environment_readiness.ps1")
    exit $LASTEXITCODE
}

$token = $env:SUPABASE_ACCESS_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
    $token = [Environment]::GetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "User")
}
if ([string]::IsNullOrWhiteSpace($token)) {
    $token = [Environment]::GetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "Machine")
}
if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Neither SUPABASE_DB_URL nor SUPABASE_ACCESS_TOKEN is visible to this process."
    Write-Host "Preferred permanent fix: set SUPABASE_DB_URL, then rerun this setup script."
    Write-Host "Fallback: set SUPABASE_ACCESS_TOKEN, then rerun this setup script."
    exit 1
}

$env:SUPABASE_ACCESS_TOKEN = $token
$env:SUPABASE_TELEMETRY_DISABLED = "1"
$env:DO_NOT_TRACK = "1"
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
