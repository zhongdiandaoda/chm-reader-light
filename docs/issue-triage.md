# Issue Triage Guide

Use this guide when reviewing new public issues. Good triage keeps support friendly, protects private CHM content, and turns vague reports into work that can be reproduced.

## First Response

- Acknowledge the report and thank the reporter.
- Check whether the issue used the right template: bug report, CHM compatibility report, accessibility or usability report, performance report, feature request, documentation improvement, question, or showcase.
- Search existing Issues and Discussions for the same symptom or request before treating the report as new.
- Ask for missing reproduction details before guessing at a fix.
- Route suspected vulnerabilities or private document exposure to the [Security Policy](../SECURITY.md) instead of continuing in a public issue.

## Labels and Routing

Keep `.github/labels.yml` aligned with these routing labels so issue templates and generated release notes stay consistent:

- Use `bug` for reproducible application behavior that should work differently.
- Use `compatibility` for CHM-specific opening, table-of-contents, rendering, link, search, image, or encoding reports.
- Use `accessibility` for keyboard navigation, focus, VoiceOver, assistive technology, color contrast, or appearance reports.
- Use `enhancement` for reader, library, search, packaging, or documentation improvements.
- Use `documentation` for unclear, missing, outdated, or confusing docs that can be fixed without changing app behavior.
- Use `performance` for slow opening, extraction, search indexing, search queries, startup, or large-library workflows with timing details.
- Use `showcase` for positive user stories about successful offline CHM workflows.
- Route install help issues by checking the release artifact, checksum result, attestation result, first-launch message, macOS version, and Mac architecture before deciding whether the next action is documentation, packaging, or support.
- Route release trust, download confidence, screenshot, demo, or announcement feedback to the release-feedback Discussion when it does not need a tracked bug or packaging fix yet.
- Use documentation-focused wording when the product behavior is expected but the docs need to explain it more clearly.
- Point setup and workflow questions to [Support](../SUPPORT.md), [FAQ](./faq.md), or [Troubleshooting](./troubleshooting.md) when no code change is needed.
- For showcase issues, use the [Showcase Guide](./showcase.md) and confirm quote permission before reusing the story in README, release notes, or share materials.

## Reproduction Quality

A report is ready for investigation when it includes:

- macOS version and Mac architecture.
- App version, release artifact name, or commit SHA.
- The smallest steps that reproduce the issue.
- The affected area, such as opening, table of contents, page rendering, internal links, search, images, or text encoding.
- For accessibility reports, the input method or assistive technology, macOS appearance setting, expected accessible behavior, and affected workflow.
- Safe CHM details: language, approximate size, generation tool if known, and whether the file can be shared.
- Diagnostic output from **Help > Copy Diagnostic Info**.
- Screenshots or logs with private paths and document content removed.

## Closing or Deferring

- Close duplicates with a link to the canonical issue and copy over any unique reproduction detail.
- Close support questions after linking the relevant guide and confirming no product or documentation gap remains.
- Defer feature requests that conflict with the [Roadmap](./roadmap.md), especially cloud sync, hosted document storage, CHM authoring, or broad cross-platform packaging.
- Keep issues open when the behavior is reproducible, security-sensitive, or a documentation gap that would help future users.
