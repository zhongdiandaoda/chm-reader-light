# macOS Install Guide

Use this guide when installing a release build from GitHub. Local development and source builds are covered in the main [README](../README.md).

## Choose the Right Download

Download the latest release from [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases):

- Apple Silicon Macs use [CHMReaderLight-mac-arm64.zip](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-arm64.zip).
- Intel Macs use [CHMReaderLight-mac-x64.zip](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-x64.zip).

If GitHub Releases does not have a public build yet, use the source-run path in [Getting Started](./getting-started.md).

If you are not sure which Mac you have, choose **Apple menu > About This Mac** and check the chip or processor line.

Homebrew is not a supported install path yet. Maintainers can use the [Homebrew Cask Guide](./homebrew-cask.md) or [Chinese Homebrew Cask Guide](./homebrew-cask.zh-CN.md) when preparing a future cask.

## Verify the Download

Each release zip is published with a matching checksum. Download the pair for your architecture into the same folder:

- Apple Silicon checksum: [CHMReaderLight-mac-arm64.zip.sha256](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-arm64.zip.sha256)
- Intel checksum: [CHMReaderLight-mac-x64.zip.sha256](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-x64.zip.sha256)

Then run the matching command:

```bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
shasum -a 256 -c CHMReaderLight-mac-x64.zip.sha256
```

An `OK` result means the zip matches the checksum published with the release.

For an optional provenance check, use GitHub artifact attestation after installing the GitHub CLI:

```bash
gh attestation verify CHMReaderLight-mac-arm64.zip --repo zhongdiandaoda/chm-reader-light
gh attestation verify CHMReaderLight-mac-x64.zip --repo zhongdiandaoda/chm-reader-light
```

This confirms the zip was produced by this repository's GitHub Actions release workflow.

## First Launch

Unzip the download and move `CHMReaderLight.app` into `/Applications` or another folder you control.

Current release builds are not Apple-notarized yet. If macOS blocks the first launch, open **System Settings > Privacy & Security**, review the blocked app message, and allow CHMReaderLight to open. See [Signing and Notarization](./signing-notarization.md) for the current macOS trust status.

The app reads local `.chm` files only after you add or open them. It does not upload documents, copy source CHM files into the library, or require an account.

## Update or Remove

To update, download a newer release. Replace the existing `CHMReaderLight.app`.

To remove the app, delete `CHMReaderLight.app`. Library metadata and extracted-book cache live in the app data folder; choose **Help > Reveal App Data Folder** before removing the app if you want to inspect or delete local state.

For launch, cache, encoding, or missing-source issues, start with [Troubleshooting](./troubleshooting.md). For local data boundaries, see [Privacy and Local Data](./privacy.md).

## After a Successful Install

- [Star the repository](https://github.com/zhongdiandaoda/chm-reader-light) or use **Help > Star on GitHub** if CHMReaderLight solves your offline CHM workflow.
- [watch releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) if you want to know when a newer packaged build is available.
- Use **Help > Copy Share Text** to send a ready-made summary with release, star, feedback, and showcase links when recommending the app to another macOS CHM user.
- Use the [release-feedback Discussion](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback) when download, checksum, notarization, screenshot, demo, or support details would make the release easier to trust, star, watch, or share.
