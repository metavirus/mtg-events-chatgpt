param(
  [switch]$FullRepo
)
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$textExtensions = @(".md", ".json", ".js", ".css", ".html", ".py")
$jsonFiles = @("stores.json", "events.json", "sources.json", "changes.json")
$suspiciousFragments = @(
  ([string][char]0x00E2 + [char]0x20AC + [char]0x0153), # â€œ
  ([string][char]0x00E2 + [char]0x20AC),                # â€
  ([string][char]0x00E2 + [char]0x20AC + [char]0x2122), # â€™
  ([string][char]0x00E2 + [char]0x20AC + [char]0x201C), # â€“
  ([string][char]0x00E2 + [char]0x20AC + [char]0x201D), # â€”
  [string][char]0x00C3,                                 # Ã
  [string][char]0x00C2,                                 # Â
  [string][char]0xFFFD
)
$skipDirs = @(".git", ".codex", "output", "node_modules")
$utf8NoBom = New-Object System.Text.UTF8Encoding($false, $true)
$errors = New-Object System.Collections.Generic.List[string]

function Get-GitTextFiles([string[]]$gitArgs) {
  try {
    $pathsFromGit = & git @gitArgs 2>$null
  } catch {
    return @()
  }

  $paths = New-Object System.Collections.Generic.List[string]
  foreach ($relative in $pathsFromGit) {
    if ([string]::IsNullOrWhiteSpace($relative)) { continue }
    $path = Join-Path $root $relative
    if ((Test-Path $path -PathType Leaf)) {
      $file = Get-Item $path
      if (Test-ShouldScan $file) {
        $paths.Add($file.FullName)
      }
    }
  }

  return $paths | Sort-Object -Unique
}

function Test-ShouldScan([System.IO.FileInfo]$file) {
  foreach ($part in $file.FullName.Split([System.IO.Path]::DirectorySeparatorChar)) {
    if ($skipDirs -contains $part) { return $false }
  }
  if ($file.Name -in @("validate_text_integrity.py", "validate_text_integrity.ps1")) {
    return $false
  }
  return $textExtensions -contains $file.Extension.ToLowerInvariant()
}

function Read-Utf8Strict([string]$path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  return $utf8NoBom.GetString($bytes)
}

$filesToScan = @()
$scopeLabel = "full repo"
if (-not $FullRepo) {
  $filesToScan = Get-GitTextFiles @("diff", "--cached", "--name-only", "--diff-filter=ACMR")
  $scopeLabel = "staged files"
  if ($filesToScan.Count -eq 0) {
    $filesToScan = Get-GitTextFiles @("ls-files", "--others", "--exclude-standard")
    $scopeLabel = "untracked files"
  }
}
if ($filesToScan.Count -eq 0) {
  $filesToScan = Get-ChildItem -Path $root -Recurse -File | Where-Object { Test-ShouldScan $_ } | Select-Object -ExpandProperty FullName
  $scopeLabel = "full repo"
}

$filesToScan | ForEach-Object {
  $fileInfo = Get-Item $_
  $relative = Resolve-Path -Relative $fileInfo.FullName
  try {
    $text = Read-Utf8Strict $fileInfo.FullName
  } catch {
    $errors.Add("${relative}: not valid UTF-8 ($($_.Exception.Message))")
    return
  }

  if ($text.Contains("`r`n")) {
    $errors.Add("${relative}: contains CRLF line endings")
  }

  foreach ($fragment in $suspiciousFragments) {
    if ($text.Contains($fragment)) {
      $errors.Add("${relative}: contains suspicious mojibake fragment '$fragment'")
    }
  }
}

foreach ($jsonFile in $jsonFiles) {
  $jsonPath = Join-Path $root $jsonFile
  try {
    $null = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
  } catch {
    $errors.Add("${jsonFile}: invalid JSON ($($_.Exception.Message))")
  }
}

if ($errors.Count -gt 0) {
  Write-Output "Text integrity check failed ($scopeLabel):"
  $errors | ForEach-Object { Write-Output "- $_" }
  exit 1
}

Write-Output "Text integrity check passed ($scopeLabel)."
