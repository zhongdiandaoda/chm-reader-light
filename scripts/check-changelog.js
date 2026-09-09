#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks changelog sections for duplicate bullet entries so release notes stay reviewable.
const rootDir = path.resolve(__dirname, '..');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

function findDuplicateBullets(markdown) {
  const duplicates = [];
  const seenBySection = new Map();
  let currentSection = 'preamble';

  for (const line of markdown.split('\n')) {
    const headingMatch = line.match(/^(#{2,6})\s+(.+?)\s*#*\s*$/);
    if (headingMatch) {
      currentSection = `${headingMatch[1]} ${headingMatch[2].trim()}`;
      if (!seenBySection.has(currentSection)) seenBySection.set(currentSection, new Set());
      continue;
    }

    const bullet = line.trim();
    if (!bullet.startsWith('- ')) continue;

    if (!seenBySection.has(currentSection)) seenBySection.set(currentSection, new Set());
    const seen = seenBySection.get(currentSection);
    if (seen.has(bullet)) {
      duplicates.push(`${currentSection}: ${bullet}`);
      continue;
    }
    seen.add(bullet);
  }

  return duplicates;
}

function main() {
  const changelog = fs.readFileSync(changelogPath, 'utf-8');
  const duplicates = findDuplicateBullets(changelog);

  if (duplicates.length > 0) {
    console.error('Duplicate changelog entries found:');
    for (const duplicate of duplicates) {
      console.error(`- ${duplicate}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Changelog duplicate check passed.');
}

main();
