# Benchmarking Guide

Use the CHM benchmark when changing parsing, metadata discovery, search indexing, extraction caching, or worker concurrency. It prints JSON so results are easy to compare between branches.

## Synthetic Book

Run a synthetic benchmark when you want a repeatable baseline without using a real CHM file:

```bash
npm run benchmark:chm -- --pages 1200 --paragraphs 12 --iterations 3
```

The script creates temporary HTML pages, parses the generated table of contents, builds the search index, prints timing data, and removes the temporary files.

## Pre-Extracted Book

Use an extracted CHM directory when you want to isolate parser and search-index cost:

```bash
npm run benchmark:chm -- --extracted-root /path/to/extracted-book --iterations 3
```

This skips the native extraction step and measures file discovery, metadata parsing, and search indexing.

## Real CHM File

Use a real `.chm` file when you need end-to-end extraction timing:

```bash
npm run benchmark:chm -- --chm /path/to/manual.chm --iterations 3
```

If the extractor is not on `PATH`, pass it explicitly:

```bash
npm run benchmark:chm -- --chm /path/to/manual.chm --extractor /opt/homebrew/bin/extract_chmLib
```

Add `--skip-search-index` when you only want extraction, file listing, and table-of-contents timing.

## Reading Results

The output includes `totalMs`, `medianMs`, `meanMs`, and per-phase timings. Compare `medianMs` across several runs before treating a change as faster or slower, and keep the machine, Node.js version, file size, page count, and concurrency the same between runs.

Do not commit private CHM files, extracted proprietary documentation, or benchmark output that exposes local file paths. Share only redacted summaries when discussing performance in public issues or pull requests.
