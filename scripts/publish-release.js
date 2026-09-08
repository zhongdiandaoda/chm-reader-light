#!/usr/bin/env node

const fs = require('node:fs');
const crypto = require('node:crypto');
const https = require('node:https');
const path = require('node:path');

const {
  EXPECTED_RELEASE_ARTIFACTS,
  verifyReleaseArtifacts,
} = require('./check-release-artifacts');

// Publishes a GitHub Release only when explicitly confirmed; dry run is the default.
const rootDir = path.resolve(__dirname, '..');
const repositoryUrl = 'https://github.com/zhongdiandaoda/chm-reader-light';
const packageJsonPath = path.join(rootDir, 'package.json');
const releaseTemplatePath = path.join(rootDir, 'docs', 'release-template.md');

function calculateOpenFileSha256(fileDescriptor, onChunk) {
  const hash = crypto.createHash('sha256');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  let position = 0;
  for (;;) {
    const bytesRead = fs.readSync(fileDescriptor, buffer, 0, buffer.length, position);
    if (bytesRead === 0) break;
    const chunk = buffer.subarray(0, bytesRead);
    hash.update(chunk);
    if (onChunk) onChunk(chunk);
    position += bytesRead;
  }
  return hash.digest('hex');
}

function captureAssetSnapshot(assetPath, { includeContents = false } = {}) {
  const fileDescriptor = fs.openSync(
    assetPath,
    fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0),
  );
  try {
    const stats = fs.fstatSync(fileDescriptor);
    if (!stats.isFile()) {
      throw new Error(`Release asset is not a regular file: ${assetPath}`);
    }
    const chunks = [];
    const sha256 = calculateOpenFileSha256(
      fileDescriptor,
      includeContents ? (chunk) => chunks.push(Buffer.from(chunk)) : undefined,
    );
    return {
      path: assetPath,
      size: stats.size,
      sha256,
      ...(includeContents ? { contents: Buffer.concat(chunks) } : {}),
    };
  } finally {
    fs.closeSync(fileDescriptor);
  }
}

function verifyAssetSnapshot(snapshot) {
  let current;
  try {
    current = captureAssetSnapshot(snapshot.path);
  } catch (error) {
    throw new Error(`Release asset changed after verification: ${snapshot.path} (${error.message})`);
  }
  if (current.size !== snapshot.size || current.sha256 !== snapshot.sha256) {
    throw new Error(`Release asset changed after verification: ${snapshot.path}`);
  }
}

function parseArgs(argv) {
  const options = {
    confirmed: false,
    releaseDir: 'dist',
    tag: undefined,
    targetCommitish: undefined,
  };

  function readOptionValue(index, flagName) {
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`${flagName} requires a value.`);
    }
    return value;
  }

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--confirm') {
      options.confirmed = true;
    } else if (arg === '--release-dir') {
      options.releaseDir = readOptionValue(index, '--release-dir');
      index += 1;
    } else if (arg.startsWith('--release-dir=')) {
      options.releaseDir = arg.slice('--release-dir='.length);
    } else if (arg === '--tag') {
      options.tag = readOptionValue(index, '--tag');
      index += 1;
    } else if (arg.startsWith('--tag=')) {
      options.tag = arg.slice('--tag='.length);
    } else if (arg === '--target-commitish') {
      options.targetCommitish = readOptionValue(index, '--target-commitish');
      index += 1;
    } else if (arg.startsWith('--target-commitish=')) {
      options.targetCommitish = arg.slice('--target-commitish='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.releaseDir) {
    throw new Error('--release-dir requires a directory path.');
  }
  if (options.tag !== undefined && !options.tag) {
    throw new Error('--tag requires a release tag.');
  }
  if (options.targetCommitish !== undefined && !options.targetCommitish) {
    throw new Error('--target-commitish requires a commit or branch.');
  }

  return options;
}

function extractReleaseBodyTemplate(markdown) {
  const match = markdown.match(/## Copyable Release Body[\s\S]*?(`{3,})markdown\n([\s\S]*?)\n\1/);
  if (!match) {
    throw new Error('Could not find the Copyable Release Body markdown block in docs/release-template.md.');
  }

  return match[2].trim();
}

function validateReleaseTag(tag, packageVersion) {
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
    throw new Error(`Release tag must match vMAJOR.MINOR.PATCH; received: ${tag}`);
  }
  if (tag !== `v${packageVersion}`) {
    throw new Error(`Release tag ${tag} does not match package version v${packageVersion}.`);
  }
}

function buildReleaseBody({ releaseTemplate, tag }) {
  const releaseAssetNames = EXPECTED_RELEASE_ARTIFACTS.flatMap((artifactName) => [
    artifactName,
    `${artifactName}.sha256`,
  ]);
  let releaseBody = releaseTemplate.replaceAll('v<version>', tag);

  for (const assetName of releaseAssetNames) {
    const downloadUrl = `${repositoryUrl}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(assetName)}`;
    releaseBody = releaseBody.replaceAll(`\`${assetName}\``, `[${assetName}](${downloadUrl})`);
  }

  return releaseBody
    .replace(/\]\(\.\/([^)]+)\)/g, `](${repositoryUrl}/blob/${encodeURIComponent(tag)}/docs/$1)`)
    .replace(
      /\n## Performance Notes\n\nList benchmark-backed[^\n]+\n/,
      '\n',
    )
    .replace(
      /\n## Accessibility Notes\n\nList keyboard, VoiceOver[^\n]+\n/,
      '\n',
    )
    .replace(/\n{3,}/g, '\n\n');
}

function buildReleasePublishPlan({
  packageJson,
  releaseDir,
  tag,
  targetCommitish,
  artifactErrors,
  releaseBody,
}) {
  validateReleaseTag(tag, packageJson.version);
  const resolvedReleaseDir = path.resolve(rootDir, releaseDir);
  const assets = EXPECTED_RELEASE_ARTIFACTS.flatMap((artifactName) => [
    path.join(resolvedReleaseDir, artifactName),
    path.join(resolvedReleaseDir, `${artifactName}.sha256`),
  ]);
  const assetSnapshots = [];
  if (artifactErrors.length === 0) {
    for (const artifactName of EXPECTED_RELEASE_ARTIFACTS) {
      const artifactSnapshot = captureAssetSnapshot(path.join(resolvedReleaseDir, artifactName));
      const checksumSnapshotWithContents = captureAssetSnapshot(
        path.join(resolvedReleaseDir, `${artifactName}.sha256`),
        { includeContents: true },
      );
      const checksumContents = checksumSnapshotWithContents.contents.toString('utf8').trim();
      const checksumMatch = checksumContents.match(/^([a-fA-F0-9]{64})\s+\*?(.+)$/);
      if (!checksumMatch
          || checksumMatch[2] !== artifactName
          || checksumMatch[1].toLowerCase() !== artifactSnapshot.sha256) {
        throw new Error(`Release snapshot checksum mismatch for ${artifactName}.`);
      }
      const { contents: _contents, ...checksumSnapshot } = checksumSnapshotWithContents;
      assetSnapshots.push(artifactSnapshot, checksumSnapshot);
    }
  }

  return {
    repositorySlug: packageJson.repository.url.match(/github\.com[:/]([^/#]+\/[^/#.]+)(?:\.git)?/)?.[1] || '',
    tag,
    targetCommitish,
    releaseName: `CHMReaderLight ${tag}`,
    releaseDir: resolvedReleaseDir,
    artifactErrors,
    assets,
    assetSnapshots,
    releaseBody,
  };
}

function formatReleasePublishPlan(plan, confirmed) {
  const mode = confirmed ? 'publish' : 'dry run';
  const lines = [
    'Release publish plan',
    `Repository: ${plan.repositorySlug}`,
    `Tag: ${plan.tag}`,
    `Release name: ${plan.releaseName}`,
    `Release directory: ${plan.releaseDir}`,
    `Mode: ${mode}`,
    '',
  ];

  if (plan.artifactErrors.length > 0) {
    lines.push('Artifact blockers:');
    for (const error of plan.artifactErrors) {
      lines.push(`- ${error}`);
    }
  } else {
    lines.push('Artifact check: passed');
  }

  lines.push('', 'Planned GitHub Release:');
  lines.push(`- POST /repos/${plan.repositorySlug}/releases`);
  lines.push(`  - tag_name: ${plan.tag}`);
  if (plan.targetCommitish) {
    lines.push(`  - target_commitish: ${plan.targetCommitish}`);
  }
  lines.push(`  - name: ${plan.releaseName}`);
  lines.push('  - draft: true');
  lines.push('  - prerelease: false');
  lines.push('  - generate_release_notes: true');
  lines.push('- Upload assets:');
  for (const assetPath of plan.assets) {
    lines.push(`  - ${path.basename(assetPath)}`);
  }
  lines.push('- PATCH the draft to publish only after every asset upload succeeds');

  if (!confirmed) {
    lines.push('', 'Dry run only. Build the Apple Silicon package, fix artifact blockers, set GITHUB_TOKEN, and rerun `npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm` to publish.');
  }

  return lines.join('\n');
}

function requestJson(url, { method = 'GET', body, token = process.env.GITHUB_TOKEN } = {}) {
  return new Promise((resolve, reject) => {
    const requestBody = body === undefined ? undefined : JSON.stringify(body);
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'chm-reader-light-release-publish',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
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
          const error = new Error(
            `GitHub API ${method} request failed with ${response.statusCode}: ${responseBody}`,
          );
          error.statusCode = response.statusCode;
          reject(error);
          return;
        }

        try {
          resolve(responseBody ? JSON.parse(responseBody) : undefined);
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

function uploadReleaseAsset(
  uploadUrlTemplate,
  assetPath,
  {
    token = process.env.GITHUB_TOKEN,
    timeoutMs = 10 * 60 * 1000,
    expectedSnapshot,
    requestFactory = https.request,
    createReadStream = fs.createReadStream,
  } = {},
) {
  return new Promise((resolve, reject) => {
    const fileDescriptor = fs.openSync(
      assetPath,
      fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0),
    );
    const stats = fs.fstatSync(fileDescriptor);
    const actualSnapshot = {
      path: assetPath,
      size: stats.size,
      sha256: calculateOpenFileSha256(fileDescriptor),
    };
    if (!stats.isFile() || !expectedSnapshot
        || actualSnapshot.size !== expectedSnapshot.size
        || actualSnapshot.sha256 !== expectedSnapshot.sha256) {
      fs.closeSync(fileDescriptor);
      reject(new Error(`Release asset changed after verification: ${assetPath}`));
      return;
    }
    const uploadUrl = uploadUrlTemplate.replace('{?name,label}', `?name=${encodeURIComponent(path.basename(assetPath))}`);
    const headers = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Length': stats.size,
      'Content-Type': assetPath.endsWith('.zip') ? 'application/zip' : 'text/plain',
      'User-Agent': 'chm-reader-light-release-publish',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    const streamedHash = crypto.createHash('sha256');
    let streamedBytes = 0;
    let streamedSha256;
    const request = requestFactory(uploadUrl, { method: 'POST', headers }, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        responseBody += chunk;
      });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`GitHub asset upload failed with ${response.statusCode}: ${responseBody}`));
          return;
        }
        if (streamedBytes !== expectedSnapshot.size
            || streamedSha256 !== expectedSnapshot.sha256) {
          reject(new Error(`Release asset changed while it was being uploaded: ${assetPath}`));
          return;
        }
        let uploadedAsset;
        try {
          uploadedAsset = JSON.parse(responseBody);
        } catch (error) {
          reject(new Error(`GitHub asset upload returned invalid JSON: ${error.message}`));
          return;
        }
        const expectedName = path.basename(assetPath);
        if (uploadedAsset.name !== expectedName) {
          reject(new Error(
            `GitHub asset name mismatch: expected ${expectedName}, found ${uploadedAsset.name || 'no name'}.`,
          ));
          return;
        }
        if (uploadedAsset.size !== expectedSnapshot.size) {
          reject(new Error(
            `GitHub asset size mismatch for ${expectedName}: expected ${expectedSnapshot.size} bytes, found ${uploadedAsset.size ?? 'unknown'}.`,
          ));
          return;
        }
        const expectedDigest = `sha256:${expectedSnapshot.sha256}`;
        if (uploadedAsset.digest?.toLowerCase() !== expectedDigest.toLowerCase()) {
          reject(new Error(
            `GitHub asset digest mismatch for ${expectedName}: expected ${expectedDigest}, found ${uploadedAsset.digest || 'no digest'}.`,
          ));
          return;
        }
        resolve();
      });
    });

    request.on('error', reject);
    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`GitHub asset upload timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
    });

    const fileStream = createReadStream(assetPath, { fd: fileDescriptor, start: 0 });
    fileStream.on('data', (chunk) => {
      streamedBytes += chunk.length;
      streamedHash.update(chunk);
    });
    fileStream.on('end', () => {
      streamedSha256 = streamedHash.digest('hex');
    });
    fileStream.on('error', (error) => request.destroy(error));
    fileStream.pipe(request);
  });
}

async function findReleaseByTag(repositorySlug, tag, sendJson) {
  const perPage = 100;

  for (let page = 1; ; page += 1) {
    const releases = await sendJson(
      `https://api.github.com/repos/${repositorySlug}/releases?per_page=${perPage}&page=${page}`,
    );
    const release = releases.find((candidate) => candidate.tag_name === tag);
    if (release || releases.length < perPage) return release;
  }
}

async function resolveRemoteTagCommit(repositorySlug, tag, sendJson) {
  // GitHub ignores target_commitish when a tag already exists, so inspect the ref directly.
  // Sources: https://docs.github.com/en/rest/releases/releases#create-a-release
  // https://docs.github.com/en/rest/git/refs#get-a-reference
  // https://docs.github.com/en/rest/git/tags#get-a-tag
  let object;
  try {
    const ref = await sendJson(
      `https://api.github.com/repos/${repositorySlug}/git/ref/tags/${encodeURIComponent(tag)}`,
    );
    object = ref?.object;
  } catch (error) {
    if (error.statusCode === 404) return undefined;
    throw error;
  }

  const visitedTagObjects = new Set();
  while (object?.type === 'tag') {
    if (!/^[a-f0-9]{40}$/i.test(object.sha || '') || visitedTagObjects.has(object.sha)) {
      throw new Error(`Remote tag ${tag} has an invalid or cyclic annotated tag chain.`);
    }
    visitedTagObjects.add(object.sha);
    if (visitedTagObjects.size > 16) {
      throw new Error(`Remote tag ${tag} exceeds the annotated tag depth limit.`);
    }
    const tagObject = await sendJson(
      `https://api.github.com/repos/${repositorySlug}/git/tags/${object.sha}`,
    );
    object = tagObject?.object;
  }

  if (object?.type !== 'commit' || !/^[a-f0-9]{40}$/i.test(object.sha || '')) {
    throw new Error(`Remote tag ${tag} does not resolve to a valid commit.`);
  }
  return object.sha.toLowerCase();
}

async function ensureRemoteTagCommit(
  repositorySlug,
  tag,
  expectedCommit,
  sendJson,
  resolveTagCommit = () => resolveRemoteTagCommit(repositorySlug, tag, sendJson),
) {
  let tagCommit = await resolveTagCommit();
  if (!tagCommit) {
    try {
      await sendJson(`https://api.github.com/repos/${repositorySlug}/git/refs`, {
        method: 'POST',
        body: { ref: `refs/tags/${tag}`, sha: expectedCommit },
      });
    } catch (error) {
      if (error.statusCode !== 422) throw error;
    }
    tagCommit = await resolveTagCommit();
  }

  if (!tagCommit || tagCommit.toLowerCase() !== expectedCommit.toLowerCase()) {
    throw new Error(
      `Existing tag ${tag} resolves to ${tagCommit || 'no commit'}, not ${expectedCommit}.`,
    );
  }
  return tagCommit.toLowerCase();
}

function verifyRemoteReleaseAssetSnapshots(release, assetPaths, assetSnapshots, expectedDraft = true) {
  const errors = [];
  const expectedAssets = new Map(assetPaths.map((assetPath, index) => [
    path.basename(assetPath),
    assetSnapshots[index],
  ]));
  const remoteAssetsByName = new Map();

  if (release?.draft !== expectedDraft) {
    errors.push('release draft state expected ' + expectedDraft
      + ', found ' + (release?.draft ?? 'unknown'));
  }

  for (const asset of release?.assets || []) {
    if (remoteAssetsByName.has(asset.name)) {
      errors.push(`duplicate ${asset.name}`);
    } else {
      remoteAssetsByName.set(asset.name, asset);
    }
    if (!expectedAssets.has(asset.name)) {
      errors.push(`unexpected ${asset.name}`);
    }
  }

  for (const [name, snapshot] of expectedAssets) {
    const remoteAsset = remoteAssetsByName.get(name);
    if (!remoteAsset) {
      errors.unshift(`missing ${name}`);
      continue;
    }
    if (remoteAsset.state !== 'uploaded') {
      errors.push(`${name} is not uploaded (state: ${remoteAsset.state || 'unknown'})`);
    }
    if (remoteAsset.size !== snapshot.size) {
      errors.push(
        `size mismatch for ${name}: expected ${snapshot.size} bytes, found ${remoteAsset.size ?? 'unknown'}`,
      );
    }
    const expectedDigest = `sha256:${snapshot.sha256}`;
    if (remoteAsset.digest?.toLowerCase() !== expectedDigest.toLowerCase()) {
      errors.push(
        `digest mismatch for ${name}: expected ${expectedDigest}, found ${remoteAsset.digest || 'no digest'}`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Remote draft asset verification failed: ${errors.join('; ')}.`);
  }
}

async function publishRelease(plan, dependencies = {}) {
  const token = dependencies.token || process.env.GITHUB_TOKEN;
  const sendJson = dependencies.requestJson || ((url, options) => requestJson(url, { ...options, token }));
  const verifySnapshot = dependencies.verifyAssetSnapshot || verifyAssetSnapshot;
  const uploadAsset = dependencies.uploadReleaseAsset
    || ((uploadUrl, assetPath, snapshot) => uploadReleaseAsset(
      uploadUrl,
      assetPath,
      { token, expectedSnapshot: snapshot },
    ));

  if (!token) {
    throw new Error('GITHUB_TOKEN is required when using --confirm.');
  }
  if (!/^[a-f0-9]{40}$/i.test(plan.targetCommitish || '')) {
    throw new Error('Publishing requires --target-commitish with the full 40-character commit SHA used to build the assets.');
  }
  if (plan.artifactErrors.length > 0) {
    throw new Error('Release artifacts must pass npm run check:release-artifacts before publishing.');
  }
  if (!Array.isArray(plan.assetSnapshots) || plan.assetSnapshots.length !== plan.assets.length) {
    throw new Error('Release asset verification snapshots are required before publishing.');
  }
  for (const snapshot of plan.assetSnapshots) verifySnapshot(snapshot);

  const resolveTagCommit = dependencies.resolveRemoteTagCommit
    || (() => resolveRemoteTagCommit(plan.repositorySlug, plan.tag, sendJson));
  const ensureTagCommit = dependencies.ensureRemoteTagCommit
    || (() => ensureRemoteTagCommit(
      plan.repositorySlug,
      plan.tag,
      plan.targetCommitish,
      sendJson,
      resolveTagCommit,
    ));
  const remoteTagCommit = await resolveTagCommit();
  if (remoteTagCommit
      && remoteTagCommit.toLowerCase() !== plan.targetCommitish.toLowerCase()) {
    throw new Error(
      `Existing tag ${plan.tag} resolves to ${remoteTagCommit}, not ${plan.targetCommitish}.`,
    );
  }

  const releasePayload = {
    tag_name: plan.tag,
    ...(plan.targetCommitish ? { target_commitish: plan.targetCommitish } : {}),
    name: plan.releaseName,
    body: plan.releaseBody,
    draft: true,
    prerelease: false,
    generate_release_notes: true,
  };
  const findRelease = dependencies.findRelease
    || (() => findReleaseByTag(plan.repositorySlug, plan.tag, sendJson));
  let release = await findRelease();
  let existingAssets = [];

  if (release) {
    if (!release.draft) {
      throw new Error(`Release ${plan.tag} is already public; refusing to overwrite it.`);
    }
    if (plan.targetCommitish && release.target_commitish
        && release.target_commitish !== plan.targetCommitish) {
      throw new Error(
        `Draft release ${plan.tag} targets ${release.target_commitish}, not ${plan.targetCommitish}.`,
      );
    }

    const expectedAssetNames = new Set(plan.assets.map((assetPath) => path.basename(assetPath)));
    existingAssets = release.assets || [];
    for (const asset of existingAssets) {
      if (!expectedAssetNames.has(asset.name)) {
        throw new Error(`Draft release ${plan.tag} contains unexpected asset ${asset.name}; refusing to delete it.`);
      }
    }
  }

  await ensureTagCommit();

  if (release) {
    for (const asset of existingAssets) {
      await sendJson(
        `https://api.github.com/repos/${plan.repositorySlug}/releases/assets/${asset.id}`,
        { method: 'DELETE' },
      );
    }

    release = await sendJson(
      `https://api.github.com/repos/${plan.repositorySlug}/releases/${release.id}`,
      { method: 'PATCH', body: releasePayload },
    );
  } else {
    release = await sendJson(`https://api.github.com/repos/${plan.repositorySlug}/releases`, {
      method: 'POST',
      body: releasePayload,
    });
  }

  for (let index = 0; index < plan.assets.length; index += 1) {
    await uploadAsset(release.upload_url, plan.assets[index], plan.assetSnapshots[index]);
  }

  const finalTagCommit = await resolveTagCommit();
  if (!finalTagCommit
      || finalTagCommit.toLowerCase() !== plan.targetCommitish.toLowerCase()) {
    throw new Error(
      `Tag ${plan.tag} moved during publishing: expected ${plan.targetCommitish}, found ${finalTagCommit || 'no tag'}. The Release remains a draft.`,
    );
  }

  const remoteDraft = await sendJson(
    `https://api.github.com/repos/${plan.repositorySlug}/releases/${release.id}`,
  );
  verifyRemoteReleaseAssetSnapshots(remoteDraft, plan.assets, plan.assetSnapshots);

  const releaseUrl = `https://api.github.com/repos/${plan.repositorySlug}/releases/${release.id}`;
  const publishedRelease = await sendJson(releaseUrl, {
    method: 'PATCH',
    body: { draft: false },
  });
  try {
    const publishedTagCommit = await resolveTagCommit();
    if (!publishedTagCommit
        || publishedTagCommit.toLowerCase() !== plan.targetCommitish.toLowerCase()) {
      throw new Error(
        'tag expected ' + plan.targetCommitish
          + ', found ' + (publishedTagCommit || 'no tag'),
      );
    }
    const verifiedPublicRelease = await sendJson(releaseUrl);
    verifyRemoteReleaseAssetSnapshots(
      verifiedPublicRelease,
      plan.assets,
      plan.assetSnapshots,
      false,
    );
    return publishedRelease;
  } catch (error) {
    try {
      await sendJson(releaseUrl, { method: 'PATCH', body: { draft: true } });
    } catch (rollbackError) {
      throw new Error(
        'Release changed after publication and could not be returned to draft: '
          + error.message + '; rollback failed: ' + rollbackError.message,
      );
    }
    throw new Error('Release changed after publication and was returned to draft: ' + error.message);
  }
}

async function main(argv = process.argv) {
  try {
    const options = parseArgs(argv);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const tag = options.tag || `v${packageJson.version}`;
    const releaseTemplate = extractReleaseBodyTemplate(fs.readFileSync(releaseTemplatePath, 'utf-8'));
    const releaseBody = buildReleaseBody({ releaseTemplate, tag });
    const releaseDir = path.resolve(rootDir, options.releaseDir);
    const plan = buildReleasePublishPlan({
      packageJson,
      releaseDir,
      tag,
      targetCommitish: options.targetCommitish,
      artifactErrors: verifyReleaseArtifacts(releaseDir),
      releaseBody,
    });

    console.log(formatReleasePublishPlan(plan, options.confirmed));

    if (!options.confirmed) return;

    const release = await publishRelease(plan);
    console.log(`Published release: ${release.html_url}`);
  } catch (error) {
    console.error('Release publish failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildReleaseBody,
  buildReleasePublishPlan,
  captureAssetSnapshot,
  ensureRemoteTagCommit,
  extractReleaseBodyTemplate,
  findReleaseByTag,
  formatReleasePublishPlan,
  parseArgs,
  publishRelease,
  resolveRemoteTagCommit,
  uploadReleaseAsset,
  validateReleaseTag,
  verifyRemoteReleaseAssetSnapshots,
};
