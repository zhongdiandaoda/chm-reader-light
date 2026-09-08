# Homebrew Cask Guide

[中文 Homebrew Cask 指南](./homebrew-cask.zh-CN.md)

Use this guide when preparing a future Homebrew distribution path for CHMReaderLight. CHMReaderLight does not have a published Homebrew cask yet, so GitHub Releases remain the supported download path for now.

## When to Add a Cask

Add or submit a Homebrew cask only after these release basics are true:

- A public GitHub Release is available for both `CHMReaderLight-mac-arm64.zip` and `CHMReaderLight-mac-x64.zip`.
- Each release artifact has a matching `.zip.sha256` file.
- The release page explains the current notarization caveat and links to [Signing and Notarization](./signing-notarization.md).
- The app has been opened from the downloaded zip on the matching Mac architecture.
- Install, update, and removal expectations are current in [macOS Install Guide](./install-macos.md).

## Candidate Cask Metadata

Use this as a starting point when drafting a cask. Keep URLs, versions, and hashes aligned with the actual release artifacts.
After staging and verifying release artifacts, run `npm run prepare:homebrew-cask -- --release-dir <release-dir>` to generate a copy-ready draft from the `.zip.sha256` files.

```ruby
cask "chmreaderlight" do
  version "<version>"
  sha256 "<sha256>"

  url "https://github.com/zhongdiandaoda/chm-reader-light/releases/download/v#{version}/CHMReaderLight-mac-arm64.zip"
  name "CHMReaderLight"
  desc "Lightweight offline CHM reader and library for macOS"
  homepage "https://github.com/zhongdiandaoda/chm-reader-light"

  depends_on macos: ">= :monterey"

  app "CHMReaderLight.app"
end
```

If the cask needs separate Apple Silicon and Intel URLs, keep both hashes sourced from the release `.zip.sha256` files and document the architecture split in the pull request.

## Verification

- Run `brew audit --cask chmreaderlight` against the drafted cask.
- Run `brew install --cask chmreaderlight` on a clean macOS machine or disposable test account.
- Confirm the installed app launches, imports a `.chm`, opens a topic, and can use **Help > Copy Diagnostic Info**.
- Confirm uninstall behavior removes the app bundle without deleting source CHM files.
- Re-check the notarization caveat after install, especially if the release is still not Apple-notarized.

## Public Messaging

- Do not tell users to install with Homebrew until the cask is published and verified.
- Keep GitHub Releases as the canonical install path until then.
- When the cask is live, link both the Homebrew command and the GitHub Release page so users can choose between package-manager install and direct downloads.
- Ask for a GitHub star only after explaining the offline CHM workflow value and linking to the app's privacy, compatibility, and install notes.
