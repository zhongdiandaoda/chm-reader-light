# Sample CHM Guide

Use this guide when choosing CHM files for screenshots, short demos, compatibility reports, or contributor fixtures. Good samples make the project easier to evaluate without exposing private documents.

## Use Public or Synthetic Samples

- Use a public sample CHM when the license allows redistribution or public screenshots.
- Build a small synthetic CHM when you only need to reproduce table-of-contents nesting, text encoding, internal links, image paths, or search behavior.
- Keep sample names, folder names, and page content generic enough that screenshots and logs can be shared in public issues.
- Do not commit private CHM files, extracted proprietary documentation, customer manuals, internal SDKs, or screenshots that reveal confidential text.

## Good Demo Material

Choose a sample that shows at least two of these workflows:

- A table of contents with nested topics.
- body search for a visible word or API-like symbol.
- images or internal links that prove resource resolution works.
- Multiple pages so previous and next topic navigation are meaningful.
- Non-sensitive local file paths that can be shown or safely redacted.

## Sharing Safely

- Always redact local paths before posting logs, screenshots, or copied diagnostic output.
- When possible, avoid screenshots with proprietary content, private file names, personal directories, or internal product names.
- Prefer a minimal reproduction CHM over a large real-world manual when filing public issues.
- When a private file is the only reproduction, describe the affected area and offer to coordinate privately instead of attaching it.

## Useful For

- Recording a public walkthrough with the [Demo Guide](./demo-guide.md).
- Filing a focused compatibility report with enough detail for maintainers to reproduce the behavior.
- Creating small test fixtures for parser, search, encoding, internal-link, or image-path work.
- Preparing contribution screenshots without leaking private document content.
