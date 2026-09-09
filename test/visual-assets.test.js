const test = require('node:test');
const assert = require('node:assert/strict');

const { verifyGeneratedAssetManifest } = require('../scripts/check-visual-assets');

const matchingManifest = {
  version: 1,
  source: { path: 'source.svg', sha256: 'source-hash' },
  output: { path: 'output.png', sha256: 'output-hash' },
};

test('verifyGeneratedAssetManifest accepts matching source and output hashes', () => {
  assert.equal(verifyGeneratedAssetManifest(
    matchingManifest,
    'source.svg',
    'source-hash',
    'output.png',
    'output-hash',
  ), null);
});

test('verifyGeneratedAssetManifest rejects a stale SVG or PNG', () => {
  assert.match(verifyGeneratedAssetManifest(
    matchingManifest,
    'source.svg',
    'changed-source-hash',
    'output.png',
    'output-hash',
  ), /stale/);
  assert.match(verifyGeneratedAssetManifest(
    matchingManifest,
    'source.svg',
    'source-hash',
    'output.png',
    'changed-output-hash',
  ), /stale/);
});
