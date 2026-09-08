# Feature Tour

This tour gives evaluators and new users a short scan of the CHMReaderLight workflow before they install or file an issue. For matching the app to a specific documentation workflow, start with [Use Cases](./use-cases.md). For a trial-to-GitHub follow-up path, use the [Adoption Checklist](./adoption-checklist.md); for a shareable walkthrough script, use the [Demo Guide](./demo-guide.md).

## Library First

CHMReaderLight opens to a local library instead of a blank reader. Add files with **File > Add CHM to Library** or drag one or more `.chm` files into the window. The drag-and-drop import path adds books to the currently selected collection.

The library keeps source paths, folder labels, layout preference, selected collection, added and last-opened metadata, and missing-file warnings so large offline documentation folders stay manageable without copying source CHM files. It shows recently opened books first, then falls back to newly added books and title order.

## Reader Workflow

Open a library item to enter the reader. The sidebar shows a searchable table of contents with a topic count, while the toolbar shows reading position and controls for history, previous or next topic navigation, zoom, and text encoding.

Reader preferences such as zoom, text encoding, sidebar width, sidebar visibility, and the last-read topic for each CHM are saved locally between launches. `Command+F` focuses search in whichever view is active; see the [Search Guide](./search.md) for body search, directory filtering, match navigation, and indexing limits.

## Trust and Local Data

No telemetry, accounts, cloud sync, or hosted document storage are included. CHMReaderLight stores library metadata and reading preferences on your Mac, uses a restricted `chm://` protocol for extracted content, and blocks CHM-authored scripts, forms, popups, nested frames, plugin objects, and network connections.

For details, see [Privacy and Local Data](./privacy.md), [Compatibility Notes](./compatibility.md), and [Security Policy](../SECURITY.md).

## When Something Looks Wrong

Use [Troubleshooting](./troubleshooting.md) for common install, opening, encoding, search, cache, and stale-path issues. If you need to report a problem, choose **Help > Copy Diagnostic Info** and include the copied environment block with the smallest reproduction steps you can share.
