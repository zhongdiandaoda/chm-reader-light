# Security Model

CHMReaderLight is designed for reading local CHM documentation on macOS. This page explains the trust boundaries that matter when opening CHM files from unknown or internal sources.

## Trust Boundaries

- CHM files are untrusted input, even when they come from a trusted team or vendor.
- Source CHM files stay in their original locations; the app stores file paths and metadata, not copies of the original documents.
- Extracted book contents live in the app data directory and are served through the restricted `chm://` protocol.
- Native CHM extraction runs with a bounded output buffer and a two-minute timeout. The packaged helper rejects more than 60,000 entries or 50,000 files, more than 1 GiB of declared output, or a file above 256 MiB before writing the entry that crosses a limit. Before metadata parsing or search indexing, the app independently checks the actual extracted tree against the same limits and rejects symbolic links or other non-regular entries. Metadata parsing reuses the bounded asynchronous tree walk's file list instead of synchronously enumerating the directory again, and the background search worker repeats the bounded check before indexing. Failed validation leaves the open flow fail-closed, and failed or timed-out staging directories are removed before the error returns to the reader. Local source runs that use a system `extract_chmLib` receive the post-extraction checks but cannot assume the packaged helper's pre-write limits.
- macOS packages build CHMLib from a pinned source commit and SHA-256-verified archive, then apply the CVE-2025-48172 bounds-check backport and the native extraction-budget patch. Packaging and final-zip verification reject missing or mismatched source, patches, provenance, binary hashes, architectures, and relative dynamic-library links.
- Extracted-cache keys include the resolved source path, filesystem device and inode, byte size, and nanosecond modification and change times. New extractions use a staging directory beside the final cache target so publication remains a same-filesystem atomic rename. The app checks source identity before that publication and again after either reading a cached extraction or publishing the staging directory, before activating the opened-book state. A source replaced during either path therefore fails closed; a newly published cache is removed if the final check fails, and a same-size CHM replaced within one millisecond selects a new cache instead of reusing stale content. Open, text-encoding reload, and cache-clear transactions are serialized within the main process so overlapping UI, Finder, second-instance, and maintenance requests cannot race cache publication or active-reader state. Text-encoding reloads commit the new active encoding only after metadata parsing succeeds. Empty extracted caches are treated as invalid, allowing the open flow to rebuild stale or incomplete cache state.
- In-memory markup transforms are limited to 16 MiB per HTML or HHC file. Bounded file reads verify the opened inode, expected size, final size, and complete byte count before decoding. Search indexing also stops before it would exceed 128 MiB of HTML source per search index; oversized pages are omitted from search, while oversized table-of-contents files and reader pages fail closed. Background search-worker startup failures degrade to an empty body-search index without turning an otherwise successful book open or encoding reload into a partial failure. Non-HTML resources continue through the streaming response path.
- HHC navigation parsing is limited to 50,000 table-of-contents items and 256 nesting levels so compact but structurally adversarial markup cannot create an unbounded sidebar tree or exhaust the parser stack.
- Every `chm://` resource request is resolved against the extracted book root before a file is read, so decoded paths cannot escape into unrelated local directories.
- external `http` and `https` links are handed to the default browser instead of replacing the local reader page.

## Reader Isolation

- CHM pages render inside a sandboxed iframe.
- The Content Security Policy blocks CHM-authored scripts, inline event handlers, form submissions, nested frames, plugin objects, network connections, and arbitrary base URLs.
- The iframe allows scripts only so CHMReaderLight can inject a small nonce-protected navigation bridge for sidebar sync and reader history.
- The preload bridge exposes a narrow `window.chmReader` API instead of giving renderer code direct Node.js or Electron access.
- The top-level app window rejects renderer-initiated navigation and popup creation, so untrusted web pages cannot replace the local UI or inherit its preload bridge.
- Reader subframes may navigate only within the active `chm://book` origin or the app's exact `about:blank` loading transition; remote and malformed frame destinations are blocked before navigation.
- The app's browser session denies web permission checks and requests because CHM reading does not require camera, microphone, location, notification, or similar capabilities.
- Main-process IPC handlers accept requests only from the active app window's main frame; CHM iframes and unrelated web contents are rejected.
- macOS packaging flips production Electron fuses before the final code signature. `ELECTRON_RUN_AS_NODE`, `NODE_OPTIONS`, and command-line debugging entry points are disabled, while cookie encryption and `OnlyLoadAppFromAsar` are enabled. Embedded ASAR integrity validation is enabled too: final release-bundle verification reads these states back from the packaged Electron Framework and checks that the `ElectronAsarIntegrity` metadata in `Info.plist` matches the actual `app.asar` header. File-protocol privileges remain enabled because the trusted top-level UI currently loads from `file://`. These fuses reduce unused runtime entry points but do not replace the renderer sandbox, CSP, navigation restrictions, IPC sender checks, or code signing.

## Local Data Boundaries

- Library metadata reads and writes are limited to 16 MiB, 10,000 books and 1,000 collections. Persisted fields and string lengths are validated both after reading and immediately before every write, oversized or malformed state is rejected before parsing or replacing the existing file, transient availability fields are not persisted, and in-process read-modify-write updates are serialized so concurrent UI actions cannot overwrite each other. Symbolic-link inputs are not followed, and source availability probes run with bounded concurrency.

CHMReaderLight does not upload, sync, or host CHM content. Local state is limited to library metadata, extracted cache files, browser preferences, and macOS recent documents. See [Privacy and Local Data](./privacy.md) for the plain-language storage map.

## Security Review Checklist

When changing CHM loading, reader navigation, IPC, file paths, or packaging, check:

- path traversal stays blocked for decoded and nested resource paths.
- CHM-authored JavaScript remains blocked unless it is the nonce-protected navigation bridge injected by the app.
- Forms, plugin objects, nested frames, and network requests remain disabled inside CHM content.
- external `http` and `https` links continue to open outside the reader in the default browser.
- New IPC handlers use the trusted-sender wrapper, validate argument types, and avoid exposing arbitrary filesystem access.
- Search query limits, extractor timeouts, extracted-tree budgets, and markup transformation budgets remain enforced outside the untrusted renderer rather than relying only on renderer controls.
- Logs, diagnostics, screenshots, and issue templates do not require private document content or sensitive local paths.
- Packaged native dependencies retain their corresponding source, license, local patch, and verifiable provenance; see [Third-Party Notices](../THIRD_PARTY_NOTICES.md).
- Production Electron fuse settings remain explicit, are applied before the final signature, and are read back from every release bundle.

The [OpenSSF Scorecard](https://scorecard.dev/view/github.com/zhongdiandaoda/chm-reader-light) workflow tracks repository supply-chain posture alongside CI, CodeQL, dependency audit, Dependency Review, and release artifact verification. Treat Scorecard findings as maintenance signals to review, not as a substitute for CHM trust-boundary tests.

Dependency Review flags risky pull request dependency changes before they merge. It complements the local `npm run check:audit` gate by reviewing the dependency diff in the pull request, not just the resolved dependency tree on a developer machine.

Report suspected vulnerabilities through [Security Policy](../SECURITY.md), not a public issue with exploit details.
