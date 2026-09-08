# Community Standards Checklist

Use this checklist before releases, visibility pushes, or community-maintenance passes to keep GitHub trust signals aligned with the real repository. It complements the Maintainer Playbook and Repository Listing guide by focusing on files and settings that visitors see in GitHub's community and security surfaces.

## Required Repository Files

- [README.md](../README.md) explains the app, download path, trust notes, support entry points, and contributor links from the repository first screen.
- [LICENSE](../LICENSE) keeps the MIT license visible to GitHub, package reviewers, and company adopters.
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) sets participation expectations for issues, pull requests, Discussions, and showcase stories.
- [CODE_OF_CONDUCT.zh-CN.md](../CODE_OF_CONDUCT.zh-CN.md) gives Chinese-speaking users and contributors the same participation, privacy, and escalation expectations.
- [CONTRIBUTING.md](../CONTRIBUTING.md) gives contributors setup, quality gates, starter issue links, and pull request expectations.
- [CONTRIBUTING.zh-CN.md](../CONTRIBUTING.zh-CN.md) gives Chinese-speaking contributors the same setup, scope, privacy, and verification expectations from the Chinese README path.
- [SECURITY.md](../SECURITY.md) routes vulnerability reports privately and sets response expectations.
- [SECURITY.zh-CN.md](../SECURITY.zh-CN.md) gives Chinese-speaking reporters the same private vulnerability reporting route and response expectations.
- [SUPPORT.md](../SUPPORT.md) routes usage questions, install help, bug reports, compatibility reports, feature requests, accessibility feedback, showcase stories, and security reports.
- [SUPPORT.zh-CN.md](../SUPPORT.zh-CN.md) gives Chinese-speaking users the same troubleshooting, issue, discussion, showcase, and security-routing paths.
- [Governance Guide](./governance.md) explains maintainer responsibilities, decision paths, discussion-first changes, privacy boundaries, and review expectations.
- [Chinese Governance Guide](./governance.zh-CN.md) gives Chinese-speaking contributors the same decision paths, discussion-first expectations, privacy boundaries, and review expectations.
- [CITATION.cff](../CITATION.cff) means GitHub can expose citation metadata for external references, technical writeups, and documentation-tool listings.

## Interaction Paths

- `.github/labels.yml` should define the labels used by issue templates, triage guidance, Dependabot pull requests, and generated release-note sections.
- `.github/ISSUE_TEMPLATE/config.yml` should keep blank issues disabled and route visitors to structured issue templates, GitHub Discussions, releases, project status, and private security reporting.
- `.github/ISSUE_TEMPLATE/good_first_task.yml` should keep starter issues concrete enough for outside contributors, with workflow value, likely files, smallest acceptable change, and verification guidance.
- `.github/ISSUE_TEMPLATE/visibility_push.yml` should keep maintainer-owned promotion tasks tied to live audit results, baseline metrics, reusable copy, and follow-up evidence.
- `.github/PULL_REQUEST_TEMPLATE.md` should keep review context, user impact, verification, screenshots, and project-status checks visible before maintainers review code.
- `.github/copilot-instructions.md` should keep AI-assisted contributor suggestions aligned with project scope, privacy expectations, documentation links, and verification gates.
- `.github/DISCUSSION_TEMPLATE/q-a.yml`, `.github/DISCUSSION_TEMPLATE/show-and-tell.yml`, and `.github/DISCUSSION_TEMPLATE/release-feedback.yml` should keep GitHub Discussions useful for questions, safe workflow stories, and release feedback that do not need tracked issues yet.
- Documentation Index should link every published guide in `docs/` so visitors and contributors do not miss support, trust, release, or onboarding pages.
- CODEOWNERS should still route reviews for source, tests, docs, automation, issue templates, Discussion templates, pull request guidance, AI contributor instructions, community trust files, and packaging files to an active maintainer.

## Automation and Trust Signals

- `.github/workflows/ci.yml` should run the default quality gate for pull requests and pushes to `main`.
- `.github/workflows/codeql.yml` should keep TypeScript and JavaScript security scanning active.
- `.github/workflows/dependency-review.yml` should keep Dependency Review active on pull requests that change dependencies.
- `.github/workflows/scorecard.yml` should keep OpenSSF Scorecard visible as a supply-chain posture signal.
- `.github/dependabot.yml` should keep npm and GitHub Actions maintenance updates grouped, labeled, and release-note friendly.
- `package.json` and `docs/repository-listing.md` should keep repository discovery metadata aligned so the GitHub About panel, topics, and npm keywords describe the same app.
- README badges should continue to show CI, CodeQL, OpenSSF Scorecard, stars, downloads, license, platform, Node.js, and latest release status near the top of the repository.

## Review Cadence

- Review this checklist before a visibility push, after adding or removing issue templates, and after changing support, security, contribution, release, or discussion routing.
- Confirm new public routing changes are reflected in the Documentation Index, Support Guide, Repository Listing guide, and Maintainer Playbook when relevant.
- Update `CHANGELOG.md` when community standards, support paths, repository metadata, or GitHub trust signals change.
- `npm run check:community` should pass before releases or visibility pushes so required community health files, templates, ownership rules, and trust workflows are still present.
- `npm run check:badges` should pass before releases or visibility pushes so README badges still surface project health, adoption, license, platform, runtime, and release signals.
- `npm run check:llms` should pass before releases or visibility pushes so AI and search tools still see current positioning, trust notes, and key repository links.
- `npm run check:workflows` should pass before releases or visibility pushes so CI, release, security scanning, dependency review, and Scorecard automation keep their expected trust settings.
- `npm run check:templates` should pass before releases or visibility pushes so issue, discussion, and pull request templates still collect safe, actionable reports.
- Run `npm run check:remote-listing` after applying GitHub About, topics, website, or Discussions settings so local guidance and the live repository stay aligned.
- Run `npm run check` for documentation and workflow changes, and run `npm test` when static tests or repository-health contracts change.
