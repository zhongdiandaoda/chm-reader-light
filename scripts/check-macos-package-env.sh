#!/usr/bin/env bash
set -euo pipefail

arch="${1:-arm64}"
case "$arch" in
  arm64) ;;
  *) printf "Usage: %s [arm64]\n" "$0" >&2; exit 2 ;;
esac

if [[ "$(uname -s)" != "Darwin" ]]; then
  printf "macOS packaging requires a Mac; current system: %s.\n" "$(uname -s)" >&2
  exit 1
fi

missing_tool=0
for tool in clang codesign curl ditto install_name_tool lipo otool patch shasum swift tar; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf "Missing packaging tool: %s. Install the Xcode Command Line Tools.\n" "$tool" >&2
    missing_tool=1
  fi
done
if [[ "$missing_tool" -ne 0 ]]; then
  exit 1
fi

printf "macOS %s package toolchain preflight passed.\n" "$arch"
