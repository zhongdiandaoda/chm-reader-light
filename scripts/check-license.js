#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks license metadata alignment across public repository trust signals.
const rootDir = path.resolve(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

function requireIncludes(content, expectedText, description, errors) {
  if (!content.includes(expectedText)) {
    errors.push(`Missing ${description}: ${expectedText}`);
  }
}

function verifyLicenseMetadata() {
  const packageJson = JSON.parse(readText('package.json'));
  const license = readText('LICENSE');
  const citation = readText('CITATION.cff');
  const readme = readText('README.md');
  const englishReadme = readText('README.en.md');
  const thirdPartyNotices = readText('THIRD_PARTY_NOTICES.md');
  const errors = [];

  if (packageJson.license !== 'MIT') {
    errors.push(`package.json license should be MIT, found ${packageJson.license || '(missing)'}.`);
  }

  requireIncludes(license, 'MIT License', 'LICENSE title', errors);
  requireIncludes(license, 'Copyright (c) 2026 liuqi.9867', 'LICENSE copyright holder', errors);
  requireIncludes(citation, 'license: MIT', 'CITATION license metadata', errors);
  requireIncludes(readme, '[MIT License](./LICENSE)', 'README license link', errors);
  requireIncludes(englishReadme, '[MIT License](./LICENSE)', 'English README license link', errors);
  requireIncludes(readme, '[THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)', 'README third-party notices link', errors);
  requireIncludes(englishReadme, '[Third-Party Notices](./THIRD_PARTY_NOTICES.md)', 'English README third-party notices link', errors);
  requireIncludes(thirdPartyNotices, 'LGPL-2.1-or-later', 'CHMLib license identifier', errors);
  requireIncludes(thirdPartyNotices, '2bef8d063ec7d88a8de6fd9f0513ea42ac0fa21f', 'CHMLib source commit', errors);
  requireIncludes(thirdPartyNotices, 'CVE-2025-48172.patch', 'CHMLib modification notice', errors);

  return errors;
}

function main() {
  const errors = verifyLicenseMetadata();

  if (errors.length > 0) {
    console.error('License metadata check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('License metadata check passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyLicenseMetadata,
};
