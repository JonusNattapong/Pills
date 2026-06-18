# Dose statusline helper for PowerShell prompts.
$modeFile = "$env:TEMP\dose-mode.txt"
if (Test-Path $modeFile) {
  "🧪 $(Get-Content $modeFile -Raw).Trim()"
} else {
  "🧪 dose"
}
