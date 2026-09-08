#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks static growth readiness documentation for promotion blocker coverage.
const rootDir = path.resolve(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

function requireIncludes(content, expectedText, description, errors) {
  if (!content.includes(expectedText)) {
    errors.push(`Missing ${description}: ${expectedText}`);
  }
}

function verifyGrowthReadiness() {
  const packageJson = JSON.parse(readText('package.json'));
  const readme = readText('README.md');
  const englishReadme = readText('README.en.md');
  const contributing = readText('CONTRIBUTING.md');
  const testingGuide = readText(path.join('docs', 'testing.md'));
  const docsIndex = readText(path.join('docs', 'index.md'));
  const maintainerPlaybook = readText(path.join('docs', 'maintainer-playbook.md'));
  const chineseMaintainerPlaybook = readText(path.join('docs', 'maintainer-playbook.zh-CN.md'));
  const directorySubmissionTracker = readText(path.join('docs', 'directory-submission-tracker.md'));
  const chineseDirectorySubmissionTracker = readText(path.join('docs', 'directory-submission-tracker.zh-CN.md'));
  const growthGuide = readText(path.join('docs', 'growth-readiness.md'));
  const errors = [];

  if (packageJson.scripts['check:growth'] !== 'node scripts/check-growth-readiness.js') {
    errors.push('package.json is missing check:growth script.');
  }
  if (packageJson.scripts['snapshot:growth'] !== 'node scripts/snapshot-growth-metrics.js') {
    errors.push('package.json is missing snapshot:growth script.');
  }
  if (packageJson.scripts['snapshot:visibility'] !== 'node scripts/snapshot-visibility-readiness.js') {
    errors.push('package.json is missing snapshot:visibility script.');
  }
  if (packageJson.scripts['prepare:visibility-issue'] !== 'node scripts/prepare-visibility-issue.js') {
    errors.push('package.json is missing prepare:visibility-issue script.');
  }
  if (packageJson.scripts['prepare:directory-submission'] !== 'node scripts/prepare-directory-submission.js') {
    errors.push('package.json is missing prepare:directory-submission script.');
  }
  if (packageJson.scripts['prepare:homebrew-cask'] !== 'node scripts/prepare-homebrew-cask.js') {
    errors.push('package.json is missing prepare:homebrew-cask script.');
  }
  if (packageJson.scripts['prepare:share-post'] !== 'node scripts/prepare-share-post.js') {
    errors.push('package.json is missing prepare:share-post script.');
  }
  if (packageJson.scripts['prepare:promotion-follow-up'] !== 'node scripts/prepare-promotion-follow-up.js') {
    errors.push('package.json is missing prepare:promotion-follow-up script.');
  }
  if (packageJson.scripts['apply:repository-listing'] !== 'node scripts/apply-repository-listing.js') {
    errors.push('package.json is missing apply:repository-listing script.');
  }
  if (packageJson.scripts['stage:release-artifacts'] !== 'node scripts/stage-release-artifacts.js') {
    errors.push('package.json is missing stage:release-artifacts script.');
  }
  if (packageJson.scripts['publish:release'] !== 'node scripts/publish-release.js') {
    errors.push('package.json is missing publish:release script.');
  }

  requireIncludes(packageJson.scripts.check || '', 'npm run check:growth', 'default check:growth gate', errors);
  requireIncludes(readme, '`npm run check:growth`', 'README script inventory entry', errors);
  requireIncludes(readme, '`npm run snapshot:growth`', 'README growth snapshot script inventory entry', errors);
  requireIncludes(readme, '`npm run snapshot:visibility`', 'README visibility snapshot script inventory entry', errors);
  requireIncludes(readme, '`npm run prepare:visibility-issue`', 'README visibility issue script inventory entry', errors);
  requireIncludes(readme, '`npm run prepare:directory-submission`', 'README directory submission script inventory entry', errors);
  requireIncludes(readme, '`npm run prepare:homebrew-cask`', 'README Homebrew cask preparation script inventory entry', errors);
  requireIncludes(readme, '`npm run prepare:share-post`', 'README share post preparation script inventory entry', errors);
  requireIncludes(readme, '`npm run prepare:promotion-follow-up`', 'README promotion follow-up script inventory entry', errors);
  requireIncludes(readme, '`npm run apply:repository-listing`', 'README apply repository listing script inventory entry', errors);
  requireIncludes(readme, '`npm run stage:release-artifacts`', 'README stage release artifacts script inventory entry', errors);
  requireIncludes(readme, '`npm run publish:release`', 'README publish release script inventory entry', errors);
  requireIncludes(englishReadme, 'growth readiness coverage', 'English README growth readiness summary', errors);
  requireIncludes(englishReadme, 'Run `npm run snapshot:growth` before a visibility push', 'English README growth snapshot command', errors);
  requireIncludes(englishReadme, 'Run `npm run snapshot:visibility` before opening a visibility-push issue', 'English README visibility snapshot command', errors);
  requireIncludes(englishReadme, 'Run `npm run prepare:visibility-issue` to generate a visibility-push issue draft', 'English README visibility issue command', errors);
  requireIncludes(englishReadme, 'Run `npm run prepare:directory-submission` to generate copy-ready external directory listing fields', 'English README directory submission command', errors);
  requireIncludes(englishReadme, 'Run `npm run prepare:homebrew-cask -- --release-dir <release-dir>` to generate a copy-ready Homebrew cask draft', 'English README Homebrew cask command', errors);
  requireIncludes(englishReadme, 'Run `npm run prepare:share-post` to generate a channel-specific release or social post draft', 'English README share post command', errors);
  requireIncludes(englishReadme, 'Run `npm run prepare:promotion-follow-up` after a channel follow-up', 'English README promotion follow-up command', errors);
  requireIncludes(englishReadme, 'Run `npm run apply:repository-listing` to preview the GitHub description', 'English README apply repository listing command', errors);
  requireIncludes(englishReadme, 'Run `npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to flatten downloaded workflow artifacts', 'English README stage release artifacts command', errors);
  requireIncludes(englishReadme, 'Run `npm run publish:release -- --release-dir <release-dir>` to preview the GitHub Release payload', 'English README publish release command', errors);
  requireIncludes(contributing, '`npm run check:growth` keeps the Growth Readiness guide aligned', 'Contributing growth readiness command description', errors);
  requireIncludes(contributing, '`npm run snapshot:growth` prints a tracker-ready baseline', 'Contributing growth snapshot command description', errors);
  requireIncludes(contributing, '`npm run snapshot:visibility` prints a paste-ready visibility-push report', 'Contributing visibility snapshot command description', errors);
  requireIncludes(contributing, '`npm run prepare:visibility-issue` generates a visibility-push issue draft', 'Contributing visibility issue command description', errors);
  requireIncludes(contributing, '`npm run prepare:directory-submission` generates copy-ready external directory listing fields', 'Contributing directory submission command description', errors);
  requireIncludes(contributing, '`npm run prepare:homebrew-cask -- --release-dir <release-dir>` generates a copy-ready Homebrew cask draft', 'Contributing Homebrew cask command description', errors);
  requireIncludes(contributing, '`npm run prepare:share-post` generates a channel-specific release or social post draft', 'Contributing share post command description', errors);
  requireIncludes(contributing, '`npm run prepare:promotion-follow-up` compares saved baseline and current `npm run snapshot:growth` outputs', 'Contributing promotion follow-up command description', errors);
  requireIncludes(contributing, '`npm run apply:repository-listing` previews those GitHub repository setting updates', 'Contributing apply repository listing command description', errors);
  requireIncludes(contributing, '`npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` flattens downloaded workflow artifacts', 'Contributing stage release artifacts command description', errors);
  requireIncludes(contributing, '`npm run publish:release -- --release-dir <release-dir>` previews the GitHub Release payload', 'Contributing publish release command description', errors);
  requireIncludes(testingGuide, 'validates static growth readiness coverage', 'Testing Guide default gate summary', errors);
  requireIncludes(testingGuide, '`npm run check:growth` after changing promotion', 'Testing Guide focused growth check', errors);
  requireIncludes(testingGuide, '`npm run snapshot:growth` before a visibility push', 'Testing Guide growth snapshot command', errors);
  requireIncludes(testingGuide, '`npm run snapshot:visibility` before opening a visibility-push issue', 'Testing Guide visibility snapshot command', errors);
  requireIncludes(testingGuide, '`npm run prepare:visibility-issue` before filing a promotion task', 'Testing Guide visibility issue command', errors);
  requireIncludes(testingGuide, '`npm run prepare:directory-submission` before filling an external app directory form', 'Testing Guide directory submission command', errors);
  requireIncludes(testingGuide, '`npm run prepare:share-post` before posting a release or social update', 'Testing Guide share post command', errors);
  requireIncludes(testingGuide, '`npm run prepare:promotion-follow-up` after refreshing `npm run snapshot:growth`', 'Testing Guide promotion follow-up command', errors);
  requireIncludes(testingGuide, '`npm run prepare:homebrew-cask -- --release-dir <release-dir>` after staging and verifying release artifacts', 'Testing Guide Homebrew cask command', errors);
  requireIncludes(testingGuide, '`npm run apply:repository-listing` to dry-run GitHub repository About', 'Testing Guide apply repository listing command', errors);
  requireIncludes(testingGuide, '`npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to flatten downloaded GitHub Actions artifacts', 'Testing Guide stage release artifacts command', errors);
  requireIncludes(testingGuide, '`npm run publish:release -- --release-dir <release-dir>` to dry-run the GitHub Release payload', 'Testing Guide publish release command', errors);
  requireIncludes(docsIndex, '[Growth Readiness](./growth-readiness.md)', 'Documentation Index growth readiness link', errors);
  requireIncludes(maintainerPlaybook, 'Use the Growth Readiness guide to turn remote audit failures into the next promotion task', 'Maintainer Playbook growth readiness routing', errors);
  requireIncludes(chineseMaintainerPlaybook, '使用 Growth Readiness 指南把远端 audit 失败项转成下一步推广任务', 'Chinese Maintainer Playbook growth readiness routing', errors);
  requireIncludes(directorySubmissionTracker, 'Baseline Stars/Downloads/Watchers', 'Directory Submission Tracker baseline watcher column', errors);
  requireIncludes(directorySubmissionTracker, 'Follow-Up Stars/Downloads/Watchers', 'Directory Submission Tracker follow-up watcher column', errors);
  requireIncludes(directorySubmissionTracker, 'Capture a dated evidence note for every follow-up check', 'Directory Submission Tracker follow-up evidence note', errors);
  requireIncludes(chineseDirectorySubmissionTracker, '提交时 Stars/Downloads/Watchers', 'Chinese Directory Submission Tracker baseline watcher column', errors);
  requireIncludes(chineseDirectorySubmissionTracker, '复查 Stars/Downloads/Watchers', 'Chinese Directory Submission Tracker follow-up watcher column', errors);
  requireIncludes(chineseDirectorySubmissionTracker, '每次复查都补一条带日期的证据记录', 'Chinese Directory Submission Tracker follow-up evidence note', errors);

  for (const requiredText of [
    '# Growth Readiness',
    '## Current Remote Blockers',
    '0 stars',
    'description, website, topics, and Discussions',
    'no public latest GitHub Release',
    '## Promotion Sequence',
    'npm run apply:repository-listing',
    'GITHUB_TOKEN=repo_administration_token npm run apply:repository-listing -- --confirm',
    'npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>',
    'npm run publish:release -- --release-dir <release-dir>',
    'GITHUB_TOKEN=repo_contents_token npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm',
    'npm run check:remote-listing',
    'npm run check:remote-release',
    'npm run snapshot:growth',
    'npm run snapshot:visibility',
    'npm run prepare:visibility-issue',
    'npm run prepare:directory-submission',
    'npm run prepare:share-post -- --channel <channel> --audience <audience> --baseline-file <snapshot-file>',
    'npm run prepare:promotion-follow-up -- --baseline-file <baseline-file> --current-file <current-file> --channel <channel>',
    'npm run prepare:homebrew-cask -- --release-dir <release-dir>',
    'prefilled GitHub new-issue URL',
    '-- --snapshot-file <snapshot-file>',
    '-- --baseline-file <snapshot-file>',
    'channel-specific release or social copy',
    'tracker-ready metric deltas',
    'copy-ready Homebrew cask draft',
    'stargazers_count',
    'paste-ready report',
    'Directory Submission Tracker',
    '## Evidence to Record',
    'baseline stars, downloads, watchers, and live listing URLs',
    'Release-feedback Discussion themes',
    '## Ready to Promote',
  ]) {
    requireIncludes(growthGuide, requiredText, 'docs/growth-readiness.md coverage', errors);
  }

  return errors;
}

function main() {
  const errors = verifyGrowthReadiness();

  if (errors.length > 0) {
    console.error('Growth readiness check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Growth readiness check passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyGrowthReadiness,
};
