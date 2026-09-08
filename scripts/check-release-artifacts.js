#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const EXPECTED_RELEASE_ARTIFACTS = [
  'CHMReaderLight-mac-arm64.zip',
  'CHMReaderLight-mac-x64.zip',
];
const EXPECTED_RELEASE_FILES = new Set(
  EXPECTED_RELEASE_ARTIFACTS.flatMap((artifactName) => [
    artifactName,
    `${artifactName}.sha256`,
  ]),
);

function readExpectedChecksum(checksumPath, artifactName) {
  const contents = fs.readFileSync(checksumPath, 'utf-8').trim();
  const match = contents.match(/^([a-fA-F0-9]{64})\s+\*?(.+)$/);
  if (!match || match[2] !== artifactName) return null;
  return match[1].toLowerCase();
}

function calculateChecksum(artifactPath) {
  const hash = crypto.createHash('sha256');
  const file = fs.openSync(artifactPath, 'r');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  try {
    for (;;) {
      const bytesRead = fs.readSync(file, buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      hash.update(buffer.subarray(0, bytesRead));
    }
  } finally {
    fs.closeSync(file);
  }
  return hash.digest('hex');
}

function isMacReleaseFile(fileName) {
  return /^CHMReaderLight-mac-.+\.zip(?:\.sha256)?$/.test(fileName);
}

function findUnexpectedReleaseFiles(releaseDir) {
  if (!fs.existsSync(releaseDir) || !fs.statSync(releaseDir).isDirectory()) return [];

  return fs.readdirSync(releaseDir)
    .filter((fileName) => isMacReleaseFile(fileName) && !EXPECTED_RELEASE_FILES.has(fileName))
    .sort();
}

function verifyReleaseArtifacts(releaseDir) {
  const errors = [];

  for (const fileName of findUnexpectedReleaseFiles(releaseDir)) {
    const label = fileName.endsWith('.sha256') ? 'checksum file' : 'release artifact';
    errors.push(`Unexpected ${label}: ${fileName}`);
  }

  for (const artifactName of EXPECTED_RELEASE_ARTIFACTS) {
    const artifactPath = path.join(releaseDir, artifactName);
    const checksumPath = `${artifactPath}.sha256`;

    if (!fs.existsSync(artifactPath)) {
      errors.push(`Missing release artifact: ${artifactName}`);
    }

    if (!fs.existsSync(checksumPath)) {
      errors.push(`Missing checksum file: ${artifactName}.sha256`);
      continue;
    }

    if (!fs.existsSync(artifactPath)) continue;

    const expectedChecksum = readExpectedChecksum(checksumPath, artifactName);
    if (!expectedChecksum) {
      errors.push(`Invalid checksum file format or artifact name: ${artifactName}.sha256`);
      continue;
    }

    const actualChecksum = calculateChecksum(artifactPath);
    if (actualChecksum !== expectedChecksum) {
      errors.push(`Checksum mismatch for ${artifactName}: expected ${expectedChecksum}, got ${actualChecksum}.`);
    }
  }

  return errors;
}

function main(argv) {
  const releaseDir = path.resolve(argv[2] || 'dist');
  const errors = verifyReleaseArtifacts(releaseDir);

  if (errors.length > 0) {
    console.error(`Release artifact verification failed in ${releaseDir}:`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Release artifact verification passed in ${releaseDir}.`);
}

if (require.main === module) {
  main(process.argv);
}

module.exports = {
  EXPECTED_RELEASE_ARTIFACTS,
  verifyReleaseArtifacts,
};
