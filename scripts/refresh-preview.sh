#!/usr/bin/env bash
# Hook script: after Claude finishes a turn, clean Quarto build artifacts.
#
# What it does:
#   1. Stops any running `quarto preview` processes
#   2. Removes _site/ from the parent project AND each slides/*/ subproject
#   3. Cleans the accumulating quarto-session-temp* dirs inside each .quarto/
#      (keeps xref/, idx/, project-cache/ for fast incremental rebuilds)
#
# Restart `quarto preview` manually when you're ready to view changes.
# Output is appended to /tmp/quarto-refresh.log so you can tail it if something goes wrong.

set -uo pipefail

PROJECT_DIR="/Users/pingfan/Documents/GitHub/talks/2026-agentic-engineering-workshop"
LOG="/tmp/quarto-refresh.log"

cd "$PROJECT_DIR"

{
  echo "=== refresh-preview $(date '+%F %T') ==="

  # 1. Stop existing quarto preview / render
  pkill -f "quarto preview" 2>/dev/null && echo "stopped: quarto preview" || echo "no preview running"
  pkill -f "quarto render"  2>/dev/null || true
  sleep 0.4

  # 2. Delete all _site/ dirs (root + each slide subproject)
  rm -rf _site slides/*/_site
  echo "removed: _site/ (root + slides/*/_site)"

  # 3. Clean only the accumulating session-temp cruft inside .quarto/.
  # Preserve xref/, idx/, project-cache/ so incremental rebuilds stay fast.
  rm -rf .quarto/quarto-session-temp* slides/*/.quarto/quarto-session-temp*
  echo "cleaned: quarto-session-temp* (kept xref/idx/project-cache)"
  echo
} >> "$LOG" 2>&1
