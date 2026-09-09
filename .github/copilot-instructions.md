# Copilot Instructions

CHMReaderLight is a focused macOS CHM reader and local library. Keep suggestions aligned with the existing Electron, TypeScript, and documentation patterns in this repository.

## Project Scope

- Prefer small, test-backed changes that improve CHM reading, local library management, search, macOS packaging, documentation, support, or repository trust.
- Do not add cloud sync, telemetry, CHM authoring, or broad cross-platform support unless the roadmap and project status have been updated first.
- Keep source CHM files local. The app stores file paths, reader preferences, and extracted cache data under app-controlled local storage.
- Do not request private CHM files, proprietary screenshots, sensitive paths, or confidential document text in public issues, tests, examples, or docs.

## Implementation Notes

- Read the [Architecture Overview](../docs/architecture.md) before changing main process, preload, renderer, parser, library, packaging, or protocol code.
- Read the [Security Model](../docs/security-model.md) before changing `chm://` resource handling, iframe behavior, content security policy, extraction paths, or diagnostic output.
- Follow the [Support Guide](../SUPPORT.md) when changing user-facing issue, troubleshooting, or feedback routes.
- Use the [Testing Guide](../docs/testing.md) to choose focused checks while iterating and the full gate before review.
- Keep documentation links, issue templates, GitHub automation, and release guidance consistent with the Documentation Index and Community Standards Checklist.

## Verification

- Run `npm test -- --test-name-pattern "<focused test name>"` while iterating on a specific behavior or static documentation contract.
- Run `npm run check` before treating docs, metadata, workflow, packaging, or release-process changes as ready.
- Run `npm test` before final review when tests, app behavior, issue templates, GitHub metadata, or static documentation contracts change.
- Update `CHANGELOG.md` for user-facing, contributor-facing, support, release, discovery, or repository-trust changes.
