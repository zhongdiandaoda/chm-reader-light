#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');

function main() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  const guide = fs.readFileSync(path.join(rootDir, 'docs/growth-readiness.md'), 'utf-8');
  const requiredScripts = [
    'check:remote-listing',
    'apply:repository-listing',
    'check:remote-release',
    'snapshot:growth',
    'snapshot:visibility',
    'prepare:visibility-issue',
    'prepare:share-post',
    'publish:release',
  ];
  const requiredGuideText = [
    '# Growth Readiness',
    '## Current Remote Blockers',
    '## Promotion Sequence',
    'npm run check:remote-listing',
    'npm run check:remote-release',
    'npm run snapshot:growth',
    'npm run snapshot:visibility',
    'npm run prepare:share-post',
    '## Ready to Promote',
  ];
  const errors = [];
  requiredScripts.forEach((name) => {
    if (!packageJson.scripts[name]) errors.push(`package.json is missing ${name}.`);
  });
  requiredGuideText.forEach((text) => {
    if (!guide.includes(text)) errors.push(`docs/growth-readiness.md is missing: ${text}`);
  });
  if (errors.length > 0) {
    console.error('Growth readiness check failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log('Growth readiness check passed.');
}

main();
