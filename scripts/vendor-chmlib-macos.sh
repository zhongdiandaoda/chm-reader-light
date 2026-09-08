#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  printf "Usage: %s <CHMReaderLight.app> <arm64|x64> [native-build-directory]\n" "$0" >&2
  exit 2
fi

app_path="$1"
arch="$2"
case "$arch" in
  arm64|x64) ;;
  *) printf "Unsupported architecture: %s.\n" "$arch" >&2; exit 2 ;;
esac
if [[ ! -d "$app_path/Contents/Resources" ]]; then
  printf "Expected a packaged macOS app: %s\n" "$app_path" >&2
  exit 1
fi

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="${3:-$root_dir/.native-build/darwin-$arch}"
"$root_dir/scripts/check-chmlib-macos.sh" "$arch" "$source_dir"

native_dir="$app_path/Contents/Resources/native/darwin-$arch"
rm -rf "$native_dir"
mkdir -p "$(dirname "$native_dir")"
cp -R "$source_dir" "$native_dir"
libchm="$native_dir/lib/libchm.0.dylib"
extractor="$native_dir/bin/extract_chmLib"
codesign --force --sign - "$libchm"
codesign --force --sign - "$extractor"
provenance="$native_dir/CHMLIB-PROVENANCE.txt"
extractor_sha256="$(shasum -a 256 "$extractor" | awk '{ print $1 }')"
library_sha256="$(shasum -a 256 "$libchm" | awk '{ print $1 }')"
awk -F': ' -v extractor_sha256="$extractor_sha256" -v library_sha256="$library_sha256" '
  $1 == "Extractor-SHA256" { print "Extractor-SHA256: " extractor_sha256; next }
  $1 == "Library-SHA256" { print "Library-SHA256: " library_sha256; next }
  { print }
' "$provenance" > "$provenance.tmp"
mv "$provenance.tmp" "$provenance"
"$root_dir/scripts/check-chmlib-macos.sh" "$arch" "$native_dir"

printf "Vendored pinned CVE-patched CHMLib: %s\n" "$native_dir"
