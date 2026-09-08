# Roadmap

CHMReaderLight stays focused on one job: making local CHM manuals pleasant to keep, find, and read on macOS. This roadmap highlights near-term work that can help users evaluate the project and help contributors pick useful issues.

For the current platform, distribution, trust, and scope snapshot, start with [Project Status](./project-status.md).

## Current Focus

- Better CHM compatibility reports: collect reproducible examples for table-of-contents parsing, character encoding, broken internal links, and search indexing. See [Compatibility Notes](./compatibility.md) for current expectations.
- Faster library workflows: improve bulk import feedback, stale-path recovery, duplicate handling, and source-file reveal behavior for large local documentation folders.
- More polished macOS distribution: keep Apple Silicon and Intel release artifacts reliable, improve installation notes, and use [Signing and Notarization](./signing-notarization.md) to track macOS trust expectations.
- Safer reading defaults: preserve the current no-script reader posture while making resource loading failures easier to diagnose.

## Good First Areas

- Add focused tests for real-world `.hhc` table-of-contents shapes.
- Improve troubleshooting notes with specific symptoms and fixes from user reports.
- Refine keyboard navigation and focus behavior in the library and reader views.
- Expand packaging checks so release artifacts are easier to verify before publishing.

## Not Planned

- Cloud sync or hosted document storage.
- Editing or authoring CHM files.
- Cross-platform packaging before the macOS app is stable and easy to install.

## Suggesting Changes

Open an issue with the user problem, the CHM behavior you expected, the behavior you saw, and the macOS version and chip architecture you tested on. For compatibility bugs, check [Troubleshooting](./troubleshooting.md) and [Compatibility Notes](./compatibility.md) first so the report can focus on gaps that are not already documented.
