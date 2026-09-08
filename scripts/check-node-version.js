#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks Node.js version alignment across local setup, package metadata, and CI.
const rootDir = path.resolve(__dirname, '..');
const expectedMajor = '22';
const expectedWorkflowVersion = "node-version: '22'";

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

function parseNvmrcMajor(nvmrc) {
  return nvmrc.trim().replace(/^v/, '').split('.')[0];
}

function requireIncludes(content, expectedText, description, errors) {
  if (!content.includes(expectedText)) {
    errors.push(`Missing ${description}: ${expectedText}`);
  }
}

function verifyNodeVersionAlignment() {
  const packageJson = JSON.parse(readText('package.json'));
  const nvmrc = readText('.nvmrc');
  const readme = readText('README.md');
  const englishReadme = readText('README.en.md');
  const contributing = readText('CONTRIBUTING.md');
  const ciWorkflow = readText('.github/workflows/ci.yml');
  const releaseWorkflow = readText('.github/workflows/release.yml');
  const errors = [];

  const nvmrcMajor = parseNvmrcMajor(nvmrc);
  if (nvmrcMajor !== expectedMajor) {
    errors.push(`.nvmrc should use Node.js ${expectedMajor}, found ${nvmrc.trim() || '(empty)'}.`);
  }

  if (packageJson.engines?.node !== `>=${expectedMajor}`) {
    errors.push(`package.json engines.node should be >=${expectedMajor}.`);
  }

  for (const [relativePath, content] of [
    ['.github/workflows/ci.yml', ciWorkflow],
    ['.github/workflows/release.yml', releaseWorkflow],
  ]) {
    requireIncludes(content, expectedWorkflowVersion, `${relativePath} setup-node version`, errors);
  }

  requireIncludes(readme, `Node.js ${expectedMajor}`, 'README Node.js requirement', errors);
  requireIncludes(readme, '[![Node.js 22+]', 'README Node.js badge', errors);
  requireIncludes(englishReadme, `Node.js ${expectedMajor}`, 'English README Node.js requirement', errors);
  requireIncludes(contributing, `Node.js ${expectedMajor}`, 'CONTRIBUTING Node.js requirement', errors);
  requireIncludes(contributing, 'nvm use', 'CONTRIBUTING nvm guidance', errors);

  return errors;
}

function main() {
  const errors = verifyNodeVersionAlignment();

  if (errors.length > 0) {
    console.error('Node version check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Node version check passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  parseNvmrcMajor,
  verifyNodeVersionAlignment,
};
