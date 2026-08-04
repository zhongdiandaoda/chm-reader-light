const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const tsc = path.join(rootDir, 'node_modules', '.bin', 'tsc');

fs.rmSync(buildDir, { recursive: true, force: true });
execFileSync(tsc, ['--pretty', 'true'], {
  cwd: rootDir,
  stdio: 'inherit',
});

for (const relativePath of ['index.html', 'styles.css', 'assets']) {
  const source = path.join(rootDir, 'src', relativePath);
  const destination = path.join(buildDir, relativePath);
  if (!fs.existsSync(source)) continue;
  fs.cpSync(source, destination, { recursive: true });
}
