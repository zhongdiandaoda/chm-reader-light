# Adoption Checklist

Use this checklist when evaluating CHMReaderLight for your own offline documentation workflow, or when sharing the project with someone who needs a macOS CHM reader.

## 5-Minute Evaluation

- Download the latest release build from [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) for your Mac architecture.
- If GitHub Releases does not have a public build yet, follow [Getting Started](./getting-started.md) and run the app from source with `npm run run`.
- Verify the matching `.zip.sha256` checksum before opening the app.
- Import one representative `.chm` file from your real documentation folder.
- Confirm the library keeps the original source file in place and shows the folder, added date, and last-opened metadata you need.
- Open the CHM and check the searchable table of contents, body rendering, previous/next topic navigation, search, zoom, and text encoding controls.
- Move or rename a disposable CHM copy and confirm the missing-source warning and relink workflow are clear.

## Trust Checks

- Read [Privacy and Local Data](./privacy.md) to confirm the local-only data model matches your expectations.
- Read [Security Model](./security-model.md) before opening unfamiliar CHM files.
- Optionally verify GitHub artifact attestations for the downloaded zip:

```bash
gh attestation verify CHMReaderLight-mac-arm64.zip --repo zhongdiandaoda/chm-reader-light
gh attestation verify CHMReaderLight-mac-x64.zip --repo zhongdiandaoda/chm-reader-light
```

- Review [Compatibility Notes](./compatibility.md) if your CHM has legacy encodings, unusual table-of-contents markup, frames, scripts, or embedded plugin content.
- Keep [Troubleshooting](./troubleshooting.md) nearby for install, first-launch, cache, encoding, search, and stale-path issues.

## GitHub Actions

- [Star the repository](https://github.com/zhongdiandaoda/chm-reader-light) from GitHub or **Help > Star on GitHub** if CHMReaderLight solves your local reading workflow so it is easier for other macOS CHM users to find.
- [Watch releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) if you want notifications for new packaged builds.
- [Share release feedback](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback) if release page, checksum, notarization, screenshot, demo, or support details would make it easier to trust, star, watch, or share the app.
- [Fork the project](https://github.com/zhongdiandaoda/chm-reader-light/fork) if you want to experiment with reader, library, search, packaging, or documentation changes.
- [Open a focused issue](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose) if a real CHM exposes a compatibility gap that is not already covered by the docs.
- Installed users can use **Help > Release Feedback** when release details are the only blocker.
- Installed users can use **Help > Report or Request** to choose the right issue-template, release-feedback, security-policy, or showcase route.
- Start with [Good First Contributions](./good-first-contributions.md) when you want a small, reviewable first pull request.
