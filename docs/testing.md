# Testing Guide

Use this guide to choose the smallest useful verification path before opening a pull request. The goal is to keep CHMReaderLight easy to review while still protecting parser behavior, reader safety, packaging, and documentation quality.

## Default Pre-PR Gate

Run the full local gate before opening a pull request that changes code, scripts, packaging, or project documentation:

```bash
npm run check
```

This runs TypeScript checking, builds the app, checks compiled JavaScript syntax, validates local Markdown links plus repository-local links in GitHub templates, blocks moderate severity npm advisories, checks duplicate changelog entries, confirms the README script inventory still matches `package.json`, validates that the Documentation Index links every published guide in `docs/`, validates repository discovery metadata against the repository listing guide, validates GitHub label definitions against issue templates, Dependabot, and release notes, confirms required GitHub community health files, issue templates, discussion templates, and trust workflows are present, validates README preview and GitHub social preview assets, validates that the GitHub Release page template matches release workflow artifact names, checksum guidance, provenance commands, and first-launch trust notes, validates Node.js version alignment across `.nvmrc`, `package.json`, GitHub Actions, and contributor docs, validates license metadata alignment across LICENSE, package metadata, citation metadata, README links, community standards, and third-party CHMLib notices, validates README badge coverage for CI, CodeQL, OpenSSF Scorecard, stars, downloads, license, platform, Node.js, and latest release, validates AI project summary coverage for positioning, trust notes, and key repository links, validates static growth readiness coverage for live listing audits, latest-release audits, baseline metrics, and promotion follow-up evidence, validates GitHub Actions workflow trust settings for permissions, timeouts, dependency caching, release attestations, and generated release notes, and validates GitHub template quality for support routing, privacy reminders, duplicate-search prompts, labels, and required fields.

Run the unit and static test suite as well when behavior changes:

```bash
npm test
```

## Choosing Focused Checks

Use focused checks while iterating, then return to the default pre-PR gate before review:

- `npm test -- --test-name-pattern "reader"` for a narrow test pass while working on a specific reader, parser, library, or documentation assertion.
- `npm run typecheck` after TypeScript interface, IPC, renderer, or main-process changes.
- `npm run build` after changes to source files, HTML, CSS, assets, or packaging inputs.
- `npm run check:docs` after changing Markdown links, headings, README files, support docs, docs under `docs/`, or repository-local links in GitHub templates.
- `npm run check:audit` after dependency updates or when reviewing moderate severity npm advisories.
- `npm run check:changelog` after editing `CHANGELOG.md`.
- `npm run check:metadata` after changing package description, homepage, keywords, GitHub topics, or repository listing copy.
- `npm run check:remote-listing` after applying GitHub repository About settings, topics, website, or Discussions changes; it is network-backed and intentionally not part of `npm run check`.
- `npm run apply:repository-listing` to dry-run GitHub repository About, website, topics, and Discussions updates from `docs/repository-listing.md`; set `GITHUB_TOKEN` and pass `-- --confirm` only when a maintainer is ready to apply them.
- `npm run check:labels` after changing GitHub issue templates, Dependabot labels, release-note categories, or repository label documentation.
- `npm run check:community` after changing community health files, issue templates, discussion templates, CODEOWNERS, or trust workflows.
- `npm run check:assets` after changing README images, repository listing imagery, or social preview files.
- `npm run check:release-template` after changing release workflow artifact names, release download guidance, checksum text, attestation commands, or notarization caveats.
- `npm run check:remote-release -- --tag <tag> --target-commitish <40-character-build-commit-sha> --release-dir <release-dir>` in the publishing job to verify the public tag provenance and compare every GitHub asset size and SHA-256 digest with the locally verified release files.
- `npm run check:node-version` after changing Node.js versions, GitHub Actions setup, package engines, or setup docs.
- `npm run check:license` after changing license text, package metadata, citation metadata, README license links, community standards, or third-party dependency notices.
- `npm run check:badges` after changing README badges, workflow names, repository URLs, license text, platform support, Node.js versions, or release links.
- `npm run check:llms` after changing `llms.txt`, README positioning, trust wording, repository URLs, or AI-facing summary links.
- `npm run check:growth` after changing promotion, release announcement, directory submission, maintainer, or growth-measurement guidance.
- `npm run snapshot:growth` before a visibility push or directory submission to capture a tracker-ready baseline for stars, downloads, watchers, and latest release state; it is network-backed and intentionally not part of `npm run check`.
- `npm run snapshot:visibility` before opening a visibility-push issue to capture live listing blockers, release blockers, baseline metrics, and next actions in one paste-ready report; it is network-backed, preserves completed audits when another source times out, marks unavailable metrics as blockers, and is intentionally not part of `npm run check`.
- `npm run prepare:visibility-issue` before filing a promotion task to generate a visibility-push issue draft, prefilled GitHub new-issue URL, and copyable issue body from the live snapshot or a saved `-- --snapshot-file <snapshot-file>`.
- `npm run prepare:share-post` before posting a release or social update to generate channel-specific copy from the Share Kit; pass `-- --channel <channel> --audience <audience> --baseline-file <snapshot-file>` to reuse saved `npm run snapshot:growth` output.
- `npm run check:workflows` after changing CI, release, CodeQL, Dependency Review, Scorecard, workflow permissions, timeouts, or setup-node caching.
- `npm run check:templates` after changing issue templates, discussion templates, the pull request template, support routing, privacy reminders, or required report fields.
- `npm run check:release-artifacts -- <release-dir>` after downloading or staging GitHub Release zip artifacts and checksum files; it also reports stale macOS zip/checksum files that should not be attached to the release.
- `npm run check:release-bundle:mac -- <release.zip> arm64` on macOS to inspect the final archive's signature, native architecture, bundled CHMLib link, bundle identifier, exact generated project icon, and allowlisted runtime ASAR contents and size.
- `npm run check:remote-release` after publishing or editing a GitHub Release; add `-- --tag <tag> --target-commitish <40-character-build-commit-sha> --release-dir <release-dir>` for the release gate so it verifies Git tag provenance and exact remote asset digests. It is network-backed and intentionally not part of `npm run check`.
- `npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to flatten downloaded GitHub Actions artifacts into a release staging directory; add `--confirm` only after reviewing the copy plan.
- `npm run prepare:release-body -- --tag <tag> --output <file>` after changing the Release Page Template or tagged release workflow; inspect the rendered file for four tag-specific artifact download links, a complete checksum block, a first-launch note, and tag-pinned documentation links.
- `npm run publish:release -- --release-dir <release-dir>` to dry-run the GitHub Release payload and artifact upload list before a maintainer sets `GITHUB_TOKEN` and passes `--confirm`.
- `npm run benchmark:chm` when changing CHM parsing, metadata discovery, search indexing, extraction caching, or worker concurrency.
- `npm test -- --test-name-pattern='validateExtractedBookTree|extractBook'` when changing extraction timeouts, extracted-tree entry handling, or file/count/byte safety budgets.
- `npm test -- --test-name-pattern='readMarkupFile|createSearchIndex|untrusted HTML transforms'` when changing HTML/HHC in-memory reads, reader transformations, or search-index source budgets.

## Manual App Checks

Some Electron behavior needs a quick macOS app pass because it depends on menus, windows, Finder integration, or native dialogs.

Run `npm run run` and manually verify affected flows when a change touches:

- File menu actions such as adding CHM files, showing the library, or opening recent documents.
- Help menu actions such as `Help > Copy Diagnostic Info`, reveal app data folder, clear extracted cache, or documentation links.
- Finder, drag-and-drop, source-file relinking, or packaged `.chm` document association.
- Reader interactions that depend on focus, iframe navigation, keyboard shortcuts, or external browser links.
- macOS packaging scripts, release artifacts, checksums, or native CHMLib vendoring.

For UI changes, include a screenshot or short recording in the pull request when it helps reviewers see the result.

## What CI Covers

GitHub Actions CI runs on pull requests and pushes to `main`. It installs dependencies, runs `npm test`, runs `npm run check:audit`, and runs `npm run check` so the repository-level gates stay aligned with local contributor checks.

CI does not prove a release artifact was manually exercised on every Mac model, that a private CHM file renders correctly, or that notarization behavior matches a local machine. Document any extra manual verification in the pull request template.
