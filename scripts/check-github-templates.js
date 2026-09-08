#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks GitHub issue, discussion, and pull request template quality.
const rootDir = path.resolve(__dirname, '..');
const issueTemplateDir = path.join(rootDir, '.github', 'ISSUE_TEMPLATE');
const discussionTemplateDir = path.join(rootDir, '.github', 'DISCUSSION_TEMPLATE');

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

function requireIncludes(content, expectedText, description, errors) {
  if (!content.includes(expectedText)) {
    errors.push(`Missing ${description}: ${expectedText}`);
  }
}

function requirePattern(content, pattern, description, errors) {
  if (!pattern.test(content)) {
    errors.push(`Missing ${description}: ${pattern}`);
  }
}

function requireAnyPattern(content, patterns, description, errors) {
  if (!patterns.some((pattern) => pattern.test(content))) {
    errors.push(`Missing ${description}: ${patterns.map((pattern) => pattern.toString()).join(' or ')}`);
  }
}

function readTemplate(relativePath) {
  return readText(path.join('.github', relativePath));
}

function collectIssueTemplateFiles() {
  return fs
    .readdirSync(issueTemplateDir)
    .filter((fileName) => /\.ya?ml$/i.test(fileName) && fileName !== 'config.yml')
    .sort();
}

function collectDiscussionTemplateFiles() {
  return fs
    .readdirSync(discussionTemplateDir)
    .filter((fileName) => /\.ya?ml$/i.test(fileName))
    .sort();
}

function verifyGitHubTemplates() {
  const errors = [];
  const existingIssuesSearch = 'https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue';
  const discussionsUrl = 'https://github.com/zhongdiandaoda/chm-reader-light/discussions';

  const issueConfig = readTemplate(path.join('ISSUE_TEMPLATE', 'config.yml'));
  requireIncludes(issueConfig, 'blank_issues_enabled: false', 'disabled blank issue setting', errors);
  requireIncludes(
    issueConfig,
    'Installed app users can use Help > Report or Request to choose the right issue template, release feedback, security policy, or showcase route.',
    'issue chooser in-app support routing note',
    errors,
  );
  requireIncludes(
    issueConfig,
    '已安装应用的用户可以使用 Help > Report or Request 选择合适的 issue template、release feedback、安全政策或 showcase 路径。',
    'issue chooser localized in-app support routing note',
    errors,
  );
  for (const linkName of [
    'Support guide',
    'Project Status',
    'Adoption Checklist',
    'Good First Contributions',
    'Governance Guide',
    'Chinese Governance Guide',
    'GitHub Discussions',
    'GitHub Releases',
    'Security Policy',
    'Chinese Contributing Guide',
    'Chinese Support Guide',
    'Chinese Security Policy',
    'Release Feedback Discussion',
    'Visibility Push Guide',
  ]) {
    requireIncludes(issueConfig, `name: ${linkName}`, `issue chooser ${linkName} contact link`, errors);
  }
  for (const linkUrl of [
    'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/CONTRIBUTING.zh-CN.md',
    'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/governance.zh-CN.md',
    'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/growth-readiness.md',
    'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/SUPPORT.zh-CN.md',
    'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/SECURITY.zh-CN.md',
    'https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback',
  ]) {
    requireIncludes(issueConfig, `url: ${linkUrl}`, `issue chooser ${linkUrl} contact link URL`, errors);
  }

  const issueTemplates = collectIssueTemplateFiles();
  for (const templateFile of issueTemplates) {
    const template = readTemplate(path.join('ISSUE_TEMPLATE', templateFile));
    requirePattern(template, /^name: .+/m, `${templateFile} name`, errors);
    requirePattern(template, /^description: .+/m, `${templateFile} description`, errors);
    requirePattern(template, /^title: "\[[^"]+\]: "/m, `${templateFile} title prefix`, errors);
    requirePattern(template, /^labels: \["[^"]+(?:", "[^"]+)*"\]$/m, `${templateFile} labels`, errors);
    requireIncludes(template, 'validations:\n      required: true', `${templateFile} required field`, errors);

    if (templateFile !== 'good_first_task.yml' && templateFile !== 'showcase.yml' && templateFile !== 'visibility_push.yml') {
      requireIncludes(template, 'Search existing Issues and Discussions before filing', `${templateFile} duplicate-search reminder`, errors);
      requireIncludes(template, existingIssuesSearch, `${templateFile} issue search link`, errors);
      requireIncludes(template, discussionsUrl, `${templateFile} discussions link`, errors);
    }
  }

  for (const templateFile of ['bug_report.yml', 'chm_compatibility.yml', 'accessibility.yml', 'performance.yml']) {
    const template = readTemplate(path.join('ISSUE_TEMPLATE', templateFile));
    requireIncludes(template, 'Help > Copy Diagnostic Info', `${templateFile} diagnostic info prompt`, errors);
  }

  for (const templateFile of ['accessibility.yml', 'bug_report.yml', 'chm_compatibility.yml', 'performance.yml', 'showcase.yml']) {
    const template = readTemplate(path.join('ISSUE_TEMPLATE', templateFile));
    requireAnyPattern(template, [
      /Do not include private CHM content/,
      /Do not attach private CHM files/,
      /Do not include private document content/,
      /without exposing private content/,
    ], `${templateFile} private content reminder`, errors);
  }

  const goodFirstTemplate = readTemplate(path.join('ISSUE_TEMPLATE', 'good_first_task.yml'));
  for (const requiredPrompt of [
    'What user or contributor workflow improves?',
    'Likely files or docs',
    'Smallest acceptable change',
    'Verification command',
  ]) {
    requireIncludes(goodFirstTemplate, requiredPrompt, `good first task ${requiredPrompt} prompt`, errors);
  }

  const visibilityPushTemplate = readTemplate(path.join('ISSUE_TEMPLATE', 'visibility_push.yml'));
  for (const [requiredText, description] of [
    ['What live readiness checks passed?', 'visibility push live readiness prompt'],
    ['npm run snapshot:visibility', 'visibility push readiness snapshot command'],
    ['npm run check:remote-listing', 'visibility push remote listing command'],
    ['npm run check:remote-release', 'visibility push remote release command'],
    ['What baseline metrics are recorded?', 'visibility push baseline metrics prompt'],
    ['npm run snapshot:growth', 'visibility push growth snapshot command'],
    ['stargazers_count', 'visibility push star baseline field'],
    ['downloads', 'visibility push download baseline field'],
    ['watchers', 'visibility push watcher baseline field'],
    ['What copy, demo, or listing asset will be used?', 'visibility push asset prompt'],
    ['What is the follow-up date and evidence plan?', 'visibility push follow-up evidence prompt'],
    ['Do not ask for stars until the user has a clear evaluation path', 'visibility push responsible star request reminder'],
    ['Do not include private CHM content', 'visibility push privacy reminder'],
    ['docs/growth-readiness.md', 'visibility push growth readiness guide link'],
    ['docs/share-kit.md', 'visibility push share kit link'],
    ['docs/directory-submission-tracker.md', 'visibility push tracker link'],
  ]) {
    requireIncludes(visibilityPushTemplate, requiredText, description, errors);
  }

  const discussionTemplates = collectDiscussionTemplateFiles();
  for (const templateFile of discussionTemplates) {
    const template = readTemplate(path.join('DISCUSSION_TEMPLATE', templateFile));
    requirePattern(template, /^title: "\[[^"]+\] "/m, `${templateFile} title prefix`, errors);
    requireIncludes(template, 'Search existing Discussions before posting', `${templateFile} discussion search reminder`, errors);
    requireIncludes(template, discussionsUrl, `${templateFile} discussions link`, errors);
    requireIncludes(template, 'validations:\n      required: true', `${templateFile} required field`, errors);
  }

  const showAndTellTemplate = readTemplate(path.join('DISCUSSION_TEMPLATE', 'show-and-tell.yml'));
  requireIncludes(showAndTellTemplate, 'Do not include private document content', 'show-and-tell privacy reminder', errors);
  requireIncludes(
    showAndTellTemplate,
    'May maintainers quote this in project docs, release notes, or share materials?',
    'show-and-tell quote permission prompt',
    errors,
  );

  const releaseFeedbackTemplate = readTemplate(path.join('DISCUSSION_TEMPLATE', 'release-feedback.yml'));
  requireIncludes(
    releaseFeedbackTemplate,
    'What would make this release easier to trust, star, watch, or share?',
    'release feedback trust, star, watch, or share prompt',
    errors,
  );

  const pullRequestTemplate = readTemplate('PULL_REQUEST_TEMPLATE.md');
  for (const requiredPrompt of [
    '## Summary',
    '## User Impact',
    '## Linked Issue or Discussion',
    '## Verification',
    '## Screenshots or Recording',
    '## Review Checklist',
    'Project Status is updated if platform support, release distribution, trust caveats, or project scope changed',
    'Accessibility-sensitive changes include keyboard-only or VoiceOver verification',
  ]) {
    requireIncludes(pullRequestTemplate, requiredPrompt, `pull request template ${requiredPrompt} prompt`, errors);
  }

  return errors;
}

function main() {
  const errors = verifyGitHubTemplates();

  if (errors.length > 0) {
    console.error('Template quality check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Template quality check passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyGitHubTemplates,
};
