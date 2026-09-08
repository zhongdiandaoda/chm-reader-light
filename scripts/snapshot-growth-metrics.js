#!/usr/bin/env node

const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const {
  parseLiveReleaseHtml,
  verifyLiveReleaseHtml,
} = require('./check-live-release');

const {
  parseLiveRepositoryHtml,
  parseRepositorySlug,
} = require('./check-live-repository-listing');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'chm-reader-light-growth-metrics-snapshot',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const request = https.get(url, { headers }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`GitHub API request failed with ${response.statusCode}: ${body}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`GitHub API returned invalid JSON: ${error.message}`));
        }
      });
    });

    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy(new Error('GitHub API request timed out after 15 seconds.'));
    });
  });
}

function requestText(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'chm-reader-light-growth-metrics-snapshot',
    };

    const request = https.get(url, { headers }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        if (redirectCount >= 5) {
          reject(new Error('GitHub HTML request exceeded 5 redirects.'));
          return;
        }
        resolve(requestText(new URL(response.headers.location, url).toString(), redirectCount + 1));
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`GitHub HTML request failed with ${response.statusCode}: ${body}`));
          return;
        }

        resolve(body);
      });
    });

    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy(new Error('GitHub HTML request timed out after 15 seconds.'));
    });
  });
}

function isGitHubRateLimitError(error) {
  return error.message.includes('GitHub API request failed with 403') && error.message.includes('rate limit');
}

function formatLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function todayIsoDate() {
  return formatLocalIsoDate(new Date());
}

function sumReleaseDownloads(release) {
  return (release.assets || []).reduce((total, asset) => total + (asset.download_count || 0), 0);
}

function formatGrowthMetricsSnapshot(snapshot) {
  return [
    'Growth metrics snapshot',
    `Date: ${snapshot.date}`,
    `Repository: ${snapshot.repositorySlug}`,
    `Source: ${snapshot.source}`,
    `Stars: ${snapshot.stars}`,
    `Downloads: ${snapshot.releaseDownloads}`,
    `Watchers: ${snapshot.watchers}`,
    `Release: ${snapshot.releaseVersion}`,
    `Listing URL: ${snapshot.listingUrl}`,
    `Release URL: ${snapshot.releaseUrl}`,
    `Tracker baseline: ${snapshot.stars} stars / ${snapshot.releaseDownloads} downloads / ${snapshot.watchers} watchers`,
  ].join('\n');
}

function buildApiSnapshot({ date, repositorySlug, repository, release }) {
  return {
    date,
    repositorySlug,
    source: 'GitHub API',
    stars: repository.stargazers_count,
    watchers: repository.subscribers_count ?? repository.watchers_count,
    releaseDownloads: release ? sumReleaseDownloads(release) : 0,
    releaseVersion: release ? release.tag_name : 'no public release',
    listingUrl: `https://github.com/${repositorySlug}`,
    releaseUrl: release ? release.html_url : `https://github.com/${repositorySlug}/releases/latest`,
  };
}

function buildHtmlFallbackSnapshot({ date, repositorySlug, repositoryHtml, releaseHtml }) {
  const repository = parseLiveRepositoryHtml(repositoryHtml);
  const releaseErrors = verifyLiveReleaseHtml(releaseHtml);
  const release = releaseErrors.length === 0 ? parseLiveReleaseHtml(releaseHtml) : undefined;

  return {
    date,
    repositorySlug,
    source: 'GitHub HTML fallback',
    stars: repository.stargazerCount,
    watchers: repository.watcherCount,
    releaseDownloads: 'unavailable via HTML fallback',
    releaseVersion: release ? release.tag_name : 'no public release',
    listingUrl: `https://github.com/${repositorySlug}`,
    releaseUrl: release ? release.html_url : `https://github.com/${repositorySlug}/releases/latest`,
  };
}

async function fetchLatestRelease(repositorySlug) {
  try {
    return await requestJson(`https://api.github.com/repos/${repositorySlug}/releases/latest`);
  } catch (error) {
    if (error.message.includes('GitHub API request failed with 404')) return undefined;
    throw error;
  }
}

async function buildLiveSnapshot(repositorySlug, date = todayIsoDate()) {
  try {
    const [repository, release] = await Promise.all([
      requestJson(`https://api.github.com/repos/${repositorySlug}`),
      fetchLatestRelease(repositorySlug),
    ]);

    return buildApiSnapshot({ date, repositorySlug, repository, release });
  } catch (error) {
    if (!isGitHubRateLimitError(error)) throw error;

    const [repositoryHtml, releaseHtml] = await Promise.all([
      requestText(`https://github.com/${repositorySlug}`),
      requestText(`https://github.com/${repositorySlug}/releases/latest`),
    ]);

    return buildHtmlFallbackSnapshot({
      date,
      repositorySlug,
      repositoryHtml,
      releaseHtml,
    });
  }
}

async function main() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const repositorySlug = parseRepositorySlug(packageJson);

  if (!repositorySlug) {
    console.error('Growth metrics snapshot failed:');
    console.error('- Could not parse a GitHub repository slug from package.json.');
    process.exitCode = 1;
    return;
  }

  try {
    const snapshot = await buildLiveSnapshot(repositorySlug);
    console.log(formatGrowthMetricsSnapshot(snapshot));
  } catch (error) {
    console.error('Growth metrics snapshot failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildApiSnapshot,
  buildHtmlFallbackSnapshot,
  buildLiveSnapshot,
  formatLocalIsoDate,
  formatGrowthMetricsSnapshot,
  isGitHubRateLimitError,
};
