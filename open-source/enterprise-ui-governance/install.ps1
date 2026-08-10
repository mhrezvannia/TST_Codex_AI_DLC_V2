param(
    [string]$Destination = ""
)

$ErrorActionPreference = "Stop"

$source = Join-Path $PSScriptRoot "skills\enterprise-ui-governance"

if (-not (Test-Path -LiteralPath $source)) {
    throw "Skill source not found: $source"
}

if ([string]::IsNullOrWhiteSpace($Destination)) {
    $codexRoot = if ([string]::IsNullOrWhiteSpace($env:CODEX_HOME)) {
        Join-Path $env:USERPROFILE ".codex"
    } else {
        $env:CODEX_HOME
    }
    $Destination = Join-Path $codexRoot "skills\enterprise-ui-governance"
}

$resolvedParent = [IO.Path]::GetFullPath((Split-Path -Parent $Destination))
$resolvedDestination = [IO.Path]::GetFullPath($Destination)

if (Test-Path -LiteralPath $resolvedDestination) {
    throw "Destination already exists: $resolvedDestination"
}

New-Item -ItemType Directory -Path $resolvedParent -Force | Out-Null
Copy-Item -LiteralPath $source -Destination $resolvedDestination -Recurse

Write-Output "Installed enterprise-ui-governance to $resolvedDestination"
Write-Output "Restart Codex, then invoke `$enterprise-ui-governance."
