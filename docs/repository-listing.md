# Repository Listing

Use this checklist when configuring the GitHub repository About panel, topics, website field, and social preview. These settings are not stored in the repository, so keep them aligned with the README and package metadata before major releases.

## Description

Suggested repository description:

```text
A lightweight offline CHM reader and library for macOS
```

This matches `package.json` and the English README first screen.

## Suggested Topics

Use focused GitHub topics that match the app and the likely search terms for people looking for a CHM reader:

- `chm`
- `chm-reader`
- `chm-viewer`
- `macos-chm-reader`
- `chm-reader-macos`
- `html-help`
- `microsoft-html-help`
- `offline-docs`
- `offline-documentation`
- `offline-reader`
- `help-viewer`
- `api-reference`
- `technical-documentation`
- `documentation`
- `macos`
- `macos-app`
- `electron`
- `ebook`
- `reader`

Keep the topic list close to the package keywords so GitHub and npm discovery describe the same project.

## Website

Set the repository website field to:

```text
https://github.com/zhongdiandaoda/chm-reader-light#readme
```

This keeps the About panel pointing to the maintained first-screen download, feature, privacy, support, and contributor links.

## Social Preview

Use `docs/assets/social-preview.svg` as the source artwork for the GitHub social preview. Run `npm run generate:social-preview` after editing it to rebuild the upload-ready PNG at 1280 x 640 and refresh its source/output hash manifest, then upload `docs/assets/social-preview.png` to GitHub repository settings.

Before replacing the preview, run `npm run check:assets` and check that the image still communicates the library-first workflow, search, and local-only reading model without becoming a generic marketing graphic.

## Discussions

Enable GitHub Discussions for community questions, showcase follow-ups, and release feedback that do not need a tracked bug, compatibility report, or feature request yet.

Keep installed-app support routing aligned with `Help > Report or Request` so users who discover the project from the app land on the same question, install help, bug, compatibility, feature, performance, accessibility, documentation, release feedback, showcase, and security-policy paths described in the repository.

Suggested categories:

- Q&A for usage questions that may help future readers.
- Show and tell for safe workflow stories that do not include private document content.
- Release feedback for early notes after a new macOS zip is published.

Ask contributors to search existing Discussions before opening a new community thread so repeated questions, release notes, and workflow stories stay connected.

Keep the category prompts aligned with `.github/DISCUSSION_TEMPLATE/q-a.yml`, `.github/DISCUSSION_TEMPLATE/show-and-tell.yml`, and `.github/DISCUSSION_TEMPLATE/release-feedback.yml`.

## Pinned Community Items

Use pinned Issues and Discussions to keep the highest-value follow-up paths visible from the repository activity area:

- Pin one current release feedback Discussion after each public macOS zip release so new users can see where to report early impressions without opening duplicate issues.
- Pin one good first issue that uses `.github/ISSUE_TEMPLATE/good_first_task.yml` so new contributors can find a scoped starter task with workflow value, likely files, smallest acceptable change, and verification guidance.
- Pin one safe showcase story when a user has granted permission to quote or link their offline CHM workflow.

Unpin stale release feedback, resolved support threads, or starter issues that no longer have clear file pointers before a larger announcement.

## Issue Labels

Create or confirm the issue labels used by the templates before promoting the repository. Keep `.github/labels.yml` aligned with this list so maintainers can recreate the labels consistently:

- `bug` for reproducible application problems.
- `compatibility` for CHM-specific rendering, navigation, search, image, or encoding reports.
- `enhancement` for reader, library, search, packaging, or documentation improvements.
- `documentation` for unclear, missing, outdated, or confusing docs.
- `performance` for slow opening, extraction, search indexing, search queries, startup, or large-library workflows.
- `accessibility` for keyboard, VoiceOver, focus, color contrast, or appearance reports.
- `question` for usage, setup, or workflow support.
- `showcase` for positive offline CHM workflow stories.
- `good first issue` for small, well-scoped work with clear file pointers and verification steps.
- `help wanted` for issues where maintainers can review or guide outside contributions.

Use `good first issue` together with `help wanted` when new contributors can find scoped starter work without needing private CHM files, unavailable hardware, or broad product decisions.

## Apply Repository Settings

Use the GitHub repository Settings > General page to set the website field. Use the repository About gear to set the description and topics. Enable Discussions before linking users to Q&A, Show and tell, or Release feedback categories from release notes, templates, or app menus.

Maintainers with a GitHub token that can edit repository settings can run a dry run first:

```bash
npm run apply:repository-listing
```

The dry run prints the current blockers and the GitHub API updates it would make. To apply the description, website, topics, and Discussions setting from this guide, set `GITHUB_TOKEN` and confirm explicitly:

```bash
GITHUB_TOKEN=repo_administration_token npm run apply:repository-listing -- --confirm
```

After updating remote settings, verify via GitHub API that `description`, `homepage`, `topics`, and `has_discussions` match this guide. Do not treat local README or package metadata as proof that remote repository settings are live.

Run `npm run check:remote-listing` after applying settings in GitHub to compare the live repository API response with this guide. This command uses the network and is intentionally separate from the default local quality gate.

## Verification

- Open the GitHub repository settings and confirm the GitHub About panel uses the description above.
- Confirm the topics include the CHM, offline documentation, macOS, Electron, and reader keywords.
- Confirm `llms.txt` still summarizes the project positioning, trust notes, and key links used by search tools and AI assistants.
- Before external promotion, confirm listing copy, screenshots, and download links still match the repository metadata.
- Confirm issue labels include `bug`, `compatibility`, `enhancement`, `documentation`, `performance`, `accessibility`, `question`, `showcase`, `good first issue`, and `help wanted`.
- Confirm installed-app support routes still match `Help > Report or Request` and the public issue templates before a visibility push.
- Confirm GitHub Discussions is enabled with Q&A, Show and tell, and Release feedback categories.
- Confirm pinned community items point visitors to a current release feedback thread, a scoped good first issue, and a safe showcase story.
- Confirm the website field points to the README.
- Confirm the social preview uses current CHMReaderLight product imagery from `docs/assets/social-preview.png`.
- After a release, check that the public repository page still shows CI, CodeQL, stars, downloads, license, platform, Node.js, and release badges near the top of the README.
