#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  printf "Usage: %s <release.zip> <arm64|x64>\n" "$0" >&2
  exit 2
fi
root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_version="$(node -p "require(process.argv[1]).version" "$root_dir/package.json")"

artifact_path="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
arch="$2"
case "$arch" in
  arm64) macho_arch="arm64" ;;
  x64) macho_arch="x86_64" ;;
  *)
    printf "Unsupported architecture: %s (expected arm64 or x64).\n" "$arch" >&2
    exit 2
    ;;
esac

if [[ "$(uname -s)" != "Darwin" ]]; then
  printf "Release bundle verification requires macOS; current system: %s.\n" "$(uname -s)" >&2
  exit 1
fi
if [[ ! -f "$artifact_path" ]]; then
  printf "Release artifact does not exist: %s\n" "$artifact_path" >&2
  exit 1
fi

work_dir="$(mktemp -d "${TMPDIR:-/tmp}/chmreader-release-check.XXXXXX")"
cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT

ditto -x -k "$artifact_path" "$work_dir"
node "$root_dir/scripts/check-macos-release-root.js" "$work_dir"
app_path="$work_dir/CHMReaderLight.app"
if [[ ! -d "$app_path" ]]; then
  printf "Release artifact must contain CHMReaderLight.app at its root.\n" >&2
  exit 1
fi

main_binary="$app_path/Contents/MacOS/CHMReaderLight"
native_dir="$app_path/Contents/Resources/native/darwin-$arch"
extractor="$native_dir/bin/extract_chmLib"
icon="$app_path/Contents/Resources/electron.icns"
app_asar="$app_path/Contents/Resources/app.asar"
info_plist="$app_path/Contents/Info.plist"

find_single_libchm() {
  local matches=()
  while IFS= read -r match; do
    matches+=("$match")
  done < <(find "$native_dir/lib" -maxdepth 1 -type f -name 'libchm.*.dylib' -print 2>/dev/null | sort)

  if [[ "${#matches[@]}" -ne 1 ]]; then
    printf "Expected exactly one bundled libchm dylib in %s; found %s.\n" \
      "$native_dir/lib" "${#matches[@]}" >&2
    exit 1
  fi
  printf "%s" "${matches[0]}"
}

libchm="$(find_single_libchm)"

check_macho_architecture() {
  local file_path="$1"
  local label="$2"
  local architectures

  if [[ ! -f "$file_path" ]]; then
    printf "Missing %s: %s.\n" "$label" "$file_path" >&2
    exit 1
  fi
  architectures="$(lipo -archs "$file_path")"
  case " $architectures " in
    *" $macho_arch "*) ;;
    *)
      printf "Architecture mismatch for %s: expected %s, got %s.\n" \
        "$label" "$macho_arch" "$architectures" >&2
      exit 1
      ;;
  esac
}

codesign --verify --deep --strict --verbose=2 "$app_path"
node "$root_dir/scripts/check-macos-adhoc-signature.js" "$app_path"
node "$root_dir/scripts/check-electron-fuses.js" "$app_path"
node "$root_dir/scripts/check-electron-asar-integrity.js" "$app_path"
"$root_dir/scripts/check-chmlib-macos.sh" "$arch" "$native_dir"
node "$root_dir/scripts/check-packaged-app-asar.js" "$app_asar"
check_macho_architecture "$main_binary" "app executable"
check_macho_architecture "$extractor" "extract_chmLib"
check_macho_architecture "$libchm" "libchm"

if ! otool -L "$extractor" | grep -Fq "@loader_path/../lib/$(basename "$libchm")"; then
  printf "Bundled extract_chmLib does not link to its bundled libchm with @loader_path/../lib.\n" >&2
  exit 1
fi
if [[ "$(plutil -extract CFBundleIdentifier raw -o - "$info_plist")" != "com.liuqi.chmreader" ]]; then
  printf "Unexpected CFBundleIdentifier in packaged app.\n" >&2
  exit 1
fi
if [[ "$(plutil -extract CFBundleShortVersionString raw -o - "$info_plist")" != "$package_version" ]] ||
   [[ "$(plutil -extract CFBundleVersion raw -o - "$info_plist")" != "$package_version" ]]; then
  printf "Packaged app version does not match package.json version %s.\n" "$package_version" >&2
  exit 1
fi
if [[ "$(plutil -extract LSMinimumSystemVersion raw -o - "$info_plist")" != "12.0" ]]; then
  printf "Unexpected LSMinimumSystemVersion in packaged app.\n" >&2
  exit 1
fi
if [[ "$(plutil -extract CFBundleIconFile raw -o - "$info_plist")" != "electron.icns" ]]; then
  printf "Unexpected CFBundleIconFile in packaged app.\n" >&2
  exit 1
fi
if [[ ! -f "$icon" ]] || [[ "$(sips -g format "$icon" 2>/dev/null)" != *"format: icns"* ]]; then
  printf "Packaged app is missing a readable electron.icns resource.\n" >&2
  exit 1
fi
expected_icon="$work_dir/expected-app-icon.icns"
"$root_dir/scripts/generate-macos-icon.sh" "$expected_icon"
if ! cmp -s "$expected_icon" "$icon"; then
  printf "Packaged app icon does not match the project icon.\n" >&2
  exit 1
fi

printf "macOS %s release bundle verification passed: %s\n" "$arch" "$artifact_path"
