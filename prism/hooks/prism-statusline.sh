#!/bin/bash
# Prism statusline helper for shell prompts.
MODE_FILE="${TMPDIR:-/tmp}/prism-mode.txt"
if [ -f "$MODE_FILE" ]; then
  echo "🧪 $(cat "$MODE_FILE")"
else
  echo "🧪 prism"
fi
