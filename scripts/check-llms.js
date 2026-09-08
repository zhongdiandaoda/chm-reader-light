#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks llms.txt coverage for search tools and AI assistants.
const rootDir = path.resolve(__dirname, '..');
const repositoryBaseUrl = 'https://github.com/zhongdiandaoda/chm-reader-light';

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

function requireIncludes(content, expectedText, description, errors) {
  if (!content.includes(expectedText)) {
    errors.push(`Missing ${description}: ${expectedText}`);
  }
}

function verifyLlmsSummary() {
  const packageJson = JSON.parse(readText('package.json'));
  const readme = readText('README.md');
  const englishReadme = readText('README.en.md');
  const docsIndex = readText(path.join('docs', 'index.md'));
  const listingGuide = readText(path.join('docs', 'repository-listing.md'));
  const llmsText = readText('llms.txt');
  const errors = [];

  requireIncludes(readme, '[AI Project Summary](./llms.txt)', 'README AI project summary link', errors);
  requireIncludes(englishReadme, '[AI Project Summary](./llms.txt)', 'English README AI project summary link', errors);
  requireIncludes(docsIndex, '[AI Project Summary](../llms.txt)', 'Documentation Index AI project summary link', errors);
  requireIncludes(
    listingGuide,
    'Confirm `llms.txt` still summarizes the project positioning',
    'repository listing llms.txt verification note',
    errors,
  );

  requireIncludes(llmsText, '# CHMReaderLight', 'llms.txt title', errors);
  requireIncludes(llmsText, packageJson.description, 'package description in llms.txt', errors);

  for (const heading of ['## What It Does', '## Best For', '## Trust Notes', '## Key Links']) {
    requireIncludes(llmsText, heading, `llms.txt ${heading} section`, errors);
  }

  for (const phrase of [
    'library-first workflow',
    'searchable table of contents',
    'body search',
    'local-only',
    'legacy SDK manuals',
    'offline API reference',
  ]) {
    requireIncludes(llmsText, phrase, `llms.txt positioning phrase`, errors);
  }

  for (const trustSignal of [
    'No telemetry, accounts, cloud sync, or hosted document storage.',
    'scripts are disabled',
    'network access is blocked',
    'SHA-256 checksum files',
    'GitHub artifact attestations',
    'Direct latest downloads are available for Apple Silicon and Intel Mac builds',
    'CHMReaderLight-mac-arm64.zip',
    'CHMReaderLight-mac-x64.zip',
    'Homebrew is not a supported install path yet',
    'Installed app users can start from Help > Report or Request',
    'release feedback, showcase, and security-policy routes',
    'Installed app users can use Help > Star on GitHub after a successful local workflow trial.',
    'Help > Copy Share Text creates bilingual sharing copy with release, star, feedback, and showcase links.',
    'Help > Release Feedback opens the release-feedback Discussion when release trust details are the blocker.',
  ]) {
    requireIncludes(llmsText, trustSignal, `llms.txt trust signal`, errors);
  }

  const requiredLinks = [
    ['README', `${repositoryBaseUrl}#readme`],
    ['Releases', `${repositoryBaseUrl}/releases`],
    ['Apple Silicon download', `${repositoryBaseUrl}/releases/latest/download/CHMReaderLight-mac-arm64.zip`],
    ['Intel download', `${repositoryBaseUrl}/releases/latest/download/CHMReaderLight-mac-x64.zip`],
    ['Homebrew Cask Guide', `${repositoryBaseUrl}/blob/main/docs/homebrew-cask.md`],
    ['Issues', `${repositoryBaseUrl}/issues/new/choose`],
    ['Discussions', `${repositoryBaseUrl}/discussions`],
    ['Release feedback', `${repositoryBaseUrl}/discussions/new?category=release-feedback`],
    ['Support', `${repositoryBaseUrl}/blob/main/SUPPORT.md`],
    ['Contributing', `${repositoryBaseUrl}/blob/main/CONTRIBUTING.md`],
    ['Documentation feedback', `${repositoryBaseUrl}/issues/new?template=documentation.yml`],
    ['Use cases', `${repositoryBaseUrl}/blob/main/docs/use-cases.md`],
    ['Comparison', `${repositoryBaseUrl}/blob/main/docs/comparison.md`],
    ['Adoption checklist', `${repositoryBaseUrl}/blob/main/docs/adoption-checklist.md`],
    ['Privacy and local data', `${repositoryBaseUrl}/blob/main/docs/privacy.md`],
    ['Security model', `${repositoryBaseUrl}/blob/main/docs/security-model.md`],
    ['Good first contributions', `${repositoryBaseUrl}/blob/main/docs/good-first-contributions.md`],
  ];

  for (const [label, url] of requiredLinks) {
    requireIncludes(llmsText, `- ${label}: ${url}`, `llms.txt ${label} link`, errors);
  }

  return errors;
}

function main() {
  const errors = verifyLlmsSummary();

  if (errors.length > 0) {
    console.error('AI project summary check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('AI project summary check passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyLlmsSummary,
};
