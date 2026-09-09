# Growth Readiness

Use this guide when preparing a CHMReaderLight visibility push, release announcement, directory submission batch, or community update. It turns the current remote blockers into a short sequence so promotion happens only after the project is easy to evaluate, download, star, watch, and share.

## Current Remote Blockers

- The live GitHub repository baseline is 0 stars, so every promotion pass should record the starting `stargazers_count`, release downloads, watchers, and date before sharing.
- The live repository About panel still needs the expected description, website, topics, and Discussions settings from the Repository Listing guide.
- There is no public latest GitHub Release yet, so direct download links should not be promoted until the Apple Silicon zip and matching checksum are visible.
- The release-feedback Discussion path depends on Discussions being enabled before it can collect trust, download, screenshot, demo, or support blockers.

## Promotion Sequence

1. Apply the Repository Listing guide in GitHub settings, including description, website, topics, social preview, pinned community items, and Discussions. Use `npm run apply:repository-listing` for a safe dry run, then `GITHUB_TOKEN=repo_administration_token npm run apply:repository-listing -- --confirm` when a maintainer token is available.
2. Run `npm run check:remote-listing` and fix any live description, website, topics, or Discussions mismatch before announcing the repository.
3. Publish a non-draft GitHub Release using the Release Checklist and Release Page Template. If publishing from downloaded GitHub Actions artifacts, first run `npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to preview a flat `dist/release` directory, then add `--confirm` before running `npm run publish:release -- --release-dir <release-dir>` for a dry run and `GITHUB_TOKEN=repo_contents_token npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm` to publish.
4. Run `npm run check:remote-release` and confirm the latest public release exposes `CHMReaderLight-mac-arm64.zip` and its `.zip.sha256` file.
5. Run `npm run snapshot:growth` and record the baseline `stargazers_count`, watchers, release downloads, release version, and current date in the visibility issue before posting externally.
6. Run `npm run snapshot:visibility` so listing blockers, release blockers, baseline metrics, and next actions are captured in one report.
7. Run `npm run prepare:visibility-issue` to generate the issue draft; pass `-- --snapshot-file <snapshot-file>` when reusing a saved snapshot.
8. Run `npm run prepare:share-post -- --channel <channel> --audience <audience> --baseline-file <snapshot-file>` before posting.
9. Share the real README screenshot or social preview only after the release and listing audits pass.
10. Recheck stars, downloads, watchers, and feedback after seven days and add the dated result to the visibility issue.

## Evidence to Record

- Use `npm run snapshot:growth` to record baseline stars, downloads, watchers, and live listing URLs before each directory or community submission, including the latest release state when available.
- Use `npm run snapshot:visibility` to paste one readiness report into the visibility-push issue, including live audit blockers, remediation commands, baseline metrics, and the next follow-up action.
- Use `npm run prepare:visibility-issue` to turn the latest visibility snapshot into the issue-form fields, a GitHub new-issue URL, and a copyable fallback body.
- Use `npm run prepare:share-post` to turn the Share Kit and current growth baseline into channel-specific release or social copy.
- Follow-up stars, downloads, support issues, Discussions, and showcase stories after the listing has been live long enough to measure.
- Any failed remote audit output from `npm run check:remote-listing` or `npm run check:remote-release`, plus the owner and next action for the blocker.
- Release-feedback Discussion themes that would make future releases easier to trust, download, star, watch, or share.

## Ready to Promote

Treat a visibility push as ready only when the local `npm run check` gate passes, both live remote audits pass, the latest release is downloadable, the GitHub About panel is complete, and the visibility issue contains baseline metrics.
