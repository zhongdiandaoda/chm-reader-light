#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks GitHub label definitions against issue templates, Dependabot, release notes, and documentation.
const rootDir = path.resolve(__dirname, '..');
const labelsConfigPath = path.join(rootDir, '.github', 'labels.yml');
const releaseConfigPath = path.join(rootDir, '.github', 'release.yml');
const dependabotPath = path.join(rootDir, '.github', 'dependabot.yml');
const repositoryListingPath = path.join(rootDir, 'docs', 'repository-listing.md');
const issueTemplateDir = path.join(rootDir, '.github', 'ISSUE_TEMPLATE');

function parseLabelNames(yaml) {
  const labels = new Set();
  const namePattern = /^\s*-\s+name:\s*["']?([^"'\n]+?)["']?\s*$/gm;
  let match;

  while ((match = namePattern.exec(yaml)) !== null) {
    labels.add(match[1].trim());
  }

  return labels;
}

function parseInlineLabels(value) {
  return value
    .split(',')
    .map((label) => label.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

function collectYamlLabels(yaml) {
  const labels = new Set();
  const lines = yaml.split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const inlineMatch = line.match(/^\s*labels:\s*\[(.*)\]\s*$/);
    if (inlineMatch) {
      for (const label of parseInlineLabels(inlineMatch[1])) labels.add(label);
      continue;
    }

    const blockMatch = line.match(/^(\s*)labels:\s*$/);
    if (!blockMatch) continue;

    const parentIndent = blockMatch[1].length;
    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      const nextLine = lines[nextIndex];
      if (!nextLine.trim()) continue;

      const itemMatch = nextLine.match(/^(\s*)-\s+["']?([^"'\n]+?)["']?\s*$/);
      if (!itemMatch) {
        if (nextLine.search(/\S/) <= parentIndent) break;
        continue;
      }

      if (itemMatch[1].length <= parentIndent) break;
      labels.add(itemMatch[2].trim());
    }
  }

  return labels;
}

function collectIssueTemplateFiles() {
  return fs
    .readdirSync(issueTemplateDir)
    .filter((fileName) => /\.ya?ml$/i.test(fileName))
    .map((fileName) => path.join(issueTemplateDir, fileName));
}

function collectRepositoryListingLabels(markdown) {
  const labels = new Set();
  const issueLabelsSection = markdown.match(/## Issue Labels\n\n([\s\S]*?)(?:\n## |\n$)/);
  if (!issueLabelsSection) return labels;

  const labelPattern = /^- `([^`]+)`/gm;
  let match;
  while ((match = labelPattern.exec(issueLabelsSection[1])) !== null) {
    labels.add(match[1]);
  }

  return labels;
}

function collectReferencedLabels() {
  const labels = new Set();
  const yamlFiles = [releaseConfigPath, dependabotPath, ...collectIssueTemplateFiles()];

  for (const filePath of yamlFiles) {
    const yaml = fs.readFileSync(filePath, 'utf-8');
    for (const label of collectYamlLabels(yaml)) {
      if (label !== '*') labels.add(label);
    }
  }

  const repositoryListing = fs.readFileSync(repositoryListingPath, 'utf-8');
  for (const label of collectRepositoryListingLabels(repositoryListing)) {
    labels.add(label);
  }

  return labels;
}

function findMissingLabels(definedLabels, referencedLabels) {
  return [...referencedLabels].filter((label) => !definedLabels.has(label)).sort();
}

function main() {
  const definedLabels = parseLabelNames(fs.readFileSync(labelsConfigPath, 'utf-8'));
  const referencedLabels = collectReferencedLabels();
  const missingLabels = findMissingLabels(definedLabels, referencedLabels);

  if (missingLabels.length > 0) {
    console.error('GitHub label definitions are missing referenced labels:');
    for (const label of missingLabels) {
      console.error(`- ${label}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('GitHub label check passed.');
}

main();
