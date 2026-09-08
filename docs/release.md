# Release Checklist

Use this checklist when preparing a public CHMReaderLight macOS release. The project currently ships ad-hoc signed, non-notarized `.app` zip artifacts for Apple Silicon and Intel Mac through GitHub Actions.

## Before Tagging

- Confirm `CHANGELOG.md` has a user-facing entry for the release.
- Run the local quality gates:

```bash
npm test
npm run check:audit
npm run check
```

- On a Mac with the Xcode Command Line Tools, build at least one local package:

```bash
npm run check:package:mac:arm64
npm run check:package:mac:x64
npm run package:mac
```

  Each architecture preflight checks the required macOS build tools before tests or packaging begin. Packaging downloads the pinned CHMLib commit, verifies the archive SHA-256, applies the repository's CVE-2025-48172 and extraction-budget patches, builds the matching Mach-O architecture, and verifies the staged provenance. It is normal for only the current architecture to build on a single-architecture development Mac; the release workflow uses matching Apple Silicon and Intel runners.
- Use `npm run package:release:mac:arm64` or `npm run package:release:mac:x64` when you need the same app, zip, and checksum output produced by the matching release workflow job.
  Each command refuses to overwrite an existing same-name zip or checksum in its output directory. It builds the archive and checksum under temporary names, reopens the temporary zip with `npm run check:release-bundle:mac -- <release.zip> <arch>` to reject unexpected archive-root payloads and verify the final bundle signature, expected Electron fuse states, executable and CHMLib architectures, bundled dynamic-library link, bundle identifier, exact generated project icon, constrained runtime ASAR contents and 20 MiB size budget, `CHMLIB-PROVENANCE.txt`, patched corresponding source, patch identity, and final native binary hashes, and only then publishes the final filenames. Failed or interrupted validation removes temporary and partially published output.

- Open the packaged app from `dist/`, import a `.chm`, verify the table of contents, open a body page, run a search, and confirm the source file can be revealed in Finder.
- Confirm packaging still vendors `extract_chmLib` into `Contents/Resources/native/` so users do not need to install CHMLib separately.
- Confirm the same native directory contains `CHMLIB-PROVENANCE.txt`, `source/CVE-2025-48172.patch`, `source/extraction-limits.patch`, the SHA-256-verified upstream source archive, and `source/COPYING.CHMLib`. The archive plus patches form the complete corresponding source for the packaged modifications.
- Confirm packaging finishes with `codesign --verify --deep --strict` so the ad-hoc signature covers the final app bundle and vendored native files. The release gate also inspects every Mach-O file in the app and rejects any non-ad-hoc signature, unexpected TeamIdentifier, or hardened-runtime flag, because ad-hoc components cannot satisfy macOS library validation without a shared Developer ID team.
- Confirm packaging flips the production Electron fuses before the final signature and that release-bundle verification reads them back and verifies the expected Electron fuse states. `ELECTRON_RUN_AS_NODE`, `NODE_OPTIONS`, command-line debugging, and non-ASAR app loading must remain unavailable in production packages; embedded ASAR integrity validation must be enabled and its `Info.plist` hash must match the packaged `app.asar` header.
- Confirm `app.asar` contains only `build/`, production `node_modules/`, `package.json`, `LICENSE`, and `THIRD_PARTY_NOTICES.md`; repository zips, tests, source files, docs, and build tooling must not ship inside the runtime payload.
- If planning package-manager distribution, review the [Homebrew Cask Guide](./homebrew-cask.md) before drafting cask metadata.

## Publishing

- Create a version tag using the `vMAJOR.MINOR.PATCH` format, for example `v0.1.0`.
- Push the tag to GitHub. The release workflow builds:
  - `CHMReaderLight-mac-arm64.zip`
  - `CHMReaderLight-mac-arm64.zip.sha256`
  - `CHMReaderLight-mac-x64.zip`
  - `CHMReaderLight-mac-x64.zip.sha256`
- The architecture matrix only uploads GitHub Actions artifacts. A read-only preparation job waits for both builds and the successful attestation job, downloads and verifies all four files, then uploads an allowlisted publication input containing only the two publisher scripts, `package.json`, the Release template, and those four files. The write-capable publish job downloads that immutable input by its exact artifact ID and invokes the publisher exactly once. If either architecture fails, attestation fails, or any file is missing, no Release is created.
- The publisher renders the [Release Page Template](./release-template.md), replaces version placeholders, turns both zip and checksum names into direct downloads for that tag, and converts documentation links to URLs pinned to the tag. Before looking up or changing a Release, it resolves any existing lightweight or annotated Git tag to its commit and rejects a mismatch with the exact build SHA; if the tag is missing, it creates a lightweight tag directly at that SHA before creating the draft. It then streams all four assets, verifies GitHub's upload response name, size, and SHA-256 digest for each one, rechecks that the tag still resolves to that SHA, and re-reads the complete server-side draft immediately before publishing. The draft becomes public only if it is still private and contains exactly the expected uploaded assets with matching sizes and digests. An interrupted upload, concurrent draft change, server-side asset mismatch, or tag mismatch leaves the Release private rather than exposing an incomplete or misbound download set.
- GitHub appends automatically generated release notes from merged pull requests and commits after that curated download and trust block; `.github/release.yml` groups generated notes into user-facing sections.
- You can also run the Release workflow from the GitHub Actions page. Leave `publish_release` unchecked to build and verify artifacts without publishing.
- To publish manually, set `release_tag` to `vMAJOR.MINOR.PATCH` and explicitly check `publish_release`. Before starting either macOS runner, the workflow validates the exact tag format, requires it to match the `package.json` version, and rejects an existing tag that points to a different commit. It then waits for both architecture builds and binds a newly created tag to the commit selected when dispatching the workflow. The workflow file must already exist on the repository's default branch for GitHub to offer the manual run.
- Runs targeting the same release tag are serialized and an in-progress release is never canceled, preventing tag pushes and manual dispatches from publishing the same assets concurrently.
- The macOS build jobs retain read-only repository permissions while installing dependencies and running project build code. A separate isolated attestation job downloads the completed workflow artifacts and alone receives the OIDC and attestation write permissions; publication preparation cannot start unless that attestation succeeds. Every checkout uses `persist-credentials: false`, so checkout never persists the GitHub token in git configuration. GitHub Actions permissions remain job-scoped, not step-scoped: the final three-step `contents: write` job still grants its token context to the pinned Node setup and artifact download actions as well as the publisher. Its trusted surface is therefore deliberately limited to those two fixed-SHA actions and one direct Node publisher command; it performs no checkout, dependency installation, npm lifecycle, artifact preflight, or post-publish verification. The prepared input is selected by the exact immutable artifact ID exported by the read-only job, and a separate read-only job performs post-publish remote verification.
- After publication, the read-only verifier job runs `npm run check:remote-release -- --tag <tag> --target-commitish <40-character-build-commit-sha> --release-dir <release-dir>` against GitHub's tag-specific Release and Git ref APIs. It fails if the tag is wrong or no longer resolves to the build commit, the Release is a draft or prerelease, or any expected download/checksum is missing, incomplete, not fully uploaded, or differs in size or server-reported SHA-256 digest from the locally verified file. This exact-provenance mode fails closed on API rate limits because the public HTML fallback cannot prove a Git ref target or asset digest.
- If you download workflow artifacts from GitHub Actions before publishing manually, run `npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to preview a flat release staging directory, then add `--confirm` to copy the expected zip and checksum files into `dist/release`.
- Run `npm run publish:release -- --release-dir <release-dir>` for a dry-run release plan that verifies the semantic tag against `package.json`, checks expected artifacts, and shows the GitHub Release payload without publishing. When the artifacts are ready and a maintainer token is available, set `GITHUB_TOKEN` and rerun `npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm`. Confirmed publishing rejects branches, abbreviated SHAs, omitted targets, and an existing remote tag that resolves to a different commit; if the tag is missing, the helper creates it at the supplied SHA before touching Release state. The helper then creates a draft, streams and re-hashes all four assets, and publishes only after every upload succeeds; an interrupted or mutated upload leaves a non-public draft for inspection instead of exposing a partial Release.
- Rerunning the same tag safely resumes its private draft: the helper refuses an already-public Release or a draft containing unexpected assets, otherwise removes only the expected old assets, refreshes the curated metadata, uploads the complete verified set again, and then publishes.
- Wait for both architecture jobs, attestation, read-only publication preparation, publication, and the read-only verifier job to finish before announcing the release. Manual runs without explicit publish confirmation remain build-only.

## After Publishing

- Download each zip from the GitHub Release, unzip it, and confirm the `.app` opens on the matching architecture.
- Download each `.zip.sha256` file and verify the matching artifact:

```bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
shasum -a 256 -c CHMReaderLight-mac-x64.zip.sha256
npm run check:release-artifacts -- <release-dir>
npm run check:release-bundle:mac -- CHMReaderLight-mac-arm64.zip arm64
npm run check:release-bundle:mac -- CHMReaderLight-mac-x64.zip x64
```

- Treat any `Unexpected release artifact` or `Unexpected checksum file` output as a stale-file warning. Remove old macOS zip/checksum files from the release staging directory before publishing or announcing the release.
- Run `npm run check:remote-release` after publishing or editing the GitHub Release so the public latest release still exposes both macOS zips and checksum files. For a release gate, add `-- --tag <tag> --target-commitish <40-character-build-commit-sha> --release-dir <release-dir>` to prove the tag still resolves to the exact source commit and every remote asset matches the locally verified size and SHA-256 digest.
- Confirm GitHub artifact attestations were generated for both macOS zips and checksum files.
- Review the generated release notes before announcing the release, and add any missing user-facing highlights or caveats.
- Confirm the release body still starts with the [Release Page Template](./release-template.md) download block and that all four artifact links point to the published tag, so visitors can download the right files before reading the changelog.
- Confirm performance fixes and benchmark-driven improvements appear under the Performance release notes section.
- Confirm accessibility fixes for keyboard, VoiceOver, focus, contrast, or appearance appear under the Accessibility release notes section.
- Confirm community questions, showcase stories, and Discussion follow-ups appear under the Community release notes section.
- Create or refresh a release-feedback Discussion for this version so trial users have one public place to share trust, download, and first-launch blockers.
- Pin the current release-feedback Discussion before wider announcements so release visitors see the feedback path without opening duplicate issues.
- Link the pinned release-feedback thread from the release notes if trust, download, or first-launch questions repeat after publishing.
- Confirm the GitHub repository About panel still matches [Repository Listing](./repository-listing.md).
- Keep any Homebrew notes aligned with the [Homebrew Cask Guide](./homebrew-cask.md); do not announce a Homebrew install command until the cask is published and verified.
- Review [Signing and Notarization](./signing-notarization.md) before changing any Gatekeeper, signing, or notarization wording in release notes.
- Confirm the release body links to [Project Status](./project-status.md) so download visitors can check current platform support, trust caveats, and scope.
- Use [Demo Guide](./demo-guide.md) if the release announcement needs a short app walkthrough.
- Use [Share Kit](./share-kit.md) for reusable release announcement copy and social post text. Use [Chinese Share Kit](./share-kit.zh-CN.md) for localized release and social copy.
- Work through the [Share Kit](./share-kit.md) sharing channels and promotion checklist before posting release links publicly.
- Verify that Finder recognizes `.chm` files as documents that can be opened with CHMReaderLight.
- Add any known limitations to the release notes, especially signing, notarization, or CHM compatibility caveats.
- Keep the `Unreleased` changelog section ready for the next change after the tag is published.
