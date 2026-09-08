#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks required community health files, templates, and trust workflows.
const rootDir = path.resolve(__dirname, '..');

function collectRequiredPaths() {
  return [
    'README.md',
    'README.en.md',
    'LICENSE',
    'CODE_OF_CONDUCT.md',
    'CODE_OF_CONDUCT.zh-CN.md',
    'CONTRIBUTING.md',
    'CONTRIBUTING.zh-CN.md',
    'SECURITY.md',
    'SECURITY.zh-CN.md',
    'SUPPORT.md',
    'SUPPORT.zh-CN.md',
    'CITATION.cff',
    'docs/community-standards.md',
    'docs/governance.md',
    'docs/governance.zh-CN.md',
    '.github/CODEOWNERS',
    '.github/PULL_REQUEST_TEMPLATE.md',
    '.github/copilot-instructions.md',
    '.github/dependabot.yml',
    '.github/labels.yml',
    '.github/ISSUE_TEMPLATE/config.yml',
    '.github/ISSUE_TEMPLATE/accessibility.yml',
    '.github/ISSUE_TEMPLATE/bug_report.yml',
    '.github/ISSUE_TEMPLATE/chm_compatibility.yml',
    '.github/ISSUE_TEMPLATE/documentation.yml',
    '.github/ISSUE_TEMPLATE/feature_request.yml',
    '.github/ISSUE_TEMPLATE/good_first_task.yml',
    '.github/ISSUE_TEMPLATE/install_help.yml',
    '.github/ISSUE_TEMPLATE/performance.yml',
    '.github/ISSUE_TEMPLATE/question.yml',
    '.github/ISSUE_TEMPLATE/showcase.yml',
    '.github/DISCUSSION_TEMPLATE/q-a.yml',
    '.github/DISCUSSION_TEMPLATE/release-feedback.yml',
    '.github/DISCUSSION_TEMPLATE/show-and-tell.yml',
    '.github/workflows/ci.yml',
    '.github/workflows/codeql.yml',
    '.github/workflows/dependency-review.yml',
    '.github/workflows/release.yml',
    '.github/workflows/scorecard.yml',
  ];
}

function findMissingPaths(requiredPaths) {
  return requiredPaths.filter((relativePath) => !fs.existsSync(path.join(rootDir, relativePath)));
}

function requireContent(relativePath, pattern, description, errors) {
  const absolutePath = path.join(rootDir, relativePath);
  const content = fs.readFileSync(absolutePath, 'utf-8');
  if (!pattern.test(content)) {
    errors.push(`${relativePath} is missing ${description}.`);
  }
}

function main() {
  const requiredPaths = collectRequiredPaths();
  const missingPaths = findMissingPaths(requiredPaths);
  const errors = [];

  if (missingPaths.length > 0) {
    errors.push('Missing required community health files:');
    for (const relativePath of missingPaths) {
      errors.push(`- ${relativePath}`);
    }
  }

  if (missingPaths.length === 0) {
    requireContent('.github/ISSUE_TEMPLATE/config.yml', /blank_issues_enabled:\s*false/, 'disabled blank issues', errors);
    requireContent('.github/ISSUE_TEMPLATE/config.yml', /GitHub Discussions/, 'GitHub Discussions contact link', errors);
    requireContent('.github/ISSUE_TEMPLATE/config.yml', /Security Policy/, 'private security reporting contact link', errors);
    requireContent('.github/CODEOWNERS', /\/docs\/\s+@zhongdiandaoda/, 'docs review ownership', errors);
    requireContent('.github/CODEOWNERS', /\/CODE_OF_CONDUCT\.zh-CN\.md\s+@zhongdiandaoda/, 'Chinese code of conduct ownership', errors);
    requireContent('.github/CODEOWNERS', /\/CONTRIBUTING\.zh-CN\.md\s+@zhongdiandaoda/, 'Chinese contributing guide ownership', errors);
    requireContent('.github/CODEOWNERS', /\/docs\/governance\.zh-CN\.md\s+@zhongdiandaoda/, 'Chinese governance guide ownership', errors);
    requireContent('.github/CODEOWNERS', /\/SECURITY\.zh-CN\.md\s+@zhongdiandaoda/, 'Chinese security policy ownership', errors);
    requireContent('.github/CODEOWNERS', /\/SUPPORT\.zh-CN\.md\s+@zhongdiandaoda/, 'Chinese support guide ownership', errors);
    requireContent('.github/CODEOWNERS', /\/\.github\/ISSUE_TEMPLATE\/\s+@zhongdiandaoda/, 'issue template review ownership', errors);
    requireContent('.github/CODEOWNERS', /\/\.github\/DISCUSSION_TEMPLATE\/\s+@zhongdiandaoda/, 'discussion template review ownership', errors);
    requireContent('.github/workflows/ci.yml', /npm run check/, 'default quality gate', errors);
    requireContent('.github/workflows/codeql.yml', /github\/codeql-action\/analyze/, 'CodeQL analysis', errors);
    requireContent('.github/workflows/dependency-review.yml', /actions\/dependency-review-action/, 'Dependency Review analysis', errors);
    requireContent('.github/workflows/dependency-review.yml', /fail-on-severity:\s*moderate/, 'moderate severity dependency review blocking', errors);
    requireContent('.github/workflows/scorecard.yml', /ossf\/scorecard-action/, 'OpenSSF Scorecard analysis', errors);
    requireContent('SUPPORT.md', /GitHub Discussions/, 'community support routing', errors);
    requireContent('CODE_OF_CONDUCT.zh-CN.md', /尊重不同经验水平、语言背景和运行环境/, 'Chinese participation expectations', errors);
    requireContent('CODE_OF_CONDUCT.zh-CN.md', /\[中文安全政策\]\(\.\/SECURITY\.zh-CN\.md\)/, 'Chinese private escalation path', errors);
    requireContent('SECURITY.md', /private (?:vulnerability )?reporting|privately/i, 'private vulnerability reporting guidance', errors);
    requireContent('SECURITY.zh-CN.md', /不要在公开 issue 中发布漏洞细节/, 'Chinese private vulnerability reporting guidance', errors);
    requireContent('README.md', /\[中文行为准则\]\(\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/, 'Chinese code of conduct link', errors);
    requireContent('README.en.md', /\[Chinese Code of Conduct\]\(\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/, 'Chinese code of conduct cross-link', errors);
    requireContent('CONTRIBUTING.zh-CN.md', /\[中文行为准则\]\(\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/, 'Chinese contributing code of conduct link', errors);
    requireContent('SUPPORT.zh-CN.md', /\[中文行为准则\]\(\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/, 'Chinese support code of conduct link', errors);
    requireContent('docs/community-standards.md', /\[CODE_OF_CONDUCT\.zh-CN\.md\]\(\.\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/, 'Chinese code of conduct checklist item', errors);
    requireContent('docs/governance.zh-CN.md', /使用 GitHub Issues 跟踪 bug、兼容性报告、功能请求、文档改进和范围清楚的新手任务/, 'Chinese governance decision paths', errors);
    requireContent('README.md', /\[中文治理指南\]\(\.\/docs\/governance\.zh-CN\.md\)/, 'Chinese governance guide link', errors);
    requireContent('README.en.md', /\[Chinese Governance Guide\]\(\.\/docs\/governance\.zh-CN\.md\)/, 'Chinese governance guide cross-link', errors);
    requireContent('CONTRIBUTING.zh-CN.md', /\[中文治理指南\]\(\.\/docs\/governance\.zh-CN\.md\)/, 'Chinese contributing governance link', errors);
    requireContent('docs/community-standards.md', /\[Chinese Governance Guide\]\(\.\/governance\.zh-CN\.md\)/, 'Chinese governance checklist item', errors);
    requireContent('README.md', /\[中文安全政策\]\(\.\/SECURITY\.zh-CN\.md\)/, 'Chinese security policy link', errors);
    requireContent('README.en.md', /\[Chinese Security Policy\]\(\.\/SECURITY\.zh-CN\.md\)/, 'Chinese security policy cross-link', errors);
    requireContent('SUPPORT.md', /\[Chinese Security Policy\]\(\.\/SECURITY\.zh-CN\.md\)/, 'Chinese security policy support link', errors);
    requireContent('SECURITY.md', /\[中文安全政策\]\(\.\/SECURITY\.zh-CN\.md\)/, 'Chinese security policy backlink', errors);
    requireContent('SUPPORT.zh-CN.md', /GitHub Discussions/, 'Chinese community support routing', errors);
    requireContent('README.md', /\[中文支持指南\]\(\.\/SUPPORT\.zh-CN\.md\)/, 'Chinese support guide link', errors);
    requireContent('README.en.md', /\[Chinese Support Guide\]\(\.\/SUPPORT\.zh-CN\.md\)/, 'Chinese support guide cross-link', errors);
    requireContent('SUPPORT.md', /\[中文支持指南\]\(\.\/SUPPORT\.zh-CN\.md\)/, 'Chinese support guide backlink', errors);
    requireContent('docs/community-standards.md', /\[SUPPORT\.zh-CN\.md\]\(\.\.\/SUPPORT\.zh-CN\.md\)/, 'Chinese support guide checklist item', errors);
    requireContent('README.md', /\[中文贡献指南\]\(\.\/CONTRIBUTING\.zh-CN\.md\)/, 'Chinese contributing guide link', errors);
    requireContent('README.en.md', /\[Chinese Contributing Guide\]\(\.\/CONTRIBUTING\.zh-CN\.md\)/, 'Chinese contributing guide cross-link', errors);
    requireContent('docs/community-standards.md', /\[CONTRIBUTING\.zh-CN\.md\]\(\.\.\/CONTRIBUTING\.zh-CN\.md\)/, 'Chinese contributing guide checklist item', errors);
  }

  if (errors.length > 0) {
    console.error('Community health check failed:');
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Community health check passed.');
}

main();
