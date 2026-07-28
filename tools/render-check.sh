#!/usr/bin/env bash
# Verify every committed SVG is well-formed and actually rasterises.
# librsvg renders SMIL at t=0, so this doubles as the first-frame check.
set -uo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${1:-/tmp/kpanuragh-render}"
mkdir -p "$out_dir"

failures=0
count=0
for svg in "$repo_root"/assets/*.svg; do
  [ -e "$svg" ] || { echo "no SVGs found in assets/"; exit 1; }
  name="$(basename "${svg%.svg}")"
  count=$((count + 1))
  if ! xmllint --noout "$svg" 2>&1; then
    echo "MALFORMED: $name"
    failures=$((failures + 1))
    continue
  fi
  if ! rsvg-convert -w 1000 "$svg" -o "$out_dir/$name.png" 2>&1; then
    echo "RENDER FAILED: $name"
    failures=$((failures + 1))
  fi
done

echo "checked $count asset(s); $failures failure(s); PNGs in $out_dir"
[ "$failures" -eq 0 ]
