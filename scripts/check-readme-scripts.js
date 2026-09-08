#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks README script inventory against package.json so contributor commands stay discoverable.
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const readmePath = path.join(rootDir, 'README.md');

function scriptCommand(scriptName) {
  if (scriptName === 'start' || scriptName === 'test') return `npm ${scriptName}`;
  return `npm run ${scriptName}`;
}

function findMissingScripts(packageJson, readme) {
  return Object.keys(packageJson.scripts || {})
    .map(scriptCommand)
    .filter((command) => !readme.includes(`\`${command}\``));
}

function main() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const readme = fs.readFileSync(readmePath, 'utf-8');
  const missingScripts = findMissingScripts(packageJson, readme);

  if (missingScripts.length > 0) {
    console.error('README script inventory is missing package scripts:');
    for (const command of missingScripts) {
      console.error(`- ${command}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('README script inventory check passed.');
}

main();
