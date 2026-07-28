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
case "$arch" in
  arm64|x64) ;;
  *)
    printf "用法: %s [arm64|x64]\n" "$0"
    exit 2
    ;;
esac

"$root_dir/scripts/doctor.sh"

if [[ ! -d node_modules ]]; then
  npm install
fi

if [[ "${SKIP_CHECKS:-0}" != "1" ]]; then
  npm test
  npm run check
fi

./node_modules/.bin/electron-packager . CHMReaderLight \
  --platform=darwin \
  --arch="$arch" \
  --out=dist \
  --overwrite \
  --app-bundle-id=com.liuqi.chmreader \
  --app-category-type=public.app-category.reference

printf "\n已生成: %s\n" "$root_dir/dist/CHMReaderLight-darwin-$arch/CHMReaderLight.app"
