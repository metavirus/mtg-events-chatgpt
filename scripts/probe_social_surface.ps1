param(
    [ValidateSet("instagram", "facebook")]
    [string]$Platform = "instagram",

    [Parameter(Mandatory = $true)]
    [string]$ProfileUrl,

    [int]$MaxLinks = 12,

    [int]$MaxScrolls = 1
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $PSScriptRoot "social_surface_probe.mjs"

if (-not (Test-Path $scriptPath)) {
    throw "Missing social surface probe helper: $scriptPath"
}

Push-Location $repoRoot
try {
    node $scriptPath `
        --platform $Platform `
        --url $ProfileUrl `
        --max-links $MaxLinks `
        --max-scrolls $MaxScrolls
} finally {
    Pop-Location
}
