# Release Page Template

Use this template when publishing or editing a GitHub Release. The goal is to make the release page itself answer the download, checksum, first-launch, privacy, and support questions that decide whether a visitor tries the app.

## Before Pasting

- Replace `v<version>` with the tag being published.
- Keep the artifact names exactly aligned with the release workflow.
- Run `npm run check:release-template` after editing artifact names, checksum text, attestation commands, or first-launch trust notes.
- Keep the notarization note until release builds are signed and Apple-notarized.
- Add only tested user-facing highlights, compatibility notes, or known limitations.

## Copyable Release Body

````markdown
# CHMReaderLight v<version>

A lightweight offline CHM reader and library for macOS.

## Download

- Apple Silicon: `CHMReaderLight-mac-arm64.zip`
- Intel: `CHMReaderLight-mac-x64.zip`
- Checksums: `CHMReaderLight-mac-arm64.zip.sha256` and `CHMReaderLight-mac-x64.zip.sha256`

If you are not sure which Mac you have, choose **Apple menu > About This Mac** and check the chip or processor line.

## Verify the Download

Download the zip and its matching checksum file into the same folder, then run one command:

```bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
shasum -a 256 -c CHMReaderLight-mac-x64.zip.sha256
```

An `OK` result means the zip matches the checksum attached to this release.

Optional provenance check with GitHub artifact attestation:

```bash
gh attestation verify CHMReaderLight-mac-arm64.zip --repo zhongdiandaoda/chm-reader-light
gh attestation verify CHMReaderLight-mac-x64.zip --repo zhongdiandaoda/chm-reader-light
```

This confirms the zip was produced by this repository's GitHub Actions release workflow.

## First Launch Note

Current release builds are not Apple-notarized yet. If macOS blocks the first launch, open **System Settings > Privacy & Security**, review the blocked app message, and allow CHMReaderLight to open.

## What to Try

1. Drag one or more `.chm` files into the library window.
2. Open a book and try table-of-contents search plus body search.
3. Adjust zoom or text encoding if the document needs it.
4. Use **Help > Copy Diagnostic Info** when reporting a problem.
5. Use **Help > Star on GitHub** if CHMReaderLight solves your offline CHM workflow.
6. Use **Help > Copy Share Text** to share a ready-made summary with release, star, feedback, and showcase links.

After trying the build, share what would make this release easier to trust, star, watch, or share in the [release-feedback Discussion](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback).

## Performance Notes

List benchmark-backed opening, extraction, search indexing, search, startup, or large-library improvements here. Remove this section if the release has no measured performance changes.

## Accessibility Notes

List keyboard, VoiceOver, focus, contrast, or appearance fixes here. Remove this section if the release has no accessibility changes.

## Helpful Links

- [macOS Install Guide](./install-macos.md)
- [Compatibility Notes](./compatibility.md)
- [Privacy and Local Data](./privacy.md)
- [Troubleshooting](./troubleshooting.md)
````

## After Pasting

- Use `npm run prepare:release-body -- --tag <tag> --output <file>` so all four artifact names become direct downloads for that tag and relative documentation links become tag-pinned GitHub URLs. The renderer also removes untouched Performance and Accessibility placeholder sections; GitHub-generated notes still include any categorized changes.
- Run `npm run check:release-template` before publishing if download, checksum, provenance, or first-launch wording changed.
- Run `npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to dry-run a flat release staging directory when publishing from downloaded GitHub Actions artifacts; add `--confirm` to copy files into `dist/release`.
- Run `npm run check:release-artifacts -- <release-dir>` after downloading or staging the attached macOS zip and checksum files.
- Run `npm run publish:release -- --release-dir <release-dir>` for a dry-run GitHub Release payload before using `--confirm` with `GITHUB_TOKEN`.
- Confirm all four files are attached before announcing the release: two zip artifacts and two `.zip.sha256` checksum files.
- Keep generated release notes below the curated download block so visitors see the install path before scanning the change list.
