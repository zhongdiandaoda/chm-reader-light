# CHMReaderLight — macOS CHM Reader

[中文](./README.md)

[![CI](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml/badge.svg)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml/badge.svg)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/zhongdiandaoda/chm-reader-light/badge)](https://scorecard.dev/view/github.com/zhongdiandaoda/chm-reader-light)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![GitHub downloads](https://img.shields.io/github/downloads/zhongdiandaoda/chm-reader-light/total?label=downloads)](https://github.com/zhongdiandaoda/chm-reader-light/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](./README.md#macos-打包)
[![Node.js 22+](https://img.shields.io/badge/node-%3E%3D22-339933.svg)](./.nvmrc)
[![GitHub release](https://img.shields.io/github/v/release/zhongdiandaoda/chm-reader-light?display_name=tag&sort=semver)](https://github.com/zhongdiandaoda/chm-reader-light/releases)

A lightweight offline CHM reader and library for macOS. This open-source CHM file viewer supports Apple Silicon and Intel Macs. CHMReaderLight opens to a local library for managing `.chm` manuals, then switches into a reader with a searchable table of contents, document body, reading history, zoom, and text-encoding controls.

**Try it now:** [View macOS downloads](https://github.com/zhongdiandaoda/chm-reader-light/releases) · [Run locally](#development) · [60-second trial](#try-it-in-60-seconds) · [Star the project](https://github.com/zhongdiandaoda/chm-reader-light)

![CHMReaderLight macOS app preview](./docs/assets/app-preview.svg)

## Quick Links

- [Download](#download)
- [Try It in 60 Seconds](#try-it-in-60-seconds)
- [Use Cases](#use-cases)
- [Getting Started](./docs/getting-started.md)
- [Why CHMReaderLight](#why-chmreaderlight)
- [Support and Contributing](#support-and-contributing)

<details>
<summary>More documentation and project links</summary>

- [Chinese Getting Started](./docs/getting-started.zh-CN.md)
- [Feature Tour](./docs/feature-tour.md)
- [Chinese Feature Tour](./docs/feature-tour.zh-CN.md)
- [Chinese Use Cases](./docs/use-cases.zh-CN.md)
- [Chinese Comparison](./docs/comparison.zh-CN.md)
- [Demo Guide](./docs/demo-guide.md)
- [Chinese Demo Guide](./docs/demo-guide.zh-CN.md)
- [Sample CHM Guide](./docs/sample-chm-guide.md)
- [Chinese Sample CHM Guide](./docs/sample-chm-guide.zh-CN.md)
- [Share Kit](./docs/share-kit.md)
- [Chinese Share Kit](./docs/share-kit.zh-CN.md)
- [Showcase Guide](./docs/showcase.md)
- [Chinese Showcase Guide](./docs/showcase.zh-CN.md)
- [Adoption Checklist](./docs/adoption-checklist.md)
- [Chinese Adoption Checklist](./docs/adoption-checklist.zh-CN.md)
- [Project Status](./docs/project-status.md)
- [Chinese Project Status](./docs/project-status.zh-CN.md)
- [Documentation Index](./docs/index.md)
- [Repository Listing](./docs/repository-listing.md)
- [AI Project Summary](./llms.txt)
- [macOS Install Guide](./docs/install-macos.md)
- [Search Guide](./docs/search.md)
- [Chinese Search Guide](./docs/search.zh-CN.md)
- [Compatibility Notes](./docs/compatibility.md)
- [Chinese Compatibility Notes](./docs/compatibility.zh-CN.md)
- [Privacy and Local Data](./docs/privacy.md)
- [Chinese Privacy and Local Data](./docs/privacy.zh-CN.md)
- [Chinese Keyboard Shortcuts](./docs/shortcuts.zh-CN.md)
- [Chinese Accessibility Guide](./docs/accessibility.zh-CN.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Chinese Roadmap](./docs/roadmap.zh-CN.md)
- [Roadmap](./docs/roadmap.md)

</details>

## Why CHMReaderLight

- A macOS-native library workflow keeps local manuals easy to add, group, search, reopen, and reveal in Finder.
- A local-only reading model means source CHM files stay where you selected them; the app does not upload, sync, or host document content.
- Compatibility, privacy, security model, install, release, and contributor docs are kept in the repository so users can evaluate the app before installing it.

## Use Cases

- Managing local CHM technical manuals on macOS while keeping the original files in place.
- Reading legacy SDK, API, or product documentation offline with table-of-contents search, reading history, and zoom preferences.
- Opening unknown CHM files with CHM-authored scripts and network access disabled by default.

For more workflow examples and non-fit cases, see [Use Cases](./docs/use-cases.md).
For a quick tradeoff scan against Windows HTML Help, extracted HTML, and document managers, see [Comparison](./docs/comparison.md).

## Download

Download the latest macOS build from [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases):

- Apple Silicon: [CHMReaderLight-mac-arm64.zip](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-arm64.zip) · [CHMReaderLight-mac-arm64.zip.sha256](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-arm64.zip.sha256)
- Intel: [CHMReaderLight-mac-x64.zip](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-x64.zip) · [CHMReaderLight-mac-x64.zip.sha256](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-x64.zip.sha256)

If Releases has no downloadable build yet, use [Development](#development) to run from source.

Each zip is published with a matching `.zip.sha256` checksum file. Current release builds are not Apple-notarized yet; if macOS blocks the first launch, allow the app from **System Settings > Privacy & Security**. See the [macOS Install Guide](./docs/install-macos.md) or [Chinese macOS Install Guide](./docs/install-macos.zh-CN.md) for checksum verification, first launch, update, and removal steps.

Homebrew is not a supported install path yet; maintainers and contributors can use the [Homebrew Cask Guide](./docs/homebrew-cask.md) or [Chinese Homebrew Cask Guide](./docs/homebrew-cask.zh-CN.md) when preparing a future cask.

To verify a downloaded zip and checksum file from the same release:

```bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
shasum -a 256 -c CHMReaderLight-mac-x64.zip.sha256
```

For an optional provenance check with GitHub artifact attestations:

```bash
gh attestation verify CHMReaderLight-mac-arm64.zip --repo zhongdiandaoda/chm-reader-light
gh attestation verify CHMReaderLight-mac-x64.zip --repo zhongdiandaoda/chm-reader-light
```

## Try It in 60 Seconds

1. Download the latest build from [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) for your Mac, then verify the `.sha256` checksum if needed. If Releases has no downloadable build yet, use the two commands in [Development](#development) to run from source.
2. Open the app. Drag one or more `.chm` files into the library window to confirm local manuals are easy to collect.
3. Open a book, then try table-of-contents search and body search before switching topics or adjusting zoom.
4. Check [Privacy and Local Data](./docs/privacy.md), [Chinese Privacy and Local Data](./docs/privacy.zh-CN.md), [Security Model](./docs/security-model.md), and [Chinese Security Model](./docs/security-model.zh-CN.md) when you need to confirm the local data and reader boundaries.
5. If it solves your offline CHM workflow, use `Help > Star on GitHub` so more users can find it, use `Help > Watch Releases` to follow future updates, or use `Help > Copy Share Text` to copy a ready-made bilingual project summary.

## Features

- Library-first startup for managing local CHM manuals without copying or moving source files.
- Multi-collection organization, library search, recently opened books first, grid/list layout preference, drag-and-drop import, source folder labels, added date labels, last-opened date labels, continue-reading badges, Finder reveal, path copy, missing-file warnings, and relink support.
- Reader view with nested `.hhc` table of contents, searchable table of contents, full-text search, reading position, current topic title, topic count, previous/next topic navigation, history navigation, last-read topic restore, window title with the current book and topic, zoom persistence, text encoding persistence, and search scope preference.
- Safer defaults for unknown CHM files: CHM-authored scripts, inline event handlers, form submissions, popups, nested frames, plugin objects, and network connections are blocked.
- macOS integration for native menus, recent documents, Finder `.chm` document association, and Apple Silicon or Intel packaging.

## Development

```bash
npm install
npm run run
```

Useful checks:

```bash
npm test
npm run typecheck
npm run build
npm run check
```

macOS packaging builds CHMLib from a pinned commit, verifies the source archive SHA-256, applies the CVE-2025-48172 backport, and bundles the patched helper, dynamic library, corresponding source, patch, and provenance. Run `npm run check:package:mac` to check the local Xcode toolchain, `npm run build:chmlib:mac:arm64` or `npm run build:chmlib:mac:x64` to build one native target, and `npm run check:chmlib:mac -- <arm64|x64> [native-build-directory]` to verify it. See [Third-Party Notices](./THIRD_PARTY_NOTICES.md) for CHMLib licensing and modification details.

`npm run check` also validates Markdown links, moderate severity npm audit advisories, duplicate changelog entries, the README script inventory, documentation index coverage, repository metadata consistency, GitHub label consistency, community health file coverage, visual repository assets, release page template alignment, Node.js version alignment, license metadata alignment, README badge coverage, AI project summary coverage, growth readiness coverage, GitHub Actions workflow trust checks, and GitHub template quality checks, so it is the preferred pre-PR gate after code or documentation changes.

Run `npm run check:remote-listing` after changing live GitHub About settings, topics, website, or Discussions; it uses the network and is separate from the default local gate.
Run `npm run apply:repository-listing` to preview the GitHub description, website, topics, and Discussions updates; set `GITHUB_TOKEN` and add `-- --confirm` only when a maintainer is ready to apply them.
Run `npm run check:remote-release` after publishing a GitHub Release to confirm the latest public release exposes both macOS zips and checksum files.
Run `npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to flatten downloaded workflow artifacts into `dist/release`; add `--confirm` only when the copy plan is correct.
Run `npm run prepare:release-body -- --tag v0.1.0 --output dist/release/release-body.md` to render the curated Release Page Template with direct downloads for all four tag-specific artifacts and tag-stable documentation links. Tagged workflow runs do this automatically before GitHub appends generated release notes.
Run `npm run publish:release -- --release-dir <release-dir>` to preview the GitHub Release payload and artifact upload list; set `GITHUB_TOKEN` and add `--confirm` only when a maintainer is ready to publish.
Run `npm run prepare:homebrew-cask -- --release-dir <release-dir>` to generate a copy-ready Homebrew cask draft from verified staged release artifacts; do not announce Homebrew support until that cask is published and verified.
Run `npm run snapshot:growth` before a visibility push to print a tracker-ready baseline for stars, downloads, watchers, and the latest release; it falls back to public GitHub HTML when the API is rate-limited.
Run `npm run snapshot:visibility` before opening a visibility-push issue to print a paste-ready report with live listing blockers, release blockers, growth baseline, and next actions.
Run `npm run prepare:visibility-issue` to generate a visibility-push issue draft, a prefilled GitHub new-issue URL, and copyable issue body; pass `-- --snapshot-file <snapshot-file>` to reuse saved `npm run snapshot:visibility` output.
Run `npm run prepare:directory-submission` to generate copy-ready external directory listing fields and a tracker row; pass `-- --baseline-file <snapshot-file>` to reuse saved `npm run snapshot:growth` output.
Run `npm run prepare:share-post` to generate a channel-specific release or social post draft from the Share Kit; pass `-- --channel <channel> --audience <audience> --baseline-file <snapshot-file>` to reuse saved `npm run snapshot:growth` output.
Run `npm run prepare:promotion-follow-up` after a channel follow-up to compare saved baseline and current `npm run snapshot:growth` outputs, then print tracker-ready follow-up metrics and an evidence note.

Use Node.js 22 or newer. If you use nvm, run `nvm use` before installing dependencies.

## Support and Contributing

For usage questions, bug reports, showcase stories, and security routing, start with [SUPPORT.md](./SUPPORT.md), [Chinese Support Guide](./SUPPORT.zh-CN.md), [FAQ](./docs/faq.md), [Chinese FAQ](./docs/faq.zh-CN.md), [Troubleshooting](./docs/troubleshooting.md), [Chinese Troubleshooting](./docs/troubleshooting.zh-CN.md), [Security Policy](./SECURITY.md), and [Chinese Security Policy](./SECURITY.zh-CN.md). For code changes, read [CONTRIBUTING.md](./CONTRIBUTING.md), [Chinese Contributing Guide](./CONTRIBUTING.zh-CN.md), [Code of Conduct](./CODE_OF_CONDUCT.md), [Chinese Code of Conduct](./CODE_OF_CONDUCT.zh-CN.md), [Good First Contributions](./docs/good-first-contributions.md), [Chinese Good First Contributions](./docs/good-first-contributions.zh-CN.md), [Architecture Overview](./docs/architecture.md), [Security Model](./docs/security-model.md), [Chinese Security Model](./docs/security-model.zh-CN.md), [Search Guide](./docs/search.md), [Testing Guide](./docs/testing.md), [Governance Guide](./docs/governance.md), [Chinese Governance Guide](./docs/governance.zh-CN.md), [Roadmap](./docs/roadmap.md), and [Chinese Roadmap](./docs/roadmap.zh-CN.md).

Installed app users can start from `Help > Report or Request` for install help, bug, compatibility, feature request, performance, accessibility, documentation, release feedback, security-policy, and showcase routes. If release trust details are the only thing blocking a trial, star, watch, or share, use `Help > Release Feedback` directly.

First-time contributors can start with [Good First Contributions](./docs/good-first-contributions.md) or [Chinese Good First Contributions](./docs/good-first-contributions.zh-CN.md), then pick an open [good first issue](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [help wanted](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) issue for a scoped task.

Use [GitHub Discussions](https://github.com/zhongdiandaoda/chm-reader-light/discussions) for open-ended questions and workflow notes. Use the [release-feedback Discussion](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback) when download, checksum, notarization, screenshot, demo, or support details would make a release easier to trust, star, watch, or share.

If CHMReaderLight improves your offline CHM workflow, share the use case with the showcase issue template. Do not include private document content, sensitive file paths, or confidential screenshots.

CHM compatibility reports are most useful when they include macOS version, Mac architecture, CHM language and approximate size, affected area, smallest reproduction steps, and **Help > Copy Diagnostic Info** output.

CHMReaderLight is released under the [MIT License](./LICENSE).
