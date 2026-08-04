const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = process.cwd();
export { };

test('content iframe allows the injected navigation bridge to run', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const iframe = html.match(/<iframe\s+[^>]*id="content-frame"[^>]*>/s)?.[0] || '';
  const sandbox = iframe.match(/sandbox="([^"]+)"/)?.[1] || '';

  assert.match(sandbox, /\ballow-same-origin\b/);
  assert.match(sandbox, /\ballow-scripts\b/);
});

test('compiled renderer is loaded as an ES module', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  assert.match(html, /<script type="module" src="\.\/renderer\.js"><\/script>/);
});

test('reader toolbar places text encoding picker after zoom controls', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const readerToolbar = html.match(/<header class="app-header" id="reader-toolbar"[\s\S]*?<\/header>/)?.[0] || '';
  const toolbarRight = readerToolbar.match(/<div class="toolbar-right">[\s\S]*?<\/div>\s*<\/div>\s*<\/header>/)?.[0] || '';

  const zoomInIndex = toolbarRight.indexOf('id="zoom-in"');
  const encodingIndex = toolbarRight.indexOf('id="text-encoding"');

  assert.ok(zoomInIndex >= 0, 'reader toolbar should include zoom-in control');
  assert.ok(encodingIndex > zoomInIndex, 'text encoding picker should sit to the right of zoom controls');
  assert.match(toolbarRight, /<select id="text-encoding"[^>]*aria-label="文本编码"/);
  assert.match(toolbarRight, /<option value="auto">默认编码<\/option>/);
  assert.match(toolbarRight, /<option value="gbk">简体中文 \(GBK\)<\/option>/);
  assert.match(toolbarRight, /<option value="gb18030">简体中文 \(GB18030\)<\/option>/);
});

test('runtime prefers the bundled CHM extractor', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /resourcesPath, 'native', nativeName, 'bin', 'extract_chmLib'/);
  assert.match(main, /resources', 'native', nativeName, 'bin', 'extract_chmLib'/);
});

test('macOS packaging vendors chmlib into the app bundle', () => {
  const packageScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'package-macos.sh'), 'utf-8');
  const vendorScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'vendor-chmlib-macos.sh'), 'utf-8');

  assert.match(packageScript, /vendor-chmlib-macos[.]sh/);
  assert.match(vendorScript, /install_name_tool -change/);
  assert.match(vendorScript, /codesign --force --sign -/);
  assert.match(vendorScript, /Contents\/Resources\/native\/darwin-\$arch/);
});
