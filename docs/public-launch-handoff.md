# Public Launch Handoff

Use this checklist to move the current local growth work to the public repository without mixing source review, repository administration, release publishing, and promotion into one irreversible step. Each phase has a separate authority boundary and verification gate.

## Audited State

This snapshot was recorded on 2026-09-07. Refresh it before acting if the branch or GitHub repository has changed.

- The working branch is `develop` at `cb887e8`; `origin/main` is at `f5812cb`. Their merge base is `9c6426c`, with two commits unique to `main` and one commit unique to `develop`. Reconcile through a reviewed pull request instead of force-pushing either branch.
- The local tree contains substantial tracked and untracked work. Refresh `git status --short` before review; most public-facing documentation, community files, quality checks, and release automation are not on `main` yet.
- The public repository has no downloadable Release, while the Release workflow itself is only present in the local worktree. GitHub cannot run that workflow from the default branch until the source changes are reviewed and merged.
- The root `CHMReaderLight-mac-arm64.zip` is a large local release artifact and is not a substitute for a commit-bound Release. Its checksum is local evidence only. The empty root `Report` file is also not project source. Release artifacts must remain outside Git history regardless of whether a particular archive is below GitHub's per-file limit.
- No commit, push, tag, Release, issue, or repository-setting mutation was performed while preparing this handoff.

## 1. Review and merge source changes to `main`

Owner: a maintainer with source-review and merge authority.

- Refresh remote refs and review `git log --left-right --oneline origin/main...develop` before creating a branch or pull request. Preserve both sides of the current divergence.
- Do not use `git add .`. Stage explicit paths for one reviewable concern at a time, then inspect `git diff --cached --stat` and `git diff --cached` before every commit.
- Never stage `CHMReaderLight-mac-arm64.zip`, its `.sha256` file, `Report`, `dist/`, `build/`, private `.chm` files, or environment files. Release archives belong in GitHub Releases or short-lived Actions artifacts, not Git history.
- Keep the existing TypeScript migration records in `tasks/plan.md` and `tasks/todo.md` unchanged. Keep `tasks/built-in-sample-spec.md` as a specification only until it receives explicit human approval.
- Split review into coherent slices. A practical dependency order is:
  1. application behavior, accessibility, library/reader UX, and their focused tests;
  2. macOS packaging, app metadata/icon assets, release verification scripts, and CI/release workflows;
  3. community health files, issue/discussion templates, contributor guidance, and repository metadata checks;
  4. bilingual evaluation, trust, support, and release documentation;
  5. discovery/growth tooling and the final README/index/changelog integration.
- Use this path map as a staging review aid, not as a blind glob to pass to `git add`:

  | Slice | Primary paths to review |
  | --- | --- |
  | App behavior and tests | `src/*.ts`, `src/index.html`, `src/styles.css`, `test/chm.test.ts`, `test/library.test.ts`, behavior-focused hunks in `test/ui.test.ts`, `scripts/benchmark-chm.js` |
  | Packaging and automation | `resources/macos/`, `src/assets/`, packaging/signing/release-check scripts under `scripts/`, `.github/workflows/`, `.nvmrc`, relevant `package.json` and lockfile hunks |
  | Community and contribution | `.github/` files outside workflows, `CONTRIBUTING*`, `CODE_OF_CONDUCT*`, `SECURITY*`, `SUPPORT*`, `LICENSE`, `CITATION.cff`, `.editorconfig`, `.gitattributes` |
  | User and maintainer docs | `README*`, `docs/`, documentation-contract hunks in `test/ui.test.ts` |
  | Discovery tooling | `llms.txt`, repository-listing and growth scripts under `scripts/`, `test/release-artifacts.test.js`, related `package.json`, README, docs, and changelog hunks |

- If a slice cannot pass independently because `package.json`, `test/ui.test.ts`, or `CHANGELOG.md` spans several concerns, use deliberate partial staging and record the dependency in the pull-request description. Do not silently duplicate or drop shared hunks.
- Before requesting merge, run and record `npm test`, `npm run check`, `npm run doctor`, and `git diff --check`:

```bash
npm test
npm run check
npm run doctor
git diff --check
```

- Have GitHub Actions pass on the pull request. Confirm the workflow files are present on `main` after merge before moving to repository settings or a release.

Exit gate: the reviewed source, documentation, community files, and workflows are on `main`; the default-branch CI run is green; local-only artifacts are absent from Git history.

## 2. Apply repository About, topics, and Discussions settings

Owner: a maintainer with GitHub repository-administration authority and an appropriately scoped token.

- Preview the exact changes without mutation:

```bash
npm run apply:repository-listing
```

- Review the description, homepage, all expected topics, and the request to enable Discussions against [Repository Listing](./repository-listing.md). Upload `docs/assets/social-preview.png` through GitHub settings because the REST helper does not set the social preview.
- Only after explicit maintainer approval, use the confirmed command documented in the Repository Listing guide. Do not put the token in shell history, logs, issues, or pull-request text.
- Configure the Q&A, Show and tell, and Release feedback Discussion categories after Discussions is enabled. Templates in `.github/DISCUSSION_TEMPLATE/` do not enable the repository feature by themselves.
- Verify live state:

```bash
npm run check:remote-listing
```

Exit gate: the live description, homepage, topics, social preview, and Discussions surface match the repository guide, and `npm run check:remote-listing` passes.

## 3. Build and publish the first Apple Silicon Release

Owner: a maintainer with tag/Actions/Release authority.

- Confirm `package.json` and `CHANGELOG.md` agree on the intended semantic version. For the current package version, the tag must be `v0.1.0`. Do not reuse a tag that points to another commit.
- Run the Release workflow from the merged default branch with publishing disabled first. The job must build arm64 on `macos-15`.
- Require the Apple Silicon build and aggregate artifact check to pass. The complete set is:
  - `CHMReaderLight-mac-arm64.zip`
  - `CHMReaderLight-mac-arm64.zip.sha256`
- Inspect the build-only artifacts and the generated release body. Follow [Release Checklist](./release.md) for bundle signature, architecture, CHMLib linkage, checksum, icon, and manual open/import/search checks.
- Publish only through an explicitly approved tag push or confirmed manual workflow run. The aggregate job must remain the only publisher so an incomplete Release cannot become public.
- Verify the live Release with `npm run check:remote-release`, pinned to the intended tag:

```bash
npm run check:remote-release -- --tag v0.1.0 --target-commitish <40-character-build-commit-sha> --release-dir dist/release
```

- Download the public zip and checksum, verify them on an Apple Silicon Mac, and confirm the Release is neither a draft nor a prerelease. If verification fails, remove or draft the broken Release before sharing its links; fix forward with a reviewed patch and a new version rather than moving an already public tag.

Exit gate: one public Release exposes the verified zip and checksum, Apple Silicon smoke-test evidence exists, and the tag-and-commit-pinned `npm run check:remote-release` command above passes.

## 4. Promote only after live verification

Owner: a maintainer or community manager authorized to post on each selected channel.

- Capture the pre-promotion baseline with `npm run snapshot:growth` only after the listing and Release gates pass; pair it with the visibility snapshot:

```bash
npm run snapshot:growth
npm run snapshot:visibility
```

- Save the dated stars, watchers, release downloads, version, and listing URLs in the Directory Submission Tracker. This is the baseline needed to tell whether later Star growth came from a specific channel.
- Prepare channel-specific copy with the Share Kit tooling and review it manually. Link to the public Release or a relevant evaluation guide, disclose the current ad-hoc signing/notarization status, and ask for a Star only after giving readers a useful trial path.
- Submit to one relevant community or directory at a time. Record the live URL and avoid repeated cross-posting.
- After seven days, refresh the growth snapshot and record deltas, support friction, and release-feedback themes in the visibility issue. Use the evidence to improve the next release or listing instead of treating raw impressions as success.

Exit gate: every promotion has a dated baseline, a live URL, a follow-up date, and measured Star/download/watcher deltas.

## Stop Conditions

- Stop before Phase 2 if the source and workflows are not on `main`.
- Stop before Phase 3 if live repository listing verification fails.
- Stop before Phase 4 if the Apple Silicon build, checksum, or live Release verification fails.
- Stop and request maintainer direction whenever a step needs a token, tag, merge, public post, or settings mutation that has not been explicitly authorized.
