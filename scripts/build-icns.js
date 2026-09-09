#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ICON_ENTRIES = [
  ['ic04', 'icon_16x16.png', 16],
  ['ic11', 'icon_16x16@2x.png', 32],
  ['ic05', 'icon_32x32.png', 32],
  ['ic12', 'icon_32x32@2x.png', 64],
  ['ic07', 'icon_128x128.png', 128],
  ['ic13', 'icon_128x128@2x.png', 256],
  ['ic08', 'icon_256x256.png', 256],
  ['ic14', 'icon_256x256@2x.png', 512],
  ['ic09', 'icon_512x512.png', 512],
  ['ic10', 'icon_512x512@2x.png', 1024],
];

function readPng(filePath, expectedSize) {
  const png = fs.readFileSync(filePath);
  const signature = png.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    throw new Error(`Not a PNG file: ${filePath}`);
  }

  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== expectedSize || height !== expectedSize) {
    throw new Error(`Expected ${expectedSize}x${expectedSize} PNG at ${filePath}, got ${width}x${height}.`);
  }

  return png;
}

function makeChunk(type, data) {
  const header = Buffer.alloc(8);
  header.write(type, 0, 4, 'ascii');
  header.writeUInt32BE(header.length + data.length, 4);
  return Buffer.concat([header, data]);
}

function buildIcns(iconsetDir, outputPath) {
  const chunks = ICON_ENTRIES.map(([type, filename, size]) => (
    makeChunk(type, readPng(path.join(iconsetDir, filename), size))
  ));
  const fileSize = 8 + chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const header = Buffer.alloc(8);
  header.write('icns', 0, 4, 'ascii');
  header.writeUInt32BE(fileSize, 4);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.concat([header, ...chunks], fileSize));
}

function main(argv) {
  if (argv.length !== 4) {
    console.error('Usage: build-icns.js <iconset-directory> <output.icns>');
    process.exitCode = 2;
    return;
  }

  const iconsetDir = path.resolve(argv[2]);
  const outputPath = path.resolve(argv[3]);
  buildIcns(iconsetDir, outputPath);
  console.log(`Generated macOS icon: ${outputPath}`);
}

if (require.main === module) {
  try {
    main(process.argv);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  ICON_ENTRIES,
  buildIcns,
};
