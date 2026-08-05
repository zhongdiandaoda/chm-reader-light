#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  printf "用法: %s <CHMReaderLight.app> <arm64|x64>\n" "$0" >&2
  exit 2
fi

app_path="$1"
arch="$2"

case "$arch" in
  arm64)
    homebrew_prefix="/opt/homebrew"
    ;;
  x64)
    homebrew_prefix="/usr/local"
    ;;
  *)
    printf "不支持的架构: %s\n" "$arch" >&2
    exit 2
    ;;
esac

extractor="$homebrew_prefix/bin/extract_chmLib"
if [[ ! -x "$extractor" ]]; then
  printf "未找到 %s 架构的 extract_chmLib: %s\n" "$arch" "$extractor" >&2
  printf "请先在打包机安装对应架构的 chmlib，或只打包当前机器架构。\n" >&2
  exit 1
fi

libchm="$(otool -L "$extractor" | awk '/libchm[.][0-9]+[.]dylib/ { print $1; exit }')"
if [[ -z "$libchm" || ! -f "$libchm" ]]; then
  printf "无法定位 extract_chmLib 依赖的 libchm dylib。\n" >&2
  exit 1
fi

native_dir="$app_path/Contents/Resources/native/darwin-$arch"
bin_dir="$native_dir/bin"
lib_dir="$native_dir/lib"
lib_name="$(basename "$libchm")"
mkdir -p "$bin_dir" "$lib_dir"

cp "$extractor" "$bin_dir/extract_chmLib"
cp "$libchm" "$lib_dir/$lib_name"
chmod 755 "$bin_dir/extract_chmLib"
chmod 644 "$lib_dir/$lib_name"

install_name_tool -id "@loader_path/$lib_name" "$lib_dir/$lib_name"
install_name_tool -change "$libchm" "@loader_path/../lib/$lib_name" "$bin_dir/extract_chmLib"

codesign --force --sign - "$lib_dir/$lib_name"
codesign --force --sign - "$bin_dir/extract_chmLib"

printf "已内置 chmlib: %s\n" "$native_dir"
