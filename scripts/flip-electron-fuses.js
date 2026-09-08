#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

async function flipElectronFuses(appPath) {
  const resolvedAppPath = path.resolve(appPath);
  if (!resolvedAppPath.endsWith('.app') || !fs.existsSync(resolvedAppPath)) {
    throw new Error(`Expected an existing macOS .app bundle: ${resolvedAppPath}`);
  }

  const { flipFuses, FuseVersion, FuseV1Options } = await import('@electron/fuses');
  await flipFuses(resolvedAppPath, {
    version: FuseVersion.V1,
    strictlyRequireAllFuses: true,
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
    [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: false,
    [FuseV1Options.GrantFileProtocolExtraPrivileges]: true,
    [FuseV1Options.WasmTrapHandlers]: true,
  });
}

async function main(argv) {
  if (argv.length !== 3) {
    throw new Error('Usage: flip-electron-fuses.js <CHMReaderLight.app>');
  }
  await flipElectronFuses(argv[2]);
}

if (require.main === module) {
  main(process.argv).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { flipElectronFuses };
