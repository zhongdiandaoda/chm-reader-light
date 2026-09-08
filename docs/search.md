# Search Guide

CHMReaderLight has separate search paths for finding books in the library, finding topics in the table of contents, and finding words inside the current CHM body text.

## Library Search

Use the library search field when you are still choosing which manual to open. It matches each book name or source file path, so it works well for large folders of SDK, API, or product documentation.

If the filtered view has no matches, use the empty-state action to clear the query and return to the current collection.

## Reader Search

Open a CHM file and press `Command+F` to focus reader search. The scope menu switches between:

- Body: searches extracted HTML body text across indexed pages in the current CHM file.
- Directory: filters the table of contents by topic title.

Body search is useful when you know a function name, error string, command, or setting. Directory search is faster when you know the approximate chapter or topic title.

The selected search scope is saved locally, so the reader opens with the same Body or Directory mode on the next launch.

## Match Navigation

Body search marks matching topics in the sidebar and highlights matches in the current page. Use the previous and next match controls in the toolbar to move between matches on the current page.

The match counter reports where you are within the current page, while the search status reports the total matches and topic count across the book.
To prevent unusually repetitive content from expanding without bound, counting and highlighting stop at 10,000 matches per page.

## Indexing Limits

Full-text search is built from visible body text in extracted HTML pages. Large books can take a moment to finish indexing after opening.

For predictable memory use, each indexed HTML page is limited to 16 MiB and the ordered source pages for one book are limited to 128 MiB in total. Pages above the per-page limit are skipped. When the next page would cross the total budget, indexing stops, so later pages in unusually large books may not appear in body-search results.

Search does not cover text that exists only inside images, generated script output, embedded binary objects, or unsupported plugin content.

If search results look stale after replacing a CHM file, choose **Help > Clear Extracted Cache** and reopen the document. For CHM-specific gaps, include the affected search query and **Help > Copy Diagnostic Info** output when filing a compatibility report.
