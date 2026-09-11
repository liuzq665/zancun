# 乌东游客向导（wudong-guide）
#
# 启动（本机没装 PowerShell 7，用 powershell；-ExecutionPolicy Bypass 必需）：
#   powershell -NoProfile -ExecutionPolicy Bypass -File launch.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File launch.ps1 -NoOpen
#
# 本文件必须存为 **UTF-8 with BOM** —— Windows PowerShell 5.1 会按 GBK 解码无 BOM 的
# UTF-8 脚本，顶部中文注释会被解成乱码进而吃掉引号结构，导致整个脚本解析失败。
#
# Provider key 的取用顺序（只认一处，避免 DSH 的凭据优先级把它静默覆盖）：
#   1. 环境变量 $env:DEEPSEEK_API_KEY
#   2. 回落到 Claude Code 的 ~/.claude/settings.json 里的 env.ANTHROPIC_AUTH_TOKEN
# key **不会**写入任何文件；DSH 的 ~/.dsh/.credentials.yaml 只存浏览器会话授权。

param(
  [switch]$NoOpen,
  [int]$Port = 3080
)

$ErrorActionPreference = 'Stop'

# 让中文输出在管道/重定向场景下也是 UTF-8，避免被控制台按 GBK 解码成乱码。
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
$dsh = '@deepseek-ai/dsh@0.1.5-rc.1'

# --- 1. 解析 key ---------------------------------------------------------
if (-not $env:DEEPSEEK_API_KEY) {
  $settings = Join-Path $env:USERPROFILE '.claude\settings.json'
  if (Test-Path $settings) {
    $env:DEEPSEEK_API_KEY = (Get-Content $settings -Raw | ConvertFrom-Json).env.ANTHROPIC_AUTH_TOKEN
    if ($env:DEEPSEEK_API_KEY) { Write-Host '[key] 已从 Claude Code 配置复用 DEEPSEEK_API_KEY' }
  }
}
if (-not $env:DEEPSEEK_API_KEY) {
  Write-Error "找不到 DEEPSEEK_API_KEY。请设置环境变量后再启动（见 .env.example）。"
  exit 1
}
$k = $env:DEEPSEEK_API_KEY
Write-Host ('[key] {0}...{1}（{2} 字符）' -f $k.Substring(0, 6), $k.Substring($k.Length - 4), $k.Length)

# --- 2. 数据服务可达性（只是提示，不阻断启动） ----------------------------
try {
  Invoke-WebRequest 'http://127.0.0.1:8001/api/hotel/list?page=1&size=1' -UseBasicParsing -TimeoutSec 5 | Out-Null
  Write-Host '[api] 数据服务 127.0.0.1:8001 可访问'
} catch {
  Write-Warning '[api] 数据服务 127.0.0.1:8001 不可访问 —— 向导会如实回答「查不到」，请先启动 wudong-server。'
}

# --- 3. 启动 -------------------------------------------------------------
$patch = Join-Path $here 'cordis.patch.yml'
$dshArgs = @('--profile', 'web', '--patch', $patch, '--port', $Port)
if ($NoOpen) { $dshArgs += '--no-open' }

Write-Host "[dsh] npx $dsh $($dshArgs -join ' ')"
$env:DSH_PERMISSION_MODE = 'read-only'
npx --yes $dsh @dshArgs
