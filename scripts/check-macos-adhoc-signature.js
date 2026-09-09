#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function verifyAdhocSignatureDetails(label, details) {
  const errors = [];
  if (!/^Signature=adhoc$/m.test(details)) {
    errors.push(`${label} is not ad-hoc signed.`);
  }
  if (!/^TeamIdentifier=not set$/m.test(details)) {
    errors.push(`${label} unexpectedly has a signing TeamIdentifier.`);
  }
  if (/^CodeDirectory .*[(][^)]*\bruntime\b[^)]*[)]/m.test(details)) {
    errors.push(`${label} unexpectedly enables hardened runtime for an ad-hoc signature.`);
  }
  return errors;
}

function readSignatureDetails(targetPath) {
  const result = spawnSync('/usr/bin/codesign', ['-dvvv', targetPath], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`Could not read code signature for ${targetPath}: ${(result.stderr || result.stdout).trim()}`);
  }
  return `${result.stdout || ''}${result.stderr || ''}`;
}

const MACHO_MAGICS = new Set([
  0xfeedface,
  0xcefaedfe,
  0xfeedfacf,
  0xcffaedfe,
  0xcafebabe,
  0xbebafeca,
  0xcafebabf,
  0xbfbafeca,
]);

function isMachOFile(filePath) {
  const fileDescriptor = fs.openSync(filePath, 'r');
  const header = Buffer.alloc(4);
  try {
    return fs.readSync(fileDescriptor, header, 0, header.length, 0) === header.length
      && MACHO_MAGICS.has(header.readUInt32BE(0));
  } finally {
    fs.closeSync(fileDescriptor);
  }
}

function findMachOFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMachOFiles(entryPath));
    } else if (entry.isFile() && isMachOFile(entryPath)) {
      files.push(entryPath);
    }
  }
  return files.sort();
}

function verifyMacosAdhocSignature(
  appPath,
  { readDetails = readSignatureDetails } = {},
) {
  return findMachOFiles(appPath).flatMap((targetPath) => {
    const label = path.relative(appPath, targetPath);
    return verifyAdhocSignatureDetails(label, readDetails(targetPath));
  });
}

function main(argv = process.argv.slice(2)) {
  if (argv.length !== 1) {
    throw new Error('Usage: check-macos-adhoc-signature.js <CHMReaderLight.app>');
  }
  const appPath = path.resolve(argv[0]);
  if (!appPath.endsWith('.app') || !fs.existsSync(appPath)) {
    throw new Error(`Expected an existing macOS .app bundle: ${appPath}`);
  }
  const errors = verifyMacosAdhocSignature(appPath);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
    return;
  }
  console.log(`macOS ad-hoc signature policy verification passed: ${appPath}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  findMachOFiles,
  isMachOFile,
  readSignatureDetails,
  verifyAdhocSignatureDetails,
  verifyMacosAdhocSignature,
};
