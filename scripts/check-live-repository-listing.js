#!/usr/bin/env node

const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

// Audits live GitHub repository listing settings against docs/repository-listing.md.
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const listingGuidePath = path.join(rootDir, 'docs', 'repository-listing.md');

function extractSection(markdown, heading) {
  const lines = markdown.split('\n');
  const headingLine = `## ${heading}`;
  const startIndex = lines.findIndex((line) => line.trim() === headingLine);
  if (startIndex === -1) return '';

  const sectionLines = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith('## ')) break;
    sectionLines.push(lines[index]);
  }

  return sectionLines.join('\n').trim();
}

function extractTextCodeBlock(section) {
  const match = section.match(/```(?:text)?\n([\s\S]*?)\n```/);
  return match ? match[1].trim() : '';
}

function parseSuggestedTopics(markdown) {
  const topics = new Set();
  const section = extractSection(markdown, 'Suggested Topics');
  const topicPattern = /^- `([^`]+)`$/gm;
  let match;

  while ((match = topicPattern.exec(section)) !== null) {
    topics.add(match[1]);
  }

  return topics;
}

function parseRepositorySlug(packageJson) {
  const repositoryUrl = packageJson.repository && packageJson.repository.url;
  const source = repositoryUrl || packageJson.homepage || '';
  const match = source.match(/github\.com[:/]([^/#]+\/[^/#.]+)(?:\.git)?/);
  return match ? match[1] : '';
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'chm-reader-light-repository-listing-check',
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
      'User-Agent': 'chm-reader-light-repository-listing-check',
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

async function fetchRepository(repositorySlug) {
  return requestJson(`https://api.github.com/repos/${repositorySlug}`);
}

async function fetchRepositoryHtml(repositorySlug) {
  return requestText(`https://github.com/${repositorySlug}`);
}

function compareListing(expected, repository) {
  const errors = [];

  if (repository.description === undefined) {
    errors.push('description could not be verified from the live repository response.');
  } else if (repository.description !== expected.description) {
    errors.push(`description expected "${expected.description}", found "${repository.description || ''}".`);
  }

  if (repository.homepage === undefined) {
    errors.push('homepage could not be verified from the live repository response.');
  } else if (repository.homepage !== expected.homepage) {
    errors.push(`homepage expected "${expected.homepage}", found "${repository.homepage || ''}".`);
  }

  const liveTopics = new Set(repository.topics || []);
  const missingTopics = [...expected.topics].filter((topic) => !liveTopics.has(topic)).sort();
  if (missingTopics.length > 0) {
    errors.push(`topics missing from live repository: ${missingTopics.join(', ')}.`);
  }

  if (repository.has_discussions === undefined) {
    errors.push('has_discussions could not be verified from the live repository response.');
  } else if (repository.has_discussions !== true) {
    errors.push('has_discussions expected true, found false.');
  }

  return errors;
}

function buildExpectedListing(packageJson, listingGuide) {
  return {
    description: extractTextCodeBlock(extractSection(listingGuide, 'Description')),
    homepage: extractTextCodeBlock(extractSection(listingGuide, 'Website')),
    topics: parseSuggestedTopics(listingGuide),
  };
}

function parseEmbeddedJsonBlocks(html) {
  const blocks = [];
  const scriptPattern = /<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;

  while ((match = scriptPattern.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch (_error) {
      // Ignore unrelated GitHub script tags that are not strict JSON payloads.
    }
  }

  return blocks;
}

function findSidebarAbout(payload) {
  if (!payload || typeof payload !== 'object') return undefined;
  if (payload.sidebarAbout) return payload.sidebarAbout;

  for (const value of Object.values(payload)) {
    if (value && typeof value === 'object') {
      const sidebarAbout = findSidebarAbout(value);
      if (sidebarAbout) return sidebarAbout;
    }
  }

  return undefined;
}

function parseLiveRepositoryHtml(html) {
  const sidebarAbout = parseEmbeddedJsonBlocks(html)
    .map((block) => findSidebarAbout(block))
    .find(Boolean);

  if (!sidebarAbout) {
    throw new Error('Could not find GitHub sidebar metadata in repository HTML.');
  }

  const discussionsThread = sidebarAbout.watch?.watchData?.subscribableThreadTypes
    ?.find((threadType) => threadType.name === 'Discussion');
  const isMissingAbout = html.includes('No description, website, or topics provided.');

  return {
    description: isMissingAbout ? '' : undefined,
    homepage: isMissingAbout ? '' : undefined,
    has_discussions: discussionsThread ? discussionsThread.enabled === true : undefined,
    stargazerCount: sidebarAbout.stargazerCount,
    topics: sidebarAbout.topics || [],
    watcherCount: sidebarAbout.watcherCount,
  };
}

function isGitHubRateLimitError(error) {
  return /GitHub API(?: [A-Z]+)? request failed with 403/.test(error.message) && error.message.includes('rate limit');
}

function formatRemediation(repositorySlug, expected, repository) {
  const lines = [];

  if (repository.description !== undefined && repository.description !== expected.description) {
    lines.push(`gh repo edit ${repositorySlug} --description "${expected.description}"`);
  }

  if (repository.homepage !== undefined && repository.homepage !== expected.homepage) {
    lines.push(`gh repo edit ${repositorySlug} --homepage "${expected.homepage}"`);
  }

  const liveTopics = new Set(repository.topics || []);
  const missingTopics = [...expected.topics].filter((topic) => !liveTopics.has(topic)).sort();
  for (const topic of missingTopics) {
    lines.push(`gh repo edit ${repositorySlug} --add-topic "${topic}"`);
  }

  if (repository.has_discussions !== undefined && repository.has_discussions !== true) {
    lines.push(`Enable Discussions in https://github.com/${repositorySlug}/settings`);
  }

  return lines;
}

function printRemediation(repositorySlug, expected, repository) {
  console.error('Suggested remediation:');
  for (const line of formatRemediation(repositorySlug, expected, repository)) {
    console.error(`- ${line}`);
  }
}

function printRateLimitRemediation(repositorySlug) {
  console.error('Suggested remediation:');
  console.error('- Set GITHUB_TOKEN before rerunning this live audit.');
  console.error('- npm run check:remote-listing');
  console.error(`- If API access is still unavailable, verify https://github.com/${repositorySlug} in a browser.`);
}

async function main() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const listingGuide = fs.readFileSync(listingGuidePath, 'utf-8');
  const repositorySlug = parseRepositorySlug(packageJson);

  if (!repositorySlug) {
    console.error('Live repository listing check failed:');
    console.error('- Could not parse a GitHub repository slug from package.json.');
    process.exitCode = 1;
    return;
  }

  const expected = buildExpectedListing(packageJson, listingGuide);

  try {
    const repository = await fetchRepository(repositorySlug);
    const errors = compareListing(expected, repository);

    if (errors.length > 0) {
      console.error('Live repository listing check failed:');
      for (const error of errors) {
        console.error(`- ${error}`);
      }
      printRemediation(repositorySlug, expected, repository);
      console.error(`Update https://github.com/${repositorySlug}/settings or docs/repository-listing.md so they match.`);
      process.exitCode = 1;
      return;
    }

    console.log('Live repository listing check passed.');
  } catch (error) {
    console.error('Live repository listing check failed:');
    if (isGitHubRateLimitError(error)) {
      console.error(`- ${error.message}`);
      try {
        const html = await fetchRepositoryHtml(repositorySlug);
        const repository = parseLiveRepositoryHtml(html);
        const fallbackErrors = compareListing(expected, repository);
        if (fallbackErrors.length === 0) {
          console.log('Live repository HTML fallback check passed after GitHub API rate limit.');
          return;
        }

        console.error('- HTML fallback check also found repository listing blockers:');
        for (const fallbackError of fallbackErrors) {
          console.error(`  - ${fallbackError}`);
        }
        printRemediation(repositorySlug, expected, repository);
      } catch (fallbackError) {
        console.error(`- HTML fallback check failed: ${fallbackError.message}`);
        printRateLimitRemediation(repositorySlug);
      }
      process.exitCode = 1;
      return;
    }
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildExpectedListing,
  compareListing,
  fetchRepository,
  fetchRepositoryHtml,
  formatRemediation,
  isGitHubRateLimitError,
  parseLiveRepositoryHtml,
  parseRepositorySlug,
  parseSuggestedTopics,
  printRateLimitRemediation,
  printRemediation,
};
