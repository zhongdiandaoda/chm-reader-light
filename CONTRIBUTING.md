# Contributing to CHMReaderLight

Thanks for helping improve CHMReaderLight. The project is intentionally small and focused: a fast macOS CHM reader with a useful local library, reliable parsing, and clear packaging.

Please follow the [Code of Conduct](./CODE_OF_CONDUCT.md) in issues, pull requests, and project discussions.

## Good First Contributions

- Reproduce and narrow down CHM compatibility issues.
- Improve library management, search, or reader navigation workflows.
- Add tests for parsing, navigation, security boundaries, or UI structure.
- Improve macOS packaging and installation documentation.

Use [Good First Contributions](./docs/good-first-contributions.md) for beginner-friendly areas, file pointers, and the checks to run before review.
Start with open [good first issue](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [help wanted](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) issues when you want a scoped task that is ready for outside contributors.
Maintainers can use the good first task issue template to publish starter issues with a clear workflow value, likely files, smallest acceptable change, and verification command.
See the [Roadmap](./docs/roadmap.md) for the current focus areas and work that is intentionally out of scope.
For common user questions about downloads, privacy, compatibility, and bug reports, see the [FAQ](./docs/faq.md).
For new ideas, use the feature request issue template and describe the workflow problem before proposing an implementation.
For helping with public reports, use the [Issue Triage Guide](./docs/issue-triage.md) to route labels, reproduction details, duplicates, and deferrals consistently.
For routine stewardship, visibility checks, and decision rules, use the [Maintainer Playbook](./docs/maintainer-playbook.md).
Use the [Governance Guide](./docs/governance.md) when you need to understand maintainer responsibilities, decision paths, discussion-first changes, privacy boundaries, and review expectations.

## Local Setup

Requirements:

- macOS 12 or later
- Node.js 22 or later

If you use nvm, run `nvm use` from the repository root before installing dependencies.

Editors that support `.editorconfig` will pick up the shared UTF-8, LF, final-newline, and indentation defaults from the repository root. Git uses `.gitattributes` to keep text line endings consistent and binary artifacts from producing noisy diffs.

Install dependencies and run the app:

```bash
npm install
npm run run
```

Check the development environment:

```bash
npm run doctor
```

Before changing unfamiliar code, read the [Architecture Overview](./docs/architecture.md) for the main process, preload bridge, renderer, parser, library, and packaging boundaries.

If you use GitHub Copilot or another AI coding assistant, keep suggestions aligned with `.github/copilot-instructions.md` so generated changes follow the project scope, privacy expectations, documentation links, and verification gates.

## Quality Checks

Before opening a pull request, run:

```bash
npm test
npm run typecheck
npm run check
```

`npm run check:docs` verifies local Markdown links, heading anchors, and repository-local links in GitHub templates. `npm run check:audit` fails on moderate severity npm advisories. `npm run check:changelog` keeps `CHANGELOG.md` sections free of duplicate bullet entries. `npm run check:readme-scripts` keeps the README script inventory aligned with `package.json`. `npm run check:docs-index` keeps `docs/index.md` linked to every published guide in `docs/`. `npm run check:metadata` keeps `package.json` description, homepage, and keywords aligned with `docs/repository-listing.md`. `npm run check:remote-listing` audits the live GitHub About description, website, topics, and Discussions settings after maintainers apply repository listing changes. `npm run apply:repository-listing` previews those GitHub repository setting updates and only applies them when `GITHUB_TOKEN` is set and `-- --confirm` is passed. `npm run check:labels` keeps GitHub issue, Dependabot, and release-note labels aligned. `npm run check:community` confirms required GitHub community, support, security, contribution, and automation files are present. `npm run check:assets` keeps README preview and GitHub social preview assets present and correctly sized. `npm run check:release-template` keeps the GitHub Release page template aligned with workflow artifact names, checksum guidance, attestation commands, and first-launch trust notes. `npm run check:node-version` keeps `.nvmrc`, `package.json`, GitHub Actions, and contributor docs on the same Node.js major version. `npm run check:license` keeps LICENSE, package metadata, citation metadata, README license links, community standards, and third-party CHMLib notices aligned. `npm run check:badges` keeps README badges for CI, CodeQL, OpenSSF Scorecard, stars, downloads, license, platform, Node.js, and latest release visible. `npm run check:llms` keeps `llms.txt` aligned with README, repository links, and trust notes. `npm run check:growth` keeps the Growth Readiness guide aligned with live listing audits, latest-release audits, baseline metrics, and promotion follow-up evidence. `npm run check:workflows` keeps CI, release, CodeQL, Dependency Review, and Scorecard workflows pinned to the expected trust settings. `npm run check:templates` keeps issue, discussion, and pull request templates aligned with support routing, privacy reminders, labels, and required fields. `npm run check:remote-release` audits the latest public GitHub Release after maintainers publish macOS artifacts. `npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` flattens downloaded workflow artifacts into a release staging directory and only copies files when `--confirm` is passed. `npm run publish:release -- --release-dir <release-dir>` previews the GitHub Release payload and only publishes when `GITHUB_TOKEN` is set and `--confirm` is passed. `npm run prepare:homebrew-cask -- --release-dir <release-dir>` generates a copy-ready Homebrew cask draft from verified staged release artifact checksums, but Homebrew install support should not be announced until that cask is published and verified. The local checks run as part of `npm run check`; the live repository listing and release audits are network-backed and remain separate. `npm run snapshot:growth` prints a tracker-ready baseline for stars, downloads, watchers, and latest release state before a visibility push; it is also network-backed and remains separate. `npm run snapshot:visibility` prints a paste-ready visibility-push report with listing blockers, release blockers, baseline metrics, and next actions; it is network-backed and remains separate. `npm run prepare:visibility-issue` generates a visibility-push issue draft, prefilled GitHub new-issue URL, and copyable issue body from the live snapshot or a saved `-- --snapshot-file <snapshot-file>`. `npm run prepare:directory-submission` generates copy-ready external directory listing fields and a tracker row from the Directory Submissions guide or a saved `-- --baseline-file <snapshot-file>`. `npm run prepare:share-post` generates a channel-specific release or social post draft from the Share Kit and can reuse a saved `npm run snapshot:growth` baseline with `-- --baseline-file <snapshot-file>`. `npm run prepare:promotion-follow-up` compares saved baseline and current `npm run snapshot:growth` outputs so directory or share follow-ups get tracker-ready metric deltas and evidence notes.

Use `npm run build` when changing generated app output, packaging paths, or static resources.
Use the [Testing Guide](./docs/testing.md) to choose focused checks while iterating and the full gate before review.
Use the [Benchmarking Guide](./docs/benchmarking.md) when changing CHM parsing, search indexing, extraction caching, or worker concurrency.

For release preparation, follow the [Release Checklist](./docs/release.md) so local checks, macOS packaging, and GitHub release artifacts stay aligned.

## Pull Request Guidelines

- Fill out the pull request template so reviewers can see the change type, user impact, verification, and screenshots when relevant.
- Keep the change focused on one user-visible improvement, bug fix, or maintenance task.
- Include tests when changing parsing, navigation, library behavior, IPC, security boundaries, or renderer interactions.
- Update `README.md` when user-facing commands, workflows, packaging behavior, or supported features change.
- Update Project Status when changing platform support, release distribution, trust caveats, or project scope. See [Project Status](./docs/project-status.md).
- Mention the macOS version and Mac architecture used for manual verification when the change affects the Electron app or packaging.
- Do not commit `build/`, `dist/`, `node_modules/`, local CHM files, or personal environment files.

## Reporting CHM Compatibility Issues

Before opening an issue, check [Troubleshooting](./docs/troubleshooting.md) for common setup, encoding, search, and moved-file problems.

Use the CHM compatibility issue template for CHM-specific opening, table-of-contents, rendering, link, search, or encoding problems.

In the app, choose `Help > Copy Diagnostic Info` and paste the copied block into the issue so maintainers can see the app, runtime, platform, and architecture details.

If a CHM file cannot be shared publicly, include safe details instead:

- CHM language and approximate file size
- Whether the table of contents appears
- Whether body pages, search, or encoding are affected
- The smallest reproduction steps
- Screenshots or logs with private content removed
