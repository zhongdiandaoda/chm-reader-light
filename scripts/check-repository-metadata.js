#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks package discovery metadata against the repository listing guide.
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const listingGuidePath = path.join(rootDir, 'docs', 'repository-listing.md');
const citationPath = path.join(rootDir, 'CITATION.cff');

function extractSection(markdown, heading) {
  const lines = markdown.split('\n');
  const headingLine = `## ${heading}`;
  const startIndex = lines.findIndex((line) => line.trim() === headingLine);
  if (startIndex === -1) return '';

  const sectionLines = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith('## ')) break;
    sectionLines.push(lines[index]);
  }

  return sectionLines.join('\n').trim();
}

function extractTextCodeBlock(section) {
  const match = section.match(/```(?:text)?\n([\s\S]*?)\n```/);
  return match ? match[1].trim() : '';
}

function parseSuggestedTopics(markdown) {
  const topics = new Set();
  const section = extractSection(markdown, 'Suggested Topics');
  const topicPattern = /^- `([^`]+)`$/gm;
  let match;

  while ((match = topicPattern.exec(section)) !== null) {
    topics.add(match[1]);
  }

  return topics;
}

function parseCitationKeywords(citation) {
  const keywords = new Set();
  const lines = citation.split('\n');
  const startIndex = lines.findIndex((line) => line.trim() === 'keywords:');
  if (startIndex === -1) return keywords;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith('  - ')) break;
    keywords.add(line.slice(4).trim());
  }

  return keywords;
}

function findMissingTopics(requiredTopics, availableTopics) {
  return [...requiredTopics].filter((topic) => !availableTopics.has(topic)).sort();
}

function main() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const listingGuide = fs.readFileSync(listingGuidePath, 'utf-8');
  const citation = fs.readFileSync(citationPath, 'utf-8');
  const errors = [];

  const listedDescription = extractTextCodeBlock(extractSection(listingGuide, 'Description'));
  if (listedDescription !== packageJson.description) {
    errors.push(
      `Repository listing description does not match package.json description: expected "${packageJson.description}", found "${listedDescription}".`,
    );
  }

  const listedWebsite = extractTextCodeBlock(extractSection(listingGuide, 'Website'));
  if (listedWebsite !== packageJson.homepage) {
    errors.push(
      `Repository listing website does not match package.json homepage: expected "${packageJson.homepage}", found "${listedWebsite}".`,
    );
  }

  const packageKeywords = new Set(packageJson.keywords || []);
  const listedTopics = parseSuggestedTopics(listingGuide);
  const citationKeywords = parseCitationKeywords(citation);
  const missingTopics = findMissingTopics(packageKeywords, listedTopics);
  const extraTopics = findMissingTopics(listedTopics, packageKeywords);
  const missingCitationKeywords = findMissingTopics(packageKeywords, citationKeywords);

  if (missingTopics.length > 0) {
    errors.push(`Repository listing topics are missing package keywords: ${missingTopics.join(', ')}.`);
  }

  if (extraTopics.length > 0) {
    errors.push(`Package keywords are missing repository listing topics: ${extraTopics.join(', ')}.`);
  }

  if (missingCitationKeywords.length > 0) {
    errors.push(`Citation keywords are missing package keywords: ${missingCitationKeywords.join(', ')}.`);
  }

  if (errors.length > 0) {
    console.error('Repository metadata consistency check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Repository metadata check passed.');
}

main();
