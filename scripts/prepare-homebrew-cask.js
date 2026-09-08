#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const {
  verifyReleaseArtifacts,
} = require('./check-release-artifacts');

const {
  parseRepositorySlug,
} = require('./check-live-repository-listing');

// Prepares copy-ready Homebrew cask text from a verified staged release directory.
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const ARCHITECTURE_ARTIFACTS = {
  arm64: 'CHMReaderLight-mac-arm64.zip',
  x64: 'CHMReaderLight-mac-x64.zip',
};

function parseArgs(argv) {
  const options = {
    releaseDir: path.join('dist', 'release'),
    tag: undefined,
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
    if (arg === '--release-dir') {
      options.releaseDir = readOptionValue(index, '--release-dir');
      index += 1;
    } else if (arg.startsWith('--release-dir=')) {
      options.releaseDir = arg.slice('--release-dir='.length);
    } else if (arg === '--tag') {
      options.tag = readOptionValue(index, '--tag');
      index += 1;
    } else if (arg.startsWith('--tag=')) {
      options.tag = arg.slice('--tag='.length);
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

  return options;
}

function parseChecksumText(checksumText) {
  const match = checksumText.trim().match(/^([a-fA-F0-9]{64})(?:\s+\*?.*)?$/);
  if (!match) {
    throw new Error('Could not find a SHA-256 checksum in the checksum file.');
  }

  return match[1].toLowerCase();
}

function readArtifactChecksum(releaseDir, artifactName) {
  return parseChecksumText(fs.readFileSync(path.join(releaseDir, `${artifactName}.sha256`), 'utf-8'));
}

function formatCaskText({
  repositorySlug,
  version,
  arm64Checksum,
  x64Checksum,
  description,
}) {
  const descWithoutArticle = description.replace(/^A\s+/i, '');
  const desc = descWithoutArticle.charAt(0).toUpperCase() + descWithoutArticle.slice(1);

  return [
    'cask "chmreaderlight" do',
    '  arch arm: "arm64", intel: "x64"',
    '',
    `  version "${version}"`,
    `  sha256 arm: "${arm64Checksum}",`,
    `         intel: "${x64Checksum}"`,
    '',
    `  url "https://github.com/${repositorySlug}/releases/download/v#{version}/CHMReaderLight-mac-#{arch}.zip",`,
    `      verified: "github.com/${repositorySlug}/"`,
    '  name "CHMReaderLight"',
    `  desc "${desc}"`,
    `  homepage "https://github.com/${repositorySlug}"`,
    '',
    '  depends_on macos: ">= :monterey"',
    '',
    '  app "CHMReaderLight.app"',
    'end',
  ].join('\n');
}

function buildHomebrewCaskDraft({ packageJson, releaseDir, tag }) {
  const repositorySlug = parseRepositorySlug(packageJson);
  if (!repositorySlug) {
    throw new Error('Could not parse a GitHub repository slug from package.json.');
  }

  const resolvedReleaseDir = path.resolve(rootDir, releaseDir);
  const releaseTag = tag || `v${packageJson.version}`;
  const version = releaseTag.startsWith('v') ? releaseTag.slice(1) : releaseTag;
  const artifactErrors = verifyReleaseArtifacts(resolvedReleaseDir);

  if (artifactErrors.length > 0) {
    return {
      repositorySlug,
      releaseDir: resolvedReleaseDir,
      version,
      tag: releaseTag,
      artifactErrors,
      caskText: '',
    };
  }

  const caskText = formatCaskText({
    repositorySlug,
    version,
    arm64Checksum: readArtifactChecksum(resolvedReleaseDir, ARCHITECTURE_ARTIFACTS.arm64),
    x64Checksum: readArtifactChecksum(resolvedReleaseDir, ARCHITECTURE_ARTIFACTS.x64),
    description: packageJson.description || 'Lightweight offline CHM reader and library for macOS',
  });

  return {
    repositorySlug,
    releaseDir: resolvedReleaseDir,
    version,
    tag: releaseTag,
    artifactErrors,
    caskText,
  };
}

function formatHomebrewCaskPreparation(plan) {
  const lines = [
    'Homebrew cask preparation',
    `Repository: ${plan.repositorySlug}`,
    `Version: ${plan.version}`,
    `Release tag: ${plan.tag}`,
    `Release directory: ${plan.releaseDir}`,
    '',
  ];

  if (plan.artifactErrors.length > 0) {
    lines.push('Artifact blockers:');
    for (const error of plan.artifactErrors) {
      lines.push(`- ${error}`);
    }
    lines.push('', 'Fix the staged release directory before drafting a cask.');
  } else {
    lines.push('Artifact check: passed');
    lines.push('', 'Cask draft:', '```ruby', plan.caskText, '```');
    lines.push('', 'Verification commands:');
    lines.push('- brew audit --cask chmreaderlight');
    lines.push('- brew install --cask chmreaderlight');
    lines.push('- Open CHMReaderLight, import a .chm, open a topic, and use Help > Copy Diagnostic Info.');
  }

  lines.push('', 'Safety reminders:');
  lines.push('- Do not announce Homebrew install support until the cask is published and verified.');
  lines.push('- Keep GitHub Releases as the supported install path until the cask is live.');
  lines.push('- Recheck the notarization caveat before publishing Homebrew instructions.');

  return lines.join('\n');
}

async function main(argv = process.argv) {
  try {
    const options = parseArgs(argv);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const plan = buildHomebrewCaskDraft({
      packageJson,
      releaseDir: options.releaseDir,
      tag: options.tag,
    });

    console.log(formatHomebrewCaskPreparation(plan));
    if (plan.artifactErrors.length > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Homebrew cask preparation failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildHomebrewCaskDraft,
  formatHomebrewCaskPreparation,
  parseArgs,
  parseChecksumText,
};
