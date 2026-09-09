# Compatibility Notes

CHMReaderLight focuses on local Microsoft Compiled HTML Help files on macOS. CHM files vary widely by authoring tool, language, age, and embedded browser assumptions, so this page sets expectations and explains what to include when reporting a compatibility gap.

For the security reasoning behind reader restrictions, see [Security Model](./security-model.md).

## Expected to Work

- Standard `.chm` files that can be extracted by `extract_chmLib`.
- Books with an `.hhc table of contents`, including common nested `<ul>` structures.
- HTML topic pages that use relative links to other pages, images, stylesheets, fonts, or media inside the extracted CHM.
- Searchable pages whose content is present as text in extracted HTML.
- Common legacy encodings when the document declares a charset or when the reader text encoding menu is set manually.
- Local library workflows where the original CHM source file remains available at the saved path.

## Known Limits

- CHM-authored scripts, inline event handlers, form submissions, plugin objects, network connections, popups, and nested frames are blocked by the reader's sandbox and Content Security Policy. The app still injects a small nonce-protected navigation bridge so the sidebar can follow topic changes.
- External web links inside CHM pages open in the default browser instead of replacing the local reader page.
- Search does not index text that exists only inside images, generated script output, embedded binary objects, or unsupported plugin content.
- Some CHM files omit an `.hhc` file or contain unusual table-of-contents markup. The body page may still open while the sidebar is incomplete.
- External web links are not treated as book resources. The reader is designed for offline local documentation.
- Password-protected, encrypted, corrupt, or partially extracted CHM files may fail before the app can parse metadata.
- Extracted books are limited to 50,000 regular files, 60,000 total filesystem entries, 1 GiB of extracted data, and 256 MiB per file. Books above these safety limits, or books producing symbolic links or special files, are rejected before metadata parsing and search indexing.
- An HTML or HHC file above 16 MiB is not loaded into an in-memory transform. Oversized HTML pages are omitted from full-text search and return a size-limit error when opened; an oversized HHC file prevents the book from opening because its navigation metadata cannot be parsed safely. Search indexing stops before its ordered HTML inputs exceed a 128 MiB source budget, so later pages may not appear in body-search results for unusually large books.
- HHC navigation is limited to 50,000 table-of-contents items and 256 nesting levels. Books above either structural limit are rejected rather than building an unbounded sidebar tree.
- Packaged builds include the native extractor. Local development builds still depend on a working CHMLib install for the current Mac architecture.

## Encoding Guidance

Older CHM files often predate UTF-8 defaults and may contain legacy encodings. If the sidebar or body text looks garbled, try the reader text encoding menu:

- Simplified Chinese: `GBK` or `GB18030`
- Traditional Chinese: `BIG5`
- Japanese: `Shift-JIS` or `EUC-JP`
- Korean: `EUC-KR`

Use the default encoding again when the CHM declares a correct charset.

## Reporting Gaps

Before opening an issue, check [Troubleshooting](./troubleshooting.md). If the problem still looks like a compatibility gap, use the CHM compatibility issue template. Use a public or synthetic sample when possible and include:

- The smallest reproduction steps.
- macOS version, Mac architecture, app version, and how CHMReaderLight was installed or run. Use **Help > Copy Diagnostic Info** when possible.
- CHM language, approximate size, and whether the file can be shared privately or publicly.
- Whether the issue affects opening, table of contents, body page rendering, internal links, search, images, or text encoding.
- A screenshot or copied error text with private paths and document content removed.
