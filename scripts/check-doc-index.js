#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks docs index coverage against published docs guides.
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');
const docsIndexPath = path.join(docsDir, 'index.md');

function collectDocGuides() {
  return fs
    .readdirSync(docsDir)
    .filter((fileName) => fileName.endsWith('.md'))
    .filter((fileName) => fileName !== 'index.md')
    .sort();
}

function collectIndexLinks(markdown) {
  const links = new Set();
  const linkPattern = /\[[^\]]+\]\(\.\/([^)#]+\.md)(?:#[^)]+)?\)/g;
  let match;

  while ((match = linkPattern.exec(markdown)) !== null) {
    links.add(match[1]);
  }

  return links;
}

function main() {
  const docGuides = collectDocGuides();
  const indexLinks = collectIndexLinks(fs.readFileSync(docsIndexPath, 'utf-8'));
  const missingLinks = docGuides.filter((fileName) => !indexLinks.has(fileName));
  const staleLinks = [...indexLinks].filter((fileName) => !docGuides.includes(fileName)).sort();

  if (missingLinks.length > 0 || staleLinks.length > 0) {
    console.error('Documentation index coverage check failed:');

    if (missingLinks.length > 0) {
      console.error('Missing docs/index.md links:');
      for (const fileName of missingLinks) {
        console.error(`- ${fileName}`);
      }
    }

    if (staleLinks.length > 0) {
      console.error('Stale docs/index.md links:');
      for (const fileName of staleLinks) {
        console.error(`- ${fileName}`);
      }
    }

    process.exitCode = 1;
    return;
  }

  console.log('Documentation index check passed.');
}

main();
