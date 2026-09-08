# Good First Contributions

Use this guide when you want a small, reviewable first pull request. The best first changes are easy to explain, easy to verify, and connected to a real CHMReaderLight user workflow.

## Choose a Small Area

- CHM compatibility fixtures: add focused examples for table-of-contents nesting, text encoding, internal links, image paths, or search indexing behavior. Use the [Sample CHM Guide](./sample-chm-guide.md) to keep fixtures and screenshots public-safe.
- Library workflow polish: improve source-path labels, duplicate handling, relinking, empty states, or filter behavior without changing how source CHM files are stored.
- Documentation fixes: clarify install, troubleshooting, privacy, testing, release, or compatibility notes from real user questions.
- Packaging checks: tighten macOS packaging docs, CHMLib vendoring checks, release artifact naming, or checksum expectations.

Avoid starting with broad UI rewrites, new platforms, cloud sync, or CHM authoring features. Those are either out of scope or need design discussion first.

## Find a Starter Issue

Look for issues labeled `good first issue` or `help wanted` before opening a pull request. A good starter issue should name the affected workflow, point to likely files, and list the smallest useful verification command.

Start with the open [good first issue](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) list for the smallest scoped tasks, or the open [help wanted](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) list when you want work where maintainer review and guidance are expected.

Ask for a smaller scope before starting if the issue needs private CHM samples, broad UI decisions, new platform support, signing or notarization work, or a release-process change.

Maintainers can use the good first task issue template when creating starter issues so each task includes the workflow value, likely files, smallest acceptable change, verification command, and mentoring notes.

## Useful File Pointers

- `src/library.ts` and `test/library.test.ts` cover pure library data behavior, duplicate-safe imports, filtering, sorting, and relinking missing source files.
- `src/chm.ts` and `test/chm.test.ts` cover CHM metadata parsing, text decoding, resource resolution, search indexing, and content highlighting.
- `src/navigation.ts` and `test/navigation.test.ts` cover topic matching and previous/next reading order.
- `src/renderer.ts`, `src/index.html`, and `src/styles.css` cover the library and reader interface.
- `src/main.ts` and `src/preload.ts` cover Electron menus, IPC, local file access, recent documents, and the restricted preload bridge.
- `scripts/package-macos.sh` and `docs/release.md` cover macOS app packaging and release artifacts.

## Before Opening a Pull Request

- Keep the pull request focused on one user-visible improvement, bug fix, documentation update, or maintenance task.
- Add or update tests when behavior changes.
- Update `CHANGELOG.md` for user-facing, contributor-facing, release, or workflow changes.
- Run `npm run check` before review.
- Use the [Testing Guide](./testing.md) when you need to choose focused checks during iteration.
- Fill out the pull request template with user impact, verification, screenshots when relevant, macOS version, and Mac architecture.
