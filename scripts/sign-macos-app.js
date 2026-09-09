#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function createAdhocSignOptions(appPath) {
  return {
    app: appPath,
    identity: '-',
    identityValidation: false,
    preAutoEntitlements: false,
    preEmbedProvisioningProfile: false,
    optionsForFile: () => ({ hardenedRuntime: false }),
    ignore: [new RegExp(`${path.sep}Resources${path.sep}native${path.sep}`)],
  };
}

async function signMacApp(appPath) {
  const resolvedAppPath = path.resolve(appPath);
  if (!resolvedAppPath.endsWith('.app') || !fs.existsSync(resolvedAppPath)) {
    throw new Error(`Expected an existing macOS .app bundle: ${resolvedAppPath}`);
  }

  const { sign } = await import('@electron/osx-sign');
  await sign(createAdhocSignOptions(resolvedAppPath));

  execFileSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', resolvedAppPath], {
    stdio: 'inherit',
  });
  console.log(`Ad-hoc signed and verified macOS app: ${resolvedAppPath}`);
}

async function main(argv) {
  if (argv.length !== 3) {
    throw new Error('Usage: sign-macos-app.js <CHMReaderLight.app>');
  }
  await signMacApp(argv[2]);
}

if (require.main === module) {
  main(process.argv).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { createAdhocSignOptions, signMacApp };
