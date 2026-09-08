const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Readable, Writable } = require('node:stream');
const { spawnSync } = require('node:child_process');
const { createPackage, getRawHeader } = require('@electron/asar');

const {
  EXPECTED_RELEASE_ARTIFACTS,
  verifyReleaseArtifacts,
} = require('../scripts/check-release-artifacts');

const {
  ICON_ENTRIES,
  buildIcns,
} = require('../scripts/build-icns');

const {
  MAX_APP_ASAR_BYTES,
  verifyPackagedAppAsar,
} = require('../scripts/check-packaged-app-asar');

const { verifyElectronAsarIntegrity } = require('../scripts/check-electron-asar-integrity');
const { verifyElectronFuseWires } = require('../scripts/check-electron-fuses');
const { verifyMacosReleaseRoot } = require('../scripts/check-macos-release-root');
const { createAdhocSignOptions } = require('../scripts/sign-macos-app');
const {
  verifyAdhocSignatureDetails,
  verifyMacosAdhocSignature,
} = require('../scripts/check-macos-adhoc-signature');

const {
  EXPECTED_LIVE_RELEASE_ASSETS,
  formatRemediation: formatLiveReleaseRemediation,
  canUseHtmlFallback,
  parseArgs: parseCheckLiveReleaseArgs,
  releaseApiUrl,
  releaseHtmlUrl,
  snapshotExpectedLiveReleaseAssets,
  parseLiveReleaseHtml,
  verifyLiveReleaseTagCommit,
  verifyLiveReleaseHtml,
  verifyLiveReleaseAssets,
} = require('../scripts/check-live-release');

const {
  compareListing,
  parseLiveRepositoryHtml,
} = require('../scripts/check-live-repository-listing');

const {
  buildHtmlFallbackSnapshot,
  formatLocalIsoDate,
  formatGrowthMetricsSnapshot,
} = require('../scripts/snapshot-growth-metrics');

const {
  settleVisibilityAudits,
  formatVisibilityReadinessSnapshot,
} = require('../scripts/snapshot-visibility-readiness');

const {
  buildRepositoryListingUpdate,
  formatRepositoryListingApplyPlan,
  normalizeTopics,
} = require('../scripts/apply-repository-listing');

const {
  buildReleaseBody,
  buildReleasePublishPlan,
  extractReleaseBodyTemplate,
  ensureRemoteTagCommit,
  findReleaseByTag,
  formatReleasePublishPlan,
  parseArgs: parsePublishReleaseArgs,
  publishRelease,
  resolveRemoteTagCommit,
  uploadReleaseAsset,
  validateReleaseTag,
  verifyRemoteReleaseAssetSnapshots,
} = require('../scripts/publish-release');

const {
  parseArgs: parsePrepareReleaseBodyArgs,
  writeReleaseBody,
} = require('../scripts/prepare-release-body');

const {
  applyReleaseArtifactStagePlan,
  buildReleaseArtifactStagePlan,
  formatReleaseArtifactStagePlan,
  parseArgs: parseStageReleaseArtifactsArgs,
} = require('../scripts/stage-release-artifacts');

const {
  buildVisibilityIssuePlan,
  extractGrowthBaseline,
  formatVisibilityIssuePlan,
  parseArgs: parsePrepareVisibilityIssueArgs,
} = require('../scripts/prepare-visibility-issue');

const {
  buildSharePostDraft,
  extractShareKitCopy,
  formatSharePostDraft,
  parseArgs: parsePrepareSharePostArgs,
} = require('../scripts/prepare-share-post');

function makeTempReleaseDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'chm-release-artifacts-'));
}

function writeArtifactWithChecksum(rootDir, artifactName, content) {
  fs.mkdirSync(rootDir, { recursive: true });
  const artifactPath = path.join(rootDir, artifactName);
  fs.writeFileSync(artifactPath, content);
  const checksum = crypto.createHash('sha256').update(content).digest('hex');
  fs.writeFileSync(`${artifactPath}.sha256`, `${checksum}  ${artifactName}\n`);
}

function makePngHeader(size) {
  const png = Buffer.alloc(24);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(png);
  png.writeUInt32BE(size, 16);
  png.writeUInt32BE(size, 20);
  return png;
}

test('buildIcns writes all standard PNG icon chunks with valid container lengths', () => {
  const rootDir = makeTempReleaseDir();
  const iconsetDir = path.join(rootDir, 'App.iconset');
  const outputPath = path.join(rootDir, 'App.icns');
  fs.mkdirSync(iconsetDir);

  for (const [, filename, size] of ICON_ENTRIES) {
    fs.writeFileSync(path.join(iconsetDir, filename), makePngHeader(size));
  }

  buildIcns(iconsetDir, outputPath);
  const icns = fs.readFileSync(outputPath);
  const chunkTypes = [];
  let offset = 8;
  while (offset < icns.length) {
    chunkTypes.push(icns.toString('ascii', offset, offset + 4));
    offset += icns.readUInt32BE(offset + 4);
  }

  assert.equal(icns.toString('ascii', 0, 4), 'icns');
  assert.equal(icns.readUInt32BE(4), icns.length);
  assert.equal(offset, icns.length);
  assert.deepEqual(chunkTypes, ICON_ENTRIES.map(([type]) => type));
});

test('buildIcns rejects an iconset PNG with the wrong dimensions', () => {
  const rootDir = makeTempReleaseDir();
  const iconsetDir = path.join(rootDir, 'App.iconset');
  fs.mkdirSync(iconsetDir);

  for (const [, filename, size] of ICON_ENTRIES) {
    fs.writeFileSync(path.join(iconsetDir, filename), makePngHeader(size));
  }
  fs.writeFileSync(path.join(iconsetDir, 'icon_512x512@2x.png'), makePngHeader(512));

  assert.throws(
    () => buildIcns(iconsetDir, path.join(rootDir, 'App.icns')),
    /Expected 1024x1024 PNG/,
  );
});

async function makeAppAsar(extraEntries = {}) {
  const rootDir = makeTempReleaseDir();
  const sourceDir = path.join(rootDir, 'app');
  const asarPath = path.join(rootDir, 'app.asar');
  const entries = {
    'LICENSE': 'MIT license',
    'THIRD_PARTY_NOTICES.md': 'Third-party notices',
    'build/index.html': '<!doctype html>',
    'build/main.js': 'console.log(\"app\");',
    'build/preload.js': 'console.log(\"preload\");',
    'node_modules/runtime/index.js': 'module.exports = {};',
    'package.json': '{\"main\":\"build/main.js\"}',
    ...extraEntries,
  };

  for (const [relativePath, content] of Object.entries(entries)) {
    const filePath = path.join(sourceDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }
  await createPackage(sourceDir, asarPath);
  return asarPath;
}

test('verifyPackagedAppAsar accepts the minimal licensed runtime payload', async () => {
  const asarPath = await makeAppAsar();

  assert.deepEqual(verifyPackagedAppAsar(asarPath), []);
});

test('verifyElectronAsarIntegrity accepts matching packager metadata', async () => {
  const asarPath = await makeAppAsar();
  const { headerString } = getRawHeader(asarPath);
  const hash = crypto.createHash('sha256').update(headerString).digest('hex');

  assert.deepEqual(verifyElectronAsarIntegrity(asarPath, { algorithm: 'SHA256', hash }), []);
});

test('verifyElectronAsarIntegrity rejects missing or mismatched packager metadata', async () => {
  const asarPath = await makeAppAsar();

  assert.deepEqual(verifyElectronAsarIntegrity(asarPath), [
    'Missing ElectronAsarIntegrity metadata for Resources/app.asar.',
  ]);
  assert.deepEqual(verifyElectronAsarIntegrity(asarPath, { algorithm: 'SHA512', hash: '0'.repeat(64) }), [
    'Unexpected ElectronAsarIntegrity algorithm: SHA512.',
  ]);
  assert.deepEqual(verifyElectronAsarIntegrity(asarPath, { algorithm: 'SHA256', hash: '0'.repeat(64) }), [
    'ElectronAsarIntegrity hash does not match the packaged app.asar header.',
  ]);
});

test('verifyElectronFuseWires rejects an unsafe second universal-binary slice', () => {
  const hardenedWire = {
    version: '1',
    0: 48, 1: 49, 2: 48, 3: 48, 4: 49, 5: 49, 6: 48, 7: 49, 8: 49,
  };
  const unsafeWire = { ...hardenedWire, 0: 49 };

  assert.deepEqual(verifyElectronFuseWires([hardenedWire]), []);
  assert.deepEqual(verifyElectronFuseWires([hardenedWire, unsafeWire]), [
    'Unexpected Electron fuse state for RunAsNode in binary slice 2.',
  ]);
});

test('ad-hoc signing disables hardened runtime for every nested signing target', () => {
  const options = createAdhocSignOptions('/tmp/CHMReaderLight.app');

  assert.equal(options.identity, '-');
  assert.equal(options.hardenedRuntime, undefined);
  assert.equal(options.optionsForFile('/tmp/CHMReaderLight.app').hardenedRuntime, false);
  assert.equal(
    options.optionsForFile('/tmp/CHMReaderLight.app/Contents/Frameworks/Electron Framework.framework').hardenedRuntime,
    false,
  );
});

test('ad-hoc signature verification rejects hardened runtime release components', () => {
  const validDetails = [
    'CodeDirectory v=20400 size=428 flags=0x2(adhoc) hashes=3+7 location=embedded',
    'Signature=adhoc',
    'TeamIdentifier=not set',
  ].join('\n');
  const invalidDetails = validDetails.replace('flags=0x2(adhoc)', 'flags=0x10002(adhoc,runtime)');

  assert.deepEqual(verifyAdhocSignatureDetails('app executable', validDetails), []);
  assert.deepEqual(verifyAdhocSignatureDetails('app executable', invalidDetails), [
    'app executable unexpectedly enables hardened runtime for an ad-hoc signature.',
  ]);
});

test('ad-hoc signature verification checks every Mach-O file in the app bundle', () => {
  const rootDir = makeTempReleaseDir();
  const appPath = path.join(rootDir, 'CHMReaderLight.app');
  const mainBinary = path.join(appPath, 'Contents', 'MacOS', 'CHMReaderLight');
  const helperBinary = path.join(
    appPath,
    'Contents',
    'Frameworks',
    'CHMReaderLight Helper.app',
    'Contents',
    'MacOS',
    'CHMReaderLight Helper',
  );
  const textFile = path.join(appPath, 'Contents', 'Resources', 'notice.txt');
  for (const filePath of [mainBinary, helperBinary, textFile]) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(mainBinary, Buffer.from('cffaedfe00000000', 'hex'));
  fs.writeFileSync(helperBinary, Buffer.from('cffaedfe00000000', 'hex'));
  fs.writeFileSync(textFile, 'not executable code');

  const validDetails = [
    'CodeDirectory v=20400 size=428 flags=0x2(adhoc) hashes=3+7 location=embedded',
    'Signature=adhoc',
    'TeamIdentifier=not set',
  ].join('\n');
  const invalidDetails = validDetails.replace('flags=0x2(adhoc)', 'flags=0x10002(adhoc,runtime)');
  const inspected = [];

  const errors = verifyMacosAdhocSignature(appPath, {
    readDetails(targetPath) {
      inspected.push(path.relative(appPath, targetPath));
      return targetPath === helperBinary ? invalidDetails : validDetails;
    },
  });

  assert.deepEqual(inspected.sort(), [
    'Contents/Frameworks/CHMReaderLight Helper.app/Contents/MacOS/CHMReaderLight Helper',
    'Contents/MacOS/CHMReaderLight',
  ]);
  assert.deepEqual(errors, [
    'Contents/Frameworks/CHMReaderLight Helper.app/Contents/MacOS/CHMReaderLight Helper unexpectedly enables hardened runtime for an ad-hoc signature.',
  ]);
});

test('macOS release root rejects payloads outside the app and resource metadata directories', () => {
  const rootDir = makeTempReleaseDir();
  fs.mkdirSync(path.join(rootDir, 'CHMReaderLight.app'));
  fs.mkdirSync(path.join(rootDir, '__MACOSX'));
  fs.writeFileSync(path.join(rootDir, '__MACOSX', '._CHMReaderLight.app'), 'AppleDouble metadata');

  assert.deepEqual(verifyMacosReleaseRoot(rootDir), []);

  fs.writeFileSync(path.join(rootDir, 'unexpected.txt'), 'unexpected payload');
  assert.deepEqual(verifyMacosReleaseRoot(rootDir), [
    'Unexpected release archive root entry: unexpected.txt',
  ]);

  fs.unlinkSync(path.join(rootDir, 'unexpected.txt'));
  fs.writeFileSync(path.join(rootDir, '__MACOSX', 'payload'), 'hidden payload');
  assert.deepEqual(verifyMacosReleaseRoot(rootDir), [
    'Unexpected release archive metadata entry: __MACOSX/payload',
  ]);
});

test('verifyPackagedAppAsar rejects repository and release artifacts', async () => {
  const asarPath = await makeAppAsar({
    'CHMReaderLight-mac-arm64.zip': 'nested release',
    'test/ui.test.js': 'test source',
  });

  assert.deepEqual(verifyPackagedAppAsar(asarPath), [
    'Unexpected app.asar root entry: CHMReaderLight-mac-arm64.zip',
    'Unexpected app.asar root entry: test',
  ]);
});

test('verifyPackagedAppAsar rejects the generated bundle icon duplicated inside app.asar', async () => {
  const asarPath = await makeAppAsar({
    'build/assets/app-icon.icns': 'generated packaging input',
  });

  assert.deepEqual(verifyPackagedAppAsar(asarPath), [
    'Unexpected generated packaging asset in app.asar: build/assets/app-icon.icns',
  ]);
});

test('verifyPackagedAppAsar enforces the release payload size budget', async () => {
  const asarPath = await makeAppAsar();
  const actualBytes = fs.statSync(asarPath).size;

  assert.equal(MAX_APP_ASAR_BYTES, 20 * 1024 * 1024);
  assert.deepEqual(verifyPackagedAppAsar(asarPath, actualBytes - 1), [
    `Packaged app.asar is ${actualBytes} bytes; limit is ${actualBytes - 1} bytes.`,
  ]);
});

test('verifyPackagedAppAsar rejects a missing declared production dependency', async () => {
  const asarPath = await makeAppAsar({
    'package.json': JSON.stringify({
      main: 'build/main.js',
      dependencies: { cheerio: '1.2.0' },
    }),
  });

  assert.deepEqual(verifyPackagedAppAsar(asarPath), [
    'Missing packaged production dependency: cheerio',
  ]);
});

test('verifyPackagedAppAsar rejects an unexpected application entry point', async () => {
  const asarPath = await makeAppAsar({
    'package.json': '{\"main\":\"src/main.ts\"}',
  });

  assert.deepEqual(verifyPackagedAppAsar(asarPath), [
    'Unexpected packaged application entry point: src/main.ts',
  ]);
});

test('verifyPackagedAppAsar rejects manifest metadata that differs from the release source', async () => {
  const asarPath = await makeAppAsar({
    'package.json': JSON.stringify({
      name: 'renamed-app',
      version: '9.9.9',
      main: 'build/main.js',
      dependencies: { htmlparser2: '9.0.0' },
    }),
    'node_modules/htmlparser2/package.json': '{\"name\":\"htmlparser2\"}',
  });
  const expectedManifest = {
    name: 'chm-reader-light',
    version: '0.1.0',
    main: 'build/main.js',
    dependencies: { htmlparser2: '10.1.0' },
  };

  assert.deepEqual(verifyPackagedAppAsar(asarPath, MAX_APP_ASAR_BYTES, expectedManifest), [
    'Packaged package.json name does not match the release source.',
    'Packaged package.json version does not match the release source.',
    'Packaged package.json dependencies do not match the release source.',
  ]);
});

test('verifyReleaseArtifacts accepts both macOS release zips with matching checksums', () => {
  const releaseDir = makeTempReleaseDir();

  writeArtifactWithChecksum(releaseDir, 'CHMReaderLight-mac-arm64.zip', 'arm build');
  writeArtifactWithChecksum(releaseDir, 'CHMReaderLight-mac-x64.zip', 'intel build');

  assert.equal(EXPECTED_RELEASE_ARTIFACTS.length, 2);
  assert.deepEqual(verifyReleaseArtifacts(releaseDir), []);
});

test('verifyReleaseArtifacts reports missing artifacts and checksum mismatches', () => {
  const releaseDir = makeTempReleaseDir();
  const incorrectChecksum = '0'.repeat(64);
  const intelBuild = 'intel build';
  const actualChecksum = crypto.createHash('sha256').update(intelBuild).digest('hex');

  writeArtifactWithChecksum(releaseDir, 'CHMReaderLight-mac-arm64.zip', 'arm build');
  fs.writeFileSync(path.join(releaseDir, 'CHMReaderLight-mac-x64.zip'), intelBuild);
  fs.writeFileSync(path.join(releaseDir, 'CHMReaderLight-mac-x64.zip.sha256'), `${incorrectChecksum}  CHMReaderLight-mac-x64.zip\n`);

  const errors = verifyReleaseArtifacts(releaseDir);

  assert.deepEqual(errors, [
    `Checksum mismatch for CHMReaderLight-mac-x64.zip: expected ${incorrectChecksum}, got ${actualChecksum}.`,
  ]);
});

test('verifyReleaseArtifacts rejects a checksum naming a different release artifact', () => {
  const releaseDir = makeTempReleaseDir();
  const artifactName = 'CHMReaderLight-mac-arm64.zip';
  const content = 'arm build';
  const checksum = crypto.createHash('sha256').update(content).digest('hex');

  fs.writeFileSync(path.join(releaseDir, artifactName), content);
  fs.writeFileSync(
    path.join(releaseDir, `${artifactName}.sha256`),
    `${checksum}  CHMReaderLight-mac-x64.zip\n`,
  );
  writeArtifactWithChecksum(releaseDir, 'CHMReaderLight-mac-x64.zip', 'intel build');

  assert.deepEqual(verifyReleaseArtifacts(releaseDir), [
    `Invalid checksum file format or artifact name: ${artifactName}.sha256`,
  ]);
});

test('verifyReleaseArtifacts reports missing release files', () => {
  const releaseDir = makeTempReleaseDir();

  writeArtifactWithChecksum(releaseDir, 'CHMReaderLight-mac-arm64.zip', 'arm build');

  const errors = verifyReleaseArtifacts(releaseDir);

  assert.deepEqual(errors, [
    'Missing release artifact: CHMReaderLight-mac-x64.zip',
    'Missing checksum file: CHMReaderLight-mac-x64.zip.sha256',
  ]);
});

test('verifyReleaseArtifacts reports unexpected macOS release files', () => {
  const releaseDir = makeTempReleaseDir();

  writeArtifactWithChecksum(releaseDir, 'CHMReaderLight-mac-arm64.zip', 'arm build');
  writeArtifactWithChecksum(releaseDir, 'CHMReaderLight-mac-x64.zip', 'intel build');
  fs.writeFileSync(path.join(releaseDir, 'CHMReaderLight-mac-universal.zip'), 'old universal build');
  fs.writeFileSync(path.join(releaseDir, 'CHMReaderLight-mac-universal.zip.sha256'), `${'1'.repeat(64)}  CHMReaderLight-mac-universal.zip\n`);
  fs.writeFileSync(path.join(releaseDir, 'notes.txt'), 'release notes draft');

  const errors = verifyReleaseArtifacts(releaseDir);

  assert.deepEqual(errors, [
    'Unexpected release artifact: CHMReaderLight-mac-universal.zip',
    'Unexpected checksum file: CHMReaderLight-mac-universal.zip.sha256',
  ]);
});

test('verifyLiveReleaseAssets accepts expected latest release assets', () => {
  const errors = verifyLiveReleaseAssets({
    tag_name: 'v0.1.0',
    html_url: 'https://github.com/zhongdiandaoda/chm-reader-light/releases/tag/v0.1.0',
    assets: EXPECTED_LIVE_RELEASE_ASSETS.map((name) => ({ name })),
  });

  assert.deepEqual(errors, []);
});

test('parseCheckLiveReleaseArgs defaults to latest and accepts an exact expected commit', () => {
  const commit = '0123456789abcdef0123456789abcdef01234567';
  assert.deepEqual(parseCheckLiveReleaseArgs(['node', 'scripts/check-live-release.js']), {
    tag: undefined,
    targetCommitish: undefined,
    releaseDir: undefined,
  });
  assert.deepEqual(parseCheckLiveReleaseArgs([
    'node',
    'scripts/check-live-release.js',
    '--tag',
    'v0.1.0',
    '--target-commitish',
    commit,
    '--release-dir',
    'dist/release',
  ]), { tag: 'v0.1.0', targetCommitish: commit, releaseDir: 'dist/release' });
  assert.equal(
    releaseApiUrl('v0.1.0'),
    'https://api.github.com/repos/zhongdiandaoda/chm-reader-light/releases/tags/v0.1.0',
  );
  assert.equal(
    releaseHtmlUrl('v0.1.0'),
    'https://github.com/zhongdiandaoda/chm-reader-light/releases/tag/v0.1.0',
  );
});

test('parseCheckLiveReleaseArgs rejects missing and malformed release tags', () => {
  assert.throws(
    () => parseCheckLiveReleaseArgs(['node', 'scripts/check-live-release.js', '--tag']),
    /--tag requires a value/,
  );
  assert.throws(
    () => parseCheckLiveReleaseArgs(['node', 'scripts/check-live-release.js', '--tag', 'latest']),
    /Release tag must match vMAJOR.MINOR.PATCH/,
  );
  assert.throws(
    () => parseCheckLiveReleaseArgs([
      'node',
      'scripts/check-live-release.js',
      '--tag',
      'v0.1.0',
      '--target-commitish',
      '0123456789abcdef',
    ]),
    /full 40-character commit SHA/i,
  );
  assert.throws(
    () => parseCheckLiveReleaseArgs([
      'node',
      'scripts/check-live-release.js',
      '--target-commitish',
      '0123456789abcdef0123456789abcdef01234567',
    ]),
    /requires --tag/i,
  );
  assert.throws(
    () => parseCheckLiveReleaseArgs([
      'node',
      'scripts/check-live-release.js',
      '--release-dir',
      'dist/release',
    ]),
    /requires --tag/i,
  );
});

test('snapshotExpectedLiveReleaseAssets records verified local sizes and SHA-256 digests', () => {
  const releaseDir = makeTempReleaseDir();
  writeArtifactWithChecksum(releaseDir, 'CHMReaderLight-mac-arm64.zip', 'arm build');
  writeArtifactWithChecksum(releaseDir, 'CHMReaderLight-mac-x64.zip', 'intel build');
  const expected = snapshotExpectedLiveReleaseAssets(releaseDir);

  assert.deepEqual(Object.keys(expected).sort(), EXPECTED_LIVE_RELEASE_ASSETS.slice().sort());
  for (const name of EXPECTED_LIVE_RELEASE_ASSETS) {
    const contents = fs.readFileSync(path.join(releaseDir, name));
    assert.deepEqual(expected[name], {
      size: contents.length,
      sha256: crypto.createHash('sha256').update(contents).digest('hex'),
    });
  }
});

test('verifyLiveReleaseTagCommit rejects a tag that no longer points to the build commit', () => {
  const expectedCommit = '0123456789abcdef0123456789abcdef01234567';
  const actualCommit = 'fedcba9876543210fedcba9876543210fedcba98';

  assert.deepEqual(
    verifyLiveReleaseTagCommit('v0.1.0', actualCommit, expectedCommit),
    [`Release tag v0.1.0 resolves to ${actualCommit}, not build commit ${expectedCommit}.`],
  );
  assert.deepEqual(
    verifyLiveReleaseTagCommit('v0.1.0', expectedCommit.toUpperCase(), expectedCommit),
    [],
  );
});

test('HTML fallback is disabled when exact tag provenance is required', () => {
  assert.equal(canUseHtmlFallback(undefined), true);
  assert.equal(
    canUseHtmlFallback('0123456789abcdef0123456789abcdef01234567'),
    false,
  );
  assert.equal(canUseHtmlFallback(undefined, 'dist/release'), false);
});

test('verifyLiveReleaseAssets reports missing and stale latest release assets', () => {
  const errors = verifyLiveReleaseAssets({
    tag_name: 'v0.1.0',
    html_url: 'https://github.com/zhongdiandaoda/chm-reader-light/releases/tag/v0.1.0',
    assets: [
      { name: 'CHMReaderLight-mac-arm64.zip' },
      { name: 'CHMReaderLight-mac-arm64.zip.sha256' },
      { name: 'CHMReaderLight-mac-universal.zip' },
      { name: 'CHMReaderLight-mac-universal.zip.sha256' },
      { name: 'notes.txt' },
    ],
  });

  assert.deepEqual(errors, [
    'Missing latest release asset: CHMReaderLight-mac-x64.zip',
    'Missing latest release asset: CHMReaderLight-mac-x64.zip.sha256',
    'Unexpected latest release macOS asset: CHMReaderLight-mac-universal.zip',
    'Unexpected latest release macOS asset: CHMReaderLight-mac-universal.zip.sha256',
  ]);
});

test('verifyLiveReleaseAssets validates the requested published tag and uploaded asset metadata', () => {
  const expectedAssetSnapshots = Object.fromEntries(
    EXPECTED_LIVE_RELEASE_ASSETS.map((name) => [name, { size: 128, sha256: 'a'.repeat(64) }]),
  );
  const errors = verifyLiveReleaseAssets({
    tag_name: 'v0.1.1',
    draft: true,
    prerelease: true,
    assets: EXPECTED_LIVE_RELEASE_ASSETS.map((name, index) => ({
      name,
      size: index === 0 ? 0 : 128,
      state: index === 1 ? 'new' : 'uploaded',
      digest: index === 2 ? `sha256:${'b'.repeat(64)}` : `sha256:${'a'.repeat(64)}`,
      browser_download_url: `https://github.com/zhongdiandaoda/chm-reader-light/releases/download/v0.1.1/${name}`,
    })),
  }, { expectedTag: 'v0.1.0', requirePublishedMetadata: true, expectedAssetSnapshots });

  assert.deepEqual(errors, [
    'Release tag mismatch: expected v0.1.0, found v0.1.1.',
    'Release v0.1.1 is still a draft.',
    'Release v0.1.1 is marked as a prerelease.',
    'Release asset is empty: CHMReaderLight-mac-arm64.zip',
    'Release asset is not uploaded: CHMReaderLight-mac-arm64.zip.sha256 (state: new)',
    'Release asset size mismatch for CHMReaderLight-mac-arm64.zip: expected 128 bytes, found 0.',
    `Release asset digest mismatch for CHMReaderLight-mac-x64.zip: expected sha256:${'a'.repeat(64)}, found sha256:${'b'.repeat(64)}.`,
  ]);
});

test('verifyLiveReleaseAssets accepts strict metadata for the requested published tag', () => {
  const tag = 'v0.1.0';
  const expectedAssetSnapshots = Object.fromEntries(
    EXPECTED_LIVE_RELEASE_ASSETS.map((name) => [name, { size: 128, sha256: 'a'.repeat(64) }]),
  );
  const errors = verifyLiveReleaseAssets({
    tag_name: tag,
    draft: false,
    prerelease: false,
    assets: EXPECTED_LIVE_RELEASE_ASSETS.map((name) => ({
      name,
      size: 128,
      state: 'uploaded',
      digest: `sha256:${'a'.repeat(64)}`,
      browser_download_url: `https://github.com/zhongdiandaoda/chm-reader-light/releases/download/${tag}/${name}`,
    })),
  }, { expectedTag: tag, requirePublishedMetadata: true, expectedAssetSnapshots });

  assert.deepEqual(errors, []);
});

test('verifyLiveReleaseHtml reports an empty public release page', () => {
  const errors = verifyLiveReleaseHtml('<h2>There aren’t any releases here</h2>');

  assert.deepEqual(errors, [
    'No latest public GitHub Release was found for zhongdiandaoda/chm-reader-light.',
  ]);
});

test('parseLiveReleaseHtml extracts visible macOS release assets', () => {
  const parsedRelease = parseLiveReleaseHtml(`
    <a href="/downloads/CHMReaderLight-mac-arm64.zip">CHMReaderLight-mac-arm64.zip</a>
    <a href="/downloads/CHMReaderLight-mac-arm64.zip.sha256">CHMReaderLight-mac-arm64.zip.sha256</a>
    <a href="/downloads/CHMReaderLight-mac-universal.zip">CHMReaderLight-mac-universal.zip</a>
  `);

  const errors = verifyLiveReleaseAssets(parsedRelease);

  assert.deepEqual(errors, [
    'Missing latest release asset: CHMReaderLight-mac-x64.zip',
    'Missing latest release asset: CHMReaderLight-mac-x64.zip.sha256',
    'Unexpected latest release macOS asset: CHMReaderLight-mac-universal.zip',
  ]);
});

test('formatLiveReleaseRemediation points maintainers to the safe publish helper', () => {
  assert.deepEqual(formatLiveReleaseRemediation(), [
    'npm run package:mac:arm64',
    'npm run package:mac:x64',
    'npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>',
    'npm run check:release-artifacts -- <release-dir>',
    'npm run publish:release -- --release-dir <release-dir>',
    'GITHUB_TOKEN=repo_contents_token npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm',
    'Create or update a non-draft GitHub Release with:',
    '  - CHMReaderLight-mac-arm64.zip',
    '  - CHMReaderLight-mac-arm64.zip.sha256',
    '  - CHMReaderLight-mac-x64.zip',
    '  - CHMReaderLight-mac-x64.zip.sha256',
    'Run npm run check:remote-release again before sharing download links.',
  ]);
});

test('parseLiveRepositoryHtml extracts GitHub sidebar fallback metadata', () => {
  const sidebarAbout = {
    topics: [],
    stargazerCount: 0,
    watcherCount: 0,
    watch: {
      watchData: {
        subscribableThreadTypes: [
          { name: 'Issue', enabled: true },
          { name: 'Discussion', enabled: false },
        ],
      },
    },
  };
  const html = `
    <script type="application/json" data-target="react-app.embeddedData">
      ${JSON.stringify({ payload: { sidebarAbout } })}
    </script>
    <span>No description, website, or topics provided.</span>
  `;

  const repository = parseLiveRepositoryHtml(html);
  const errors = compareListing({
    description: 'A lightweight offline CHM reader and library for macOS',
    homepage: 'https://github.com/zhongdiandaoda/chm-reader-light#readme',
    topics: new Set(['chm', 'macos']),
  }, repository);

  assert.equal(repository.stargazerCount, 0);
  assert.equal(repository.watcherCount, 0);
  assert.deepEqual(errors, [
    'description expected "A lightweight offline CHM reader and library for macOS", found "".',
    'homepage expected "https://github.com/zhongdiandaoda/chm-reader-light#readme", found "".',
    'topics missing from live repository: chm, macos.',
    'has_discussions expected true, found false.',
  ]);
});

test('compareListing fails closed when public HTML cannot prove required fields', () => {
  const errors = compareListing({
    description: 'A lightweight offline CHM reader and library for macOS',
    homepage: 'https://github.com/zhongdiandaoda/chm-reader-light#readme',
    topics: new Set(['chm']),
  }, {
    topics: ['chm'],
    stargazerCount: 1,
    watcherCount: 1,
  });

  assert.deepEqual(errors, [
    'description could not be verified from the live repository response.',
    'homepage could not be verified from the live repository response.',
    'has_discussions could not be verified from the live repository response.',
  ]);
});

test('formatGrowthMetricsSnapshot prints a tracker-ready baseline', () => {
  const output = formatGrowthMetricsSnapshot({
    date: '2026-09-04',
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    source: 'GitHub API',
    stars: 3,
    watchers: 2,
    releaseDownloads: 7,
    releaseVersion: 'v0.1.0',
    listingUrl: 'https://github.com/zhongdiandaoda/chm-reader-light',
    releaseUrl: 'https://github.com/zhongdiandaoda/chm-reader-light/releases/tag/v0.1.0',
  });

  assert.match(output, /Growth metrics snapshot/);
  assert.match(output, /Source: GitHub API/);
  assert.match(output, /Stars: 3/);
  assert.match(output, /Downloads: 7/);
  assert.match(output, /Watchers: 2/);
  assert.match(output, /Release: v0.1.0/);
  assert.match(output, /Tracker baseline: 3 stars \/ 7 downloads \/ 2 watchers/);
});

test('formatLocalIsoDate uses the local calendar date', () => {
  assert.equal(formatLocalIsoDate(new Date(2026, 8, 4, 1, 30, 0)), '2026-09-04');
});

test('buildHtmlFallbackSnapshot captures public GitHub baseline metrics', () => {
  const sidebarAbout = {
    topics: [],
    stargazerCount: 0,
    watcherCount: 0,
    sections: {
      releases: {
        releaseCount: 0,
      },
    },
    watch: {
      watchData: {
        subscribableThreadTypes: [
          { name: 'Discussion', enabled: false },
        ],
      },
    },
  };
  const repositoryHtml = `
    <script type="application/json" data-target="react-app.embeddedData">
      ${JSON.stringify({ payload: { sidebarAbout } })}
    </script>
    <span>No description, website, or topics provided.</span>
  `;
  const releaseHtml = '<h2>There aren’t any releases here</h2>';

  const snapshot = buildHtmlFallbackSnapshot({
    date: '2026-09-04',
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    repositoryHtml,
    releaseHtml,
  });

  assert.deepEqual(snapshot, {
    date: '2026-09-04',
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    source: 'GitHub HTML fallback',
    stars: 0,
    watchers: 0,
    releaseDownloads: 'unavailable via HTML fallback',
    releaseVersion: 'no public release',
    listingUrl: 'https://github.com/zhongdiandaoda/chm-reader-light',
    releaseUrl: 'https://github.com/zhongdiandaoda/chm-reader-light/releases/latest',
  });
});

test('formatVisibilityReadinessSnapshot prints blockers, baseline, and next actions', () => {
  const output = formatVisibilityReadinessSnapshot({
    date: '2026-09-04',
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    listing: {
      source: 'GitHub API',
      errors: [
        'description expected "A lightweight offline CHM reader and library for macOS", found "".',
        'has_discussions expected true, found false.',
      ],
      remediation: [
        'gh repo edit zhongdiandaoda/chm-reader-light --description "A lightweight offline CHM reader and library for macOS"',
        'Enable Discussions in https://github.com/zhongdiandaoda/chm-reader-light/settings',
      ],
    },
    release: {
      source: 'GitHub API',
      errors: [
        'No latest public GitHub Release was found for zhongdiandaoda/chm-reader-light.',
      ],
      remediation: [
        'npm run package:mac:arm64',
        'Create or update a non-draft GitHub Release with:',
        '  - CHMReaderLight-mac-arm64.zip',
      ],
    },
    growth: {
      source: 'GitHub API',
      stars: 0,
      releaseDownloads: 0,
      watchers: 0,
      releaseVersion: 'no public release',
    },
  });

  assert.match(output, /Visibility readiness snapshot/);
  assert.match(output, /Status: blocked/);
  assert.match(output, /Listing audit: failed \(GitHub API\)/);
  assert.match(output, /description expected "A lightweight offline CHM reader and library for macOS", found ""\./);
  assert.match(output, /gh repo edit zhongdiandaoda\/chm-reader-light --description/);
  assert.match(output, /Release audit: failed \(GitHub API\)/);
  assert.match(output, /No latest public GitHub Release was found/);
  assert.match(output, /Tracker baseline: 0 stars \/ 0 downloads \/ 0 watchers/);
  assert.match(output, /Rerun npm run snapshot:visibility before opening a visibility-push issue/);
});

test('settleVisibilityAudits preserves successful evidence when one remote audit times out', async () => {
  const report = await settleVisibilityAudits({
    date: '2026-09-07',
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    listingPromise: Promise.resolve({
      source: 'GitHub HTML fallback',
      errors: [],
      remediation: [],
    }),
    releasePromise: Promise.reject(new Error('GitHub HTML request timed out after 15 seconds.')),
    growthPromise: Promise.resolve({
      source: 'GitHub HTML fallback',
      stars: 0,
      releaseDownloads: 'unavailable via HTML fallback',
      watchers: 0,
      releaseVersion: 'no public release',
    }),
  });

  assert.deepEqual(report.listing, {
    source: 'GitHub HTML fallback',
    errors: [],
    remediation: [],
  });
  assert.deepEqual(report.release, {
    source: 'unavailable',
    errors: ['Release audit unavailable: GitHub HTML request timed out after 15 seconds.'],
    remediation: [
      'Set GITHUB_TOKEN and rerun npm run snapshot:visibility.',
      'Verify https://github.com/zhongdiandaoda/chm-reader-light/releases/latest in a browser.',
    ],
  });
  assert.equal(report.growth.stars, 0);

  const output = formatVisibilityReadinessSnapshot(report);
  assert.match(output, /Status: blocked/);
  assert.match(output, /Listing audit: passed \(GitHub HTML fallback\)/);
  assert.match(output, /Release audit: failed \(unavailable\)/);
  assert.match(output, /Release audit unavailable: GitHub HTML request timed out after 15 seconds./);
  assert.match(output, /Restore access to GitHub release state before publishing/);
  assert.doesNotMatch(output, /Publish or repair the latest public GitHub Release/);
  assert.match(output, /Tracker baseline: 0 stars \/ unavailable via HTML fallback downloads \/ 0 watchers/);
});

test('settleVisibilityAudits blocks promotion when growth metrics are unavailable', async () => {
  const report = await settleVisibilityAudits({
    date: '2026-09-07',
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    listingPromise: Promise.resolve({ source: 'GitHub API', errors: [], remediation: [] }),
    releasePromise: Promise.resolve({ source: 'GitHub API', errors: [], remediation: [] }),
    growthPromise: Promise.reject(new Error('GitHub API request timed out after 15 seconds.')),
  });

  assert.deepEqual(report.growth, {
    source: 'unavailable',
    errors: ['Growth snapshot unavailable: GitHub API request timed out after 15 seconds.'],
    stars: 'unavailable',
    releaseDownloads: 'unavailable',
    watchers: 'unavailable',
    releaseVersion: 'unavailable',
    listingUrl: 'https://github.com/zhongdiandaoda/chm-reader-light',
    releaseUrl: 'https://github.com/zhongdiandaoda/chm-reader-light/releases/latest',
  });

  const output = formatVisibilityReadinessSnapshot(report);
  assert.match(output, /Status: blocked/);
  assert.match(output, /Growth audit: failed \(unavailable\)/);
  assert.match(output, /Growth blockers:\n- Growth snapshot unavailable:/);
  assert.match(output, /Restore access to GitHub metrics/);
  assert.doesNotMatch(extractGrowthBaseline(output), /Growth snapshot unavailable/);
});

test('parsePrepareVisibilityIssueArgs defaults to a reusable visibility issue draft', () => {
  assert.deepEqual(parsePrepareVisibilityIssueArgs(['node', 'scripts/prepare-visibility-issue.js']), {
    assets: undefined,
    audience: undefined,
    followUp: undefined,
    snapshotFile: undefined,
  });
});

test('parsePrepareVisibilityIssueArgs accepts explicit issue field values', () => {
  assert.deepEqual(parsePrepareVisibilityIssueArgs([
    'node',
    'scripts/prepare-visibility-issue.js',
    '--snapshot-file',
    'dist/visibility.txt',
    '--audience=macOS app directory',
    '--assets',
    'docs/share-kit.md short copy',
    '--follow-up',
    'Recheck on 2026-09-11 and add metrics to the visibility issue.',
  ]), {
    assets: 'docs/share-kit.md short copy',
    audience: 'macOS app directory',
    followUp: 'Recheck on 2026-09-11 and add metrics to the visibility issue.',
    snapshotFile: 'dist/visibility.txt',
  });
});

test('parsePrepareVisibilityIssueArgs rejects missing option values', () => {
  assert.throws(
    () => parsePrepareVisibilityIssueArgs(['node', 'scripts/prepare-visibility-issue.js', '--audience', '--assets', 'copy']),
    /--audience requires a value\./,
  );
  assert.throws(
    () => parsePrepareVisibilityIssueArgs(['node', 'scripts/prepare-visibility-issue.js', '--snapshot-file=']),
    /--snapshot-file requires a file path\./,
  );
});

test('buildVisibilityIssuePlan turns the readiness snapshot into issue-form fields', () => {
  const snapshotText = [
    'Visibility readiness snapshot',
    'Date: 2026-09-04',
    'Repository: zhongdiandaoda/chm-reader-light',
    'Status: ready',
    '',
    'Listing audit: passed (GitHub API)',
    'Listing blockers: none',
    '',
    'Release audit: passed (GitHub API)',
    'Release blockers: none',
    '',
    'Growth baseline:',
    '- Source: GitHub API',
    '- Stars: 3',
    '- Downloads: 7',
    '- Watchers: 2',
    '- Release: v0.1.0',
    '- Tracker baseline: 3 stars / 7 downloads / 2 watchers',
    '',
    'Next actions:',
    '- Open a Visibility push issue, paste this snapshot, and schedule the seven-day follow-up.',
  ].join('\n');

  const plan = buildVisibilityIssuePlan({
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    snapshotText,
    audience: 'macOS open-source app directory',
    assets: 'docs/share-kit.md short copy plus docs/assets/social-preview.png',
  });

  assert.equal(plan.title, '[Visibility]: macOS open-source app directory');
  assert.equal(plan.followUp, 'Recheck on 2026-09-11 and add stars, downloads, watchers, support issues, Discussions, and listing status to this issue.');
  assert.match(plan.issueUrl, /template=visibility_push\.yml/);
  assert.equal(new URL(plan.issueUrl).searchParams.get('title'), '[Visibility]: macOS open-source app directory');
  assert.equal(new URL(plan.issueUrl).searchParams.has('body'), false);
  assert.match(plan.issueBody, /## Which visibility channel or audience is this for\?/);
  assert.match(plan.issueBody, /macOS open-source app directory/);
  assert.match(plan.issueBody, /## What live readiness checks passed\?/);
  assert.match(plan.issueBody, /```text\nVisibility readiness snapshot/);
  assert.match(plan.issueBody, /## What baseline metrics are recorded\?/);
  assert.match(plan.issueBody, /Tracker baseline: 3 stars \/ 7 downloads \/ 2 watchers/);
  assert.match(plan.issueBody, /docs\/assets\/social-preview\.png/);
  assert.match(plan.issueBody, /Recheck on 2026-09-11/);
});

test('extractGrowthBaseline keeps issue metrics compact and dated', () => {
  const baseline = extractGrowthBaseline([
    'Visibility readiness snapshot',
    'Date: 2026-09-04',
    'Repository: zhongdiandaoda/chm-reader-light',
    'Status: blocked',
    '',
    'Growth baseline:',
    '- Source: GitHub HTML fallback',
    '- Stars: 0',
    '- Downloads: unavailable via HTML fallback',
    '- Watchers: 0',
    '- Release: no public release',
    '- Tracker baseline: 0 stars / unavailable via HTML fallback downloads / 0 watchers',
    '',
    'Next actions:',
    '- Rerun npm run snapshot:visibility before opening a visibility-push issue.',
  ].join('\n'));

  assert.equal(baseline, [
    'Date: 2026-09-04',
    'Repository: zhongdiandaoda/chm-reader-light',
    'Status: blocked',
    '- Source: GitHub HTML fallback',
    '- Stars: 0',
    '- Downloads: unavailable via HTML fallback',
    '- Watchers: 0',
    '- Release: no public release',
    '- Tracker baseline: 0 stars / unavailable via HTML fallback downloads / 0 watchers',
  ].join('\n'));
});

test('formatVisibilityIssuePlan prints a ready-to-file draft without opening GitHub', () => {
  const output = formatVisibilityIssuePlan({
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    issueUrl: 'https://github.com/zhongdiandaoda/chm-reader-light/issues/new?template=visibility_push.yml',
    title: '[Visibility]: macOS directory',
    audience: 'macOS directory',
    readiness: 'Visibility readiness snapshot\nStatus: ready',
    baseline: 'Tracker baseline: 3 stars / 7 downloads / 2 watchers',
    assets: 'docs/share-kit.md',
    followUp: 'Recheck on 2026-09-11.',
    issueBody: '## Which visibility channel or audience is this for?\n\nmacOS directory',
  });

  assert.match(output, /Visibility issue draft/);
  assert.match(output, /Repository: zhongdiandaoda\/chm-reader-light/);
  assert.match(output, /Title: \[Visibility\]: macOS directory/);
  assert.match(output, /Issue URL:/);
  assert.match(output, /Copyable issue body:/);
  assert.match(output, /GitHub issue forms may not prefill custom fields from URL parameters/);
});

test('parsePrepareSharePostArgs defaults to a social post draft', () => {
  assert.deepEqual(parsePrepareSharePostArgs(['node', 'scripts/prepare-share-post.js']), {
    audience: '<audience>',
    baselineFile: undefined,
    channel: '<channel name>',
    variant: 'social',
  });
});

test('parsePrepareSharePostArgs accepts channel, audience, variant, and baseline overrides', () => {
  assert.deepEqual(parsePrepareSharePostArgs([
    'node',
    'scripts/prepare-share-post.js',
    '--channel',
    'MacAdmins Slack',
    '--audience=macOS admins with old CHM manuals',
    '--variant',
    'release',
    '--baseline-file',
    'dist/growth.txt',
  ]), {
    audience: 'macOS admins with old CHM manuals',
    baselineFile: 'dist/growth.txt',
    channel: 'MacAdmins Slack',
    variant: 'release',
  });
});

test('parsePrepareSharePostArgs rejects missing and invalid values', () => {
  assert.throws(
    () => parsePrepareSharePostArgs(['node', 'scripts/prepare-share-post.js', '--channel', '--variant', 'social']),
    /--channel requires a value\./,
  );
  assert.throws(
    () => parsePrepareSharePostArgs(['node', 'scripts/prepare-share-post.js', '--variant=thread']),
    /--variant must be social or release\./,
  );
  assert.throws(
    () => parsePrepareSharePostArgs(['node', 'scripts/prepare-share-post.js', '--baseline-file=']),
    /--baseline-file requires a file path\./,
  );
});

test('extractShareKitCopy reads release and social post templates', () => {
  const copy = extractShareKitCopy(`
## Short Description

A lightweight offline CHM reader and library for macOS.

## Longer Project Copy

CHMReaderLight keeps local CHM manuals searchable.

## Release Announcement Template

\`\`\`text
CHMReaderLight <version> is available now.
\`\`\`

## Social Post Template

\`\`\`text
CHMReaderLight helps macOS users keep offline CHM manuals searchable and organized.
\`\`\`
  `);

  assert.deepEqual(copy, {
    shortDescription: 'A lightweight offline CHM reader and library for macOS.',
    longDescription: 'CHMReaderLight keeps local CHM manuals searchable.',
    releaseAnnouncement: 'CHMReaderLight <version> is available now.',
    socialPost: 'CHMReaderLight helps macOS users keep offline CHM manuals searchable and organized.',
  });
});

test('buildSharePostDraft creates a baseline-aware social draft', () => {
  const plan = buildSharePostDraft({
    shareKit: fs.readFileSync(path.join(process.cwd(), 'docs', 'share-kit.md'), 'utf-8'),
    packageJson: {
      version: '0.2.0',
      repository: {
        url: 'git+https://github.com/zhongdiandaoda/chm-reader-light.git',
      },
    },
    baselineText: [
      'Growth metrics snapshot',
      'Date: 2026-09-04',
      'Repository: zhongdiandaoda/chm-reader-light',
      'Stars: 3',
      'Downloads: 7',
      'Watchers: 2',
      'Release: v0.2.0',
      'Tracker baseline: 3 stars / 7 downloads / 2 watchers',
    ].join('\n'),
    options: {
      audience: 'macOS developers with archived SDK docs',
      channel: 'MacAdmins Slack',
      variant: 'social',
    },
  });

  assert.equal(plan.repositorySlug, 'zhongdiandaoda/chm-reader-light');
  assert.equal(plan.channel, 'MacAdmins Slack');
  assert.equal(plan.audience, 'macOS developers with archived SDK docs');
  assert.equal(plan.variant, 'social');
  assert.equal(plan.version, 'v0.2.0');
  assert.equal(plan.baseline.trackerBaseline, '3 stars / 7 downloads / 2 watchers');
  assert.match(plan.postText, /CHMReaderLight helps macOS users keep offline CHM manuals searchable and organized/);
  assert.match(plan.trackerNote, /2026-09-04: prepared social share draft for MacAdmins Slack/);
});

test('buildSharePostDraft creates a release draft without leaving placeholders', () => {
  const plan = buildSharePostDraft({
    shareKit: fs.readFileSync(path.join(process.cwd(), 'docs', 'share-kit.md'), 'utf-8'),
    packageJson: {
      version: '0.2.0',
      repository: {
        url: 'git+https://github.com/zhongdiandaoda/chm-reader-light.git',
      },
    },
    options: {
      audience: 'macOS users evaluating offline CHM readers',
      channel: 'GitHub Release',
      variant: 'release',
    },
  });

  assert.equal(plan.version, 'v0.2.0');
  assert.doesNotMatch(plan.postText, /<version>|<user-facing feature or fix>|<compatibility, search, library, security, or packaging improvement>|<known limitation or upgrade note/);
  assert.match(plan.postText, /CHMReaderLight v0\.2\.0 is available now\./);
  assert.match(plan.postText, /Library-first CHM management for local manuals and SDK docs\./);
  assert.match(plan.postText, /Current release builds are not Apple-notarized yet/);
});

test('formatSharePostDraft prints copy and safety reminders', () => {
  const output = formatSharePostDraft({
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    channel: 'MacAdmins Slack',
    audience: 'macOS admins',
    variant: 'social',
    version: 'v0.2.0',
    baseline: {
      date: '2026-09-04',
      trackerBaseline: '3 stars / 7 downloads / 2 watchers',
    },
    postText: 'CHMReaderLight helps macOS users keep offline CHM manuals searchable and organized.',
    trackerNote: '2026-09-04: prepared social share draft for MacAdmins Slack with baseline 3 stars / 7 downloads / 2 watchers',
  });

  assert.match(output, /Share post draft/);
  assert.match(output, /Channel: MacAdmins Slack/);
  assert.match(output, /Audience: macOS admins/);
  assert.match(output, /Copyable post:/);
  assert.match(output, /CHMReaderLight helps macOS users/);
  assert.match(output, /Tracker note:/);
  assert.match(output, /prepared social share draft/);
  assert.match(output, /Do not post until npm run snapshot:visibility reports ready/);
});

test('buildRepositoryListingUpdate plans metadata and topic updates', () => {
  const expected = {
    description: 'A lightweight offline CHM reader and library for macOS',
    homepage: 'https://github.com/zhongdiandaoda/chm-reader-light#readme',
    topics: new Set(['chm', 'macos', 'reader']),
  };

  const update = buildRepositoryListingUpdate(expected, {
    description: '',
    homepage: '',
    has_discussions: false,
    topics: ['reader'],
  });

  assert.deepEqual(update, {
    metadataPatch: {
      description: 'A lightweight offline CHM reader and library for macOS',
      homepage: 'https://github.com/zhongdiandaoda/chm-reader-light#readme',
      has_discussions: true,
    },
    missingTopics: ['chm', 'macos'],
    topics: ['chm', 'macos', 'reader'],
  });
});

test('formatRepositoryListingApplyPlan defaults to a safe dry run', () => {
  const expected = {
    description: 'A lightweight offline CHM reader and library for macOS',
    homepage: 'https://github.com/zhongdiandaoda/chm-reader-light#readme',
    topics: new Set(['chm']),
  };
  const repository = {
    description: '',
    homepage: '',
    has_discussions: false,
    topics: [],
  };
  const update = buildRepositoryListingUpdate(expected, repository);
  const output = formatRepositoryListingApplyPlan({
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    expected,
    repository,
    update,
    confirmed: false,
  });

  assert.match(output, /Repository listing apply plan/);
  assert.match(output, /Mode: dry run/);
  assert.match(output, /Source: GitHub API/);
  assert.match(output, /PATCH \/repos\/zhongdiandaoda\/chm-reader-light/);
  assert.match(output, /description: A lightweight offline CHM reader and library for macOS/);
  assert.match(output, /has_discussions: true/);
  assert.match(output, /PUT \/repos\/zhongdiandaoda\/chm-reader-light\/topics/);
  assert.match(output, /add topics: chm/);
  assert.match(output, /GITHUB_TOKEN and rerun `npm run apply:repository-listing -- --confirm`/);
});

test('buildRepositoryListingUpdate skips repository fields that HTML fallback cannot prove', () => {
  const expected = {
    description: 'A lightweight offline CHM reader and library for macOS',
    homepage: 'https://github.com/zhongdiandaoda/chm-reader-light#readme',
    topics: new Set(['chm', 'macos']),
  };

  const update = buildRepositoryListingUpdate(expected, {
    topics: ['chm'],
    stargazerCount: 1,
    watcherCount: 1,
  });

  assert.deepEqual(update, {
    metadataPatch: {},
    missingTopics: ['macos'],
    topics: ['chm', 'macos'],
  });
});

test('normalizeTopics deduplicates and sorts repository topics', () => {
  assert.deepEqual(normalizeTopics(['reader', 'chm', 'reader', 'macos']), ['chm', 'macos', 'reader']);
});

test('parsePublishReleaseArgs defaults to a dry-run release plan', () => {
  assert.deepEqual(parsePublishReleaseArgs(['node', 'scripts/publish-release.js']), {
    confirmed: false,
    releaseDir: 'dist',
    tag: undefined,
    targetCommitish: undefined,
  });
});

test('parsePublishReleaseArgs accepts explicit release directory, tag, target commit, and confirmation', () => {
  assert.deepEqual(parsePublishReleaseArgs([
    'node',
    'scripts/publish-release.js',
    '--release-dir',
    'dist/releases',
    '--tag=v0.2.0',
    '--target-commitish',
    '0123456789abcdef',
    '--confirm',
  ]), {
    confirmed: true,
    releaseDir: 'dist/releases',
    tag: 'v0.2.0',
    targetCommitish: '0123456789abcdef',
  });
});

test('parsePublishReleaseArgs rejects missing option values', () => {
  assert.throws(
    () => parsePublishReleaseArgs(['node', 'scripts/publish-release.js', '--release-dir', '--confirm']),
    /--release-dir requires a value\./,
  );
  assert.throws(
    () => parsePublishReleaseArgs(['node', 'scripts/publish-release.js', '--tag=']),
    /--tag requires a release tag\./,
  );
  assert.throws(
    () => parsePublishReleaseArgs(['node', 'scripts/publish-release.js', '--target-commitish=']),
    /--target-commitish requires a commit or branch/,
  );
});

test('validateReleaseTag matches the workflow semantic-version contract', () => {
  assert.doesNotThrow(() => validateReleaseTag('v0.2.0', '0.2.0'));
  assert.throws(() => validateReleaseTag('release-0.2.0', '0.2.0'), /vMAJOR\.MINOR\.PATCH/);
  assert.throws(() => validateReleaseTag('v0.3.0', '0.2.0'), /does not match package version v0\.2\.0/);
});

test('buildReleaseBody replaces template version placeholders with the release tag', () => {
  const template = extractReleaseBodyTemplate(`
## Copyable Release Body

\`\`\`markdown
# CHMReaderLight v<version>

Download CHMReaderLight v<version> below.

[Install guide](./install-macos.md)
\`\`\`
  `);

  assert.equal(
    buildReleaseBody({ releaseTemplate: template, tag: 'v0.2.0' }),
    [
      '# CHMReaderLight v0.2.0',
      '',
      'Download CHMReaderLight v0.2.0 below.',
      '',
      '[Install guide](https://github.com/zhongdiandaoda/chm-reader-light/blob/v0.2.0/docs/install-macos.md)',
    ].join('\n'),
  );
});

test('buildReleaseBody links release artifacts to the selected tag', () => {
  const releaseBody = buildReleaseBody({
    releaseTemplate: [
      '## Download',
      '',
      '- Apple Silicon: `CHMReaderLight-mac-arm64.zip`',
      '- Intel: `CHMReaderLight-mac-x64.zip`',
      '- Checksums: `CHMReaderLight-mac-arm64.zip.sha256` and `CHMReaderLight-mac-x64.zip.sha256`',
    ].join('\n'),
    tag: 'v0.2.0',
  });

  assert.equal(
    releaseBody,
    [
      '## Download',
      '',
      '- Apple Silicon: [CHMReaderLight-mac-arm64.zip](https://github.com/zhongdiandaoda/chm-reader-light/releases/download/v0.2.0/CHMReaderLight-mac-arm64.zip)',
      '- Intel: [CHMReaderLight-mac-x64.zip](https://github.com/zhongdiandaoda/chm-reader-light/releases/download/v0.2.0/CHMReaderLight-mac-x64.zip)',
      '- Checksums: [CHMReaderLight-mac-arm64.zip.sha256](https://github.com/zhongdiandaoda/chm-reader-light/releases/download/v0.2.0/CHMReaderLight-mac-arm64.zip.sha256) and [CHMReaderLight-mac-x64.zip.sha256](https://github.com/zhongdiandaoda/chm-reader-light/releases/download/v0.2.0/CHMReaderLight-mac-x64.zip.sha256)',
    ].join('\n'),
  );
});

test('extractReleaseBodyTemplate preserves fenced commands inside the release body', () => {
  const template = extractReleaseBodyTemplate(`
## Copyable Release Body

\`\`\`\`markdown
# CHMReaderLight v<version>

\`\`\`bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
\`\`\`

## First Launch Note
Allow CHMReaderLight in System Settings.
\`\`\`\`
  `);

  assert.match(template, /shasum -a 256/);
  assert.match(template, /## First Launch Note/);
  assert.match(template, /System Settings/);
});

test('repository release template renders a complete tag-specific release body', () => {
  const releaseTemplateMarkdown = fs.readFileSync(
    path.join(__dirname, '..', 'docs', 'release-template.md'),
    'utf-8',
  );
  const releaseBody = buildReleaseBody({
    releaseTemplate: extractReleaseBodyTemplate(releaseTemplateMarkdown),
    tag: 'v0.2.0',
  });

  assert.match(releaseBody, /^# CHMReaderLight v0\.2\.0/);
  assert.match(releaseBody, /shasum -a 256 -c CHMReaderLight-mac-x64\.zip\.sha256/);
  assert.match(releaseBody, /gh attestation verify CHMReaderLight-mac-arm64\.zip/);
  assert.match(releaseBody, /## First Launch Note/);
  assert.match(releaseBody, /## What to Try/);
  for (const assetName of [
    'CHMReaderLight-mac-arm64.zip',
    'CHMReaderLight-mac-arm64.zip.sha256',
    'CHMReaderLight-mac-x64.zip',
    'CHMReaderLight-mac-x64.zip.sha256',
  ]) {
    assert.ok(
      releaseBody.includes(
        `[${assetName}](https://github.com/zhongdiandaoda/chm-reader-light/releases/download/v0.2.0/${assetName})`,
      ),
      `Expected a tag-specific download link for ${assetName}.`,
    );
  }
  assert.ok(
    releaseBody.includes('https://github.com/zhongdiandaoda/chm-reader-light/blob/v0.2.0/docs/privacy.md'),
  );
  assert.doesNotMatch(releaseBody, /v<version>|\]\(\.\//);
  assert.doesNotMatch(releaseBody, /List benchmark-backed|List keyboard, VoiceOver/);
  assert.doesNotMatch(releaseBody, /\n{3,}/);
});

test('parsePrepareReleaseBodyArgs accepts an explicit tag and output path', () => {
  assert.deepEqual(parsePrepareReleaseBodyArgs([
    'node',
    'scripts/prepare-release-body.js',
    '--tag',
    'v0.2.0',
    '--output=dist/release/release-body.md',
  ]), {
    output: 'dist/release/release-body.md',
    tag: 'v0.2.0',
  });
});

test('writeReleaseBody creates a complete release body in a new output directory', () => {
  const rootDir = makeTempReleaseDir();
  const outputPath = path.join(rootDir, 'nested', 'release-body.md');
  const body = writeReleaseBody({
    outputPath,
    releaseTemplateMarkdown: [
      '## Copyable Release Body',
      '',
      '````markdown',
      '# CHMReaderLight v<version>',
      '',
      '[Install guide](./install-macos.md)',
      '````',
    ].join('\n'),
    tag: 'v0.2.0',
  });

  assert.equal(fs.readFileSync(outputPath, 'utf-8'), `${body}\n`);
  assert.match(body, /^# CHMReaderLight v0\.2\.0/);
  assert.ok(body.includes('/blob/v0.2.0/docs/install-macos.md'));
});

test('buildReleasePublishPlan includes the release payload and expected upload assets', () => {
  const releaseDir = makeTempReleaseDir();
  for (const artifactName of EXPECTED_RELEASE_ARTIFACTS) {
    writeArtifactWithChecksum(releaseDir, artifactName, `${artifactName} bytes`);
  }
  const plan = buildReleasePublishPlan({
    packageJson: {
      version: '0.2.0',
      repository: {
        url: 'git+https://github.com/zhongdiandaoda/chm-reader-light.git',
      },
    },
    releaseDir,
    tag: 'v0.2.0',
    targetCommitish: '0123456789abcdef',
    artifactErrors: [],
    releaseBody: '# CHMReaderLight v0.2.0',
  });

  assert.equal(plan.repositorySlug, 'zhongdiandaoda/chm-reader-light');
  assert.equal(plan.tag, 'v0.2.0');
  assert.equal(plan.targetCommitish, '0123456789abcdef');
  assert.equal(plan.releaseName, 'CHMReaderLight v0.2.0');
  assert.equal(plan.releaseDir, releaseDir);
  assert.deepEqual(plan.assets.map((assetPath) => path.basename(assetPath)), [
    'CHMReaderLight-mac-arm64.zip',
    'CHMReaderLight-mac-arm64.zip.sha256',
    'CHMReaderLight-mac-x64.zip',
    'CHMReaderLight-mac-x64.zip.sha256',
  ]);
  assert.deepEqual(plan.assetSnapshots.map(({ path: assetPath, size, sha256 }) => ({
    name: path.basename(assetPath),
    size,
    sha256,
  })), plan.assets.map((assetPath) => {
    const contents = fs.readFileSync(assetPath);
    return {
      name: path.basename(assetPath),
      size: contents.length,
      sha256: crypto.createHash('sha256').update(contents).digest('hex'),
    };
  }));
  assert.equal(plan.releaseBody, '# CHMReaderLight v0.2.0');
});

test('buildReleasePublishPlan rejects a checksum changed between artifact verification and snapshot capture', () => {
  const releaseDir = makeTempReleaseDir();
  for (const artifactName of EXPECTED_RELEASE_ARTIFACTS) {
    writeArtifactWithChecksum(releaseDir, artifactName, `${artifactName} bytes`);
  }
  fs.writeFileSync(
    path.join(releaseDir, 'CHMReaderLight-mac-arm64.zip.sha256'),
    `${'0'.repeat(64)}  CHMReaderLight-mac-arm64.zip\n`,
  );

  assert.throws(
    () => buildReleasePublishPlan({
      packageJson: {
        version: '0.2.0',
        repository: {
          url: 'git+https://github.com/zhongdiandaoda/chm-reader-light.git',
        },
      },
      releaseDir,
      tag: 'v0.2.0',
      targetCommitish: '0123456789abcdef0123456789abcdef01234567',
      artifactErrors: [],
      releaseBody: '# CHMReaderLight v0.2.0',
    }),
    /snapshot checksum mismatch.*arm64/i,
  );
});

test('formatReleasePublishPlan keeps publishing a confirmed maintainer action', () => {
  const releaseDir = makeTempReleaseDir();
  const output = formatReleasePublishPlan({
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: '0123456789abcdef',
    releaseName: 'CHMReaderLight v0.2.0',
    releaseDir,
    artifactErrors: ['Missing release artifact: CHMReaderLight-mac-arm64.zip'],
    assets: [
      path.join(releaseDir, 'CHMReaderLight-mac-arm64.zip'),
      path.join(releaseDir, 'CHMReaderLight-mac-arm64.zip.sha256'),
    ],
    releaseBody: '# CHMReaderLight v0.2.0',
  }, false);

  assert.match(output, /Release publish plan/);
  assert.match(output, /Repository: zhongdiandaoda\/chm-reader-light/);
  assert.match(output, /Tag: v0\.2\.0/);
  assert.match(output, /Mode: dry run/);
  assert.match(output, /Artifact blockers:/);
  assert.match(output, /Missing release artifact: CHMReaderLight-mac-arm64\.zip/);
  assert.match(output, /POST \/repos\/zhongdiandaoda\/chm-reader-light\/releases/);
  assert.match(output, /tag_name: v0\.2\.0/);
  assert.match(output, /target_commitish: 0123456789abcdef/);
  assert.match(output, /draft: true/);
  assert.match(output, /publish only after every asset upload succeeds/);
  assert.match(output, /Upload assets:/);
  assert.match(output, /CHMReaderLight-mac-arm64\.zip\.sha256/);
  assert.match(output, /set GITHUB_TOKEN, and rerun `npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm`/);
});

test('publishRelease keeps the release private until every asset upload succeeds', async () => {
  const calls = [];
  let tagChecks = 0;
  let releaseReads = 0;
  const plan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: '0123456789abcdef0123456789abcdef01234567',
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: ['/tmp/arm64.zip', '/tmp/x64.zip'],
    assetSnapshots: [
      { path: '/tmp/arm64.zip', size: 1, sha256: 'arm64' },
      { path: '/tmp/x64.zip', size: 1, sha256: 'x64' },
    ],
  };

  const release = await publishRelease(plan, {
    token: 'test-token',
    ensureRemoteTagCommit: async () => plan.targetCommitish,
    resolveRemoteTagCommit: async () => {
      tagChecks += 1;
      return plan.targetCommitish;
    },
    findRelease: async () => undefined,
    requestJson: async (url, options) => {
      calls.push({ type: 'request', url, options });
      if (options?.method === 'POST') {
        return { id: 42, upload_url: 'https://uploads.github.test/assets{?name,label}' };
      }
      if (!options) {
        releaseReads += 1;
        return {
          id: 42,
          draft: releaseReads === 1,
          assets: plan.assets.map((assetPath, index) => ({
            name: path.basename(assetPath),
            size: plan.assetSnapshots[index].size,
            state: 'uploaded',
            digest: `sha256:${plan.assetSnapshots[index].sha256}`,
          })),
        };
      }
      return { id: 42, html_url: 'https://github.test/releases/v0.2.0', draft: false };
    },
    uploadReleaseAsset: async (uploadUrl, assetPath) => {
      calls.push({ type: 'upload', uploadUrl, assetPath });
    },
    verifyAssetSnapshot: () => {},
  });

  assert.equal(calls[0].options.body.draft, true);
  assert.equal(
    calls[0].options.body.target_commitish,
    '0123456789abcdef0123456789abcdef01234567',
  );
  assert.deepEqual(calls.slice(1, 3).map((call) => call.type), ['upload', 'upload']);
  assert.equal(calls[3].options, undefined);
  assert.equal(calls[4].options.method, 'PATCH');
  assert.equal(calls[4].url, 'https://api.github.com/repos/zhongdiandaoda/chm-reader-light/releases/42');
  assert.deepEqual(calls[4].options.body, { draft: false });
  assert.equal(release.draft, false);
  assert.equal(tagChecks, 3);
});

test('publishRelease rejects a release asset changed after the publish plan was built', async () => {
  const releaseDir = makeTempReleaseDir();
  const assetPath = path.join(releaseDir, 'CHMReaderLight-mac-arm64.zip');
  fs.writeFileSync(assetPath, 'verified bytes');
  const verifiedBytes = fs.readFileSync(assetPath);
  const requests = [];
  const plan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: '0123456789abcdef0123456789abcdef01234567',
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: [assetPath],
    assetSnapshots: [{
      path: assetPath,
      size: verifiedBytes.length,
      sha256: crypto.createHash('sha256').update(verifiedBytes).digest('hex'),
    }],
  };
  fs.writeFileSync(assetPath, 'replaced after verification');

  await assert.rejects(
    publishRelease(plan, {
      token: 'test-token',
      resolveRemoteTagCommit: async () => undefined,
      findRelease: async () => undefined,
      requestJson: async (url, options) => {
        requests.push({ url, options });
        return { id: 42, upload_url: 'https://uploads.github.test/assets{?name,label}' };
      },
      uploadReleaseAsset: async () => {},
    }),
    /changed after verification/,
  );

  assert.deepEqual(requests, []);
});

test('publishRelease requires an exact commit SHA before changing GitHub', async () => {
  const requests = [];
  const basePlan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: ['/tmp/arm64.zip'],
    assetSnapshots: [{ path: '/tmp/arm64.zip', size: 1, sha256: 'arm64' }],
  };

  for (const targetCommitish of [undefined, 'main', '0123456789abcdef']) {
    await assert.rejects(
      publishRelease({ ...basePlan, targetCommitish }, {
        token: 'test-token',
        verifyAssetSnapshot: () => {},
        requestJson: async (url, options) => {
          requests.push({ url, options });
        },
      }),
      /full 40-character commit SHA/i,
    );
  }

  assert.deepEqual(requests, []);
});

test('resolveRemoteTagCommit accepts lightweight tags and peels annotated tags', async () => {
  const commitSha = '0123456789abcdef0123456789abcdef01234567';
  const tagObjectSha = '89abcdef0123456789abcdef0123456789abcdef';
  const lightweightUrls = [];
  const lightweightCommit = await resolveRemoteTagCommit(
    'zhongdiandaoda/chm-reader-light',
    'v0.2.0',
    async (url) => {
      lightweightUrls.push(url);
      return { object: { type: 'commit', sha: commitSha } };
    },
  );
  assert.equal(lightweightCommit, commitSha);
  assert.deepEqual(lightweightUrls, [
    'https://api.github.com/repos/zhongdiandaoda/chm-reader-light/git/ref/tags/v0.2.0',
  ]);

  const annotatedUrls = [];
  const annotatedCommit = await resolveRemoteTagCommit(
    'zhongdiandaoda/chm-reader-light',
    'v0.2.0',
    async (url) => {
      annotatedUrls.push(url);
      if (url.endsWith('/git/ref/tags/v0.2.0')) {
        return { object: { type: 'tag', sha: tagObjectSha } };
      }
      return { object: { type: 'commit', sha: commitSha } };
    },
  );
  assert.equal(annotatedCommit, commitSha);
  assert.deepEqual(annotatedUrls, [
    'https://api.github.com/repos/zhongdiandaoda/chm-reader-light/git/ref/tags/v0.2.0',
    `https://api.github.com/repos/zhongdiandaoda/chm-reader-light/git/tags/${tagObjectSha}`,
  ]);
});

test('resolveRemoteTagCommit treats a missing remote tag as safe to create', async () => {
  const error = new Error('Not Found');
  error.statusCode = 404;

  assert.equal(
    await resolveRemoteTagCommit(
      'zhongdiandaoda/chm-reader-light',
      'v0.2.0',
      async () => { throw error; },
    ),
    undefined,
  );
});

test('ensureRemoteTagCommit creates a missing lightweight tag at the exact build commit', async () => {
  const expectedCommit = '0123456789abcdef0123456789abcdef01234567';
  const requests = [];
  let resolutions = 0;

  const commit = await ensureRemoteTagCommit(
    'zhongdiandaoda/chm-reader-light',
    'v0.2.0',
    expectedCommit,
    async (url, options) => {
      requests.push({ url, options });
      return { object: { type: 'commit', sha: expectedCommit } };
    },
    async () => {
      resolutions += 1;
      return resolutions === 1 ? undefined : expectedCommit;
    },
  );

  assert.equal(commit, expectedCommit);
  assert.equal(resolutions, 2);
  assert.deepEqual(requests, [{
    url: 'https://api.github.com/repos/zhongdiandaoda/chm-reader-light/git/refs',
    options: {
      method: 'POST',
      body: { ref: 'refs/tags/v0.2.0', sha: expectedCommit },
    },
  }]);
});

test('ensureRemoteTagCommit rejects a concurrently created tag on another commit', async () => {
  const expectedCommit = '0123456789abcdef0123456789abcdef01234567';
  const actualCommit = 'fedcba9876543210fedcba9876543210fedcba98';
  let resolutions = 0;

  await assert.rejects(
    ensureRemoteTagCommit(
      'zhongdiandaoda/chm-reader-light',
      'v0.2.0',
      expectedCommit,
      async () => {
        const error = new Error('Reference already exists');
        error.statusCode = 422;
        throw error;
      },
      async () => {
        resolutions += 1;
        return resolutions === 1 ? undefined : actualCommit;
      },
    ),
    new RegExp(`existing tag v0\.2\.0 resolves to ${actualCommit}, not ${expectedCommit}`, 'i'),
  );
});

test('publishRelease rejects an existing remote tag on another commit before release mutations', async () => {
  const expectedCommit = '0123456789abcdef0123456789abcdef01234567';
  const actualCommit = 'fedcba9876543210fedcba9876543210fedcba98';
  const calls = [];
  const plan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: expectedCommit,
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: ['/tmp/arm64.zip'],
    assetSnapshots: [{ path: '/tmp/arm64.zip', size: 1, sha256: 'arm64' }],
  };

  await assert.rejects(
    publishRelease(plan, {
      token: 'test-token',
      verifyAssetSnapshot: () => {},
      resolveRemoteTagCommit: async () => actualCommit,
      findRelease: async () => {
        calls.push('find-release');
      },
      requestJson: async () => {
        calls.push('mutate-release');
      },
      uploadReleaseAsset: async () => {
        calls.push('upload');
      },
    }),
    new RegExp(`existing tag v0\.2\.0 resolves to ${actualCommit}, not ${expectedCommit}`, 'i'),
  );

  assert.deepEqual(calls, []);
});

test('publishRelease leaves the release private if its tag moves during asset upload', async () => {
  const expectedCommit = '0123456789abcdef0123456789abcdef01234567';
  const movedCommit = 'fedcba9876543210fedcba9876543210fedcba98';
  const requests = [];
  let tagChecks = 0;
  const plan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: expectedCommit,
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: ['/tmp/arm64.zip'],
    assetSnapshots: [{ path: '/tmp/arm64.zip', size: 1, sha256: 'arm64' }],
  };

  await assert.rejects(
    publishRelease(plan, {
      token: 'test-token',
      verifyAssetSnapshot: () => {},
      ensureRemoteTagCommit: async () => expectedCommit,
      resolveRemoteTagCommit: async () => {
        tagChecks += 1;
        return tagChecks === 1 ? expectedCommit : movedCommit;
      },
      findRelease: async () => undefined,
      requestJson: async (url, options) => {
        requests.push({ url, options });
        return {
          id: 42,
          upload_url: 'https://uploads.github.test/assets{?name,label}',
          draft: true,
        };
      },
      uploadReleaseAsset: async () => {},
    }),
    /tag v0\.2\.0 moved during publishing/i,
  );

  assert.equal(tagChecks, 2);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.method, 'POST');
  assert.equal(requests.some(({ options }) => options.method === 'PATCH'), false);
});

test('uploadReleaseAsset rejects same-inode content changes made after its preflight hash', async () => {
  const releaseDir = makeTempReleaseDir();
  const assetPath = path.join(releaseDir, 'CHMReaderLight-mac-arm64.zip');
  const verifiedBytes = Buffer.from('AAAA');
  fs.writeFileSync(assetPath, verifiedBytes);
  const uploadedChunks = [];

  await assert.rejects(
    uploadReleaseAsset(
      'https://uploads.github.test/assets{?name,label}',
      assetPath,
      {
        token: 'test-token',
        expectedSnapshot: {
          path: assetPath,
          size: verifiedBytes.length,
          sha256: crypto.createHash('sha256').update(verifiedBytes).digest('hex'),
        },
        createReadStream: (streamPath, options) => {
          fs.writeFileSync(streamPath, 'BBBB');
          return fs.createReadStream(streamPath, options);
        },
        requestFactory: (_url, _options, onResponse) => {
          const request = new Writable({
            write(chunk, _encoding, callback) {
              uploadedChunks.push(Buffer.from(chunk));
              callback();
            },
          });
          request.setTimeout = () => request;
          request.on('finish', () => {
            const response = Readable.from(['{}']);
            response.statusCode = 201;
            onResponse(response);
          });
          return request;
        },
      },
    ),
    /changed while it was being uploaded/i,
  );

  assert.equal(Buffer.concat(uploadedChunks).toString(), 'BBBB');
});

test('uploadReleaseAsset accepts bytes that still match the verified snapshot', async () => {
  const releaseDir = makeTempReleaseDir();
  const assetPath = path.join(releaseDir, 'CHMReaderLight-mac-arm64.zip');
  const verifiedBytes = Buffer.from('verified release bytes');
  fs.writeFileSync(assetPath, verifiedBytes);
  const uploadedChunks = [];

  await uploadReleaseAsset(
    'https://uploads.github.test/assets{?name,label}',
    assetPath,
    {
      token: 'test-token',
      expectedSnapshot: {
        path: assetPath,
        size: verifiedBytes.length,
        sha256: crypto.createHash('sha256').update(verifiedBytes).digest('hex'),
      },
      requestFactory: (_url, _options, onResponse) => {
        const request = new Writable({
          write(chunk, _encoding, callback) {
            uploadedChunks.push(Buffer.from(chunk));
            callback();
          },
        });
        request.setTimeout = () => request;
        request.on('finish', () => {
          const response = Readable.from([JSON.stringify({
            name: path.basename(assetPath),
            size: verifiedBytes.length,
            digest: `sha256:${crypto.createHash('sha256').update(verifiedBytes).digest('hex')}`,
          })]);
          response.statusCode = 201;
          onResponse(response);
        });
        return request;
      },
    },
  );

  assert.deepEqual(Buffer.concat(uploadedChunks), verifiedBytes);
});

test('uploadReleaseAsset rejects GitHub asset metadata that does not match uploaded bytes', async () => {
  const releaseDir = makeTempReleaseDir();
  const assetPath = path.join(releaseDir, 'CHMReaderLight-mac-arm64.zip');
  const verifiedBytes = Buffer.from('verified release bytes');
  fs.writeFileSync(assetPath, verifiedBytes);

  await assert.rejects(
    uploadReleaseAsset(
      'https://uploads.github.test/assets{?name,label}',
      assetPath,
      {
        token: 'test-token',
        expectedSnapshot: {
          path: assetPath,
          size: verifiedBytes.length,
          sha256: crypto.createHash('sha256').update(verifiedBytes).digest('hex'),
        },
        requestFactory: (_url, _options, onResponse) => {
          const request = new Writable({ write(_chunk, _encoding, callback) { callback(); } });
          request.setTimeout = () => request;
          request.on('finish', () => {
            const response = Readable.from([JSON.stringify({
              name: path.basename(assetPath),
              size: verifiedBytes.length,
              digest: `sha256:${'0'.repeat(64)}`,
            })]);
            response.statusCode = 201;
            onResponse(response);
          });
          return request;
        },
      },
    ),
    /GitHub asset digest mismatch/i,
  );
});

test('verifyRemoteReleaseAssetSnapshots rejects an incomplete or replaced draft asset set', () => {
  const assets = ['/tmp/arm64.zip', '/tmp/x64.zip'];
  const snapshots = [
    { path: assets[0], size: 10, sha256: 'a'.repeat(64) },
    { path: assets[1], size: 20, sha256: 'b'.repeat(64) },
  ];

  assert.throws(
    () => verifyRemoteReleaseAssetSnapshots({
      draft: true,
      assets: [
        { name: 'arm64.zip', size: 10, state: 'uploaded', digest: `sha256:${'0'.repeat(64)}` },
        { name: 'unexpected.zip', size: 20, state: 'uploaded', digest: `sha256:${'b'.repeat(64)}` },
      ],
    }, assets, snapshots),
    /missing x64[.]zip.*unexpected unexpected[.]zip.*digest mismatch for arm64[.]zip/is,
  );
});

test('publishRelease re-reads the complete server-side asset set before making the draft public', async () => {
  const expectedCommit = '0123456789abcdef0123456789abcdef01234567';
  const publishPatches = [];
  const plan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: expectedCommit,
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: ['/tmp/arm64.zip'],
    assetSnapshots: [{ path: '/tmp/arm64.zip', size: 10, sha256: 'a'.repeat(64) }],
  };

  await assert.rejects(
    publishRelease(plan, {
      token: 'test-token',
      verifyAssetSnapshot: () => {},
      ensureRemoteTagCommit: async () => expectedCommit,
      resolveRemoteTagCommit: async () => expectedCommit,
      findRelease: async () => undefined,
      requestJson: async (_url, options) => {
        if (options?.method === 'POST') {
          return { id: 42, upload_url: 'https://uploads.github.test/assets{?name,label}' };
        }
        if (options?.method === 'PATCH') publishPatches.push(options.body);
        return {
          id: 42,
          draft: true,
          assets: [{
            name: 'arm64.zip',
            size: 10,
            state: 'uploaded',
            digest: `sha256:${'0'.repeat(64)}`,
          }],
        };
      },
      uploadReleaseAsset: async () => {},
    }),
    /digest mismatch for arm64[.]zip/i,
  );

  assert.deepEqual(publishPatches, []);
});

test('publishRelease returns a concurrently changed public release to draft', async () => {
  const expectedCommit = '0123456789abcdef0123456789abcdef01234567';
  const requests = [];
  let releaseReads = 0;
  const plan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: expectedCommit,
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: ['/tmp/arm64.zip'],
    assetSnapshots: [{ path: '/tmp/arm64.zip', size: 10, sha256: 'a'.repeat(64) }],
  };
  const verifiedAsset = {
    name: 'arm64.zip',
    size: 10,
    state: 'uploaded',
    digest: 'sha256:' + 'a'.repeat(64),
  };

  await assert.rejects(publishRelease(plan, {
    token: 'test-token',
    verifyAssetSnapshot: () => {},
    ensureRemoteTagCommit: async () => expectedCommit,
    resolveRemoteTagCommit: async () => expectedCommit,
    findRelease: async () => undefined,
    requestJson: async (url, options) => {
      requests.push({ url, options });
      if (options?.method === 'POST') {
        return { id: 42, upload_url: 'https://uploads.github.test/assets{?name,label}' };
      }
      if (options?.method === 'PATCH') {
        return { id: 42, draft: options.body.draft };
      }
      releaseReads += 1;
      return releaseReads === 1
        ? { id: 42, tag_name: plan.tag, draft: true, assets: [verifiedAsset] }
        : { id: 42, tag_name: plan.tag, draft: false, assets: [] };
    },
    uploadReleaseAsset: async () => {},
  }), /changed after publication/i);

  assert.deepEqual(requests.at(-1).options, { method: 'PATCH', body: { draft: true } });
});

test('findReleaseByTag searches authenticated release pages so drafts are discoverable', async () => {
  const urls = [];
  const firstPage = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    tag_name: `v0.0.${index}`,
  }));
  const release = await findReleaseByTag(
    'zhongdiandaoda/chm-reader-light',
    'v0.2.0',
    async (url) => {
      urls.push(url);
      return urls.length === 1 ? firstPage : [{ id: 101, tag_name: 'v0.2.0', draft: true }];
    },
  );

  assert.deepEqual(urls, [
    'https://api.github.com/repos/zhongdiandaoda/chm-reader-light/releases?per_page=100&page=1',
    'https://api.github.com/repos/zhongdiandaoda/chm-reader-light/releases?per_page=100&page=2',
  ]);
  assert.deepEqual(release, { id: 101, tag_name: 'v0.2.0', draft: true });
});

test('publishRelease leaves a failed upload as a draft instead of exposing a partial release', async () => {
  const requests = [];
  const plan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: '0123456789abcdef0123456789abcdef01234567',
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: ['/tmp/arm64.zip', '/tmp/x64.zip'],
    assetSnapshots: [
      { path: '/tmp/arm64.zip', size: 1, sha256: 'arm64' },
      { path: '/tmp/x64.zip', size: 1, sha256: 'x64' },
    ],
  };

  await assert.rejects(
    publishRelease(plan, {
      token: 'test-token',
      ensureRemoteTagCommit: async () => plan.targetCommitish,
      resolveRemoteTagCommit: async () => undefined,
      findRelease: async () => undefined,
      requestJson: async (url, options) => {
        requests.push({ url, options });
        return { id: 42, upload_url: 'https://uploads.github.test/assets{?name,label}' };
      },
      uploadReleaseAsset: async (_uploadUrl, assetPath) => {
        if (assetPath.endsWith('x64.zip')) throw new Error('upload interrupted');
      },
      verifyAssetSnapshot: () => {},
    }),
    /upload interrupted/,
  );

  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.body.draft, true);
});

test('publishRelease safely replaces expected assets when resuming a matching draft', async () => {
  const requests = [];
  const uploads = [];
  let releaseReads = 0;
  const plan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: '0123456789abcdef0123456789abcdef01234567',
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: ['/tmp/arm64.zip', '/tmp/x64.zip'],
    assetSnapshots: [
      { path: '/tmp/arm64.zip', size: 1, sha256: 'arm64' },
      { path: '/tmp/x64.zip', size: 1, sha256: 'x64' },
    ],
  };

  const result = await publishRelease(plan, {
    token: 'test-token',
    resolveRemoteTagCommit: async () => plan.targetCommitish,
    findRelease: async () => ({
      id: 42,
      tag_name: 'v0.2.0',
      draft: true,
      upload_url: 'https://uploads.github.test/assets{?name,label}',
      assets: [
        { id: 7, name: 'arm64.zip' },
        { id: 8, name: 'x64.zip' },
      ],
    }),
    requestJson: async (url, options) => {
      requests.push({ url, options });
      if (!options) {
        releaseReads += 1;
        return {
          id: 42,
          draft: releaseReads === 1,
          assets: plan.assets.map((assetPath, index) => ({
            name: path.basename(assetPath),
            size: plan.assetSnapshots[index].size,
            state: 'uploaded',
            digest: `sha256:${plan.assetSnapshots[index].sha256}`,
          })),
        };
      }
      return { id: 42, draft: false };
    },
    uploadReleaseAsset: async (_uploadUrl, assetPath) => uploads.push(assetPath),
    verifyAssetSnapshot: () => {},
  });

  assert.deepEqual(requests.slice(0, 2), [
    {
      url: 'https://api.github.com/repos/zhongdiandaoda/chm-reader-light/releases/assets/7',
      options: { method: 'DELETE' },
    },
    {
      url: 'https://api.github.com/repos/zhongdiandaoda/chm-reader-light/releases/assets/8',
      options: { method: 'DELETE' },
    },
  ]);
  assert.deepEqual(uploads, plan.assets);
  assert.equal(requests.some(({ options }) => options?.method === 'POST'), false);
  assert.deepEqual(requests[2], {
    url: 'https://api.github.com/repos/zhongdiandaoda/chm-reader-light/releases/42',
    options: {
      method: 'PATCH',
      body: {
        tag_name: 'v0.2.0',
        target_commitish: '0123456789abcdef0123456789abcdef01234567',
        name: 'CHMReaderLight v0.2.0',
        body: '# CHMReaderLight v0.2.0',
        draft: true,
        prerelease: false,
        generate_release_notes: true,
      },
    },
  });
  assert.deepEqual(
    requests.find(({ options }) => options?.method === 'PATCH' && options.body?.draft === false)?.options,
    { method: 'PATCH', body: { draft: false } },
  );
  assert.equal(result.draft, false);
});

test('publishRelease refuses to overwrite a public release or an unexpected draft asset', async () => {
  const plan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: '0123456789abcdef0123456789abcdef01234567',
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: ['/tmp/arm64.zip', '/tmp/x64.zip'],
    assetSnapshots: [
      { path: '/tmp/arm64.zip', size: 1, sha256: 'arm64' },
      { path: '/tmp/x64.zip', size: 1, sha256: 'x64' },
    ],
  };

  await assert.rejects(
    publishRelease(plan, {
      token: 'test-token',
      resolveRemoteTagCommit: async () => plan.targetCommitish,
      findRelease: async () => ({ id: 42, tag_name: plan.tag, draft: false, assets: [] }),
      verifyAssetSnapshot: () => {},
    }),
    /already public/,
  );
  await assert.rejects(
    publishRelease(plan, {
      token: 'test-token',
      resolveRemoteTagCommit: async () => plan.targetCommitish,
      findRelease: async () => ({
        id: 42,
        tag_name: plan.tag,
        draft: true,
        assets: [{ id: 9, name: 'notes.txt' }],
      }),
      verifyAssetSnapshot: () => {},
    }),
    /unexpected asset notes\.txt/,
  );
});

test('publishRelease does not recreate a missing tag for an existing public release', async () => {
  const mutations = [];
  const plan = {
    repositorySlug: 'zhongdiandaoda/chm-reader-light',
    tag: 'v0.2.0',
    targetCommitish: '0123456789abcdef0123456789abcdef01234567',
    releaseName: 'CHMReaderLight v0.2.0',
    releaseBody: '# CHMReaderLight v0.2.0',
    artifactErrors: [],
    assets: ['/tmp/arm64.zip'],
    assetSnapshots: [{ path: '/tmp/arm64.zip', size: 1, sha256: 'arm64' }],
  };

  await assert.rejects(
    publishRelease(plan, {
      token: 'test-token',
      verifyAssetSnapshot: () => {},
      resolveRemoteTagCommit: async () => undefined,
      ensureRemoteTagCommit: async () => {
        mutations.push('create-tag');
        return plan.targetCommitish;
      },
      findRelease: async () => ({ id: 42, tag_name: plan.tag, draft: false, assets: [] }),
    }),
    /already public/,
  );

  assert.deepEqual(mutations, []);
});

test('parseStageReleaseArtifactsArgs defaults to a dry-run staging plan', () => {
  assert.deepEqual(parseStageReleaseArtifactsArgs(['node', 'scripts/stage-release-artifacts.js']), {
    confirmed: false,
    inputDir: 'dist',
    outputDir: path.join('dist', 'release'),
  });
});

test('buildReleaseArtifactStagePlan finds downloaded workflow artifacts in nested directories', () => {
  const inputDir = makeTempReleaseDir();
  const outputDir = path.join(inputDir, 'release');

  writeArtifactWithChecksum(path.join(inputDir, 'CHMReaderLight-mac-arm64'), 'CHMReaderLight-mac-arm64.zip', 'arm build');
  writeArtifactWithChecksum(path.join(inputDir, 'CHMReaderLight-mac-x64'), 'CHMReaderLight-mac-x64.zip', 'intel build');

  const plan = buildReleaseArtifactStagePlan({ inputDir, outputDir });
  const output = formatReleaseArtifactStagePlan(plan, false);

  assert.deepEqual(plan.blockers, []);
  assert.deepEqual(plan.copyOperations.map((operation) => path.basename(operation.to)), [
    'CHMReaderLight-mac-arm64.zip',
    'CHMReaderLight-mac-arm64.zip.sha256',
    'CHMReaderLight-mac-x64.zip',
    'CHMReaderLight-mac-x64.zip.sha256',
  ]);
  assert.match(output, /Release artifact staging plan/);
  assert.match(output, /Mode: dry run/);
  assert.match(output, /Copy operations:/);
  assert.match(output, /CHMReaderLight-mac-arm64\.zip ->/);
  assert.match(output, /npm run check:release-artifacts --/);
  assert.match(output, /npm run publish:release -- --release-dir/);
  assert.match(output, /Dry run only/);
});

test('applyReleaseArtifactStagePlan copies a verified flat release directory', () => {
  const inputDir = makeTempReleaseDir();
  const outputDir = path.join(inputDir, 'release');

  writeArtifactWithChecksum(path.join(inputDir, 'CHMReaderLight-mac-arm64'), 'CHMReaderLight-mac-arm64.zip', 'arm build');
  writeArtifactWithChecksum(path.join(inputDir, 'CHMReaderLight-mac-x64'), 'CHMReaderLight-mac-x64.zip', 'intel build');

  const plan = buildReleaseArtifactStagePlan({ inputDir, outputDir });
  const errors = applyReleaseArtifactStagePlan(plan);

  assert.deepEqual(errors, []);
  assert.deepEqual(fs.readdirSync(outputDir).sort(), [
    'CHMReaderLight-mac-arm64.zip',
    'CHMReaderLight-mac-arm64.zip.sha256',
    'CHMReaderLight-mac-x64.zip',
    'CHMReaderLight-mac-x64.zip.sha256',
  ]);

  const repeatPlan = buildReleaseArtifactStagePlan({ inputDir, outputDir });
  assert.deepEqual(repeatPlan.blockers, []);
});

test('buildReleaseArtifactStagePlan reports missing and duplicate downloads before copying', () => {
  const inputDir = makeTempReleaseDir();
  const outputDir = path.join(inputDir, 'release');

  writeArtifactWithChecksum(path.join(inputDir, 'first-arm'), 'CHMReaderLight-mac-arm64.zip', 'arm build');
  writeArtifactWithChecksum(path.join(inputDir, 'second-arm'), 'CHMReaderLight-mac-arm64.zip', 'duplicate arm build');

  const plan = buildReleaseArtifactStagePlan({ inputDir, outputDir });

  assert.deepEqual(plan.copyOperations, []);
  assert.match(plan.blockers.join('\n'), /Multiple downloaded release files named CHMReaderLight-mac-arm64\.zip/);
  assert.match(plan.blockers.join('\n'), /Missing downloaded release file: CHMReaderLight-mac-x64\.zip/);
  assert.throws(() => applyReleaseArtifactStagePlan(plan), /Release artifact staging blockers must be fixed/);
});
