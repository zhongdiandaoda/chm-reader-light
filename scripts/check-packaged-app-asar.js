const fs = require('node:fs');
const path = require('node:path');
const { extractFile, getRawHeader } = require('@electron/asar');

const MAX_APP_ASAR_BYTES = 20 * 1024 * 1024;
const ALLOWED_ROOT_ENTRIES = new Set([
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
  'build',
  'node_modules',
  'package.json',
]);
const REQUIRED_FILES = [
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
  'build/main.js',
  'build/preload.js',
  'build/index.html',
  'package.json',
];
const EXCLUDED_PACKAGING_ASSETS = [
  'build/assets/app-icon.icns',
];

function getAsarFiles(asarPath) {
  return getRawHeader(asarPath).header.files;
}

function hasEntry(files, relativePath) {
  let entries = files;
  const parts = relativePath.split('/');
  for (let index = 0; index < parts.length; index += 1) {
    const entry = entries[parts[index]];
    if (!entry) return false;
    if (index === parts.length - 1) return !entry.files;
    if (!entry.files) return false;
    entries = entry.files;
  }
  return false;
}

function normalizedDependencies(dependencies) {
  return Object.fromEntries(Object.entries(dependencies || {}).sort(([left], [right]) => left.localeCompare(right)));
}

function verifyPackagedAppAsar(asarPath, maxBytes = MAX_APP_ASAR_BYTES, expectedManifest) {
  const errors = [];
  const size = fs.statSync(asarPath).size;
  if (size > maxBytes) {
    errors.push(`Packaged app.asar is ${size} bytes; limit is ${maxBytes} bytes.`);
  }

  const files = getAsarFiles(asarPath);
  for (const entry of Object.keys(files).sort()) {
    if (!ALLOWED_ROOT_ENTRIES.has(entry)) {
      errors.push(`Unexpected app.asar root entry: ${entry}`);
    }
  }
  for (const requiredFile of REQUIRED_FILES) {
    if (!hasEntry(files, requiredFile)) {
      errors.push(`Missing required app.asar file: ${requiredFile}`);
    }
  }
  for (const excludedAsset of EXCLUDED_PACKAGING_ASSETS) {
    if (hasEntry(files, excludedAsset)) {
      errors.push(`Unexpected generated packaging asset in app.asar: ${excludedAsset}`);
    }
  }

  if (hasEntry(files, 'package.json')) {
    let packageJson;
    try {
      packageJson = JSON.parse(extractFile(asarPath, 'package.json').toString('utf8'));
    } catch (error) {
      errors.push(`Could not parse packaged package.json: ${error.message}`);
      return errors;
    }

    if (packageJson.main !== 'build/main.js') {
      errors.push(`Unexpected packaged application entry point: ${packageJson.main || '(missing)'}`);
    }
    if (expectedManifest) {
      for (const field of ['name', 'version']) {
        if (packageJson[field] !== expectedManifest[field]) {
          errors.push(`Packaged package.json ${field} does not match the release source.`);
        }
      }
      if (JSON.stringify(normalizedDependencies(packageJson.dependencies)) !==
          JSON.stringify(normalizedDependencies(expectedManifest.dependencies))) {
        errors.push('Packaged package.json dependencies do not match the release source.');
      }
    }
    for (const dependency of Object.keys(packageJson.dependencies || {}).sort()) {
      if (!hasEntry(files, `node_modules/${dependency}/package.json`)) {
        errors.push(`Missing packaged production dependency: ${dependency}`);
      }
    }
  }

  return errors;
}

function main(argv = process.argv.slice(2)) {
  if (argv.length !== 1) {
    console.error('Usage: check-packaged-app-asar.js <app.asar>');
    process.exitCode = 2;
    return;
  }

  const asarPath = path.resolve(argv[0]);
  if (!fs.existsSync(asarPath)) {
    console.error(`Packaged app.asar does not exist: ${asarPath}`);
    process.exitCode = 1;
    return;
  }

  const expectedManifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
  const errors = verifyPackagedAppAsar(asarPath, MAX_APP_ASAR_BYTES, expectedManifest);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
    return;
  }

  console.log(`Packaged app.asar verification passed: ${asarPath}`);
}

if (require.main === module) main();

module.exports = {
  ALLOWED_ROOT_ENTRIES,
  EXCLUDED_PACKAGING_ASSETS,
  MAX_APP_ASAR_BYTES,
  REQUIRED_FILES,
  verifyPackagedAppAsar,
};
