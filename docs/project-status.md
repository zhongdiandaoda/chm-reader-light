# Project Status

Use this page when you need a quick, current snapshot before downloading, starring, watching, or contributing to CHMReaderLight.

## Current Snapshot

- CHMReaderLight is focused on macOS 12 or later.
- Release artifacts are built for Apple Silicon and Intel Macs.
- Public downloads are distributed through GitHub Releases.
- Release zips should have matching SHA-256 checksum files.
- Release artifacts should have GitHub artifact attestations for optional provenance verification.
- Current release builds are not Apple-notarized yet, so macOS may require approval from **System Settings > Privacy & Security** on first launch.
- Homebrew is not a supported install path yet.
- No telemetry, accounts, cloud sync, or hosted document storage are included.

## Ready For

- Trying the app with local CHM manuals on macOS.
- Managing offline SDK, API, vendor, or archived product documentation.
- Testing table-of-contents navigation, body search, reader preferences, and local library workflows.
- Filing focused CHM compatibility reports with safe sample details.
- Small documentation, packaging, parser, search, accessibility, or macOS workflow contributions.

## Not Ready For

- Apple-notarized public distribution.
- Homebrew installation instructions for end users.
- Cloud sync, hosted document storage, account-based workflows, or telemetry.
- Editing, authoring, decompiling, or rebuilding CHM files.
- Broad cross-platform packaging before the macOS app is stable and easy to install.

## Before You Star or Watch

1. Download the correct artifact from [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases).
   If GitHub Releases does not have a public build yet, follow [Getting Started](./getting-started.md) and run the app from source with `npm run run` instead.
2. Verify the matching `.zip.sha256` checksum and optional GitHub artifact attestation.
3. Open a representative CHM file and try table-of-contents search plus body search.
4. Review [Privacy and Local Data](./privacy.md), [Security Model](./security-model.md), [Compatibility Notes](./compatibility.md), and [Accessibility Guide](./accessibility.md) if trust boundaries or keyboard access matter for your documents.
5. Use [Adoption Checklist](./adoption-checklist.md) when deciding whether to star, watch releases, open an issue, or contribute.
