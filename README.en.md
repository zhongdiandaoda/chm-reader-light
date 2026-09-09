# CHMReaderLight - macOS CHM Reader

[中文](./README.md)

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)
[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)](#requirements)

A lightweight, offline CHM reader for macOS. Organize local manuals in a library, search their contents, and read without uploading documents or creating an account.

**[Download for macOS](https://github.com/zhongdiandaoda/chm-reader-light/releases)** · **[Run from source](#run-from-source)** · **[Star the project](https://github.com/zhongdiandaoda/chm-reader-light)**

![Actual CHMReaderLight empty library](./docs/assets/app-preview.png)

> This screenshot is captured from the current Electron app with an empty, isolated library. It contains no private CHM names or local paths.

## Features

- Collections, drag-and-drop import, library search, and recent-reading state.
- Nested contents, contents search, full-text search, topic navigation, and history.
- Persistent zoom, text encoding, sidebar, search scope, and per-book reading position.
- Finder reveal and relink support without moving or deleting source CHM files.
- CHM-authored scripts, forms, popups, nested frames, and network access are blocked.
- Focused Apple Silicon support with no telemetry, accounts, or cloud sync.

## Download and Install

Download `CHMReaderLight-mac-arm64.zip` from [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases).

Each archive has a matching `.zip.sha256` file. Verify both files from the same directory:

```bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
```

Current builds are not Apple-notarized. If macOS blocks the first launch, review the app under **System Settings > Privacy & Security**. See the [install guide](./docs/install-macos.md) for complete steps.

## Basic Use

1. Choose **Add CHM** or drag `.chm` files into the library.
2. Organize manuals with collections and filter by title or path.
3. Open a document, then search its contents or body; change text encoding if needed.
4. Use `Command+O` to add files, `Command+F` to search, and `Command+L` to return to the library.

The app stores source paths and reading preferences only. See [Privacy](./docs/privacy.md), [Compatibility](./docs/compatibility.md), and [Troubleshooting](./docs/troubleshooting.md).

## Requirements

- macOS 12 or newer
- Apple Silicon Mac
- Node.js 22 or newer for source builds

## Run from Source

```bash
npm install
npm run run
```

Run the quality gates with:

```bash
npm test
npm run check
```

Package the current architecture with `npm run package:mac`.

## Documentation

| Topic | Guide |
| --- | --- |
| Installation | [macOS Install Guide](./docs/install-macos.md) |
| Supported CHM behavior | [Compatibility](./docs/compatibility.md) |
| Local data | [Privacy](./docs/privacy.md) |
| Trust boundaries | [Security Model](./docs/security-model.md) |
| Common problems | [Troubleshooting](./docs/troubleshooting.md) |
| Code structure | [Architecture](./docs/architecture.md) |
| Verification | [Testing](./docs/testing.md) |
| Publishing | [Release Guide](./docs/release.md) |

## Support and Contributing

- Usage and bugs: [SUPPORT.md](./SUPPORT.md) or [Issues](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose)
- Security reports: [SECURITY.md](./SECURITY.md)
- Contributions: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Community conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

If CHMReaderLight improves your offline documentation workflow, please [star the project](https://github.com/zhongdiandaoda/chm-reader-light).

[MIT License](./LICENSE) · [Third-Party Notices](./THIRD_PARTY_NOTICES.md)
