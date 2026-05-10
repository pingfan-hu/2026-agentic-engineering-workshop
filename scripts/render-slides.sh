#!/usr/bin/env bash
set -e

for d in slides/*/; do
  [ -f "${d}_quarto.yml" ] || continue
  echo "Rendering ${d}"
  quarto render "${d}"
  mkdir -p "_site/${d}"
  cp -R "${d}_site/." "_site/${d}"
done
