#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const FUSE_SENTINEL = Buffer.from('dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX');
const FUSE_SCAN_CHUNK_BYTES = 4 * 1024 * 1024;
const EXPECTED_FUSE_STATES = [
  ['RunAsNode', 48],
  ['EnableCookieEncryption', 49],
  ['EnableNodeOptionsEnvironmentVariable', 48],
  ['EnableNodeCliInspectArguments', 48],
  ['EnableEmbeddedAsarIntegrityValidation', 49],
  ['OnlyLoadAppFromAsar', 49],
  ['LoadBrowserProcessSpecificV8Snapshot', 48],
  ['GrantFileProtocolExtraPrivileges', 49],
  ['WasmTrapHandlers', 49],
];

function verifyElectronFuseWires(fuseWires) {
  const errors = [];
  for (const [sliceIndex, fuseWire] of fuseWires.entries()) {
    if (fuseWire.version !== '1') {
      errors.push(
        'Unexpected Electron fuse wire version ' + fuseWire.version
          + ' in binary slice ' + (sliceIndex + 1) + '.',
      );
      continue;
    }
    for (let optionIndex = 0; optionIndex < EXPECTED_FUSE_STATES.length; optionIndex += 1) {
      const [optionName, expectedState] = EXPECTED_FUSE_STATES[optionIndex];
      if (fuseWire[optionIndex] !== expectedState) {
        errors.push(
          'Unexpected Electron fuse state for ' + optionName
            + ' in binary slice ' + (sliceIndex + 1) + '.',
        );
      }
    }
  }
  return errors;
}

async function readElectronFuseWires(appPath) {
  const { pathToFuseFile } = await import('@electron/fuses');
  const handle = await fs.promises.open(pathToFuseFile(appPath), 'r');
  try {
    const positions = [];
    const buffer = Buffer.allocUnsafe(FUSE_SCAN_CHUNK_BYTES);
    let carry = Buffer.alloc(0);
    let offset = 0;
    for (;;) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, offset);
      if (bytesRead === 0) break;
      const chunk = buffer.subarray(0, bytesRead);
      const searchable = carry.length > 0 ? Buffer.concat([carry, chunk]) : chunk;
      const baseOffset = offset - carry.length;
      let index = searchable.indexOf(FUSE_SENTINEL);
      while (index !== -1) {
        positions.push(baseOffset + index);
        index = searchable.indexOf(FUSE_SENTINEL, index + 1);
      }
      carry = Buffer.from(searchable.subarray(
        Math.max(0, searchable.length - FUSE_SENTINEL.length + 1),
      ));
      offset += bytesRead;
    }

    if (positions.length === 0) {
      throw new Error('Could not find an Electron fuse sentinel in the packaged binary.');
    }
    if (positions.length > 2) {
      throw new Error('Found ' + positions.length + ' Electron fuse sentinels; expected at most two.');
    }

    const fuseWires = [];
    for (const sentinelPosition of positions) {
      const header = Buffer.alloc(2);
      const headerRead = await handle.read(
        header,
        0,
        header.length,
        sentinelPosition + FUSE_SENTINEL.length,
      );
      if (headerRead.bytesRead !== header.length) {
        throw new Error('Electron fuse wire header is truncated.');
      }
      const wire = Buffer.alloc(header[1]);
      const wireRead = await handle.read(
        wire,
        0,
        wire.length,
        sentinelPosition + FUSE_SENTINEL.length + header.length,
      );
      if (wireRead.bytesRead !== wire.length) throw new Error('Electron fuse wire is truncated.');
      fuseWires.push(Object.assign({ version: String(header[0]) }, [...wire]));
    }
    return fuseWires;
  } finally {
    await handle.close();
  }
}

async function verifyElectronFuses(appPath) {
  const resolvedAppPath = path.resolve(appPath);
  if (!resolvedAppPath.endsWith('.app') || !fs.existsSync(resolvedAppPath)) {
    return ['Expected an existing macOS .app bundle: ' + resolvedAppPath];
  }

  return verifyElectronFuseWires(await readElectronFuseWires(resolvedAppPath));
}

async function main(argv) {
  if (argv.length !== 3) {
    throw new Error('Usage: check-electron-fuses.js <CHMReaderLight.app>');
  }
  const errors = await verifyElectronFuses(argv[2]);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
    return;
  }
  console.log('Electron fuse verification passed: ' + path.resolve(argv[2]));
}

if (require.main === module) {
  main(process.argv).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { readElectronFuseWires, verifyElectronFuses, verifyElectronFuseWires };
