param(
    [switch]$SkipLiveSmoke
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$python = Join-Path $repoRoot ".venv\Scripts\python.exe"
$metadata = Join-Path $repoRoot "output\wizards\metadata.json"
$schemaSql = Join-Path $PSScriptRoot "inspect_supabase_schema.sql"
$projectRef = "pyvftzsodzwfqncjbmbc"
$failed = [System.Collections.Generic.List[string]]::new()
$env:SUPABASE_TELEMETRY_DISABLED = "1"

function Pass([string]$message) {
    Write-Host "PASS  $message"
}

function Fail([string]$message) {
    Write-Host "FAIL  $message"
    $failed.Add($message)
}

if (-not (Test-Path $python)) {
    Fail "Blessed runtime missing: .venv\Scripts\python.exe"
} else {
    try {
        & $python -c "import requests, truststore, tzdata; from zoneinfo import ZoneInfo; assert str(ZoneInfo('America/Los_Angeles')) == 'America/Los_Angeles'"
        if ($LASTEXITCODE -ne 0) { throw "runtime dependency check failed" }
        Pass "Blessed runtime and crawler/timezone dependencies"
    } catch {
        Fail "Blessed runtime dependencies are incomplete"
    }
}

if (-not (Test-Path $metadata)) {
    Fail "WPN snapshot metadata missing: output\wizards\metadata.json"
} else {
    try {
        $wpn = Get-Content -Raw $metadata | ConvertFrom-Json
        $retrieved = [DateTimeOffset]::Parse($wpn.retrievedAt)
        $age = [DateTimeOffset]::UtcNow - $retrieved
        if ([double]$wpn.radiusMiles -ne 25.0) {
            Fail "Routine WPN snapshot is not the canonical 25-mile snapshot"
        } else {
            $freshness = if ($age.TotalHours -lt 24) { "fresh" } else { "stale" }
            Pass ("WPN snapshot present ({0:N1} hours old, {1}, 25-mile radius)" -f $age.TotalHours, $freshness)
        }
    } catch {
        Fail "WPN metadata could not be parsed"
    }
}

try {
    $version = & supabase --version
    if ($LASTEXITCODE -ne 0) { throw "CLI unavailable" }
    Pass "Supabase CLI $version"
} catch {
    Fail "Supabase CLI unavailable"
}

try {
    $projects = & supabase projects list --output json
    if ($LASTEXITCODE -ne 0 -or ($projects -notmatch $projectRef)) {
        throw "authenticated project listing failed"
    }
    Pass "Supabase CLI authenticated for project $projectRef"
} catch {
    Fail "Supabase CLI authentication/Management API transport unavailable"
}

$linkedRefPath = Join-Path $repoRoot "supabase\.temp\project-ref"
if (-not (Test-Path $linkedRefPath)) {
    Fail "Supabase repo link missing"
} else {
    $linkedRef = (Get-Content -Raw $linkedRefPath).Trim()
    if ($linkedRef -ne $projectRef) {
        Fail "Supabase repo linked to unexpected project: $linkedRef"
    } else {
        Pass "Repo linked to Supabase project $projectRef"
    }
}

if (-not $SkipLiveSmoke) {
    try {
        $smoke = & supabase db query --linked "select '$projectRef'::text as project_ref, current_database() as database_name, true as ready;"
        if ($LASTEXITCODE -ne 0 -or ($smoke -notmatch $projectRef)) {
            throw "live query failed"
        }
        Pass "Direct linked live query"

        & supabase db query --linked --file $schemaSql | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "schema inspection failed" }
        Pass "Authoritative schema/function inspection query"
    } catch {
        Fail "Authenticated linked Supabase query path unavailable"
    }
}

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "ENVIRONMENT NOT READY"
    $failed | ForEach-Object { Write-Host "- $_" }
    exit 1
}

Write-Host ""
Write-Host "ENVIRONMENT READY"
