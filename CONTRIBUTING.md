# Contributing

Thanks for improving CHMReaderLight. Please follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Setup

Requirements: macOS, Node.js 22 or newer, and npm.

```bash
npm install
npm run doctor
npm test
npm run check
```

Read [Architecture](./docs/architecture.md) before changing the main process, preload bridge, renderer, CHM parser, library persistence, or packaging. Read [Security Model](./docs/security-model.md) before changing extraction, navigation, IPC, CSP, or untrusted content handling.

## Change Guidelines

- Keep changes focused and preserve existing project patterns.
- Add or update tests for behavior changes.
- Do not commit private CHM files, extracted proprietary content, local paths, credentials, build output, or release archives.
- Keep user-facing behavior documented in README or the relevant core guide.
- Include the macOS version and Mac architecture when reporting UI or packaging results.

## Verification

Use focused tests while iterating, then run the complete gates before review:

```bash
npm test
npm run check
git diff --check
```

Packaging changes should also follow [Release Guide](./docs/release.md). See [Testing](./docs/testing.md) for targeted commands.

## Pull Requests

Describe the user impact, implementation scope, verification performed, and any remaining limitations. Add a screenshot for visible UI changes. Security issues must follow [SECURITY.md](./SECURITY.md) rather than a public issue.
