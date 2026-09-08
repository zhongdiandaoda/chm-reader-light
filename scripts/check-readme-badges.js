#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks README badge coverage for repository trust and discovery signals.
const rootDir = path.resolve(__dirname, '..');

const requiredBadges = [
  {
    name: 'CI',
    markdown: '[![CI](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml/badge.svg)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)',
  },
  {
    name: 'CodeQL',
    markdown: '[![CodeQL](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml/badge.svg)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)',
  },
  {
    name: 'OpenSSF Scorecard',
    markdown: '[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/zhongdiandaoda/chm-reader-light/badge)](https://scorecard.dev/view/github.com/zhongdiandaoda/chm-reader-light)',
  },
  {
    name: 'GitHub stars',
    markdown: '[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)',
  },
  {
    name: 'GitHub downloads',
    markdown: '[![GitHub downloads](https://img.shields.io/github/downloads/zhongdiandaoda/chm-reader-light/total?label=downloads)](https://github.com/zhongdiandaoda/chm-reader-light/releases)',
  },
  {
    name: 'License: MIT',
    markdown: '[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)',
  },
  {
    name: 'Platform: macOS',
    markdown: '[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)]',
  },
  {
    name: 'Node.js 22+',
    markdown: '[![Node.js 22+](https://img.shields.io/badge/node-%3E%3D22-339933.svg)](./.nvmrc)',
  },
  {
    name: 'GitHub release',
    markdown: '[![GitHub release](https://img.shields.io/github/v/release/zhongdiandaoda/chm-reader-light?display_name=tag&sort=semver)](https://github.com/zhongdiandaoda/chm-reader-light/releases)',
  },
];

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

function verifyReadmeBadges() {
  const errors = [];
  const readmeFiles = ['README.md', 'README.en.md'];

  for (const relativePath of readmeFiles) {
    const readme = readText(relativePath);
    for (const badge of requiredBadges) {
      if (!readme.includes(badge.markdown)) {
        errors.push(`${relativePath} is missing the ${badge.name} badge.`);
      }
    }
  }

  return errors;
}

function main() {
  const errors = verifyReadmeBadges();

  if (errors.length > 0) {
    console.error('README badge check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('README badge check passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyReadmeBadges,
};
