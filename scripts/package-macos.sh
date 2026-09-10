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
mkdir -p "$root_dir/dist"
staging_root="$(mktemp -d "$root_dir/dist/.package-$arch.XXXXXX")"

cleanupPackagingStaging() {
  rm -rf "$staging_root"
}
trap cleanupPackagingStaging EXIT

./node_modules/.bin/electron-packager . CHMReaderLight \
  --platform=darwin \
  --arch="$arch" \
  --out="$staging_root" \
  --overwrite \
  --ignore="$package_ignore" \
  --icon="$icon_path" \
  --app-bundle-id=com.liuqi.chmreader \
  --app-category-type=public.app-category.reference \
  --extend-info="$root_dir/resources/macos/Info.plist"

staged_package_dir="$staging_root/CHMReaderLight-darwin-$arch"
app_path="$staged_package_dir/CHMReaderLight.app"
"$root_dir/scripts/vendor-chmlib-macos.sh" \
  "$app_path" \
  "$arch"
node "$root_dir/scripts/flip-electron-fuses.js" "$app_path"
node "$root_dir/scripts/sign-macos-app.js" "$app_path"

publishPackagedApp() {
  local final_package_dir="$root_dir/dist/CHMReaderLight-darwin-$arch"
  local backup_package_dir="$staging_root/previous-package"

  if [[ -e "$final_package_dir" ]]; then
    mv "$final_package_dir" "$backup_package_dir"
  fi
  if ! mv "$staged_package_dir" "$final_package_dir"; then
    if [[ -e "$backup_package_dir" ]]; then
      mv "$backup_package_dir" "$final_package_dir"
    fi
    return 1
  fi
  rm -rf "$backup_package_dir"
}

publishPackagedApp
final_app_path="$root_dir/dist/CHMReaderLight-darwin-$arch/CHMReaderLight.app"
printf "\n已生成: %s\n" "$final_app_path"
