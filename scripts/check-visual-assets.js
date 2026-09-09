#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Checks README preview and GitHub social preview assets.
const rootDir = path.resolve(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

function readPngDimensions(relativePath) {
  const file = fs.readFileSync(path.join(rootDir, relativePath));
  const signature = file.subarray(0, 8).toString('hex');

  if (signature !== '89504e470d0a1a0a') {
    throw new Error(`${relativePath} is not a PNG file.`);
  }

  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
  };
}

function requireFile(relativePath, errors) {
  if (!fs.existsSync(path.join(rootDir, relativePath))) {
    errors.push(`${relativePath} is missing.`);
  }
}

function requireContent(relativePath, pattern, description, errors) {
  const content = readText(relativePath);
  if (!pattern.test(content)) {
    errors.push(`${relativePath} is missing ${description}.`);
  }
}

function requireSvgViewBox(relativePath, expectedViewBox, errors) {
  const content = readText(relativePath);
  const pattern = new RegExp(`viewBox="${expectedViewBox.replaceAll(' ', '\\s+')}"`);

  if (!pattern.test(content)) {
    errors.push(`${relativePath} must use viewBox="${expectedViewBox}".`);
  }
}

function requirePngDimensions(relativePath, expectedWidth, expectedHeight, errors) {
  try {
    const dimensions = readPngDimensions(relativePath);
    if (dimensions.width !== expectedWidth || dimensions.height !== expectedHeight) {
      errors.push(`${relativePath} must be ${expectedWidth} x ${expectedHeight}, found ${dimensions.width} x ${dimensions.height}.`);
    }
  } catch (error) {
    errors.push(error.message);
  }
}

function sha256(relativePath) {
  return crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(rootDir, relativePath)))
    .digest('hex');
}

function verifyGeneratedAssetManifest(
  manifest,
  expectedSourcePath,
  actualSourceHash,
  expectedOutputPath,
  actualOutputHash,
) {
  if (manifest.version !== 1
      || manifest.source?.path !== expectedSourcePath
      || manifest.output?.path !== expectedOutputPath) {
    return 'must describe the current social preview source and output';
  }

  if (manifest.source.sha256 !== actualSourceHash
      || manifest.output.sha256 !== actualOutputHash) {
    return 'is stale; run npm run generate:social-preview';
  }

  return null;
}

function requireGeneratedAssetManifest(relativePath, expectedSourcePath, expectedOutputPath, errors) {
  try {
    const manifest = JSON.parse(readText(relativePath));
    const error = verifyGeneratedAssetManifest(
      manifest,
      expectedSourcePath,
      sha256(expectedSourcePath),
      expectedOutputPath,
      sha256(expectedOutputPath),
    );
    if (error) errors.push(`${relativePath} ${error}.`);
  } catch (error) {
    errors.push(`${relativePath} could not be validated: ${error.message}`);
  }
}

function requireSocialPreviewSafeLayout(relativePath, errors) {
  const content = readText(relativePath);
  const title = content.match(/<text x="(\d+)" y="324"[^>]*font-size="(\d+)"[^>]*>CHMReaderLight<\/text>/);
  const productWindow = content.match(/<rect x="(\d+)" y="92" width="(\d+)" height="396"/);

  if (!title || !productWindow) {
    errors.push(`${relativePath} must expose the social title and product-window geometry for overlap checks.`);
    return;
  }

  const titleRightEdge = Number(title[1]) + ('CHMReaderLight'.length * Number(title[2]) * 0.62);
  const productWindowLeftEdge = Number(productWindow[1]);
  const minimumGap = 32;
  if (titleRightEdge + minimumGap > productWindowLeftEdge) {
    errors.push(`${relativePath} title overlaps the product window safe area.`);
  }

  const firstSupportingLine = /<text x="82" y="426"[^>]*>Manage local manuals and search contents[.]<\/text>/.test(content);
  const secondSupportingLine = /<text x="82" y="458"[^>]*>Read safely without cloud sync[.]<\/text>/.test(content);
  if (!firstSupportingLine || !secondSupportingLine) {
    errors.push(`${relativePath} must wrap the supporting copy inside the left text column.`);
  }
}

function main() {
  const errors = [];

  for (const relativePath of [
    'docs/assets/app-preview.png',
    'docs/assets/social-preview.svg',
    'docs/assets/social-preview.png',
    'docs/assets/social-preview.manifest.json',
  ]) {
    requireFile(relativePath, errors);
  }

  if (errors.length === 0) {
    requireContent('README.md', /!\[CHMReaderLight 实际空书库界面\]\(\.\/docs\/assets\/app-preview\.png\)/, 'README real-app screenshot reference', errors);
    requireContent('README.en.md', /!\[Actual CHMReaderLight empty library\]\(\.\/docs\/assets\/app-preview\.png\)/, 'English README real-app screenshot reference', errors);
    requireContent('docs/repository-listing.md', /docs\/assets\/social-preview\.png/, 'GitHub social preview PNG guidance', errors);
    requireContent('docs/repository-listing.md', /1280 x 640/, 'GitHub social preview dimensions', errors);
    requirePngDimensions('docs/assets/app-preview.png', 1280, 760, errors);
    requireSvgViewBox('docs/assets/social-preview.svg', '0 0 1280 640', errors);
    requirePngDimensions('docs/assets/social-preview.png', 1280, 640, errors);
    requireSocialPreviewSafeLayout('docs/assets/social-preview.svg', errors);
    requireGeneratedAssetManifest(
      'docs/assets/social-preview.manifest.json',
      'docs/assets/social-preview.svg',
      'docs/assets/social-preview.png',
      errors,
    );
  }

  if (errors.length > 0) {
    console.error('Visual asset check failed:');
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Visual asset check passed.');
}

if (require.main === module) main();

module.exports = { verifyGeneratedAssetManifest };
