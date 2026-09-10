#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_svg="$root_dir/src/assets/app-logo.svg"
output_icns="${1:-$root_dir/build/assets/app-icon.icns}"
rasterizer="$root_dir/scripts/rasterize-svg.swift"
icns_builder="$root_dir/scripts/build-icns.js"
icon_cache_dir="$root_dir/.native-build/macos-icon"

if [[ ! -f "$source_svg" ]]; then
  printf "未找到图标源文件: %s\n" "$source_svg" >&2
  exit 1
fi

mkdir -p "$(dirname "$output_icns")"
mkdir -p "$icon_cache_dir"

cache_key="$({
  printf '%s\n' '1024x1024 inset=100 corner-radius=185.4'
  node --version
  swift --version 2>&1
  sips --version 2>&1
  shasum -a 256 "$source_svg" "$rasterizer" "$icns_builder"
} | shasum -a 256 | awk '{ print $1 }')"
cached_icon="$icon_cache_dir/$cache_key.icns"
cached_checksum="$cached_icon.sha256"
if [[ -f "$cached_icon" && -f "$cached_checksum" ]] \
  && printf "%s  %s\n" "$(cat "$cached_checksum")" "$cached_icon" | shasum -a 256 -c - >/dev/null 2>&1; then
  cp "$cached_icon" "$output_icns"
  printf "Reusing verified macOS icon: %s\n" "$cached_icon"
  exit 0
fi

work_dir="$(mktemp -d "${TMPDIR:-/tmp}/chmreader-icon.XXXXXX")"
iconset_dir="$work_dir/app.iconset"
source_png="$work_dir/app-icon-1024.png"
mkdir -p "$iconset_dir"

cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT

module_cache_dir="$work_dir/module-cache"
mkdir -p "$module_cache_dir"
SWIFT_MODULECACHE_PATH="$module_cache_dir" \
CLANG_MODULE_CACHE_PATH="$module_cache_dir" \
swift "$rasterizer" \
  "$source_svg" \
  "$source_png" \
  1024 1024 100 185.4

while IFS=: read -r filename pixels; do
  sips -z "$pixels" "$pixels" "$source_png" --out "$iconset_dir/$filename" >/dev/null
done <<'EOF'
icon_16x16.png:16
icon_16x16@2x.png:32
icon_32x32.png:32
icon_32x32@2x.png:64
icon_128x128.png:128
icon_128x128@2x.png:256
icon_256x256.png:256
icon_256x256@2x.png:512
icon_512x512.png:512
icon_512x512@2x.png:1024
EOF

node "$icns_builder" "$iconset_dir" "$output_icns"
temporary_cached_icon="$icon_cache_dir/.$cache_key.$$.tmp.icns"
temporary_cached_checksum="$icon_cache_dir/.$cache_key.$$.tmp.sha256"
cp "$output_icns" "$temporary_cached_icon"
shasum -a 256 "$temporary_cached_icon" | awk '{ print $1 }' > "$temporary_cached_checksum"
mv "$temporary_cached_icon" "$cached_icon"
mv "$temporary_cached_checksum" "$cached_checksum"
