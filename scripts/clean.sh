#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

rm -rf build dist .test-build .build-node .build-browser .native-build
printf "已清理构建、打包和测试产物。\n"
