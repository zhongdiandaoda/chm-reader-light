#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_svg="$root_dir/src/assets/app-logo.svg"
output_icns="${1:-$root_dir/build/assets/app-icon.icns}"

if [[ ! -f "$source_svg" ]]; then
  printf "未找到图标源文件: %s\n" "$source_svg" >&2
  exit 1
fi

mkdir -p "$(dirname "$output_icns")"

work_dir="$(mktemp -d "${TMPDIR:-/tmp}/chmreader-icon.XXXXXX")"
iconset_dir="$work_dir/app.iconset"
mkdir -p "$iconset_dir"

cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT

while IFS=: read -r filename pixels; do
  sips -z "$pixels" "$pixels" -s format png "$source_svg" --out "$iconset_dir/$filename" >/dev/null
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

iconutil -c icns "$iconset_dir" -o "$output_icns"
printf "已生成 macOS 图标: %s\n" "$output_icns"
