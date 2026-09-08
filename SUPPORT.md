# Support

[中文支持指南](./SUPPORT.zh-CN.md)

CHMReaderLight is a small open-source macOS app for reading local CHM files. This page helps route questions and reports to the right place.

Please follow the [Code of Conduct](./CODE_OF_CONDUCT.md) when participating in public project spaces.

Maintainers and contributors can use the [Issue Triage Guide](./docs/issue-triage.md) to route public reports, labels, reproduction details, and deferrals consistently. Use the [Maintainer Playbook](./docs/maintainer-playbook.md) for routine stewardship, visibility checks, and decision rules.

## Before Asking

- Check [Getting Started](./docs/getting-started.md) if this is your first time installing, importing, or reading a CHM file.
- Check [macOS Install Guide](./docs/install-macos.md) for release downloads, checksum verification, first launch, updates, and removal.
- Check [FAQ](./docs/faq.md) for download, privacy, cache, and compatibility questions.
- Check [Troubleshooting](./docs/troubleshooting.md) for setup, opening, encoding, search, and stale library entry issues.
- Check [Compatibility Notes](./docs/compatibility.md) when a specific CHM behaves differently than expected.
- Check [Accessibility Guide](./docs/accessibility.md) for keyboard, assistive technology, appearance, and accessibility-report expectations.
- Check [Project Status](./docs/project-status.md) for current platform support, release trust notes, and project scope.
- Search existing [Issues](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue) and [Discussions](https://github.com/zhongdiandaoda/chm-reader-light/discussions) before opening a new report so duplicates can stay linked to the same investigation.

## Usage Questions

Installed app users can start from **Help > Report or Request** for one-click routes to the question, install help, bug, CHM compatibility, feature request, performance, accessibility, documentation, release feedback, showcase, and security-policy paths. Use **Help > Release Feedback** directly when release trust, download, checksum, notarization, screenshot, demo, or support details are the only blocker.

Use the question issue template and describe what you are trying to do. Include your macOS version, Mac architecture, and whether you installed a release build or ran from source.

Use the install help issue template for download, checksum, provenance verification, first-launch, update, or removal questions. Include the release artifact name, checksum output if relevant, attestation output if relevant, macOS first-launch message, macOS version, and Mac architecture.

Use GitHub Discussions for open-ended usage questions and safe workflow notes that do not need a tracked issue yet. Use the [release-feedback Discussion](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback) when release trust, download, checksum, notarization, screenshot, demo, or support details would make CHMReaderLight easier to star, watch, or share.

## Bug Reports

Use the bug report template when the app cannot open, browse, search, or package a CHM file. Include how you installed or ran CHMReaderLight, then choose **Help > Copy Diagnostic Info** in the app and paste the copied output into the issue.

For CHM compatibility bugs, use the CHM compatibility issue template and include:

- CHM language and approximate file size
- Whether the file can be shared publicly or privately
- Whether the issue affects opening, table of contents, page rendering, internal links, search, images, or text encoding
- The smallest reproduction steps

## Feature Requests

Use the feature request issue template for reader, library, search, packaging, or documentation improvements. Focus on the workflow problem first, then describe the behavior you want.

Use the performance issue template for slow opening, extraction, search indexing, CHM search, startup, or large-library workflows. Include safe size details, measured timing, install source, and **Help > Copy Diagnostic Info** output.

Use the accessibility issue template for keyboard, VoiceOver, focus, color contrast, or appearance issues. Include the affected workflow, input method or assistive technology, macOS appearance setting, smallest reproduction steps, expected accessible behavior, and **Help > Copy Diagnostic Info** output.

Use the documentation issue template for unclear, missing, outdated, or confusing docs. Include the page name, the confusing detail, and any suggested wording or source.

## Showcase and Success Stories

Use the showcase issue template when CHMReaderLight helped your offline CHM workflow and you want to share the use case with future users. Mention what changed, what helped most, and safe setup context. Do not include private document content, proprietary screenshots, sensitive file paths, or confidential CHM text.

See the [Showcase Guide](./docs/showcase.md) for story prompts, privacy rules, and quote-permission expectations.

## Security Reports

Do not publish exploit details, sensitive file paths, private document content, or proof-of-concept payloads in a public issue. Follow the private reporting guidance in [Security Policy](./SECURITY.md) or [Chinese Security Policy](./SECURITY.zh-CN.md).
