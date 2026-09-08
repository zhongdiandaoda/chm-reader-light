# FAQ

For a quick snapshot of supported platforms, release distribution, trust caveats, and current scope, see [Project Status](./project-status.md).

## Which macOS versions are supported?

CHMReaderLight targets macOS 12 or later on both Apple Silicon and Intel Macs.

## Does CHMReaderLight support Windows or Linux?

No. CHMReaderLight currently focuses on macOS 12 or later. Windows, Linux, iOS, and iPadOS packages are not supported release targets yet; see [Project Status](./project-status.md) for the current platform and scope snapshot.

## Can I use CHMReaderLight at work or in a company environment?

CHMReaderLight is distributed under the MIT License, which permits use, copying, modification, publishing, distribution, sublicensing, and selling under the license terms. Review [LICENSE](../LICENSE) with your organization if you need legal approval for work-owned devices, internal manuals, or redistributed builds.

## Which download should I choose?

Use the Apple Silicon build on Macs with M-series chips and the Intel build on older Intel Macs. Release artifacts are named `CHMReaderLight-mac-arm64.zip` and `CHMReaderLight-mac-x64.zip`. Homebrew is not a supported install path yet; see the [Homebrew Cask Guide](./homebrew-cask.md) for future distribution requirements.

## How do I verify a release download?

Download the zip and matching `.zip.sha256` file from the same GitHub Release, then run the command for your architecture:

```bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
shasum -a 256 -c CHMReaderLight-mac-x64.zip.sha256
```

For an optional provenance check with GitHub artifact attestations, install GitHub CLI and run:

```bash
gh attestation verify CHMReaderLight-mac-arm64.zip --repo zhongdiandaoda/chm-reader-light
gh attestation verify CHMReaderLight-mac-x64.zip --repo zhongdiandaoda/chm-reader-light
```

## How do I update CHMReaderLight?

Download the newer release for your Mac architecture, unzip it, and replace the existing `CHMReaderLight.app`. Library metadata, reader preferences, and extracted cache live in the app data folder, so replacing the app bundle does not remove your saved library state.

## Does CHMReaderLight check for updates automatically?

No. CHMReaderLight does not include an automatic updater, background update checks, telemetry, or release polling. Use GitHub Releases or watch the repository when you want to check for newer packaged builds.

## Does CHMReaderLight have a fixed release cadence?

No fixed cadence is promised yet. Releases are cut when there is a tested user-facing improvement, packaging fix, security or dependency update, or documentation and support improvement worth publishing. Watch GitHub Releases for packaged builds, and review the changelog before updating if you depend on CHMReaderLight for work documentation.

## Does CHMReaderLight include analytics or crash reporting?

No. CHMReaderLight does not include analytics, telemetry, crash reporting, accounts, cloud sync, or hosted document storage. Project links such as GitHub Releases, Issues, Discussions, and documentation open in your browser only when you choose them. If you find unexpected data access or network behavior, follow the private reporting guidance in [Security Policy](../SECURITY.md).

## Can I build or run CHMReaderLight from source?

Yes. Use Node.js 22 or later, run `npm install`, then `npm run doctor` and `npm run run` for a local development launch. Run `npm run check` and `npm test` before opening a pull request. Local source runs need a system CHMLib; macOS packaging builds the pinned patched source itself.

## Do I need to install CHMLib separately?

No for packaged builds. The macOS release zip includes the native `extract_chmLib` helper, dynamic `libchm` dependency, corresponding source, license, security patch, and provenance inside `CHMReaderLight.app`. Local development runs still need CHMLib installed, but self-packaging builds the pinned patched source automatically.

## Why does macOS warn when I open the app?

Current release artifacts are built for open-source distribution and are not Apple-notarized yet. If macOS blocks the first launch, allow the app from **System Settings > Privacy & Security**. See [Signing and Notarization](./signing-notarization.md) for the current trust status and maintainer requirements before that wording changes.

## Does the app copy or upload my CHM files?

No. The library stores source file paths and metadata only. CHM source files stay where you selected them, and the app does not include telemetry, accounts, cloud sync, or hosted document storage.

## Does CHMReaderLight modify my original CHM files?

No. CHMReaderLight reads source CHM files and writes its own library metadata, reader preferences, and extracted cache under the app data folder. It does not write bookmarks, search indexes, cache files, or repaired content back into the original `.chm` file.

## Where does CHMReaderLight store app data?

Library metadata is stored in Electron's app data directory as `library/library.json`. Extracted CHM contents are cached under `extracted-books/`, and reader preferences such as zoom, text encoding, sidebar state, search scope, and last-read topic use browser `localStorage`. Successfully opened CHM paths may also appear in the macOS recent documents menu; see [Privacy and Local Data](./privacy.md) for the full storage map.

## Can I back up or move my library to another Mac?

Use **Help > Reveal App Data Folder** to inspect `library/library.json` and the extracted cache before making a backup. The library stores source CHM file paths, so copied metadata only works when the same CHM files are reachable at the saved paths on the other Mac. If paths change, reconnect the files with the relink action or add the CHM files again.

## Can I use CHMReaderLight without an internet connection?

Yes. After you download and install the app, reading local CHM files, browsing the library, searching indexed content, and restoring reader preferences work without an internet connection. Links to GitHub Releases, docs, issues, and Discussions need a browser connection because they open the public project site.

## Will removing CHMReaderLight delete my CHM files?

No. Deleting `CHMReaderLight.app` removes the application bundle only; source CHM files stay in their original folders. Use **Help > Reveal App Data Folder** before removing the app if you also want to inspect or delete saved library metadata, reader preferences, or extracted cache files.

## How can I support CHMReaderLight if it helps me?

Star the repository from GitHub or use **Help > Star on GitHub** so other macOS CHM users can find it. Use **Help > Copy Share Text** when you want a ready-made bilingual summary with release, star, feedback, and showcase links. Share a safe workflow story with the showcase issue template when CHMReaderLight improves your offline CHM reading setup. Use GitHub Discussions for open-ended workflow notes, or the [release-feedback Discussion](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback) when release details would make the app easier to trust, star, watch, or share.

Installed users can choose **Help > Report or Request** for issue-template, release-feedback, and showcase routes.

## Can I keep CHM files on an external drive or cloud-synced folder?

Yes, as long as macOS can still reach the same source file path when you open the library entry. If the drive is disconnected, the cloud file is online-only, or the path changes, the saved entry appears missing until you reconnect the location or relink the CHM.

## Will large CHM files or big libraries be slow?

Large CHM files can take longer to extract and build the first search index. Reopening a previously extracted book should usually be faster because extracted contents are cached. For repeatable measurements, use the [Benchmarking Guide](./benchmarking.md) or run `npm run benchmark:chm`. When filing a performance report, include safe CHM or library size details, measured timing, install source, and **Help > Copy Diagnostic Info**.

## Can I open CHM files from Finder or the command line?

Yes. Packaged macOS builds declare the `.chm` document type, so you can use Finder's Open With menu after installing CHMReaderLight. Opening a `.chm` from Finder or passing one on the command line adds it to the library and opens the reader. If the app is already running, the existing window is focused and the requested CHM opens there.

## What happens if I move a CHM file?

The saved library entry can become stale because it points to the original source path. Use the relink action on a missing entry, or remove the entry and add the CHM again from its new location.

## Why does a CHM open without a table of contents?

Some CHM files omit an `.hhc` table of contents or use unusual markup. The body page may still open while the sidebar is incomplete. See [Compatibility Notes](./compatibility.md) for current expectations.

## Can CHMReaderLight open password-protected or encrypted CHM files?

Not reliably. Password-protected, encrypted, corrupt, or partially extracted CHM files may fail before CHMReaderLight can parse metadata or render pages. Use a standard extractable CHM file, or include safe reproduction details in a CHM compatibility report.

## Why does text look garbled?

Older CHM files may use legacy encodings. Try the reader text encoding menu, especially `GBK`, `GB18030`, `BIG5`, `Shift-JIS`, `EUC-JP`, or `EUC-KR`.

## Does CHMReaderLight support Chinese, Japanese, or Korean CHM files?

Yes, when the CHM can be extracted and rendered with a supported text encoding. Try `GBK`, `GB18030`, `BIG5`, `Shift-JIS`, `EUC-JP`, or `EUC-KR` from the reader text encoding menu if text looks garbled. For unresolved encoding gaps, include the CHM language, selected encoding, smallest reproduction steps, and **Help > Copy Diagnostic Info** in a compatibility report.

## Why are scripts and forms disabled?

CHMReaderLight treats CHM files as local documents from unknown sources. CHM-authored scripts, inline event handlers, form submissions, popups, nested frames, plugin objects, and network connections are blocked to reduce the risk of opening untrusted content. The app still injects a small nonce-protected navigation bridge so reader history and sidebar sync work.

## How do I reset cached extracted content?

Choose **Help > Clear Extracted Cache**. This removes only cached extracted CHM contents; source CHM files and library entries stay in place.

## What accessibility support is available today?

CHMReaderLight supports keyboard-driven library and reader workflows through the documented shortcuts, visible focus states, labeled controls, and polite status announcements for search and library changes. VoiceOver and other assistive technology feedback is welcome as focused bug reports, especially when a specific CHM, control, or navigation path is hard to use.

## Does CHMReaderLight support dark mode or high-contrast themes?

CHMReaderLight currently uses a light appearance and does not include separate dark-mode or high-contrast theme switches. If a color, contrast, or system-appearance issue makes real CHM reading harder, open a focused accessibility or usability report with your macOS appearance setting and a safe screenshot if possible.

## What does Copy Diagnostic Info include?

It copies the CHMReaderLight app version, Electron version, Node.js version, platform, CPU architecture, and macOS release. It does not copy CHM document text, library entries, source file paths, screenshots, or extracted cache contents.

## Do I need to attach my CHM file or screenshots when reporting a problem?

No. Public issues should not include private CHM files, proprietary screenshots, sensitive local paths, or confidential document text. Share safe details such as CHM language, approximate size, affected area, reproduction steps, and whether a sample can be shared publicly or privately. Redact screenshots, logs, copied error text, and diagnostic output before posting.

## Where can I find keyboard shortcuts?

See [Keyboard Shortcuts](./shortcuts.md). The same page is available from **Help > Keyboard Shortcuts** in the app.

## What should I include in a bug report?

Start with [Troubleshooting](./troubleshooting.md), then include the smallest reproduction steps, macOS version, Mac architecture, CHM language and approximate size, and the output from **Help > Copy Diagnostic Info**.
