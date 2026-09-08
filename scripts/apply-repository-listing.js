#!/usr/bin/env node

const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const {
  buildExpectedListing,
  compareListing,
  fetchRepositoryHtml,
  isGitHubRateLimitError,
  parseLiveRepositoryHtml,
  parseRepositorySlug,
} = require('./check-live-repository-listing');

// Applies docs/repository-listing.md to GitHub repository settings when explicitly confirmed.
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const listingGuidePath = path.join(rootDir, 'docs', 'repository-listing.md');

function requestJson(url, { method = 'GET', body } = {}) {
  return new Promise((resolve, reject) => {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'chm-reader-light-repository-listing-apply',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const requestBody = body === undefined ? undefined : JSON.stringify(body);
    if (requestBody) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(requestBody);
    }

    const request = https.request(url, { method, headers }, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        responseBody += chunk;
      });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`GitHub API ${method} request failed with ${response.statusCode}: ${responseBody}`));
          return;
        }

        if (!responseBody) {
          resolve(undefined);
          return;
        }

        try {
          resolve(JSON.parse(responseBody));
        } catch (error) {
          reject(new Error(`GitHub API returned invalid JSON: ${error.message}`));
        }
      });
    });

    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy(new Error('GitHub API request timed out after 15 seconds.'));
    });

    if (requestBody) request.write(requestBody);
    request.end();
  });
}

function normalizeTopics(topics) {
  return [...new Set(topics)].sort();
}

function buildRepositoryListingUpdate(expected, repository) {
  const metadataPatch = {};
  const liveTopics = repository.topics || [];
  const missingTopics = [...expected.topics].filter((topic) => !liveTopics.includes(topic)).sort();

  if (repository.description !== undefined && repository.description !== expected.description) {
    metadataPatch.description = expected.description;
  }
  if (repository.homepage !== undefined && repository.homepage !== expected.homepage) {
    metadataPatch.homepage = expected.homepage;
  }
  if (repository.has_discussions !== undefined && repository.has_discussions !== true) {
    metadataPatch.has_discussions = true;
  }

  return {
    metadataPatch,
    missingTopics,
    topics: normalizeTopics([...liveTopics, ...missingTopics]),
  };
}

function hasMetadataPatch(update) {
  return Object.keys(update.metadataPatch).length > 0;
}

function formatRepositoryListingApplyPlan({ repositorySlug, expected, repository, update, confirmed }) {
  const mode = confirmed ? 'apply' : 'dry run';
  const currentErrors = compareListing(expected, repository);
  const lines = [
    'Repository listing apply plan',
    `Repository: ${repositorySlug}`,
    `Mode: ${mode}`,
    `Source: ${repository.source || 'GitHub API'}`,
    '',
  ];

  if (currentErrors.length === 0) {
    lines.push('Live repository listing already matches docs/repository-listing.md.');
    return lines.join('\n');
  }

  lines.push('Current blockers:');
  for (const error of currentErrors) {
    lines.push(`- ${error}`);
  }

  lines.push('', 'Planned API updates:');
  if (hasMetadataPatch(update)) {
    lines.push(`- PATCH /repos/${repositorySlug}`);
    if (update.metadataPatch.description !== undefined) {
      lines.push(`  - description: ${update.metadataPatch.description}`);
    }
    if (update.metadataPatch.homepage !== undefined) {
      lines.push(`  - homepage: ${update.metadataPatch.homepage}`);
    }
    if (update.metadataPatch.has_discussions !== undefined) {
      lines.push('  - has_discussions: true');
    }
  }

  if (update.missingTopics.length > 0) {
    lines.push(`- PUT /repos/${repositorySlug}/topics`);
    lines.push(`  - add topics: ${update.missingTopics.join(', ')}`);
  }

  if (!hasMetadataPatch(update) && update.missingTopics.length === 0) {
    lines.push('- none');
  }

  if (!confirmed) {
    lines.push('', 'Dry run only. Set GITHUB_TOKEN and rerun `npm run apply:repository-listing -- --confirm` to apply these settings.');
  }

  return lines.join('\n');
}

async function fetchRepository(repositorySlug) {
  return requestJson(`https://api.github.com/repos/${repositorySlug}`);
}

async function fetchRepositoryForPlan(repositorySlug, confirmed) {
  try {
    return {
      source: 'GitHub API',
      repository: await fetchRepository(repositorySlug),
    };
  } catch (error) {
    if (confirmed || !isGitHubRateLimitError(error)) throw error;

    return {
      source: 'GitHub HTML fallback',
      repository: parseLiveRepositoryHtml(await fetchRepositoryHtml(repositorySlug)),
    };
  }
}

async function applyRepositoryListing(repositorySlug, update) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is required when using --confirm.');
  }

  if (hasMetadataPatch(update)) {
    await requestJson(`https://api.github.com/repos/${repositorySlug}`, {
      method: 'PATCH',
      body: update.metadataPatch,
    });
  }

  if (update.missingTopics.length > 0) {
    await requestJson(`https://api.github.com/repos/${repositorySlug}/topics`, {
      method: 'PUT',
      body: { names: update.topics },
    });
  }
}

async function main() {
  const confirmed = process.argv.includes('--confirm');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const listingGuide = fs.readFileSync(listingGuidePath, 'utf-8');
  const repositorySlug = parseRepositorySlug(packageJson);

  if (!repositorySlug) {
    console.error('Repository listing apply failed:');
    console.error('- Could not parse a GitHub repository slug from package.json.');
    process.exitCode = 1;
    return;
  }

  try {
    const expected = buildExpectedListing(packageJson, listingGuide);
    const { source, repository } = await fetchRepositoryForPlan(repositorySlug, confirmed);
    repository.source = source;
    const update = buildRepositoryListingUpdate(expected, repository);

    console.log(formatRepositoryListingApplyPlan({
      repositorySlug,
      expected,
      repository,
      update,
      confirmed,
    }));

    if (!confirmed) return;

    await applyRepositoryListing(repositorySlug, update);
    const updatedRepository = await fetchRepository(repositorySlug);
    const errors = compareListing(expected, updatedRepository);

    if (errors.length > 0) {
      console.error('Repository listing apply finished, but live verification still failed:');
      for (const error of errors) {
        console.error(`- ${error}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log('Repository listing apply passed live verification.');
  } catch (error) {
    console.error('Repository listing apply failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildRepositoryListingUpdate,
  fetchRepositoryForPlan,
  formatRepositoryListingApplyPlan,
  normalizeTopics,
};
