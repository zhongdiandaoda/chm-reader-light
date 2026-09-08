#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const {
  fetchLatestRelease,
  fetchLatestReleaseHtml,
  formatRemediation: formatReleaseRemediation,
  isGitHubRateLimitError: isReleaseRateLimitError,
  verifyLiveReleaseAssets,
  verifyLiveReleaseHtml,
} = require('./check-live-release');

const {
  buildExpectedListing,
  compareListing,
  fetchRepository,
  fetchRepositoryHtml,
  formatRemediation: formatListingRemediation,
  isGitHubRateLimitError: isListingRateLimitError,
  parseLiveRepositoryHtml,
  parseRepositorySlug,
} = require('./check-live-repository-listing');

const {
  buildLiveSnapshot,
  formatLocalIsoDate,
} = require('./snapshot-growth-metrics');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const listingGuidePath = path.join(rootDir, 'docs', 'repository-listing.md');

function formatSectionList(title, lines) {
  if (lines.length === 0) return [`${title}: none`];
  return [
    `${title}:`,
    ...lines.map((line) => (line.startsWith('  - ') ? line : `- ${line}`)),
  ];
}

function errorMessage(reason) {
  return reason instanceof Error ? reason.message : String(reason);
}

function unavailableAudit(label, reason, repositorySlug, pathname = '') {
  return {
    source: 'unavailable',
    errors: [`${label} audit unavailable: ${errorMessage(reason)}`],
    remediation: [
      'Set GITHUB_TOKEN and rerun npm run snapshot:visibility.',
      `Verify https://github.com/${repositorySlug}${pathname} in a browser.`,
    ],
  };
}

function unavailableGrowth(reason, repositorySlug) {
  return {
    source: 'unavailable',
    errors: [`Growth snapshot unavailable: ${errorMessage(reason)}`],
    stars: 'unavailable',
    releaseDownloads: 'unavailable',
    watchers: 'unavailable',
    releaseVersion: 'unavailable',
    listingUrl: `https://github.com/${repositorySlug}`,
    releaseUrl: `https://github.com/${repositorySlug}/releases/latest`,
  };
}

async function settleVisibilityAudits({
  date,
  repositorySlug,
  listingPromise,
  releasePromise,
  growthPromise,
}) {
  const [listingResult, releaseResult, growthResult] = await Promise.allSettled([
    listingPromise,
    releasePromise,
    growthPromise,
  ]);

  return {
    date,
    repositorySlug,
    listing: listingResult.status === 'fulfilled'
      ? listingResult.value
      : unavailableAudit('Listing', listingResult.reason, repositorySlug),
    release: releaseResult.status === 'fulfilled'
      ? releaseResult.value
      : unavailableAudit('Release', releaseResult.reason, repositorySlug, '/releases/latest'),
    growth: growthResult.status === 'fulfilled'
      ? growthResult.value
      : unavailableGrowth(growthResult.reason, repositorySlug),
  };
}

function formatVisibilityReadinessSnapshot(report) {
  const growthErrors = report.growth.errors || [];
  const status = report.listing.errors.length === 0
    && report.release.errors.length === 0
    && growthErrors.length === 0
    ? 'ready'
    : 'blocked';
  const nextActions = [];

  if (report.listing.errors.length > 0) {
    nextActions.push('Fix live repository listing blockers, then rerun npm run check:remote-listing.');
  }
  if (report.release.errors.length > 0) {
    nextActions.push(report.release.source === 'unavailable'
      ? 'Restore access to GitHub release state before publishing, then rerun npm run snapshot:visibility.'
      : 'Publish or repair the latest public GitHub Release, then rerun npm run check:remote-release.');
  }
  if (growthErrors.length > 0) {
    nextActions.push('Restore access to GitHub metrics, then rerun npm run snapshot:visibility.');
  }
  if (nextActions.length === 0) {
    nextActions.push('Open a Visibility push issue, paste this snapshot, and schedule the seven-day follow-up.');
  } else {
    nextActions.push('Rerun npm run snapshot:visibility before opening a visibility-push issue.');
  }

  return [
    'Visibility readiness snapshot',
    `Date: ${report.date}`,
    `Repository: ${report.repositorySlug}`,
    `Status: ${status}`,
    '',
    `Listing audit: ${report.listing.errors.length === 0 ? 'passed' : 'failed'} (${report.listing.source})`,
    ...formatSectionList('Listing blockers', report.listing.errors),
    ...formatSectionList('Listing remediation', report.listing.remediation),
    '',
    `Release audit: ${report.release.errors.length === 0 ? 'passed' : 'failed'} (${report.release.source})`,
    ...formatSectionList('Release blockers', report.release.errors),
    ...formatSectionList('Release remediation', report.release.remediation),
    '',
    `Growth audit: ${growthErrors.length === 0 ? 'passed' : 'failed'} (${report.growth.source})`,
    ...formatSectionList('Growth blockers', growthErrors),
    '',
    'Growth baseline:',
    `- Source: ${report.growth.source}`,
    `- Stars: ${report.growth.stars}`,
    `- Downloads: ${report.growth.releaseDownloads}`,
    `- Watchers: ${report.growth.watchers}`,
    `- Release: ${report.growth.releaseVersion}`,
    `- Tracker baseline: ${report.growth.stars} stars / ${report.growth.releaseDownloads} downloads / ${report.growth.watchers} watchers`,
    '',
    ...formatSectionList('Next actions', nextActions),
  ].join('\n');
}

async function buildListingAudit(repositorySlug, expected) {
  try {
    const repository = await fetchRepository(repositorySlug);
    const errors = compareListing(expected, repository);

    return {
      source: 'GitHub API',
      errors,
      remediation: formatListingRemediation(repositorySlug, expected, repository),
    };
  } catch (error) {
    if (!isListingRateLimitError(error)) throw error;

    const html = await fetchRepositoryHtml(repositorySlug);
    const repository = parseLiveRepositoryHtml(html);
    const errors = compareListing(expected, repository);

    return {
      source: 'GitHub HTML fallback',
      errors,
      remediation: formatListingRemediation(repositorySlug, expected, repository),
    };
  }
}

async function buildReleaseAudit() {
  try {
    const release = await fetchLatestRelease();
    const errors = verifyLiveReleaseAssets(release);

    return {
      source: 'GitHub API',
      errors,
      remediation: errors.length > 0 ? formatReleaseRemediation() : [],
    };
  } catch (error) {
    if (error.message.includes('GitHub API request failed with 404')) {
      return {
        source: 'GitHub API',
        errors: [
          'No latest public GitHub Release was found for zhongdiandaoda/chm-reader-light.',
          'Publish a non-draft, non-prerelease GitHub Release with both macOS zips and checksum files before announcing download links.',
        ],
        remediation: formatReleaseRemediation(),
      };
    }
    if (!isReleaseRateLimitError(error)) throw error;

    const html = await fetchLatestReleaseHtml();
    const errors = verifyLiveReleaseHtml(html);

    return {
      source: 'GitHub HTML fallback',
      errors,
      remediation: errors.length > 0 ? formatReleaseRemediation() : [],
    };
  }
}

async function buildVisibilityReadinessSnapshot(repositorySlug, date = formatLocalIsoDate(new Date())) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const listingGuide = fs.readFileSync(listingGuidePath, 'utf-8');
  const expected = buildExpectedListing(packageJson, listingGuide);
  return settleVisibilityAudits({
    date,
    repositorySlug,
    listingPromise: buildListingAudit(repositorySlug, expected),
    releasePromise: buildReleaseAudit(),
    growthPromise: buildLiveSnapshot(repositorySlug, date),
  });
}

async function main() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const repositorySlug = parseRepositorySlug(packageJson);

  if (!repositorySlug) {
    console.error('Visibility readiness snapshot failed:');
    console.error('- Could not parse a GitHub repository slug from package.json.');
    process.exitCode = 1;
    return;
  }

  try {
    const report = await buildVisibilityReadinessSnapshot(repositorySlug);
    console.log(formatVisibilityReadinessSnapshot(report));
  } catch (error) {
    console.error('Visibility readiness snapshot failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildListingAudit,
  buildReleaseAudit,
  buildVisibilityReadinessSnapshot,
  formatVisibilityReadinessSnapshot,
  settleVisibilityAudits,
};
