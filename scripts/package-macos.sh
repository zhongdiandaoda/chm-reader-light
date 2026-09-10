#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

arch="${1:-arm64}"
case "$arch" in
  arm64) ;;
  *)
    printf "用法: %s [arm64]\n" "$0"
    exit 2
    ;;
esac

"$root_dir/scripts/check-macos-package-env.sh" "$arch"
"$root_dir/scripts/doctor.sh"

if [[ ! -d node_modules ]]; then
  npm install
fi

if [[ "${SKIP_CHECKS:-0}" != "1" ]]; then
  npm test
  npm run check
else
  npm run build
fi

native_build_dir="$root_dir/.native-build/darwin-$arch"
if "$root_dir/scripts/check-chmlib-macos.sh" "$arch" "$native_build_dir" >/dev/null 2>&1; then
  printf "Reusing verified CHMLib build: %s\n" "$native_build_dir"
else
  "$root_dir/scripts/build-chmlib-macos.sh" "$arch"
fi

icon_path="$root_dir/build/assets/app-icon.icns"
"$root_dir/scripts/generate-macos-icon.sh" "$icon_path"
package_ignore='^/(?:build/assets/app-icon[.]icns$|(?!build(?:/|$)|node_modules(?:/|$)|package[.]json$|LICENSE$|THIRD_PARTY_NOTICES[.]md$).*)'

./node_modules/.bin/electron-packager . CHMReaderLight \
  --platform=darwin \
  --arch="$arch" \
  --out=dist \
  --overwrite \
  --ignore="$package_ignore" \
  --icon="$icon_path" \
  --app-bundle-id=com.liuqi.chmreader \
  --app-category-type=public.app-category.reference \
  --extend-info="$root_dir/resources/macos/Info.plist"

app_path="$root_dir/dist/CHMReaderLight-darwin-$arch/CHMReaderLight.app"
"$root_dir/scripts/vendor-chmlib-macos.sh" \
  "$app_path" \
  "$arch"
node "$root_dir/scripts/flip-electron-fuses.js" "$app_path"
node "$root_dir/scripts/sign-macos-app.js" "$app_path"

printf "\n已生成: %s\n" "$app_path"
