# Security Policy

CHMReaderLight opens local documentation files, extracts CHM archives, and renders extracted pages through a restricted Electron protocol. Security reports are welcome, especially when they involve file boundary checks, archive extraction, renderer isolation, or unsafe content execution. For a plain-language summary of local data storage, see [Privacy and Local Data](./docs/privacy.md); for implementation trust boundaries, see [Security Model](./docs/security-model.md).

## Supported Versions

The project is pre-1.0. Security fixes are handled on the `main` branch and included in the next available release.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Earlier snapshots | No |

## Automated Checks

CodeQL code scanning runs on pull requests, pushes to `main`, and a weekly schedule. These checks help catch JavaScript and TypeScript security issues early, but they do not replace private reporting for sensitive findings.

## Reporting a Vulnerability

Please avoid filing public issues for vulnerabilities until they have been reviewed.

Preferred options:

- Use GitHub's private vulnerability reporting or draft security advisory flow for this repository, if it is enabled.
- If private reporting is unavailable, open a minimal public issue that says you have a security report and does not include exploit details, private CHM content, or sensitive paths.

Useful report details:

- macOS version and Mac architecture
- CHM language, approximate size, and whether a redacted sample can be shared
- Reproduction steps
- Impact, such as path traversal, script execution, unexpected external access, crash, or data exposure
- Logs or screenshots with private content removed

## Response Expectations

- Acknowledge new reports within 7 days, even if the initial response is only to confirm receipt.
- Share a status update at least every 14 days while a confirmed issue is being investigated or fixed.
- Coordinate public disclosure after a fix is available, or after a mitigation is documented for users.
- Document confirmed fixes in `CHANGELOG.md` and the relevant GitHub Release notes when appropriate.
