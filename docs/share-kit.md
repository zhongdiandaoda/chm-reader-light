# Share Kit

Use this kit when announcing a release, posting a short project update, or sharing CHMReaderLight with macOS users who need an offline CHM reader. Keep the copy factual and link back to GitHub Releases, the README, or the current release page.

## Short Description

A lightweight offline CHM reader and library for macOS.

## Longer Project Copy

CHMReaderLight is a macOS CHM reader with a library-first workflow for local manuals, SDK docs, and archived reference material. Add one or more `.chm` files, group and search them in the library, then open a local-only reader with a searchable table of contents, body search, reading history, zoom, text encoding controls, and safer defaults for unknown documents.

The app keeps source CHM files where you selected them. It does not upload, sync, or host document content, which makes it useful for private manuals and offline documentation collections.

## Release Announcement Template

```text
CHMReaderLight <version> is available now.

Highlights:
- <user-facing feature or fix>
- <compatibility, search, library, security, or packaging improvement>
- <known limitation or upgrade note, if relevant>

Download:
- Apple Silicon: CHMReaderLight-mac-arm64.zip
- Intel: CHMReaderLight-mac-x64.zip

Get it from GitHub Releases:
https://github.com/zhongdiandaoda/chm-reader-light/releases
```

## Social Post Template

```text
CHMReaderLight helps macOS users keep offline CHM manuals searchable and organized.

Library-first workflow, searchable table of contents, body search, reader preferences, and local-only document handling.

GitHub repository:
https://github.com/zhongdiandaoda/chm-reader-light

Try it from GitHub Releases:
https://github.com/zhongdiandaoda/chm-reader-light/releases

If it solves your offline CHM workflow, a GitHub star helps other users find it.
```

Users can copy a bilingual version of this text directly from **Help > Copy Share Text** inside the app. The copied text includes both English and Chinese copy, direct latest download links, a release watch link, release feedback routing, a GitHub star link, and a showcase issue link, plus links to the Chinese getting started guide and Chinese share kit for local audiences.

You can also generate a channel-specific draft from this kit:

```bash
npm run prepare:share-post -- --channel "MacAdmins Slack" --audience "macOS developers with archived SDK docs" --baseline-file <snapshot-file>
```

Run `npm run snapshot:growth` first and pass the saved output as `-- --baseline-file <snapshot-file>` when the draft should include current stars, downloads, watchers, release version, and date. Use `-- --variant release` for a release announcement draft.

## Where to Share

Choose a small number of relevant channels where people already discuss macOS utilities, offline documentation, SDK reference workflows, or developer tools:

- GitHub Release page: publish clear release notes first, then link directly to the release when sharing download artifacts.
- README or Share Kit link: use this when the audience needs to inspect screenshots, privacy notes, install steps, or source code before trying the app.
- macOS developer or documentation communities: share only where offline CHM manuals, legacy SDK docs, or local documentation libraries are on topic.
- Curated app directories or developer-tool lists: use the repository description, current screenshot, and verified Release links.
- Existing user conversations: use the showcase issue template when someone shares a public-safe workflow.

Do not cross-post the same message repeatedly. Prefer one tailored note per channel, answer follow-up questions, and update the copy when a real user story or compatibility report teaches something new.

## After Sharing

- Route trust, download, checksum, notarization, screenshot, demo, or support hesitation to the [release-feedback Discussion](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback) so maintainers can improve the next release page before asking for more stars.
- Invite successful users to the showcase issue template only after they confirm the story is safe to quote publicly.
- Record live listing URLs, baseline stars or downloads, and follow-up metrics in the visibility issue.
- After the follow-up window, refresh `npm run snapshot:growth` and add the dated metrics to the visibility issue.

## Promotion Checklist

- Publish the GitHub Release before posting download links so every shared URL points to available artifacts.
- Start the GitHub Release body from the [Release Page Template](./release-template.md) so download choices, checksum verification, first-launch expectations, and trust links are visible before promotion.
- Attach the Demo Guide recording or README preview image when the channel supports visuals.
- Ask for a GitHub star only after explaining the offline CHM workflow value.
- Update the repository social preview and About panel before a larger announcement.
- Watch new issues and compatibility reports for the first few days after sharing.

## Assets and Demo

- Use the real README screenshot or a short public-safe library-to-reader recording.
- Use the [social preview artwork](./assets/social-preview.svg) as the source image for GitHub repository sharing.
- Use the [upload-ready social preview PNG](./assets/social-preview.png) when updating GitHub repository settings.
- Use the README preview image when you need to show the actual app workflow inside GitHub Markdown.

## Tone

- Lead with the practical problem: offline CHM manuals on macOS.
- Mention local-only document handling when sharing with privacy-sensitive users.
- Avoid claiming broad compatibility without a real CHM sample or issue report.
- Point people to [Compatibility Notes](./compatibility.md), [Privacy and Local Data](./privacy.md), and [Troubleshooting](./troubleshooting.md) when they need more detail.
