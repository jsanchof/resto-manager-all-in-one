# PowerShell script for running Flask-Migrate commands on Windows

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$migrationsPath = Join-Path $projectRoot 'migrations'

function Creating-Migration {
    pipenv run init
    pipenv run migrate
    pipenv run upgrade
}

function Migrate-Upgrade {
    pipenv run migrate
    pipenv run upgrade
}

if (-Not (Test-Path $migrationsPath)) {
    Write-Host 'Creating migration...'
    Creating-Migration
} else {
    Write-Host 'Migrations already created.'
    Write-Host 'Updating migrations...'
    Migrate-Upgrade
} 