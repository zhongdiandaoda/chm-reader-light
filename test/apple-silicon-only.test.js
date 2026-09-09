const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

test('public docs target Apple Silicon only', () => {
  const publicEntryPoints = [
    'README.md',
    'README.en.md',
    '.github/ISSUE_TEMPLATE/bug_report.yml',
    '.github/ISSUE_TEMPLATE/install_help.yml',
    '.github/DISCUSSION_TEMPLATE/release-feedback.yml',
  ].map(read).join('\n');
  assert.doesNotMatch(publicEntryPoints, /Intel|x64|mac-x64/i);

  const readmes = `${read('README.md')}\n${read('README.en.md')}`;
  assert.match(readmes, /Apple Silicon/);
  assert.match(readmes, /CHMReaderLight-mac-arm64[.]zip/);
});

test('package commands expose only Apple Silicon macOS builds', () => {
  const packageJson = JSON.parse(read('package.json'));
  const scriptNames = Object.keys(packageJson.scripts);
  assert.equal(scriptNames.some((name) => name.includes('x64')), false);
  assert.equal(packageJson.scripts['package:mac'], 'bash scripts/package-macos.sh arm64');
  assert.equal(packageJson.scripts['package:release:mac:arm64'], 'bash scripts/package-macos-release.sh arm64');
});

test('release automation publishes only the Apple Silicon artifact pair', () => {
  const workflow = read('.github/workflows/release.yml');
  const artifactChecker = require('../scripts/check-release-artifacts');
  const liveReleaseChecker = read('scripts/check-live-release.js');

  assert.doesNotMatch(workflow, /x64|macos-15-intel|matrix[.]arch/i);
  assert.deepEqual(artifactChecker.EXPECTED_RELEASE_ARTIFACTS, ['CHMReaderLight-mac-arm64.zip']);
  assert.doesNotMatch(liveReleaseChecker, /x64|mac-x64/i);
});

test('native packaging scripts reject Intel targets', () => {
  for (const relativePath of [
    'scripts/package-macos.sh',
    'scripts/package-macos-release.sh',
    'scripts/check-macos-package-env.sh',
    'scripts/build-chmlib-macos.sh',
    'scripts/check-chmlib-macos.sh',
    'scripts/check-macos-release-bundle.sh',
    'scripts/vendor-chmlib-macos.sh',
  ]) {
    assert.doesNotMatch(read(relativePath), /x64|x86_64/i, relativePath);
  }
});
