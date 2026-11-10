<#
.SYNOPSIS
    Installs the tools needed for the Copilot Managed Runtime labs on Windows.

.DESCRIPTION
    Installs (or reports as already installed):
      - Node.js LTS (includes npm)
      - Git for Windows (includes Git Credential Manager)
      - Visual Studio Code
      - GitHub Copilot CLI
      - Copilot Managed Runtime CLI (ms)

    The script never changes your npm registry, proxy, or winget sources.
    Packages are downloaded through whatever your machine is already configured
    to use, so company-managed registries keep working.

.PARAMETER CheckOnly
    Only report what is installed. Nothing is installed or changed.

.EXAMPLE
    .\scripts\Install-Prerequisites.ps1

.EXAMPLE
    .\scripts\Install-Prerequisites.ps1 -CheckOnly
#>
[CmdletBinding()]
param(
    [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'

$MinNode = [version]'24.11.0'
$MinGit = [version]'2.27.0'

function Write-Step([string]$Text) { Write-Host "`n==> $Text" -ForegroundColor Cyan }
function Write-Ok([string]$Text) { Write-Host "    [OK]      $Text" -ForegroundColor Green }
function Write-Missing([string]$Text) { Write-Host "    [MISSING] $Text" -ForegroundColor Yellow }
function Write-Fail([string]$Text) { Write-Host "    [FAILED]  $Text" -ForegroundColor Red }

function Update-SessionPath {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = (@($machine, $user) | Where-Object { $_ }) -join ';'
}

function Get-ToolVersion([string]$Command, [string[]]$Arguments) {
    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) { return $null }
    # Some CLIs write banners to stderr, which Windows PowerShell 5 treats as an error under 'Stop'.
    $ErrorActionPreference = 'Continue'
    try {
        $output = & $Command @Arguments 2>&1 | Out-String
        if ($LASTEXITCODE -ne 0) { return $null }
        $match = [regex]::Match($output, '\d+\.\d+(\.\d+)?')
        if ($match.Success) { return [version]$match.Value }
        return [version]'0.0'
    }
    catch { return $null }
}

function Install-WithWinget([string]$Id, [string]$Name) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Fail "winget is not available. Install $Name manually, then run this script again."
        return $false
    }
    Write-Host "    Installing $Name with winget ($Id)..."
    winget install --id $Id --exact --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "winget could not install $Name (exit code $LASTEXITCODE)."
        return $false
    }
    Update-SessionPath
    return $true
}

function Install-WithNpm([string]$Package, [string]$Name) {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Fail "npm is not available, so $Name cannot be installed yet."
        return $false
    }
    Write-Host "    Installing $Name with npm ($Package), using your configured npm registry..."
    npm install --global $Package
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "npm could not install $Name. Ask your administrator whether $Package is available in the company registry."
        return $false
    }
    Update-SessionPath
    return $true
}

$results = [ordered]@{}

# 1. Node.js
Write-Step 'Node.js LTS'
$nodeVersion = Get-ToolVersion 'node' @('--version')
if ($nodeVersion -and $nodeVersion -ge $MinNode) {
    Write-Ok "Node.js $nodeVersion"
}
else {
    if ($nodeVersion) { Write-Missing "Node.js $nodeVersion is older than $MinNode" } else { Write-Missing 'Node.js' }
    if (-not $CheckOnly) {
        if (Get-Command nvm -ErrorAction SilentlyContinue) {
            Write-Host '    nvm detected. Installing and selecting the latest LTS with nvm...'
            nvm install lts
            nvm use lts
            Update-SessionPath
        }
        else {
            [void](Install-WithWinget 'OpenJS.NodeJS.LTS' 'Node.js LTS')
        }
        $nodeVersion = Get-ToolVersion 'node' @('--version')
    }
}
$results['Node.js'] = [bool]($nodeVersion -and $nodeVersion -ge $MinNode)

# 2. Git and Git Credential Manager
Write-Step 'Git for Windows and Git Credential Manager'
$gitVersion = Get-ToolVersion 'git' @('--version')
if ($gitVersion -and $gitVersion -ge $MinGit) {
    Write-Ok "Git $gitVersion"
}
else {
    if ($gitVersion) { Write-Missing "Git $gitVersion is older than $MinGit" } else { Write-Missing 'Git' }
    if (-not $CheckOnly) {
        [void](Install-WithWinget 'Git.Git' 'Git for Windows')
        $gitVersion = Get-ToolVersion 'git' @('--version')
    }
}
$results['Git'] = [bool]($gitVersion -and $gitVersion -ge $MinGit)

$gcmVersion = Get-ToolVersion 'git' @('credential-manager', '--version')
if ($gcmVersion) { Write-Ok "Git Credential Manager $gcmVersion" }
else { Write-Missing 'Git Credential Manager (it ships with Git for Windows; reinstall Git if it is missing)' }
$results['Git Credential Manager'] = [bool]$gcmVersion

# 3. Visual Studio Code
Write-Step 'Visual Studio Code'
$codeVersion = Get-ToolVersion 'code' @('--version')
if ($codeVersion) {
    Write-Ok "Visual Studio Code $codeVersion"
}
else {
    Write-Missing 'Visual Studio Code'
    if (-not $CheckOnly) {
        [void](Install-WithWinget 'Microsoft.VisualStudioCode' 'Visual Studio Code')
        $codeVersion = Get-ToolVersion 'code' @('--version')
    }
}
$results['Visual Studio Code'] = [bool]$codeVersion

# 4. GitHub Copilot CLI
Write-Step 'GitHub Copilot CLI'
$copilotVersion = Get-ToolVersion 'copilot' @('--version')
if ($copilotVersion) {
    Write-Ok "GitHub Copilot CLI $copilotVersion"
}
else {
    Write-Missing 'GitHub Copilot CLI'
    if (-not $CheckOnly) {
        if (-not (Install-WithWinget 'GitHub.Copilot' 'GitHub Copilot CLI')) {
            [void](Install-WithNpm '@github/copilot' 'GitHub Copilot CLI')
        }
        $copilotVersion = Get-ToolVersion 'copilot' @('--version')
    }
}
$results['GitHub Copilot CLI'] = [bool]$copilotVersion

# 5. Copilot Managed Runtime CLI
Write-Step 'Copilot Managed Runtime CLI (ms)'
$msVersion = Get-ToolVersion 'ms' @('--version')
if ($msVersion) {
    Write-Ok "ms $msVersion"
}
else {
    Write-Missing 'Copilot Managed Runtime CLI'
    if (-not $CheckOnly) {
        [void](Install-WithNpm '@microsoft/managed-apps-cli' 'Copilot Managed Runtime CLI')
        $msVersion = Get-ToolVersion 'ms' @('--version')
    }
}
$results['Copilot Managed Runtime CLI'] = [bool]$msVersion

# Summary
Write-Step 'Summary'
$allGood = $true
foreach ($entry in $results.GetEnumerator()) {
    if ($entry.Value) { Write-Ok $entry.Key } else { Write-Fail $entry.Key; $allGood = $false }
}

if ($allGood) {
    Write-Host "`nAll tools are ready." -ForegroundColor Green
    Write-Host 'Close and reopen your terminal so every new command is on PATH, then continue with the lab.'
    exit 0
}

if ($CheckOnly) {
    Write-Host "`nRun the script again without -CheckOnly to install the missing tools." -ForegroundColor Yellow
}
else {
    Write-Host "`nSome tools could not be installed. Read the messages above, fix them, then run the script again." -ForegroundColor Yellow
}
exit 1
