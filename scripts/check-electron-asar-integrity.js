#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { getRawHeader } = require('@electron/asar');

const ASAR_RELATIVE_PATH = 'Resources/app.asar';

function verifyElectronAsarIntegrity(asarPath, metadata) {
  if (!metadata || typeof metadata !== 'object') {
    return [`Missing ElectronAsarIntegrity metadata for ${ASAR_RELATIVE_PATH}.`];
  }
  if (metadata.algorithm !== 'SHA256') {
    return [`Unexpected ElectronAsarIntegrity algorithm: ${metadata.algorithm || '(missing)'}.`];
  }
  const { headerString } = getRawHeader(asarPath);
  const expectedHash = crypto.createHash('sha256').update(headerString).digest('hex');
  if (metadata.hash !== expectedHash) {
    return ['ElectronAsarIntegrity hash does not match the packaged app.asar header.'];
  }
  return [];
}

function readElectronAsarIntegrity(appPath) {
  const infoPlist = path.join(appPath, 'Contents', 'Info.plist');
  const plist = JSON.parse(execFileSync('/usr/bin/plutil', [
    '-convert',
    'json',
    '-o',
    '-',
    infoPlist,
  ], { encoding: 'utf8' }));
  return plist.ElectronAsarIntegrity?.[ASAR_RELATIVE_PATH];
}

function main(argv = process.argv.slice(2)) {
  if (argv.length !== 1) {
    throw new Error('Usage: check-electron-asar-integrity.js <CHMReaderLight.app>');
  }
  const appPath = path.resolve(argv[0]);
  const asarPath = path.join(appPath, 'Contents', ASAR_RELATIVE_PATH);
  if (!appPath.endsWith('.app') || !fs.existsSync(asarPath)) {
    throw new Error(`Expected a macOS app bundle containing app.asar: ${appPath}`);
  }
  const errors = verifyElectronAsarIntegrity(asarPath, readElectronAsarIntegrity(appPath));
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
    return;
  }
  console.log(`Electron ASAR integrity verification passed: ${appPath}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { ASAR_RELATIVE_PATH, readElectronAsarIntegrity, verifyElectronAsarIntegrity };
