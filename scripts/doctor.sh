#!/usr/bin/env bash
set -euo pipefail

missing=0

check_command() {
  local name="$1"
  local install_hint="$2"

  if command -v "$name" >/dev/null 2>&1; then
    printf "OK   %s: %s\n" "$name" "$(command -v "$name")"
  else
    printf "MISS %s: %s\n" "$name" "$install_hint"
    missing=1
  fi
}

if [[ "$(uname -s)" != "Darwin" ]]; then
  printf "WARN 当前系统不是 macOS，桌面应用仅针对 macOS 验证。\n"
fi

check_command node "安装 Node.js 22 或更高版本"
check_command npm "安装 npm"
check_command brew "安装 Homebrew: https://brew.sh"
check_command extract_chmLib "运行: brew install chmlib"

if command -v node >/dev/null 2>&1; then
  node_major="$(node -p "process.versions.node.split('.')[0]")"
  if [[ "$node_major" -lt 22 ]]; then
    printf "MISS node version: 需要 >=22，当前 %s\n" "$(node --version)"
    missing=1
  else
    printf "OK   node version: %s\n" "$(node --version)"
  fi
fi

if [[ "$missing" -ne 0 ]]; then
  printf "\n环境检查未通过，请先按提示安装依赖。\n"
  exit 1
fi

printf "\n环境检查通过。\n"
