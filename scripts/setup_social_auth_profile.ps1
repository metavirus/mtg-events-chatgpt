param(
    [ValidateSet("instagram", "facebook")]
    [string]$Platform = "instagram",

    [string]$ProfileUrl = "",

    [switch]$ProbeOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $PSScriptRoot "social_auth_profile.mjs"

if (-not (Test-Path $scriptPath)) {
    throw "Missing social auth helper: $scriptPath"
}

$argsList = @("--platform", $Platform)
if ($ProfileUrl) {
    $argsList += @("--url", $ProfileUrl)
}
if ($ProbeOnly) {
    $argsList += "--probe-only"
}

Push-Location $repoRoot
try {
    node $scriptPath @argsList
} finally {
    Pop-Location
}
