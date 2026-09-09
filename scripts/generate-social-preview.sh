#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_svg="$root_dir/docs/assets/social-preview.svg"
output_png="$root_dir/docs/assets/social-preview.png"
module_cache_dir="$(mktemp -d "${TMPDIR:-/tmp}/chmreader-social-preview.XXXXXX")"

cleanup() {
  rm -rf "$module_cache_dir"
}
trap cleanup EXIT

SWIFT_MODULECACHE_PATH="$module_cache_dir" \
CLANG_MODULE_CACHE_PATH="$module_cache_dir" \
swift "$root_dir/scripts/rasterize-svg.swift" \
  "$source_svg" \
  "$output_png" \
  1280 \
  640

node "$root_dir/scripts/write-visual-asset-manifest.js"
node "$root_dir/scripts/check-visual-assets.js"
