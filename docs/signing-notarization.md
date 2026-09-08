# Signing and Notarization

This page explains the current macOS trust status for CHMReaderLight release builds and the maintainer steps required before changing public install guidance.

## Current Status

Current release builds are not Apple-notarized yet. They are packaged for open-source distribution and are ad-hoc signed so bundled native files can run from the app bundle, but they do not yet carry an Apple Developer ID signature or a stapled notarization ticket.

Because of that, macOS may block the first launch after download. If you choose to run the app, open **System Settings > Privacy & Security**, review the blocked app message, and allow CHMReaderLight to open.

This trust status is separate from the app's local-data model. CHMReaderLight does not upload CHM content, does not require an account, and stores library metadata and extracted cache files locally. See [Privacy and Local Data](./privacy.md) for the storage map.

## What Would Change

A fully notarized release would require:

- A valid Apple Developer ID Application certificate.
- Hardened runtime and signing settings that cover the Electron app, bundled native extractor, and dependent native libraries.
- Apple notarization for each distributed archive.
- A stapled notarization ticket on the app bundle before zipping.
- Release verification that confirms Gatekeeper accepts the downloaded app on a clean macOS machine.

Until that process is implemented and verified, release notes, README text, and install docs should keep the current notarization caveat.

## Maintainer Checklist

- Do not remove the notarization caveat from README, [macOS Install Guide](./install-macos.md), FAQ, or release notes until notarized artifacts have been verified.
- Keep checksum files attached to every release artifact so users can verify downloads independently.
- Verify the packaged app with `codesign --verify` before release.
- Verify Gatekeeper behavior with `spctl --assess` after signing changes.
- Record the `notarytool` submission and staple steps in [Release Checklist](./release.md) before publishing notarized artifacts.
- Test both `CHMReaderLight-mac-arm64.zip` and `CHMReaderLight-mac-x64.zip` after any signing, entitlement, or packaging change.

## User-Safe Messaging

Use clear wording when explaining the current release status:

- Say that current builds are not Apple-notarized yet.
- Point users to **System Settings > Privacy & Security** when macOS blocks first launch.
- Say that checksum files verify the downloaded zip, not the author identity of a Developer ID signature.
- Say that CHMReaderLight does not upload CHM content or require an account.
- Avoid implying that an unsigned build has the same macOS trust path as a notarized Developer ID release.
