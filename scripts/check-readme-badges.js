#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks README badge coverage for repository trust and discovery signals.
const rootDir = path.resolve(__dirname, '..');

const requiredBadges = [
  {
    name: 'CI',
    markdown: '[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/ci.yml)',
  },
  {
    name: 'CodeQL',
    markdown: '[![CodeQL](https://img.shields.io/badge/CodeQL-analysis-2088FF?logo=github&logoColor=white)](https://github.com/zhongdiandaoda/chm-reader-light/actions/workflows/codeql.yml)',
  },
  {
    name: 'GitHub stars',
    markdown: '[![GitHub stars](https://img.shields.io/github/stars/zhongdiandaoda/chm-reader-light?style=social)](https://github.com/zhongdiandaoda/chm-reader-light/stargazers)',
  },
  {
    name: 'License: MIT',
    markdown: '[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)',
  },
  {
    name: 'Platform: macOS',
    markdown: '[![Platform: macOS](https://img.shields.io/badge/platform-macOS-111111.svg)]',
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
