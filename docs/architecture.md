# Architecture Overview

This document is a map for contributors who want to change CHMReaderLight without first reading every source file. The app is intentionally small: Electron owns macOS integration and file access, the renderer owns the library and reader UI, and pure helpers cover CHM parsing, navigation, and library transforms.

## Runtime Flow

1. Electron starts in `src/main.ts`, registers the restricted `chm://` protocol, creates the browser window, and builds the macOS application menu.
2. The preload bridge in `src/preload.ts` exposes a narrow `window.chmReader` API. Renderer code cannot access Node.js or Electron directly.
3. `src/renderer.ts` renders the library and reader views, calls preload APIs for file operations, and persists lightweight UI preferences in `localStorage`.
4. When a CHM opens, `src/main.ts` extracts or reuses cached contents, parses metadata through `src/chm.ts`, and serves book resources through `chm://book/...`.
5. Reader navigation helpers in `src/navigation.ts` map iframe URLs back to the parsed table of contents so the sidebar can follow the current page.

## Code Map

- `src/main.ts`: Electron main process, menu actions, IPC handlers, library persistence, CHM extraction, recent documents, and the `chm://` protocol.
- `src/preload.ts`: The context-isolated IPC bridge used by the browser UI.
- `src/renderer.ts`: Library UI, reader UI, drag-and-drop import, search interactions, preference persistence, and DOM event wiring.
- `src/chm.ts`: CHM metadata parsing, resource resolution, text decoding, search index extraction, and content highlighting.
- `src/navigation.ts`: URL/topic matching and ordered topic traversal for previous/next navigation.
- `src/library.ts`: Pure library data helpers for collection names, duplicate-safe imports, filtering, sorting, and relinking missing source files.
- `src/search-index-worker.ts`: Background search-index building for extracted HTML pages.
- `scripts/package-macos.sh`: macOS app packaging entry point, including document metadata and native extractor vendoring.
- `scripts/build-chmlib-macos.sh`: Downloads a pinned CHMLib source archive, verifies its SHA-256, applies the reviewed CVE patch, and builds the target architecture.
- `scripts/check-chmlib-macos.sh`: Fails closed unless the native staging or bundle contains the expected source, patch, provenance, binary hashes, architecture, and relative dynamic-library link.
- `scripts/vendor-chmlib-macos.sh`: Copies the verified patched CHMLib build and corresponding source into packaged apps, then signs the native binaries and records their final hashes.

## Data and Cache Boundaries

- Source CHM files stay in their original locations. The app stores paths and metadata, not copies of the original files.
- Library metadata is written under Electron `userData` in `library/library.json`, including source paths, collections, added and last-opened timestamps used for library labels and recently opened ordering.
- Extracted book contents are cached under `extracted-books/` and can be cleared from **Help > Clear Extracted Cache** without removing source files or library entries.
- Reader preferences such as layout, selected collection, text encoding, sidebar width, sidebar visibility, last-read topic, and zoom are stored in browser `localStorage`.
- CHM pages are served only through the app's restricted `chm://` protocol after path boundary checks and with a strict Content Security Policy.

## Safe Contribution Areas

- UI-only reader or library changes usually start in `src/index.html`, `src/styles.css`, and `src/renderer.ts`.
- Library data behavior should usually be added to `src/library.ts` with focused tests in `test/library.test.ts`.
- CHM parsing, decoding, search, and protocol path behavior should be covered in `test/chm.test.ts`.
- Navigation behavior should be covered in `test/navigation.test.ts`.
- Menu, packaging, documentation, and security-boundary expectations are covered by static checks in `test/ui.test.ts`.
- Packaging changes should be checked against `docs/release.md` and the macOS package scripts before release automation is touched.
