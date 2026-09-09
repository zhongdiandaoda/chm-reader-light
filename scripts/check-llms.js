#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const repositoryBaseUrl = 'https://github.com/zhongdiandaoda/chm-reader-light';

function main() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  const llmsText = fs.readFileSync(path.join(rootDir, 'llms.txt'), 'utf-8');
  const required = [
    '# CHMReaderLight',
    packageJson.description,
    '## What It Does',
    '## Trust Notes',
    '## Key Links',
    'No telemetry, accounts, cloud sync, or hosted document storage.',
    `${repositoryBaseUrl}#readme`,
    `${repositoryBaseUrl}/releases`,
    `${repositoryBaseUrl}/issues/new/choose`,
    `${repositoryBaseUrl}/blob/main/docs/privacy.md`,
    `${repositoryBaseUrl}/blob/main/docs/security-model.md`,
    `${repositoryBaseUrl}/blob/main/docs/troubleshooting.md`,
  ];
  const missing = required.filter((value) => !llmsText.includes(value));
  if (missing.length > 0) {
    console.error('AI project summary check failed:');
    missing.forEach((value) => console.error(`- Missing: ${value}`));
    process.exitCode = 1;
    return;
  }
  console.log('AI project summary check passed.');
}

main();
