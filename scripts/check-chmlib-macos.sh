#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
chmlib_commit="2bef8d063ec7d88a8de6fd9f0513ea42ac0fa21f"
archive_sha256="c6a6e0cc46d0597045e82972347f95744bb2da6c1db7afc6db303051b37b1ca7"
deployment_target="12.0"
patch_path="$root_dir/vendor/chmlib/CVE-2025-48172.patch"
limits_patch_path="$root_dir/vendor/chmlib/extraction-limits.patch"

if [[ $# -lt 1 || $# -gt 2 ]]; then
  printf "Usage: %s <arm64|x64> [native-build-directory]\n" "$0" >&2
  exit 2
fi
arch="$1"
native_dir="${2:-$root_dir/.native-build/darwin-$arch}"
case "$arch" in
  arm64) macho_arch="arm64" ;;
  x64) macho_arch="x86_64" ;;
  *) printf "Unsupported architecture: %s.\n" "$arch" >&2; exit 2 ;;
esac

extractor="$native_dir/bin/extract_chmLib"
libchm="$native_dir/lib/libchm.0.dylib"
provenance="$native_dir/CHMLIB-PROVENANCE.txt"
source_archive="$native_dir/source/CHMLib-$chmlib_commit.tar.gz"
bundled_patch="$native_dir/source/CVE-2025-48172.patch"
bundled_limits_patch="$native_dir/source/extraction-limits.patch"
license_file="$native_dir/source/COPYING.CHMLib"
for required in "$extractor" "$libchm" "$provenance" "$source_archive" "$bundled_patch" "$bundled_limits_patch" "$license_file"; do
  if [[ ! -f "$required" ]]; then
    printf "Incomplete patched CHMLib build; missing: %s\n" "$required" >&2
    exit 1
  fi
done
if [[ ! -x "$extractor" ]]; then
  printf "Patched extract_chmLib is not executable: %s\n" "$extractor" >&2
  exit 1
fi

require_provenance() {
  if ! grep -Fqx "$1" "$provenance"; then
    printf "Invalid CHMLib provenance; missing exact field: %s\n" "$1" >&2
    exit 1
  fi
}
require_provenance "Source-Commit: $chmlib_commit"
require_provenance "Source-Archive-SHA256: $archive_sha256"
require_provenance "Security-Patch: CVE-2025-48172"
require_provenance "Extraction-Limits-Patch: extraction-limits.patch"
require_provenance "Target-Architecture: $arch"
require_provenance "Deployment-Target: $deployment_target"
printf "%s  %s\n" "$archive_sha256" "$source_archive" | shasum -a 256 -c - >/dev/null
if ! tar -xOf "$source_archive" "CHMLib-$chmlib_commit/COPYING" | cmp -s - "$license_file"; then
  printf "Bundled CHMLib license differs from the pinned source archive.\n" >&2
  exit 1
fi

if ! cmp -s "$patch_path" "$bundled_patch"; then
  printf "Bundled CVE-2025-48172.patch differs from the audited repository patch.\n" >&2
  exit 1
fi
if ! cmp -s "$limits_patch_path" "$bundled_limits_patch"; then
  printf "Bundled extraction-limits.patch differs from the audited repository patch.\n" >&2
  exit 1
fi
patch_sha256="$(shasum -a 256 "$bundled_patch" | awk '{ print $1 }')"
require_provenance "Patch-SHA256: $patch_sha256"
limits_patch_sha256="$(shasum -a 256 "$bundled_limits_patch" | awk '{ print $1 }')"
require_provenance "Extraction-Limits-Patch-SHA256: $limits_patch_sha256"
for expected in '#include <limits.h>' 'uncompressed_len > INT_MAX' 'compressed_len > INT_MAX' 'block_len == 0 || dest->block_len > INT_MAX'; do
  if ! grep -Fq "$expected" "$bundled_patch"; then
    printf "Bundled CHMLib security patch is missing check: %s\n" "$expected" >&2
    exit 1
  fi
done
for expected in 'MAX_EXTRACTION_ENTRIES 60000' 'MAX_EXTRACTION_FILES 50000' 'MAX_EXTRACTION_TOTAL_BYTES' 'MAX_EXTRACTION_FILE_BYTES' 'return 1;'; do
  if ! grep -Fq "$expected" "$bundled_limits_patch"; then
    printf "Bundled CHMLib extraction limits patch is missing check: %s\n" "$expected" >&2
    exit 1
  fi
done

check_recorded_sha256() {
  local field="$1"
  local file_path="$2"
  local expected actual
  expected="$(awk -F': ' -v key="$field" '$1 == key { print $2 }' "$provenance")"
  actual="$(shasum -a 256 "$file_path" | awk '{ print $1 }')"
  if [[ -z "$expected" || "$actual" != "$expected" ]]; then
    printf "CHMLib provenance hash mismatch for %s.\n" "$file_path" >&2
    exit 1
  fi
}
check_recorded_sha256 "Extractor-SHA256" "$extractor"
check_recorded_sha256 "Library-SHA256" "$libchm"

for binary in "$extractor" "$libchm"; do
  architectures="$(lipo -archs "$binary")"
  case " $architectures " in
    *" $macho_arch "*) ;;
    *) printf "Architecture mismatch for %s: expected %s, got %s.\n" "$binary" "$macho_arch" "$architectures" >&2; exit 1 ;;
  esac
  binary_minos="$(otool -l "$binary" | awk '/LC_BUILD_VERSION/ { in_build_version = 1; next } in_build_version && $1 == "minos" { print $2; exit }')"
  if [[ "$binary_minos" != "$deployment_target" ]]; then
    printf "Deployment target mismatch for %s: expected %s, got %s.\n" \
      "$binary" "$deployment_target" "${binary_minos:-missing}" >&2
    exit 1
  fi
done
if ! otool -L "$extractor" | grep -Fq "@loader_path/../lib/$(basename "$libchm")"; then
  printf "Patched extract_chmLib does not use the bundled @loader_path/../lib dependency.\n" >&2
  exit 1
fi

printf "Verified pinned CVE-patched CHMLib build for macOS %s: %s\n" "$arch" "$native_dir"
