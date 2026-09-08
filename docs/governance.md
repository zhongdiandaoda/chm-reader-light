# Governance

CHMReaderLight uses lightweight project governance so contributors can predict how issues, pull requests, roadmap changes, and release decisions are handled. The goal is to keep the app focused, trustworthy, and easy to improve without creating a heavy process.

## Maintainer Responsibilities

- @zhongdiandaoda owns final project decisions, repository settings, release publishing, and review routing.
- Maintainers keep the Roadmap, Project Status, Support Guide, Community Standards Checklist, and Maintainer Playbook aligned when the project scope or public workflows change.
- Maintainers should explain deferrals or declined proposals with links to the Roadmap, Project Status, Security Model, or compatibility limits when possible.
- Maintainers should keep public conversations safe by asking for sanitized diagnostics, approximate CHM details, and redacted screenshots instead of private content.

## Decision Paths

- Use GitHub Issues for tracked bugs, compatibility reports, feature requests, documentation improvements, and scoped starter tasks.
- Use GitHub Discussions for open-ended questions, workflow notes, release feedback, and showcase follow-ups that do not need tracked implementation work yet.
- Use pull requests for focused changes that already match the Roadmap, Project Status, and contribution guidance.
- Use the Maintainer Playbook before visibility pushes, release follow-ups, or recurring stewardship passes.
- Use the Issue Triage Guide when a report needs labels, reproduction checks, duplicate routing, or a deferral decision.

## Changes That Need Discussion First

Open an issue or discussion before starting work that changes the product promise, release trust story, or review burden. This includes cloud sync, hosted document storage, telemetry, CHM authoring, broad cross-platform packaging, signing, notarization, or release distribution changes.

Also discuss changes first when they need private CHM samples, unavailable hardware, large UI redesigns, new dependencies in security-sensitive paths, or compatibility behavior that may affect existing users.

## Privacy and Safety Boundaries

Do not ask contributors or users to attach private CHM files, proprietary screenshots, sensitive local paths, or confidential document text in public issues, discussions, or pull requests.

Prefer safe reproduction material:

- Public sample CHM files that are allowed to be shared.
- Small synthetic CHM files created only to demonstrate navigation, encoding, search, or rendering behavior.
- Redacted diagnostic output from **Help > Copy Diagnostic Info**.
- Approximate file size, language, affected area, and smallest reproduction steps.

Use the Security Policy for vulnerabilities and avoid public exploit details.

## Review Expectations

Pull requests should stay small, test-backed, and aligned with the Roadmap and Project Status. Reviewers look for:

- A clear user or maintainer workflow improvement.
- Focused scope with unrelated cleanup left for separate work.
- Tests or documented manual verification that match the change.
- Updated README, docs, changelog, project status, or release notes when user-facing behavior or repository trust signals change.
- Respect for local-only CHM handling, no telemetry, and safe public reporting boundaries.

If a proposal is useful but too broad, maintainers should help split it into a smaller issue, roadmap note, or follow-up discussion.
