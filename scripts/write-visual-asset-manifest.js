#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const sourcePath = 'docs/assets/social-preview.svg';
const outputPath = 'docs/assets/social-preview.png';
const manifestPath = path.join(rootDir, 'docs/assets/social-preview.manifest.json');

function sha256(relativePath) {
  return crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(rootDir, relativePath)))
    .digest('hex');
}

const manifest = {
  version: 1,
  source: {
    path: sourcePath,
    sha256: sha256(sourcePath),
  },
  output: {
    path: outputPath,
    sha256: sha256(outputPath),
  },
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Recorded visual asset manifest: ${manifestPath}`);
