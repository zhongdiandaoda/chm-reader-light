# Maintainer Playbook

Use this page as a lightweight routine for keeping CHMReaderLight trustworthy, discoverable, and easy to contribute to. It connects the existing support, release, and discovery guides instead of replacing them.

## Weekly Stewardship

- Review new Issues and Discussions through the Issue Triage Guide before deciding whether a report needs support, docs, compatibility work, or product changes.
- Review the [Community Standards Checklist](./community-standards.md) when support paths, issue templates, Discussions, security reporting, contributor entry points, or repository automation change.
- Confirm `Help > Report or Request` still points installed users to the active issue templates, release feedback Discussion, showcase route, and security policy.
- Use the [Governance Guide](./governance.md) when a change needs a clear decision path, maintainer responsibility, discussion-first boundary, or review expectation.
- Keep one scoped good first issue visible so new contributors can find a small task with workflow value, likely files, and a clear verification command.
- Check release feedback and showcase stories for repeated friction, safe user quotes, and follow-up documentation opportunities.
- Confirm open support threads do not contain private CHM content, sensitive local paths, proprietary screenshots, or confidential document text.
- Move broad ideas toward a smaller feature request, roadmap note, or deferred decision instead of letting vague work accumulate.

## Before a Visibility Push

- Review the Repository Listing guide so the GitHub description, topics, website field, social preview, pinned items, labels, and Discussions setup still match the current project.
- Run `npm run check:remote-listing` before a visibility push so the live GitHub description, website, topics, and Discussions setting match the Repository Listing guide.
- Use the Growth Readiness guide to turn remote audit failures into the next promotion task, including baseline stars, downloads, watchers, and follow-up evidence.
- Use the Share Kit for factual release or social copy, and keep the ask for stars tied to a real offline CHM workflow.
- Check the Directory Submission Tracker before submitting to a new directory so stale external listings are updated or retired first.
- Confirm the latest release page still points users to checksums, artifact attestations, first-launch expectations, Project Status, and support paths.
- Run `npm run check:remote-release` before sharing direct download links so the latest public GitHub Release exposes both macOS zips and checksum files.
- Re-read Privacy and Local Data, Security Model, Compatibility Notes, and Accessibility Guide when promotion copy mentions trust, safety, compatibility, or keyboard access.

## Decision Rules

- Decline or defer requests that conflict with Project Status or Roadmap, especially cloud sync, hosted document storage, CHM authoring, broad cross-platform packaging, or unsupported distribution claims.
- Do not ask for stars until the user has a clear evaluation path, such as a release download, Use Cases, Comparison, Adoption Checklist, or a successful support outcome.
- Prefer support or documentation fixes when the app is behaving as designed but users cannot predict the behavior.
- Prefer reproducible compatibility work when a report includes safe CHM details, diagnostics, and smallest steps.
- Keep public threads safe by asking for sanitized logs, approximate file details, and redacted screenshots instead of private CHM files.

## Maintenance Evidence

- Update `CHANGELOG.md` with user-facing maintenance, support, release, discovery, and documentation changes while the context is fresh.
- Keep README, Support Guide, Documentation Index, Repository Listing guide, and in-app Help menu wording aligned when support routing changes.
- Run `npm run check` before treating docs, metadata, workflow, or release-process changes as ready for review.
- Run `npm test` after changing tests, app behavior, issue templates, release checks, or static documentation contracts.
- Use the Release Checklist before publishing artifacts, and update Project Status when platform support, release distribution, trust caveats, or scope changes.
