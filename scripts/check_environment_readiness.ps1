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
$failed = [System.Collections.Generic.List[string]]::new()
$env:SUPABASE_TELEMETRY_DISABLED = "1"

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

 $versionResult = Invoke-SupabaseCli -Arguments @("--version")
if ($versionResult.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($versionResult.Text)) {
    Fail "Supabase CLI unavailable"
} else {
    Pass "Supabase CLI $($versionResult.Text.Trim())"
}

 $projectsResult = Invoke-SupabaseCli -Arguments @("projects", "list", "--output", "json")
$projectsText = $projectsResult.Text
if ($projectsText -notmatch [regex]::Escape($projectRef)) {
    Fail "Supabase CLI authentication/Management API transport unavailable"
} else {
    Pass "Supabase CLI authenticated for project $projectRef"
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
    $smokeResult = Invoke-SupabaseCli -Arguments @("db", "query", "--linked", "select '$projectRef'::text as project_ref, current_database() as database_name, true as ready;")
    $smokeText = $smokeResult.Text
    $smokeOk = (
        $smokeText -match [regex]::Escape($projectRef) -and
        $smokeText -match '"ready"\s*:\s*true' -and
        $smokeText -match '"database_name"\s*:\s*"postgres"'
    )

    $schemaResult = Invoke-SupabaseCli -Arguments @("db", "query", "--linked", "--file", $schemaSql)
    $schemaOk = (
        $schemaResult.Text -match 'record_entity_surface_check' -and
        $schemaResult.Text -match 'upsert_attributable_official_event' -and
        -not (($schemaResult.Text -match '"error"') -and ($schemaResult.Text -notmatch 'Timeout while shutting down PostHog'))
    )

    if (-not $smokeOk -or -not $schemaOk) {
        Fail "Authenticated linked Supabase query path unavailable"
    } else {
        Pass "Direct linked live query"
        Pass "Authoritative schema/function inspection query"
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
