#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
arch="${1:-}"
output_dir="${2:-$root_dir}"

case "$arch" in
  arm64) ;;
  *)
    printf "Usage: %s <arm64> [output-directory]\n" "$0" >&2
    exit 2
    ;;
esac

artifact_name="CHMReaderLight-mac-$arch.zip"
app_path="$root_dir/dist/CHMReaderLight-darwin-$arch/CHMReaderLight.app"
resolved_output_dir="$(mkdir -p "$output_dir" && cd "$output_dir" && pwd)"
artifact_path="$resolved_output_dir/$artifact_name"
checksum_path="$artifact_path.sha256"

if [[ -e "$artifact_path" || -e "$checksum_path" ]]; then
  printf "Refusing to overwrite an existing release artifact or checksum in %s\n" "$resolved_output_dir" >&2
  exit 1
fi

temporary_artifact_path="$resolved_output_dir/.$artifact_name.$$.tmp.zip"
temporary_checksum_path="$resolved_output_dir/.$artifact_name.$$.tmp.sha256"
publishing_started=0
publication_complete=0

cleanup_temporary_outputs() {
  rm -f "$temporary_artifact_path" "$temporary_checksum_path"
  if [[ "$publishing_started" == "1" && "$publication_complete" != "1" ]]; then
    rm -f "$artifact_path" "$checksum_path"
  fi
}
trap cleanup_temporary_outputs EXIT

"$root_dir/scripts/package-macos.sh" "$arch"
ditto -c -k --sequesterRsrc --keepParent "$app_path" "$temporary_artifact_path"
artifact_sha256="$(shasum -a 256 "$temporary_artifact_path" | awk '{ print $1 }')"
printf "%s  %s\n" "$artifact_sha256" "$artifact_name" > "$temporary_checksum_path"
"$root_dir/scripts/check-macos-release-bundle.sh" "$temporary_artifact_path" "$arch"

publishing_started=1
mv "$temporary_artifact_path" "$artifact_path"
mv "$temporary_checksum_path" "$checksum_path"
publication_complete=1

printf "Generated release artifact: %s\n" "$artifact_path"
printf "Generated release checksum: %s\n" "$checksum_path"
