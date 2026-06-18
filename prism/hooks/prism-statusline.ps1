# Prism statusline helper for PowerShell prompts.
$modeFile = "$env:TEMP\prism-mode.txt"
if (Test-Path $modeFile) {
  "🧪 $(Get-Content $modeFile -Raw).Trim()"
} else {
  "🧪 prism"
}
