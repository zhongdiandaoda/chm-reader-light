#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ALLOWED_ROOT_DIRECTORIES = new Set(['CHMReaderLight.app', '__MACOSX']);

function findUnexpectedMetadataEntries(directory, rootPath) {
  const errors = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      errors.push(...findUnexpectedMetadataEntries(entryPath, rootPath));
    } else if (!entry.isFile() || !entry.name.startsWith('._')) {
      errors.push(
        `Unexpected release archive metadata entry: ${path.relative(rootPath, entryPath)}`,
      );
    }
  }
  return errors;
}

function verifyMacosReleaseRoot(rootPath) {
  const errors = [];
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!ALLOWED_ROOT_DIRECTORIES.has(entry.name)) {
      errors.push(`Unexpected release archive root entry: ${entry.name}`);
    } else if (!entry.isDirectory()) {
      errors.push(`Release archive root entry must be a directory: ${entry.name}`);
    }
  }
  if (!entries.some((entry) => entry.name === 'CHMReaderLight.app' && entry.isDirectory())) {
    errors.push('Release archive must contain CHMReaderLight.app as a root directory.');
  }
  const metadataEntry = entries.find(
    (entry) => entry.name === '__MACOSX' && entry.isDirectory(),
  );
  if (metadataEntry) {
    errors.push(...findUnexpectedMetadataEntries(path.join(rootPath, '__MACOSX'), rootPath));
  }

  return errors.sort();
}

function main(argv = process.argv.slice(2)) {
  if (argv.length !== 1) {
    throw new Error('Usage: check-macos-release-root.js <extracted-release-directory>');
  }
  const rootPath = path.resolve(argv[0]);
  if (!fs.existsSync(rootPath) || !fs.statSync(rootPath).isDirectory()) {
    throw new Error(`Expected an extracted release directory: ${rootPath}`);
  }

  const errors = verifyMacosReleaseRoot(rootPath);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
    return;
  }
  console.log(`macOS release archive root verification passed: ${rootPath}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { verifyMacosReleaseRoot };
