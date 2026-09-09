# Privacy and Local Data

CHMReaderLight is a local macOS reader. It does not include telemetry, analytics, accounts, cloud sync, or hosted document storage.

For implementation-level CHM trust boundaries, see [Security Model](./security-model.md).

## What Stays Local

- CHM source files stay where you selected them. The library stores file references and metadata; it does not copy or upload source CHM files.
- Library metadata is stored in Electron's app data directory as `library/library.json`. It includes the CHM display name, source file path, collection, added time and last-opened time.
- Extracted CHM contents are cached under the app data directory in `extracted-books/` so reopening a document can be faster.
- Temporary extraction staging folders may be created in the system temp directory while a document is being opened.
- The library grid/list preference is stored in browser `localStorage`.
- Reader preferences such as zoom, text encoding, sidebar width, sidebar visibility, search scope, and last-read topic are stored in browser `localStorage`.
- Successfully opened CHM paths can be added to the macOS recent documents menu.

## Reader Boundaries

- CHM pages are served through the app's restricted `chm://` protocol after path boundary checks.
- Rendered CHM pages use a strict Content Security Policy that blocks CHM-authored scripts, inline event handlers, form submissions, nested frames, plugin objects, and network connections.
- The reader iframe allows scripts only so CHMReaderLight's small nonce-protected navigation bridge can tell the app when the current topic URL changes.
- External `http` and `https` links inside CHM pages open in the default browser instead of navigating the embedded reader.

## Removing Local Data

- Removing a book or collection from the library only removes CHMReaderLight's saved reference. It does not delete the source CHM file.
- Moving or deleting a CHM outside the app can leave a stale library entry; remove it from the library and add the file again from its new location.
- To clear only extracted document cache, choose **Help > Clear Extracted Cache**. This keeps source CHM files and library metadata.
- To inspect or fully clear app data, choose **Help > Reveal App Data Folder**, quit the app, then remove the relevant saved metadata or cache files in Finder.

## Reporting Privacy or Security Issues

If you find a case where CHMReaderLight reads outside the selected document, executes untrusted CHM code, exposes private paths unexpectedly, or sends local data somewhere unexpected, follow the private reporting guidance in [Security Policy](../SECURITY.md).
