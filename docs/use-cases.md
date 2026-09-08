# Use Cases

Use this guide to decide whether CHMReaderLight fits your offline documentation workflow before downloading a release build. For a short tradeoff scan against adjacent tools, see [Comparison](./comparison.md).

CHMReaderLight is best for macOS users who keep local `.chm` manuals, legacy SDK manuals, vendor help files, Microsoft HTML Help archives, offline API reference, or privacy-sensitive documentation collections on disk and want a lightweight library-first reader.

## Best-Fit Workflows

- Keeping legacy SDK manuals, API reference, and product documentation searchable after the original website, installer, or help viewer is no longer convenient.
- Grouping vendor help files and Microsoft HTML Help archives by project while keeping the original CHM files in place.
- Reading privacy-sensitive documentation collections locally, without telemetry, accounts, cloud sync, or hosted document storage.
- Reopening recently used manuals, finding nearby topics through the table of contents, and searching body text when you only remember an error string, symbol, command, or setting name.

## Not a Fit

- Editing, authoring, or rebuilding CHM files.
- Syncing manuals across devices or publishing hosted documentation.
- Running CHM-authored scripts, forms, plugin objects, popups, nested frames, or network-connected pages.
- Expecting every historic CHM to render exactly like Internet Explorer or Windows HTML Help.

## Evaluation Path

1. Download the latest macOS artifact from [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases).
   If GitHub Releases does not have a public build yet, run from source through [Getting Started](./getting-started.md).
2. Work through the [Adoption Checklist](./adoption-checklist.md) with one representative CHM file.
3. Check [Compatibility Notes](./compatibility.md) and [Privacy and Local Data](./privacy.md) if your manuals are old, multilingual, internal, or compliance-sensitive.
4. If CHMReaderLight solves the workflow, use **Help > Star on GitHub** so similar users can find it.
