#!/bin/bash
# Dose statusline helper for shell prompts.
MODE_FILE="${TMPDIR:-/tmp}/dose-mode.txt"
if [ -f "$MODE_FILE" ]; then
  echo "🧪 $(cat "$MODE_FILE")"
else
  echo "🧪 dose"
fi
