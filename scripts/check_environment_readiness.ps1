param(
    [switch]$SkipLiveSmoke
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false
$repoRoot = Split-Path -Parent $PSScriptRoot
$python = Join-Path $repoRoot ".venv\Scripts\python.exe"
$metadata = Join-Path $repoRoot "output\wizards\metadata.json"
$schemaSql = Join-Path $PSScriptRoot "inspect_supabase_schema.sql"
$projectRef = "pyvftzsodzwfqncjbmbc"
$supabaseCliHome = Join-Path $repoRoot ".codex-supabase-home"
$localSecretDir = Join-Path $repoRoot ".codex-secrets"
$localDbUrlPath = Join-Path $localSecretDir "supabase-db-url.txt"
$failed = [System.Collections.Generic.List[string]]::new()
$wpnNeedsRefresh = $false
$env:SUPABASE_TELEMETRY_DISABLED = "1"
$env:DO_NOT_TRACK = "1"
$env:USERPROFILE = $supabaseCliHome
$env:HOME = $supabaseCliHome
$env:APPDATA = Join-Path $supabaseCliHome "AppData\Roaming"
$env:LOCALAPPDATA = Join-Path $supabaseCliHome "AppData\Local"
New-Item -ItemType Directory -Force -Path $supabaseCliHome | Out-Null
New-Item -ItemType Directory -Force -Path $env:APPDATA | Out-Null
New-Item -ItemType Directory -Force -Path $env:LOCALAPPDATA | Out-Null

function Invoke-SupabaseCli {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $supabaseCommand = Get-Command supabase -ErrorAction Stop
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $supabaseCommand.Source
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    $psi.Environment["SUPABASE_TELEMETRY_DISABLED"] = "1"
    $psi.Environment["DO_NOT_TRACK"] = "1"
    $psi.Environment["USERPROFILE"] = $supabaseCliHome
    $psi.Environment["HOME"] = $supabaseCliHome
    $psi.Environment["APPDATA"] = $env:APPDATA
    $psi.Environment["LOCALAPPDATA"] = $env:LOCALAPPDATA

    $psi.Arguments = ($Arguments | ForEach-Object {
        if ($_ -match '[\s"]') {
            '"' + ($_ -replace '"', '\"') + '"'
        } else {
            $_
        }
    }) -join ' '

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $psi
    [void]$process.Start()
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    $parts = @($stdout.Trim(), ($stderr -replace '(?m)^Initialising login role\.\.\.\s*$', '').Trim()) |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    $text = [string]::Join("`n", $parts)

    [pscustomobject]@{
        Text = $text
        ExitCode = $process.ExitCode
    }
}

function Get-DatabaseUrl {
    if (-not [string]::IsNullOrWhiteSpace($env:SUPABASE_DB_URL)) {
        return $env:SUPABASE_DB_URL
    }
    if (-not [string]::IsNullOrWhiteSpace($env:DATABASE_URL)) {
        return $env:DATABASE_URL
    }
    if (Test-Path $localDbUrlPath) {
        $value = (Get-Content -Raw $localDbUrlPath).Trim()
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            return $value
        }
    }
    return $null
}

function Test-DatabaseUrlShape {
    param([string]$DatabaseUrl)
    return $DatabaseUrl -match '^postgres(ql)?://[^:\s]+:[^@\s]+@[^/\s]+/.+'
}

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
            $wpnNeedsRefresh = $age.TotalHours -ge 24
        }
    } catch {
        Fail "WPN metadata could not be parsed"
    }
}

 $versionResult = Invoke-SupabaseCli -Arguments @("--version")
if ($versionResult.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($versionResult.Text)) {
    Fail "Supabase CLI unavailable"
} else {
    Pass "Supabase CLI $($versionResult.Text.Trim())"
}

$databaseUrl = Get-DatabaseUrl
if (-not [string]::IsNullOrWhiteSpace($databaseUrl)) {
    if (Test-DatabaseUrlShape -DatabaseUrl $databaseUrl) {
        Pass "Supabase direct DB URL configured"
    } else {
        Fail "Supabase DB URL is not a real Postgres connection string; replace the placeholder in SUPABASE_DB_URL or .codex-secrets\supabase-db-url.txt"
        $databaseUrl = $null
        $skipLinkedLiveSmoke = $true
    }
} else {
    $projectsResult = Invoke-SupabaseCli -Arguments @("projects", "list", "--output", "json")
    $projectsText = $projectsResult.Text
    if ($projectsText -notmatch [regex]::Escape($projectRef)) {
        if ($projectsText -match '(?is)(telemetry\.json|\.supabase).*(EPERM|permission|access.*denied)') {
            Fail "Supabase CLI workspace-local profile access blocked unexpectedly"
        } elseif ($projectsText -match '(?is)(access token not provided|supabase login|SUPABASE_ACCESS_TOKEN)') {
            Fail "No Supabase DB URL or workspace auth configured; run scripts\setup_supabase_cli_workspace.ps1 once"
        } else {
            Fail "Supabase CLI authentication/Management API transport unavailable"
        }
        $skipLinkedLiveSmoke = $true
    } else {
        Pass "Supabase CLI authenticated for project $projectRef"
        $skipLinkedLiveSmoke = $false
    }
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

if (-not $SkipLiveSmoke -and -not $skipLinkedLiveSmoke) {
    if (-not [string]::IsNullOrWhiteSpace($databaseUrl)) {
        $smokeResult = Invoke-SupabaseCli -Arguments @("db", "query", "--db-url", $databaseUrl, "--output-format", "json", "select '$projectRef'::text as project_ref, current_database() as database_name, true as ready;")
        $schemaResult = Invoke-SupabaseCli -Arguments @("db", "query", "--db-url", $databaseUrl, "--output-format", "json", "--file", $schemaSql)
    } else {
        $smokeResult = Invoke-SupabaseCli -Arguments @("db", "query", "--linked", "select '$projectRef'::text as project_ref, current_database() as database_name, true as ready;")
        $schemaResult = Invoke-SupabaseCli -Arguments @("db", "query", "--linked", "--file", $schemaSql)
    }
    $smokeText = $smokeResult.Text
    $smokeOk = (
        $smokeText -match [regex]::Escape($projectRef) -and
        $smokeText -match '"ready"\s*:\s*true' -and
        $smokeText -match '"database_name"\s*:\s*"postgres"'
    )

    $telemetryOnlyError = (
        $smokeText -match 'Timeout while shutting down PostHog' -or
        $schemaResult.Text -match 'Timeout while shutting down PostHog'
    )

    $schemaOk = (
        $schemaResult.Text -match 'record_entity_surface_check' -and
        $schemaResult.Text -match 'stage_official_event_observation' -and
        $schemaResult.Text -match 'stage_official_recurring_occurrence_observation' -and
        $schemaResult.Text -match 'reconcile_targeted_recurring_observations' -and
        $schemaResult.Text -match 'reconcile_existing_event_lifecycle' -and
        $schemaResult.Text -match 'promote_event_ingest_run' -and
        $schemaResult.Text -match 'annotate_wpn_event_observation_attention' -and
        -not (($schemaResult.Text -match '"error"') -and ($schemaResult.Text -notmatch 'Timeout while shutting down PostHog'))
    )

    if ((-not $smokeOk -or -not $schemaOk) -and -not ($telemetryOnlyError -and $smokeOk -and $schemaOk)) {
        $liveText = [string]::Join("`n", @($smokeResult.Text, $schemaResult.Text))
        if ($liveText -match '(?is)(telemetry\.json|\.supabase).*(EPERM|permission|access.*denied)') {
            Fail "Supabase CLI workspace-local profile access blocked unexpectedly"
        } elseif ($liveText -match '(?is)(access token not provided|supabase login|SUPABASE_ACCESS_TOKEN)') {
            Fail "No Supabase DB URL or workspace auth configured; run scripts\setup_supabase_cli_workspace.ps1 once"
        } elseif (-not [string]::IsNullOrWhiteSpace($databaseUrl)) {
            Fail "Supabase DB URL connection failed; confirm the copied URI includes the current database password and can connect to the selected pooler"
        } else {
            Fail "Authenticated linked Supabase query path unavailable"
        }
    } else {
        if (-not [string]::IsNullOrWhiteSpace($databaseUrl)) {
            Pass "Direct DB URL live query"
        } else {
            Pass "Direct linked live query"
        }
        Pass "Authoritative schema/function inspection query"
    }
}

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "ENVIRONMENT NOT READY"
    $failed | ForEach-Object { Write-Host "- $_" }
    exit 1
}

if (-not $SkipLiveSmoke -and $wpnNeedsRefresh) {
    Write-Host ""
    Write-Host "WPN snapshot is stale; refreshing and caching it in Supabase now."
    & $python (Join-Path $PSScriptRoot "refresh_wpn_cache.py") --max-age-hours 24
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ENVIRONMENT NOT READY"
        Write-Host "- Automatic stale WPN refresh/cache failed"
        exit 1
    }
}

Write-Host ""
Write-Host "ENVIRONMENT READY"
