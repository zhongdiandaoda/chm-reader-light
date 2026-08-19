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
  assert.match(toolbarRight, /<button class="encoding-trigger" id="text-encoding"[^>]*aria-haspopup="listbox"/);
  assert.match(toolbarRight, /<div class="encoding-menu" id="text-encoding-menu" role="listbox"[^>]*hidden>/);
  assert.doesNotMatch(toolbarRight, /<select id="text-encoding"/);
  assert.match(toolbarRight, /data-encoding="auto"[^>]*>默认编码<\/button>/);
  assert.match(toolbarRight, /data-encoding="gbk"[^>]*>简体中文 \(GBK\)<\/button>/);
  assert.match(toolbarRight, /data-encoding="gb18030"[^>]*>简体中文 \(GB18030\)<\/button>/);
});

test('encoding picker menu is anchored below the trigger instead of using native select popup', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');

  assert.match(css, /\.encoding-picker\s*{[^}]*position: relative;/s);
  assert.match(css, /\.encoding-menu\s*{[^}]*position: absolute;[^}]*top: calc\(100% \+ 6px\);/s);
  assert.match(css, /\.encoding-menu\s*{[^}]*right: 0;/s);
});

test('runtime prefers the bundled CHM extractor', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /resourcesPath, 'native', nativeName, 'bin', 'extract_chmLib'/);
  assert.match(main, /resources', 'native', nativeName, 'bin', 'extract_chmLib'/);
});

test('runtime reuses extracted CHM cache before invoking the extractor', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /'extracted-books'/);
  assert.match(main, /update\(path\.resolve\(chmPath\)\)/);
  assert.match(main, /update\(String\(stats\.size\)\)/);
  assert.match(main, /update\(String\(Math\.trunc\(stats\.mtimeMs\)\)\)/);
  assert.match(main, /readExtractedBook\(nextRoot,/);
  assert.match(main, /extractBook\(chmPath, activeStagingRoot,/);
  assert.match(main, /previousRoot && !previousRootIsCached/);
  assert.match(main, /bookRoot && !bookRootIsCached/);
});

test('runtime avoids sending to a destroyed window from async callbacks', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /function getLiveMainWindow\(\): BrowserWindowType \| null/);
  assert.match(main, /mainWindow\.isDestroyed\(\)/);
  assert.match(main, /targetWindow\.webContents\.isDestroyed\(\)/);
  assert.match(main, /sendToMainWindow\('book:index-ready'/);
  assert.match(main, /browserWindow\.on\('closed'/);
  assert.match(main, /stopSearchIndexWorker\(\)/);
  assert.doesNotMatch(main, /mainWindow\?\.webContents\.send/);
});

test('closing the reader window returns to the library before closing the app', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');

  assert.match(main, /let currentView: 'library' \| 'reader' = 'library'/);
  assert.match(main, /browserWindow\.on\('close', \(event: \{ preventDefault: \(\) => void \}\) =>/);
  assert.match(main, /if \(isQuitting \|\| currentView !== 'reader'\) return/);
  assert.match(main, /event\.preventDefault\(\)/);
  assert.match(main, /currentView = 'library'/);
  assert.match(main, /sendToMainWindow\('library:show'\)/);
  assert.match(main, /ipcMain\.handle\('view:set'/);
  assert.match(main, /app\.on\('before-quit'/);
  assert.match(renderer, /window\.chmReader\.setView\(view\)/);
  assert.match(preload, /setView: \(view\) => ipcRenderer\.invoke\('view:set', view\)/);
});

test('macOS packaging vendors chmlib into the app bundle', () => {
  const packageScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'package-macos.sh'), 'utf-8');
  const vendorScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'vendor-chmlib-macos.sh'), 'utf-8');

  assert.match(packageScript, /vendor-chmlib-macos[.]sh/);
  assert.match(vendorScript, /install_name_tool -change/);
  assert.match(vendorScript, /codesign --force --sign -/);
  assert.match(vendorScript, /Contents\/Resources\/native\/darwin-\$arch/);
});
