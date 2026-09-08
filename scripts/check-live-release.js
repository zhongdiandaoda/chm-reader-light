#!/usr/bin/env node

const https = require('node:https');
const path = require('node:path');
const { captureAssetSnapshot, resolveRemoteTagCommit } = require('./publish-release');

// Audits the latest public GitHub Release for required macOS artifacts.
const REPOSITORY_SLUG = 'zhongdiandaoda/chm-reader-light';
const EXPECTED_LIVE_RELEASE_ASSETS = [
  'CHMReaderLight-mac-arm64.zip',
  'CHMReaderLight-mac-arm64.zip.sha256',
];
const EXPECTED_LIVE_RELEASE_ASSET_SET = new Set(EXPECTED_LIVE_RELEASE_ASSETS);
const LATEST_RELEASE_URL = `https://github.com/${REPOSITORY_SLUG}/releases/latest`;
const RELEASE_TAG_PATTERN = /^v[0-9]+\.[0-9]+\.[0-9]+$/;

function parseArgs(argv) {
  const options = { tag: undefined, targetCommitish: undefined, releaseDir: undefined };

  for (let index = 2; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--tag') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--tag requires a value.');
      options.tag = value;
      index += 1;
      continue;
    }

    if (argument.startsWith('--tag=')) {
      const value = argument.slice('--tag='.length);
      if (!value) throw new Error('--tag requires a value.');
      options.tag = value;
      continue;
    }

    if (argument === '--target-commitish') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('--target-commitish requires a value.');
      }
      options.targetCommitish = value;
      index += 1;
      continue;
    }

    if (argument.startsWith('--target-commitish=')) {
      const value = argument.slice('--target-commitish='.length);
      if (!value) throw new Error('--target-commitish requires a value.');
      options.targetCommitish = value;
      continue;
    }

    if (argument === '--release-dir') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--release-dir requires a value.');
      options.releaseDir = value;
      index += 1;
      continue;
    }

    if (argument.startsWith('--release-dir=')) {
      const value = argument.slice('--release-dir='.length);
      if (!value) throw new Error('--release-dir requires a value.');
      options.releaseDir = value;
      continue;
    }

    throw new Error(`Unknown option: ${argument}`);
  }

  if (options.tag && !RELEASE_TAG_PATTERN.test(options.tag)) {
    throw new Error(`Release tag must match vMAJOR.MINOR.PATCH; received: ${options.tag}`);
  }
  if (options.targetCommitish && !/^[a-f0-9]{40}$/i.test(options.targetCommitish)) {
    throw new Error('--target-commitish must be a full 40-character commit SHA.');
  }
  if (options.targetCommitish && !options.tag) {
    throw new Error('--target-commitish requires --tag so the remote Git ref can be verified.');
  }
  if (options.releaseDir && !options.tag) {
    throw new Error('--release-dir requires --tag so exact release assets can be verified.');
  }

  return options;
}

function snapshotExpectedLiveReleaseAssets(releaseDir) {
  return Object.fromEntries(EXPECTED_LIVE_RELEASE_ASSETS.map((name) => {
    const snapshot = captureAssetSnapshot(path.resolve(releaseDir, name));
    return [name, { size: snapshot.size, sha256: snapshot.sha256 }];
  }));
}

function releaseApiUrl(tag) {
  if (!tag) return `https://api.github.com/repos/${REPOSITORY_SLUG}/releases/latest`;
  return `https://api.github.com/repos/${REPOSITORY_SLUG}/releases/tags/${encodeURIComponent(tag)}`;
}

function releaseHtmlUrl(tag) {
  if (!tag) return LATEST_RELEASE_URL;
  return `https://github.com/${REPOSITORY_SLUG}/releases/tag/${encodeURIComponent(tag)}`;
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'chm-reader-light-live-release-check',
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
          const error = new Error(`GitHub API request failed with ${response.statusCode}: ${body}`);
          error.statusCode = response.statusCode;
          reject(error);
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
      'User-Agent': 'chm-reader-light-live-release-check',
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

async function fetchLatestRelease(tag) {
  return requestJson(releaseApiUrl(tag));
}

async function fetchLatestReleaseHtml(tag) {
  return requestText(releaseHtmlUrl(tag));
}

function isMacReleaseAsset(assetName) {
  return /^CHMReaderLight-mac-.+\.zip(?:\.sha256)?$/.test(assetName);
}

function verifyLiveReleaseAssets(release, options = {}) {
  const errors = [];
  const { expectedTag, requirePublishedMetadata = false, expectedAssetSnapshots } = options;
  const assetNames = new Set((release.assets || []).map((asset) => asset.name));

  if (expectedTag && release.tag_name !== expectedTag) {
    errors.push(`Release tag mismatch: expected ${expectedTag}, found ${release.tag_name || '(unknown tag)'}.`);
  }
  if (requirePublishedMetadata && release.draft) {
    errors.push(`Release ${release.tag_name || expectedTag || '(unknown tag)'} is still a draft.`);
  }
  if (requirePublishedMetadata && release.prerelease) {
    errors.push(`Release ${release.tag_name || expectedTag || '(unknown tag)'} is marked as a prerelease.`);
  }

  for (const expectedAsset of EXPECTED_LIVE_RELEASE_ASSETS) {
    if (!assetNames.has(expectedAsset)) {
      errors.push(`Missing latest release asset: ${expectedAsset}`);
    }
  }

  for (const assetName of assetNames) {
    if (isMacReleaseAsset(assetName) && !EXPECTED_LIVE_RELEASE_ASSET_SET.has(assetName)) {
      errors.push(`Unexpected latest release macOS asset: ${assetName}`);
    }
  }

  if (requirePublishedMetadata) {
    for (const asset of release.assets || []) {
      if (!EXPECTED_LIVE_RELEASE_ASSET_SET.has(asset.name)) continue;
      if (asset.size <= 0) errors.push(`Release asset is empty: ${asset.name}`);
      if (asset.state !== 'uploaded') {
        errors.push(`Release asset is not uploaded: ${asset.name} (state: ${asset.state || 'unknown'})`);
      }
    }
  }

  if (expectedAssetSnapshots) {
    for (const asset of release.assets || []) {
      const expected = expectedAssetSnapshots[asset.name];
      if (!expected) continue;
      if (asset.size !== expected.size) {
        errors.push(
          `Release asset size mismatch for ${asset.name}: expected ${expected.size} bytes, found ${asset.size ?? 'unknown'}.`,
        );
      }
      const expectedDigest = `sha256:${expected.sha256}`;
      if (asset.digest?.toLowerCase() !== expectedDigest.toLowerCase()) {
        errors.push(
          `Release asset digest mismatch for ${asset.name}: expected ${expectedDigest}, found ${asset.digest || 'no digest'}.`,
        );
      }
    }
  }

  return errors;
}

function verifyLiveReleaseTagCommit(tag, actualCommit, expectedCommit) {
  if (actualCommit?.toLowerCase() === expectedCommit.toLowerCase()) return [];
  return [
    `Release tag ${tag} resolves to ${actualCommit || 'no commit'}, not build commit ${expectedCommit}.`,
  ];
}

function parseLiveReleaseHtml(html, url = LATEST_RELEASE_URL) {
  const assetNames = new Set(html.match(/CHMReaderLight-mac-[A-Za-z0-9._-]+\.zip(?:\.sha256)?/g) || []);

  return {
    tag_name: 'HTML fallback',
    html_url: url,
    assets: [...assetNames].map((name) => ({ name })),
  };
}

function verifyLiveReleaseHtml(html, url = LATEST_RELEASE_URL) {
  if (/There aren(?:'|’|&#39;|&rsquo;)t any releases here/i.test(html)) {
    return [`No latest public GitHub Release was found for ${REPOSITORY_SLUG}.`];
  }

  return verifyLiveReleaseAssets(parseLiveReleaseHtml(html, url));
}

function isGitHubRateLimitError(error) {
  return error.message.includes('GitHub API request failed with 403') && error.message.includes('rate limit');
}

function canUseHtmlFallback(targetCommitish, releaseDir) {
  return !targetCommitish && !releaseDir;
}

function formatRemediation() {
  const lines = [
    'npm run package:mac:arm64',
    'npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>',
    'npm run check:release-artifacts -- <release-dir>',
    'npm run publish:release -- --release-dir <release-dir>',
    'GITHUB_TOKEN=repo_contents_token npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm',
    'Create or update a non-draft GitHub Release with:',
  ];

  for (const assetName of EXPECTED_LIVE_RELEASE_ASSETS) {
    lines.push(`  - ${assetName}`);
  }

  lines.push('Run npm run check:remote-release again before sharing download links.');
  return lines;
}

function printRemediation() {
  console.error('Suggested remediation:');
  for (const line of formatRemediation()) {
    if (line.startsWith('  - ')) {
      console.error(line);
    } else {
      console.error(`- ${line}`);
    }
  }
}

function printRateLimitRemediation() {
  console.error('Suggested remediation:');
  console.error('- Set GITHUB_TOKEN before rerunning this live audit.');
  console.error('- npm run check:remote-release');
  console.error(`- If API access is still unavailable, verify https://github.com/${REPOSITORY_SLUG}/releases/latest in a browser.`);
}

async function main(argv = process.argv) {
  let tag;
  let targetCommitish;
  let releaseDir;

  try {
    ({ tag, targetCommitish, releaseDir } = parseArgs(argv));
    const expectedAssetSnapshots = releaseDir
      ? snapshotExpectedLiveReleaseAssets(releaseDir)
      : undefined;
    const release = await fetchLatestRelease(tag);
    const errors = verifyLiveReleaseAssets(release, {
      expectedTag: tag,
      requirePublishedMetadata: Boolean(tag),
      expectedAssetSnapshots,
    });
    if (targetCommitish) {
      const tagCommit = await resolveRemoteTagCommit(REPOSITORY_SLUG, tag, requestJson);
      errors.push(...verifyLiveReleaseTagCommit(tag, tagCommit, targetCommitish));
    }

    if (errors.length > 0) {
      console.error('Live release asset check failed:');
      console.error(`- Latest release: ${release.tag_name || '(unknown tag)'} ${release.html_url || ''}`.trim());
      for (const error of errors) {
        console.error(`- ${error}`);
      }
      printRemediation();
      console.error('Update the GitHub Release assets or docs/release.md before announcing the release.');
      process.exitCode = 1;
      return;
    }

    console.log(`Live release asset check passed for ${release.tag_name || 'latest release'}.`);
  } catch (error) {
    console.error('Live release asset check failed:');
    if (error.message.includes('GitHub API request failed with 404')) {
      console.error('- No latest public GitHub Release was found for zhongdiandaoda/chm-reader-light.');
      console.error('- Publish a non-draft, non-prerelease GitHub Release with the Apple Silicon zip and checksum before announcing download links.');
      printRemediation();
      process.exitCode = 1;
      return;
    }
    if (isGitHubRateLimitError(error)) {
      console.error(`- ${error.message}`);
      if (!canUseHtmlFallback(targetCommitish, releaseDir)) {
        console.error('- Exact Git tag provenance and release asset digests cannot be verified from the public HTML fallback.');
        printRateLimitRemediation();
        process.exitCode = 1;
        return;
      }
      try {
        const htmlUrl = releaseHtmlUrl(tag);
        const html = await fetchLatestReleaseHtml(tag);
        const fallbackErrors = verifyLiveReleaseHtml(html, htmlUrl);
        if (fallbackErrors.length === 0) {
          console.log('Live release HTML fallback check passed after GitHub API rate limit.');
          return;
        }

        console.error('- HTML fallback check also found release blockers:');
        for (const fallbackError of fallbackErrors) {
          console.error(`  - ${fallbackError}`);
        }
        printRemediation();
      } catch (fallbackError) {
        console.error(`- HTML fallback check failed: ${fallbackError.message}`);
        printRateLimitRemediation();
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
  EXPECTED_LIVE_RELEASE_ASSETS,
  canUseHtmlFallback,
  fetchLatestRelease,
  fetchLatestReleaseHtml,
  formatRemediation,
  isGitHubRateLimitError,
  parseArgs,
  parseLiveReleaseHtml,
  printRemediation,
  printRateLimitRemediation,
  releaseApiUrl,
  releaseHtmlUrl,
  snapshotExpectedLiveReleaseAssets,
  verifyLiveReleaseHtml,
  verifyLiveReleaseAssets,
  verifyLiveReleaseTagCommit,
};
