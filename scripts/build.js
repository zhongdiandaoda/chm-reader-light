const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const tsc = path.join(rootDir, 'node_modules', '.bin', 'tsc');
const nodeBuildDir = path.join(rootDir, '.build-node');
const browserBuildDir = path.join(rootDir, '.build-browser');

fs.rmSync(buildDir, { recursive: true, force: true });
fs.rmSync(nodeBuildDir, { recursive: true, force: true });
fs.rmSync(browserBuildDir, { recursive: true, force: true });

execFileSync(tsc, ['-p', 'tsconfig.node.json', '--pretty', 'true'], {
  cwd: rootDir,
  stdio: 'inherit',
});
execFileSync(tsc, ['-p', 'tsconfig.browser.json', '--pretty', 'true'], {
  cwd: rootDir,
  stdio: 'inherit',
});

fs.mkdirSync(buildDir, { recursive: true });
for (const file of fs.readdirSync(nodeBuildDir)) {
  fs.cpSync(path.join(nodeBuildDir, file), path.join(buildDir, file), { recursive: true });
}

let renderer = fs.readFileSync(path.join(browserBuildDir, 'renderer.js'), 'utf8');
renderer = renderer
  .replaceAll('./library.js', './library.browser.js')
  .replaceAll('./navigation.js', './navigation.browser.js');
fs.writeFileSync(path.join(buildDir, 'renderer.js'), renderer);
fs.copyFileSync(
  path.join(browserBuildDir, 'library.js'),
  path.join(buildDir, 'library.browser.js'),
);
fs.copyFileSync(
  path.join(browserBuildDir, 'navigation.js'),
  path.join(buildDir, 'navigation.browser.js'),
);

for (const relativePath of ['index.html', 'styles.css', 'assets']) {
  const source = path.join(rootDir, 'src', relativePath);
  const destination = path.join(buildDir, relativePath);
  if (!fs.existsSync(source)) continue;
  fs.cpSync(source, destination, { recursive: true });
}
