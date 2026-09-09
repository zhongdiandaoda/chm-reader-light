# Third-Party Notices

CHMReaderLight itself is distributed under the [MIT License](./LICENSE). Packaged macOS builds also contain the following separately licensed component.

## CHMLib 0.40a

- Project: [CHMLib](https://github.com/jedwing/CHMLib)
- License: GNU Lesser General Public License, version 2.1 or later (`LGPL-2.1-or-later`)
- Pinned source commit: `2bef8d063ec7d88a8de6fd9f0513ea42ac0fa21f`
- Source archive SHA-256: `c6a6e0cc46d0597045e82972347f95744bb2da6c1db7afc6db303051b37b1ca7`
- Local security modification: [`vendor/chmlib/CVE-2025-48172.patch`](./vendor/chmlib/CVE-2025-48172.patch), based on [SumatraPDF commit `08179946a745cf1605e4b9670942ec1a6e1f4c5d`](https://github.com/sumatrapdfreader/sumatrapdf/commit/08179946a745cf1605e4b9670942ec1a6e1f4c5d)
- Local reliability modification: [`vendor/chmlib/extraction-limits.patch`](./vendor/chmlib/extraction-limits.patch), which enforces the documented extraction budgets before writing oversized entries and returns failure for incomplete extraction

The security patch rejects oversized LZXC reset-table lengths before narrowing them to `int`, addressing CVE-2025-48172 / GHSA-rpc6-w47v-qqr6. It is a CHMReaderLight backport; it is not represented as an upstream CHMLib release.

Each packaged app includes the exact upstream source archive, the upstream `COPYING` file, both applied patches, and `CHMLIB-PROVENANCE.txt` under `Contents/Resources/native/darwin-<arch>/`. The verified archive plus patches are the complete corresponding source for the packaged modifications. The helper remains dynamically linked to the separately replaceable `libchm.0.dylib`.

The complete LGPL-2.1 license text is included as `source/COPYING.CHMLib` and is also available from the [GNU licenses site](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html).
