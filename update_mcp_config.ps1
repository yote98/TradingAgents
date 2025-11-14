# Update MCP Configuration for TradingAgents
$mcpConfigPath = "$env:USERPROFILE\.kiro\settings\mcp.json"

$config = @{
    mcpServers = @{
        fetch = @{
            command = "uvx"
            args = @("mcp-server-fetch")
            env = @{}
            disabled = $true
            autoApprove = @()
        }
        tradingagents = @{
            command = "python"
            args = @("-m", "mcp_server")
            env = @{
                PYTHONPATH = (Get-Location).Path
            }
            disabled = $false
            autoApprove = @()
        }
    }
}

$config | ConvertTo-Json -Depth 10 | Set-Content -Path $mcpConfigPath -Encoding UTF8

Write-Host "✓ MCP configuration updated successfully!" -ForegroundColor Green
Write-Host "✓ TradingAgents MCP server added" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Restart Kiro or reconnect the MCP server from the MCP Server view" -ForegroundColor Yellow
