# Getting Started

This short path helps first-time users install CHMReaderLight, add a local CHM file, and find the most useful reader controls.

## 1. Install the App

Download the latest macOS build from [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases). Choose `CHMReaderLight-mac-arm64.zip` for Apple Silicon Macs or `CHMReaderLight-mac-x64.zip` for Intel Macs.

If GitHub Releases does not have a public build yet, install Node.js 22 or later and CHMLib, clone the repository, then run from source:

```bash
npm install
npm run run
```

For checksum verification, first launch, update, and removal details, follow the [macOS Install Guide](./install-macos.md).

## 2. Add Your First CHM

Open CHMReaderLight and choose **File > Add CHM to Library** to select one or more local `.chm` files.

You can also drag one or more `.chm` files into the library window. Files are added to the currently selected library collection.

## 3. Read and Navigate

Click a library item to open it in the reader. Use the searchable table of contents to jump between topics, or press `Command+F` to focus search in the current view. See the [Search Guide](./search.md) for library search, reader body search, directory filtering, match navigation, and indexing limits.

The reader keeps practical preferences such as zoom, text encoding, selected collection, library layout, sidebar width, sidebar visibility, and the last-read topic for each CHM between launches. The library also saves last-opened metadata locally so it can show recently opened books first. See [Keyboard Shortcuts](./shortcuts.md) for the full menu and keyboard reference, and [Accessibility Guide](./accessibility.md) for current keyboard, assistive technology, and appearance expectations.

For a quick scan of the library and reader workflow, see the [Feature Tour](./feature-tour.md).

## 4. Keep Your Library Tidy

CHMReaderLight stores references to your source CHM files instead of copying them. If a source file moves, use the library card action to relink it.

Use **Help > Privacy and Local Data** to review what stays on your Mac and **Help > Compatibility Notes** to check expected CHM behavior. If you need help, choose **Help > Report or Request** to choose the right issue-template, release-feedback, security-policy, or showcase route, then use **Help > Copy Diagnostic Info** before filing an issue.
