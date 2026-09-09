#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const requiredPaths = [
  'README.md',
  'README.en.md',
  'LICENSE',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'CITATION.cff',
  '.github/CODEOWNERS',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/dependabot.yml',
  '.github/labels.yml',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/chm_compatibility.yml',
  '.github/ISSUE_TEMPLATE/feature_request.yml',
  '.github/ISSUE_TEMPLATE/install_help.yml',
  '.github/ISSUE_TEMPLATE/question.yml',
  '.github/workflows/ci.yml',
  '.github/workflows/codeql.yml',
  '.github/workflows/dependency-review.yml',
  '.github/workflows/release.yml',
  '.github/workflows/scorecard.yml',
];

function requireContent(relativePath, pattern, description, errors) {
  const content = fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
  if (!pattern.test(content)) errors.push(`${relativePath} is missing ${description}.`);
}

function main() {
  const errors = requiredPaths
    .filter((relativePath) => !fs.existsSync(path.join(rootDir, relativePath)))
    .map((relativePath) => `Missing required community file: ${relativePath}`);

  if (errors.length === 0) {
    requireContent('.github/ISSUE_TEMPLATE/config.yml', /blank_issues_enabled:\s*false/, 'disabled blank issues', errors);
    requireContent('.github/CODEOWNERS', /\/docs\/\s+@zhongdiandaoda/, 'documentation ownership', errors);
    requireContent('.github/workflows/ci.yml', /npm run check/, 'default quality gate', errors);
    requireContent('.github/workflows/codeql.yml', /github\/codeql-action\/analyze/, 'CodeQL analysis', errors);
    requireContent('.github/workflows/dependency-review.yml', /fail-on-severity:\s*moderate/, 'dependency review blocking', errors);
    requireContent('.github/workflows/scorecard.yml', /ossf\/scorecard-action/, 'OpenSSF Scorecard analysis', errors);
    requireContent('SECURITY.md', /private (?:vulnerability )?reporting|privately/i, 'private vulnerability reporting guidance', errors);
    requireContent('SUPPORT.md', /GitHub Discussions/, 'community support routing', errors);
    requireContent('CONTRIBUTING.md', /npm run check/, 'contributor verification command', errors);
  }

  if (errors.length > 0) {
    console.error('Community health check failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log('Community health check passed.');
}

main();
