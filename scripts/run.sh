#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

"$root_dir/scripts/doctor.sh"

if [[ ! -d node_modules ]]; then
  npm install
fi

npm run build
npm start -- "$@"
