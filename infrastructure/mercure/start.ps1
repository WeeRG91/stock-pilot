& {
    $mercureSecretEntry = Get-Content -LiteralPath `
        'C:\Sites\stock-pilot-symfony\backend\.env.local' |
        Where-Object { $_.StartsWith('MERCURE_JWT_SECRET=') } |
        Select-Object -Last 1

    if ([string]::IsNullOrWhiteSpace($mercureSecretEntry)) {
        throw 'MERCURE_JWT_SECRET was not found in backend/.env.local.'
    }

    $env:MERCURE_JWT_SECRET = $mercureSecretEntry.Substring(
        'MERCURE_JWT_SECRET='.Length
    ).Trim().Trim("'").Trim('"')

    Remove-Variable mercureSecretEntry

    try {
        Push-Location "$env:USERPROFILE\Tools\Mercure"

        $configPath = 'C:\Sites\stock-pilot-symfony\infrastructure\mercure\Caddyfile.dev'

        & .\mercure.exe validate --config $configPath --adapter caddyfile

        if ($LASTEXITCODE -ne 0) {
            throw 'Mercure configuration validation failed.'
        }

        & .\mercure.exe run --config $configPath --adapter caddyfile
    }
    finally {
        Pop-Location
        Remove-Item Env:\MERCURE_JWT_SECRET -ErrorAction SilentlyContinue
    }
}