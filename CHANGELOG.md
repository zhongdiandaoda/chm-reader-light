# Changelog

Notable user-facing changes to CHMReaderLight are documented here.

## Unreleased

- Improved local macOS packaging speed by reusing verified CHMLib and icon build inputs and avoiding a duplicate application build.
### Added

- Added a Settings page with persistent language selection for English, Simplified Chinese, Traditional Chinese, Japanese, Korean, Spanish, French, German, Portuguese, Italian, Russian, and Arabic.
- Added light, warm, cool, and dark eye-care themes across the library, settings, reader chrome, and CHM document content.
- Added a persistent library with collections, search, grid/list layouts, drag-and-drop import, recent-reading state, Finder reveal, missing-file warnings, and relink support.
- Added reader navigation history, previous/next topic controls, full-text search, topic progress, persistent zoom, text encoding, sidebar, search scope, and last-read position.
- Added Apple Silicon macOS packaging with bundled CHMLib, checksums, GitHub artifact attestations, and a draft-first Release workflow.
- Added CI, CodeQL, Dependency Review, OpenSSF Scorecard, issue forms, discussion templates, contribution guidance, support routing, and security reporting.
- Added repository listing, social preview, release verification, growth snapshots, and responsible sharing tools.

### Changed

- Kept the application chrome left-to-right for every interface language while preserving right-to-left Arabic text.
- Replaced the theme cards with a compact selector and kept the toolbar entry focused on application settings.
- Replaced the illustrated README preview with a real 1280 x 760 screenshot captured from the current Electron app.
- Removed Intel Mac packaging and release artifacts; supported builds now target Apple Silicon only.
- Reduced the documentation set to core user, security, contributor, release, and repository-operation guides.
- Simplified the Help menu and empty-library links to stable core documentation.
- Removed copy actions from the reader toolbar and library cards to keep navigation and file-management controls focused.
- Star calls to action now open the repository page where GitHub exposes the Star control.

### Security

- Pinned the CHMLib source and archive checksum, applied the CVE-2025-48172 bounds-check backport, and bundled source, license, patches, and provenance.
- Bounded archive extraction, HTML transformations, search indexing, library metadata, and table-of-contents parsing.
- Restricted CHM rendering with CSP, navigation checks, denied permissions, trusted-frame IPC validation, and disabled CHM-authored scripts and network access.
- Applied production Electron fuses, embedded ASAR integrity validation, strict bundle verification, and safe ad-hoc signing checks.
- Pinned GitHub Actions to immutable commits and isolated OIDC/attestation permissions to the attestation job.

### Fixed

- Fixed slow, blank window restores after macOS sleep or Dock reactivation by preserving the loaded window and repainting it on resume.
- Fixed overlapping open, reload, and cache-clear operations that could publish stale reader state.
- Fixed failed imports, opens, searches, menu actions, and startup operations leaving loading states or unhandled promise rejections.
- Fixed cache identity, extraction cleanup, malformed topic URLs, missing source handling, and path comparison edge cases.
- Fixed release uploads so changed files, moved tags, incomplete drafts, checksum mismatches, and server-side asset replacements fail closed.
- Fixed the GitHub social preview title and supporting copy being obscured by the product window; generation is reproducible and rejects stale SVG/PNG pairs.
