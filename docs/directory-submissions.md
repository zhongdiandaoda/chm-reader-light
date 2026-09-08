# Directory Submissions

Use this checklist when submitting CHMReaderLight to curated app lists, open-source macOS app lists, developer-tool directories, or documentation-tool collections. The goal is to reach users who already need an offline CHM reader without spamming unrelated communities.

## Submit After These Are Ready

- A public GitHub Release is available for both Apple Silicon and Intel Macs.
- The repository About panel, topics, website field, social preview, and badges match [Repository Listing](./repository-listing.md).
- The README, [Use Cases](./use-cases.md), [Comparison](./comparison.md), [Privacy and Local Data](./privacy.md), and [Compatibility Notes](./compatibility.md) answer the common pre-install questions.
- The release page has clear artifact names, checksum files, and the current notarization caveat.
- If a directory expects Homebrew metadata, use the [Homebrew Cask Guide](./homebrew-cask.md) and submit only after a cask exists.

## Candidate Directory Types

- Open-source macOS app lists where utility apps and local-first tools are welcome.
- Developer-tool directories that include offline documentation, SDK reference, or file viewer tools.
- Documentation-tool collections focused on reading, searching, or organizing local technical references.
- Community resource lists that explicitly accept maintained GitHub projects and link to release artifacts.

Skip generic launch sites, unrelated productivity lists, or communities where CHM, offline documentation, macOS utilities, or developer reference workflows are off topic.

## Outreach Backlog

Prioritize directories by audience fit, submission effort, and whether the listing can point to GitHub Releases:

- High priority: open-source macOS app lists that accept maintained utility apps.
- High priority: developer documentation or API-reference tool indexes.
- Medium priority: Electron app galleries or local-first tool collections.
- Low priority: broad software directories where CHM, macOS, or offline documentation search is not a visible category.

Record the backlog source and priority in the tracker before submitting so future maintainers can see why a directory was chosen.

## Discovery Queries

Use these copy-ready searches to find candidate directories without locking the project to one stale list:

```text
"open source macOS apps" CHM reader
"offline documentation" "macOS" "GitHub Releases"
"Electron apps" "developer tools" directory
topic:chm topic:macos
```

Save the exact query, result URL, and rejection reason in the tracker so future visibility pushes can reuse useful searches and skip weak channels.

## Submission Copy

Short description:

```text
A lightweight offline CHM reader and library for macOS.
```

Longer description:

```text
CHMReaderLight helps macOS users keep local CHM manuals, legacy SDK docs, vendor help files, and offline API reference searchable and organized. It keeps source CHM files in place, provides a library-first workflow, and opens documents in a local-only reader with safer defaults for unknown files.
```

Use the GitHub repository URL as the canonical project link, and use the latest GitHub Release URL only when a directory has a dedicated download field.

## Listing Packet

Use this copy-ready packet for directory forms that ask for canonical links and tags:

```text
Project URL: https://github.com/zhongdiandaoda/chm-reader-light
Download URL: https://github.com/zhongdiandaoda/chm-reader-light/releases
Support URL: https://github.com/zhongdiandaoda/chm-reader-light/blob/main/SUPPORT.md
Suggested tags: chm, offline-documentation, macos, electron, reader
```

You can also generate a submission packet and tracker row from this guide:

```bash
npm run prepare:directory-submission -- --directory "Open Source Mac Apps" --url "https://example.com/submit" --source "\"open source macOS apps\" CHM reader" --baseline-file <snapshot-file>
```

Run `npm run snapshot:growth` first and pass the saved output as `-- --baseline-file <snapshot-file>` when you want the tracker row to include current stars, downloads, watchers, release version, and date.

Use the latest release version and checksum links from the release page when the directory has version, changelog, or verification fields.

Do not submit private CHM screenshots, private document content, sensitive local paths, or compatibility claims that have not been verified with real files.

Ask for a GitHub star only after explaining the offline CHM workflow value and linking to a useful evaluation path such as [Use Cases](./use-cases.md), [Comparison](./comparison.md), or [Adoption Checklist](./adoption-checklist.md).

## Tracking

Record each submission with the directory name, URL, submitted copy, date, release version, and follow-up status. Use the [Directory Submission Tracker](./directory-submission-tracker.md) to keep live listing URLs, stale-copy checks, and follow-up dates in one place.

After a listing goes live, check that the description, tags, screenshot, and download link still match the current repository metadata.
