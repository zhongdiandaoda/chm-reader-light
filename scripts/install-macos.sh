#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

host_arch="$(uname -m)"
default_arch="x64"
if [[ "$host_arch" == "arm64" ]]; then
  default_arch="arm64"
fi

arch="${1:-$default_arch}"
app_path="$root_dir/dist/CHMReader-darwin-$arch/CHMReader.app"
target_path="/Applications/CHMReader.app"

"$root_dir/scripts/package-macos.sh" "$arch"

install_action="安装"
if [[ -d "$target_path" ]]; then
  install_action="升级"
  printf "检测到已有应用，正在升级: %s\n" "$target_path"
  rm -rf "$target_path"
fi

cp -R "$app_path" "$target_path"

printf "已%s到: %s\n" "$install_action" "$target_path"
printf "如果系统提示无法打开，请在 Finder 中右键应用并选择“打开”。\n"
