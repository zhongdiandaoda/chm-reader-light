#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
chmlib_commit="2bef8d063ec7d88a8de6fd9f0513ea42ac0fa21f"
archive_sha256="c6a6e0cc46d0597045e82972347f95744bb2da6c1db7afc6db303051b37b1ca7"
archive_url="https://github.com/jedwing/CHMLib/archive/${chmlib_commit}.tar.gz"
reference_fix="08179946a745cf1605e4b9670942ec1a6e1f4c5d"
security_patch_path="$root_dir/vendor/chmlib/CVE-2025-48172.patch"
limits_patch_path="$root_dir/vendor/chmlib/extraction-limits.patch"
deployment_target="12.0"

if [[ $# -ne 1 ]]; then
  printf "Usage: %s <arm64>\n" "$0" >&2
  exit 2
fi
arch="$1"
output_dir="$root_dir/.native-build/darwin-$arch"
case "$arch" in
  arm64) macho_arch="arm64" ;;
  *) printf "Unsupported architecture: %s.\n" "$arch" >&2; exit 2 ;;
esac

"$root_dir/scripts/check-macos-package-env.sh" "$arch"
temp_root="${TMPDIR:-/tmp}"
work_dir="$(mktemp -d "${temp_root%/}/chmreader-chmlib.XXXXXX")"
cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT
archive_path="$work_dir/chmlib.tar.gz"
if [[ -n "${CHMLIB_ARCHIVE_PATH:-}" ]]; then
  cp "$CHMLIB_ARCHIVE_PATH" "$archive_path"
else
  curl --fail --location --proto '=https' --tlsv1.2 --retry 3 --output "$archive_path" "$archive_url"
fi
printf "%s  %s\n" "$archive_sha256" "$archive_path" | shasum -a 256 -c -
tar -xzf "$archive_path" -C "$work_dir"
source_dir="$work_dir/CHMLib-$chmlib_commit"
patch --batch --forward --fuzz=0 --directory "$source_dir" -p1 < "$security_patch_path"
patch --batch --forward --fuzz=0 --directory "$source_dir" -p1 < "$limits_patch_path"

stage_dir="$work_dir/stage"
mkdir -p "$stage_dir/bin" "$stage_dir/lib" "$stage_dir/source"
libchm="$stage_dir/lib/libchm.0.dylib"
extractor="$stage_dir/bin/extract_chmLib"
clang -arch "$macho_arch" -mmacosx-version-min=12.0 -std=c99 -O2 -fPIC -dynamiclib \
  -Wno-macro-redefined \
  -Wl,-reproducible \
  -Wl,-install_name,@loader_path/../lib/libchm.0.dylib \
  -Wl,-compatibility_version,1.0.0 -Wl,-current_version,1.0.0 \
  -I "$source_dir/src" "$source_dir/src/chm_lib.c" "$source_dir/src/lzx.c" \
  -o "$libchm"
clang -arch "$macho_arch" -mmacosx-version-min=12.0 -std=c99 -O2 -I "$source_dir/src" \
  -Wl,-reproducible \
  "$source_dir/src/extract_chmLib.c" "$libchm" -o "$extractor"
chmod 755 "$extractor"
chmod 644 "$libchm"
cp "$archive_path" "$stage_dir/source/CHMLib-$chmlib_commit.tar.gz"
cp "$security_patch_path" "$stage_dir/source/CVE-2025-48172.patch"
cp "$limits_patch_path" "$stage_dir/source/extraction-limits.patch"
cp "$source_dir/COPYING" "$stage_dir/source/COPYING.CHMLib"
extractor_sha256="$(shasum -a 256 "$extractor" | awk '{ print $1 }')"
library_sha256="$(shasum -a 256 "$libchm" | awk '{ print $1 }')"
patch_sha256="$(shasum -a 256 "$security_patch_path" | awk '{ print $1 }')"
limits_patch_sha256="$(shasum -a 256 "$limits_patch_path" | awk '{ print $1 }')"
compiler="$(clang --version | sed -n '1p')"
cat > "$stage_dir/CHMLIB-PROVENANCE.txt" <<EOF
Component: CHMLib
Version: 0.40a
License: LGPL-2.1-or-later
Upstream: https://github.com/jedwing/CHMLib
Source-Commit: $chmlib_commit
Source-Archive: $archive_url
Source-Archive-SHA256: $archive_sha256
Security-Patch: CVE-2025-48172
Reference-Fix: https://github.com/sumatrapdfreader/sumatrapdf/commit/$reference_fix
Patch-SHA256: $patch_sha256
Extraction-Limits-Patch: extraction-limits.patch
Extraction-Limits-Patch-SHA256: $limits_patch_sha256
Target-Architecture: $arch
Deployment-Target: $deployment_target
Compiler: $compiler
Extractor-SHA256: $extractor_sha256
Library-SHA256: $library_sha256
Corresponding-Source: source/CHMLib-$chmlib_commit.tar.gz plus source/CVE-2025-48172.patch and source/extraction-limits.patch
EOF

"$root_dir/scripts/check-chmlib-macos.sh" "$arch" "$stage_dir"
rm -rf "$output_dir"
mkdir -p "$(dirname "$output_dir")"
mv "$stage_dir" "$output_dir"
printf "Built pinned CVE-patched CHMLib for macOS %s: %s\n" "$arch" "$output_dir"
