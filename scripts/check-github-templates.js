#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const issueDir = path.join(rootDir, '.github/ISSUE_TEMPLATE');
const discussionDir = path.join(rootDir, '.github/DISCUSSION_TEMPLATE');

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

function main() {
  const errors = [];
  const config = read('.github/ISSUE_TEMPLATE/config.yml');
  for (const value of [
    'blank_issues_enabled: false',
    'name: Support guide',
    'name: Project README',
    'name: GitHub Discussions',
    'name: Security Policy',
  ]) {
    if (!config.includes(value)) errors.push(`Issue chooser is missing: ${value}`);
  }

  const issueTemplates = fs.readdirSync(issueDir)
    .filter((name) => /[.]ya?ml$/i.test(name) && name !== 'config.yml');
  for (const fileName of issueTemplates) {
    const template = read(path.join('.github/ISSUE_TEMPLATE', fileName));
    for (const pattern of [
      /^name: .+/m,
      /^description: .+/m,
      /^title: "\[[^"]+\]: "/m,
      /^labels: \["[^"]+/m,
    ]) {
      if (!pattern.test(template)) errors.push(`${fileName} is missing ${pattern}.`);
    }
    if (!template.includes('validations:\n      required: true')) {
      errors.push(`${fileName} has no required field.`);
    }
  }

  const discussionTemplates = fs.readdirSync(discussionDir).filter((name) => /[.]ya?ml$/i.test(name));
  for (const fileName of discussionTemplates) {
    const template = read(path.join('.github/DISCUSSION_TEMPLATE', fileName));
    if (!template.includes('validations:\n      required: true')) {
      errors.push(`${fileName} has no required field.`);
    }
  }

  if (errors.length > 0) {
    console.error('Template quality check failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log('Template quality check passed.');
}

main();
